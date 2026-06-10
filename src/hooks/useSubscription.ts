import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { PlanType, UserProfile, UserUsage } from '../types';

const DAILY_LIMIT = 3;

export const useSubscription = () => {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [guestUsage, setGuestUsage] = React.useState<UserUsage>({ count: 0, lastReset: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = React.useState(true);

  // Sync Guest Usage with localStorage
  React.useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('guest_usage');
      const today = new Date().toISOString().split('T')[0];
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as UserUsage;
          if (parsed.lastReset !== today) {
            const fresh = { count: 0, lastReset: today };
            setGuestUsage(fresh);
            localStorage.setItem('guest_usage', JSON.stringify(fresh));
          } else {
            setGuestUsage(parsed);
          }
        } catch (e) {
          localStorage.removeItem('guest_usage');
        }
      } else {
        const initial = { count: 0, lastReset: today };
        setGuestUsage(initial);
        localStorage.setItem('guest_usage', JSON.stringify(initial));
      }
      setLoading(false);
    }
  }, [user]);

  // Sync User Profile from Firestore with real-time updates
  React.useEffect(() => {
    if (user) {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(userRef, async (docSnap) => {
        const today = new Date().toISOString().split('T')[0];
        
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          const normalizedData = {
            ...data,
            plan: (data.plan?.toLowerCase() || 'basic') as PlanType
          };

          // Handle Daily Reset
          if (normalizedData.usage?.lastReset !== today) {
            try {
              await updateDoc(userRef, { usage: { count: 0, lastReset: today } });
              // Snapshot will trigger again
            } catch (err) {
              console.error("Failed to reset daily usage:", err);
            }
          } else {
            setProfile(normalizedData);
            setLoading(false);
          }
        } else {
          // Create initial profile if it doesn't exist
          const initialProfile: any = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'User',
            photoURL: user.photoURL || '',
            plan: 'basic' as PlanType,
            usage: { count: 0, lastReset: today },
            createdAt: serverTimestamp()
          };
          try {
            await setDoc(userRef, initialProfile);
            // Snapshot will trigger again
          } catch (createErr) {
            handleFirestoreError(createErr, OperationType.CREATE, `users/${user.uid}`);
            setLoading(false);
          }
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setProfile(null);
      // Loading is handled by the user-less sync effect
    }
  }, [user]);

  const currentPlan: PlanType = (profile?.plan?.toLowerCase() as PlanType) || 'guest';
  const currentUsage = user ? (profile?.usage?.count || 0) : guestUsage.count;
  const isProOrVip = currentPlan === 'pro' || currentPlan === 'vip';
  const remaining = isProOrVip ? Infinity : DAILY_LIMIT - currentUsage;

  const trackUsage = async () => {
    if (isProOrVip) return true;
    if (remaining <= 0) return false;

    if (user) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userRef, { 'usage.count': increment(1) });
        setProfile(prev => prev ? { ...prev, usage: { ...prev.usage, count: prev.usage.count + 1 } } : null);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/usage.count`);
        return false;
      }
    } else {
      const newUsage = { ...guestUsage, count: guestUsage.count + 1 };
      setGuestUsage(newUsage);
      localStorage.setItem('guest_usage', JSON.stringify(newUsage));
    }
    return true;
  };

  const checkFeatureAccess = (featureId: string): { allowed: boolean; reason?: 'LOGIN' | 'QUOTA' | 'UPGRADE' } => {
    // Feature gating based on Plan
    const guestBasicFeatures = ['generator'];
    const proFeatures = [...guestBasicFeatures, 'hook', 'trends'];
    const vipFeatures = [...proFeatures, 'niche', 'threads', 'analiser'];

    if (currentPlan === 'vip') return { allowed: true };
    
    if (currentPlan === 'pro') {
      if (vipFeatures.includes(featureId) && !proFeatures.includes(featureId)) {
        return { allowed: false, reason: 'UPGRADE' };
      }
      return { allowed: true };
    }

    // Guest & Basic
    if (currentPlan === 'guest' || currentPlan === 'basic') {
      if (!guestBasicFeatures.includes(featureId)) {
        return { allowed: false, reason: 'UPGRADE' };
      }
      if (remaining <= 0) {
        return { allowed: false, reason: 'QUOTA' };
      }
      return { allowed: true };
    }

    return { allowed: false, reason: 'UPGRADE' };
  };

  return {
    profile,
    plan: currentPlan,
    remaining,
    loading,
    trackUsage,
    checkFeatureAccess,
    user
  };
};
