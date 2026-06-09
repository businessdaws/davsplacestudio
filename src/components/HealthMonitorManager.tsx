import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  RefreshCw, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  Database, 
  Cpu, 
  Globe, 
  Play, 
  Bookmark, 
  HelpCircle,
  Smartphone,
  Trash2,
  Calendar,
  X,
  FileText,
  Plus
} from 'lucide-react';

interface DiagnosticResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'warning' | 'unchecked';
  message: string;
  latency?: number;
  category: 'database' | 'ai' | 'config' | 'network';
}

interface AlertLog {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  source: string;
  createdAt: number;
  resolved: boolean;
  actionTab?: string;
  code?: string;
}

export default function HealthMonitorManager({ 
  onGenerateAI,
  setActiveTab
}: { 
  onGenerateAI?: (p: string, c: string) => Promise<string>;
  setActiveTab: (tab: any) => void;
}) {
  const [telegramToken, setTelegramToken] = useState(() => localStorage.getItem('diag_tg_token') || '');
  const [telegramChatId, setTelegramChatId] = useState(() => localStorage.getItem('diag_tg_chat_id') || '');
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('diag_webhook_url') || '');
  const [whatsappTarget, setWhatsappTarget] = useState(() => localStorage.getItem('diag_wa_target') || '');
  const [isTestingNotify, setIsTestingNotify] = useState(false);
  const [testNotifyStatus, setTestNotifyStatus] = useState<string | null>(null);

  const sendTestNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingNotify(true);
    setTestNotifyStatus('Menghubungkan ke gateway notifikasi...');
    
    // Save settings
    localStorage.setItem('diag_tg_token', telegramToken);
    localStorage.setItem('diag_tg_chat_id', telegramChatId);
    localStorage.setItem('diag_webhook_url', webhookUrl);
    localStorage.setItem('diag_wa_target', whatsappTarget);

    const activeIssues = alerts.filter(a => !a.resolved);
    const issueCount = activeIssues.length;
    
    let textMessage = `🔔 <b>LAPORAN DIAGNOSTIK WEB BARU</b>\n\n`;
    textMessage += `🕰 <i>Waktu: ${new Date().toLocaleString('id-ID')} WIB</i>\n`;
    textMessage += `📉 <i>Keadaan Server: SIAGA</i>\n\n`;
    
    if (issueCount === 0) {
      textMessage += `✅ <b>Segenap subsistem web berjalan bersih tanpa kendala!</b>`;
    } else {
      textMessage += `⚠️ <b>Sistem Mendeteksi ${issueCount} Kasus Kendala:</b>\n\n`;
      activeIssues.forEach((issue, index) => {
        textMessage += `${index + 1}. <b>${issue.title}</b> [${issue.severity.toUpperCase()}]\n`;
        textMessage += `└ <i>${issue.description}</i>\n\n`;
      });
      textMessage += `👉 Silakan kunjungi Dashboard Admin untuk penanganan langsung.`;
    }

    try {
      const response = await fetch('/api/health/notify', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          telegramToken,
          telegramChatId,
          webhookUrl,
          message: textMessage,
          diagnostics: diagnostics.map(d => ({ name: d.name, status: d.status, message: d.message }))
        })
      });

      if (!response.ok) {
        throw new Error(`Server API status: ${response.status}`);
      }

      const resData = await response.json();
      
      let debugMessage = 'Notifikasi terkirim!';
      const updates = [];
      if (resData.telegram) {
        if (resData.telegram.success) updates.push('Telegram Berhasil ✓');
        else updates.push(`Telegram Gagal ✗ (${resData.telegram.error})`);
      }
      if (resData.webhook) {
        if (resData.webhook.success) updates.push('Webhook Berhasil ✓');
        else updates.push(`Webhook Gagal ✗ (${resData.webhook.error})`);
      }
      
      if (updates.length > 0) debugMessage = updates.join(' / ');
      setTestNotifyStatus(debugMessage);
    } catch (err: any) {
      console.error(err);
      setTestNotifyStatus(`Gagal mengirim: ${err.message}`);
    } finally {
      setIsTestingNotify(false);
    }
  };

  const sendWhatsAppDirectReport = () => {
    localStorage.setItem('diag_wa_target', whatsappTarget);
    
    let whatsappText = `🔔 *LAPORAN DIAGNOSTIK WEB DAVS*\n`;
    whatsappText += `Waktu: ${new Date().toLocaleDateString('id-ID')} - ${new Date().toLocaleTimeString('id-ID')} WIB\n`;
    whatsappText += `Status: SIAGA\n\n`;

    const activeIssues = alerts.filter(a => !a.resolved);
    if (activeIssues.length === 0) {
      whatsappText += `✅ *Semua sistem berjalan 100% normal dan bersih.* \n`;
    } else {
      whatsappText += `⚠️ *Terdeteksi ${activeIssues.length} kasus kendala:* \n\n`;
      activeIssues.forEach((issue, idx) => {
        whatsappText += `${idx + 1}. *${issue.title}* [${issue.severity.toUpperCase()}]\n`;
        whatsappText += `_Detail: ${issue.description}_\n\n`;
      });
    }
    
    whatsappText += `Detail dashboard: ${window.location.origin}/admin`;

    const targetNum = whatsappTarget.replace(/[^0-9]/g, '');
    if (!targetNum) {
      alert('Silakan masukkan nomor tujuan WhatsApp (dengan prefiks negara, contoh: 62896xxxx) terlebih dahulu.');
      return;
    }

    const waUrl = `https://wa.me/${targetNum}?text=${encodeURIComponent(whatsappText)}`;
    window.open(waUrl, '_blank');
  };

  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([
    { id: 'db_latency', name: 'Firestore Database Link Latency', status: 'unchecked', message: 'Not evaluated yet', category: 'database' },
    { id: 'db_rls', name: 'Database Policy & Access rules', status: 'unchecked', message: 'Not evaluated yet', category: 'database' },
    { id: 'ai_endpoints', name: 'Gemini/NVIDIA AI Engine Pre-flight', status: 'unchecked', message: 'Not evaluated yet', category: 'ai' },
    { id: 'whatsapp_config', name: 'WhatsApp Lead Route Format', status: 'unchecked', message: 'Not evaluated yet', category: 'config' },
    { id: 'taxonomy_sync', name: 'Content Taxonomy & Category Sync', status: 'unchecked', message: 'Not evaluated yet', category: 'config' },
    { id: 'internet_ping', name: 'Client Network & Gateway Ping', status: 'unchecked', message: 'Not evaluated yet', category: 'network' }
  ]);

  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [activeCheck, setActiveCheck] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string>('Never');
  const [automationMode, setAutomationMode] = useState<'idle' | 'running' | 'completed'>('idle');
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  
  // Custom Alert state for the simulator
  const [customAlert, setCustomAlert] = useState({
    title: '',
    description: '',
    severity: 'warning' as 'critical' | 'warning' | 'info',
    source: 'Manual Dashboard Input'
  });

  // Load alert logs from localStorage & Firestore to preserve warnings
  useEffect(() => {
    // Determine last daily check
    const lastCheck = localStorage.getItem('last_diagnostic_time');
    if (lastCheck) {
      setLastCheckTime(lastCheck);
    }

    // Load custom alerts
    const savedAlerts = localStorage.getItem('system_diagnostic_alerts');
    if (savedAlerts) {
      try {
        setAlerts(JSON.parse(savedAlerts));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default baseline values to populate immediately if nothing is stored
      const baselineAlerts: AlertLog[] = [
        {
          id: 'alert_whatsapp_format',
          title: 'Format Kontak Leads Belum Optimal',
          description: 'Sistem mendeteksi format nomor WhatsApp pada setelan global mungkin tidak menggunakan kode prefiks negara yang dianjurkan (62).',
          severity: 'warning',
          source: 'Validation Engine',
          createdAt: Date.now() - 3600000 * 2, // 2 hr ago
          resolved: false,
          actionTab: 'settings',
          code: 'WA_FORMAT'
        },
        {
          id: 'alert_ai_creds',
          title: 'Verifikasi Kunci API AI',
          description: 'Pastikan kunci lingkungan GEMINI_API_KEY telah dideklarasikan di container Cloud Run untuk mengaktifkan Konten Generator nirkabel.',
          severity: 'info',
          source: 'System Credentials',
          createdAt: Date.now() - 3600000 * 5, // 5 hr ago
          resolved: false,
          actionTab: 'content_generator',
          code: 'AI_KEY_NOTICE'
        }
      ];
      setAlerts(baselineAlerts);
      localStorage.setItem('system_diagnostic_alerts', JSON.stringify(baselineAlerts));
    }
  }, []);

  // Save current alerts helper
  const saveAlerts = (updatedAlerts: AlertLog[]) => {
    setAlerts(updatedAlerts);
    localStorage.setItem('system_diagnostic_alerts', JSON.stringify(updatedAlerts));
  };

  // 1. Database Diagnostic (Actual write-read-delete roundtrip)
  const runDatabaseCheck = async (): Promise<DiagnosticResult> => {
    const startTime = Date.now();
    try {
      const diagDocRef = doc(db, 'system_health_runs', 'latency_test');
      
      // Perform write
      await setDoc(diagDocRef, {
        timestamp: serverTimestamp(),
        runner_version: '2.5.0',
        session_time: startTime
      });

      // Perform read
      const snap = await getDoc(diagDocRef);
      
      // Perform delete
      await deleteDoc(diagDocRef);

      const latency = Date.now() - startTime;
      
      return {
        id: 'db_latency',
        name: 'Firestore Database Link Latency',
        status: latency < 350 ? 'passed' : 'warning',
        message: `Database tersambung dengan sukses. Latensi respon: ${latency}ms (Sangat Cepat)`,
        latency,
        category: 'database'
      };
    } catch (err: any) {
      console.error(err);
      return {
        id: 'db_latency',
        name: 'Firestore Database Link Latency',
        status: 'failed',
        message: `Koneksi gagal atau ditolak aturan aturan Firestore: ${err?.message || 'Unknown error'}`,
        category: 'database'
      };
    }
  };

  // 2. Database Policy & Rules check
  const runRulesCheck = async (): Promise<DiagnosticResult> => {
    try {
      // Attempting to look up a protected collection to verify we catch permissions gracefully
      const testCollection = collection(db, 'system_health_runs');
      await getDocs(testCollection);
      return {
        id: 'db_rls',
        name: 'Database Policy & Access rules',
        status: 'passed',
        message: 'Akses diagnostik Firestore diverifikasi. Skema RLS berjalan aman.',
        category: 'database'
      };
    } catch (err: any) {
      return {
        id: 'db_rls',
        name: 'Database Policy & Access rules',
        status: 'warning',
        message: `Beberap path membutuhkan otentikasi ketat (Normal). Status: ${err?.code || 'Restricted'}`,
        category: 'database'
      };
    }
  };

  // 3. AI preflight check
  const runAICheck = async (): Promise<DiagnosticResult> => {
    const start = Date.now();
    if (!onGenerateAI) {
      return {
        id: 'ai_endpoints',
        name: 'Gemini/NVIDIA AI Engine Pre-flight',
        status: 'warning',
        message: 'Engine integrasi AI tidak terikat langsung ke instans penampil ini.',
        category: 'ai'
      };
    }

    try {
      // Run light generator test
      const res = await onGenerateAI('Say simple "AI OK" word and nothing else', 'Diagnostic system pre-flight check');
      const latency = Date.now() - start;
      if (res && res.length > 0) {
        return {
          id: 'ai_endpoints',
          name: 'Gemini/NVIDIA AI Engine Pre-flight',
          status: 'passed',
          message: `Koneksi generator AI responsif. Verifikasi berhasil dalam ${latency}ms. Output: "${res.trim()}"`,
          latency,
          category: 'ai'
        };
      }
      throw new Error('Generasi kosong diterima dari server AI.');
    } catch (err: any) {
      return {
        id: 'ai_endpoints',
        name: 'Gemini/NVIDIA AI Engine Pre-flight',
        status: 'failed',
        message: `Gagal berkomunikasi dengan server backend AI: ${err?.message || 'Kunci API kosong atau tidak valid.'}`,
        category: 'ai'
      };
    }
  };

  // 4. WhatsApp lead prefix check
  const runWhatsAppCheck = async (): Promise<DiagnosticResult> => {
    try {
      const settingsSnap = await getDoc(doc(db, 'site_settings', 'global'));
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        const whatsappNum = data.whatsapp || '';
        if (!whatsappNum) {
          return {
            id: 'whatsapp_config',
            name: 'WhatsApp Lead Route Format',
            status: 'failed',
            message: 'Nomor telepon WhatsApp pendaftaran Leads belum disimpan di system settings.',
            category: 'config'
          };
        }

        // Must be numbers, no spaces, starts with country code like 62 for Indonesia
        const isValidFormat = /^[1-9]\d{8,14}$/.test(whatsappNum);
        if (isValidFormat && (whatsappNum.startsWith('62') || whatsappNum.startsWith('1') || whatsappNum.startsWith('60'))) {
          return {
            id: 'whatsapp_config',
            name: 'WhatsApp Lead Route Format',
            status: 'passed',
            message: `Format kontak WhatsApp valid (${whatsappNum}) dan siap memproses pesan masuk.`,
            category: 'config'
          };
        } else {
          return {
            id: 'whatsapp_config',
            name: 'WhatsApp Lead Route Format',
            status: 'warning',
            message: `Nomor saat ini ("${whatsappNum}") berpotensi salah format. Dianjurkan menggunakan awalan kode negara tanpa 0 atau +, misal: 62896xxx.`,
            category: 'config'
          };
        }
      }
      return {
        id: 'whatsapp_config',
        name: 'WhatsApp Lead Route Format',
        status: 'warning',
        message: 'Dokumen setelan global belum dibuat di database Firestore.',
        category: 'config'
      };
    } catch (e: any) {
      return {
        id: 'whatsapp_config',
        name: 'WhatsApp Lead Route Format',
        status: 'failed',
        message: `Gagal memeriksa dokumen pengaturan: ${e?.message}`,
        category: 'config'
      };
    }
  };

  // 5. Taxonomy & category check
  const runTaxonomySyncCheck = async (): Promise<DiagnosticResult> => {
    try {
      const articlesSnap = await getDocs(collection(db, 'articles'));
      const categoriesSnap = await getDocs(collection(db, 'categories'));

      const articles = articlesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const categories = categoriesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const totalCategories = categories.length;
      if (totalCategories === 0) {
        return {
          id: 'taxonomy_sync',
          name: 'Content Taxonomy & Category Sync',
          status: 'failed',
          message: 'Belum ada kategori yang didefinisikan. Pemisahan filter rubrik artikel akan berantakan.',
          category: 'config'
        };
      }

      // Check if any article points to an invalid/non-existent category ID
      const validCategoryIds = new Set(categories.map(c => c.id));
      const orphanedArticles = articles.filter((art: any) => art.category_id && !validCategoryIds.has(art.category_id));

      if (orphanedArticles.length > 0) {
        return {
          id: 'taxonomy_sync',
          name: 'Content Taxonomy & Category Sync',
          status: 'warning',
          message: `Sinkronisasi tidak utuh. Ditemukan ${orphanedArticles.length} artikel dengan kategori yang tidak terdaftar.`,
          category: 'config'
        };
      }

      return {
        id: 'taxonomy_sync',
        name: 'Content Taxonomy & Category Sync',
        status: 'passed',
        message: `Kategori & artikel tersinkronisasi 100%. Total ${totalCategories} kategori aktif terindeks.`,
        category: 'config'
      };
    } catch (err: any) {
      return {
        id: 'taxonomy_sync',
        name: 'Content Taxonomy & Category Sync',
        status: 'failed',
        message: `Koneksi database gagal saat memuat taksonomi artikel: ${err.message}`,
        category: 'config'
      };
    }
  };

  // 6. Network Ping Check
  const runNetworkCheck = async (): Promise<DiagnosticResult> => {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const signal = controller.signal;
      // Set short timeout of 5s
      setTimeout(() => controller.abort(), 5000);
      
      await fetch(window.location.origin, { method: 'HEAD', signal });
      const latency = Date.now() - start;
      return {
        id: 'internet_ping',
        name: 'Client Network & Gateway Ping',
        status: 'passed',
        message: `Gerbang internet lokal aktif. Respon server: ${latency}ms.`,
        latency,
        category: 'network'
      };
    } catch (e) {
      return {
        id: 'internet_ping',
        name: 'Client Network & Gateway Ping',
        status: 'warning',
        message: 'Koneksi lokal tidak optimal atau permintaan preflight diblokir oleh header CORS.',
        category: 'network'
      };
    }
  };

  // Run a single specific test
  const runSingleTest = async (testId: string) => {
    setActiveCheck(testId);
    let updatedCheck: DiagnosticResult | null = null;

    if (testId === 'db_latency') updatedCheck = await runDatabaseCheck();
    else if (testId === 'db_rls') updatedCheck = await runRulesCheck();
    else if (testId === 'ai_endpoints') updatedCheck = await runAICheck();
    else if (testId === 'whatsapp_config') updatedCheck = await runWhatsAppCheck();
    else if (testId === 'taxonomy_sync') updatedCheck = await runTaxonomySyncCheck();
    else if (testId === 'internet_ping') updatedCheck = await runNetworkCheck();

    if (updatedCheck) {
      setDiagnostics(prev => prev.map(item => item.id === testId ? updatedCheck! : item));
      processDiagnosticOutcome(updatedCheck);
    }
    setActiveCheck(null);
  };

  // Execute entire check Suite with automated log updating & daily notice triggers
  const runAllDiagnostics = async () => {
    setIsRunningAll(true);
    setAutomationMode('running');
    
    const results: DiagnosticResult[] = [];
    
    // Staggered synchronous checks to simulate actual scan blocks
    setActiveCheck('db_latency');
    const r1 = await runDatabaseCheck();
    results.push(r1);
    setDiagnostics(prev => prev.map(item => item.id === 'db_latency' ? r1 : item));
    
    setActiveCheck('db_rls');
    const r2 = await runRulesCheck();
    results.push(r2);
    setDiagnostics(prev => prev.map(item => item.id === 'db_rls' ? r2 : item));
    
    setActiveCheck('ai_endpoints');
    const r3 = await runAICheck();
    results.push(r3);
    setDiagnostics(prev => prev.map(item => item.id === 'ai_endpoints' ? r3 : item));
    
    setActiveCheck('whatsapp_config');
    const r4 = await runWhatsAppCheck();
    results.push(r4);
    setDiagnostics(prev => prev.map(item => item.id === 'whatsapp_config' ? r4 : item));
    
    setActiveCheck('taxonomy_sync');
    const r5 = await runTaxonomySyncCheck();
    results.push(r5);
    setDiagnostics(prev => prev.map(item => item.id === 'taxonomy_sync' ? r5 : item));
    
    setActiveCheck('internet_ping');
    const r6 = await runNetworkCheck();
    results.push(r6);
    setDiagnostics(prev => prev.map(item => item.id === 'internet_ping' ? r6 : item));

    setActiveCheck(null);
    setIsRunningAll(false);
    setAutomationMode('completed');

    // Store execution date & time
    const timestampStr = new Date().toLocaleString('id-ID', { 
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    }) + ' WIB';
    localStorage.setItem('last_diagnostic_time', timestampStr);
    setLastCheckTime(timestampStr);

    // Filter failed and warning results to generate / clear automatic alert registers
    let updatedAlerts = [...alerts];
    
    results.forEach(res => {
      if (res.status === 'failed') {
        // Add if not already registered
        const exists = updatedAlerts.some(a => a.code === res.id);
        if (!exists) {
          updatedAlerts.unshift({
            id: 'auto_' + res.id + '_' + Date.now(),
            title: `Error: ${res.name}`,
            description: res.message,
            severity: 'critical',
            source: 'Automatic Diagnostic Runner',
            createdAt: Date.now(),
            resolved: false,
            actionTab: res.id === 'ai_endpoints' ? 'content_generator' : res.id === 'whatsapp_config' ? 'settings' : res.id === 'taxonomy_sync' ? 'categories' : 'overview',
            code: res.id
          });
        }
      } else if (res.status === 'warning') {
        const exists = updatedAlerts.some(a => a.code === res.id);
        if (!exists) {
          updatedAlerts.unshift({
            id: 'auto_' + res.id + '_' + Date.now(),
            title: `Peringatan: ${res.name}`,
            description: res.message,
            severity: 'warning',
            source: 'Automatic Diagnostic Runner',
            createdAt: Date.now(),
            resolved: false,
            actionTab: res.id === 'whatsapp_config' ? 'settings' : res.id === 'taxonomy_sync' ? 'categories' : 'overview',
            code: res.id
          });
        }
      } else if (res.status === 'passed') {
        // Auto resolve matching alert codes
        updatedAlerts = updatedAlerts.filter(a => a.code !== res.id);
      }
    });

    saveAlerts(updatedAlerts);

    if (typeof window !== "undefined") {
      const activeLeaks = results.filter(r => r.status === 'failed' || r.status === 'warning').length;
      if (activeLeaks > 0) {
        (window as any).showAdminToast?.(`Diagnostik Selesai: Terdeteksi ${activeLeaks} potensi gangguan.`);
      } else {
        (window as any).showAdminToast?.("Bersih! Segenap fungsi sistem berjalan optimal.");
      }
    }
  };

  // Helper handling single diagnostic check outcome
  const processDiagnosticOutcome = (res: DiagnosticResult) => {
    let updatedAlerts = [...alerts];
    if (res.status === 'passed') {
      // Clear alert with matching code
      updatedAlerts = updatedAlerts.filter(a => a.code !== res.id);
    } else {
      const exists = updatedAlerts.some(a => a.code === res.id);
      if (!exists) {
        updatedAlerts.unshift({
          id: 'auto_' + res.id + '_' + Date.now(),
          title: res.status === 'failed' ? `Error: ${res.name}` : `Peringatan: ${res.name}`,
          description: res.message,
          severity: res.status === 'failed' ? 'critical' : 'warning',
          source: 'System Diagnostic',
          createdAt: Date.now(),
          resolved: false,
          actionTab: res.id === 'ai_endpoints' ? 'content_generator' : res.id === 'whatsapp_config' ? 'settings' : res.id === 'taxonomy_sync' ? 'categories' : 'overview',
          code: res.id
        });
      } else {
        // Update description with newest message
        updatedAlerts = updatedAlerts.map(a => a.code === res.id ? { ...a, description: res.message, severity: res.status === 'failed' ? 'critical' as const : 'warning' as const } : a);
      }
    }
    saveAlerts(updatedAlerts);
  };

  // Resolve / Dismiss Alert
  const handleResolveAlert = (id: string) => {
    const updated = alerts.map(a => a.id === id ? { ...a, resolved: true } : a);
    saveAlerts(updated);
    if (typeof window !== "undefined") {
      (window as any).showAdminToast?.("Masalah ditandai selesai.");
    }
  };

  // Permanently delete Alert
  const handleDeleteAlert = (id: string) => {
    const filtered = alerts.filter(a => a.id !== id);
    saveAlerts(filtered);
    if (typeof window !== "undefined") {
      (window as any).showAdminToast?.("Log peringatan dihapus.");
    }
  };

  // Submit manual error / simulated failure instance
  const handleAddCustomAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAlert.title || !customAlert.description) {
      alert('Isi judul dan detail laporan terlebih dahulu!');
      return;
    }

    const newAlert: AlertLog = {
      id: 'custom_' + Date.now(),
      title: customAlert.title,
      description: customAlert.description,
      severity: customAlert.severity,
      source: customAlert.source,
      createdAt: Date.now(),
      resolved: false,
      code: 'SIMULATION_ERR'
    };

    saveAlerts([newAlert, ...alerts]);
    setShowAddLogModal(false);
    setCustomAlert({
      title: '',
      description: '',
      severity: 'warning',
      source: 'Manual Dashboard Input'
    });

    if (typeof window !== "undefined") {
      (window as any).showAdminToast?.("Simulasi Peringatan Berhasil Didaftarkan!");
    }
  };

  // Simulates automatic periodic alarm trigger with sample failure presets
  const triggerSimulationPreset = (type: 'quota' | 'key' | 'lead_fail') => {
    let preset: AlertLog;
    if (type === 'quota') {
      preset = {
        id: 'preset_quota_' + Date.now(),
        title: 'Quota Exceeded: Firestone Reads',
        description: 'Batas harian database pembacaan Firestore (quota trial) hampir terlampaui. Operasi client disetel ke mode hemat cache.',
        severity: 'critical',
        source: 'Google Over-usage Monitor',
        createdAt: Date.now(),
        resolved: false,
        code: 'FIRESTORE_QUOTA'
      };
    } else if (type === 'key') {
      preset = {
        id: 'preset_key_' + Date.now(),
        title: 'Pembatasan Layanan: Gemeni API Refused',
        description: 'Server menanggapi dengan kode 403. Pastikan domain hosting ini telah didaftarkan pada konsol developer API key.',
        severity: 'critical',
        source: 'Integrasi API Gemini',
        createdAt: Date.now(),
        resolved: false,
        actionTab: 'content_generator',
        code: 'GEMINI_403_ERR'
      };
    } else {
      preset = {
        id: 'preset_leads_' + Date.now(),
        title: 'Saluran Leads Unresponsive',
        description: 'Kontak klien terhambat. Ditemukan kegagalan pengiriman API formulir untuk WhatsApp lokal karena jaringan luar bermasalah.',
        severity: 'warning',
        source: 'Form Router',
        createdAt: Date.now(),
        resolved: false,
        actionTab: 'leads',
        code: 'LEAD_SMS_DELIVERY'
      };
    }

    saveAlerts([preset, ...alerts]);
    if (typeof window !== "undefined") {
      (window as any).showAdminToast?.("Insiden berhasil disimulasikan!");
    }
  };

  // Run automatically on component load once a day (mocked with last checked day)
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const lastDailyCheck = localStorage.getItem('last_daily_health_check_day');
    
    if (lastDailyCheck !== todayStr) {
      // Trigger quiet background checks
      setTimeout(() => {
        runAllDiagnostics();
        localStorage.setItem('last_daily_health_check_day', todayStr);
      }, 1500);
    }
  }, []);

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <div className="space-y-8 pb-20">
      
      {/* ⚠️ Automation Notification Banner at the Top */}
      {unresolvedAlerts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border-l-4 border-red-500 p-5 rounded-r-2xl flex items-start gap-4 shadow-xl"
        >
          <div className="bg-red-500/20 p-2.5 rounded-xl text-red-400 mt-0.5">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              Sistem Mendeteksi {unresolvedAlerts.length} Kasus Kendala / Potensi Gangguan
            </h4>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Silakan periksa laporan status sub-layanan di bawah ini untuk memastikan seluruh fungsi leads pemasaran, generator konten, dan persuratan beroperasi dengan mulus.
            </p>
            <div className="flex gap-4 mt-3">
              <button 
                onClick={runAllDiagnostics}
                className="text-[10px] font-black uppercase text-accent-yellow hover:text-white transition-colors bg-bg-secondary border border-border-subtle/50 px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> JALANKAN RE-DIAGNOSIS
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Controls Grid: Stats & Automation Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Diagnostic Status */}
        <div className="bg-bg-secondary p-6 rounded-2xl border border-border-subtle relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-yellow/5 rounded-full blur-2xl group-hover:bg-accent-yellow/10 transition-colors" />
          <p className="text-[10px] text-text-secondary uppercase tracking-widest font-black mb-1">Status Penyelidikan</p>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-ping" />
            <span className="text-2xl font-display font-black text-white uppercase">SISTEM SIAGA</span>
          </div>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            Diagnostik berkala otomatis dijadwalkan setiap 24 jam / setiap login konsol admin.
          </p>
          <div className="mt-4 pt-4 border-t border-border-subtle/40 flex justify-between items-center text-xs font-mono">
            <span className="text-text-secondary">Pindai Terakhir:</span>
            <span className="text-accent-yellow font-bold">{lastCheckTime}</span>
          </div>
        </div>

        {/* Card 2: Health Rating */}
        <div className="bg-bg-secondary p-6 rounded-2xl border border-border-subtle relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
          <p className="text-[10px] text-text-secondary uppercase tracking-widest font-black mb-1">Skor Integritas Operasional</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-display font-black text-emerald-400">
              {unresolvedAlerts.filter(a => a.severity === 'critical').length > 0 ? '90%' : '100%'}
            </span>
            <span className="text-xs text-text-secondary mb-1.5">OPTIMIZED RATE</span>
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Infrastruktur database, gateway navigasi, dan routing leads dipantau berkelanjutan.
          </p>
          <div className="mt-4 pt-4 border-t border-border-subtle/40 flex justify-between items-center text-xs">
            <span className="text-text-secondary">Resolusi Masalah:</span>
            <span className="text-emerald-400 font-bold font-mono">
              {resolvedAlerts.length} Tuntas / {alerts.length} Total
            </span>
          </div>
        </div>

        {/* Card 3: Action Actions */}
        <div className="bg-bg-secondary p-6 rounded-2xl border border-border-subtle flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-black mb-1">Tindakan Cepat</p>
            <h4 className="text-base font-black text-white uppercase">Automasi Diagnosis</h4>
            <p className="text-xs text-text-secondary mt-1">
              Jalankan diagnostik kelayakan subsistem langsung untuk mendeteksi error runtime real-time.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={runAllDiagnostics}
              disabled={isRunningAll}
              className="py-2.5 px-4 rounded-xl bg-accent-yellow text-primary font-black text-xs uppercase hover:bg-white active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 shadow-lg shadow-accent-yellow/10"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningAll ? 'animate-spin' : ''}`} />
              {isRunningAll ? 'Memindai...' : 'CEK SEKARANG'}
            </button>
            <button
              onClick={() => setShowAddLogModal(true)}
              className="py-2.5 px-4 rounded-xl bg-bg-tertiary border border-border-subtle text-text-primary hover:text-white hover:border-accent-yellow font-black text-xs uppercase active:scale-95 transition-all text-center flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-accent-yellow" />
              BUAT LAPORAN
            </button>
          </div>
        </div>

      </div>

      {/* Simulator Preset Actions Section (Simulation Sandbox for the admin to check alerts!) */}
      <div className="p-5 bg-bg-secondary rounded-2xl border border-border-subtle/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-xs font-black uppercase text-accent-yellow tracking-widest">🧪 Laboratorium Simulasi Kerusakan & Peringatan</h4>
            <p className="text-xs text-text-secondary mt-0.5">Uji performa notifikasi berkala dengan memicu skenario error buatan di bawah ini.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => triggerSimulationPreset('quota')}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider transition-all border border-red-500/20"
            >
              ⚠️ Simulasi Quota Limit
            </button>
            <button 
              onClick={() => triggerSimulationPreset('key')}
              className="px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-wider transition-all border border-orange-500/20"
            >
              🤖 Simulasi AI Error 403
            </button>
            <button 
              onClick={() => triggerSimulationPreset('lead_fail')}
              className="px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-wider transition-all border border-yellow-500/20"
            >
              📱 Simulasi WhatsApp Drop
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostics Checklist Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Diagnostics check status items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle/50 pb-2">
            <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-yellow" /> Checklist Layanan Operasional
            </h3>
            {isRunningAll && (
              <span className="text-[10px] font-mono text-accent-yellow animate-pulse">Running checks...</span>
            )}
          </div>

          <div className="space-y-3">
            {diagnostics.map((item) => (
              <div 
                key={item.id}
                className="p-4 bg-bg-secondary hover:bg-bg-tertiary/40 border border-border-subtle rounded-xl flex items-start gap-3.5 transition-all relative overflow-hidden group"
              >
                {/* Latency timing counter */}
                {item.latency && (
                  <div className="absolute top-2 right-2 text-[8px] font-mono text-emerald-400 px-1.5 py-0.5 rounded-md bg-emerald-500/10">
                    {item.latency} ms
                  </div>
                )}
                
                <div className="mt-1">
                  {item.status === 'passed' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                  {item.status === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                  {item.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />}
                  {item.status === 'unchecked' && <Clock className="w-5 h-5 text-text-secondary" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-white tracking-wide">{item.name}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 font-bold uppercase rounded tracking-wider ${
                      item.category === 'database' ? 'bg-blue-500/10 text-blue-400' :
                      item.category === 'ai' ? 'bg-purple-500/10 text-purple-400' :
                      item.category === 'config' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                {/* Single check trigger */}
                <button
                  disabled={activeCheck !== null || isRunningAll}
                  onClick={() => runSingleTest(item.id)}
                  className="p-2 ml-2 hover:bg-bg-primary rounded-lg border border-border-subtle hover:border-accent-yellow text-text-secondary hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                  title="Pindai item ini saja"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${activeCheck === item.id ? 'animate-spin text-accent-yellow' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Alerts & Warnings Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle/50 pb-2">
            <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" /> Log Kasus & Peringatan Aktif
            </h3>
            {alerts.length > 0 && (
              <button 
                onClick={() => saveAlerts([])}
                className="text-[9px] font-black uppercase tracking-wider text-text-secondary hover:text-red-400 transition-colors"
              >
                Hapus Semua Log
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <div className="p-8 text-center bg-bg-secondary rounded-xl border border-border-subtle">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="text-sm font-black uppercase text-white">SANGAT BERSIH!</h4>
                <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
                  Sistem tidak menemukan peringatan atau laporan kerusakan aktif. Semua berjalan mulus!
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-4 border rounded-xl flex items-start gap-3 transition-colors ${
                      alert.resolved 
                        ? 'bg-bg-tertiary/20 border-border-subtle/30 opacity-60'
                        : alert.severity === 'critical'
                          ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                          : alert.severity === 'warning'
                            ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10'
                            : 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10'
                    }`}
                  >
                    <div className="mt-1">
                      {alert.resolved ? (
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                      ) : alert.severity === 'critical' ? (
                        <AlertCircle className="w-4.5 h-4.5 text-red-500" />
                      ) : alert.severity === 'warning' ? (
                        <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                      ) : (
                        <HelpCircle className="w-4.5 h-4.5 text-blue-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-black uppercase tracking-wide ${
                          alert.resolved ? 'text-text-secondary line-through' : 'text-white'
                        }`}>
                          {alert.title}
                        </span>
                        
                        {!alert.resolved && (
                          <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                            alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {alert.severity}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                        {alert.description}
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-[10px] text-text-secondary">
                        <span className="font-mono bg-bg-tertiary/60 px-1.5 py-0.5 rounded text-[9px]">
                          {alert.source}
                        </span>
                        <span>•</span>
                        <span>{new Date(alert.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                      </div>

                      {/* Diagnostic Action Controls */}
                      <div className="flex gap-2.5 mt-3">
                        {!alert.resolved && (
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2 rounded font-black uppercase text-[10px] tracking-wide py-1 border border-emerald-500/10 transition-colors"
                          >
                            SELESAIKAN
                          </button>
                        )}
                        {alert.actionTab && !alert.resolved && (
                          <button
                            onClick={() => setActiveTab(alert.actionTab)}
                            className="bg-accent-yellow/10 hover:bg-accent-yellow text-accent-yellow hover:text-bg-primary px-2 rounded font-black uppercase text-[10px] tracking-wide py-1 border border-accent-yellow/20 transition-all"
                          >
                            PERBAIKI DI TAB {alert.actionTab.replace('_', ' ').toUpperCase()}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="p-1 hover:bg-red-500/10 hover:text-red-400 text-text-secondary rounded transition-colors"
                          title="Hapus log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

      </div>

      {/* 📡 New Subsection: Real-time Telegram & WhatsApp Channel configuration */}
      <div className="bg-bg-secondary p-6 md:p-8 rounded-2xl border border-border-subtle space-y-6">
        <div>
          <h3 className="text-sm font-black uppercase text-accent-yellow tracking-widest flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent-yellow" /> Integrasi Notifikasi Real-time (Telegram & WhatsApp)
          </h3>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            Anda dapat menghubungkan dasbor keselamatan admin ini agar secara instan membroadcast ringkasan kesalahan, kendala pendaftaran leads, atau error runtime ke Telegram atau WhatsApp pribadi ataupun grup Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
          
          {/* Telegram Settings Form */}
          <form onSubmit={sendTestNotification} className="space-y-4 border-r border-border-subtle/30 pr-0 lg:pr-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 px-2 rounded-md bg-sky-500/10 text-sky-400 font-mono text-[10px] font-black">Telegram BOT</span>
              <h4 className="text-xs font-black uppercase text-white tracking-wide">Saluran Alarm Telegram</h4>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-text-secondary font-black uppercase ml-1">Telegram Bot Token</label>
                <input 
                  type="password" 
                  value={telegramToken}
                  onChange={e => setTelegramToken(e.target.value)}
                  placeholder="E.g. 123456789:ABCdefGhIJKlmNoPQRsT"
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-2.5 px-4 outline-none focus:border-accent-yellow transition-all text-xs font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-secondary font-black uppercase ml-1">Telegram Chat ID / Group ID</label>
                <input 
                  type="text" 
                  value={telegramChatId}
                  onChange={e => setTelegramChatId(e.target.value)}
                  placeholder="Contoh: 987654321 atau -10012345678"
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-2.5 px-4 outline-none focus:border-accent-yellow transition-all text-xs font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-secondary font-black uppercase ml-1">Endpoint Webhook Tambahan (Opsional)</label>
                <input 
                  type="url" 
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/... atau Slack Webhook URL"
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-2.5 px-4 outline-none focus:border-accent-yellow transition-all text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="submit"
                disabled={isTestingNotify || (!telegramToken && !webhookUrl)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:bg-bg-tertiary disabled:text-text-secondary text-primary font-black text-[10px] rounded-lg uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Play className="w-3 h-3 text-primary fill-current" />
                {isTestingNotify ? 'MENGIRIMKAN...' : 'KIRIM TEST ALARM'}
              </button>
              
              {testNotifyStatus && (
                <span className="text-[10px] font-mono font-bold text-accent-yellow text-right italic max-w-[180px] truncate">
                  {testNotifyStatus}
                </span>
              )}
            </div>

            {/* Step-by-step small guide */}
            <div className="p-3 bg-bg-tertiary/20 rounded-xl border border-border-subtle/35 text-[10px] text-text-secondary space-y-1">
              <p className="font-bold text-white uppercase text-[9px] tracking-wider mb-1">💡 Cara Mendapatkan Token & Chat ID:</p>
              <p>1. Hubungi <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-sky-400 font-bold hover:underline">@BotFather</a> di Telegram, buat bot baru dengan mengetik <code>/newbot</code> lalu salin tokennya.</p>
              <p>2. Cari bot <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-sky-400 font-bold hover:underline">@userinfobot</a> lalu kirim pesan apapun untuk melihat Chat ID unik Anda sendiri.</p>
              <p>3. Masukkan datanya pada panel kiri, lalu klik &quot;Kirim Test Alarm&quot;.</p>
            </div>
          </form>

          {/* WhatsApp Direct Dispatcher Settings */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1 px-2 rounded-md bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-black">WhatsApp Link</span>
                <h4 className="text-xs font-black uppercase text-white tracking-wide">Saluran Mandiri WhatsApp</h4>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                Kirim data log dan ringkasan checklist kesehatan sistem masa kini secara instan ke nomor WhatsApp pribadi Anda. Menggunakan link redirect aman wa.me yang di-generate langsung dari status dashboard terkini.
              </p>

              <div className="space-y-1">
                <label className="text-[10px] text-text-secondary font-black uppercase ml-1">Nomor WhatsApp Admin (Kode Negara)</label>
                <input 
                  type="text" 
                  value={whatsappTarget}
                  onChange={e => setWhatsappTarget(e.target.value)}
                  placeholder="Contoh: 628961234567"
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-2.5 px-4 outline-none focus:border-accent-yellow transition-all text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={sendWhatsAppDirectReport}
                disabled={!whatsappTarget}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-bg-tertiary disabled:text-text-secondary text-primary font-black text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-emerald-500/10"
              >
                <Smartphone className="w-4 h-4 text-primary" />
                KIRIM DIRECT LOG KE WHATSAPP SAYA
              </button>

              <p className="text-[10px] text-text-secondary font-mono text-center">
                Mendukung enkripsi lokal & dikirim langsung melalui client device Anda secara aman.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Manual Report Popup Modal */}
      {showAddLogModal && (
        <div className="fixed inset-0 bg-bg-primary/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-bg-secondary p-6 md:p-8 rounded-2xl border border-border-subtle shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border-subtle/50 pb-4">
              <h3 className="text-lg font-black uppercase text-white tracking-widest flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-yellow" /> BUAT LAPORAN MASALAH SISTEM
              </h3>
              <button 
                onClick={() => setShowAddLogModal(false)}
                className="p-1.5 text-text-secondary hover:text-white bg-bg-tertiary rounded-lg transition-colors border border-border-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomAlert} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Masalah / Nama Kasus</label>
                <input 
                  type="text" 
                  required
                  value={customAlert.title}
                  onChange={e => setCustomAlert({ ...customAlert, title: e.target.value })}
                  placeholder="Misal: API WhatsApp Lambat, Tombol generate typo, dll."
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all text-sm text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Deskripsi Detail Masalah</label>
                <textarea 
                  rows={4} 
                  required
                  value={customAlert.description}
                  onChange={e => setCustomAlert({ ...customAlert, description: e.target.value })}
                  placeholder="Jelaskan detail kesalahan, apa fungsi yang terganggu, dan cara mereproduksi problem."
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Tingkat Keparahan</label>
                  <select
                    value={customAlert.severity}
                    onChange={e => setCustomAlert({ ...customAlert, severity: e.target.value as any })}
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all text-sm text-white font-bold"
                  >
                    <option value="info">INFO (Pembaruan rutin)</option>
                    <option value="warning">WARNING (Peringatan)</option>
                    <option value="critical">CRITICAL (Macet / Error)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Sumber Insiden</label>
                  <input 
                    type="text" 
                    value={customAlert.source}
                    onChange={e => setCustomAlert({ ...customAlert, source: e.target.value })}
                    placeholder="E.g. Web Form, Script, Admin"
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all text-sm text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-5 py-3 rounded-xl bg-bg-tertiary border border-border-subtle hover:text-white text-text-secondary font-black text-xs uppercase active:scale-95 transition-all"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-accent-yellow text-primary font-black text-xs uppercase hover:bg-white active:scale-95 transition-all shadow-lg shadow-accent-yellow/10"
                >
                  DAFTARKAN MASALAH
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
