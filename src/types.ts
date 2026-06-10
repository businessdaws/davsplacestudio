export type PlanType = 'guest' | 'basic' | 'pro' | 'vip';

export interface UserUsage {
  count: number;
  lastReset: string; // ISO date string (YYYY-MM-DD)
}

export interface UserSubscription {
  plan: PlanType;
  usage: UserUsage;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  plan: PlanType;
  usage: UserUsage;
  createdAt: any;
}

export interface LicenseKey {
  id?: string;
  key: string;
  plan: 'pro' | 'vip';
  status: 'available' | 'used';
  usedBy?: string;
  usedAt?: any;
}

export interface ContentGenerationResult {
  headline: string;
  caption: string;
  hashtags: string[];
  imagePrompt: string;
  sources: string[];
}

export interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  socialAngles: string[];
}

export interface NicheResult {
  nicheName: string;
  targetAudience: string;
  pillars: { title: string; description: string }[];
  viralStrategy: string;
}

export interface Trend {
  topic: string;
  reason: string;
  category: string;
}

export type ContentType = 'post' | 'hook' | 'analysis' | 'niche' | 'thread';

export interface SavedContent {
  id?: string;
  userId: string;
  type: ContentType;
  title: string;
  data: any;
  createdAt: any;
}
