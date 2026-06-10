import { useState, useEffect } from 'react';
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
  HelpCircle,
  User,
  Globe,
  Plus,
  Trash2,
  X,
  Sliders,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ImagePromptGeneratorProps {
  onGenerateAI: (prompt: string, context: string, provider: 'gemini' | 'nvidia-nemotron') => Promise<string>;
}

export interface CharacterBlueprint {
  id: string;
  name: string;
  details: string; // Detail fisik lengkap agar konsisten
  isCustom?: boolean;
}

export interface PlaceBlueprint {
  id: string;
  name: string;
  details: string; // Detail setting & atmosphere lengkap
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

const ACTION_EXAMPLES = [
  { label: 'Minum Kopi Hangat', value: 'sitting quietly, drinking steaming hot coffee from a traditional glass' },
  { label: 'Mengelas Robotika', value: 'intently welding a complex metallic circuit of a small robotic rover with neon sparks flying' },
  { label: 'Tersenyum Bahagia', value: 'looking directly into the camera and smiling bright' },
  { label: 'Berdiri di Tengah Hujan', value: 'standing calmly under a warm yellow umbrella with rain drops washing off neon lights around' }
];

const BACKDROP_EXAMPLES = [
  { label: 'Hujan Gerimis', value: 'with soft warm drizzle creating gorgeous wet rain reflections' },
  { label: 'Pelangi Malam', value: 'featuring an ethereal glowing colorful cosmic aurora arching across the night sky' },
  { label: 'Ramai & Sibuk', value: 'with blurred silhouettes of futuristic Indonesian citizens and street vendors passing by' }
];

export default function ImagePromptGenerator({ onGenerateAI }: ImagePromptGeneratorProps) {
  // --- Persistent Blueprints ---
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

  // --- Active Inputs ---
  const [shot, setShot] = useState(SHOT_FRAMINGS[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [lighting, setLighting] = useState(LIGHTINGS[0]);
  const [location, setLocation] = useState(''); // Extra backdrop details
  const [action, setAction] = useState(''); // What character is doing

  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'nvidia-nemotron'>('gemini');
  const [assembledPrompt, setAssembledPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Modal Management ---
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [manageTab, setManageTab] = useState<'chars' | 'places'>('chars');
  
  // Custom form state
  const [newCharName, setNewCharName] = useState('');
  const [newCharDetails, setNewCharDetails] = useState('');
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceDetails, setNewPlaceDetails] = useState('');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const selectedChar = characters.find(c => c.id === selectedCharId);
  const selectedPlace = places.find(p => p.id === selectedPlaceId);

  // Helper to construct lit/formulaic prompt
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

  const handleAssemble = () => {
    // Validation
    const hasChar = selectedCharId !== 'none';
    const hasPlace = selectedPlaceId !== 'none';
    const hasActionDesc = action.trim().length > 0;
    const hasLocDesc = location.trim().length > 0;

    if (!hasChar && !hasActionDesc) {
      setError('Silakan tentukan Karakter Blueprint atau tulis Action / Subject terlebih dahulu.');
      return;
    }
    if (!hasPlace && !hasLocDesc) {
      setError('Silakan tentukan Tempat Blueprint atau tulis Location / Environment terlebih dahulu.');
      return;
    }

    setError(null);
    setAssembledPrompt(assembleLiteralPrompt());
  };

  const handleAI_Enhance = async () => {
    const hasChar = selectedCharId !== 'none';
    const hasPlace = selectedPlaceId !== 'none';
    const hasActionDesc = action.trim().length > 0;
    const hasLocDesc = location.trim().length > 0;

    if (!hasChar && !hasActionDesc) {
      setError('Silakan tentukan Karakter Blueprint atau tulis Action / Subject terlebih dahulu.');
      return;
    }
    if (!hasPlace && !hasLocDesc) {
      setError('Silakan tentukan Tempat Blueprint atau tulis Location / Environment terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const basePrompt = assembleLiteralPrompt();

    let blueprintInstruction = "";
    if (selectedChar && selectedCharId !== 'none') {
      blueprintInstruction += `
CHARACTER COMPONENT TO DEPICT (CRITICAL FOR VISUAL CONSISTENCY):
- Subject Character Profile: "${selectedChar.details}"
You MUST strictly preserve and weave in all physical attributes such as hair type/styling, specific glasses description, clothing types/patterns, and distinct gadgets/accessories verbatim. Do NOT neglect or simplify these items. Andi's unique cyber batik or Rara's cloud space suit are crucial for keeping the character consistent in successive frames.`;
    }
    if (selectedPlace && selectedPlaceId !== 'none') {
      blueprintInstruction += `
LOCATION COMPONENT TO DEPICT (CRITICAL FOR SETTING CONSISTENCY):
- Backdrop Setting Profile: "${selectedPlace.details}"
You MUST strictly preserve the specific items, glowing elements, Javanese/traditional details, lighting nodes, and general layout mentioned in this environment. The architecture and background objects should look identical.`;
    }

    const systemInstruction = `
      You are an expert AI Image Generation Prompt Architect specializing in high-end engines like Midjourney v6, DALL-E 3, and Stable Diffusion XL.
      
      The user is building a visual narrative and needs consistent characters and settings across scenes. 
      Here is the raw base formula prompt: "${basePrompt}"
      ${blueprintInstruction}

      Your task:
      1. Translate any Indonesian inputs or components (Action, Location, style, lightning, shot) into highly evocative, rich, and detailed professional English suitable for image generation bots.
      2. Construct a single cohesive, highly detailed English prompt.
      3. CRITICAL FOR VISUAL CONSISTENCY: Do not dilute, change, or remove any core physical details of the selected Character Blueprint or Place Blueprint. Keep their clothes, hair, colors, and setting components strictly identical, while dynamically weaving them with the active core action context (e.g. "${action}").
      4. Avoid low-quality aesthetic fluff words (like "photorealistic", "beautiful", "high quality"). Instead describe the physical textures, photographic camera lens specification, specific lighting reflection, and realistic micro-details.
      5. Output ONLY the polished English prompt. Do NOT wrap in explanation, introductory remarks, or markdown code blocks. Just output the clean prompt block.
    `;

    try {
      const refinedText = await onGenerateAI(
        `Translate and enhance this image prompt structure into a highly detailed English prompt: "${basePrompt}"`, 
        systemInstruction,
        selectedProvider
      );

      if (refinedText) {
        const cleanText = refinedText.replace(/^["']|["']$/g, '').trim();
        setAssembledPrompt(cleanText);
      } else {
        throw new Error('AI returned an empty response.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Gagal menghubungkan ke AI. Menggunakan rancangan literal sebagai fallback.');
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

  // --- Handlers for custom blueprint creation ---
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
    
    // Save to localStorage (only the custom ones)
    const customOnly = updated.filter(c => c.isCustom);
    localStorage.setItem('davs_character_blueprints', JSON.stringify(customOnly));

    // Clear form & select it immediately
    setSelectedCharId(newChar.id);
    setNewCharName('');
    setNewCharDetails('');
    setSaveSuccess(`Karakter "${newChar.name}" berhasil disimpan ke blueprint library!`);
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
    
    // Save to localStorage (only the custom ones)
    const customOnly = updated.filter(p => p.isCustom);
    localStorage.setItem('davs_place_blueprints', JSON.stringify(customOnly));

    // Clear form & select it immediately
    setSelectedPlaceId(newPlace.id);
    setNewPlaceName('');
    setNewPlaceDetails('');
    setSaveSuccess(`Tempat "${newPlace.name}" berhasil disimpan ke blueprint library!`);
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

  return (
    <div id="image-prompt-generator-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Configuration Form */}
      <div id="config-panel-container" className="lg:col-span-7 bg-bg-secondary border border-border-subtle p-6 md:p-8 rounded-[2rem] space-y-6 relative overflow-hidden">
        
        {/* Visual glow element */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent-yellow/5 blur-[80px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-yellow/10 rounded-xl flex items-center justify-center text-accent-yellow">
              <ImageIcon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">Consistent Prompt Engine</h3>
              <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mt-1">Multi-Frame Character & Space Blueprints</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Manage blueprints button */}
            <button
              onClick={() => {
                setManageTab('chars');
                setIsManageOpen(true);
              }}
              className="px-3 py-2 bg-bg-tertiary border border-border-subtle hover:border-accent-yellow/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all text-white active:scale-95"
              title="Kelola Character & Place Blueprint"
            >
              <Sliders className="w-3.5 h-3.5 text-accent-yellow" />
              <span>Kelola Blueprint</span>
            </button>

            {/* Provider Selector */}
            <div className="flex bg-bg-tertiary p-1 rounded-xl border border-border-subtle select-none">
              <button
                type="button"
                onClick={() => setSelectedProvider('gemini')}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all",
                  selectedProvider === 'gemini'
                    ? "bg-accent-yellow text-bg-primary shadow-lg"
                    : "text-text-secondary hover:text-white"
                )}
              >
                Gemini
              </button>
              <button
                type="button"
                onClick={() => setSelectedProvider('nvidia-nemotron')}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all",
                  selectedProvider === 'nvidia-nemotron'
                    ? "bg-accent-yellow text-bg-primary shadow-lg"
                    : "text-text-secondary hover:text-white"
                )}
              >
                NVIDIA Nemotron
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div id="error-alert-banner" className="p-4 bg-red-500/10 border border-red-500/25 text-red-400 text-xs rounded-xl flex items-center gap-3">
            <HelpCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* COMPONENT 1: Character Blueprint Selector */}
        <div id="character-blueprint-section" className="p-5 bg-bg-tertiary rounded-2xl border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-accent-yellow" />
              <label className="text-xs font-black uppercase tracking-wider text-text-primary">1. Karakter Konsisten (C-Blueprint)</label>
            </div>
            <button 
              onClick={() => {
                setManageTab('chars');
                setIsManageOpen(true);
              }}
              className="text-[10px] text-accent-yellow font-black uppercase hover:underline"
            >
              + Buat Karakter Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-5">
              <select
                value={selectedCharId}
                onChange={(e) => setSelectedCharId(e.target.value)}
                className="w-full bg-bg-primary border border-border-subtle hover:border-accent-yellow/30 rounded-xl p-3 outline-none transition-all text-xs font-sans text-white cursor-pointer font-bold"
              >
                <option value="none">-- TANPA BLUEPRINT (Bebas) --</option>
                <optgroup label="Preset Karakter">
                  {characters.filter(c => !c.isCustom).map(char => (
                    <option key={char.id} value={char.id}>🧑‍🚀 {char.name}</option>
                  ))}
                </optgroup>
                {characters.some(c => c.isCustom) && (
                  <optgroup label="Custom Karakter Anda (Persistent)">
                    {characters.filter(c => c.isCustom).map(char => (
                      <option key={char.id} value={char.id}>⭐️ {char.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="md:col-span-7">
              {selectedCharId !== 'none' && selectedChar ? (
                <div className="p-3 bg-bg-primary/50 text-[10px] text-text-secondary/90 border border-border-subtle rounded-xl font-mono leading-relaxed h-14 overflow-y-auto custom-scrollbar italic relative group">
                  "{selectedChar.details}"
                  <button 
                    onClick={() => setSelectedCharId('none')}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 bg-bg-tertiary hover:bg-black rounded border border-border-subtle transition-opacity"
                    title="Deselect"
                  >
                    <X className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-bg-primary/30 text-[10px] text-text-secondary/40 border border-dashed border-border-subtle/30 rounded-xl font-mono h-14 flex items-center justify-center">
                  C-Blueprint Mati: Detail fisik subjek ditulis manual di kolom bawah.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CORE ACTION OR SUBJECT INPUT */}
        <div id="core-action-section" className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 ml-1">
              <Zap className="w-3.5 h-3.5 text-accent-yellow" /> 
              {selectedCharId !== 'none' ? "Aksi / Pose Subyek *" : "Aksi & Detail Subyek manual *"}
            </label>
            <span className="text-[9px] text-text-secondary/50 font-bold uppercase">Bisa Indonesia / Inggris</span>
          </div>
          
          <textarea
            rows={2}
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder={
              selectedCharId !== 'none' 
                ? "Tulis spesifik apa yang sedang ia lakukan... (Contoh: sedang minum kopi sambil tertawa di kursi)" 
                : "Tulis subjek dan aksinya... (Contoh: Seekor tupai kerdil memegang obeng mini di tangannya)"
            }
            className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-4 outline-none focus:border-accent-yellow transition-all text-sm font-sans resize-none text-white placeholder-text-secondary/40 shadow-inner"
          />

          {/* Action Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {ACTION_EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAction(ex.value)}
                className="px-2.5 py-1.5 bg-bg-tertiary hover:bg-bg-primary text-[9px] font-bold text-text-secondary hover:text-white border border-border-subtle hover:border-accent-yellow/30 rounded-lg transition-all"
              >
                + {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* COMPONENT 2: Place Blueprint Selector */}
        <div id="place-blueprint-section" className="p-5 bg-bg-tertiary rounded-2xl border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent-yellow" />
              <label className="text-xs font-black uppercase tracking-wider text-text-primary">2. Tempat Konsisten (L-Blueprint)</label>
            </div>
            <button 
              onClick={() => {
                setManageTab('places');
                setIsManageOpen(true);
              }}
              className="text-[10px] text-accent-yellow font-black uppercase hover:underline"
            >
              + Buat Tempat Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-5">
              <select
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="w-full bg-bg-primary border border-border-subtle hover:border-accent-yellow/30 rounded-xl p-3 outline-none transition-all text-xs font-sans text-white cursor-pointer font-bold"
              >
                <option value="none">-- TANPA BLUEPRINT (Bebas) --</option>
                <optgroup label="Preset Tempat">
                  {places.filter(p => !p.isCustom).map(place => (
                    <option key={place.id} value={place.id}>🗺️ {place.name}</option>
                  ))}
                </optgroup>
                {places.some(p => p.isCustom) && (
                  <optgroup label="Custom Tempat Anda (Persistent)">
                    {places.filter(p => p.isCustom).map(place => (
                      <option key={place.id} value={place.id}>⭐️ {place.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="md:col-span-7">
              {selectedPlaceId !== 'none' && selectedPlace ? (
                <div className="p-3 bg-bg-primary/50 text-[10px] text-text-secondary/90 border border-border-subtle rounded-xl font-mono leading-relaxed h-14 overflow-y-auto custom-scrollbar italic relative group">
                  "{selectedPlace.details}"
                  <button 
                    onClick={() => setSelectedPlaceId('none')}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 bg-bg-tertiary hover:bg-black rounded border border-border-subtle transition-opacity"
                    title="Deselect"
                  >
                    <X className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-bg-primary/30 text-[10px] text-text-secondary/40 border border-dashed border-border-subtle/30 rounded-xl font-mono h-14 flex items-center justify-center">
                  L-Blueprint Mati: Detail setting latar ditulis manual di kolom bawah.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ADDITIONAL BACKDROPS / LOCATION */}
        <div id="additional-backdrops-section" className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 ml-1">
              <MapPin className="w-3.5 h-3.5 text-accent-yellow" /> 
              {selectedPlaceId !== 'none' ? "Detail Tambahan Latar (Opsional)" : "Detail Setting Latar manual *"}
            </label>
          </div>
          
          <textarea
            rows={2}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={
              selectedPlaceId !== 'none'
                ? "Tambahkan detail cuaca, partikel, atau siluet sekitar... (Contoh: awan gelap, hujan rintik rintik)" 
                : "Tulis di mana kejadiannya... (Contoh: Di jalanan kota kuno bersalju, malam hari sepi)"
            }
            className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-4 outline-none focus:border-accent-yellow transition-all text-sm font-sans resize-none text-white placeholder-text-secondary/40 shadow-inner"
          />

          {/* Location pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {BACKDROP_EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLocation(ex.value)}
                className="px-2.5 py-1.5 bg-bg-tertiary hover:bg-bg-primary text-[9px] font-bold text-text-secondary hover:text-white border border-border-subtle hover:border-accent-yellow/30 rounded-lg transition-all"
              >
                + {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Camera, Lighting, Art style rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 ml-1">
              <Camera className="w-3.5 h-3.5 text-accent-yellow" /> Shot Framing
            </label>
            <select
              value={shot}
              onChange={(e) => setShot(e.target.value)}
              className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3 outline-none focus:border-accent-yellow transition-all text-xs font-sans text-white cursor-pointer font-bold"
            >
              {SHOT_FRAMINGS.map((sh, idx) => (
                <option key={idx} value={sh}>{sh}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 ml-1">
              <Lightbulb className="w-3.5 h-3.5 text-accent-yellow" /> Lighting
            </label>
            <select
              value={lighting}
              onChange={(e) => setLighting(e.target.value)}
              className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3 outline-none focus:border-accent-yellow transition-all text-xs font-sans text-white cursor-pointer font-bold"
            >
              {LIGHTINGS.map((li, idx) => (
                <option key={idx} value={li}>{li}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 ml-1">
              <Paintbrush className="w-3.5 h-3.5 text-accent-yellow" /> Style Aesthetic
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3 outline-none focus:border-accent-yellow transition-all text-xs font-sans text-white cursor-pointer font-bold"
            >
              {STYLES.map((st, idx) => (
                <option key={idx} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions Compile buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-subtle/30">
          <button
            onClick={handleAssemble}
            className="flex-1 py-4 bg-bg-tertiary hover:bg-bg-primary text-white border border-border-subtle font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-[0.98] cursor-pointer"
          >
            Assemble Formula
          </button>
          
          <button
            onClick={handleAI_Enhance}
            disabled={isLoading}
            className="flex-1 py-4 bg-accent-yellow hover:bg-white text-bg-primary font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-lg shadow-accent-yellow/10"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin font-bold" />
                Refining details...
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
      <div id="results-panel-container" className="lg:col-span-5 flex flex-col h-full gap-6">
        
        {/* Output Prompt Card */}
        <div className="bg-bg-secondary border border-border-subtle p-6 md:p-8 rounded-[2rem] flex flex-col flex-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-yellow/5 blur-[50px] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-accent-yellow flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-yellow animate-ping" />
              Engine Output v1.5
            </span>
            {assembledPrompt && (
              <button 
                onClick={handleCopy}
                className="p-2.5 bg-bg-primary hover:bg-bg-tertiary rounded-xl text-text-secondary hover:text-accent-yellow transition-colors border border-border-subtle flex items-center gap-1 text-[10px] font-black uppercase"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center min-h-[220px] p-6 bg-bg-primary/50 border border-border-subtle rounded-2xl relative group">
            <AnimatePresence mode="wait">
              {assembledPrompt ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <p className="text-xs md:text-sm font-mono text-text-primary leading-relaxed selection:bg-accent-yellow/20 italic">
                    "{assembledPrompt}"
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  className="text-center text-text-secondary/50 space-y-4"
                >
                  <div className="w-12 h-12 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto border border-border-subtle">
                    <ImageIcon className="w-5 h-5 opacity-45" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none text-white">Prompt Belum Dihasilkan</p>
                    <p className="text-[9px] font-medium max-w-[220px] mx-auto leading-relaxed mt-2">Pilih blueprint atau isi kolom deskripsi di sebelah kiri, lalu tekan salah satu tombol assemble.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 pt-5 border-t border-border-subtle/30 space-y-3">
            <div className="flex items-center gap-2.5 text-[9px] font-black uppercase text-text-secondary tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow" /> Blueprint Model Structure
            </div>
            <p className="text-[10px] font-mono text-text-secondary/70 bg-bg-tertiary/50 p-3 rounded-lg border border-border-subtle/40 overflow-x-auto leading-relaxed whitespace-pre-wrap">
              [Shot] of [Character Profile + Core Action] at [Setting Profile + Details], illuminated by [Lighting], showcasing a [Style] aesthetic.
            </p>
          </div>
        </div>

        {/* Blueprint info tips card */}
        <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] space-y-3">
          <p className="font-display font-black uppercase tracking-widest text-accent-yellow text-[10px] flex items-center gap-2">
            <Info className="w-3.5 h-3.5" /> CARA KERJA BLUEPRINT KONSISTEN
          </p>
          <div className="text-[11px] text-text-secondary font-medium space-y-2 leading-relaxed">
            <p>Untuk melahirkan visual komik, ilustrasi web, atau feed yang konsisten:</p>
            <ul className="space-y-1.5 text-text-secondary list-decimal list-inside pl-1">
              <li>Pilih <strong className="text-white">Karakter Blueprint yang sama</strong> untuk tiap frame scene Anda.</li>
              <li>Tulis aksi penempatan yang berbeda pada kolom <strong className="text-white">Aksi</strong> (contoh: "sedang berlari" vs "duduk terkejut").</li>
              <li>Prompt beralih bahasa otomatis ke <strong className="text-white">Full English</strong> secara cerdas untuk AI Generator Midjourney / DALL-E.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL: Kelola Character & Place Blueprints */}
      <AnimatePresence>
        {isManageOpen && (
          <div id="blueprint-management-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-bg-secondary border border-border-subtle rounded-[2.5rem] p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-yellow/5 blur-[50px] pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-accent-yellow/10 rounded-xl flex items-center justify-center text-accent-yellow">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-md font-black uppercase tracking-tight">Kelola Library Blueprint</h4>
                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mt-0.5">Custom Consistent Seeds</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsManageOpen(false)}
                  className="p-2 hover:bg-bg-tertiary rounded-xl text-text-secondary hover:text-white transition-colors border border-border-subtle"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {saveSuccess && (
                <div className="p-3 mb-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl flex items-center gap-2 font-bold uppercase tracking-wide">
                  <Check className="w-4 h-4 shrink-0 text-green-400" />
                  <span>{saveSuccess}</span>
                </div>
              )}

              {/* Tab selector */}
              <div className="flex bg-bg-tertiary p-1 rounded-xl border border-border-subtle mb-6 max-w-xs">
                <button
                  onClick={() => setManageTab('chars')}
                  className={cn(
                    "flex-1 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                    manageTab === 'chars' ? "bg-accent-yellow text-bg-primary font-black animate-none" : "text-text-secondary hover:text-white"
                  )}
                >
                  <User className="w-3.5 h-3.5" />
                  Karakter ({characters.length})
                </button>
                <button
                  onClick={() => setManageTab('places')}
                  className={cn(
                    "flex-1 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                    manageTab === 'places' ? "bg-accent-yellow text-bg-primary font-black" : "text-text-secondary hover:text-white"
                  )}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Tempat ({places.length})
                </button>
              </div>

              {/* Modal Content - Scrollable List and Form */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                
                {/* List Group */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent-yellow">Daftar Aktif (Library)</span>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    {manageTab === 'chars' ? (
                      characters.map((char) => (
                        <div key={char.id} className="p-4 bg-bg-tertiary rounded-xl border border-border-subtle flex items-start justify-between gap-4 group">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase text-white">{char.name}</span>
                              {!char.isCustom && <span className="px-1.5 py-0.5 bg-accent-yellow/10 text-accent-yellow text-[8.5px] font-black uppercase rounded">PRESET</span>}
                            </div>
                            <p className="text-[10px] font-mono text-text-secondary/80 leading-relaxed italic">"{char.details}"</p>
                          </div>
                          {char.isCustom && (
                            <button
                              onClick={() => handleDeleteCharacter(char.id)}
                              className="p-1.5 bg-bg-primary hover:bg-red-500/10 text-text-secondary hover:text-red-400 border border-border-subtle rounded-lg scale-0 group-hover:scale-100 transition-all cursor-pointer"
                              title="Delete blueprint"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      places.map((place) => (
                        <div key={place.id} className="p-4 bg-bg-tertiary rounded-xl border border-border-subtle flex items-start justify-between gap-4 group">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase text-white">{place.name}</span>
                              {!place.isCustom && <span className="px-1.5 py-0.5 bg-accent-yellow/10 text-accent-yellow text-[8.5px] font-black uppercase rounded">PRESET</span>}
                            </div>
                            <p className="text-[10px] font-mono text-text-secondary/80 leading-relaxed italic">"{place.details}"</p>
                          </div>
                          {place.isCustom && (
                            <button
                              onClick={() => handleDeletePlace(place.id)}
                              className="p-1.5 bg-bg-primary hover:bg-red-500/10 text-text-secondary hover:text-red-400 border border-border-subtle rounded-lg scale-0 group-hover:scale-100 transition-all cursor-pointer"
                              title="Delete blueprint"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Create Form Group */}
                <div className="pt-6 border-t border-border-subtle/50 space-y-4">
                  <div className="flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-accent-yellow" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">Registrasi Custom Blueprint Baru</span>
                  </div>

                  {manageTab === 'chars' ? (
                    <form onSubmit={handleAddCharacter} className="space-y-4 bg-bg-primary/40 border border-border-subtle p-5 rounded-2xl">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-black tracking-wider text-text-secondary ml-1">Nama Karakter Konsisten *</label>
                          <input
                            type="text"
                            required
                            value={newCharName}
                            onChange={(e) => setNewCharName(e.target.value)}
                            placeholder="Contoh: Pak Bambang, Rani Chibi, dsb."
                            className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3 outline-none text-xs text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between ml-1">
                            <label className="text-[9px] uppercase font-black tracking-wider text-text-secondary">Detail Fisik Lengkap (English Diutamakan) *</label>
                            <span className="text-[8px] text-text-secondary/50 font-bold uppercase">Wajah, Rambut, Baju, Kacamata, Aksesoris</span>
                          </div>
                          <textarea
                            rows={3}
                            required
                            value={newCharDetails}
                            onChange={(e) => setNewCharDetails(e.target.value)}
                            placeholder="Contoh: Pak Bambang, a 50-year-old Javanese man, wearing thick round glasses, grey batik shirt, moustache, kind smile, short grey hair..."
                            className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3 outline-none text-xs text-white resize-none"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="py-3 px-5 bg-accent-yellow hover:bg-white text-bg-primary font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      >
                        + Simpan Karakter Blueprint
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleAddPlace} className="space-y-4 bg-bg-primary/40 border border-border-subtle p-5 rounded-2xl">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-black tracking-wider text-text-secondary ml-1">Nama Tempat / Background *</label>
                          <input
                            type="text"
                            required
                            value={newPlaceName}
                            onChange={(e) => setNewPlaceName(e.target.value)}
                            placeholder="Contoh: Lab Kimia, Kamar Kos Budi, dsb."
                            className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3 outline-none text-xs text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between ml-1">
                            <label className="text-[9px] uppercase font-black tracking-wider text-text-secondary">Detail Tempat & Tema (English Diutamakan) *</label>
                            <span className="text-[8px] text-text-secondary/50 font-bold uppercase">Layout, Lampu, Vibe Suasana, Benda Utama</span>
                          </div>
                          <textarea
                            rows={3}
                            required
                            value={newPlaceDetails}
                            onChange={(e) => setNewPlaceDetails(e.target.value)}
                            placeholder="Contoh: inside a messy science laboratory with boiling glass beakers emitting green dust, shelves packed with vintage chemistry books, retro monitors, dim amber warning lights..."
                            className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3 outline-none text-xs text-white resize-none"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="py-3 px-5 bg-accent-yellow hover:bg-white text-bg-primary font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      >
                        + Simpan Tempat Blueprint
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
