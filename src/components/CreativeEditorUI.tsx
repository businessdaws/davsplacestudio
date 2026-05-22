import { useState, useRef, ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { 
  Palette, 
  Layers, 
  ExternalLink, 
  Maximize2, 
  RotateCcw, 
  Sparkles, 
  Upload, 
  Link as LinkIcon, 
  Check, 
  HelpCircle,
  Clock,
  Layout,
  Info,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

interface CreativeEditorUIProps {
  user: any;
}

interface CanvasPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  icon: string;
  description: string;
}

const PRESET_CANVAS_SIZES: CanvasPreset[] = [
  {
    id: 'instagram-feed',
    name: 'Instagram Post',
    width: 1080,
    height: 1080,
    icon: '📸',
    description: 'Feed Kotak (1:1)'
  },
  {
    id: 'youtube-thumb',
    name: 'YouTube Thumbnail',
    width: 1280,
    height: 720,
    icon: '📺',
    description: 'Video Cover (16:9)'
  },
  {
    id: 'tiktok-story',
    name: 'TikTok / Story',
    width: 1080,
    height: 1920,
    icon: '📱',
    description: 'Stories Sempit (9:16)'
  },
  {
    id: 'banner-landscape',
    name: 'Twitter/FB Banner',
    width: 1200,
    height: 630,
    icon: '💻',
    description: 'Landscape Banner'
  },
];

const BACKDROP_PRESETS = [
  {
    name: 'Cyber Neon Grid',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1200&auto=format&fit=crop',
    tag: 'Cyberpunk'
  },
  {
    name: 'Cosmic Starfield',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    tag: 'Sci-fi'
  },
  {
    name: 'Abstract Soft Wave',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop',
    tag: 'Minimalis'
  },
  {
    name: 'Retro Studio Lighting',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    tag: 'Studio'
  },
];

export default function CreativeEditorUI({ user }: CreativeEditorUIProps) {
  const [activeTab, setActiveTab] = useState<'preset' | 'upload' | 'url'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<CanvasPreset>(PRESET_CANVAS_SIZES[0]);
  const [bgUrl, setBgUrl] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('');
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Setup Dynamic Photopea Link based on User Selection
  const getPhotopeaUrl = () => {
    let sourceImage = '';
    
    if (activeTab === 'preset' && bgUrl) {
      sourceImage = bgUrl;
    } else if (activeTab === 'upload' && uploadedFileUrl) {
      sourceImage = uploadedFileUrl;
    } else if (activeTab === 'url' && customUrl) {
      sourceImage = customUrl;
    }

    const config: any = {
      environment: {
        theme: 1, // Dark Theme
        lang: 'id', // Indonesian Translation
        vcolors: ['#ffffff', '#000000']
      }
    };

    // If we have an image to load
    if (sourceImage) {
      config.files = [sourceImage];
    } else {
      // Create a blank project based on the select canvas size
      config.files = [
        {
          name: `${selectedPreset.name}.psd`,
          width: selectedPreset.width,
          height: selectedPreset.height,
          background: '#1e1e1e' 
        }
      ];
    }

    const hashString = encodeURIComponent(JSON.stringify(config));
    return `https://www.photopea.com#${hashString}`;
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorStatus(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorStatus('Harap unggah file foto saja (PNG, JPG,/PSD).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorStatus('Ukuran maksimal gambar adalah 15MB.');
      return;
    }

    // Create a local object URL to load directly in the iframe
    const localUrl = URL.createObjectURL(file);
    setUploadedFileUrl(localUrl);
    setIframeKey(prev => prev + 1); // Refresh iframe to load new image
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.startsWith('http')) {
      setErrorStatus('Silakan masukkan format URL https:// yang valid.');
      return;
    }
    setErrorStatus(null);
    setIframeKey(prev => prev + 1); // Refresh iframe
  };

  const selectPresetBg = (url: string) => {
    setBgUrl(url);
    setIframeKey(prev => prev + 1); // Refresh iframe
  };

  const handlePresetCanvasChange = (preset: CanvasPreset) => {
    setSelectedPreset(preset);
    // When switching standard blank canvas, clear active backdrops
    setBgUrl('');
    setIframeKey(prev => prev + 1);
  };

  const resetCanvas = () => {
    setBgUrl('');
    setUploadedFileUrl('');
    setCustomUrl('');
    setErrorStatus(null);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="space-y-12">
      {/* Intro Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-bg-secondary via-bg-secondary to-bg-tertiary border border-border-subtle p-8 md:p-12 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-[50%] h-full bg-accent-yellow/5 blur-[120px] pointer-events-none" />
        <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-tr from-accent-yellow/20 to-accent-yellow/5 rounded-[2rem] flex items-center justify-center shrink-0 border border-accent-yellow/25 shadow-lg shadow-accent-yellow/10">
          <Palette className="w-8 h-8 md:w-12 md:h-12 text-accent-yellow" />
        </div>
        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-accent-yellow/10 text-accent-yellow text-[9px] font-black tracking-widest rounded-full border border-accent-yellow/20 uppercase">
            <Sparkles className="w-3 h-3 animate-pulse" /> Davsplace Creative Workbench
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight uppercase">CREATIVE DESIGN STUDIO</h2>
          <p className="text-text-secondary text-xs sm:text-sm font-sans max-w-xl opacity-80 leading-relaxed">
            Studio desain grafis premium terintegrasi langsung dengan <strong className="text-white">Photopea Engine</strong>. Edit gambar hasil AI generator, sempurnakan tata letak mockup, atau desain konten premium tanpa batas iklan.
          </p>
        </div>
      </motion.div>

      {/* Control Station (Canvas Settings) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Setup Panel */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] shadow-xl space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-text-secondary border-b border-border-subtle/30 pb-3 flex items-center gap-2">
              <Layout className="w-4 h-4 text-accent-yellow" />
              1. Setup Project Baru
            </h3>

            {/* Input Method Switcher */}
            <div className="flex p-1 bg-bg-tertiary border border-border-subtle rounded-xl text-[9px] font-black uppercase">
              <button
                onClick={() => setActiveTab('preset')}
                className={cn(
                  "flex-1 py-2 rounded-lg transition-all",
                  activeTab === 'preset' ? "bg-accent-yellow text-bg-primary" : "text-text-secondary hover:text-white"
                )}
              >
                Template Size
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={cn(
                  "flex-1 py-2 rounded-lg transition-all",
                  activeTab === 'upload' ? "bg-accent-yellow text-bg-primary" : "text-text-secondary hover:text-white"
                )}
              >
                Upload Foto
              </button>
              <button
                onClick={() => setActiveTab('url')}
                className={cn(
                  "flex-1 py-2 rounded-lg transition-all",
                  activeTab === 'url' ? "bg-accent-yellow text-bg-primary" : "text-text-secondary hover:text-white"
                )}
              >
                Input Link
              </button>
            </div>

            {errorStatus && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold font-sans">
                ⚠️ {errorStatus}
              </div>
            )}

            {/* Render Settings based on Mode */}
            {activeTab === 'preset' && (
              <div className="space-y-6">
                {/* Size Selection Grid */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Pilih Ukuran Kanvas</span>
                  <div className="grid grid-cols-2 gap-3">
                    {PRESET_CANVAS_SIZES.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetCanvasChange(preset)}
                        className={cn(
                          "p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group/size",
                          selectedPreset.id === preset.id
                            ? "bg-accent-yellow/10 border-accent-yellow text-accent-yellow shadow-lg shadow-accent-yellow/5"
                            : "bg-bg-tertiary border-border-subtle hover:border-accent-yellow/30 text-text-secondary hover:text-white"
                        )}
                      >
                        <div className="text-xl mb-1">{preset.icon}</div>
                        <p className="text-[10px] font-black uppercase tracking-tight">{preset.name}</p>
                        <p className="text-[8px] font-mono opacity-80 mt-1">{preset.width} x {preset.height} px</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Backdrop Presets */}
                <div className="space-y-3 pt-3 border-t border-border-subtle/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Preset Background (Opsional)</span>
                    {bgUrl && (
                      <button 
                        onClick={() => { setBgUrl(''); setIframeKey(v => v + 1); }}
                        className="text-[8px] font-bold text-accent-yellow hover:underline"
                      >
                        Hapus Preset
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {BACKDROP_PRESETS.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectPresetBg(item.url)}
                        className={cn(
                          "relative aspect-video rounded-lg overflow-hidden border transition-all text-left group/bg",
                          bgUrl === item.url ? "border-accent-yellow scale-[0.98]" : "border-border-subtle hover:border-accent-yellow/40"
                        )}
                      >
                        <img 
                          src={item.url} 
                          alt={item.name} 
                          className="w-full h-full object-cover grayscale opacity-40 group-hover/bg:grayscale-0 group-hover/bg:opacity-80 transition-all duration-300"
                        />
                        <div className="absolute inset-0 p-2 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                          <span className="text-[7px] font-black uppercase px-1 bg-accent-yellow text-bg-primary rounded w-max mb-1">
                            {item.tag}
                          </span>
                          <span className="text-[8px] font-bold text-white truncate max-w-full">
                            {item.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Impor Gambar Lokal</span>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border-subtle hover:border-accent-yellow/50 p-8 rounded-2xl cursor-pointer bg-bg-tertiary transition group">
                  <Upload className="w-8 h-8 text-text-secondary group-hover:text-accent-yellow group-hover:scale-110 transition-all mb-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white mb-1 text-center">Pilih File Foto</span>
                  <span className="text-[8px] text-text-secondary text-center">PNG, JPG, SVG, PSD up to 15MB</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.psd"
                    onChange={handleFileUpload}
                  />
                </label>
                {uploadedFileUrl && (
                  <div className="p-3 bg-accent-yellow/10 border border-accent-yellow/20 rounded-xl flex items-center justify-between">
                    <span className="text-[9px] font-semibold text-accent-yellow truncate max-w-[180px]">File berhasil diunggah!</span>
                    <button 
                      onClick={() => { setUploadedFileUrl(''); setIframeKey(v => v + 1); }}
                      className="p-1 text-red-400 hover:bg-red-500/10 rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'url' && (
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Buka URL Gambar</span>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="Masukkan link gambar https://..."
                      className="w-full bg-bg-tertiary border border-border-subtle focus:border-accent-yellow p-3 pl-10 rounded-xl outline-none text-xs font-sans text-white text-ellipsis"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 bg-accent-yellow text-bg-primary font-black rounded-xl hover:scale-105 active:scale-95 transition-all text-[9px] uppercase tracking-wider"
                  >
                    Buka
                  </button>
                </div>
                <p className="text-[8px] text-text-secondary leading-normal italic">
                  *Penting: Pastikan link gambar dapat diakses secara publik dan tidak terikat proteksi CORS Hotlinking.
                </p>
              </form>
            )}

            {/* Quick Actions Footer */}
            <div className="pt-4 border-t border-border-subtle/30 flex items-center justify-between">
              <button
                onClick={resetCanvas}
                className="text-[9px] flex items-center gap-1.5 p-1 text-text-secondary hover:text-white font-bold uppercase transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Setting
              </button>

              <button
                onClick={() => setIsTipsOpen(true)}
                className="text-[9px] flex items-center gap-1.5 p-1 text-accent-yellow hover:underline font-bold uppercase transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Daftar Tips
              </button>
            </div>
          </div>

          {/* Quick Info Box / Disclaimer */}
          <div className="bg-bg-tertiary/40 border border-border-subtle p-6 rounded-[2rem] space-y-3">
            <h4 className="text-[9px] font-black uppercase text-accent-yellow flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-accent-yellow shrink-0" />
              Mengapa menggunakan Photopea?
            </h4>
            <p className="text-[10px] text-text-secondary leading-relaxed font-sans">
              Photopea dirancang sebagai alternatif profesional Photoshop berbasis browser yang mendukung ekstensi berkas lengkap (.psd, .xd, .sketch, .pdf). Integrasi ini gratis, tanpa daftar akun terpisah, dan tidak memakan baterai performa lokal Anda.
            </p>
          </div>
        </div>

        {/* Right Side: Render Dashboard Editor */}
        <div id="design-editor-workspace" className="lg:col-span-12 xl:col-span-8 space-y-4">
          <div className="bg-bg-secondary border border-border-subtle p-4 rounded-[2rem] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
              <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary">
                Editor Studio Workspace : Ready
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href="https://www.photopea.com"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-bg-tertiary border border-border-subtle hover:border-accent-yellow/40 hover:text-accent-yellow transition text-[9px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5"
              >
                <Maximize2 className="w-3 h-3" />
                Buka Tab Penuh (New Tab)
              </a>
            </div>
          </div>

          <div className="bg-neutral-900 border border-border-subtle rounded-[2.5rem] overflow-hidden p-1 sm:p-2 shadow-2xl relative">
            <iframe
              key={iframeKey}
              src={getPhotopeaUrl()}
              className="w-full h-[660px] md:h-[720px] rounded-[2rem]"
              allow="camera; microphone; clipboard-read; clipboard-write; fullscreen"
              title="Davsplace Photopea Designer Studio Workspace"
            />
          </div>
        </div>
      </div>

      {/* Onboarding Tips Modal overlay */}
      {isTipsOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-bg-secondary border border-border-subtle p-8 rounded-[3rem] shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border-subtle/30 pb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-yellow flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                TIPS MAKSIMAL WORKSPACE
              </span>
              <button 
                onClick={() => setIsTipsOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans text-text-secondary leading-normal">
              <div className="p-3 bg-bg-tertiary rounded-xl border border-border-subtle space-y-1">
                <p className="font-bold text-white uppercase text-[9px] tracking-wide">💡 Salin & Tempel Instan</p>
                <p>Anda dapat menekan tombol <kbd className="bg-neutral-800 text-white px-1 py-0.5 rounded text-[10px] font-mono">CTRL + V</kbd> saat kursor berada di editor untuk menempelkan gambar atau tangkapan layar langsung dari papan klip!</p>
              </div>

              <div className="p-3 bg-bg-tertiary rounded-xl border border-border-subtle space-y-1">
                <p className="font-bold text-white uppercase text-[9px] tracking-wide">💾 Cara Menyimpan Hasil Kerja</p>
                <p>Klik menu <strong className="text-white">Berkas (File) &gt; Simpan sebagai PSD</strong> atau pilih <strong className="text-white">Ekspor sebagai PNG/JPG</strong> untuk mengunduh hasil kreativitas Anda langsung ke komputer.</p>
              </div>

              <div className="p-3 bg-bg-tertiary rounded-xl border border-border-subtle space-y-1">
                <p className="font-bold text-white uppercase text-[9px] tracking-wide">🌐 Sinkronisasi Transparansi</p>
                <p>Gunakan format berkas PNG tebal saat mengekspor gambar transparan agar overlay logo atau stiker menyatu sempurna pada feed postingan.</p>
              </div>
            </div>

            <button
              onClick={() => setIsTipsOpen(false)}
              className="w-full py-3 bg-accent-yellow hover:bg-white text-bg-primary font-black rounded-xl text-[10px] uppercase tracking-wider transition-all"
            >
              Baik, Saya Paham
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
