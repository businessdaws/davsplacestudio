import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  Download, 
  RefreshCw, 
  Layers, 
  RotateCcw, 
  Copy, 
  Check, 
  Sparkles, 
  Lock, 
  Sliders, 
  Eye, 
  Maximize2, 
  Briefcase, 
  User, 
  Zap, 
  Award,
  BookOpen,
  HelpCircle,
  Key,
  AlertCircle,
  Loader2,
  Trash2,
  FileImage,
  Flame
} from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface VirtualStudioUIProps {
  user: any;
  profile?: any;
}

const BG_PRESETS = [
  {
    id: 'studio_classic',
    category: 'studio',
    name: 'Classic Grey Cyclorama',
    desc: 'Studio profesional minimalis abu-abu netral dengan pencahayaan softbox.',
    url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=1200',
    promptContext: 'in a modern minimalist grey cyclorama photography studio with high-end ceiling softbox lighting, pristine clean concrete floor, professional studio photoshoot',
  },
  {
    id: 'studio_warm',
    category: 'studio',
    name: 'Warm Plaster Cyc',
    desc: 'Studio dengan tekstur plaster warna krem hangat, ideal untuk kecantikan & fashion.',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200',
    promptContext: 'against a textured warm plaster cyclorama wall in a cozy high-end aesthetic photo studio, luxury organic shadows, soft warm lighting',
  },
  {
    id: 'studio_office',
    category: 'studio',
    name: 'Executive Showroom',
    desc: 'Showroom modern berlantai marmer dengan pemandangan jendela gedung kota.',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
    promptContext: 'inside an ultra-modern executive commercial showroom with white marble flooring, sleek glass panels, soft glowing columns, high-end museum atmosphere',
  },
  {
    id: 'outdoor_garden',
    category: 'outdoor',
    name: 'Sunny Villa Garden',
    desc: 'Taman vila tropis dengan bayangan dedaunan estetis di bawah terik matahari pagi.',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200',
    promptContext: 'in a lush tropical villa garden patio during sunny morning, aesthetic palm leaf shadows casting over beautiful warm stone pavement, sun flares, outdoor natural setting',
  },
  {
    id: 'outdoor_cyberpunk',
    category: 'outdoor',
    name: 'Neon Cyberpunk Shibuya',
    desc: 'Jalur jalanan kota Tokyo di bawah guyuran rintik hujan dan pantulan lampu neon.',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200',
    promptContext: 'in a futuristic neon-drenched cyberpunk back-alley in Shibuya at night during light rain, wet asphalt reflecting bright cyan and magenta holographic billboards, dark moody atmosphere',
  },
  {
    id: 'outdoor_mountain',
    category: 'outdoor',
    name: 'Sunset Alpenglow Peak',
    desc: 'Puncak gunung tinggi bersalju dengan gradasi langit senja merah merona.',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
    promptContext: 'on top of an alpine mountain peak during majestic pink alpenglow sunset, distant snow-capped valley layers, cinematic cold mist, dramatic atmosphere',
  },
  {
    id: 'formal_library',
    category: 'formal',
    name: 'Classic Oak Library',
    desc: 'Rak buku kayu oak klasik mewah tinggi menjulang memberikan kesan akademik pintar.',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=1200',
    promptContext: 'inside a luxurious classic library with towering dark oak wood bookshelves filled with ancient hardcover books, low warm ambient light, vintage leather-bound scholar feel',
  },
  {
    id: 'formal_suite',
    category: 'formal',
    name: 'Luxury Penthouse Lounge',
    desc: 'Lounge penthouse bintang 5 dengan perabotan mewah berlapis emas dan marmer.',
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200',
    promptContext: 'inside an upscale 5-star luxury penthouse lobby with modern golden accents, white marble pillars, premium designer furniture, massive glass facade overlooking skyscrapers',
  },
  {
    id: 'casual_cafe',
    category: 'casual',
    name: 'Rustic Espresso Bar',
    desc: 'Meja kayu kedai kopi estetik berlatar belakang mesin espresso berkabut uap hangat.',
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200',
    promptContext: 'at a cozy rustic industrial espresso bar inside a trendy third-wave coffee shop, warm hanging edison bulbs, copper coffee machine with soft steam, blurred background, local cafe vibe',
  },
  {
    id: 'casual_living',
    category: 'casual',
    name: 'Nordic Sunlit Lounge',
    desc: 'Ruang keluarga bergaya Skandinavia yang terang dengan tanaman hias asri.',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200',
    promptContext: 'inside a minimalist nordic-styled warm sunlit living room, sleek beige fabric sofa, green monstera plant leaves casting organic soft shadows, calming clean air aesthetic',
  }
];

const LIGHTING_OPTS = [
  { id: 'front', label: 'Front Soft Light', val: 'glowing professional front soft diffuse keylight' },
  { id: 'rim', label: 'Rim Light (Backlight)', val: 'dramatic glowing rim light outlining edges, deep background contrast' },
  { id: 'split', label: 'Dramatic Split Light', val: 'moody split studio lighting, high contrast chiaroscuro shadow on one side' },
  { id: 'ring', label: 'Modern Ring Light', val: 'flawless circular catchlight, soft beauty-glow with soft shadow fall' },
  { id: 'sunset', label: 'Sunset Golden hour', val: 'golden hour sunset light beaming at 45 degree angle, long warm shadows' }
];

const CAMERA_OPTS = [
  { id: 'dslr_85', label: 'DSLR 85mm f/1.4 Portrait', val: 'captured with Fujifilm GFX 100S, 85mm lens at f/1.4, super creamy bokeh background, razor sharp focus' },
  { id: 'cine', label: 'Cinema Anamorphic 35mm', val: 'shot on Arri Alexa LF cinema camera with 35mm anamorphic lens, beautiful cinematic anamorphic lens flares, wide aspect ratio bokeh' },
  { id: 'mirrorless', label: 'Mirrorless 50mm f/1.2', val: 'shot on Sony A7R V with FE 50mm f/1.2 GM, ultra photorealistic, pristine professional commercial photography quality' },
  { id: 'mobile', label: 'iPhone Cinematic Pro', val: 'shot on iPhone Pro camera, close-up portrait depth-of-field, high contrast modern lifestyle look' }
];

const ANGLE_OPTS = [
  { id: 'eye', label: 'Eye Level Angle', val: 'shot at eye-level perspective to build maximum direct connection' },
  { id: 'low', label: 'Low Angle (Heroic)', val: 'shot from low-angle looking slightly upward, powerful and premium presence' },
  { id: 'closeup', label: 'Close-Up Shot', val: 'tight close-up framing focusing heavily on texture details, clean composition' },
  { id: 'flatlay', label: 'Top-Down Flatlay', val: 'top-down flatlay perspective grid, perfect aesthetic arrangement' }
];

const FILTER_OPTS = [
  { id: 'warm', label: 'Warm Aesthetic', val: 'soft warm color grading, creamy highlights, golden creamy tones' },
  { id: 'teal_orange', label: 'Cyber Teal & Orange', val: 'high contrast cinematic teal and orange color grading, futuristic dark nodes' },
  { id: 'kodak', label: 'Nostalgic Kodak Film', val: 'classic vintage film color palette, soft kodak gold grain, organic vintage film textures' },
  { id: 'mono', label: 'High-Contrast B&W', val: 'timeless artistic high-contrast black and white, deep shadows, bright silver peaks' },
  { id: 'glow', label: 'Studio Pristine Glow', val: 'high-end luxury commercial advertisement style, pristine clean clipping highlights, airy and bright' }
];

const RATIO_OPTS = [
  { id: '1:1', label: 'Square (1:1)', val: '1:1 square canvas block' },
  { id: '9:16', label: 'Stories / Reels (9:16)', val: '9:16 portrait mobile canvas block' },
  { id: '16:9', label: 'Landscape (16:9)', val: '16:9 widescreen cinematic landscape banner block' },
  { id: '4:5', label: 'Portrait Feed (4:5)', val: '4:5 classic instagram vertical feed block' }
];

// Sample isolated/mask cutouts designed via custom inline SVGs so they are guaranteed transparent and gorgeous!
const SAMPLES = [
  {
    id: 'shoe',
    label: 'Modern Sneaker (UMKM)',
    type: 'product',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full text-accent-yellow fill-current object-contain" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))' }}>
        <path d="M10,65 Q25,35 45,35 Q65,30 85,45 Q90,55 90,65 Q80,75 50,75 Q20,75 10,65 Z" fill="#eb4899" />
        <path d="M45,35 Q60,32 75,30 C80,25 88,27 88,32 Q88,35 83,40" fill="#ffffff" opacity="0.8" />
        <path d="M22,72 L26,55" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <path d="M30,72 L34,55" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <path d="M38,72 L42,55" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <path d="M12,65 Q35,63 50,68 T90,64" stroke="#ffffff" strokeWidth="1.5" fill="none" />
        <circle cx="80" cy="50" r="4" fill="#fcb305" />
      </svg>
    )
  },
  {
    id: 'portrait',
    label: 'Professional Profile',
    type: 'portrait',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full text-[#38bdf8] fill-current object-contain" style={{ filter: 'drop-shadow(3px 5px 8px rgba(0,0,0,0.6))' }}>
        {/* Head and body silhouette of an elegant person */}
        <path d="M30,95 Q50,60 70,95" fill="#f43f5e" />
        <circle cx="50" cy="45" r="18" fill="#fda4af" />
        <path d="M38,38 Q50,22 62,38" fill="#4c0519" />
        <path d="M36,36 Q32,45 38,48 L38,38" fill="#4c0519" />
        <path d="M64,36 Q68,45 62,48 L62,38" fill="#4c0519" />
        <path d="M35,95 C40,90 45,84 50,84 C55,84 60,90 65,95" fill="#ffffff" opacity="0.9" />
        <rect x="47" y="60" width="6" height="10" fill="#fda4af" />
      </svg>
    )
  },
  {
    id: 'camera',
    label: 'Vintage Camera (Luxury)',
    type: 'product',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500 fill-current object-contain" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))' }}>
        <rect x="15" y="35" width="70" height="42" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
        <rect x="30" y="27" width="40" height="8" rx="2" fill="#475569" />
        <circle cx="28" cy="45" r="4" fill="#ef4444" />
        <circle cx="50" cy="56" r="22" fill="#1e293b" stroke="#cbd5e1" strokeWidth="4" />
        <circle cx="50" cy="56" r="14" fill="#020617" />
        <circle cx="47" cy="53" r="4" fill="#ffffff" opacity="0.5" />
        <rect x="72" y="30" width="8" height="5" fill="#e2e8f0" />
      </svg>
    )
  }
];

export default function VirtualStudioUI({ user, profile }: VirtualStudioUIProps) {
  const [activeTool, setActiveTool] = useState<'product' | 'portrait' | 'enhance'>('product');
  const [selectedBg, setSelectedBg] = useState(BG_PRESETS[0]);
  const [selectedLighting, setSelectedLighting] = useState(LIGHTING_OPTS[0]);
  const [selectedCamera, setSelectedCamera] = useState(CAMERA_OPTS[0]);
  const [selectedAngle, setSelectedAngle] = useState(ANGLE_OPTS[0]);
  const [selectedFilter, setSelectedFilter] = useState(FILTER_OPTS[0]);
  const [selectedRatio, setSelectedRatio] = useState(RATIO_OPTS[0]);
  
  // Cutout and positioning states
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<string | null>('shoe');
  
  // Custom Sliders for Canvas Blending
  const [subjectScale, setSubjectScale] = useState(65);
  const [subjectX, setSubjectX] = useState(50); // percentage 0-100
  const [subjectY, setSubjectY] = useState(55); // percentage 0-100
  const [subjectRotation, setSubjectRotation] = useState(0);
  const [subjectBrightness, setSubjectBrightness] = useState(100);
  const [subjectContrast, setSubjectContrast] = useState(105);
  
  // AI generation state
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [generatedPromptText, setGeneratedPromptText] = useState<string | null>(null);
  const [promptCopyFeedback, setPromptCopyFeedback] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Custom user reference backgrounds state
  const [customBgs, setCustomBgs] = useState<{ id: string, category: string, name: string, desc: string, url: string, promptContext: string }[]>([]);
  
  // Activation / Redeem local logic inside if they are locked
  const [codeToActivate, setCodeToActivate] = useState('');
  const [activatingCode, setActivatingCode] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [successUpgrade, setSuccessUpgrade] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(profile?.is_premium === true);

  // Dragging states
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasOuterRef = useRef<HTMLDivElement>(null);

  // Sync profile premium status
  useEffect(() => {
    if (profile?.is_premium) {
      setIsPremiumUser(true);
    }
  }, [profile]);

  // Handle background dragging pointer events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    updatePositionFromEvent(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePositionFromEvent(e);
  };

  const handlePointerUpOrLeave = () => {
    setIsDragging(false);
  };

  const updatePositionFromEvent = (e: React.PointerEvent<HTMLDivElement> | React.MouseEvent) => {
    const container = canvasOuterRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp coordinates to safe bounds (0 to 100)
    setSubjectX(Math.max(0, Math.min(100, Math.round(x))));
    setSubjectY(Math.max(0, Math.min(100, Math.round(y))));
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      const newCustomBg = {
        id: `custom_bg_${Date.now()}`,
        category: 'custom',
        name: file.name.split('.')[0].substring(0, 18) || 'Custom Backdrop',
        desc: 'Unggahan background referensi kustom pengguna.',
        url: b64,
        promptContext: 'in a custom uploaded environment based on user reference image, matching aesthetic atmosphere, photorealistic lighting'
      };
      setCustomBgs(prev => [newCustomBg, ...prev]);
      setSelectedBg(newCustomBg);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedBase64(reader.result as string);
      setSelectedSample(null); // Clear sample usage
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedBase64(reader.result as string);
        setSelectedSample(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetSubjectPositions = () => {
    setSubjectScale(65);
    setSubjectX(50);
    setSubjectY(55);
    setSubjectRotation(0);
    setSubjectBrightness(100);
    setSubjectContrast(105);
  };

  // Construct highly smart and complex Prompt generator query secure server-side call
  const generateVIPPrompt = async () => {
    if (!isPremiumUser) return;
    setGeneratingPrompt(true);
    setApiError(null);
    setGeneratedPromptText(null);

    const activeSampleLabel = selectedSample ? 
      SAMPLES.find(s => s.id === selectedSample)?.label : 
      'User Custom Uploaded Subject';

    const systemContext = `Gambarkan properti dan setting dari visualisasi foto premium Davsplace Studio.`;
    const userPromptText = `Buatlah 1 naskah atau prompt detail berbahasa Inggris (Midjourney / Stable Diffusion style) yang bercita-cita tinggi secara visual tinggi bertema Cinematic Photography untuk objek: "${activeSampleLabel}"
    Latar Belakang: ${selectedBg.name}. Deskripsi: ${selectedBg.desc}. 
    Posisikan objek ditengah latar belakang tersebut. 
    Detail tambahan parameter studio yang dipaksakan:
    - Lighting: ${selectedLighting.label} (${selectedLighting.val})
    - Kamera & Lense: ${selectedCamera.label} (${selectedCamera.val})
    - Angle Foto: ${selectedAngle.label} (${selectedAngle.val})
    - Filter Film Style: ${selectedFilter.label} (${selectedFilter.val})
    - Format Rasio: ${selectedRatio.label}

    Format pengembalian harus rapi, terstruktur, diawali dengan "PROMPT GENERATOR:" di paragraf pertama, lalu ikuti dengan ringkas cara mengaplikasikannya di model AI lain bertajuk "CARA MENGAPLIKASIKAN:". Tulis dalam Bahasa Indonesia untuk instruksinya, tapi PROMPT gambarnya wajib bahasa Inggris yang sangat cinematic, detail, dan fotorealistik profesional.`;

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPromptText,
          context: systemContext,
          provider: 'gemini'
        })
      });

      if (!response.ok) {
        let errMsg = 'Gagal terhubung ke modul AI Google Gemini.';
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const resData = await response.json();
      if (resData.error) {
        throw new Error(resData.error);
      }

      setGeneratedPromptText(resData.text || '');
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Respons terputus. Silakan coba lagi.');
    } finally {
      setGeneratingPrompt(false);
    }
  };

  // Native HTML Canvas renderer to merge and download as full composited PNG
  const downloadMergedImage = () => {
    const container = canvasRef.current;
    if (!container) return;

    const bgImgUrl = selectedBg.url;
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.src = bgImgUrl;

    bgImg.onload = () => {
      const canvas = document.createElement('canvas');
      // Determine canvas sizes from aspect ratio
      let width = 1200;
      let height = 1200;
      if (selectedRatio.id === '16:9') {
        height = 675;
      } else if (selectedRatio.id === '9:16') {
        width = 675;
        height = 1200;
      } else if (selectedRatio.id === '4:5') {
        width = 960;
        height = 1200;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw background
      ctx.drawImage(bgImg, 0, 0, width, height);

      // 2. Draw Filter overlay matching style
      ctx.save();
      if (selectedFilter.id === 'warm') {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.08)'; // Warm amber glow
        ctx.fillRect(0, 0, width, height);
      } else if (selectedFilter.id === 'teal_orange') {
        ctx.fillStyle = 'rgba(13, 148, 136, 0.06)'; // Teal
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(249, 115, 22, 0.04)'; // Orange
        ctx.fillRect(0, 0, width, height);
      } else if (selectedFilter.id === 'kodak') {
        ctx.fillStyle = 'rgba(120, 53, 4, 0.05)'; // Sepia brown warm
        ctx.fillRect(0, 0, width, height);
      } else if (selectedFilter.id === 'mono') {
        // Simple grayscale conversion
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
          data[i] = brightness;     // red
          data[i + 1] = brightness; // green
          data[i + 2] = brightness; // blue
        }
        ctx.putImageData(imgData, 0, 0);
      }
      ctx.restore();

      // Convert subject into canvas drawing
      const drawSubjectOnCanvas = (subImg: HTMLImageElement | SVGElement) => {
        ctx.save();
        // Calculate dimensions
        const subW = (width * (subjectScale / 100));
        const subH = (height * (subjectScale / 100));

        // Coordinate positioning according to percentages
        const drawX = (width * (subjectX / 100));
        const drawY = (height * (subjectY / 100));

        // Translation for rotation
        ctx.translate(drawX, drawY);
        ctx.rotate((subjectRotation * Math.PI) / 180);

        // Brightness and contrast mockup
        ctx.filter = `brightness(${subjectBrightness}%) contrast(${subjectContrast}%)`;

        // Draw centered on handle
        ctx.drawImage(subImg as HTMLImageElement, -subW / 2, -subH / 2, subW, subH);
        ctx.restore();

        // 3. Trigger actual file download
        const link = document.createElement('a');
        link.download = `studiodavs_${selectedBg.id}_${activeTool}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };

      if (uploadedBase64) {
        const subImg = new Image();
        subImg.crossOrigin = "anonymous";
        subImg.src = uploadedBase64;
        subImg.onload = () => {
          drawSubjectOnCanvas(subImg);
        };
      } else if (selectedSample) {
        // Convert SVG template to image format for Canvas drawing
        const svgElement = document.querySelector('#selected-svg-canvas svg');
        if (svgElement) {
          const svgString = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const blobURL = window.URL.createObjectURL(svgBlob);
          
          const subImg = new Image();
          subImg.onload = () => {
            drawSubjectOnCanvas(subImg);
            window.URL.revokeObjectURL(blobURL);
          };
          subImg.src = blobURL;
        }
      }
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setPromptCopyFeedback(true);
    setTimeout(() => setPromptCopyFeedback(false), 2000);
  };

  const handleActivatePremium = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeToActivate.trim() || !user) return;
    setActivatingCode(true);
    setActivationError(null);
    try {
      const codeRef = doc(db, 'activation_codes', codeToActivate.trim());
      const codeSnap = await getDoc(codeRef);
      
      if (!codeSnap.exists()) {
        setActivationError('Kode aktivasi salah atau kedaluwarsa. Silakan beli ke admin.');
        setActivatingCode(false);
        return;
      }
      
      const codeData = codeSnap.data();
      if (codeData.is_used) {
        setActivationError('Kode aktivasi ini sudah pernah digunakan sebelumnya.');
        setActivatingCode(false);
        return;
      }
      
      // Transactional updates
      await updateDoc(codeRef, {
        is_used: true,
        used_by: user.uid,
        used_by_email: user.email || 'vip@user.com',
        used_at: new Date().toISOString()
      });
      
      await updateDoc(doc(db, 'profiles', user.uid), {
        is_premium: true,
        premium_code: codeToActivate.trim(),
        updated_at: new Date().toISOString()
      });
      
      setIsPremiumUser(true);
      setSuccessUpgrade(true);
      setCodeToActivate('');
    } catch (err: any) {
      setActivationError('Aktivasi terhambat: ' + err.message);
    } finally {
      setActivatingCode(false);
    }
  };

  // Render premium lockout paywall if user is NOT a premium/VIP subscriber
  if (!isPremiumUser) {
    return (
      <div className="w-full">
        {/* Header Visual */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-16">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 text-[9px] font-black rounded-lg uppercase tracking-[0.2em] mb-4 border border-red-500/20">
              <Lock className="w-3 h-3" />
              Fitur Eksklusif VIP
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tighter uppercase leading-[0.9] md:leading-none">
              VIRTUAL STUDIO <span className="text-accent-yellow italic">ENGINE</span>
            </h1>
            <p className="text-sm md:text-text-secondary mt-4 font-sans max-w-lg opacity-70 leading-relaxed">
              Teknologi virtual background premium Davsplace Studio untuk menggabungkan produk, potret diri, atau objek apa saja ke dalam studio 3D sinematik dalam hitungan detik.
            </p>
          </div>
        </div>

        {/* Lockout Box */}
        <div className="flex justify-center items-center py-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl bg-bg-secondary border border-accent-yellow/20 p-8 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden space-y-10"
          >
            {/* Elegant backgrounds elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-yellow via-amber-500 to-accent-yellow" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent-yellow/5 blur-[90px] pointer-events-none" />

            <div className="text-center space-y-3 max-w-lg mx-auto">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-accent-yellow/10 border border-accent-yellow/25 flex items-center justify-center text-accent-yellow shadow-inner animate-pulse">
                <Award className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-black uppercase text-accent-yellow tracking-[0.25em]">SPESIAL AKSES KELAS ATAS</span>
              <h3 className="text-2xl md:text-3xl font-display font-black uppercase text-white tracking-tight">VIP MEMBER ONLY</h3>
              <p className="text-text-secondary text-sm sm:text-xs leading-relaxed opacity-85">
                Davsplace Virtual Studio Engine didesain eksklusif untuk keanggotaan VIP / PRO. Aktifkan lisensi Anda sekarang untuk mendapatkan akses sepuasnya tanpa batas.
              </p>
            </div>

            {/* Interactive Grid of Features in the lockout to attract user */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-bg-primary/50 border border-border-subtle p-5 rounded-2xl space-y-2">
                <div className="text-xl">📦</div>
                <h4 className="text-[10px] font-black uppercase text-white tracking-wider">Product Studio</h4>
                <p className="text-[9px] text-text-secondary font-semibold uppercase leading-relaxed">Ubah foto produk mentah biasa jadi model lifestyle katalog bernilai jual tinggi seketika.</p>
              </div>
              <div className="bg-bg-primary/50 border border-border-subtle p-5 rounded-2xl space-y-2">
                <div className="text-xl">👩</div>
                <h4 className="text-[10px] font-black uppercase text-white tracking-wider">Portrait Studio</h4>
                <p className="text-[9px] text-text-secondary font-semibold uppercase leading-relaxed">Poles potret diri, cv, maupun personal branding Anda berlatar belakang kantor mewah atau studio luks.</p>
              </div>
              <div className="bg-bg-primary/50 border border-border-subtle p-5 rounded-2xl space-y-2">
                <div className="text-xl">✨</div>
                <h4 className="text-[10px] font-black uppercase text-white tracking-wider">Lighting & Lenses</h4>
                <p className="text-[9px] text-text-secondary font-semibold uppercase leading-relaxed">Atur rim light, dslr 85mm bokeh, filter vintage, camera angle secara mandiri memakai sytem studio cerdas.</p>
              </div>
            </div>

            {/* Upgrade Forms */}
            <div className="border border-border-subtle/60 p-6 md:p-8 rounded-[2rem] bg-bg-tertiary/30 max-w-md mx-auto space-y-4">
              <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-accent-yellow" />
                Aktifkan Lisensi VIP Pro Sekarang
              </label>

              <form onSubmit={handleActivatePremium} className="space-y-3">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={codeToActivate}
                    onChange={(e) => setCodeToActivate(e.target.value)}
                    placeholder="e.g. DK-AI-XXXX-XXXX"
                    className="flex-1 bg-bg-primary border border-border-subtle rounded-xl px-4 py-3 outline-none focus:border-accent-yellow text-xs font-mono uppercase text-white placeholder-text-secondary/50"
                  />
                  <button 
                    type="submit"
                    disabled={activatingCode || !codeToActivate.trim()}
                    className="px-6 bg-accent-yellow text-bg-primary text-[10px] font-black uppercase rounded-xl hover:bg-white disabled:opacity-50 transition-colors flex items-center justify-center min-w-[110px]"
                  >
                    {activatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : 'AKTIFKAN VIP'}
                  </button>
                </div>
                {activationError && (
                  <p className="text-[9px] text-red-400 font-bold uppercase mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {activationError}
                  </p>
                )}
              </form>
            </div>

            <div className="flex flex-col items-center gap-4">
              <a 
                href={`https://wa.me/6289667736500?text=${encodeURIComponent("Halo Admin Davsplace, saya tertarik ingin membeli lisensi VIP Pro untuk Virtual Studio Engine!")}`}
                target="_blank"
                referrerPolicy="no-referrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-accent-yellow hover:bg-white text-bg-primary font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-accent-yellow/10"
              >
                Minta Akses Admin / Hubungi WA admin
              </a>
              <span className="text-[8px] text-text-secondary font-semibold uppercase tracking-wide">Tersedia promo gratis dwi-mingguan khusus peluncuran perdana!</span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Active VIP render mode
  return (
    <div className="w-full space-y-12">
      {/* Dynamic upgraded notification */}
      {successUpgrade && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-3 text-emerald-400 text-xs font-bold leading-normal uppercase"
        >
          <Award className="w-5 h-5 animate-bounce shrink-0" />
          <span>Selamat! Akun Anda telah sukses dinobatkan sebagai VIP Premium. Mulai gubah kanvas visual Anda sekarang!</span>
        </motion.div>
      )}

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-black rounded-lg uppercase tracking-[0.2em] mb-4 border border-emerald-500/20">
            <Flame className="w-3.5 h-3.5 text-accent-yellow fill-accent-yellow animate-pulse" />
            Jalur VIP Premium Aktif
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tighter uppercase leading-[0.9] md:leading-none">
            VIRTUAL STUDIO <span className="text-accent-yellow italic">ENGINE</span>
          </h1>
          <p className="text-sm md:text-text-secondary mt-4 font-sans max-w-lg opacity-70 leading-relaxed">
            Pilih atau unggah subjek produk, portrait diri, sesuaikan sudut lensa luks, pasang pencahayaan studio legendaris, lalu gabung atau generate hasil prompt sinematiknya.
          </p>
        </div>
      </div>

      {/* Sub Tool Selecting Deck (3 Tools) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-border-subtle/60 pb-8">
        <button
          onClick={() => { setActiveTool('product'); if (selectedSample) setSelectedSample('shoe'); }}
          className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-left ${activeTool === 'product' ? 'bg-accent-yellow/5 border-accent-yellow/40 shadow-inner' : 'bg-bg-secondary border-border-subtle hover:border-accent-yellow/30'}`}
        >
          <span className="text-2xl mt-1">📦</span>
          <div>
            <h3 className="text-[10px] font-black uppercase text-white tracking-widest leading-none mb-1.5 flex items-center gap-1">
              Product Studio
              {activeTool === 'product' && <div className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />}
            </h3>
            <p className="text-[9px] font-semibold uppercase text-text-secondary leading-normal">
              Foto produk + background toko/lifestyle. Sangat cocok serta adaptif bag UMKM jualan daring.
            </p>
          </div>
        </button>

        <button
          onClick={() => { setActiveTool('portrait'); if (selectedSample) setSelectedSample('portrait'); }}
          className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-left ${activeTool === 'portrait' ? 'bg-accent-yellow/5 border-accent-yellow/40 shadow-inner' : 'bg-bg-secondary border-border-subtle hover:border-accent-yellow/30'}`}
        >
          <span className="text-2xl mt-1">🧑</span>
          <div>
            <h3 className="text-[10px] font-black uppercase text-white tracking-widest leading-none mb-1.5 flex items-center gap-1">
              Portrait Studio
              {activeTool === 'portrait' && <div className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />}
            </h3>
            <p className="text-[9px] font-semibold uppercase text-text-secondary leading-normal">
              Foto orang + background profesional/kreatif. Mewah untuk mendesain CV & personal branding unggul.
            </p>
          </div>
        </button>

        <button
          onClick={() => { setActiveTool('enhance'); setSelectedSample(null); }}
          className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-left ${activeTool === 'enhance' ? 'bg-accent-yellow/5 border-accent-yellow/40 shadow-inner' : 'bg-bg-secondary border-border-subtle hover:border-accent-yellow/30'}`}
        >
          <span className="text-2xl mt-1">✨</span>
          <div>
            <h3 className="text-[10px] font-black uppercase text-white tracking-widest leading-none mb-1.5 flex items-center gap-1">
              AI Enhance Composite
              {activeTool === 'enhance' && <div className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />}
            </h3>
            <p className="text-[9px] font-semibold uppercase text-text-secondary leading-normal">
              Poles otomatis gubahan foto biasa dipasangkan ke kanvas estetik siap posting dengan filter lux.
            </p>
          </div>
        </button>
      </div>

      {/* Main Composite Area: Parameter Left, Canvas Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: parameters */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section 1: Image uploader */}
          <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] space-y-4">
            <h4 className="text-[10px] font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent-yellow" />
              1. Unggah Subjek Objek Foto
            </h4>
            
            <p className="text-[9px] text-text-secondary font-semibold uppercase leading-relaxed">
              Silakan unggah foto berformat transparan (PNG cutout) atau gunakan sampel eksklusif studio kami di bawah agar pas saat digabungkan.
            </p>

            {/* Drag Drop or manual select */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-subtle/80 hover:border-accent-yellow/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-bg-primary/50 flex flex-col items-center justify-center space-y-2 group"
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden" 
              />
              <Upload className="w-8 h-8 text-text-secondary group-hover:text-accent-yellow transition-colors" />
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-white">Seret & Taruh atau Klik</span>
                <p className="text-[8px] text-text-secondary font-semibold uppercase">JPEG / PNG maks 5MB</p>
              </div>
            </div>

            {/* Samples selection row */}
            <div className="space-y-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Pilih Sampel Studio:</span>
              <div className="flex flex-wrap gap-2">
                {SAMPLES.filter(s => activeTool === 'portrait' ? s.type === 'portrait' : s.type === 'product').map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      setSelectedSample(sample.id);
                      setUploadedBase64(null);
                    }}
                    className={`px-3 py-2 text-[9px] font-extrabold uppercase rounded-lg border transition-all flex items-center gap-2 ${selectedSample === sample.id ? 'bg-accent-yellow border-accent-yellow text-bg-primary' : 'bg-bg-primary border-border-subtle text-text-secondary hover:text-white'}`}
                  >
                    <div className="w-4 h-4 shrink-0 bg-white/10 rounded overflow-hidden flex items-center justify-center">
                      {sample.svg}
                    </div>
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Choose background */}
          <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="text-[10px] font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-accent-yellow" />
                2. Pilih Virtual Background Studio
              </h4>
              
              {/* Custom reference background hidden file uploader trigger */}
              <button
                onClick={() => bgInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-primary hover:text-white border border-accent-yellow/30 hover:border-accent-yellow rounded-xl text-[8px] font-black uppercase tracking-wider text-accent-yellow transition-all"
                title="Unggah background referensi kustom Anda"
              >
                <Upload className="w-3 h-3" />
                UNGGAH BACKROUND
              </button>
              <input
                type="file"
                ref={bgInputRef}
                onChange={handleBgUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Categories selector */}
            <div className="flex flex-wrap gap-1 border-b border-border-subtle/50 pb-3">
              {['all', 'custom', 'studio', 'outdoor', 'formal', 'casual'].map((categ) => (
                <button
                  key={categ}
                  onClick={() => {
                    if (categ === 'custom') {
                      if (customBgs.length > 0) {
                        setSelectedBg(customBgs[0]);
                      }
                    } else {
                      const matchedBg = BG_PRESETS.find(b => categ === 'all' || b.category === categ);
                      if (matchedBg) setSelectedBg(matchedBg);
                    }
                  }}
                  className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded-md ${
                    selectedBg.category === categ || 
                    (categ === 'all' && ['studio', 'outdoor', 'formal', 'casual', 'custom'].includes(selectedBg.category)) 
                      ? 'bg-[#94a3b8]/20 text-white' 
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  {categ}
                </button>
              ))}
            </div>

            {/* Presets grid scrolling with integrated custom backgrounds priority rendering */}
            <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {/* Custom user background cards */}
              {customBgs.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBg(bg)}
                  className={`group relative h-20 rounded-xl border overflow-hidden transition-all text-left flex flex-col justify-end p-2 ${selectedBg.id === bg.id ? 'border-accent-yellow ring-1 ring-accent-yellow' : 'border-border-subtle hover:border-accent-yellow/40'}`}
                >
                  <img 
                    src={bg.url} 
                    alt={bg.name} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-opacity duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                  <div className="relative z-20">
                    <span className="text-[7px] font-black uppercase px-1 bg-emerald-500 text-bg-primary rounded mr-1">
                      KUSTOM
                    </span>
                    <p className="text-[8px] font-black text-white mt-1 leading-none truncate">{bg.name}</p>
                  </div>
                </button>
              ))}

              {/* Default presets list */}
              {BG_PRESETS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBg(bg)}
                  className={`group relative h-20 rounded-xl border overflow-hidden transition-all text-left flex flex-col justify-end p-2 ${selectedBg.id === bg.id ? 'border-accent-yellow ring-1 ring-accent-yellow' : 'border-border-subtle hover:border-accent-yellow/40'}`}
                >
                  <img 
                    src={bg.url} 
                    alt={bg.name} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-opacity duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                  <div className="relative z-20">
                    <span className="text-[7px] font-black uppercase px-1 bg-accent-yellow text-bg-primary rounded mr-1">
                      {bg.category}
                    </span>
                    <p className="text-[8px] font-black text-white mt-1 leading-none truncate">{bg.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Camera, lenses and lighting settings */}
          <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] space-y-5">
            <h4 className="text-[10px] font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-accent-yellow" />
              3. Parameter Kamera & Lighting
            </h4>

            {/* Lighting Selection */}
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase tracking-widest text-[#94a3b8]">Posisi Lighting:</label>
              <div className="flex flex-wrap gap-1.5">
                {LIGHTING_OPTS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedLighting(opt)}
                    className={`px-2.5 py-1.5 text-[8px] font-bold uppercase rounded-lg border transition-all ${selectedLighting.id === opt.id ? 'bg-accent-yellow border-accent-yellow text-bg-primary' : 'bg-bg-primary border-border-subtle text-text-secondary hover:text-white'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lenses / Camera selection */}
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase tracking-widest text-[#94a3b8]">Jenis Kamera & Lensa:</label>
              <div className="flex flex-wrap gap-1.5">
                {CAMERA_OPTS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedCamera(opt)}
                    className={`px-2.5 py-1.5 text-[8px] font-bold uppercase rounded-lg border transition-all ${selectedCamera.id === opt.id ? 'bg-accent-yellow border-accent-yellow text-bg-primary' : 'bg-bg-primary border-border-subtle text-text-secondary hover:text-white'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Angle Selection */}
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase tracking-widest text-[#94a3b8]">Sudut Pandang / Angle:</label>
              <div className="flex flex-wrap gap-1.5">
                {ANGLE_OPTS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedAngle(opt)}
                    className={`px-2.5 py-1.5 text-[8px] font-bold uppercase rounded-lg border transition-all ${selectedAngle.id === opt.id ? 'bg-accent-yellow border-accent-yellow text-bg-primary' : 'bg-bg-primary border-border-subtle text-text-secondary hover:text-white'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Film / Filter Selection */}
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase tracking-widest text-[#94a3b8]">Filter Estetika:</label>
              <div className="flex flex-wrap gap-1.5">
                {FILTER_OPTS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedFilter(opt)}
                    className={`px-2.5 py-1.5 text-[8px] font-bold uppercase rounded-lg border transition-all ${selectedFilter.id === opt.id ? 'bg-accent-yellow border-accent-yellow text-bg-primary' : 'bg-bg-primary border-border-subtle text-text-secondary hover:text-white'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Aspect ratio */}
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase tracking-widest text-[#94a3b8]">Format Ukuran / Rasio:</label>
              <div className="flex flex-wrap gap-1.5">
                {RATIO_OPTS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedRatio(opt)}
                    className={`px-2.5 py-1.5 text-[8px] font-bold uppercase rounded-lg border transition-all ${selectedRatio.id === opt.id ? 'bg-accent-yellow border-accent-yellow text-bg-primary' : 'bg-bg-primary border-border-subtle text-text-secondary hover:text-white'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Canvas display and Prompt result */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Visualizer Container representing the canvas */}
          <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2.5rem] space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-white tracking-widest">
                  LIVE COMPOSITE PREVIEW
                </span>
              </div>
              <button 
                onClick={resetSubjectPositions}
                className="flex items-center gap-1 px-3 py-1.5 bg-bg-primary hover:text-white border border-border-subtle rounded-xl text-[8px] font-black uppercase tracking-wider text-text-secondary transition-colors"
                title="Reset Posisi Subjek"
              >
                <RotateCcw className="w-3 h-3" />
                RESET POSISI
              </button>
            </div>

            {/* Display Canvas container frame with aspect ratio */}
            <div className="flex flex-col items-center justify-center bg-bg-primary/40 rounded-3xl p-4 md:p-8 min-h-[380px] border border-border-subtle/50 relative">
              <span className="text-[8px] font-black uppercase tracking-wider text-[#94a3b8] mb-3 select-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow animate-ping" />
                Interaktif: Seret atau Geser Subjek Langsung di Kanvas
              </span>
              
              <div 
                ref={canvasOuterRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUpOrLeave}
                onPointerLeave={handlePointerUpOrLeave}
                style={{
                  aspectRatio: selectedRatio.id === '1:1' ? '1/1' : selectedRatio.id === '16:9' ? '16/9' : selectedRatio.id === '9:16' ? '9/16' : '4/5',
                }}
                className={`w-full max-w-[420px] bg-bg-tertiary rounded-2xl overflow-hidden shadow-2xl relative border-2 group select-none touch-none ${isDragging ? 'border-accent-yellow cursor-grabbing scale-[1.005]' : 'border-border-subtle/70 cursor-grab'} transition-all duration-150`}
              >
                {/* 1. Underlying Selected Virtual Background */}
                <img 
                  src={selectedBg.url} 
                  alt={selectedBg.name} 
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-all"
                  style={{
                    filter: selectedFilter.id === 'mono' ? 'grayscale(1) contrast(1.1)' : selectedFilter.id === 'warm' ? 'sepia(0.15) saturate(1.1) hue-rotate(5deg)' : selectedFilter.id === 'kodak' ? 'sepia(0.2) contrast(0.95)' : selectedFilter.id === 'teal_orange' ? 'hue-rotate(-10deg) saturate(1.2) contrast(1.1)' : ''
                  }}
                  referrerPolicy="no-referrer"
                />
                
                {/* Embedded HTML elements representing the native render container for downloads */}
                <div ref={canvasRef} className="hidden" />

                {/* Ambient glow light filter overlays */}
                <div 
                  className="absolute inset-0 z-[12] mix-blend-overlay pointer-events-none"
                  style={{
                    background: selectedLighting.id === 'sunset' ? 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(0,0,0,0) 70%)' :
                                selectedLighting.id === 'rim' ? 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 80%)' : '',
                  }}
                />

                {/* 2. Layer 2: Transparent draggable / scale subject wrapper loaded inside canvas */}
                <div 
                  className="absolute z-[15] flex items-center justify-center pointer-events-none"
                  style={{
                    width: `${subjectScale}%`,
                    height: `${subjectScale}%`,
                    left: `${subjectX}%`,
                    top: `${subjectY}%`,
                    transform: 'translate(-50%, -50%)',
                    filter: `brightness(${subjectBrightness}%) contrast(${subjectContrast}%)`
                  }}
                >
                  <div 
                    className={`w-full h-full relative p-2 ${isDragging ? 'border border-dashed border-accent-yellow/60 rounded-xl' : 'group-hover:border group-hover:border-dashed group-hover:border-white/30 group-hover:rounded-xl'} transition-all`}
                    style={{
                      transform: `rotate(${subjectRotation}deg)`
                    }}
                  >
                    {uploadedBase64 ? (
                      <img 
                        src={uploadedBase64} 
                        alt="Uploaded subject cutout" 
                        className="w-full h-full object-contain pointer-events-none select-none"
                        style={{ filter: `drop-shadow(4px 8px 10px rgba(0,0,0,0.4))` }}
                      />
                    ) : selectedSample ? (
                      <div id="selected-svg-canvas" className="w-full h-full flex items-center justify-center select-none pointer-events-none">
                        {SAMPLES.find(s => s.id === selectedSample)?.svg}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase text-text-secondary select-none">
                        (SUBJEK KOSONG)
                      </div>
                    )}
                  </div>
                </div>

                {/* High-contrast aesthetic overlay tag representing Davsplace studio parameters */}
                <div className="absolute bottom-3 left-3 z-[18] bg-bg-primary/80 backdrop-blur border border-border-subtle px-3 py-1.5 rounded-lg select-none flex items-center gap-1.5 opacity-80 pointer-events-none">
                  <span className="text-[7px] font-black font-mono text-accent-yellow uppercase">LENS: {selectedCamera.id.toUpperCase()} • {selectedRatio.id}</span>
                </div>
              </div>
            </div>

            {/* Slider parameters for subjcet scaling and brightness positioning */}
            <div className="bg-bg-primary/50 border border-border-subtle p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider text-text-secondary">
                  <span>Skala Ukuran Objek (%):</span>
                  <span className="text-white">{subjectScale}%</span>
                </div>
                <input 
                  type="range"
                  min="20"
                  max="140"
                  value={subjectScale}
                  onChange={(e) => setSubjectScale(parseInt(e.target.value))}
                  className="w-full h-1 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-yellow"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider text-text-secondary">
                  <span>Rotasi Objek (°):</span>
                  <span className="text-white">{subjectRotation}°</span>
                </div>
                <input 
                  type="range"
                  min="-180"
                  max="180"
                  value={subjectRotation}
                  onChange={(e) => setSubjectRotation(parseInt(e.target.value))}
                  className="w-full h-1 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-yellow"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider text-text-secondary">
                  <span>Posisi Horizontal (X):</span>
                  <span className="text-white">{subjectX}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={subjectX}
                  onChange={(e) => setSubjectX(parseInt(e.target.value))}
                  className="w-full h-1 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-yellow"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider text-text-secondary">
                  <span>Posisi Vertikal (Y):</span>
                  <span className="text-white">{subjectY}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={subjectY}
                  onChange={(e) => setSubjectY(parseInt(e.target.value))}
                  className="w-full h-1 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-yellow"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider text-text-secondary">
                  <span>Kecerahan Objek:</span>
                  <span className="text-white">{subjectBrightness}%</span>
                </div>
                <input 
                  type="range"
                  min="60"
                  max="140"
                  value={subjectBrightness}
                  onChange={(e) => setSubjectBrightness(parseInt(e.target.value))}
                  className="w-full h-1 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-yellow"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider text-text-secondary">
                  <span>Kontras Objek:</span>
                  <span className="text-white">{subjectContrast}%</span>
                </div>
                <input 
                  type="range"
                  min="60"
                  max="140"
                  value={subjectContrast}
                  onChange={(e) => setSubjectContrast(parseInt(e.target.value))}
                  className="w-full h-1 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-yellow"
                />
              </div>
            </div>

            {/* Dynamic visual actions deck: Generate AI Prompt or physical download */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={downloadMergedImage}
                className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-bg-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
              >
                <Download className="w-4 h-4" />
                UNDUH FOTO GABUNGAN (PNG)
              </button>
              
              <button
                onClick={generateVIPPrompt}
                disabled={generatingPrompt}
                className="flex-1 py-4 bg-accent-yellow hover:bg-white text-bg-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-yellow/10"
              >
                {generatingPrompt ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                GENERATE AI PROMPT COAS (VIP)
              </button>
            </div>
          </div>

          {/* AI generated prompt output box card */}
          <AnimatePresence>
            {(generatingPrompt || generatedPromptText || apiError) && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-bg-secondary border border-border-subtle p-6 rounded-[2.5rem] space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent-yellow animate-spin" />
                    AI PROMPT GENERATOR RESULT
                  </h4>
                  {generatedPromptText && (
                    <button
                      onClick={() => copyToClipboard(generatedPromptText)}
                      className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-accent-yellow hover:text-white transition-colors"
                    >
                      {promptCopyFeedback ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          SALIN BERHASIL
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          SALIN KESELURUHAN
                        </>
                      )}
                    </button>
                  )}
                </div>

                {generatingPrompt ? (
                  <div className="py-8 flex flex-col justify-center items-center text-center space-y-4">
                    <Loader2 className="w-8 h-8 text-accent-yellow animate-spin" />
                    <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest leading-none">
                      Mengekstraksi setting studio sinematik memakai Google Gemini...
                    </p>
                  </div>
                ) : apiError ? (
                  <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-2 text-[10px] text-red-400 font-bold uppercase leading-normal">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>{apiError}</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Prompt rendering inside structured text box */}
                    <div className="bg-bg-primary/60 border border-border-subtle p-5 rounded-2xl">
                      <p className="text-xs text-text-secondary font-medium font-sans leading-relaxed whitespace-pre-wrap select-all">
                        {generatedPromptText}
                      </p>
                    </div>

                    <div className="text-[9px] text-[#94a3b8] font-semibold uppercase leading-normal flex items-start gap-1.5">
                      <BookOpen className="w-4 h-4 shrink-0 text-accent-yellow mt-0.5" />
                      <span>
                        Prompt ini siap digenerate pada generator model gambar AI eksternal andalan Anda seperti Midjourney v6, Stable Diffusion XL, maupun DALL-E 3 untuk melahirkan visualisasi hyper-realistic ultra luks.
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
