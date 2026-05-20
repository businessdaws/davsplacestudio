import { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Image as ImageIcon, 
  Camera, 
  Lightbulb, 
  Paintbrush, 
  MapPin, 
  Zap,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ImagePromptGeneratorProps {
  onGenerateAI: (prompt: string, context: string, provider: 'gemini' | 'nvidia-nemotron') => Promise<string>;
}

const SHOT_FRAMINGS = [
  'Wide-angle tracking shot',
  'Wide-angle',
  'Extreme Close-up',
  'Medium Shot',
  'Drone view',
  'Low angle',
  'Tracking shot'
];

const STYLES = [
  'Cinematic',
  'Hyper-realistic',
  'Cyberpunk',
  '3D Pixar style',
  'Vintage 35mm film',
  'Majestic fantasy'
];

const LIGHTINGS = [
  'Golden hour sunlight',
  'Neon streetlights',
  'Moody cinematic lighting',
  'Ethereal glowing light',
  'Crisp daylight'
];

const LOCATION_EXAMPLES = [
  { label: 'Future Jakarta Cafe', value: 'A futuristic coffee shop in Jakarta' },
  { label: 'Spaceship', value: 'An abandoned spaceship covered in space moss' },
  { label: 'Misty Forest', value: 'A serene misty forest with glowing blue mushrooms' }
];

const ACTION_EXAMPLES = [
  { label: 'Barista Robot', value: 'A barista robot carefully serving steaming holographic coffee' },
  { label: 'Floating Bean', value: 'A colossal reflective bean-shaped object levitating slowly over water' },
  { label: 'Golden Deer', value: 'A majestic deer made of pure stardust drinking from a cosmic stream' }
];

export default function ImagePromptGenerator({ onGenerateAI }: ImagePromptGeneratorProps) {
  const [shot, setShot] = useState(SHOT_FRAMINGS[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [lighting, setLighting] = useState(LIGHTINGS[0]);
  const [location, setLocation] = useState('');
  const [action, setAction] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'nvidia-nemotron'>('nvidia-nemotron');
  
  const [assembledPrompt, setAssembledPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to construct literal prompt
  const assembleLiteralPrompt = () => {
    const act = action.trim() || '[Action]';
    const loc = location.trim() || '[Location]';
    return `${shot} of ${act} at ${loc}, illuminated by ${lighting}, showcasing a ${style} aesthetic.`;
  };

  const handleAssemble = () => {
    if (!action.trim() || !location.trim()) {
      setError('Silakan isi Action dan Location terlebih dahulu agar prompt lebih spesifik.');
      return;
    }
    setError(null);
    setAssembledPrompt(assembleLiteralPrompt());
  };

  const handleAI_Enhance = async () => {
    if (!action.trim() || !location.trim()) {
      setError('Silakan isi Action dan Location terlebih dahulu untuk diproses oleh AI.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const basePrompt = assembleLiteralPrompt();
    const systemInstruction = `
      You are an expert AI Image Generation Architect specialized in Midjourney, DALL-E 3, and Stable Diffusion code.
      The user will provide a structured, formula-based image prompt: "${basePrompt}" containing inputs that might be in Indonesian or simple English.
      
      Your task:
      1. Translate any Indonesian components (Action, Location) into rich, evocative, high-quality, professional English suitable for image generation engines.
      2. Refine the core prompt into a single descriptive English sentence or dense block of description. Keep the structured parameters (Shot: ${shot}, Style: ${style}, Lighting: ${lighting}) fully respected and woven in cleanly, but embellish them slightly with majestic, cinematic, high-detail modifiers.
      3. Do NOT output any conversational text or explanation. Return ONLY the final polished English prompt itself.
    `;

    try {
      const refinedText = await onGenerateAI(
        `Translate and enhance this image prompt structure into a highly detailed English prompt: "${basePrompt}"`, 
        systemInstruction,
        selectedProvider
      );

      if (refinedText) {
        // Clean up quotes if AI returned it with wrapping quotes
        const cleanText = refinedText.replace(/^["']|["']$/g, '').trim();
        setAssembledPrompt(cleanText);
      } else {
        throw new Error('AI returned an empty response.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Gagal menghubungkan AI Assistant. Menggunakan formula manual sebagai fallback.');
      setAssembledPrompt(assembleLiteralPrompt());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!assembledPrompt) return;
    navigator.clipboard.writeText(assembledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Configuration Form */}
      <div className="lg:col-span-7 bg-bg-secondary border border-border-subtle p-6 md:p-8 rounded-[2rem] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-yellow/10 rounded-xl flex items-center justify-center text-accent-yellow">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">Prompt Blueprint</h3>
              <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mt-1">Formula & Parameters</p>
            </div>
          </div>

          {/* Provider Selector */}
          <div className="flex bg-bg-tertiary p-1 rounded-xl border border-border-subtle select-none max-w-fit self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedProvider('nvidia-nemotron')}
              className={cn(
                "px-3 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all",
                selectedProvider === 'nvidia-nemotron'
                  ? "bg-accent-yellow text-bg-primary shadow"
                  : "text-text-secondary hover:text-white"
              )}
            >
              NVIDIA Nemotron
            </button>
            <button
              type="button"
              onClick={() => setSelectedProvider('gemini')}
              className={cn(
                "px-3 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all",
                selectedProvider === 'gemini'
                  ? "bg-accent-yellow text-bg-primary shadow"
                  : "text-text-secondary hover:text-white"
              )}
            >
              Gemini
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-3">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Input Fields */}
        <div className="space-y-5">
          {/* Action Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 ml-1">
                <Zap className="w-3.5 h-3.5 text-accent-yellow" /> Action / Subject *
              </label>
              <span className="text-[9px] text-text-secondary/50 font-bold uppercase">Bisa Indonesia / Inggris</span>
            </div>
            <textarea
              rows={2}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Contoh: Seekor kucing astronot memegang kopi panas..."
              className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-4 outline-none focus:border-accent-yellow transition-all text-sm font-sans resize-none text-white placeholder-text-secondary/40"
            />
            {/* Action Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {ACTION_EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAction(ex.value)}
                  className="px-2.5 py-1 bg-bg-tertiary text-[9px] font-bold text-text-secondary hover:text-white border border-border-subtle hover:border-accent-yellow/30 rounded-lg transition-all"
                >
                  + {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 ml-1">
                <MapPin className="w-3.5 h-3.5 text-accent-yellow" /> Location / Environment *
              </label>
            </div>
            <textarea
              rows={2}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Di stasiun kereta bawah tanah Cyberpunk di Tokyo..."
              className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-4 outline-none focus:border-accent-yellow transition-all text-sm font-sans resize-none text-white placeholder-text-secondary/40"
            />
            {/* Location Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {LOCATION_EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLocation(ex.value)}
                  className="px-2.5 py-1 bg-bg-tertiary text-[9px] font-bold text-text-secondary hover:text-white border border-border-subtle hover:border-accent-yellow/30 rounded-lg transition-all"
                >
                  + {ex.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Shot Framing */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 ml-1">
                <Camera className="w-3.5 h-3.5 text-accent-yellow" /> Shot Framing
              </label>
              <select
                value={shot}
                onChange={(e) => setShot(e.target.value)}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3 outline-none focus:border-accent-yellow transition-all text-xs font-sans text-white cursor-pointer"
              >
                {SHOT_FRAMINGS.map((sh, idx) => (
                  <option key={idx} value={sh}>{sh}</option>
                ))}
              </select>
            </div>

            {/* Lighting */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 ml-1">
                <Lightbulb className="w-3.5 h-3.5 text-accent-yellow" /> Lighting
              </label>
              <select
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3 outline-none focus:border-accent-yellow transition-all text-xs font-sans text-white cursor-pointer"
              >
                {LIGHTINGS.map((li, idx) => (
                  <option key={idx} value={li}>{li}</option>
                ))}
              </select>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 ml-1">
                <Paintbrush className="w-3.5 h-3.5 text-accent-yellow" /> style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3 outline-none focus:border-accent-yellow transition-all text-xs font-sans text-white cursor-pointer"
              >
                {STYLES.map((st, idx) => (
                  <option key={idx} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Compile Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-subtle/50">
          <button
            onClick={handleAssemble}
            className="flex-1 py-4 bg-bg-tertiary hover:bg-bg-primary text-white border border-border-subtle font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-[0.98]"
          >
            Assemble Prompt (Formula)
          </button>
          
          <button
            onClick={handleAI_Enhance}
            disabled={isLoading}
            className="flex-1 py-4 bg-accent-yellow hover:bg-white text-bg-primary font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing Prompt...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Refine with Gemini AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-5 flex flex-col h-full gap-6">
        {/* Output Prompt */}
        <div className="bg-bg-secondary border border-border-subtle p-6 md:p-8 rounded-[2rem] flex flex-col flex-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-yellow/5 blur-[50px] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-accent-yellow">Compiled Prompt Engine v1.0</span>
            {assembledPrompt && (
              <button 
                onClick={handleCopy}
                className="p-2 bg-bg-primary rounded-xl text-text-secondary hover:text-accent-yellow transition-colors border border-border-subtle"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center min-h-[180px] p-6 bg-bg-primary/50 border border-border-subtle rounded-2xl relative group">
            <AnimatePresence mode="wait">
              {assembledPrompt ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <p className="text-sm md:text-base font-mono text-text-primary leading-relaxed selection:bg-accent-yellow/20 italic">
                    "{assembledPrompt}"
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  className="text-center text-text-secondary/50 space-y-3"
                >
                  <div className="w-12 h-12 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto border border-border-subtle">
                    <ImageIcon className="w-5 h-5 opacity-45" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">Prompt output will appear here</p>
                  <p className="text-[9px] font-medium max-w-[200px] mx-auto leading-relaxed">Isi Action dan Location di sebelah kiri, lalu tekan salah satu tombol assemble.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 pt-5 border-t border-border-subtle/50 space-y-3">
            <div className="flex items-center gap-2.5 text-[9px] font-black uppercase text-text-secondary tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow" /> Formula Format
            </div>
            <p className="text-[10px] font-mono text-text-secondary/70 bg-bg-tertiary/50 p-3 rounded-lg border border-border-subtle/40 overflow-x-auto leading-relaxed whitespace-pre-wrap">
              [Shot framing and motion] of [Action] at [Location], illuminated by [Lighting], showcasing a [Style] aesthetic.
            </p>
          </div>
        </div>

        {/* Pro tips card */}
        <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] text-xs space-y-3">
          <p className="font-display font-black uppercase tracking-widest text-accent-yellow text-[10px] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> PRO TIPS
          </p>
          <ul className="space-y-2 text-text-secondary font-medium list-disc list-inside">
            <li>Gunakan <strong className="text-white">Gemini AI Refine</strong> apabila menulis Action dalam Bahasa Indonesia agar diterjemahkan secara otomatis.</li>
            <li>Prompt di atas dikonfigurasi untuk <strong className="text-white">Midjourney, DALL-E 3 & Gemini Image Tool</strong>.</li>
            <li>Tekan tombol copy dan langsung pakai prompt di AI Image Generator favorit Anda.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
