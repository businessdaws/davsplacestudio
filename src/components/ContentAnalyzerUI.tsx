import { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  Link as LinkIcon, 
  Loader2, 
  Check, 
  Copy, 
  ArrowRight, 
  Sparkles, 
  Film, 
  X, 
  Image as ImageIcon, 
  FileUp,
  AlertCircle,
  HelpCircle,
  Video,
  ExternalLink,
  Volume2,
  Clock,
  Trash2,
  Headphones
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface AnalysisResult {
  summary: string;
  insights: string[];
  cinematicSuggestions: Array<{
    title: string;
    concept: string;
  }>;
  creativePrompts: Array<{
    format: string;
    prompt: string;
  }>;
}

interface HistoryItem {
  id: string;
  timestamp: string;
  title: string;
  type: 'file' | 'link';
  mimeType?: string;
  result: AnalysisResult;
}

export default function ContentAnalyzerUI({ user }: { user: any }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'file' | 'link'>('file');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PROGRESS_STEPS = [
    "Mempersiapkan dokumen untuk dianalisis...",
    "Mengunggah data secara aman ke model AI...",
    "AI menganalisis detail struktur & visual...",
    "Merangkum kesimpulan & menyusun formula kreatif..."
  ];

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`analyzer_history_${user?.uid || 'guest'}`);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load historical analytics:", e);
    }
  }, [user]);

  // Method to save history
  const saveToHistory = (newResult: AnalysisResult, labelTitle: string, fileType: 'file' | 'link', mime?: string) => {
    try {
      const newItem: HistoryItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }),
        title: labelTitle,
        type: fileType,
        mimeType: mime,
        result: newResult
      };
      
      const updated = [newItem, ...history].slice(0, 30); // Keep last 30 items
      setHistory(updated);
      localStorage.setItem(`analyzer_history_${user?.uid || 'guest'}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem(`analyzer_history_${user?.uid || 'guest'}`, JSON.stringify(updated));
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem(`analyzer_history_${user?.uid || 'guest'}`);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (selectedFile: File) => {
    setError(null);
    
    // Check file size limit (max 15MB)
    if (selectedFile.size > 15 * 1024 * 1024) {
      setError("Ukuran file terlalu besar. Batas maksimal adalah 15MB.");
      return;
    }

    const type = selectedFile.type;
    const isValidType = 
      type.startsWith('image/') || 
      type === 'application/pdf' || 
      type.startsWith('video/') ||
      type.startsWith('audio/');

    if (!isValidType) {
      setError("Format file tidak didukung. Silakan unggah Gambar (PNG/JPG), PDF, Video (MP4/WebM), atau Audio (MP3/WAV).");
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setFileBase64(base64String);
    };
    reader.onerror = () => {
      setError("Gagal membaca file. Silakan coba file lain.");
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runAnalysis = async () => {
    if (mode === 'file' && !fileBase64) {
      setError("Silakan unggah dokumen atau file terlebih dahulu.");
      return;
    }
    if (mode === 'link' && !fileUrl.trim()) {
      setError("Silakan masukkan URL link website yang valid.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgressStep(0);

    // Simulate progress increments for a smooth loading feedback
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setProgressStep(1), 1800));
    timers.push(setTimeout(() => setProgressStep(2), 3500));
    timers.push(setTimeout(() => setProgressStep(3), 5500));

    try {
      const response = await fetch('/api/ai/analyze-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: mode,
          fileData: fileBase64,
          mimeType: file?.type,
          fileName: file?.name,
          fileUrl: fileUrl
        })
      });

      // Clear layout timers
      timers.forEach(t => clearTimeout(t));

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Gagal melakukan analisis konten.");
      }

      const data = await response.json();
      setResult(data);
      
      const label = mode === 'file' ? (file?.name || 'File Upload') : (fileUrl.replace(/^https?:\/\/(www\.)?/, '').substring(0, 30));
      saveToHistory(data, label, mode, file?.type);
    } catch (err: any) {
      setError(err.message || "Koneksi terganggu. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyPromptText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const bridgeToVisualEngine = (promptText: string) => {
    localStorage.setItem('analyzer_visual_prompt', promptText);
    navigate('/dashboard?tab=visual-engine');
  };

  const bridgeToGenerator = (summaryText: string) => {
    localStorage.setItem('analyzer_social_prompt', summaryText);
    navigate('/generator');
  };

  const getFileIcon = () => {
    if (!file) return <FileUp className="w-8 h-8 text-accent-yellow" />;
    if (file.type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-400" />;
    if (file.type === 'application/pdf') return <FileText className="w-8 h-8 text-red-400" />;
    if (file.type.startsWith('video/')) return <Video className="w-8 h-8 text-purple-400" />;
    if (file.type.startsWith('audio/')) return <Volume2 className="w-8 h-8 text-emerald-400" />;
    return <FileText className="w-8 h-8 text-accent-yellow" />;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-16">
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-yellow/10 text-accent-yellow text-[9px] font-black rounded-lg uppercase tracking-[0.2em] mb-4 border border-accent-yellow/20">
            <FileText className="w-3 h-3" />
            AI Workspace Feature
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tighter uppercase leading-[0.9] md:leading-none">
            CONTENT <span className="text-accent-yellow italic">ANALYZER</span>
          </h1>
          <p className="text-sm md:text-text-secondary mt-4 font-sans max-w-xl opacity-70 leading-relaxed">
            Punya gambar referensi, dokumen PDF riset, cuplikan video, atau artikel menarik? 
            Unggah atau tempel link di bawah untuk membedah poin-poin utama serta merumuskan visual formula instan!
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        {/* Left Side: Input Workbench */}
        <div className="lg:col-span-2 space-y-8 bg-bg-secondary border border-border-subtle p-8 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-yellow/5 blur-[45px] pointer-events-none" />
          
          <h2 className="text-lg font-display font-black uppercase tracking-tight pb-4 border-b border-border-subtle flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-accent-yellow" />
            Analisis Workbench
          </h2>

          {/* Mode Selector */}
          <div className="flex bg-bg-tertiary p-1.5 rounded-2xl border border-border-subtle">
            <button
              onClick={() => { setMode('file'); setError(null); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-[9px] font-black uppercase tracking-wider",
                mode === 'file' 
                  ? "bg-accent-yellow text-bg-primary shadow"
                  : "text-text-secondary hover:text-white"
              )}
            >
              <FileUp className="w-3.5 h-3.5" />
              Upload File
            </button>
            <button
              onClick={() => { setMode('link'); setError(null); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-[9px] font-black uppercase tracking-wider",
                mode === 'link' 
                  ? "bg-accent-yellow text-bg-primary shadow"
                  : "text-text-secondary hover:text-white"
              )}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Tempel Link URL
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File Upload Area */}
          {mode === 'file' && (
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                File Dokumen / Multimedia
              </label>
              
              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-[2.5rem] p-8 py-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 bg-bg-tertiary",
                    isDragActive 
                      ? "border-accent-yellow bg-accent-yellow/5 scale-[0.99]" 
                      : "border-border-subtle hover:border-accent-yellow/45"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf,video/*,audio/*"
                    onChange={handleFileChange}
                  />
                  <div className="p-4 bg-bg-primary rounded-2xl border border-border-subtle group-hover:border-accent-yellow/30 shadow-md">
                    <Upload className="w-6 h-6 text-accent-yellow" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide">Drag & Drop File Anda</p>
                    <p className="text-[10px] text-text-secondary mt-1 tracking-normal">atau klik untuk memilih file dari galeri</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-[8px] font-black text-text-secondary uppercase tracking-widest">
                    <span className="px-2 py-1 bg-bg-primary rounded border border-border-subtle">IMAGE</span>
                    <span className="px-2 py-1 bg-bg-primary rounded border border-border-subtle">PDF</span>
                    <span className="px-2 py-1 bg-bg-primary rounded border border-border-subtle">VIDEO</span>
                    <span className="px-2 py-1 bg-bg-primary rounded border border-accent-yellow/20 text-accent-yellow">AUDIO / MP3</span>
                  </div>
                  <p className="text-[8px] text-text-secondary tracking-normal">Rasio file aman maksimal 15MB</p>
                </div>
              ) : (
                <div className="bg-bg-tertiary border border-border-subtle rounded-3xl p-6 relative flex items-center gap-4">
                  <div className="p-3 bg-bg-primary rounded-xl border border-border-subtle">
                    {getFileIcon()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold uppercase truncate pr-6">{file.name}</p>
                    <p className="text-[9px] text-text-secondary uppercase tracking-widest mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1]?.toUpperCase() || 'DOCUMENT'}
                    </p>
                  </div>
                  <button
                    onClick={clearFile}
                    className="absolute top-4 right-4 p-1 rounded-full text-text-secondary hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* URL Input Area */}
          {mode === 'link' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                  Link URL Konten
                </label>
                <span className="text-[8px] bg-accent-yellow/15 text-accent-yellow font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Auto-Detect Format
                </span>
              </div>
              <div className="relative">
                <input
                  type="url"
                  placeholder="Masukkan URL Link (Web, video YouTube, PDF atau image)..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-5 py-4 bg-bg-tertiary border border-border-subtle focus:border-accent-yellow/50 rounded-2xl text-xs text-white placeholder:text-text-secondary/40 outline-none transition-all pl-12"
                />
                <LinkIcon className="w-4.5 h-4.5 text-text-secondary/60 absolute left-4.5 top-1/2 -translate-y-1/2" />
              </div>

              <div className="text-[9px] text-text-secondary/80 bg-bg-tertiary/20 p-3.5 rounded-2xl border border-border-subtle/50 leading-relaxed space-y-1.5 font-sans">
                <div className="font-bold text-white uppercase text-[8px] tracking-wider mb-1">Mendukung Analisis Link:</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 opacity-90">
                  <span className="flex items-center gap-1">• 📝 Artikel / Webpage</span>
                  <span className="flex items-center gap-1">• 🎥 Video (YouTube / TikTok)</span>
                  <span className="flex items-center gap-1">• 🖼️ Image Link (.png / .jpg)</span>
                  <span className="flex items-center gap-1">• 📄 PDF Document (.pdf)</span>
                  <span className="flex items-center gap-1 font-bold text-accent-yellow">• 🎵 Audio MP3 / Voice Link</span>
                </div>
              </div>

              <div className="bg-bg-tertiary/50 rounded-2xl p-4 border border-border-subtle/50">
                <p className="text-[9px] font-black uppercase text-accent-yellow tracking-widest mb-2 flex items-center gap-1.5">
                  <HelpCircle className="w-3 h-3" /> Quick Test Presets:
                </p>
                <div className="flex flex-wrap gap-2 text-[8px] font-bold">
                  <button
                    onClick={() => setFileUrl('https://id.wikipedia.org/wiki/Sinematografi')}
                    className="px-2.5 py-1.5 bg-bg-primary rounded-lg border border-border-subtle hover:border-accent-yellow/40 transition-all text-text-secondary hover:text-white uppercase tracking-wider"
                  >
                    Cinematography Info
                  </button>
                  <button
                    onClick={() => setFileUrl('https://backlightblog.com/cinematic-angles')}
                    className="px-2.5 py-1.5 bg-bg-primary rounded-lg border border-border-subtle hover:border-accent-yellow/40 transition-all text-text-secondary hover:text-white uppercase tracking-wider"
                  >
                    Camera Angles Guide
                  </button>
                  <button
                    onClick={() => setFileUrl('https://upload.wikimedia.org/wikipedia/commons/e/e7/03-24-05Metr-2.jpg')}
                    className="px-2.5 py-1.5 bg-bg-primary rounded-lg border border-border-subtle hover:border-accent-yellow/40 transition-all text-text-secondary hover:text-white uppercase tracking-wider"
                  >
                    Image Link Ex.
                  </button>
                  <button
                    onClick={() => setFileUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')}
                    className="px-2.5 py-1.5 bg-bg-primary rounded-lg border border-accent-yellow/30 hover:border-accent-yellow/60 transition-all text-accent-yellow hover:text-white uppercase tracking-wider"
                  >
                    🎵 Audio MP3 Preset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Start Action Button */}
          <button
            onClick={runAnalysis}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-accent-yellow text-bg-primary font-black rounded-2xl text-[10px] uppercase tracking-widest disabled:opacity-40 select-none hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-accent-yellow/15"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menganalisis...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Proses & Ambil Kesimpulan
              </>
            )}
          </button>
          
          {/* Riwayat Analisis Panel */}
          {history.length > 0 && (
            <div className="bg-bg-tertiary/20 border border-border-subtle p-6 rounded-[2rem] relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle/50 pb-3">
                <h3 className="text-[10px] font-display font-black uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-accent-yellow" strokeWidth={2.5} />
                  Riwayat Analisis ({history.length})
                </h3>
                <button
                  onClick={clearAllHistory}
                  className="text-[8px] font-bold text-text-secondary hover:text-red-400 transition-colors uppercase tracking-wider flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Bersihkan
                </button>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setResult(item.result);
                      setMode(item.type);
                      if (item.type === 'link') {
                        setFileUrl(item.title);
                      } else {
                        // Clear active upload visual to focus on viewing historical item details
                        clearFile();
                      }
                    }}
                    className={cn(
                      "p-3 rounded-xl bg-bg-tertiary border border-border-subtle hover:border-accent-yellow/30 transition-all cursor-pointer flex items-center justify-between group",
                      result?.summary === item.result.summary && "border-accent-yellow/40 bg-accent-yellow/5"
                    )}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider",
                          item.type === 'file' 
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/10"
                            : "bg-purple-500/10 text-purple-400 border border-purple-500/10"
                        )}>
                          {item.type === 'file' ? 'FILE' : 'LINK'}
                        </span>
                        <span className="text-[8px] text-text-secondary/60">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold truncate text-white uppercase tracking-tight group-hover:text-accent-yellow transition-colors font-sans">
                        {item.title}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteHistoryItem(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-all shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Process Indicator or Summary Results Output */}
        <div className="lg:col-span-3 min-h-[450px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading-screen"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 bg-bg-secondary border border-border-subtle rounded-[2.5rem] relative overflow-hidden"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-accent-yellow/5 blur-[100px] pointer-events-none rounded-full" />
                
                <div className="relative mb-8">
                  <div className="w-[100px] h-[100px] border-4 border-dashed border-accent-yellow/20 rounded-full animate-spin [animation-duration:15s]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-accent-yellow animate-spin" />
                  </div>
                </div>

                <motion.p
                  key={progressStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm font-bold tracking-wide text-white uppercase max-w-sm h-12 flex items-center justify-center mb-2"
                >
                  {PROGRESS_STEPS[progressStep]}
                </motion.p>
                <p className="text-[10px] uppercase tracking-widest text-text-secondary max-w-xs leading-relaxed opacity-60">
                  Model Gemini membelah file konten Anda menjadi segmen analisis dinamis. Mohon tunggu beberapa detik.
                </p>
              </motion.div>
            ) : result ? (
              <motion.div
                key="results-screen"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Visual Header / Summary Card */}
                <div className="bg-bg-secondary border border-border-subtle p-8 rounded-[2.5rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-yellow/5 blur-[50px] pointer-events-none" />
                  
                  <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase text-accent-yellow tracking-widest">
                    <Check className="w-4 h-4" />
                    Analisis Konten Selesai
                  </div>

                  <h3 className="text-xl md:text-2xl font-display font-black uppercase mb-4 tracking-tight leading-tight">
                    Ringkasan <span className="text-accent-yellow italic">Eksekutif</span>
                  </h3>
                  <p className="text-[13px] md:text-sm text-text-secondary leading-relaxed font-sans opacity-95">
                    {result.summary}
                  </p>
                  
                  {/* Action Bridge: Generator */}
                  <div className="mt-6 pt-6 border-t border-border-subtle/50 flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => bridgeToGenerator(result.summary)}
                      className="px-5 py-3 rounded-xl bg-bg-primary border border-border-subtle text-[9px] font-black uppercase tracking-widest text-text-secondary hover:text-white transition-colors flex items-center gap-2 hover:border-accent-yellow/20"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-accent-yellow" strokeWidth={2.5} />
                      Gunakan untuk Sosmed Caption
                    </button>
                  </div>
                </div>

                {/* Key Insights Bento Items */}
                <div className="bg-bg-secondary border border-border-subtle p-8 rounded-[2.5rem] relative">
                  <h3 className="text-lg font-display font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-accent-yellow rounded-full" />
                    Poin & Insights Kunci
                  </h3>

                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.insights && result.insights.map((insight, idx) => (
                      <li 
                        key={idx}
                        className="bg-bg-tertiary border border-border-subtle/60 p-4 rounded-2xl flex items-start gap-3 transition-colors hover:border-accent-yellow/15"
                      >
                        <span className="flex items-center justify-center shrink-0 w-5 h-5 rounded-full bg-accent-yellow/10 text-accent-yellow text-[10px] font-black mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-text-secondary leading-relaxed font-sans opacity-90">
                          {insight}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cinematic Vision Suggestions */}
                <div className="bg-bg-secondary border border-border-subtle p-8 rounded-[2.5rem] relative overflow-hidden">
                  <h3 className="text-lg font-display font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                    <Film className="w-5 h-5 text-accent-yellow" />
                    Rencana Adegan Sinematik
                  </h3>

                  <div className="space-y-4">
                    {result.cinematicSuggestions && result.cinematicSuggestions.map((scene, idx) => (
                      <div 
                        key={idx}
                        className="p-5 rounded-2xl bg-bg-tertiary border border-border-subtle hover:border-accent-yellow/20 transition-all flex flex-col gap-2 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-accent-yellow">
                            Adegan {idx + 1}: {scene.title}
                          </h4>
                          <button
                            onClick={() => bridgeToVisualEngine(scene.concept)}
                            className="hidden group-hover:flex items-center gap-1 text-[8px] font-black text-text-secondary hover:text-accent-yellow transition-colors uppercase tracking-widest"
                          >
                            Tulis di Visual Engine
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed font-sans pr-2">
                          {scene.concept}
                        </p>
                        <div className="mt-3 flex justify-end md:hidden">
                          <button
                            onClick={() => bridgeToVisualEngine(scene.concept)}
                            className="flex items-center gap-1.5 text-[8px] font-black text-accent-yellow uppercase tracking-widest pl-2"
                          >
                            Buka di Visual Engine
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Creative Formula & Visual Prompts */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-text-secondary pl-2">
                    Saran Prompter Formula Sinematik (English Only)
                  </h3>

                  {result.creativePrompts && result.creativePrompts.map((item, idx) => (
                    <div 
                      key={idx}
                      className="bg-bg-secondary border border-border-subtle rounded-[2rem] p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
                    >
                      <div className="flex-1 overflow-hidden space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-accent-yellow/15 border border-accent-yellow/20 rounded text-[8px] font-black uppercase text-accent-yellow tracking-wider">
                            {item.format}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-text-secondary leading-relaxed select-all line-clamp-3 md:line-clamp-2 max-w-xl italic">
                          "{item.prompt}"
                        </p>
                      </div>

                      <div className="flex flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-border-subtle">
                        <button
                          onClick={() => copyPromptText(item.prompt, idx)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-bg-tertiary border border-border-subtle rounded-xl text-[8px] font-black uppercase tracking-widest hover:text-white transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-accent-yellow" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-text-secondary" />
                              Copy Prompt
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => bridgeToVisualEngine(item.prompt)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-accent-yellow text-bg-primary rounded-xl text-[8px] font-black uppercase tracking-widest hover:scale-[1.03] active:scale-[0.97] transition-all"
                        >
                          Send to Generator
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-border-subtle rounded-[2.5rem] bg-bg-secondary/40">
                <div className="p-4 bg-bg-secondary rounded-2xl border border-border-subtle/50 text-text-secondary mb-4 opacity-50">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-text-secondary opacity-70">Konstruksi Insight Kosong</h4>
                <p className="text-xs text-text-secondary max-w-sm mt-2 opacity-50 font-sans leading-relaxed">
                  Silakan masukkan file atau link URL di panel sebelah kiri untuk memproses rangkuman eksekutif, POI penting, dan rencana visual.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
