import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Film, 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  Sliders, 
  Play, 
  Compass, 
  History, 
  Trash2, 
  Video, 
  Camera, 
  Eye, 
  ArrowRight,
  Clapperboard,
  Save,
  User,
  Globe,
  X,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface CharacterBlueprint {
  id: string;
  name: string;
  details: string;
  isCustom?: boolean;
}

export interface PlaceBlueprint {
  id: string;
  name: string;
  details: string;
  isCustom?: boolean;
}

const PRESET_CHARACTERS: CharacterBlueprint[] = [
  {
    id: 'char-1',
    name: 'Andi (Cyber-Techwear Batik)',
    details: 'Andi, a young Indonesian tech innovator with a sharp sporty crewcut, sporting active rectangular luminescent smart-glasses, wearing a modern techwear dark jacket seamlessly trimmed with glowing neon-yellow cybernetic batik parang patterns',
    isCustom: false
  },
  {
    id: 'char-2',
    name: 'Rian (Classic Indonesian Officer)',
    details: 'Rian, an Indonesian civil servant in his late 20s, with short parted neat black hair, clean-shaven friendly face, round metal-framed glasses, wearing a light-brown khaki short-sleeve uniform with a subtle ID badge pinned on his chest pocket',
    isCustom: false
  },
  {
    id: 'char-3',
    name: 'Rara (Cosmic Astronaut Painter)',
    details: 'Rara, an artistic Javanese female with dye-purplish shoulder-length wavy hair, wearing a paint-splattered retro-futuristic silver spacesuit decorated with traditional cloud-motif mega mendung patches, holding a glowing stylus under her arm',
    isCustom: false
  },
  {
    id: 'char-4',
    name: 'Owan (Rebel Orange Tabby Cat)',
    details: 'Owan, a mischievous chunky Indonesian orange domestic cat wearing a tattered tiny red pirate bandana around his neck, displaying highly detailed fluffy yellow-orange fur textures, bright adventurous green eyes',
    isCustom: false
  }
];

const PRESET_PLACES: PlaceBlueprint[] = [
  {
    id: 'place-1',
    name: 'Warkop Angkasa 2099',
    details: 'inside an cozy traditional Indonesian street coffee stall floating on a neon cyberpunk platform above cyber-Jakarta, filled with steam rising from steel kettle pots, warm glowing incandescent bulbs, wooden benches, holographic street advertisements, and a sprawling sci-fi metropolis below in the foggy night sky',
    isCustom: false
  },
  {
    id: 'place-2',
    name: 'Candi Mistis Borobudur',
    details: 'against the backdrop of ancient stone temple ruins inspired by Borobudur, shrouded in deep, mystical morning mist, surrounded by glowing blue wild mushrooms, with ancient stone relief carvings and massive floating step-pyramid structures emitting soft celestial teal runic glyphs',
    isCustom: false
  },
  {
    id: 'place-3',
    name: 'Warteg Retro-Futuristic',
    details: 'inside a vibrant futuristic Warteg food stall, with glowing warm-yellow glass displays filled with holographic Indonesian food plates, neon-lined wood counters, traditional colorful plastic crackers jars on rustic stools under flickering cybernetic light bars',
    isCustom: false
  },
  {
    id: 'place-4',
    name: 'Hutan Kosmis Nusantara',
    details: 'deep within a lush bioluminescent Indonesian tropical jungle at midnight, with glowing bamboo groves, giant tropical banana leaves emitting purple light, floating yellow spores from ancient Banyan trees, and a crystalline glowing neon-blue stream flowing over mossy pebbles',
    isCustom: false
  }
];

const SHOT_FRAMINGS = [
  'Wide-angle tracking shot',
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
  '3D/Pixar style',
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

const ACTION_EXAMPLES = [
  { label: 'Minum Kopi', value: 'sitting quietly, drinking steaming hot coffee from a traditional glass' },
  { label: 'Mengelas Robot', value: 'intently welding a complex metallic circuit with neon sparks flying' },
  { label: 'Tersenyum', value: 'looking directly into the camera and smiling bright' },
  { label: 'Di Tengah Hujan', value: 'standing calmly with black umbrella with rain drops washing off neon lights' }
];

const BACKDROP_EXAMPLES = [
  { label: 'Gerimis', value: 'with soft warm drizzle creating gorgeous wet rain reflections' },
  { label: 'Pelangi', value: 'featuring an ethereal glowing colorful cosmic aurora arching across the sky' },
  { label: 'Ramai', value: 'with blurred silhouettes of futuristic Indonesian citizens passing by' }
];

interface VisualEngineResult {
  title: string;
  image_prompt: string;
  motion_prompt: string;
  negative_prompt: string;
  metadata: {
    genre: string;
    style: string;
    camera_shot: string;
    camera_angle: string;
    lens: string;
    lighting: string;
    mood: string;
    environment: string;
    motion_style: string;
  };
}

export default function VisualEngineUI({ user }: { user: any }) {
  const [generationMode, setGenerationMode] = useState<'formula' | 'gemini' | 'nvidia'>('formula');
  const [concept, setConcept] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<VisualEngineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<VisualEngineResult[]>([]);
  const [savingContent, setSavingContent] = useState(false);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  // --- Formula Builder States ---
  const [characters, setCharacters] = useState<CharacterBlueprint[]>(() => {
    try {
      const saved = localStorage.getItem('davs_character_blueprints');
      if (saved) {
        return [...PRESET_CHARACTERS, ...JSON.parse(saved)];
      }
    } catch (_) {}
    return PRESET_CHARACTERS;
  });

  const [places, setPlaces] = useState<PlaceBlueprint[]>(() => {
    try {
      const saved = localStorage.getItem('davs_place_blueprints');
      if (saved) {
        return [...PRESET_PLACES, ...JSON.parse(saved)];
      }
    } catch (_) {}
    return PRESET_PLACES;
  });

  const [selectedCharId, setSelectedCharId] = useState<string>('none');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('none');
  const [shot, setShot] = useState(SHOT_FRAMINGS[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [lighting, setLighting] = useState(LIGHTINGS[0]);
  const [location, setLocation] = useState('');
  const [action, setAction] = useState('');
  
  const [isRefining, setIsRefining] = useState(false);

  // --- Modal Blueprints Drawers states ---
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [manageTab, setManageTab] = useState<'chars' | 'places'>('chars');
  const [newCharName, setNewCharName] = useState('');
  const [newCharDetails, setNewCharDetails] = useState('');
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceDetails, setNewPlaceDetails] = useState('');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const selectedChar = characters.find(c => c.id === selectedCharId);
  const selectedPlace = places.find(p => p.id === selectedPlaceId);

  // Helper to construct manual formula prompt
  const assembleLiteralPrompt = () => {
    let actPart = action.trim();
    let charPrefix = '';
    
    if (selectedChar && selectedCharId !== 'none') {
      charPrefix = `${selectedChar.details}`;
      if (!actPart) {
        actPart = 'stands confidently looking ahead';
      }
    } else {
      charPrefix = actPart || '[Action/Subject]';
      actPart = '';
    }

    const mainSubject = actPart ? `${charPrefix}, ${actPart}` : charPrefix;

    let locPart = location.trim();
    let placePrefix = '';

    if (selectedPlace && selectedPlaceId !== 'none') {
      placePrefix = `${selectedPlace.details}`;
      if (locPart) {
        locPart = `with additional surroundings: ${locPart}`;
      }
    } else {
      placePrefix = locPart || '[Location/Environment]';
      locPart = '';
    }

    const mainBackdrop = locPart ? `${placePrefix}, ${locPart}` : placePrefix;

    return `${shot} of ${mainSubject} at ${mainBackdrop}, illuminated by ${lighting}, showcasing a ${style} aesthetic.`;
  };

  const handleAssembleFormula = () => {
    const hasChar = selectedCharId !== 'none';
    const hasPlace = selectedPlaceId !== 'none';
    const hasActionDesc = action.trim().length > 0;
    const hasLocDesc = location.trim().length > 0;

    if (!hasChar && !hasActionDesc) {
      setError('Silakan tentukan Karakter Blueprint atau tulis detail subyek terlebih dahulu.');
      return;
    }
    if (!hasPlace && !hasLocDesc) {
      setError('Silakan tentukan Latar Blueprint atau tulis detail latar terlebih dahulu.');
      return;
    }

    setError(null);
    const literalPrompt = assembleLiteralPrompt();

    const assembledResult: VisualEngineResult = {
      title: selectedCharId !== 'none' && selectedChar ? `${selectedChar.name} Scene` : 'Formula Assembled Scene',
      image_prompt: literalPrompt,
      motion_prompt: `Cinematic panning cinematic action shot, tracking ${shot.toLowerCase()}, ${lighting.toLowerCase()}, matching ${style.toLowerCase()} art direction, realistic physics simulation.`,
      negative_prompt: "deformed, bad anatomy, bad quality, low resolution, extra limb, blurry, watermarks, signatures, chaotic background",
      metadata: {
        genre: "Cinematic Scene",
        style: style,
        camera_shot: shot,
        camera_angle: "Eye level",
        lens: "Anamorphic 35mm",
        lighting: lighting,
        mood: "Atmospheric",
        environment: selectedPlaceId !== 'none' && selectedPlace ? selectedPlace.name : 'Scenic Set',
        motion_style: "Dynamic Panning"
      }
    };

    setResult(assembledResult);
    setIsSavedSuccessfully(false);
    saveToHistory(assembledResult);
  };

  const handleAIRefineFormula = async (providerOverride?: 'gemini' | 'nvidia') => {
    const hasChar = selectedCharId !== 'none';
    const hasPlace = selectedPlaceId !== 'none';
    const hasActionDesc = action.trim().length > 0;
    const hasLocDesc = location.trim().length > 0;

    if (!hasChar && !hasActionDesc) {
      setError('Silakan tentukan Karakter Blueprint atau tulis detail subyek terlebih dahulu.');
      return;
    }
    if (!hasPlace && !hasLocDesc) {
      setError('Silakan tentukan Latar Blueprint atau tulis detail latar terlebih dahulu.');
      return;
    }

    setIsRefining(true);
    setError(null);
    setResult(null);

    const basePrompt = assembleLiteralPrompt();
    const activeProvider = providerOverride || 'gemini';

    try {
      const response = await fetch('/api/ai/visual-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: `Refine and compile this formula structure into deep filmmaking prompt parameters:\n"${basePrompt}"\nCharacter: ${selectedChar?.details || "None"}\nEnvironment: ${selectedPlace?.details || "None"}`,
          provider: activeProvider
        })
      });

      if (!response.ok) {
        throw new Error('AI Server call failed.');
      }

      const data = await response.json();
      setResult(data);
      setIsSavedSuccessfully(false);
      saveToHistory(data);
    } catch (err: any) {
      console.error(err);
      setError('Gagal menghubungkan ke AI. Menggunakan rancangan literal sebagai fallback.');
      
      const literalResult: VisualEngineResult = {
        title: selectedCharId !== 'none' && selectedChar ? `${selectedChar.name} Scene` : 'Formula Assembled Scene',
        image_prompt: basePrompt,
        motion_prompt: `Cinematic panning cinematic action shot, tracking ${shot.toLowerCase()}, ${lighting.toLowerCase()}, matching ${style.toLowerCase()} art direction, realistic physics simulation.`,
        negative_prompt: "deformed, bad anatomy, bad quality, low resolution, extra limb, blurry, watermarks, signatures",
        metadata: {
          genre: "Cinematic Scene",
          style: style,
          camera_shot: shot,
          camera_angle: "Eye level",
          lens: "Anamorphic 35mm",
          lighting: lighting,
          mood: "Atmospheric (Fallback)",
          environment: selectedPlaceId !== 'none' && selectedPlace ? selectedPlace.name : 'Scenic Set',
          motion_style: "Dynamic Panning"
        }
      };
      setResult(literalResult);
      saveToHistory(literalResult);
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateAI = async (provider: 'gemini' | 'nvidia') => {
    if (!concept.trim()) {
      setError('Silakan masukkan konsep atau visual intent Anda terlebih dahulu.');
      return;
    }

    setGenerating(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/ai/visual-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: concept.trim(),
          provider: provider === 'nvidia' ? 'nvidia-nemotron' : 'gemini'
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal memproses visual engine.");
      }

      const data = await response.json();
      setResult(data);
      setIsSavedSuccessfully(false);
      saveToHistory(data);
    } catch (err: any) {
      console.error("Visual Engine prompt generation failed:", err);
      setError(err.message || "Maaf, ada kendala saat menghubungi mesin AI. Silakan coba lagi.");
    } finally {
      setGenerating(false);
    }
  };

  const handleAddCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim() || !newCharDetails.trim()) return;

    const newChar: CharacterBlueprint = {
      id: `custom-char-${Date.now()}`,
      name: `${newCharName.trim()} (Custom)`,
      details: newCharDetails.trim(),
      isCustom: true
    };

    const updated = [...characters, newChar];
    setCharacters(updated);
    
    const customOnly = updated.filter(c => c.isCustom);
    localStorage.setItem('davs_character_blueprints', JSON.stringify(customOnly));

    setSelectedCharId(newChar.id);
    setNewCharName('');
    setNewCharDetails('');
    setSaveSuccess(`Karakter "${newChar.name}" disimpan ke library!`);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleAddPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName.trim() || !newPlaceDetails.trim()) return;

    const newPlace: PlaceBlueprint = {
      id: `custom-place-${Date.now()}`,
      name: `${newPlaceName.trim()} (Custom)`,
      details: newPlaceDetails.trim(),
      isCustom: true
    };

    const updated = [...places, newPlace];
    setPlaces(updated);
    
    const customOnly = updated.filter(p => p.isCustom);
    localStorage.setItem('davs_place_blueprints', JSON.stringify(customOnly));

    setSelectedPlaceId(newPlace.id);
    setNewPlaceName('');
    setNewPlaceDetails('');
    setSaveSuccess(`Tempat "${newPlace.name}" disimpan ke library!`);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleDeleteCharacter = (id: string) => {
    const updated = characters.filter(c => c.id !== id);
    setCharacters(updated);
    const customOnly = updated.filter(c => c.isCustom);
    localStorage.setItem('davs_character_blueprints', JSON.stringify(customOnly));
    if (selectedCharId === id) setSelectedCharId('none');
  };

  const handleDeletePlace = (id: string) => {
    const updated = places.filter(p => p.id !== id);
    setPlaces(updated);
    const customOnly = updated.filter(p => p.isCustom);
    localStorage.setItem('davs_place_blueprints', JSON.stringify(customOnly));
    if (selectedPlaceId === id) setSelectedPlaceId('none');
  };

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(`visual_engine_history_${user?.uid || 'guest'}`);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    try {
      const pendingVisualPrompt = localStorage.getItem('analyzer_visual_prompt');
      if (pendingVisualPrompt) {
        setConcept(pendingVisualPrompt);
        setGenerationMode('gemini');
        localStorage.removeItem('analyzer_visual_prompt');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveToHistory = (newResult: VisualEngineResult) => {
    try {
      const updatedHistory = [
        newResult,
        ...history.filter(item => item.title !== newResult.title)
      ].slice(0, 15);
      
      setHistory(updatedHistory);
      localStorage.setItem(`visual_engine_history_${user?.uid || 'guest'}`, JSON.stringify(updatedHistory));
    } catch (e) {
      console.error(e);
    }
  };

  const clearHistory = () => {
    if (confirm("Hapus semua history Visual Engine Anda?")) {
      setHistory([]);
      localStorage.removeItem(`visual_engine_history_${user?.uid || 'guest'}`);
    }
  };

  const handleSaveToFirebase = async () => {
    if (!result || !user) return;
    setSavingContent(true);
    setIsSavedSuccessfully(false);
    setError(null);

    try {
      await addDoc(collection(db, 'saved_contents'), {
        user_id: user.uid,
        topic: concept || result.title,
        type: 'visual_engine',
        headline: result.title,
        caption: result.image_prompt,
        motion_prompt: result.motion_prompt,
        negative_prompt: result.negative_prompt,
        metadata: result.metadata,
        generated_image_url: '',
        created_at: serverTimestamp()
      });
      setIsSavedSuccessfully(true);
    } catch (err: any) {
      console.error(err);
      setError("Gagal menyimpan ke saved content.");
    } finally {
      setSavingContent(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const starterConcepts = [
    "samurai cyberpunk di hujan deras",
    "steampunk airship sailing through golden clouds, sunset flare",
    "ancient cathedral reclaimed by a glowing fantasy forest",
    "surreal cosmic astronaut floating in a sea of liquid lavender",
    "atmospheric dark film noir detective standing in foggy docks",
    "futuristic cyberpunk cyber-organic orchid greenhouse macro shot"
  ];

  return (
    <div id="visual-engine-container" className="space-y-12">
      {/* Intro Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-bg-secondary via-bg-secondary to-bg-tertiary border border-border-subtle p-8 md:p-12 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-[50%] h-full bg-accent-yellow/5 blur-[120px] pointer-events-none" />
        <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-tr from-accent-yellow/20 to-accent-yellow/5 rounded-[2rem] flex items-center justify-center shrink-0 border border-accent-yellow/25 shadow-lg shadow-accent-yellow/10">
          <Film className="w-8 h-8 md:w-12 md:h-12 text-accent-yellow" />
        </div>
        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-accent-yellow/10 text-accent-yellow text-[9px] font-black tracking-widest rounded-full border border-accent-yellow/20 uppercase">
            <Sparkles className="w-3 h-3 animate-pulse" /> PREMIUM CINEMA SYSTEM
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight uppercase">VISUAL ENGINE</h2>
          <p className="text-text-secondary text-xs sm:text-sm font-sans max-w-xl opacity-80 leading-relaxed">
            Kompiler Prompt Sinematik Pro. Rancang menggunakan blueprint formula terstruktur, kecerdasan Gemini, atau arsitektur NVIDIA API.
          </p>
        </div>
      </motion.div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Workspace Left Option Controls */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className="grid grid-cols-3 bg-bg-secondary p-1 border border-border-subtle rounded-2xl gap-1">
            <button
              onClick={() => { setGenerationMode('formula'); setError(null); }}
              className={cn(
                "py-3 text-[9px] sm:text-[10px] font-black rounded-xl uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center",
                generationMode === 'formula' ? "bg-accent-yellow text-bg-primary font-black shadow" : "text-text-secondary hover:text-white"
              )}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Formula</span>
            </button>
            <button
              onClick={() => { setGenerationMode('gemini'); setError(null); }}
              className={cn(
                "py-3 text-[9px] sm:text-[10px] font-black rounded-xl uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center",
                generationMode === 'gemini' ? "bg-accent-yellow text-bg-primary font-black shadow" : "text-text-secondary hover:text-white"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini</span>
            </button>
            <button
              onClick={() => { setGenerationMode('nvidia'); setError(null); }}
              className={cn(
                "py-3 text-[9px] sm:text-[10px] font-black rounded-xl uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center",
                generationMode === 'nvidia' ? "bg-accent-yellow text-bg-primary font-black shadow" : "text-text-secondary hover:text-white"
              )}
            >
              <Play className="w-3.5 h-3.5" />
              <span>NVIDIA</span>
            </button>
          </div>

          <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-yellow/[0.03] blur-[40px] pointer-events-none" />

            {error && (
              <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold leading-normal">
                ⚠️ {error}
              </div>
            )}

            {/* Formula Composition Mode */}
            {generationMode === 'formula' ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-border-subtle/30 pb-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1">
                    ⚙️ Blueprint Constructor Workspace
                  </span>
                  <button
                    onClick={() => { setManageTab('chars'); setIsManageOpen(true); }}
                    className="text-[9px] bg-bg-tertiary border border-border-subtle hover:border-accent-yellow/20 px-2.5 py-1.5 rounded-lg text-text-secondary hover:text-white font-bold uppercase transition"
                  >
                    Manage Library
                  </button>
                </div>

                {/* Character Selection */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-secondary">
                    <label className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-accent-yellow" /> Character Blueprint</label>
                    <span onClick={() => { setManageTab('chars'); setIsManageOpen(true); }} className="text-accent-yellow hover:underline cursor-pointer">Add New</span>
                  </div>
                  <select
                    value={selectedCharId}
                    onChange={(e) => setSelectedCharId(e.target.value)}
                    className="w-full bg-bg-tertiary border border-border-subtle hover:border-accent-yellow/30 rounded-xl p-2.5 text-xs text-white cursor-pointer font-bold outline-none"
                  >
                    <option value="none">-- TANPA BLUEPRINT (Bebas) --</option>
                    <optgroup label="Preset Blueprints">
                      {characters.filter(c => !c.isCustom).map(char => (
                        <option key={char.id} value={char.id}>🧑‍🚀 {char.name}</option>
                      ))}
                    </optgroup>
                    {characters.some(c => c.isCustom) && (
                      <optgroup label="Custom Blueprints">
                        {characters.filter(c => c.isCustom).map(char => (
                          <option key={char.id} value={char.id}>⭐️ {char.name}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  {selectedCharId !== 'none' && selectedChar && (
                    <div className="p-3 bg-bg-tertiary/40 border border-border-subtle rounded-xl text-[10px] text-text-secondary font-mono italic">
                      "{selectedChar.details}"
                    </div>
                  )}
                </div>

                {/* Action/Pose Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                    🔥 Action / Pose Detail
                  </label>
                  <textarea
                    rows={2}
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="Contoh: berdiri tersenyum, menatap tajam ke arah kamera..."
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3 outline-none focus:border-accent-yellow text-xs resize-none text-white placeholder-text-secondary/40 font-sans"
                  />
                  <div className="flex flex-wrap gap-1">
                    {ACTION_EXAMPLES.map((ex, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAction(ex.value)}
                        className="px-2 py-1 bg-bg-tertiary text-[9px] text-text-secondary hover:text-white rounded-md border border-border-subtle"
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Place Selection */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-secondary">
                    <label className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-accent-yellow" /> Scene Backdrop / Environment</label>
                    <span onClick={() => { setManageTab('places'); setIsManageOpen(true); }} className="text-accent-yellow hover:underline cursor-pointer">Add New</span>
                  </div>
                  <select
                    value={selectedPlaceId}
                    onChange={(e) => setSelectedPlaceId(e.target.value)}
                    className="w-full bg-bg-tertiary border border-border-subtle hover:border-accent-yellow/30 rounded-xl p-2.5 text-xs text-white cursor-pointer font-bold outline-none"
                  >
                    <option value="none">-- TANPA BLUEPRINT (Bebas) --</option>
                    <optgroup label="Preset Places">
                      {places.filter(p => !p.isCustom).map(place => (
                        <option key={place.id} value={place.id}>🗺️ {place.name}</option>
                      ))}
                    </optgroup>
                    {places.some(p => p.isCustom) && (
                      <optgroup label="Custom Places">
                        {places.filter(p => p.isCustom).map(place => (
                          <option key={place.id} value={place.id}>⭐️ {place.name}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  {selectedPlaceId !== 'none' && selectedPlace && (
                    <div className="p-3 bg-bg-tertiary/40 border border-border-subtle rounded-xl text-[10px] text-text-secondary font-mono italic">
                      "{selectedPlace.details}"
                    </div>
                  )}
                </div>

                {/* Atmosphere Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                    ⛅️ Additional Backdrop Detail / Weather
                  </label>
                  <textarea
                    rows={2}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Contoh: rintik hujan lembut, kabut tebal, dsb."
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3 outline-none focus:border-accent-yellow text-xs resize-none text-white placeholder-text-secondary/40 font-sans"
                  />
                  <div className="flex flex-wrap gap-1">
                    {BACKDROP_EXAMPLES.map((ex, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLocation(ex.value)}
                        className="px-2 py-1 bg-bg-tertiary text-[9px] text-text-secondary hover:text-white rounded-md border border-border-subtle"
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cam Specs dropdowns */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Framing</label>
                    <select
                      value={shot}
                      onChange={(e) => setShot(e.target.value)}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-lg p-2 text-[10px] text-white font-bold outline-none"
                    >
                      {SHOT_FRAMINGS.map((sh, idx) => (
                        <option key={idx} value={sh}>{sh}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Lighting</label>
                    <select
                      value={lighting}
                      onChange={(e) => setLighting(e.target.value)}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-lg p-2 text-[10px] text-white font-bold outline-none"
                    >
                      {LIGHTINGS.map((li, idx) => (
                        <option key={idx} value={li}>{li}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Art Style</label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-lg p-2 text-[10px] text-white font-bold outline-none"
                    >
                      {STYLES.map((st, idx) => (
                        <option key={idx} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Manual & Refine Trigger Action Panel */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-subtle/40">
                  <button
                    type="button"
                    onClick={handleAssembleFormula}
                    className="py-3 bg-bg-tertiary hover:bg-bg-primary text-white border border-border-subtle font-black text-[9px] uppercase tracking-wider rounded-xl transition cursor-pointer"
                  >
                    Assemble Instan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAIRefineFormula()}
                    className="py-3 bg-accent-yellow hover:bg-white text-bg-primary font-black text-[9px] uppercase tracking-wider rounded-xl transition cursor-pointer animate-none"
                  >
                    AI Refine Formula
                  </button>
                </div>
              </div>
            ) : (
              // AI API Input Mode (Gemini and NVIDIA)
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle/30">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                    {generationMode === 'nvidia' ? '🟢 Nvidia Prompt Engine' : '🔮 Gemini Prompt Engine'}
                  </span>
                  <span className="px-2 py-0.5 bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20 rounded-md text-[8px] font-black uppercase">
                    ACTIVE
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-primary">
                    Visual Intent / Gagasan Cerita
                  </label>
                  <textarea
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="Ceritakan dengan deskripsi singkat... (contoh: cyberpunk warteg bernuansa lampu neon kuning lembab, hujan rintik di kaca jendela)"
                    rows={4}
                    className="w-full bg-bg-tertiary border border-border-subtle hover:border-accent-yellow/30 focus:border-accent-yellow rounded-xl p-3 text-xs leading-normal font-sans outline-none text-white resize-none transition"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleGenerateAI(generationMode === 'nvidia' ? 'nvidia' : 'gemini')}
                  className={cn(
                    "w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] flex justify-center items-center gap-1.5 transition-all outline-none",
                    !concept.trim()
                      ? "bg-bg-tertiary text-text-secondary border border-border-subtle cursor-not-allowed"
                      : "bg-accent-yellow text-bg-primary hover:scale-[1.01]"
                  )}
                >
                  <Play className="w-3.5 h-3.5 text-bg-primary fill-bg-primary" />
                  Compile dengan {generationMode === 'nvidia' ? 'NVIDIA Nemotron' : 'Gemini AI'}
                </button>

                <div className="pt-3 border-t border-border-subtle/30 space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 opacity-80">
                    <Compass className="w-3.5 h-3.5 text-accent-yellow/60" />
                    Inspirasi Cepat
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {starterConcepts.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => setConcept(preset)}
                        className="px-2 py-1.5 bg-bg-tertiary hover:bg-bg-primary border border-border-subtle hover:border-accent-yellow/30 text-[9px] text-text-secondary rounded-lg transition"
                      >
                        "{preset}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* History Lists */}
          {history.length > 0 && (
            <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] shadow-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" /> Recent History ({history.length})
                </span>
                <span onClick={clearHistory} className="text-[9px] font-black text-text-secondary hover:text-red-400 cursor-pointer">Clear</span>
              </div>

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                {history.map((hist, idx) => (
                  <button
                    key={idx}
                    onClick={() => setResult(hist)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between",
                      result?.title === hist.title ? "bg-accent-yellow/5 border-accent-yellow/20 text-accent-yellow" : "bg-bg-tertiary border-border-subtle hover:border-accent-yellow/10"
                    )}
                  >
                    <div className="truncate pr-2">
                      <p className="text-[10px] font-black uppercase truncate">{hist.title}</p>
                      <p className="text-[9px] text-text-secondary font-mono truncate">{hist.metadata.style} • {hist.metadata.lighting}</p>
                    </div>
                    <ArrowRight className="w-3 h-3 text-text-secondary shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Workspace Right Result Dashboard */}
        <div className="lg:col-span-12 xl:col-span-7">
          <AnimatePresence mode="wait">
            {generating || isRefining ? (
              <motion.div
                key="loading-compiler"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-bg-secondary border border-border-subtle rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center min-h-[460px] shadow-2xl"
              >
                <Loader2 className="w-10 h-10 text-accent-yellow mb-4 animate-spin" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Synthesizing Prompt Blueprint...</h3>
                <p className="text-text-secondary text-[11px] leading-relaxed max-w-xs mt-2 font-mono">
                  {isRefining ? "[PROD_ENG_CONNECT] Slicing formula components..." : "[AI_CONNECT] Constructing cinema camera parameters and visual vectors..."}
                </p>
              </motion.div>
            ) : result ? (
              <motion.div
                key="display-recipe"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-bg-secondary border border-border-subtle rounded-[2.5rem] p-6 sm:p-8 space-y-5 shadow-2xl overflow-hidden"
              >
                {/* Result Info Title */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-border-subtle/30 pb-3">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20 text-[8px] font-black tracking-widest rounded uppercase">
                      <Clapperboard className="w-2.5 h-2.5 animate-pulse" /> Compiled Scene Blueprint
                    </div>
                    <h3 className="text-lg font-black uppercase text-accent-yellow leading-tight tracking-tight truncate max-w-full mt-1.5">
                      {result.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {user && (
                      <button
                        onClick={handleSaveToFirebase}
                        disabled={savingContent}
                        className={cn(
                          "px-3 py-1.5 border rounded-lg font-black text-[9px] uppercase transition flex items-center gap-1 outline-none cursor-pointer",
                          isSavedSuccessfully ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-bg-tertiary border-border-subtle hover:border-accent-yellow/30 hover:text-accent-yellow"
                        )}
                      >
                        <Save className="w-3 h-3" />
                        {savingContent ? "Saving" : isSavedSuccessfully ? "Saved" : "Save Content"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub Metadata Parameters Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(result.metadata).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="bg-bg-tertiary/30 border border-border-subtle/60 p-2.5 rounded-xl">
                      <p className="text-[8px] font-black uppercase text-text-secondary tracking-widest truncate">{key.replace('_', ' ')}</p>
                      <p className="text-[9px] font-black text-white capitalize mt-0.5 truncate">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-bg-tertiary/40 border border-border-subtle p-3 rounded-xl flex items-center gap-3">
                  <Film className="w-4 h-4 text-accent-yellow shrink-0" />
                  <p className="text-[9px] text-text-secondary leading-normal">
                    Fokus pada instruksi kamera tingkat tinggi. Salin prompt terstruktur di bawah ini ke Midjourney, Stable Diffusion XL, Sora, atau Runway.
                  </p>
                </div>

                {/* Rendered Prompt 1: Image Prompt */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-secondary">
                    <span className="flex items-center gap-1.5"><Camera className="w-3.5 h-3.5 text-accent-yellow" /> 1. Image Prompt (Midjourney / SDXL)</span>
                    <button
                      onClick={() => copyToClipboard(result.image_prompt, 'img_p')}
                      className="text-[9px] text-accent-yellow hover:underline flex items-center gap-1"
                    >
                      {copied === 'img_p' ? "Tersalin " : "Salin Prompt"}
                    </button>
                  </div>
                  <div className="p-3.5 bg-bg-tertiary border border-border-subtle rounded-xl text-xs font-sans text-text-secondary font-semibold italic">
                    "{result.image_prompt}"
                  </div>
                </div>

                {/* Rendered Prompt 2: Motion Prompt */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-secondary">
                    <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5 text-accent-yellow" /> 2. Motion Prompt (Sora / Luma / Runway)</span>
                    <button
                      onClick={() => copyToClipboard(result.motion_prompt, 'mot_p')}
                      className="text-[9px] text-accent-yellow hover:underline flex items-center gap-1"
                    >
                      {copied === 'mot_p' ? "Tersalin " : "Salin Prompt"}
                    </button>
                  </div>
                  <div className="p-3.5 bg-bg-tertiary border border-border-subtle rounded-xl text-xs font-sans text-text-secondary font-semibold italic">
                    "{result.motion_prompt}"
                  </div>
                </div>

                {/* Rendered Prompt 3: Negative Attributes */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-secondary">
                    <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-red-500" /> 3. Negative Prompt (Avoidance)</span>
                    <button
                      onClick={() => copyToClipboard(result.negative_prompt, 'neg_p')}
                      className="text-[9px] text-accent-yellow hover:underline flex items-center gap-1"
                    >
                      {copied === 'neg_p' ? "Tersalin " : "Salin Prompt"}
                    </button>
                  </div>
                  <div className="p-3 bg-bg-tertiary/40 border border-border-subtle rounded-xl text-xs font-mono text-text-secondary opacity-75">
                    {result.negative_prompt}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-bg-secondary/40 border border-dashed border-border-subtle rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center min-h-[460px]"
              >
                <div className="w-12 h-12 bg-bg-tertiary border border-border-subtle rounded-full flex items-center justify-center mb-4">
                  <Play className="w-5 h-5 text-text-secondary opacity-40" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary opacity-50">Silakan Compile Konsep Visual</h3>
                <p className="text-[11px] text-text-secondary/60 leading-relaxed max-w-xs mt-1.5">
                  Rakit formula blueprint sinematik terstruktur atau biarkan kecerdasan Gemini &amp; NVIDIA API meracik resep visual pro Anda.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Blueprint Library Management Drawer Overlay */}
      <AnimatePresence>
        {isManageOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg-primary/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-bg-secondary border border-border-subtle rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Overlay Modal Header */}
              <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-accent-yellow" />
                  <h3 className="text-sm font-black uppercase text-white tracking-widest">Library Blueprint Manager</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsManageOpen(false)}
                  className="p-1 px-2.5 bg-bg-tertiary hover:bg-bg-primary border border-border-subtle hover:border-red-500/20 text-text-secondary hover:text-red-400 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Tutup
                </button>
              </div>

              {/* Success Notification Alert */}
              {saveSuccess && (
                <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-wider text-center">
                  ✅ {saveSuccess}
                </div>
              )}

              {/* Selection Tabs */}
              <div className="flex border-b border-border-subtle/40 bg-bg-tertiary/30 px-6 pt-3 gap-2">
                <button
                  type="button"
                  onClick={() => setManageTab('chars')}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition cursor-pointer",
                    manageTab === 'chars' ? "border-accent-yellow text-accent-yellow" : "border-transparent text-text-secondary hover:text-white"
                  )}
                >
                  🧑‍🚀 Karakter Blueprint ({characters.length})
                </button>
                <button
                  type="button"
                  onClick={() => setManageTab('places')}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition cursor-pointer",
                    manageTab === 'places' ? "border-accent-yellow text-accent-yellow" : "border-transparent text-text-secondary hover:text-white"
                  )}
                >
                  🗺️ Tempat Blueprint ({places.length})
                </button>
              </div>

              {/* Scrollable Container Panels */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {manageTab === 'chars' ? (
                  <div className="space-y-6">
                    {/* Add Character Form */}
                    <form onSubmit={handleAddCharacter} className="bg-bg-tertiary p-5 border border-border-subtle rounded-2xl space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-accent-yellow flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Registrasi Karakter Baru
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1 space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Nama Karakter</label>
                          <input
                            type="text"
                            required
                            placeholder="Andi, Rara, dsb."
                            value={newCharName}
                            onChange={(e) => setNewCharName(e.target.value)}
                            className="w-full bg-bg-primary border border-border-subtle hover:border-accent-yellow/20 rounded-xl px-3 py-2 text-xs font-sans text-white focus:border-accent-yellow transition-all outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Deskripsi Fisik Komprehensif</label>
                          <input
                            type="text"
                            required
                            placeholder="Detail pakaian, gaya rambut, aksesoris batik..."
                            value={newCharDetails}
                            onChange={(e) => setNewCharDetails(e.target.value)}
                            className="w-full bg-bg-primary border border-border-subtle hover:border-accent-yellow/20 rounded-xl px-3 py-2 text-xs font-sans text-white focus:border-accent-yellow transition-all outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-accent-yellow hover:bg-white text-bg-primary text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
                        >
                          Simpan Karakter
                        </button>
                      </div>
                    </form>

                    {/* Character Lists */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Database Karakter Terdaftar</span>
                      <div className="grid grid-cols-1 gap-2.5">
                        {characters.map(char => (
                          <div key={char.id} className="p-4 bg-bg-tertiary/60 border border-border-subtle/80 rounded-xl flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white uppercase tracking-wide">{char.name}</span>
                                {char.isCustom ? (
                                  <span className="px-1.5 py-0.5 bg-accent-yellow/10 border border-accent-yellow/25 text-accent-yellow text-[8px] font-bold rounded">CUSTOM</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-bg-primary border border-border-subtle text-text-secondary text-[8px] font-bold rounded">PRESET</span>
                                )}
                              </div>
                              <p className="text-[10px] text-text-secondary font-mono leading-relaxed italic">"{char.details}"</p>
                            </div>
                            
                            {char.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCharacter(char.id)}
                                className="p-1.5 hover:bg-red-500/10 text-text-secondary hover:text-red-500 rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Add Place Form */}
                    <form onSubmit={handleAddPlace} className="bg-bg-tertiary p-5 border border-border-subtle rounded-2xl space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-accent-yellow flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Registrasi Latar Baru
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1 space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Nama Tempat</label>
                          <input
                            type="text"
                            required
                            placeholder="Warteg Futuristik dsb."
                            value={newPlaceName}
                            onChange={(e) => setNewPlaceName(e.target.value)}
                            className="w-full bg-bg-primary border border-border-subtle hover:border-accent-yellow/20 rounded-xl px-3 py-2 text-xs font-sans text-white focus:border-accent-yellow transition-all outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Deskripsi Latar &amp; Lingkungan</label>
                          <input
                            type="text"
                            required
                            placeholder="di warung kopi neon cyber-Jakarta..."
                            value={newPlaceDetails}
                            onChange={(e) => setNewPlaceDetails(e.target.value)}
                            className="w-full bg-bg-primary border border-border-subtle hover:border-accent-yellow/20 rounded-xl px-3 py-2 text-xs font-sans text-white focus:border-accent-yellow transition-all outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-accent-yellow hover:bg-white text-bg-primary text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
                        >
                          Simpan Latar
                        </button>
                      </div>
                    </form>

                    {/* Place Lists */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Database Tempat Terdaftar</span>
                      <div className="grid grid-cols-1 gap-2.5">
                        {places.map(place => (
                          <div key={place.id} className="p-4 bg-bg-tertiary/60 border border-border-subtle/80 rounded-xl flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white uppercase tracking-wide">{place.name}</span>
                                {place.isCustom ? (
                                  <span className="px-1.5 py-0.5 bg-accent-yellow/10 border border-accent-yellow/25 text-accent-yellow text-[8px] font-bold rounded">CUSTOM</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-bg-primary border border-border-subtle text-text-secondary text-[8px] font-bold rounded">PRESET</span>
                                )}
                              </div>
                              <p className="text-[10px] text-text-secondary font-mono leading-relaxed italic">"{place.details}"</p>
                            </div>
                            
                            {place.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeletePlace(place.id)}
                                className="p-1.5 hover:bg-red-500/10 text-text-secondary hover:text-red-500 rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
              <div className="p-6 border-t border-border-subtle bg-bg-tertiary/20 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsManageOpen(false)}
                  className="px-5 py-2 bg-bg-tertiary hover:bg-bg-primary border border-border-subtle text-white font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
