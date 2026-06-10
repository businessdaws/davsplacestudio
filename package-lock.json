import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MobileTopbar, MobileBottomNavbar } from '../components/MobileNavigation';
import SearchModal from '../components/SearchModal';
import { 
  Camera, 
  Download, 
  Upload, 
  Sparkles, 
  RotateCw, 
  Sliders, 
  Check, 
  Type, 
  Copyright, 
  FileText, 
  Image as ImageIcon,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  Sparkle,
  PenTool,
  Grid,
  Save,
  Trash2,
  Lock,
  RefreshCw,
  AlertTriangle,
  History
} from 'lucide-react';
import { cn } from '../lib/utils';

// Declare types for EXIF to bypass TypeScript strict checking
interface ExifData {
  cameraModel: string;
  cameraMake: string;
  focalLength: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
  dateTime: string;
}

const BrandLogoGraphic = ({ id, isSelected }: { id: string; isSelected: boolean }) => {
  switch (id) {
    case 'leica':
      return (
        <div className="flex items-center gap-1.5 font-bold">
          <div className="w-5 h-5 rounded-full bg-[#E4002B] flex items-center justify-center shadow shadow-red-500/25">
            <span className="text-[8px] italic font-serif text-white font-black leading-none -translate-y-[0.5px]">L</span>
          </div>
          <span className="text-[10px] lowercase italic font-serif leading-none tracking-tight font-black text-rose-500">leica</span>
        </div>
      );
    case 'canon':
      return (
        <span className="text-[11.5px] font-black italic font-serif text-[#C51117] tracking-tight leading-none uppercase">
          Canon
        </span>
      );
    case 'nikon':
      return (
        <div className="flex items-center gap-1 bg-[#FFE000] px-1.5 py-0.5 rounded shadow-sm border border-yellow-400">
          <span className="text-[9px] font-black italic text-black font-sans leading-none">Nikon</span>
        </div>
      );
    case 'sony':
      return (
        <span className="text-[10px] font-black text-white tracking-widest font-serif leading-none uppercase">SONY</span>
      );
    case 'fujifilm':
      return (
        <span className="text-[9px] font-black text-white tracking-wider font-sans leading-none uppercase">FUJIFILM</span>
      );
    case 'hasselblad':
      return (
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full border border-white/50 flex items-center justify-center font-serif text-[8.5px] font-bold text-white">H</div>
          <span className="text-[8.5px] font-bold text-white tracking-wider">H'BLAD</span>
        </div>
      );
    case 'apple':
      return (
        <div className="flex items-center gap-1 text-white">
          <span className="text-[12px]"></span>
          <span className="text-[9px] font-bold">Apple</span>
        </div>
      );
    case 'xiaomi':
      return (
        <div className="flex items-center gap-1 bg-[#FF6700] px-1.5 py-0.5 rounded text-white shadow-sm">
          <span className="text-[8px] font-black text-white font-sans leading-none uppercase">mi</span>
        </div>
      );
    case 'samsung':
      return (
        <span className="text-[9.5px] font-black tracking-widest text-white font-mono leading-none">SΛMSUNG</span>
      );
    case 'dji':
      return (
        <span className="text-[10px] font-black italic text-sky-400 tracking-wide font-sans leading-none uppercase">DJI</span>
      );
    case 'custom':
    default:
      return (
        <span className="text-[9.5px] font-black text-accent-yellow tracking-wider leading-none uppercase">Logo Kustom</span>
      );
  }
};

export default function WatermarkEditor({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  // Firebase Auth and Premium Limit states
  const [user, setUser] = useState<any>(null);
  const [usageCount, setUsageCount] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('watermark_usage_count') || '0');
    } catch {
      return 0;
    }
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Custom Templates states (Beta)
  const [templates, setTemplates] = useState<any[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // File states
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // EXIF Extracted state
  const [exif, setExif] = useState<ExifData>({
    cameraModel: 'Default Model',
    cameraMake: 'Camera',
    focalLength: '-',
    aperture: '-',
    shutterSpeed: '-',
    iso: '-',
    dateTime: '-'
  });
  const [hasExif, setHasExif] = useState(false);
  const [isReadingExif, setIsReadingExif] = useState(false);

  // Bottom Frame Settings
  const [frameBg, setFrameBg] = useState<'black' | 'white'>('white');
  const [userTitle, setUserTitle] = useState<string>('CLASSIC CAPTURE');
  const [customDate, setCustomDate] = useState<string>(''); // Dynamic date, defaults to current date/time
  const [layoutStyle, setLayoutStyle] = useState<'classic' | 'basic'>('classic');
  const [userLocation, setUserLocation] = useState<string>('Athens, Greece');
  const [customLogoImgRef, setCustomLogoImgRef] = useState<HTMLImageElement | null>(null);
  const [watermarkFont, setWatermarkFont] = useState<'sans' | 'serif' | 'handwriting'>('sans');
  const [showSignature, setShowSignature] = useState<boolean>(true);

  // Camera Branding Centers
  const [cameraBrand, setCameraBrand] = useState<string>('leica');
  const [customLogoFile, setCustomLogoFile] = useState<string | null>(null);
  const customLogoInputRef = useRef<HTMLInputElement>(null);

  // Authentication & Limitation Handlers
  useEffect(() => {
    if (!isEmbedded) {
      navigate('/dashboard?tab=watermarking', { replace: true });
    }
  }, [isEmbedded, navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setShowLoginModal(false);
    } catch (err) {
      console.error("Login gagal: ", err);
      alert("Gagal masuk dengan Google. Silakan coba kembali.");
    }
  };

  // Pre-defined Custom Presets / Templates
  const defaultTemplates = [
    {
      id: 'default-leica-classic',
      name: '[PRESET] Leica Classic White',
      isDefault: true,
      config: {
        frameBg: 'white',
        userTitle: 'STREET STYLE',
        layoutStyle: 'classic',
        userLocation: 'Jakarta, Indonesia',
        watermarkFont: 'sans',
        showSignature: false,
        cameraBrand: 'leica',
        signatureText: '',
        signatureFont: 'Dancing Script',
        showOverlay: false,
        overlayType: 'text',
        overlayText: '© Davsplace Studio • All Rights Reserved',
        overlayPattern: 'center',
        overlayOpacity: 30
      }
    },
    {
      id: 'default-sony-noir',
      name: '[PRESET] Sony Night Pro (Dark)',
      isDefault: true,
      config: {
        frameBg: 'black',
        userTitle: 'NEON ESSENCE',
        layoutStyle: 'classic',
        userLocation: 'Shibuya, Japan',
        watermarkFont: 'sans',
        showSignature: true,
        cameraBrand: 'sony',
        signatureText: 'by Alpha Lens',
        signatureFont: 'Dancing Script',
        showOverlay: false,
        overlayType: 'text',
        overlayText: '© Davsplace Studio • All Rights Reserved',
        overlayPattern: 'center',
        overlayOpacity: 30
      }
    },
    {
      id: 'default-fuji-basic',
      name: '[PRESET] Fuji Minimalist Matte',
      isDefault: true,
      config: {
        frameBg: 'white',
        userTitle: 'CHRONICLE',
        layoutStyle: 'basic',
        userLocation: 'Bali, Indonesia',
        watermarkFont: 'serif',
        showSignature: true,
        cameraBrand: 'fujifilm',
        signatureText: 'FinePix Maker',
        signatureFont: 'Dancing Script',
        showOverlay: false,
        overlayType: 'text',
        overlayText: '© Davsplace Studio • All Rights Reserved',
        overlayPattern: 'center',
        overlayOpacity: 30
      }
    }
  ];

  // Load Custom Templates (Beta)
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      let localCustoms: any[] = [];
      try {
        const stored = localStorage.getItem('watermark_custom_templates');
        if (stored) {
          localCustoms = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Gagal load template lokal: ", e);
      }

      if (user) {
        try {
          const q = query(collection(db, 'watermark_templates'), where('uid', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const cloudCustoms: any[] = [];
          querySnapshot.forEach((docSnap) => {
            cloudCustoms.push({ id: docSnap.id, ...docSnap.data() });
          });

          // Merge local and cloud keeping order
          const mergedDict: { [key: string]: any } = {};
          localCustoms.forEach(t => { mergedDict[t.id] = t; });
          cloudCustoms.forEach(t => { mergedDict[t.id] = t; });

          setTemplates([
            ...defaultTemplates,
            ...Object.values(mergedDict)
          ]);
        } catch (err) {
          console.error("Gagal sinkronasi dengan cloud: ", err);
          setTemplates([
            ...defaultTemplates,
            ...localCustoms
          ]);
        }
      } else {
        setTemplates([
          ...defaultTemplates,
          ...localCustoms
        ]);
      }
      setLoadingTemplates(false);
    };

    fetchTemplates();
  }, [user]);

  const applyTemplate = (template: any) => {
    const c = template.config;
    if (!c) return;
    if (c.frameBg) setFrameBg(c.frameBg);
    if (c.userTitle !== undefined) setUserTitle(c.userTitle);
    if (c.customDate !== undefined && !hasExif) setCustomDate(c.customDate);
    if (c.layoutStyle) setLayoutStyle(c.layoutStyle);
    if (c.userLocation !== undefined) setUserLocation(c.userLocation);
    if (c.watermarkFont) setWatermarkFont(c.watermarkFont);
    if (c.showSignature !== undefined) setShowSignature(c.showSignature);
    if (c.cameraBrand) setCameraBrand(c.cameraBrand);
    if (c.signatureText !== undefined) setSignatureText(c.signatureText);
    if (c.signatureFont !== undefined) setSignatureFont(c.signatureFont);
    if (c.showOverlay !== undefined) setShowOverlay(c.showOverlay);
    if (c.overlayType !== undefined) setOverlayType(c.overlayType);
    if (c.overlayText !== undefined) setOverlayText(c.overlayText);
    if (c.overlayPattern !== undefined) setOverlayPattern(c.overlayPattern);
    if (c.overlayOpacity !== undefined) setOverlayOpacity(c.overlayOpacity);
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) {
      alert("Masukkan nama template terlebih dahulu!");
      return;
    }

    const configToSave = {
      frameBg,
      userTitle,
      customDate,
      layoutStyle,
      userLocation,
      watermarkFont,
      showSignature,
      cameraBrand,
      signatureText,
      signatureFont,
      showOverlay,
      overlayType,
      overlayText,
      overlayPattern,
      overlayOpacity
    };

    const newTemplate = {
      id: 'template-' + Date.now().toString(),
      name: newTemplateName.trim(),
      config: configToSave,
      isDefault: false
    };

    // Filter dynamic custom template
    const currentCustoms = templates.filter(t => !t.isDefault);
    const updatedCustoms = [newTemplate, ...currentCustoms];

    setTemplates([
      ...defaultTemplates,
      ...updatedCustoms
    ]);

    try {
      localStorage.setItem('watermark_custom_templates', JSON.stringify(updatedCustoms));
    } catch (e) {
      console.error("Gagal simpan ke localStorage: ", e);
    }

    if (user) {
      try {
        await setDoc(doc(db, 'watermark_templates', newTemplate.id), {
          ...newTemplate,
          uid: user.uid,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Gagal simpan ke cloud: ", err);
      }
    }

    setNewTemplateName('');
    alert(`Template "${newTemplate.name}" berhasil disimpan ke daftar desain Anda!`);
  };

  const handleDeleteTemplate = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus template kustom ini?")) return;

    const currentCustoms = templates.filter(t => !t.isDefault && t.id !== templateId);
    setTemplates([
      ...defaultTemplates,
      ...currentCustoms
    ]);

    try {
      localStorage.setItem('watermark_custom_templates', JSON.stringify(currentCustoms));
    } catch (err) {
      console.error(err);
    }

    if (user) {
      try {
        await deleteDoc(doc(db, 'watermark_templates', templateId));
      } catch (err) {
        console.error("Gagal hapus dari cloud: ", err);
      }
    }
  };

  // Preload custom logo Image object for synchronous canvas draw
  useEffect(() => {
    if (!customLogoFile) {
      setCustomLogoImgRef(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setCustomLogoImgRef(img);
    };
    img.src = customLogoFile;
  }, [customLogoFile]);

  // Handwritten Signatures
  const [signatureText, setSignatureText] = useState<string>('Davsplace Studio');
  const [signatureFont, setSignatureFont] = useState<string>('Dancing Script');

  // Copyright Overlay Settings
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [overlayType, setOverlayType] = useState<'text' | 'logo'>('text');
  const [overlayText, setOverlayText] = useState<string>('© Davsplace Studio • All Rights Reserved');
  const [overlayPattern, setOverlayPattern] = useState<'center' | 'tiled'>('center');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(30); // 0 to 100

  // Drawing Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Helper brands available
  const cameraBrands = [
    { id: 'leica', name: 'Leica' },
    { id: 'canon', name: 'Canon' },
    { id: 'nikon', name: 'Nikon' },
    { id: 'sony', name: 'Sony' },
    { id: 'fujifilm', name: 'Fujifilm' },
    { id: 'hasselblad', name: 'Hasselblad' },
    { id: 'apple', name: 'Apple' },
    { id: 'xiaomi', name: 'Xiaomi' },
    { id: 'samsung', name: 'Samsung' },
    { id: 'dji', name: 'DJI' },
    { id: 'custom', name: 'Logo Kustom' }
  ];

  // Dynamic Google Font Loader
  useEffect(() => {
    // Inject EXIF library dynamically from CDN
    const exifScript = document.createElement('script');
    exifScript.src = 'https://cdn.jsdelivr.net/npm/exif-js';
    exifScript.async = true;
    document.body.appendChild(exifScript);

    // Inject cursive Google Fonts
    const fontsLink = document.createElement('link');
    fontsLink.rel = 'stylesheet';
    fontsLink.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Playball&family=Sacramento&family=Great+Vibes&family=Playfair+Display:ital,wght@1,600&family=JetBrains+Mono:wght@400;500;700&family=Montserrat:wght@800&display=swap';
    document.head.appendChild(fontsLink);

    // Default current date
    const now = new Date();
    const formatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}  ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setCustomDate(formatted);

    return () => {
      document.body.removeChild(exifScript);
      document.head.removeChild(fontsLink);
    };
  }, []);

  // Handle Photo File Upload
  const handlePhotoUpload = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Hanya diperbolehkan memasukkan file gambar!');
      return;
    }

    setImageName(file.name);
    setIsReadingExif(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        readExifData(img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoUpload(e.dataTransfer.files[0]);
    }
  };

  // EXIF Reader Logic using exif-js
  const readExifData = (imgElement: HTMLImageElement) => {
    const EXIF_LIB = (window as any).EXIF;
    if (!EXIF_LIB) {
      console.warn("EXIF-js CDN library not loaded yet.");
      setHasExif(false);
      setIsReadingExif(false);
      return;
    }

    try {
      EXIF_LIB.getData(imgElement, function (this: any) {
        const allTags = EXIF_LIB.getAllTags(this);
        console.log("Extracted EXIF:", allTags);

        if (Object.keys(allTags).length > 0) {
          // Model Kamera
          let model = allTags.Model || allTags.Make || 'Digital Frame Camera';
          let make = allTags.Make || 'Unknown';
          
          // Focal length format
          let focal = '-';
          if (allTags.FocalLength) {
            focal = typeof allTags.FocalLength === 'object' 
              ? `${Math.round(allTags.FocalLength.numerator / allTags.FocalLength.denominator)}mm`
              : `${allTags.FocalLength}mm`;
          }

          // Aperture format
          let aperture = '-';
          if (allTags.FNumber) {
            aperture = typeof allTags.FNumber === 'object'
              ? `f/${allTags.FNumber.numerator / allTags.FNumber.denominator}`
              : `f/${allTags.FNumber}`;
          }

          // Exposure time format (Shutter Speed)
          let shutter = '-';
          if (allTags.ExposureTime) {
            const exp = allTags.ExposureTime;
            if (typeof exp === 'object') {
              const num = exp.numerator;
              const den = exp.denominator;
              if (num < den) {
                // E.g., 1/250s
                shutter = `1/${Math.round(den / num)}s`;
              } else {
                // E.g., 1.5s
                shutter = `${(num / den).toFixed(1)}s`;
              }
            } else {
              shutter = exp < 1 ? `1/${Math.round(1 / exp)}s` : `${exp}s`;
            }
          }

          // ISO format
          let isoVal = allTags.ISOSpeedRatings || allTags.ISO || '-';
          let formattedIso = isoVal !== '-' ? `ISO ${isoVal}` : '-';

          // Capture date
          let capDate = '-';
          if (allTags.DateTimeOriginal || allTags.DateTime) {
            const tempDate = allTags.DateTimeOriginal || allTags.DateTime;
            // Format 2026:05:28 11:24:00 to 2026.05.28 11:24:00
            capDate = tempDate.replace(/:/g, '.').replace(/(\d{4})\.(\d{2})\.(\d{2})/, '$1.$2.$3');
          } else {
            const now = new Date();
            capDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}  ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          }

          // Apply state transitions
          setExif({
            cameraModel: model.toUpperCase(),
            cameraMake: make,
            focalLength: focal,
            aperture: aperture,
            shutterSpeed: shutter,
            iso: formattedIso,
            dateTime: capDate
          });
          setHasExif(true);

          // Auto detect camera brand if present
          const lowerMake = make.toLowerCase();
          const lowerModel = model.toLowerCase();
          if (lowerMake.includes('leica') || lowerModel.includes('leica')) setCameraBrand('leica');
          else if (lowerMake.includes('canon') || lowerModel.includes('canon')) setCameraBrand('canon');
          else if (lowerMake.includes('nikon') || lowerModel.includes('nikon')) setCameraBrand('nikon');
          else if (lowerMake.includes('sony') || lowerModel.includes('sony')) setCameraBrand('sony');
          else if (lowerMake.includes('dji') || lowerModel.includes('dji')) setCameraBrand('dji');
          else if (lowerMake.includes('apple') || lowerModel.includes('apple') || lowerMake.includes('iphone') || lowerModel.includes('iphone')) setCameraBrand('apple');
          else if (lowerMake.includes('fuji') || lowerModel.includes('fuji')) setCameraBrand('fujifilm');
        } else {
          // No EXIF data found
          setHasExif(false);
          setExif({
            cameraModel: 'No EXIF Data Available',
            cameraMake: 'Camera',
            focalLength: '-',
            aperture: '-',
            shutterSpeed: '-',
            iso: '-',
            dateTime: '-'
          });
        }
      });
    } catch (e) {
      console.error("EXIF reading error:", e);
      setHasExif(false);
    } finally {
      setIsReadingExif(false);
    }
  };

  // Custom Logo Upload Loader
  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomLogoFile(event.target?.result as string);
        setCameraBrand('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas drawing loop
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Resolution Calculations (Resolution-Aware Scaling Engine)
    const imgWidth = image.naturalWidth;
    const imgHeight = image.naturalHeight;

    // Frame bottom height takes exactly 10% of overall photo height
    const frameHeightPercent = 0.10; 
    const frameHeight = Math.round(imgHeight * frameHeightPercent);

    canvas.width = imgWidth;
    canvas.height = imgHeight + frameHeight;

    // Clear and draw original full-resolution picture
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, imgWidth, imgHeight);

    // Core Colors Configuration
    const frameColor = frameBg === 'black' ? '#0D0D0D' : '#F9F9F9';
    const textColor = frameBg === 'black' ? '#FFFFFF' : '#0B0B0B';
    const textSubColor = frameBg === 'black' ? '#8C8C8C' : '#626262';

    // Render footer background frame card
    ctx.fillStyle = frameColor;
    ctx.fillRect(0, imgHeight, canvas.width, frameHeight);

    // Side Margin: 4.5% of overall width
    const sidePadding = Math.round(imgWidth * 0.045);
    const frameCenterY = imgHeight + (frameHeight / 2);

    // Font scalers relative to the fixed Frame Height
    const resolvedFrameHeight = frameHeight;
    const titleFontSize = Math.round(resolvedFrameHeight * 0.22);
    const subtitleFontSize = Math.round(resolvedFrameHeight * 0.13);
    const exifFontSize = Math.round(resolvedFrameHeight * 0.16);
    const logoHeight = Math.round(resolvedFrameHeight * 0.40);
    const signatureFontSize = Math.round(resolvedFrameHeight * 0.22);

    // Assemble dynamic EXIF inputs
    const focalVal = hasExif && exif.focalLength && exif.focalLength !== '-' ? exif.focalLength : '50mm';
    const apertureVal = hasExif && exif.aperture && exif.aperture !== '-' ? exif.aperture : 'f/1.8';
    const shutterVal = hasExif && exif.shutterSpeed && exif.shutterSpeed !== '-' ? exif.shutterSpeed : '1/250s';
    const isoVal = hasExif && exif.iso && exif.iso !== '-' ? exif.iso : 'ISO 100';
    const cameraModelVal = hasExif && exif.cameraModel && exif.cameraModel !== 'DEFAULT MODEL' && exif.cameraModel !== 'No EXIF Data Available' ? exif.cameraModel : userTitle.toUpperCase();
    const displayDate = hasExif && exif.dateTime !== '-' ? exif.dateTime : customDate;

    // Helper to calculate exact horizontal width of the selected brand logo
    const getLogoWidth = (size: number): number => {
      if (cameraBrand === 'custom' && customLogoImgRef) {
        const aspect = customLogoImgRef.naturalWidth / customLogoImgRef.naturalHeight;
        let drawW = size * aspect;
        const maxW = size * 3;
        if (drawW > maxW) {
          drawW = maxW;
        }
        return drawW;
      }
      switch (cameraBrand) {
        case 'leica':
          return size;
        case 'canon':
          return size * 2.1;
        case 'nikon':
          return size * 1.6;
        case 'sony':
          return size * 2.1;
        case 'fujifilm':
          return size * 2.5;
        case 'hasselblad':
          return size * 2.2;
        case 'apple':
          return size * 1.0;
        case 'xiaomi':
          return size * 0.9;
        case 'samsung':
          return size * 2.4;
        case 'dji':
          return size * 1.3;
        default:
          return size;
      }
    };

    const logoWidth = getLogoWidth(logoHeight);

    // Helper drawing logo logic
    const drawLogoAt = (x: number, y: number, size: number, colorOverride?: string) => {
      ctx.save();
      ctx.translate(x, y);

      const activeTextColor = colorOverride || textColor;

      if (cameraBrand === 'custom' && customLogoImgRef) {
        const aspect = customLogoImgRef.naturalWidth / customLogoImgRef.naturalHeight;
        let drawH = size;
        let drawW = size * aspect;
        const maxW = size * 3;
        if (drawW > maxW) {
          drawW = maxW;
          drawH = maxW / aspect;
        }
        ctx.drawImage(customLogoImgRef, -drawW / 2, -drawH / 2, drawW, drawH);
      } else {
        ctx.fillStyle = activeTextColor;
        ctx.strokeStyle = activeTextColor;
        ctx.lineWidth = Math.max(2, Math.round(size * 0.08));

        switch (cameraBrand) {
          case 'leica': {
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
            ctx.fillStyle = '#E4002B'; // Authentic Leica Red
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `italic 700 ${Math.round(size * 0.44)}px "Playfair Display", serif`;
            ctx.fillText('Leica', 0, 0);
            break;
          }

          case 'canon': {
            ctx.fillStyle = frameBg === 'black' || colorOverride ? '#FF3333' : '#C51117';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `italic bold ${Math.round(size * 0.75)}px "Playfair Display", "Times New Roman", serif`;
            ctx.fillText('Canon', 0, 0);
            break;
          }

          case 'nikon': {
            // Draw dual mode for Nikon: customized yellow plate for standard bezels, and clean monochrome for overlays.
            if (colorOverride || frameBg === 'black') {
              ctx.fillStyle = activeTextColor;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.font = `italic 900 ${Math.round(size * 0.65)}px "Montserrat", "Inter", sans-serif`;
              ctx.fillText('Nikon', 0, 0);
            } else {
              const boxW = size * 1.6;
              const boxH = size * 0.8;
              ctx.beginPath();
              ctx.moveTo(-boxW/2 - 5, -boxH/2);
              ctx.lineTo(boxW/2 + 5, -boxH/2 + 2);
              ctx.lineTo(boxW/2 - 2, boxH/2);
              ctx.lineTo(-boxW/2 - 10, boxH/2);
              ctx.closePath();
              ctx.fillStyle = '#FFE000'; // Nikon signature Yellow
              ctx.fill();

              ctx.fillStyle = '#000000';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.font = `italic 900 ${Math.round(size * 0.52)}px "Montserrat", sans-serif`;
              ctx.fillText('Nikon', -3, 1);
            }
            break;
          }

          case 'sony': {
            ctx.fillStyle = activeTextColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Custom high-contrast Roman/Serif logotype
            ctx.font = `bold ${Math.round(size * 0.48)}px "Times New Roman", "Playfair Display", Georgia, serif`;
            ctx.fillText('SONY', 0, 0);
            break;
          }

          case 'fujifilm': {
            ctx.fillStyle = activeTextColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold uppercase ${Math.round(size * 0.44)}px "Montserrat", "Inter", sans-serif`;
            ctx.fillText('FUJIFILM', 0, 0);
            break;
          }

          case 'hasselblad': {
            // Styled 'H' thin circle emblem
            ctx.strokeStyle = activeTextColor;
            ctx.lineWidth = Math.max(1.5, Math.round(size * 0.04));
            ctx.beginPath();
            ctx.arc(-size * 0.6, 0, size * 0.32, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.fillStyle = activeTextColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `italic bold ${Math.round(size * 0.42)}px "Playfair Display", "Times New Roman", serif`;
            ctx.fillText('H', -size * 0.6, 0);

            // Authentic letter-spaced brand text beside the emblem
            ctx.textAlign = 'left';
            ctx.font = `bold 500 ${Math.round(size * 0.35)}px "Montserrat", "Inter", sans-serif`;
            ctx.fillText('HASSELBLAD', -size * 0.12, 0);
            break;
          }

          case 'apple': {
            ctx.fillStyle = activeTextColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `normal ${Math.round(size * 1.0)}px "Inter", sans-serif`;
            ctx.fillText('', 0, -Math.round(size * 0.08));
            break;
          }

          case 'xiaomi': {
            // Orange squircle background
            const r = size * 0.45;
            ctx.fillStyle = '#FF6700'; // Xiaomi Orange
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(-r, -r, r * 2, r * 2, r * 0.32);
            } else {
              ctx.rect(-r, -r, r * 2, r * 2);
            }
            ctx.fill();

            // White elegant text 'mi'
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold 500 ${Math.round(size * 0.41)}px "Montserrat", "Inter", sans-serif`;
            ctx.fillText('mi', 0, -size * 0.02);
            break;
          }

          case 'samsung': {
            ctx.fillStyle = activeTextColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Iconically styled brand lettering using Lambda glyph "Λ" as clean futuristic Samsung "A"
            ctx.font = `bold uppercase ${Math.round(size * 0.44)}px "Montserrat", "Space Grotesk", sans-serif`;
            ctx.fillText('SΛMSUNG', 0, 0);
            break;
          }

          case 'dji': {
            ctx.fillStyle = activeTextColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `italic 900 ${Math.round(size * 0.65)}px "Inter", sans-serif`;
            ctx.fillText('DJI', 0, 0);
            
            ctx.beginPath();
            ctx.moveTo(-size * 0.6, size * 0.35);
            ctx.lineTo(size * 0.6, size * 0.35);
            ctx.stroke();
            break;
          }

          default: {
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.45, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, size * 0.12, 0, 2 * Math.PI);
            ctx.fillStyle = activeTextColor;
            ctx.fill();
            break;
          }
        }
      }
      ctx.restore();
    };

    // ==========================================
    // RESOLVE WATERMARK FONT CONVENTIONS
    // ==========================================
    const getWatermarkFont = (size: number, isLight = false) => {
      // All fonts are now updated to "Inter Tight" with variations in style & weight
      switch (watermarkFont) {
        case 'serif':
          return `${isLight ? 'italic 300' : 'italic 600'} ${size}px "Inter Tight", serif`;
        case 'handwriting':
          return `${isLight ? 'italic 200' : 'italic 500'} ${size}px "Inter Tight", sans-serif`;
        case 'sans':
        default:
          return `${isLight ? 'normal 300' : '900 uppercase'} ${size}px "Inter Tight", sans-serif`;
      }
    };

    // ==========================================
    // ROUTING BY SELECTED LAYOUT STYLE
    // ==========================================

    if (layoutStyle === 'classic') {
      // Leica Classic: Logo in the center, EXIF on the left, signature/location on the right.
      
      // 1. LEFT COLUMN: EXIF data (Camera Model Name & specs)
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      // Row 1 Left: Camera Model Name (Bold, modern)
      ctx.fillStyle = textColor;
      ctx.font = getWatermarkFont(titleFontSize, false);
      ctx.fillText(cameraModelVal.toUpperCase(), sidePadding, imgHeight + Math.round(frameHeight * 0.23));

      // Row 2 Left: Technical specifications
      ctx.fillStyle = textSubColor;
      ctx.font = `500 ${subtitleFontSize + 1}px "Inter Tight", "Montserrat", sans-serif`;
      const specText = `${focalVal}   ${apertureVal}   ${shutterVal}   ${isoVal}`;
      ctx.fillText(specText, sidePadding, imgHeight + Math.round(frameHeight * 0.62));

      // 2. CENTER COLUMN: Camera Brand Logo
      const logoCenterX = canvas.width / 2;
      drawLogoAt(logoCenterX, frameCenterY, logoHeight);

      // 3. RIGHT COLUMN: Signature/Photographer & Location + displayDate
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';

      // Row 1 Right: Photographer signature / Title
      ctx.fillStyle = textColor;
      if (showSignature && signatureText.trim() !== '') {
        let signatureFontValue = `${signatureFontSize}px "${signatureFont}", "Playball", cursive, serif`;
        if (signatureFont === 'Inter Tight') {
          signatureFontValue = `${signatureFontSize}px "Inter Tight", sans-serif`;
        }
        ctx.font = signatureFontValue;
        const rawSig = signatureText.trim();
        const prefix = rawSig.toLowerCase().startsWith('by ') ? '' : 'by ';
        ctx.fillText(`${prefix}${rawSig}`, canvas.width - sidePadding, imgHeight + Math.round(frameHeight * 0.23));
      } else {
        ctx.font = getWatermarkFont(titleFontSize, false);
        ctx.fillText(userTitle.toUpperCase() || 'CLASSIC CAPTURE', canvas.width - sidePadding, imgHeight + Math.round(frameHeight * 0.23));
      }

      // Row 2 Right: Location and Date/Time (separated beautifully with spacers)
      ctx.fillStyle = textSubColor;
      ctx.font = getWatermarkFont(subtitleFontSize, true);
      const locText = userLocation.trim() !== '' ? `${userLocation}   ` : '';
      const dateText = displayDate;
      const combinedRightLine = `${locText}   ${dateText}`;
      ctx.fillText(combinedRightLine.trim(), canvas.width - sidePadding, imgHeight + Math.round(frameHeight * 0.62));

    } else if (layoutStyle === 'basic') {
      // Basic Layout: Logo on the left, then vertical divider, then EXIF data. Photographer signature & location + date on the far right.
      
      // 1. LEFT SIDE combo: Logo -> Divider -> EXIF text
      // Set the center of the logo based on half its dynamic width
      const logoLeftX = sidePadding + Math.round(logoWidth / 2);
      drawLogoAt(logoLeftX, frameCenterY, logoHeight);

      // Elegant vertical divider line next to the left logo, spaced relative to the actual logo width
      const logoGap = Math.round(logoHeight * 0.40);
      const dividerX = sidePadding + logoWidth + logoGap;
      
      ctx.strokeStyle = frameBg === 'black' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = Math.max(1, Math.round(frameHeight * 0.006));
      ctx.beginPath();
      ctx.moveTo(dividerX, imgHeight + Math.round(frameHeight * 0.25));
      ctx.lineTo(dividerX, imgHeight + Math.round(frameHeight * 0.75));
      ctx.stroke();

      // EXIF text block next to divider line (left-aligned), keeping a premium gap
      const dividerGap = Math.round(logoHeight * 0.40);
      const exifTextLeftX = dividerX + dividerGap;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      // Row 1: Camera Model Name
      ctx.fillStyle = textColor;
      ctx.font = getWatermarkFont(titleFontSize, false);
      ctx.fillText(cameraModelVal.toUpperCase(), exifTextLeftX, imgHeight + Math.round(frameHeight * 0.23));

      // Row 2: Technical specifications parameters
      ctx.fillStyle = textSubColor;
      ctx.font = `500 ${subtitleFontSize + 1}px "Inter Tight", "Montserrat", sans-serif`;
      const specText = `${focalVal}   ${apertureVal}   ${shutterVal}   ${isoVal}`;
      ctx.fillText(specText, exifTextLeftX, imgHeight + Math.round(frameHeight * 0.62));

      // 2. RIGHT COLUMN: Photographer signature / Title & Location + date under it (right-aligned)
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';

      // Row 1 Right: Photographer signature / Title
      ctx.fillStyle = textColor;
      if (showSignature && signatureText.trim() !== '') {
        let signatureFontValue = `${signatureFontSize}px "${signatureFont}", "Playball", cursive, serif`;
        if (signatureFont === 'Inter Tight') {
          signatureFontValue = `${signatureFontSize}px "Inter Tight", sans-serif`;
        }
        ctx.font = signatureFontValue;
        const rawSig = signatureText.trim();
        const prefix = rawSig.toLowerCase().startsWith('by ') ? '' : 'by ';
        ctx.fillText(`${prefix}${rawSig}`, canvas.width - sidePadding, imgHeight + Math.round(frameHeight * 0.23));
      } else {
        ctx.font = getWatermarkFont(titleFontSize, false);
        ctx.fillText(userTitle.toUpperCase() || 'CLASSIC CAPTURE', canvas.width - sidePadding, imgHeight + Math.round(frameHeight * 0.23));
      }

      // Row 2 Right: Location and Date/Time
      ctx.fillStyle = textSubColor;
      ctx.font = getWatermarkFont(subtitleFontSize, true);
      const locText = userLocation.trim() !== '' ? `${userLocation}   ` : '';
      const dateText = displayDate;
      const combinedRightLine = `${locText}   ${dateText}`;
      ctx.fillText(combinedRightLine.trim(), canvas.width - sidePadding, imgHeight + Math.round(frameHeight * 0.62));
    }



    // ==========================================
    // DRAW OVERLAY COPYRIGHT PROTECTION
    // ==========================================
    if (showOverlay) {
      ctx.save();
      ctx.globalAlpha = overlayOpacity / 100;
      ctx.fillStyle = '#FFFFFF'; // Bright crisp translucent white
      ctx.strokeStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = Math.round(imgWidth * 0.005);

      const overlayFontSize = Math.round(imgWidth * 0.035); // Responsive 3.5% font size

      if (overlayType === 'text') {
        ctx.font = `600 ${overlayFontSize}px "Inter", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (overlayPattern === 'center') {
          // Centered Copyright Overlay on top portion
          ctx.translate(imgWidth / 2, imgHeight / 2);
          ctx.rotate(-15 * Math.PI / 180); // Slight diagonal angle
          ctx.fillText(overlayText, 0, 0);
        } else {
          // Repeated tiling across active picture grid
          const cols = 4;
          const rows = 4;
          const gapX = imgWidth / cols;
          const gapY = imgHeight / rows;

          for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
              ctx.save();
              const tileX = (c * gapX) + (gapX / 2);
              const tileY = (r * gapY) + (gapY / 2);
              ctx.translate(tileX, tileY);
              ctx.rotate(-25 * Math.PI / 180);
              ctx.font = `500 ${Math.round(overlayFontSize * 0.6)}px "Inter", sans-serif`;
              ctx.fillText(overlayText, 0, 0);
              ctx.restore();
            }
          }
        }
      } else {
        // Logo-based watermarking overlay
        const customLogoImg = new Image();
        customLogoImg.onload = () => {
          const logoAspect = customLogoImg.naturalWidth / customLogoImg.naturalHeight;
          const overlayLogoW = imgWidth * 0.15; // 15% of width
          const overlayLogoH = overlayLogoW / logoAspect;

          if (overlayPattern === 'center') {
            ctx.drawImage(
              customLogoImg, 
              (imgWidth / 2) - (overlayLogoW / 2), 
              (imgHeight / 2) - (overlayLogoH / 2), 
              overlayLogoW, 
              overlayLogoH
            );
          } else {
            const cols = 3;
            const rows = 3;
            const gapX = imgWidth / cols;
            const gapY = imgHeight / rows;

            for (let c = 0; c < cols; c++) {
              for (let r = 0; r < rows; r++) {
                const posX = (c * gapX) + (gapX / 2) - (overlayLogoW / 2);
                const posY = (r * gapY) + (gapY / 2) - (overlayLogoH / 2);
                ctx.drawImage(customLogoImg, posX, posY, overlayLogoW, overlayLogoH);
              }
            }
          }
        };

        if (customLogoFile) {
          customLogoImg.src = customLogoFile;
        } else {
          // Fallback simple star logo
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.fillText('⭐️', imgWidth / 2, imgHeight / 2);
        }
      }
      ctx.restore();
    }

  }, [
    image, 
    frameBg, 
    userTitle, 
    customDate, 
    cameraBrand, 
    customLogoFile, 
    customLogoImgRef,
    signatureText, 
    signatureFont,
    exif,
    hasExif,
    showOverlay,
    overlayType,
    overlayText,
    overlayPattern,
    overlayOpacity,
    layoutStyle,
    userLocation,
    watermarkFont,
    showSignature
  ]);

  // Handle Photo Save/Download Trigger (JPEG 0.92 Optimized Quality with 5x Limit Check)
  const handleExportImage = () => {
    // Check usage limits for non-logged-in users
    if (!user && usageCount >= 5) {
      setShowLoginModal(true);
      return;
    }

    if (!canvasRef.current || !image) return;
    const canvas = canvasRef.current;
    
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const downloadLink = document.createElement('a');
      const baseName = imageName.substring(0, imageName.lastIndexOf('.')) || 'watermarked_photo';
      downloadLink.download = `${baseName}_framed.jpg`;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Increment limit count if user is anonymous
      if (!user) {
        const nextCount = usageCount + 1;
        setUsageCount(nextCount);
        try {
          localStorage.setItem('watermark_usage_count', nextCount.toString());
        } catch (e) {
          console.error(e);
        }
      }
    } catch (e) {
      console.error("Gagal melakukan export foto:", e);
      alert("Maaf, gagal mengekspor foto secara otomatis karena batasan keamanan sensor.");
    }
  };

  return (
    <div className={cn(isEmbedded ? "" : "min-h-screen bg-bg-primary", "text-text-primary selection:bg-accent-yellow/20 selection:text-accent-yellow overflow-x-hidden")}>
      {/* Topbars navigation */}
      {!isEmbedded && <Navbar onSearchClick={() => setIsSearchOpen(true)} />}
      {!isEmbedded && <MobileTopbar onSearchClick={() => setIsSearchOpen(true)} />}

      <main className={isEmbedded ? "pt-0 pb-0" : "pt-24 pb-20 lg:pb-12"}>
        <div className={isEmbedded ? "max-w-7xl mx-auto px-0 py-0" : "max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12"}>
          
          {/* Header Introduction Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12 border-b border-border-subtle pb-6 md:pb-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 space-y-2"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-yellow/10 text-accent-yellow text-[9px] font-black rounded-lg uppercase tracking-[0.2em] border border-accent-yellow/20">
                <Camera className="w-3.5 h-3.5" />
                Watermark Suite
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tighter uppercase leading-none">
                WATERMARK <span className="text-accent-yellow italic">GENERATOR</span> PREMIUM
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary max-w-2xl font-sans opacity-85 leading-relaxed">
                Tingkatkan prestise foto karya Anda dengan bingkai bergaya Leica, Canon, atau Sony secara otomatis. 100% aman beroperasi langsung di browser Anda melindungi privasi foto sepenuhnya.
              </p>
            </motion.div>
          </div>

          {/* Primary Editor Workspace Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT AREA: Canvas Interactive Re-render Block */}
            <div className="col-span-1 lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-center p-4 bg-bg-secondary/60 border border-border-subtle/80 rounded-[2.5rem] min-h-[450px] lg:min-h-[600px] relative overflow-hidden shadow-2xl">
              
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent-yellow/5 blur-[120px] pointer-events-none rounded-full" />
              <div className="absolute bottom-4 left-1/4 w-64 h-64 bg-accent-yellow/5 blur-[100px] pointer-events-none rounded-full" />

              {!image ? (
                // Dropzone Upload Area
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-full max-w-2xl border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-6 bg-bg-tertiary/20 backdrop-blur-sm select-none",
                    isDragging 
                      ? "border-accent-yellow bg-accent-yellow/5 scale-[1.01]" 
                      : "border-border-subtle hover:border-accent-yellow/40 hover:bg-bg-tertiary/40"
                  )}
                >
                  <div className="w-16 h-16 rounded-full bg-accent-yellow/10 border border-accent-yellow/20 flex items-center justify-center text-accent-yellow shadow-lg shadow-accent-yellow/5">
                    <Upload className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-display font-black uppercase text-white tracking-wide">PILIH ATAU SERET FOTO</h3>
                    <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                      Mendukung format JPG, PNG, WEBP (Tanpa Batas Resolusi)
                    </p>
                  </div>

                  <div className="px-5 py-2.5 bg-accent-yellow text-bg-primary text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-transform flex items-center gap-2">
                    <Upload className="w-4 h-4 shrink-0" />
                    Pilih File Foto
                  </div>

                  {isReadingExif && (
                    <div className="flex items-center gap-2 text-xs text-accent-yellow animate-pulse">
                      <RotateCw className="w-4 h-4 animate-spin" />
                      Mengekstraksi Data EXIF Kamera...
                    </div>
                  )}
                </motion.div>
              ) : (
                // Interactive real-time responsive canvas
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex flex-col items-center space-y-6"
                >
                  {/* Canvas container with maximum height responsive sizing */}
                  <div 
                    ref={previewContainerRef}
                    className="w-full flex items-center justify-center p-2 rounded-2xl relative select-none cursor-zoom-in group/canvas"
                  >
                    <canvas 
                      ref={canvasRef}
                      className="w-full h-auto max-h-[60vh] object-contain rounded-xl border border-neutral-800 shadow-2xl transition-shadow group-hover/canvas:shadow-[0_0_50px_rgba(245,197,24,0.1)]"
                    />
                  </div>

                  {/* Actions under design */}
                  <div className="flex items-center justify-between w-full max-w-2xl bg-bg-tertiary/60 border border-border-subtle/80 rounded-2xl p-4 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-accent-yellow tracking-wider">Resolusi Foto Asli</span>
                      <span className="text-xs font-mono font-bold text-white mt-0.5">
                        {imageDimensions.width} x {imageDimensions.height} PX ({( (imageDimensions.width * imageDimensions.height) / 1000000 ).toFixed(1)} Megapixel)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setImage(null);
                          setImageName('');
                          setHasExif(false);
                        }}
                        className="p-3 bg-bg-primary text-text-secondary hover:text-red-500 rounded-xl transition-all border border-border-subtle flex items-center gap-2 text-[10px] font-black uppercase tracking-wider"
                      >
                        Hapus Foto
                      </button>

                      <button
                        onClick={handleExportImage}
                        className="px-6 py-3 bg-accent-yellow text-bg-primary font-black rounded-xl hover:bg-white text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-accent-yellow/10 hover:scale-[1.02] active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        Simpan Foto
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Invisibly persistent file selector inputs */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file);
                }} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            {/* RIGHT AREA: Interactive Multi-Accordion Customization Dashboard */}
            <div className="col-span-1 lg:col-span-5 xl:col-span-4 space-y-6">
              
              {/* Account Quota / Premium Notice Banner */}
              <div className="bg-bg-secondary/40 border border-border-subtle p-5 rounded-3xl space-y-3 relative overflow-hidden backdrop-blur-md shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-yellow/5 blur-2xl pointer-events-none rounded-full" />
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-accent-yellow/10 border border-accent-yellow/25 flex items-center justify-center text-accent-yellow shrink-0 mt-0.5 animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-display font-black tracking-wide text-white uppercase flex items-center gap-1.5">
                      {user ? 'AKUN PRO TERVERIFIKASI' : 'KUOTA GENERATOR GRATIS'}
                      {user && <span className="text-[7.5px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20 uppercase font-black tracking-widest text-[#10B981]">PRO</span>}
                    </h4>
                    <p className="text-[10px] text-text-secondary leading-relaxed font-semibold uppercase tracking-wider">
                      {user ? (
                        <>Akses ekspor tanpa batas & sinkronisasi cloud aktif untuk <span className="text-white font-bold">{user.displayName || 'Kreator'}</span></>
                      ) : (
                        <>Sisa kuota gratis Anda: <span className={cn("font-black text-xs px-1.5 py-0.5 bg-white/5 rounded-md", usageCount >= 5 ? "text-red-500 fill-red-500" : "text-accent-yellow")}>{Math.max(0, 5 - usageCount)} / 5</span> ekspor</>
                      )}
                    </p>
                  </div>
                </div>
                {!user && (
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full py-2.5 bg-accent-yellow text-bg-primary hover:bg-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-accent-yellow/5 flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3 h-3" />
                    Buka Akses Tanpa Batas (Masuk Google)
                  </button>
                )}
              </div>

              {/* Card 00: DESIGN TEMPLATES MANAGER (BETA) */}
              <div className="bg-bg-secondary/80 border border-border-subtle p-6 rounded-3xl space-y-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className="text-[8px] font-black tracking-widest uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-lg">
                    BETA
                  </span>
                </div>

                <div className="flex items-center gap-3 border-b border-border-subtle/80 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-accent-yellow/10 border border-accent-yellow/20 flex items-center justify-center text-accent-yellow">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-black uppercase leading-none text-white tracking-wide">
                      TEMPLATE DESAIN
                    </h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Simpan & Muat Preset Bingkai</p>
                  </div>
                </div>

                {/* Templates list view */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {loadingTemplates ? (
                    <div className="flex items-center justify-center py-6 text-accent-yellow/60 text-xs gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Memuat template desain...
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-6 text-text-secondary text-[10px] uppercase font-black tracking-wide bg-bg-tertiary/20 rounded-2xl border border-dashed border-border-subtle">
                      Tidak ada template kustom disimpan
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-1.5">
                      {templates.map((temp) => (
                        <div
                          key={temp.id}
                          onClick={() => applyTemplate(temp)}
                          className="group w-full bg-bg-tertiary/40 border border-border-subtle/60 hover:border-accent-yellow/40 hover:bg-bg-tertiary/90 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-all flex items-center justify-between gap-2"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-black text-white group-hover:text-accent-yellow uppercase truncate">
                              {temp.name}
                            </span>
                            <span className="text-[7.5px] text-text-secondary font-black uppercase tracking-wider">
                              Layout: {temp.config?.layoutStyle} • Brand: {temp.config?.cameraBrand}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {temp.isDefault ? (
                              <span className="text-[7px] font-black text-accent-yellow/55 uppercase tracking-widest bg-accent-yellow/5 px-1 py-0.5 rounded border border-accent-yellow/10">
                                Preset
                              </span>
                            ) : (
                              <button
                                onClick={(e) => handleDeleteTemplate(temp.id, e)}
                                className="p-1 hover:bg-red-500/10 text-text-secondary hover:text-red-500 rounded-lg transition-colors"
                                title="Hapus Template Kustom"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save current config layout form */}
                <div className="pt-3 border-t border-border-subtle/60 space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                    Simpan Desain Saat Ini ke Template
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nama Template Anda..."
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      maxLength={24}
                      className="flex-1 bg-bg-tertiary border border-border-subtle rounded-xl px-3 py-2 outline-none focus:border-accent-yellow text-xs font-semibold text-white placeholder-text-secondary/50 uppercase tracking-widest"
                    />
                    <button
                      onClick={handleSaveTemplate}
                      className="px-4 bg-bg-tertiary/80 text-accent-yellow hover:bg-accent-yellow hover:text-bg-primary rounded-xl border border-accent-yellow/30 font-black text-[9px] uppercase tracking-wider transition-all flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Simpan
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 0: Premium Frame Layout Selector */}
              <div className="bg-bg-secondary/80 border border-border-subtle p-6 rounded-3xl space-y-6 shadow-xl relative">
                <div className="flex items-center gap-3 border-b border-border-subtle/80 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-accent-yellow/10 border border-accent-yellow/20 flex items-center justify-center text-accent-yellow">
                    <Grid className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-black uppercase leading-none text-white tracking-wide">VARIASI LAYOUT BINGKAI</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Premium Frame Presets</p>
                  </div>
                </div>

                {/* Layout Grid Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'classic', name: 'Leica Classic', desc: 'Logo di tengah, spesifikasi di kiri, identitas fotografer di kanan' },
                    { id: 'basic', name: 'BASIC', desc: 'Logo & EXIF di kanan dengan sekat pembatas, identitas di kiri' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setLayoutStyle(style.id as any)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all duration-300 relative flex flex-col justify-between h-24 select-none",
                        layoutStyle === style.id
                          ? "bg-bg-tertiary text-accent-yellow border-accent-yellow shadow-lg shadow-accent-yellow/5"
                          : "bg-bg-tertiary/40 text-text-secondary border-border-subtle hover:border-neutral-700 hover:text-white"
                      )}
                    >
                      {layoutStyle === style.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-yellow absolute top-2.5 right-2.5" />
                      )}
                      <span className="text-[10px] font-black uppercase tracking-wider block">{style.name}</span>
                      <span className="text-[8px] leading-normal font-medium text-text-secondary opacity-75 mt-1 block">{style.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Location Input (Unconditional) */}
                <div className="space-y-2 pt-2 border-t border-border-subtle/40">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex justify-between">
                    <span>Lokasi Pengambilan Foto</span>
                    <span className="text-[8px] opacity-60">Lokasi / Keterangan</span>
                  </label>
                  <input
                    type="text"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    maxLength={36}
                    placeholder="e.g. Athens, Greece"
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-4 py-3 outline-none focus:border-accent-yellow text-xs font-semibold text-white placeholder-text-secondary/50 uppercase tracking-widest"
                  />
                </div>

                {/* Gaya Font Utama (Watermark) */}
                <div className="space-y-2.5 pt-4 border-t border-border-subtle/40">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex justify-between">
                    <span>Gaya Font Utama (Watermark)</span>
                    <span className="text-[8px] opacity-60">Font Family</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'sans', name: 'Sans-Serif', desc: 'Modern' },
                      { id: 'serif', name: 'Serif', desc: 'Klasik' },
                      { id: 'handwriting', name: 'Handwrite', desc: 'Tulis Tangan' }
                    ].map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => setWatermarkFont(font.id as any)}
                        className={cn(
                          "py-2 px-1 rounded-xl border text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[50px] select-none",
                          watermarkFont === font.id
                            ? "bg-bg-tertiary text-accent-yellow border-accent-yellow shadow shadow-accent-yellow/5"
                            : "bg-bg-tertiary/40 text-text-secondary border-border-subtle hover:border-neutral-700 hover:text-white"
                        )}
                      >
                        <span className="text-[9px] font-black block">
                          {font.name}
                        </span>
                        <span className="text-[7px] text-text-secondary opacity-75">{font.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Accordion Card 1: Main Bottom Frame settings */}
              <div className="bg-bg-secondary/80 border border-border-subtle p-6 rounded-3xl space-y-6 shadow-xl relative">
                <div className="flex items-center gap-3 border-b border-border-subtle/80 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-accent-yellow/10 border border-accent-yellow/20 flex items-center justify-center text-accent-yellow">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-black uppercase leading-none text-white tracking-wide">PENGATURAN BINGKAI</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Custom Style Layout</p>
                  </div>
                </div>

                {/* Background color choice */}
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Warna Latar Belakang</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFrameBg('black')}
                      className={cn(
                        "py-3 rounded-xl border flex items-center justify-center gap-2 text-[10px] uppercase font-black transition-all",
                        frameBg === 'black' 
                          ? "bg-black text-white border-accent-yellow shadow-lg" 
                          : "bg-neutral-900 text-text-secondary border-border-subtle hover:border-neutral-700"
                      )}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-black border border-white" />
                      Hitam Gelap
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrameBg('white')}
                      className={cn(
                        "py-3 rounded-xl border flex items-center justify-center gap-2 text-[10px] uppercase font-black transition-all",
                        frameBg === 'white' 
                          ? "bg-white text-black border-accent-yellow shadow-lg shadow-white/5" 
                          : "bg-neutral-800 text-text-secondary border-border-subtle hover:border-neutral-700"
                      )}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-white border border-neutral-300" />
                      Putih Terang
                    </button>
                  </div>
                </div>

                {/* Left side title input */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex justify-between">
                    <span>Beri Teks / Judul Foto</span>
                    <span className="text-[8px] opacity-60">SISI KIRI BINGKAI</span>
                  </label>
                  <input
                    type="text"
                    value={userTitle}
                    onChange={(e) => setUserTitle(e.target.value)}
                    maxLength={32}
                    placeholder="e.g. CLASSIC STREET SHOT"
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-4 py-3 outline-none focus:border-accent-yellow text-xs font-semibold text-white placeholder-text-secondary/50 uppercase tracking-widest"
                  />
                </div>

                {/* Date dynamic display info (read-only warning) */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex justify-between">
                    <span>Tanggal & Waktu Foto</span>
                    <span className="text-[8px] opacity-60">DIBAWAH JUDUL KIRI</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={hasExif ? exif.dateTime : customDate}
                      onChange={(e) => !hasExif && setCustomDate(e.target.value)}
                      disabled={hasExif}
                      className={cn(
                        "w-full bg-bg-tertiary border border-border-subtle rounded-xl px-4 py-3 outline-none focus:border-accent-yellow text-xs font-mono text-white/80",
                        hasExif && "opacity-60 cursor-not-allowed bg-bg-tertiary/40"
                      )}
                    />
                    {hasExif && (
                      <span className="absolute top-2.5 right-3 px-1.5 py-0.5 bg-accent-yellow/10 text-accent-yellow text-[8px] font-black uppercase tracking-wider rounded border border-accent-yellow/20">
                        Otomatis EXIF
                      </span>
                    )}
                  </div>
                  {hasExif && (
                    <p className="text-[8px] text-text-secondary font-semibold uppercase leading-snug">
                      Data waktu terkunci otomatis dari data EXIF foto asli untuk menjaga keaslian waktu potret.
                    </p>
                  )}
                </div>
              </div>

              {/* Accordion Card 2: Camera Brands Centering */}
              <div className="bg-bg-secondary/80 border border-border-subtle p-6 rounded-3xl space-y-6 shadow-xl relative">
                <div className="flex items-center gap-3 border-b border-border-subtle/80 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-accent-yellow/10 border border-accent-yellow/20 flex items-center justify-center text-accent-yellow">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-black uppercase leading-none text-white tracking-wide">LOGO KEMRE / BRAND</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Center Brand Icon</p>
                  </div>
                </div>

                {/* Grid selection brands */}
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Pilih Logo Kamera</label>
                  <div className="grid grid-cols-2 gap-2">
                    {cameraBrands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => {
                          if (brand.id === 'custom') {
                            customLogoInputRef.current?.click();
                          } else {
                            setCameraBrand(brand.id);
                          }
                        }}
                        className={cn(
                          "py-3 rounded-xl border text-[10px] font-bold uppercase transition-all relative flex items-center justify-center gap-2 min-h-[44px]",
                          cameraBrand === brand.id
                            ? "bg-bg-tertiary text-accent-yellow border-accent-yellow shadow-lg shadow-accent-yellow/5"
                            : "bg-bg-tertiary/40 text-text-secondary border-border-subtle hover:border-neutral-700 hover:text-white"
                        )}
                      >
                        {cameraBrand === brand.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-yellow absolute top-1.5 right-1.5" />
                        )}
                        <BrandLogoGraphic id={brand.id} isSelected={cameraBrand === brand.id} />
                      </button>
                    ))}
                  </div>

                  {/* Hidden file input for custom logo PNG loading */}
                  <input
                    type="file"
                    ref={customLogoInputRef}
                    onChange={handleCustomLogoUpload}
                    className="hidden"
                    accept="image/png"
                  />

                  {customLogoFile && cameraBrand === 'custom' && (
                    <div className="p-3 bg-bg-tertiary border border-border-subtle rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-black/30 border border-[#333] rounded flex items-center justify-center p-1">
                          <img src={customLogoFile} className="w-full h-full object-contain" alt="Custom Logo" />
                        </div>
                        <span className="text-[9px] font-black uppercase text-accent-yellow tracking-wider">Logo Anda Aktif</span>
                      </div>
                      <button 
                        onClick={() => {
                          setCustomLogoFile(null);
                          setCameraBrand('leica');
                        }}
                        className="text-[8px] font-black uppercase text-red-400 hover:text-red-500 hover:underline"
                      >
                        Ganti
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Accordion Card 3: Cursive / Handwriting Premium Signature */}
              <div className="bg-bg-secondary/80 border border-border-subtle p-6 rounded-3xl space-y-6 shadow-xl relative">
                <div className="flex items-center justify-between border-b border-border-subtle/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-yellow/10 border border-accent-yellow/20 flex items-center justify-center text-accent-yellow">
                      <PenTool className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-display font-black uppercase leading-none text-white tracking-wide">TANDA TANGAN</h3>
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Custom Stack Right Signature</p>
                    </div>
                  </div>

                  {/* Switch toggle control signature */}
                  <button
                    onClick={() => setShowSignature(!showSignature)}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative flex items-center px-1",
                      showSignature ? "bg-accent-yellow justify-end" : "bg-neutral-800 justify-start"
                    )}
                  >
                    <motion.div 
                      layout
                      className={cn(
                        "w-4.5 h-4.5 rounded-full shadow-lg",
                        showSignature ? "bg-bg-primary" : "bg-text-secondary"
                      )} 
                    />
                  </button>
                </div>

                {showSignature && (
                  <>
                    {/* Text String */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex justify-between">
                        <span>Teks Tanda Tangan</span>
                        <span className="text-[8px] opacity-60">SISI KANAN ATAS EXIF</span>
                      </label>
                      <input
                        type="text"
                        value={signatureText}
                        onChange={(e) => setSignatureText(e.target.value)}
                        maxLength={24}
                        placeholder="Masukkan nama tanda tangan"
                        className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-4 py-3 outline-none focus:border-accent-yellow text-xs font-semibold text-white placeholder-text-secondary/50"
                      />
                    </div>

                    {/* Signature Font Family Selection list */}
                    {signatureText.trim() !== '' && (
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Gaya Font Tanda Tangan</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'Dancing Script', name: 'Dancing Cursive', fontStyle: "'Dancing Script', cursive" },
                            { id: 'Playball', name: 'Playball Script', fontStyle: "'Playball', cursive" },
                            { id: 'Sacramento', name: 'Sacramento Script', fontStyle: "'Sacramento', cursive" },
                            { id: 'Great Vibes', name: 'Great Vibes Elegant', fontStyle: "'Great Vibes', cursive" },
                            { id: 'Inter Tight', name: 'Inter Tight Sans', fontStyle: "'Inter Tight', sans-serif" }
                          ].map((font) => (
                            <button
                              key={font.id}
                              onClick={() => setSignatureFont(font.id)}
                              className={cn(
                                "py-2 px-1 text-[10px] font-semibold rounded-xl border text-center transition-all",
                                signatureFont === font.id
                                  ? "bg-bg-tertiary border-accent-yellow text-accent-yellow"
                                  : "bg-bg-tertiary/40 border-border-subtle text-text-secondary hover:text-white"
                              )}
                              style={{ fontFamily: font.fontStyle }}
                            >
                              {font.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Accordion Card 4: Copyright Overlays (Copyright overlay Protection) */}
              <div className="bg-bg-secondary/80 border border-border-subtle p-6 rounded-3xl space-y-6 shadow-xl relative">
                <div className="flex items-center justify-between border-b border-border-subtle/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-yellow/10 border border-accent-yellow/20 flex items-center justify-center text-accent-yellow">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-display font-black uppercase leading-none text-white tracking-wide">LAPIS WATERMARK C/R</h3>
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Copyright Overlay Protection</p>
                    </div>
                  </div>

                  {/* Switch toggle control overlay watermark */}
                  <button
                    onClick={() => setShowOverlay(!showOverlay)}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative flex items-center px-1",
                      showOverlay ? "bg-accent-yellow justify-end" : "bg-neutral-800 justify-start"
                    )}
                  >
                    <motion.div 
                      layout
                      className={cn(
                        "w-4.5 h-4.5 rounded-full shadow-lg",
                        showOverlay ? "bg-bg-primary" : "bg-text-secondary"
                      )} 
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {showOverlay && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6 overflow-hidden pt-2"
                    >
                      {/* Overlay Type Picker */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Pola Transparansi Lapis</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setOverlayType('text')}
                            className={cn(
                              "py-2 rounded-xl border text-[10px] font-bold uppercase transition-all",
                              overlayType === 'text'
                                ? "bg-bg-tertiary border-accent-yellow text-accent-yellow"
                                : "bg-bg-tertiary/40 border-border-subtle text-text-secondary hover:text-white"
                            )}
                          >
                            Teks Hak Cipta
                          </button>
                          <button
                            onClick={() => {
                              if (cameraBrand === 'custom' && customLogoFile) {
                                setOverlayType('logo');
                              } else {
                                alert("Silakan unggah logo kustom di tab Pengaturan Logo Kamera terlebih dahulu untuk menggunakan layer logo kustom.");
                              }
                            }}
                            className={cn(
                              "py-2 rounded-xl border text-[10px] font-bold uppercase transition-all",
                              overlayType === 'logo'
                                ? "bg-bg-tertiary border-accent-yellow text-accent-yellow"
                                : "bg-bg-tertiary/40 border-border-subtle text-text-secondary hover:text-white"
                            )}
                          >
                            Logo Kustom
                          </button>
                        </div>
                      </div>

                      {/* Copyright Text Input */}
                      {overlayType === 'text' && (
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Teks Overlay</label>
                          <input
                            type="text"
                            value={overlayText}
                            onChange={(e) => setOverlayText(e.target.value)}
                            maxLength={48}
                            className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-4 py-3 outline-none focus:border-accent-yellow text-xs font-semibold text-white placeholder-text-secondary/50"
                          />
                        </div>
                      )}

                      {/* Pattern Selector */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Penempatan Pattern</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setOverlayPattern('center')}
                            className={cn(
                              "py-2 rounded-xl border text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5",
                              overlayPattern === 'center'
                                ? "bg-bg-tertiary border-accent-yellow text-accent-yellow"
                                : "bg-bg-tertiary/40 border-border-subtle text-text-secondary hover:text-white"
                            )}
                          >
                            <Sparkle className="w-3.5 h-3.5" />
                            Satu di Tengah
                          </button>
                          <button
                            onClick={() => setOverlayPattern('tiled')}
                            className={cn(
                              "py-2 rounded-xl border text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5",
                              overlayPattern === 'tiled'
                                ? "bg-bg-tertiary border-accent-yellow text-accent-yellow"
                                : "bg-bg-tertiary/40 border-border-subtle text-text-secondary hover:text-white"
                            )}
                          >
                            <Grid className="w-3.5 h-3.5" />
                            Ubin / Tiled
                          </button>
                        </div>
                      </div>

                      {/* Opacity slider */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] font-black uppercase text-text-secondary tracking-widest">
                          <span>Tingkat Transparansi (Opacity)</span>
                          <span className="text-accent-yellow text-xs">{overlayOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="80"
                          value={overlayOpacity}
                          onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                          className="w-full accent-accent-yellow h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Read Only EXIF parameters overview card */}
              {image && (
                <div className="bg-bg-secondary p-6 rounded-3xl border border-border-subtle space-y-4 shadow-md bg-gradient-to-br from-bg-secondary to-bg-tertiary/20">
                  <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
                    <Info className="w-4 h-4 text-accent-yellow" />
                    <span className="text-[9px] font-black uppercase text-white tracking-widest">INFORMASI TEKNIS EXIF</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed font-mono">
                    <div className="p-2 border border-border-subtle/50 bg-black/10 rounded-lg">
                      <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Kamera</p>
                      <p className="font-bold text-[10px] text-white mt-1 truncate">{exif.cameraModel}</p>
                    </div>

                    <div className="p-2 border border-border-subtle/50 bg-black/10 rounded-lg">
                      <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Focal Length</p>
                      <p className="font-bold text-[10px] text-white mt-1">{exif.focalLength}</p>
                    </div>

                    <div className="p-2 border border-border-subtle/50 bg-black/10 rounded-lg">
                      <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Diafragma</p>
                      <p className="font-bold text-[10px] text-text-primary mt-1">{exif.aperture}</p>
                    </div>

                    <div className="p-2 border border-border-subtle/50 bg-black/10 rounded-lg">
                      <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Shutter Speed</p>
                      <p className="font-bold text-[10px] text-text-primary mt-1">{exif.shutterSpeed}</p>
                    </div>

                    <div className="p-2 border border-border-subtle/50 bg-black/10 rounded-lg col-span-2">
                      <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Gaya Sensitivitas ISO</p>
                      <p className="font-bold text-[10px] text-accent-yellow mt-1">{exif.iso}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {!isEmbedded && <Footer />}
      {!isEmbedded && <MobileBottomNavbar onSearchClick={() => setIsSearchOpen(true)} />}
      {!isEmbedded && <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}

      {/* Google Login Limit Modal Overlay */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative max-w-md w-full bg-bg-secondary border border-accent-yellow/40 p-8 rounded-[2rem] text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-yellow/10 border border-accent-yellow/25 flex items-center justify-center text-accent-yellow shadow-lg shadow-accent-yellow/5">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-display font-black uppercase text-white tracking-wide">
                  BATAS EKSPOR TERCAPAI
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#E4002B] animate-pulse">
                  Alat Watermark Generator
                </p>
                <p className="text-xs text-text-secondary leading-relaxed pt-2">
                  Anda telah menghabiskan <span className="text-white font-bold">5 kuota gratis</span> untuk membuat watermark. Silakan masuk secara gratis dengan akun Google Anda untuk terus menikmati ekspor tanpa batas, template kustom, dan sinkronisasi awan otomatis!
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-3.5 bg-accent-yellow text-bg-primary hover:bg-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-accent-yellow/10 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Masuk dengan Google (Gratis)
                </button>
                
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full py-3.5 bg-bg-tertiary text-text-secondary hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-border-subtle hover:border-neutral-700"
                >
                  Kembali
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
