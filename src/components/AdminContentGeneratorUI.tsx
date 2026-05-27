import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  Upload, 
  Link as LinkIcon, 
  Loader2, 
  Check, 
  Copy, 
  Save, 
  Plus, 
  Minus,
  Settings, 
  Lock,
  ArrowRight,
  AlertCircle,
  Clock,
  Trash2,
  BookOpen,
  Send,
  User,
  Zap,
  Tag
} from 'lucide-react';
import { cn } from '../lib/utils';
import ImagePromptGenerator from './ImagePromptGenerator';

interface AdminContentGeneratorUIProps {
  onGenerateAI: (prompt: string, context: string, provider: 'gemini' | 'nvidia-nemotron') => Promise<string>;
}

export default function AdminContentGeneratorUI({ onGenerateAI }: AdminContentGeneratorUIProps) {
  const [activeSubTab, setActiveSubTab] = useState<'article' | 'image' | 'analyzer'>('article');
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // States for general notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Article Generator States
  const [articleTopic, setArticleTopic] = useState('');
  const [articleStyle, setArticleStyle] = useState('informative');
  const [articleKeywords, setArticleKeywords] = useState('');
  const [articleCategory, setArticleCategory] = useState('');
  const [articleProvider, setArticleProvider] = useState<'gemini' | 'nvidia-nemotron'>('gemini');
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  
  // Article Result & Edit States
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedExcerpt, setGeneratedExcerpt] = useState('');
  const [generatedSlug, setGeneratedSlug] = useState('');
  const [generatedCover, setGeneratedCover] = useState('');
  const [generatedAuthor, setGeneratedAuthor] = useState('Admin Davs');
  const [isPublished, setIsPublished] = useState(false);
  const [isArticleSaved, setIsArticleSaved] = useState(false);

  // 2. Prompt Image Generator States (For Prompt Builder Content Saving)
  const [lastBuiltPrompt, setLastBuiltPrompt] = useState('');
  const [savedPrompts, setSavedPrompts] = useState<any[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);

  // 3. Content Analyzer States
  const [analyzerMode, setAnalyzerMode] = useState<'file' | 'link'>('file');
  const [analyzerFileUrl, setAnalyzerFileUrl] = useState('');
  const [analyzerFile, setAnalyzerFile] = useState<File | null>(null);
  const [analyzerBase64, setAnalyzerBase64] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load standard article categories & saved items on init
  useEffect(() => {
    fetchCategories();
    fetchSavedPrompts();
    fetchSavedAnalyses();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const cq = query(collection(db, 'categories'), where('type', '==', 'artikel'));
      const snapshot = await getDocs(cq);
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchSavedPrompts = async () => {
    try {
      setLoadingPrompts(true);
      const q = query(collection(db, 'saved_prompts'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      setSavedPrompts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (_) {
      // Fallback local storage
      try {
        const saved = localStorage.getItem('admin_saved_prompts');
        if (saved) setSavedPrompts(JSON.parse(saved));
      } catch (e) {}
    } finally {
      setLoadingPrompts(false);
    }
  };

  const fetchSavedAnalyses = async () => {
    try {
      setLoadingAnalyses(true);
      const q = query(collection(db, 'saved_analyses'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      setSavedAnalyses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (_) {
      try {
        const saved = localStorage.getItem('admin_saved_analyses');
        if (saved) setSavedAnalyses(JSON.parse(saved));
      } catch (e) {}
    } finally {
      setLoadingAnalyses(false);
    }
  };

  const showNotification = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // Helper to slugify title
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  // 1. GENERATE ARTICLE INTEGRATION
  const handleGenerateArticle = async () => {
    if (!articleTopic.trim()) {
      showNotification('error', 'Silakan masukkan topik artikel terlebih dahulu!');
      return;
    }

    setIsGeneratingArticle(true);
    setGeneratedTitle('');
    setGeneratedContent('');
    setGeneratedExcerpt('');
    setGeneratedSlug('');
    setIsArticleSaved(false);

    try {
      const promptText = `Tulis sebuah artikel bertema "${articleTopic}" menggunakan gaya penulisan "${articleStyle}".
Kata kunci utama yang harus disertakan: ${articleKeywords || 'tidak ada'}.

Anda HARUS mengembalikan respons dalam format JSON valid (TANPA dibungkus markdown block, hanya string JSON murni) dengan struktur objek sebagai berikut:
{
  "title": "Judul Artikel yang Sangat Menarik & Bombastis",
  "excerpt": "Ringkasan tulisan pembuka berdaya pikat tinggi (maximum 150-200 karakter)",
  "content": "Isi lengkap artikel menggunakan format Markdown lengkap dengan struktur heading, poin-poin, penjelasan mendalam, minimal 4 paragraf detail dalam Bahasa Indonesia."
}`;

      const aiText = await onGenerateAI(promptText, 'Anda adalah jurnalis senior dan ahli optimasi SEO konten digital.', articleProvider);
      
      // Attempt clean extraction of JSON
      let cleanedJson = aiText.trim();
      if (cleanedJson.startsWith('```json')) {
        cleanedJson = cleanedJson.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```/, '').replace(/```$/, '').trim();
      }

      try {
        const parsed = JSON.parse(cleanedJson);
        setGeneratedTitle(parsed.title || 'Artikel AI Baru');
        setGeneratedExcerpt(parsed.excerpt || 'Ringkasan artikel hasil kecerdasan buatan.');
        setGeneratedContent(parsed.content || '');
        setGeneratedSlug(slugify(parsed.title || 'artikel-ai-baru'));
      } catch (jsonErr) {
        console.warn('AI did not yield valid JSON, using raw text as content', jsonErr);
        // Fallback parsing or use raw text
        setGeneratedTitle(`Optimasi Content: ${articleTopic}`);
        setGeneratedExcerpt(`Informasi terbaru mengenai topik hangat: ${articleTopic}`);
        setGeneratedContent(aiText);
        setGeneratedSlug(slugify(articleTopic));
      }
      showNotification('success', 'Artikel AI berhasil dibuat! Silakan tinjau dan simpan di bawah.');
    } catch (err: any) {
      console.error(err);
      showNotification('error', `Gagal membuat artikel: ${err.message || 'Pastikan server aktif dan API Key valid.'}`);
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  // 1b. SAVE ARTICLE TO DATABASE (articles collection)
  const handleSaveArticle = async () => {
    if (!generatedTitle.trim() || !generatedContent.trim()) {
      showNotification('error', 'Judul dan konten tidak boleh kosong!');
      return;
    }

    try {
      const chosenCat = categories.find(c => c.id === articleCategory);
      const articlePayload = {
        title: generatedTitle,
        slug: generatedSlug || slugify(generatedTitle),
        content: generatedContent,
        excerpt: generatedExcerpt,
        author: generatedAuthor || 'Admin Davs',
        category_id: articleCategory,
        category: chosenCat ? chosenCat.name : '',
        cover_image: generatedCover || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80',
        is_published: isPublished,
        tags: articleKeywords ? articleKeywords.split(',').map(k => k.trim()) : [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      await addDoc(collection(db, 'articles'), articlePayload);
      setIsArticleSaved(true);
      showNotification('success', 'Konten Artikel sukses disimpan langsung ke database utama CMS!');
    } catch (err: any) {
      console.error('Failed to save article:', err);
      showNotification('error', `Gagal menyimpan ke Firestore: ${err.message || err}`);
    }
  };

  // 2b. SAVE IMAGE PROMPT/COPIED DESIGN
  const handleSavePrompt = async (promptString: string) => {
    if (!promptString || !promptString.trim()) {
      showNotification('error', 'Format prompt kosong atau belum di-generate!');
      return;
    }

    try {
      const newPrompt = {
        prompt: promptString,
        title: promptString.substring(0, 45) + '...',
        created_at: serverTimestamp()
      };

      try {
        await addDoc(collection(db, 'saved_prompts'), newPrompt);
      } catch (_) {
        // Fallback local storage
        const updated = [newPrompt, ...savedPrompts];
        localStorage.setItem('admin_saved_prompts', JSON.stringify(updated));
      }

      await fetchSavedPrompts();
      showNotification('success', 'Prompt gambar sukses ditambahkan ke daftar simpanan Kreator!');
    } catch (err: any) {
      showNotification('error', 'Gagal menyimpan prompt gambar ke server.');
    }
  };

  // 3. ANALYZER INTEGRATION
  const processFile = (fileToProcess: File) => {
    if (fileToProcess.size > 2 * 1024 * 1024) { // 2MB Limit
      showNotification('error', 'Ukuran file melampaui batas maksimal 2MB!');
      return;
    }
    setAnalyzerFile(fileToProcess);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAnalyzerBase64(reader.result as string);
    };
    reader.readAsDataURL(fileToProcess);
  };

  const handeAnalyzerDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleAnalyzerDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleAnalyzerDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyzerFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleAnalyzeContent = async () => {
    if (analyzerMode === 'file' && !analyzerFile) {
      showNotification('error', 'Silakan pilih dokumen atau gambar untuk diunggah terlebih dahulu!');
      return;
    }
    if (analyzerMode === 'link' && !analyzerFileUrl.trim()) {
      showNotification('error', 'Masukkan URL video / materi rujukan terlebih dahulu!');
      return;
    }

    setIsLoadingAnalysis(true);
    setAnalysisResult(null);

    try {
      // Structure analysis query
      const mimeType = analyzerFile ? analyzerFile.type : 'text/plain';
      const fileName = analyzerFile ? analyzerFile.name : '';

      const res = await fetch('/api/ai/analyze-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: analyzerMode,
          fileData: analyzerBase64,
          mimeType,
          fileName,
          fileUrl: analyzerFileUrl
        })
      });

      if (!res.ok) {
        let errMsg = `Status ${res.status}: ${res.statusText}`;
        try {
          const errData = await res.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const analysisRaw = await res.json();
      if (analysisRaw.error) throw new Error(analysisRaw.error);

      setAnalysisResult(analysisRaw);
      showNotification('success', 'Materi konten Anda berhasil dianalisis secara instan oleh AI!');
    } catch (err: any) {
      console.error(err);
      showNotification('error', `Gagal menganalisis materi: ${err.message || err}`);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!analysisResult) return;

    try {
      const payload = {
        title: analyzerMode === 'file' ? (analyzerFile ? analyzerFile.name : 'Analisis Berkas') : analyzerFileUrl,
        summary: analysisResult.summary || '',
        insights: analysisResult.insights || [],
        cinematic_suggestions: analysisResult.cinematicSuggestions || [],
        creative_prompts: analysisResult.creativePrompts || [],
        mode: analyzerMode,
        created_at: serverTimestamp()
      };

      try {
        await addDoc(collection(db, 'saved_analyses'), payload);
      } catch (_) {
        const updated = [payload, ...savedAnalyses];
        localStorage.setItem('admin_saved_analyses', JSON.stringify(updated));
      }

      await fetchSavedAnalyses();
      showNotification('success', 'Hasil riset/analisis berhasil disimpan permanen ke arsip system!');
    } catch (err) {
      console.error(err);
      showNotification('error', 'Gagal mengarsipkan modul analisis.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('success', 'Skrip teks berhasil disalin!');
  };

  return (
    <div className="w-full space-y-8" id="admin-content-generator-module">
      {/* Dynamic Alerts */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 right-8 z-[200] max-w-sm flex items-start gap-4 p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl shadow-2xl backdrop-blur"
          >
            <Check className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-xs font-semibold leading-relaxed">{successMsg}</p>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 right-8 z-[200] max-w-sm flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl shadow-2xl backdrop-blur"
          >
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-xs font-semibold leading-relaxed">{errorMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Subtabs */}
      <div className="flex bg-bg-secondary p-1.5 rounded-2xl border border-border-subtle max-w-3xl">
        {[
          { id: 'article', label: 'Article AI Generator', icon: FileText },
          { id: 'image', label: 'Prompt Image Generator', icon: ImageIcon },
          { id: 'analyzer', label: 'Content Analyzer', icon: Sparkles }
        ].map((sub) => {
          const isActive = activeSubTab === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                isActive 
                  ? "bg-accent-yellow text-bg-primary font-black shadow-lg shadow-accent-yellow/10"
                  : "text-text-secondary hover:text-white"
              )}
            >
              <sub.icon className="w-4 h-4 shrink-0" />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Central Work Environment */}
        <div className="xl:col-span-2 bg-bg-secondary rounded-[2rem] border border-border-subtle p-6 sm:p-8 space-y-6">
          {/* TAB 1: ARTICLE AI GENERATOR */}
          {activeSubTab === 'article' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
                <FileText className="w-6 h-6 text-accent-yellow" />
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wide">Article AI Generator</h3>
                  <p className="text-xs text-text-secondary mt-1">Buat artikel berkualitas tinggi berpola SEO secara kilat menggunakan AI Davsplace.</p>
                </div>
              </div>

              {/* Form Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-accent-yellow/80 mb-2">Topik atau Judul Utama Artikel</label>
                  <input
                    type="text"
                    value={articleTopic}
                    onChange={(e) => setArticleTopic(e.target.value)}
                    placeholder="Contoh: Manfaat AI dalam Meningkatkan Produktivitas Agensi Kreatif"
                    className="w-full px-4 py-3.5 bg-bg-tertiary border border-border-subtle text-white text-sm rounded-xl focus:border-accent-yellow transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-accent-yellow/80 mb-2">Style Penulisan</label>
                  <select
                    value={articleStyle}
                    onChange={(e) => setArticleStyle(e.target.value)}
                    className="w-full px-4 py-3.5 bg-bg-tertiary border border-border-subtle text-white text-sm rounded-xl focus:border-accent-yellow transition-all outline-none"
                  >
                    <option value="informative">Informatif & Edukatif</option>
                    <option value="professional">Profesional & Riset Bisnis</option>
                    <option value="storytelling">Storytelling & Intuitif</option>
                    <option value="bold">Bold & Provokatif</option>
                    <option value="casual">Santai & Populer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-accent-yellow/80 mb-2">Kategori Publikasi CMS</label>
                  {loadingCategories ? (
                    <div className="flex items-center h-12 text-xs text-text-secondary">Memuat kategori...</div>
                  ) : (
                    <select
                      value={articleCategory}
                      onChange={(e) => setArticleCategory(e.target.value)}
                      className="w-full px-4 py-3.5 bg-bg-tertiary border border-border-subtle text-white text-sm rounded-xl focus:border-accent-yellow transition-all outline-none"
                    >
                      <option value="">-- Pilih Kategori Artikel --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-accent-yellow/80 mb-2">Keywords / Tag SEO (Pisahkan dengan Koma)</label>
                  <input
                    type="text"
                    value={articleKeywords}
                    onChange={(e) => setArticleKeywords(e.target.value)}
                    placeholder="AI, Kreator, Bisnis, Branding"
                    className="w-full px-4 py-3.5 bg-bg-tertiary border border-border-subtle text-white text-sm rounded-xl focus:border-accent-yellow transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-accent-yellow/80 mb-2">Teknologi Processor AI</label>
                  <select
                    value={articleProvider}
                    onChange={(e) => setArticleProvider(e.target.value as any)}
                    className="w-full px-4 py-3.5 bg-bg-tertiary border border-border-subtle text-white text-sm rounded-xl focus:border-accent-yellow transition-all outline-none"
                  >
                    <option value="gemini">Google Gemini Engine (Rekomendasi Indonesia)</option>
                    <option value="nvidia-nemotron">NVIDIA Nemotron LLM</option>
                  </select>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerateArticle}
                disabled={isGeneratingArticle}
                className="w-full py-4 bg-accent-yellow text-bg-primary font-black uppercase tracking-[0.1em] text-xs rounded-xl hover:shadow-xl hover:shadow-accent-yellow/10 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGeneratingArticle ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Mempersiapkan Redaksi Artikel AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 shrink-0 font-bold" />
                    <span>Kirim Instruksi ke AI Generator</span>
                  </>
                )}
              </button>

              {/* Output & Editor (Save Area) */}
              {(generatedTitle || generatedContent) && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="pt-6 border-t border-border-subtle space-y-6"
                >
                  <div className="p-4 bg-accent-yellow/10 border border-accent-yellow/20 rounded-2xl flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-accent-yellow mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase text-accent-yellow">Redaksi Menunggu Persetujuan Anda</h4>
                      <p className="text-[11px] text-text-secondary mt-1">Anda dapat memodifikasi draf di bawah sebelum menyimpannya ke CMS / Database Publikasi secara permanen.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-accent-yellow/80 mb-2">Judul Artikel Final</label>
                      <input
                        type="text"
                        value={generatedTitle}
                        onChange={(e) => {
                          setGeneratedTitle(e.target.value);
                          setGeneratedSlug(slugify(e.target.value));
                        }}
                        className="w-full px-4 py-3 bg-bg-tertiary border border-border-subtle text-white font-black text-base rounded-xl focus:border-accent-yellow transition-all outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-accent-yellow/80 mb-2">slug (URL Bersih)</label>
                        <input
                          type="text"
                          value={generatedSlug}
                          onChange={(e) => setGeneratedSlug(e.target.value)}
                          className="w-full px-4 py-2.5 bg-bg-tertiary border border-border-subtle text-text-secondary text-xs rounded-xl focus:border-accent-yellow transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-accent-yellow/80 mb-2">Penulis / Author</label>
                        <input
                          type="text"
                          value={generatedAuthor}
                          onChange={(e) => setGeneratedAuthor(e.target.value)}
                          className="w-full px-4 py-2.5 bg-bg-tertiary border border-border-subtle text-white text-xs rounded-xl focus:border-accent-yellow transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-accent-yellow/80 mb-2">Excerpt / Ringkasan Singkat</label>
                      <textarea
                        rows={2}
                        value={generatedExcerpt}
                        onChange={(e) => setGeneratedExcerpt(e.target.value)}
                        className="w-full px-4 py-3 bg-bg-tertiary border border-border-subtle text-white text-xs rounded-xl focus:border-accent-yellow transition-all outline-none resize-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-accent-yellow/80 mb-2">URL Cover Gambar</label>
                      <input
                        type="text"
                        value={generatedCover}
                        onChange={(e) => setGeneratedCover(e.target.value)}
                        placeholder="Biarkan kosong untuk menggunakan template bawaan Unsplash"
                        className="w-full px-4 py-3 bg-bg-tertiary border border-border-subtle text-white text-xs rounded-xl focus:border-accent-yellow transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-accent-yellow/80 mb-2">Konten Markdown Artikel</label>
                      <textarea
                        rows={12}
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        className="w-full p-4 bg-bg-tertiary border border-border-subtle text-white text-xs rounded-xl font-mono focus:border-accent-yellow transition-all outline-none resize-y leading-relaxed"
                      />
                    </div>

                    {/* Published and Save Configuration */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-bg-tertiary rounded-2xl border border-border-subtle">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="is_published_article"
                          checked={isPublished}
                          onChange={(e) => setIsPublished(e.target.checked)}
                          className="w-5 h-5 accent-accent-yellow rounded border-border-subtle"
                        />
                        <label htmlFor="is_published_article" className="text-xs font-black uppercase text-white cursor-pointer select-none">Tampilkan Langsung ke Publik (Publish)</label>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveArticle}
                        disabled={isArticleSaved}
                        className={cn(
                          "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
                          isArticleSaved 
                            ? "bg-green-500/15 border border-green-500/35 text-green-400 cursor-default"
                            : "bg-accent-yellow text-bg-primary hover:scale-[1.02] active:scale-[0.98]"
                        )}
                      >
                        {isArticleSaved ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Tersimpan di CMS!</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Simpan Artikel ke DB</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* TAB 2: PROMPT IMAGE GENERATOR */}
          {activeSubTab === 'image' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
                <ImageIcon className="w-6 h-6 text-accent-yellow" />
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wide">Prompt Image Generator</h3>
                  <p className="text-xs text-text-secondary mt-1">Rancang prompt instruksi visual termodifikasi ultra tinggi.</p>
                </div>
              </div>

              {/* Renders the full optimized Prompt Builder with visual properties */}
              <div className="border border-border-subtle rounded-2xl p-2 bg-bg-tertiary/20">
                <ImagePromptGenerator 
                  onGenerateAI={async (prompt, context, provider) => {
                    const res = await onGenerateAI(prompt, context, provider);
                    setLastBuiltPrompt(res);
                    return res;
                  }} 
                />
              </div>

              {/* Save Prompt Module */}
              {lastBuiltPrompt && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 bg-bg-tertiary rounded-2xl border border-border-subtle space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-accent-yellow">Prompt Visual Ter-Arsitektur</h4>
                    <span className="text-[9px] bg-accent-yellow/10 text-accent-yellow px-2 py-0.5 rounded border border-accent-yellow/10 uppercase font-black">Ready</span>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-3 bg-bg-primary/50 p-3 rounded-xl font-mono leading-relaxed border border-border-subtle">{lastBuiltPrompt}</p>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => copyToClipboard(lastBuiltPrompt)}
                      className="flex-1 py-3 bg-bg-primary border border-border-subtle font-black text-xs uppercase tracking-wider rounded-xl hover:border-accent-yellow/40 transition-all text-center"
                    >
                      Copy Prompt
                    </button>
                    <button
                      onClick={() => handleSavePrompt(lastBuiltPrompt)}
                      className="flex-1 py-3 bg-accent-yellow text-bg-primary font-black text-xs uppercase tracking-wider rounded-xl hover:shadow-xl hover:shadow-accent-yellow/15 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      Save Prompt
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* TAB 3: CONTENT ANALYZER */}
          {activeSubTab === 'analyzer' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
                <Sparkles className="w-6 h-6 text-accent-yellow" />
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wide">Multi-Modal Content Analyzer</h3>
                  <p className="text-xs text-text-secondary mt-1">Bedah berkas PDF/Image kustom atau link rujukan informasi Anda menjadi draf ide kreatif.</p>
                </div>
              </div>

              {/* Source Mode Toggles */}
              <div className="flex bg-bg-tertiary p-1 rounded-xl border border-border-subtle max-w-sm">
                <button
                  onClick={() => setAnalyzerMode('file')}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                    analyzerMode === 'file' ? "bg-bg-primary text-white border border-border-subtle" : "text-text-secondary"
                  )}
                >
                  Unggah Berkas/Gambar
                </button>
                <button
                  onClick={() => setAnalyzerMode('link')}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                    analyzerMode === 'link' ? "bg-bg-primary text-white border border-border-subtle" : "text-text-secondary"
                  )}
                >
                  Tautkan Link Materi
                </button>
              </div>

              {/* Input Area */}
              {analyzerMode === 'file' ? (
                <div
                  onDragOver={handeAnalyzerDragOver}
                  onDragLeave={handleAnalyzerDragLeave}
                  onDrop={handleAnalyzerDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-[1.5rem] p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
                    isDragActive 
                      ? "border-accent-yellow bg-accent-yellow/5" 
                      : "border-border-subtle hover:border-accent-yellow/30 bg-bg-tertiary/20"
                  )}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAnalyzerFileChange}
                    accept="image/*,application/pdf"
                    className="hidden"
                  />
                  <div className="w-14 h-14 bg-bg-tertiary rounded-2xl flex items-center justify-center border border-border-subtle mb-4 shadow-xl">
                    {analyzerFile ? <Check className="w-6 h-6 text-green-400" /> : <Upload className="w-6 h-6 text-accent-yellow" />}
                  </div>
                  {analyzerFile ? (
                    <div>
                      <h4 className="text-xs font-black uppercase text-white tracking-wide">{analyzerFile.name}</h4>
                      <p className="text-[10px] text-text-secondary mt-1">{(analyzerFile.size / 1024 / 1024).toFixed(2)} MB • Klik untuk ganti berkas</p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xs font-black uppercase text-white tracking-wide">Tarik & Lepaskan Berkas di Sini</h4>
                      <p className="text-[10px] text-text-secondary mt-1">Mendukung format gambar JPEG/PNG dan berkas PDF (Maksimal 2MB)</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-accent-yellow/80">Rujukan URL Informasi / Materi Kampanye</label>
                  <input
                    type="url"
                    value={analyzerFileUrl}
                    onChange={(e) => setAnalyzerFileUrl(e.target.value)}
                    placeholder="Contoh: https://youtube.com/watch?v=... atau link artikel rilis berita"
                    className="w-full px-4 py-3.5 bg-bg-tertiary border border-border-subtle text-white text-sm rounded-xl focus:border-accent-yellow transition-all outline-none"
                  />
                </div>
              )}

              {/* Action */}
              <button
                type="button"
                onClick={handleAnalyzeContent}
                disabled={isLoadingAnalysis}
                className="w-full py-4 bg-accent-yellow text-bg-primary font-black uppercase tracking-[0.1em] text-xs rounded-xl hover:shadow-xl hover:shadow-accent-yellow/10 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoadingAnalysis ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>AI sedang membedah struktur informasi berkas...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 shrink-0 font-bold" />
                    <span>Jalankan Algoritma Riset Multi-Modal</span>
                  </>
                )}
              </button>

              {/* Analysis Result Display */}
              {analysisResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-6 border-t border-border-subtle space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black uppercase tracking-tight text-white">Laporan Hasil Riset Materi</h4>
                    <button
                      onClick={handleSaveAnalysis}
                      className="px-4 py-2 bg-accent-yellow text-bg-primary font-black text-[10px] uppercase tracking-wider rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Simpan Laporan Riset
                    </button>
                  </div>

                  {/* Executive Summary */}
                  <div className="p-5 bg-bg-tertiary/50 border border-border-subtle rounded-2xl space-y-2">
                    <span className="text-[9px] font-black text-accent-yellow uppercase tracking-widest block">Rangkuman Eksekutif</span>
                    <p className="text-xs text-white leading-relaxed">{analysisResult.summary}</p>
                  </div>

                  {/* Core Takeaways */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-black text-accent-yellow uppercase tracking-widest block">Kesimpulan & Poin Inti Dokumen</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisResult.insights?.map((ins: string, idx: number) => (
                        <div key={idx} className="p-4 bg-bg-tertiary rounded-xl border border-border-subtle flex gap-3 text-xs">
                          <span className="text-accent-yellow font-black">0{idx + 1}.</span>
                          <span className="text-text-secondary font-sans leading-relaxed">{ins}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cinematic Video suggestions */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-black text-accent-yellow uppercase tracking-widest block">Saran Skrip Video Pendek / Cinematic Reels</span>
                    <div className="space-y-3">
                      {analysisResult.cinematicSuggestions?.map((cin: any, idx: number) => (
                        <div key={idx} className="p-4 bg-bg-tertiary rounded-xl border border-border-subtle space-y-2">
                          <h5 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
                            <span className="w-5 h-5 bg-accent-yellow/10 text-accent-yellow rounded flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                            {cin.title}
                          </h5>
                          <p className="text-xs text-text-secondary leading-relaxed pl-7">{cin.concept}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Creative Prompt generators */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-black text-accent-yellow uppercase tracking-widest block">Kombinasi Prompt Visual (Copy-Ready)</span>
                    <div className="space-y-3">
                      {analysisResult.creativePrompts?.map((pr: any, idx: number) => (
                        <div key={idx} className="p-4 bg-bg-tertiary rounded-xl border border-border-subtle space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-accent-yellow/10 text-accent-yellow px-2 py-0.5 rounded uppercase font-black">{pr.format}</span>
                            <button
                              onClick={() => copyToClipboard(pr.prompt)}
                              className="text-[10px] font-bold text-white hover:text-accent-yellow transition-colors flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <p className="text-xs text-text-secondary font-mono leading-relaxed bg-bg-primary p-3 rounded-lg border border-border-subtle">{pr.prompt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Status & Previously Generated/Saved archive */}
        <div className="space-y-8">
          {/* Quick Engine Status Card */}
          <div className="bg-bg-secondary border border-border-subtle rounded-[2rem] p-6 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-accent-yellow">Core Engine Intel</h4>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-border-subtle/50">
                <span className="text-text-secondary">Processor Mode</span>
                <span className="text-white font-black uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Hybrid VIP AI
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border-subtle/50">
                <span className="text-text-secondary">DB Status</span>
                <span className="text-white font-black uppercase text-[10px] tracking-wider">SECURE LIVE</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-secondary">CMS Integration</span>
                <span className="text-accent-yellow font-black uppercase text-[10px] tracking-wider">DIRECT INJECT READY</span>
              </div>
            </div>
          </div>

          {/* Saved Prompts Mini-Archive */}
          {activeSubTab === 'image' && (
            <div className="bg-bg-secondary border border-border-subtle rounded-[2rem] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-accent-yellow">Prompt Visual Tersimpan</h4>
                <span className="text-[10px] text-text-secondary font-bold">{savedPrompts.length} Prompt</span>
              </div>

              {loadingPrompts ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 text-accent-yellow animate-spin" />
                </div>
              ) : savedPrompts.length === 0 ? (
                <div className="text-center py-8 bg-bg-tertiary/20 rounded-2xl border border-border-subtle/50">
                  <p className="text-xs text-text-secondary">Belum ada prompt visual tersimpan.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 select-none custom-scrollbar">
                  {savedPrompts.map((item) => (
                    <div key={item.id} className="p-3.5 bg-bg-tertiary border border-border-subtle rounded-xl text-xs space-y-2 group hover:border-accent-yellow/40 transition-all">
                      <p className="text-white font-sans line-clamp-2 leading-relaxed font-medium">{item.prompt}</p>
                      
                      <div className="flex items-center justify-between pt-1 border-t border-border-subtle/50">
                        <span className="text-[8px] text-text-secondary">
                          {item.created_at?.toDate ? new Date(item.created_at.toDate()).toLocaleDateString() : 'Baru dibuat'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(item.prompt)}
                            className="text-[9px] font-black text-accent-yellow hover:underline"
                          >
                            GUNAKAN
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Content Analyses Mini-Archive */}
          {activeSubTab === 'analyzer' && (
            <div className="bg-bg-secondary border border-border-subtle rounded-[2rem] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-accent-yellow">Arsip Riset Materi</h4>
                <span className="text-[10px] text-text-secondary font-bold">{savedAnalyses.length} Laporan</span>
              </div>

              {loadingAnalyses ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 text-accent-yellow animate-spin" />
                </div>
              ) : savedAnalyses.length === 0 ? (
                <div className="text-center py-8 bg-bg-tertiary/20 rounded-2xl border border-border-subtle/50">
                  <p className="text-xs text-text-secondary">Belum ada laporan riset ter-arsip.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                  {savedAnalyses.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setAnalysisResult({
                        summary: item.summary,
                        insights: item.insights,
                        cinematicSuggestions: item.cinematic_suggestions || item.cinematicSuggestions,
                        creativePrompts: item.creative_prompts || item.creativePrompts
                      })}
                      className="w-full text-left p-3.5 bg-bg-tertiary border border-border-subtle rounded-xl text-xs space-y-1.5 group hover:border-accent-yellow transition-all"
                    >
                      <h5 className="font-black uppercase tracking-tight text-white group-hover:text-accent-yellow truncate">{item.title}</h5>
                      <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed">{item.summary}</p>
                      <div className="flex items-center justify-between pt-1.5 text-[8px] text-text-secondary border-t border-border-subtle/50 mt-1">
                        <span>Mode: {item.mode === 'file' ? 'Berkas' : 'Link'}</span>
                        <span className="font-bold underline">Buka Laporan</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
