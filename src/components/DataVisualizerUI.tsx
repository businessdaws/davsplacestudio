import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  Download, 
  FileText, 
  Upload, 
  RefreshCw, 
  BarChart2, 
  PieChart, 
  LineChart, 
  Table, 
  ArrowRight, 
  Sliders, 
  Info, 
  AlertCircle,
  HelpCircle,
  BadgeAlert,
  ChevronDown,
  LayoutGrid,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';
import { cn } from '../lib/utils';

// Import Chart.js and plugins
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Excel and CSV parsing
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// jsPDF and html2canvas for exports
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Register Chart.js elements
Chart.register(...registerables, ChartDataLabels);

interface DataVisualizerUIProps {
  user: any;
  profile?: any;
}

const COLOR_THEMES = {
  'davsplace': ['#facc15', '#f97316', '#ef4444', '#8b5cf6', '#3b82f6'],
  'ocean': ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#84cc16'],
  'sunset': ['#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#6366f1'],
  'forest': ['#15803d', '#16a34a', '#65a30d', '#ca8a04', '#92400e'],
  'monochrome': ['#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155'],
  'pastel': ['#fde68a', '#bbf7d0', '#bfdbfe', '#f5d0fe', '#fed7aa'],
  'corporate': ['#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa'],
  'neon': ['#e0f200', '#00ff88', '#00cfff', '#ff00aa', '#ff5500'],
};

const TEMPLATES = [
  {
    id: 'monthly-sales',
    name: 'Laporan Penjualan',
    icon: '📈',
    chartType: 'vertical-bar',
    title: 'Penjualan Bulanan & Target',
    headers: ['Bulan', 'Penjualan', 'Target'],
    rows: [
      ['Januari', 12500, 10000],
      ['Februari', 15200, 12000],
      ['Maret', 9800, 12000],
      ['April', 14300, 13000],
      ['Mei', 18600, 15000],
      ['Juni', 21000, 18000],
    ],
    theme: 'davsplace'
  },
  {
    id: 'social-stats',
    name: 'Statistik Sosmed',
    icon: '📱',
    chartType: 'line',
    title: 'Reach & Followers Bulanan',
    headers: ['Minggu', 'Followers Reach', 'Engagement'],
    rows: [
      ['M1', 4500, 320],
      ['M2', 5200, 410],
      ['M3', 5800, 460],
      ['M4', 6400, 580],
    ],
    theme: 'ocean'
  },
  {
    id: 'expense-breakdown',
    name: 'Breakdown Biaya',
    icon: '💰',
    chartType: 'donut',
    title: 'Alokasi Biaya Operasional',
    headers: ['Kategori', 'Jumlah Pengeluaran'],
    rows: [
      ['R&D / Kreatif', 4500],
      ['Iklan Sosmed', 3500],
      ['Operasional', 2500],
      ['Gaji Tim', 8000],
      ['Pajak & Legal', 1500],
    ],
    theme: 'sunset'
  },
  {
    id: 'radar-comp',
    name: 'Aspek Kompetitor',
    icon: '⚖️',
    chartType: 'radar',
    title: 'Analisa Fitur vs Kompetitor',
    headers: ['Aspek', 'Studio Kami', 'Kompetitor A', 'Kompetitor B'],
    rows: [
      ['Desain Grafik', 90, 70, 60],
      ['Kecepatan AI', 95, 60, 80],
      ['Visual Engine', 88, 50, 45],
      ['Layanan User', 82, 80, 75],
      ['Metode Ekspor', 90, 65, 70]
    ],
    theme: 'corporate'
  }
];

export default function DataVisualizerUI({ user, profile }: DataVisualizerUIProps) {
  const isPremium = profile?.is_premium === true;

  // Tabs states
  const [inputTab, setInputTab] = useState<'manual' | 'file' | 'ai'>('manual');
  
  // Custom spreadsheet-like manual input state
  const [tableTitle, setTableTitle] = useState('Data Laporan Kinerja');
  const [headers, setHeaders] = useState<string[]>(['Bulan', 'Penjualan', 'Target']);
  const [rows, setRows] = useState<any[][]>([
    ['Januari', 12500, 10000],
    ['Februari', 15200, 12000],
    ['Maret', 9800, 12000],
    ['April', 14300, 13000]
  ]);

  // Fast paste text box
  const [pasteData, setPasteData] = useState('');

  // AI Prompt generated state
  const [aiPrompt, setAiPrompt] = useState('Data performa bulanan brand fashion muslim kami selama 6 bulan terakhir');
  const [generatingData, setGeneratingData] = useState(false);

  // File Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Selected Visualization state
  const [selectedChartType, setSelectedChartType] = useState<string>('vertical-bar');
  
  // Customization controls
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof COLOR_THEMES>('davsplace');
  const [chartBg, setChartBg] = useState<'transparent' | 'dark' | 'light'>('dark');
  const [showValues, setShowValues] = useState<boolean>(true);
  const [chartHeight, setChartHeight] = useState<number>(360);
  const [chartTitleFont, setChartTitleFont] = useState<string>('Space Grotesk');
  const [isGradient, setIsGradient] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);

  // Canvas orientation/aspect size
  const [formatSize, setFormatSize] = useState<string>('square'); // 'square' | 'story' | 'landscape' | 'banner'

  // AI Insights states
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [insightsResult, setInsightsResult] = useState<any | null>(null);

  const [savingInDashboard, setSavingInDashboard] = useState(false);
  const [isSavedDone, setIsSavedDone] = useState(false);

  // Refs for drawing and export
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const exportPreviewAreaRef = useRef<HTMLDivElement | null>(null);

  const [generalError, setGeneralError] = useState<string | null>(null);

  // Helper check for Guest limitations
  const checkChartLimit = (type: string) => {
    if (isPremium) return true;
    const allowed = ['vertical-bar', 'line', 'pie', 'table'];
    return allowed.includes(type);
  };

  const getFormatDimensions = () => {
    switch (formatSize) {
      case 'story': return { width: '450px', height: '600px', aspect: '9:16' };
      case 'landscape': return { width: '640px', height: '360px', aspect: '16:9' };
      case 'banner': return { width: '600px', height: '314px', aspect: '1.91:1' };
      default: return { width: '500px', height: '500px', aspect: '1:1' };
    }
  };

  // Build and re-render Chart.js
  useEffect(() => {
    if (!chartCanvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (selectedChartType === 'table') return;

    const ctx = chartCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const currentColors = COLOR_THEMES[selectedTheme];
    
    // Labels is always the first column
    const labels = rows.map(r => String(r[0] || ''));
    
    // Datasets are built from other columns
    const datasetsCount = headers.length - 1;
    const datasets: any[] = [];

    for (let c = 0; c < datasetsCount; c++) {
      const dataIndex = c + 1;
      const dataLabel = headers[dataIndex] || `Seri ${dataIndex}`;
      const dataPoints = rows.map(r => {
        const val = r[dataIndex];
        return typeof val === 'number' ? val : Number(val) || 0;
      });

      const colorBase = currentColors[c % currentColors.length];
      
      let backgroundConfig: any = colorBase;
      
      // Handle Gradients if toggle is on
      if (isGradient) {
        const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
        gradient.addColorStop(0, colorBase);
        gradient.addColorStop(1, `${colorBase}15`);
        backgroundConfig = gradient;
      }

      let spec: any = {
        label: dataLabel,
        data: dataPoints,
        backgroundColor: backgroundConfig,
        borderColor: colorBase,
        borderWidth: 2,
        tension: 0.3,
        fill: selectedChartType.includes('area') ? 'origin' : false,
      };

      if (selectedChartType === 'line' || selectedChartType === 'area') {
        spec.pointBackgroundColor = colorBase;
        spec.pointRadius = 4;
        spec.pointHoverRadius = 7;
      }

      datasets.push(spec);
    }

    // Chart structure mapping
    let chartTypeMap: any = 'bar';
    if (selectedChartType === 'horizontal-bar') {
      chartTypeMap = 'bar';
    } else if (selectedChartType === 'line' || selectedChartType === 'area') {
      chartTypeMap = 'line';
    } else if (selectedChartType === 'pie') {
      chartTypeMap = 'pie';
    } else if (selectedChartType === 'donut') {
      chartTypeMap = 'doughnut';
    } else if (selectedChartType === 'radar') {
      chartTypeMap = 'radar';
    }

    const config: any = {
      type: chartTypeMap,
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: selectedChartType === 'horizontal-bar' ? 'y' : 'x',
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: chartBg === 'light' ? '#1e293b' : '#94a3b8',
              font: { family: 'Inter', size: 11, weight: 'bold' }
            }
          },
          datalabels: {
            display: showValues,
            color: chartBg === 'light' ? '#334155' : '#f8fafc',
            anchor: 'end',
            align: 'top',
            backgroundColor: chartBg === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.7)',
            borderRadius: 4,
            padding: 3,
            font: { size: 9, weight: 'bold', family: 'Inter' },
            formatter: (val: any) => val.toLocaleString()
          },
          title: {
            display: true,
            text: tableTitle,
            color: chartBg === 'light' ? '#0f172a' : '#ffffff',
            font: { family: chartTitleFont, size: 16, weight: '900' },
            padding: { top: 10, bottom: 20 }
          }
        },
        scales: (selectedChartType === 'pie' || selectedChartType === 'donut' || selectedChartType === 'radar') ? {} : {
          x: {
            grid: { display: showGrid, color: chartBg === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' },
            ticks: { color: chartBg === 'light' ? '#64748b' : '#94a3b8', font: { size: 10 } }
          },
          y: {
            grid: { display: showGrid, color: chartBg === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' },
            ticks: { color: chartBg === 'light' ? '#64748b' : '#94a3b8', font: { size: 10 } }
          }
        }
      }
    };

    chartInstanceRef.current = new Chart(ctx, config);

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [
    selectedChartType, 
    headers, 
    rows, 
    selectedTheme, 
    chartBg, 
    showValues, 
    chartHeight, 
    chartTitleFont, 
    isGradient, 
    showGrid, 
    tableTitle
  ]);

  // Apply quick templates
  const selectTemplate = (item: typeof TEMPLATES[0]) => {
    setTableTitle(item.title);
    setHeaders([...item.headers]);
    setRows(JSON.parse(JSON.stringify(item.rows)));
    setSelectedChartType(item.chartType);
    setSelectedTheme(item.theme as any);
  };

  // CSV text parse
  const handleCSVTextParse = () => {
    if (!pasteData.trim()) return;
    try {
      Papa.parse(pasteData.trim(), {
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const list = results.data as any[][];
            const cleanHeaders = list[0].map(h => String(h || '').trim());
            const cleanRows = list.slice(1).map(row => {
              return row.map((cell, idx) => {
                if (idx === 0) return String(cell || '');
                const num = Number(String(cell || '').replace(/[\$,]/g, ''));
                return isNaN(num) ? String(cell || '') : num;
              });
            });
            setHeaders(cleanHeaders);
            setRows(cleanRows);
            setPasteData('');
          }
        }
      });
    } catch (err: any) {
      setGeneralError('Gagal memproses data salinan: ' + err.message);
    }
  };

  // Add row inside manual inputs
  const addRow = () => {
    const blankRow = headers.map((_, i) => i === 0 ? `Item ${rows.length + 1}` : 0);
    setRows([...rows, blankRow]);
  };

  // Add column inside manual inputs
  const addColumn = () => {
    const nextColNum = headers.length;
    setHeaders([...headers, `Data Seri ${nextColNum}`]);
    setRows(rows.map(row => [...row, 0]));
  };

  // Delete row matching index
  const deleteRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  // Delete column matching index
  const deleteColumn = (colIndex: number) => {
    if (headers.length <= 2) return;
    setHeaders(headers.filter((_, i) => i !== colIndex));
    setRows(rows.map(row => row.filter((_, idx) => idx !== colIndex)));
  };

  // Handle value key updates
  const handleCellChange = (rowIndex: number, colIndex: number, val: string) => {
    const currentRows = [...rows];
    if (colIndex === 0) {
      currentRows[rowIndex][colIndex] = val;
    } else {
      const num = Number(val);
      currentRows[rowIndex][colIndex] = isNaN(num) ? val : num;
    }
    setRows(currentRows);
  };

  // Handle header updates
  const handleHeaderChange = (index: number, val: string) => {
    const cur = [...headers];
    cur[index] = val;
    setHeaders(cur);
  };

  // === AI Data Dummy Generation ===
  const generateAIDataDummy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setGeneratingData(true);
    setErrorState(null);

    try {
      const response = await fetch('/api/ai/visualizer-generate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });

      if (!response.ok) {
        throw new Error('Gagal mendapatkan respon dari server.');
      }

      const resJson = await response.json();
      if (resJson.headers && resJson.rows) {
        setTableTitle(resJson.title || 'Laporan Data AI');
        setHeaders(resJson.headers);
        setRows(resJson.rows);
      } else {
        throw new Error('Struktur response JSON tidak sesuai standar.');
      }
    } catch (err: any) {
      setErrorState('Gagal generate data AI. Silakan coba kembali.');
    } finally {
      setGeneratingData(false);
    }
  };

  // === AI Insights Generation ===
  const generateAIInsights = async () => {
    if (!isPremium) {
      setErrorState('Fitur AI Business Insight hanya untuk member PRO. Silakan hubungi admin.');
      return;
    }

    setGeneratingInsights(true);
    setErrorState(null);

    try {
      const payload = {
        tableData: {
          title: tableTitle,
          headers,
          rows
        },
        selectedChartType
      };

      const response = await fetch('/api/ai/visualizer-generate-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Server returned an error.');
      }

      const data = await response.json();
      setInsightsResult(data);
    } catch (err: any) {
      setErrorState('Gagal menghasilkan analisis data AI.');
    } finally {
      setGeneratingInsights(false);
    }
  };

  // === File uploads ===
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isPremium && !['.csv'].some(ext => file.name.endsWith(ext))) {
      setUploadError('Tipe file ini (Excel/PDF) memerlukan lisensi PRO. Klik Hubungi Admin.');
      return;
    }

    setUploadedFile(file);
    setUploadError(null);
    parseUploadedFile(file);
  };

  const parseUploadedFile = (file: File) => {
    setUploading(true);
    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        Papa.parse(text, {
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              const list = results.data as any[][];
              const cleanHeaders = list[0].map(h => String(h || '').trim());
              const cleanRows = list.slice(1).map(row => {
                return row.map((cell, idx) => {
                  if (idx === 0) return String(cell || '');
                  const num = Number(String(cell || '').replace(/[\$,]/g, ''));
                  return isNaN(num) ? String(cell || '') : num;
                });
              });
              setHeaders(cleanHeaders);
              setRows(cleanRows);
              setTableTitle(file.name.replace(/\.[^/.]+$/, ""));
              setUploading(false);
            }
          }
        });
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonList = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonList.length > 0) {
          const cleanHeaders = jsonList[0].map(h => String(h || '').trim());
          const cleanRows = jsonList.slice(1).map(row => {
            return row.map((cell, idx) => {
              if (idx === 0) return String(cell || '');
              const num = Number(cell);
              return isNaN(num) ? String(cell || '') : num;
            });
          });
          setHeaders(cleanHeaders);
          setRows(cleanRows);
          setTableTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
        setUploading(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      // PDF, DOCX, Img -> Send to server-side Gemini extract
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        try {
          const response = await fetch('/api/ai/visualizer-extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileData: base64Data,
              mimeType: file.type,
              fileName: file.name
            })
          });

          if (!response.ok) {
            throw new Error('Gagal mengekstrak data dari dokumen.');
          }

          const resData = await response.json();
          if (resData.headers && resData.rows) {
            setHeaders(resData.headers);
            setRows(resData.rows);
            setTableTitle(resData.title || file.name.replace(/\.[^/.]+$/, ""));
            setUploadError(null);
          } else {
            throw new Error('Pola data tabular tidak ditemukan dalam dokumen.');
          }
        } catch (err: any) {
          setUploadError(err.message || 'Gagal memproses dokumen dengan AI.');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Set transient error
  const [errorState, setErrorState] = useState<string | null>(null);

  // === EXPORTS ===
  const downloadChartImage = async (format: 'png' | 'jpeg') => {
    if (!exportPreviewAreaRef.current) return;
    
    // Limits validation for Guests
    if (!isPremium && format === 'jpeg') {
      setErrorState('Format JPEG memerlukan lisensi PRO. Klik Hubungi Admin.');
      return;
    }

    try {
      const originalClass = exportPreviewAreaRef.current.className;
      
      const canvasBlob = await html2canvas(exportPreviewAreaRef.current, {
        backgroundColor: chartBg === 'dark' ? '#0f172a' : '#ffffff',
        scale: 2,
      });

      const url = canvasBlob.toDataURL(`image/${format === 'png' ? 'png' : 'jpeg'}`);
      const link = document.createElement('a');
      link.download = `${tableTitle.toLowerCase().replace(/\s+/g, '_')}.${format}`;
      link.href = url;
      link.click();
    } catch (err) {
      setErrorState('Gagal men-generate file ekspor gambar.');
    }
  };

  const downloadPDFReport = async () => {
    if (!isPremium) {
      setErrorState('Ekspor format PDF memerlukan lisensi PRO. Klik Hubungi Admin.');
      return;
    }

    if (!exportPreviewAreaRef.current) return;

    try {
      const canvasBlob = await html2canvas(exportPreviewAreaRef.current, {
        backgroundColor: chartBg === 'dark' ? '#0f172a' : '#ffffff',
        scale: 2,
      });

      const imgData = canvasBlob.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvasBlob.height * imgWidth) / canvasBlob.width;
      
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text('Davsplace Studio AI - Data Report', 10, 15);
      
      pdf.addImage(imgData, 'PNG', 10, 25, imgWidth, imgHeight);

      if (insightsResult) {
        pdf.addPage();
        pdf.setFontSize(20);
        pdf.setTextColor(250, 204, 21); // Yellow Theme color
        pdf.text('AI BUSINESS INSIGHT REPORT', 10, 20);

        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Headline: "${insightsResult.headline}"`, 10, 35);

        pdf.setFontSize(12);
        pdf.text('Utama Insight:', 10, 50);
        
        let yOffset = 60;
        insightsResult.insights.forEach((ins: string, idx: number) => {
          pdf.text(`- ${ins}`, 15, yOffset);
          yOffset += 12;
        });

        pdf.text('Rekomendasi Bisnis Actionable:', 10, yOffset + 5);
        pdf.text(insightsResult.recommendation, 15, yOffset + 15, { maxWidth: 180 });
      }

      pdf.save(`${tableTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      setErrorState('Gagal membuat laporan PDF.');
    }
  };

  // === Save to cloud DB ===
  const saveContentToCloud = async () => {
    if (!user) return;
    setSavingInDashboard(true);
    setIsSavedDone(false);

    try {
      const savedObj = {
        user_id: user.uid,
        type: 'data_visualizer',
        headline: tableTitle,
        topic: `Tipe Chart: ${selectedChartType}`,
        caption: `Kustomisasi dengan tema ${selectedTheme}. Terdiri dari ${headers.length} kolom dan ${rows.length} baris data.`,
        created_at: serverTimestamp(),
        metadata: {
          chart_type: selectedChartType,
          theme: selectedTheme,
          headers: headers,
          rows: rows,
          insights: insightsResult || null
        }
      };

      await addDoc(collection(db, 'saved_contents'), savedObj);
      setIsSavedDone(true);
      setTimeout(() => setIsSavedDone(false), 3000);
    } catch (err) {
      setErrorState('Gagal menyimpan visualisasi ke cloud.');
    } finally {
      setSavingInDashboard(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-border-subtle">
        <div>
          <span className="text-[10px] bg-accent-yellow/10 border border-accent-yellow/20 text-accent-yellow text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 mb-3">
            <BarChart2 className="w-4 h-4" />
            ADVANCED TOOL
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-black uppercase text-white tracking-tight">
            DATA <span className="text-accent-yellow italic">VISUALIZER</span>
          </h2>
          <p className="text-text-secondary text-xs sm:text-xs tracking-normal mt-2 max-w-xl opacity-75">
            Ekstrak data instan dari dokumen/gambar ataupun ketik deskripsinya. AI otomatis memproses & menggambar diagram analitis premium berlisensi Studio dalam 1 klik.
          </p>
        </div>

        {/* Templates rail preview */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full no-scrollbar pt-2">
          {TEMPLATES.map(temp => (
            <button
              key={temp.id}
              onClick={() => selectTemplate(temp)}
              className="flex items-center gap-2 p-2 px-3 bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle rounded-xl text-[10px] font-bold uppercase tracking-tight text-text-secondary hover:text-white transition-all shrink-0"
            >
              <span>{temp.icon}</span>
              <span>{temp.name}</span>
            </button>
          ))}
        </div>
      </div>

      {errorState && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold uppercase tracking-wider">Kesalahan Sistem</p>
            <p className="opacity-80 mt-1">{errorState}</p>
          </div>
          <button onClick={() => setErrorState(null)} className="ml-auto text-[10px] font-bold hover:underline">TUTUP</button>
        </div>
      )}

      {/* Main interface layout split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Column 1: Config and Input Area (XL 5 cols) */}
        <div className="xl:col-span-5 space-y-8">
          
          {/* Section Container Tab */}
          <div className="bg-bg-secondary border border-border-subtle rounded-[2rem] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                1. SUMBER MASUKAN DATA
              </span>
              <span className="text-[8px] bg-bg-tertiary px-1.5 py-0.5 rounded text-accent-yellow font-black">
                {inputTab.toUpperCase()}
              </span>
            </div>

            {/* Input methodology tabs */}
            <div className="grid grid-cols-3 gap-1 bg-bg-primary p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setInputTab('manual')}
                className={cn(
                  "py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                  inputTab === 'manual' ? "bg-accent-yellow text-bg-primary shadow" : "text-text-secondary hover:text-white"
                )}
              >
                MANUAL
              </button>
              <button
                type="button"
                onClick={() => setInputTab('file')}
                className={cn(
                  "py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                  inputTab === 'file' ? "bg-accent-yellow text-bg-primary shadow" : "text-text-secondary hover:text-white"
                )}
              >
                ATTACH FILE
              </button>
              <button
                type="button"
                onClick={() => setInputTab('ai')}
                className={cn(
                  "py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                  inputTab === 'ai' ? "bg-accent-yellow text-bg-primary shadow" : "text-text-secondary hover:text-white"
                )}
              >
                AI GENERATE
              </button>
            </div>

            {/* Tab Panels */}
            {inputTab === 'manual' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Judul Laporan</label>
                  <input
                    type="text"
                    value={tableTitle}
                    onChange={(e) => setTableTitle(e.target.value)}
                    placeholder="Judul grafik..."
                    className="w-full bg-bg-primary border border-border-subtle rounded-xl px-4 py-3 outline-none focus:border-accent-yellow text-xs font-semibold text-white"
                  />
                </div>

                {/* FAST PAST OPTION */}
                <div className="p-4 bg-bg-tertiary/50 border border-border-subtle/50 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[8px] font-black uppercase tracking-widest text-[#94a3b8]">Paste spreadsheet CSV/Teks</label>
                    <button
                      type="button"
                      disabled={!pasteData.trim()}
                      onClick={handleCSVTextParse}
                      className="text-[8px] font-black text-accent-yellow uppercase hover:underline disabled:opacity-50"
                    >
                      PARSE / UPDATE
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={pasteData}
                    onChange={(e) => setPasteData(e.target.value)}
                    placeholder="Bulan,Target,Capaian&#10;Januari,1000,1200&#10;Februari,1100,1400"
                    className="w-full bg-bg-primary border border-border-subtle rounded-lg p-2 text-[10px] font-mono text-white placeholder-text-secondary/50 outline-none focus:border-accent-yellow resize-none"
                  />
                </div>
              </div>
            )}

            {inputTab === 'file' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border-subtle rounded-2xl p-6 text-center space-y-4 hover:border-accent-yellow/40 transition-colors">
                  <div className="w-12 h-12 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto text-text-secondary">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white uppercase">Upload Laporan Data</p>
                    <p className="text-[9px] text-text-secondary leading-normal">
                      Excel (.xlsx, .xls), CSV (.csv) {isPremium ? "atau PDF, Word, Screenshoot metadata (AI pro)" : ""}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.pdf,.docx,.doc,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="dashboard-visualizer-file"
                  />
                  <label
                    htmlFor="dashboard-visualizer-file"
                    className="inline-flex px-4 py-2 bg-accent-yellow hover:bg-white text-bg-primary text-[9px] font-black uppercase rounded-lg cursor-pointer transition-all leading-none"
                  >
                    CARI FILE
                  </label>
                </div>

                {uploading && (
                  <div className="flex items-center gap-2 justify-center py-2 text-accent-yellow text-[9px] font-black uppercase tracking-wider animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    AI Sedang memproses & Mengekstrak Data dari file...
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[9px] text-red-500 font-bold flex gap-1.5 items-start">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadedFile && (
                  <div className="p-3 bg-bg-tertiary border border-border-subtle rounded-xl flex items-center justify-between text-[10px] text-white">
                    <div className="truncate pr-4 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-accent-yellow shrink-0" />
                      <span className="truncate font-semibold">{uploadedFile.name}</span>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-text-secondary hover:text-red-500 text-[8px] font-black uppercase ml-auto shrink-0"
                    >
                      CLEAR
                    </button>
                  </div>
                )}
              </div>
            )}

            {inputTab === 'ai' && (
              <form onSubmit={generateAIDataDummy} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Deskripsikan Laporan yang Diinginkan</label>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Contoh: Laporan komparasi budget marketing kami versus sales closing selama 6 kuartal..."
                    className="w-full bg-bg-primary border border-border-subtle rounded-xl p-3 outline-none focus:border-accent-yellow text-xs font-semibold text-white placeholder-text-secondary/40"
                  />
                </div>
                <button
                  type="submit"
                  disabled={generatingData || !aiPrompt.trim()}
                  className="w-full py-3 bg-accent-yellow hover:bg-white text-bg-primary text-[10px] font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {generatingData ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sedang Membuat Data Dummy...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      GENERATE TABEL REALISTIS
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* SPREADSHEET EDITOR AREA */}
          <div className="bg-bg-secondary border border-border-subtle rounded-[2rem] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                2. EDIT DATA TABEL
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={addRow}
                  className="p-2 py-1 bg-bg-tertiary hover:bg-bg-primary border border-border-subtle rounded-lg text-[8px] font-black uppercase tracking-wider text-white hover:text-accent-yellow transition-all"
                >
                  + BARIS
                </button>
                <button
                  onClick={addColumn}
                  className="p-2 py-1 bg-bg-tertiary hover:bg-bg-primary border border-border-subtle rounded-lg text-[8px] font-black uppercase tracking-wider text-white hover:text-accent-yellow transition-all"
                >
                  + SERI DATA
                </button>
              </div>
            </div>

            {/* Structured responsive table viewport */}
            <div className="overflow-x-auto border border-border-subtle rounded-2xl custom-scrollbar max-h-[300px]">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-bg-primary border-b border-border-subtle">
                    {headers.map((h, colIdx) => (
                      <th key={colIdx} className="p-3 font-semibold relative text-white group bg-bg-tertiary/30 min-w-[100px]">
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                          className="w-full bg-transparent font-bold uppercase tracking-tight text-accent-yellow outline-none border-b border-transparent hover:border-accent-yellow/20 focus:border-accent-yellow"
                        />
                        {colIdx > 0 && (
                          <button
                            type="button"
                            onClick={() => deleteColumn(colIdx)}
                            className="absolute -top-1 -right-1 hidden group-hover:block bg-red-500 text-white rounded-full p-0.5 text-[7px]"
                          >
                            ×
                          </button>
                        )}
                      </th>
                    ))}
                    <th className="p-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-border-subtle hover:bg-bg-tertiary/20">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2">
                          <input
                            type={cIdx === 0 ? "text" : "number"}
                            value={cell}
                            onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                            className={cn(
                              "w-full bg-transparent p-1.5 outline-none rounded border border-transparent hover:border-border-subtle focus:bg-bg-primary text-xs",
                              cIdx === 0 ? "text-white font-medium" : "text-text-secondary font-mono text-right"
                            )}
                          />
                        </td>
                      ))}
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => deleteRow(rIdx)}
                          className="text-text-secondary hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Column 2: Dashboard Preview and Style Config (XL 7 cols) */}
        <div className="xl:col-span-7 space-y-8">
          
          {/* Main Visual Rendering Stage Container */}
          <div className="space-y-6">
            
            {/* Aspect Size Toggle bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-bg-secondary p-3 rounded-2xl border border-border-subtle">
              <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-2">
                Dimensi Keluaran Grafik
              </span>
              <div className="flex gap-1.5">
                {[
                  { id: 'square', label: 'SQUARE (1:1)' },
                  { id: 'story', label: 'STORY (9:16)' },
                  { id: 'landscape', label: 'LANDSCAPE (16:9)' },
                  { id: 'banner', label: 'FEED BANNER (1.91:1)' }
                ].map(dim => (
                  <button
                    key={dim.id}
                    onClick={() => setFormatSize(dim.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wide transition-all",
                      formatSize === dim.id ? "bg-accent-yellow text-bg-primary" : "bg-bg-tertiary text-text-secondary hover:text-white"
                    )}
                  >
                    {dim.label}
                  </button>
                ))}
              </div>
            </div>

            {/* THE VISUAL CANVAS BOX AREA */}
            <div className="flex justify-center items-center">
              <div
                ref={exportPreviewAreaRef}
                style={{
                  width: getFormatDimensions().width,
                  height: getFormatDimensions().height,
                }}
                className={cn(
                  "relative rounded-[2.5rem] border border-border-subtle p-8 flex flex-col justify-between shadow-2xl transition-all overflow-hidden",
                  chartBg === 'dark' ? "bg-slate-900 text-white" : chartBg === 'light' ? "bg-white text-slate-900" : "bg-transparent text-white"
                )}
              >
                {/* Visualizer Theme ambient backdrop lights */}
                {chartBg === 'dark' && (
                  <div 
                    className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[80px] opacity-25 pointer-events-none"
                    style={{ backgroundColor: COLOR_THEMES[selectedTheme][0] }}
                  />
                )}

                {/* Sub-Header branding */}
                <div className="flex justify-between items-center border-b pb-2 mb-2 border-border-subtle/30 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-accent-yellow rounded flex items-center justify-center font-display font-black text-bg-primary text-[10px]">
                      D
                    </div>
                    <span className={cn(
                      "font-display font-black text-[9px] uppercase tracking-widest",
                      chartBg === 'light' ? "text-slate-800" : "text-white"
                    )}>
                      Davsplace<span className="text-accent-yellow">.Studio</span>
                    </span>
                  </div>
                  <span className="text-[7.5px] font-mono opacity-50 uppercase tracking-widest pt-0.5">
                    Live Analyzer Report
                  </span>
                </div>

                {/* Content rendering wrapper */}
                <div className="flex-1 flex flex-col justify-center my-auto py-4">
                  {selectedChartType === 'table' ? (
                    <div className="w-full space-y-4">
                      <h4 className={cn(
                        "text-sm font-black uppercase tracking-tight text-center my-2",
                        chartBg === 'light' ? "text-slate-950" : "text-white"
                      )}
                      style={{ fontFamily: chartTitleFont }}
                      >
                        {tableTitle}
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-border-subtle/50">
                        <table className="w-full text-[10px] text-left border-collapse">
                          <thead>
                            <tr className={cn(
                              "border-b border-border-subtle/60",
                              chartBg === 'light' ? "bg-slate-100 text-slate-800" : "bg-slate-800/50 text-white"
                            )}>
                              {headers.map((h, i) => (
                                <th key={i} className="p-2.5 font-bold uppercase tracking-wide">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-border-subtle/30">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2.5 font-mono">{cell.toLocaleString()}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full overflow-hidden" style={{ height: `${chartHeight}px` }}>
                      <canvas ref={chartCanvasRef} id="chart-canvas" className="w-full h-full" />
                    </div>
                  )}
                </div>

                {/* Bottom Watermark Overlay for Basic accounts / custom branding toggle */}
                <div className="flex justify-between items-center pt-3 border-t border-border-subtle/30 text-[8px] relative z-10">
                  <span className="opacity-45 font-mono">DAVSPLACE STUDIO AI VISUALIZER ENGINE</span>
                  {showWatermark && (
                    <span className="text-accent-yellow font-display font-black tracking-widest uppercase bg-accent-yellow/10 px-2 py-0.5 rounded border border-accent-yellow/20">
                      🔒 PREMIUM REPORT
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CHOOSE CHART STYLE GRID */}
            <div className="bg-bg-secondary border border-border-subtle rounded-[2rem] p-6 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary block">
                3. PILIH TYPE PRESENTASI VISUALISASI
              </span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'vertical-bar', label: 'Bar Vertikal', icon: BarChart2 },
                  { id: 'horizontal-bar', label: 'Bar Horisontal', icon: BarChart2 },
                  { id: 'line', label: 'Line Chart', icon: LineChart },
                  { id: 'area', label: 'Area Chart', icon: LineChart },
                  { id: 'pie', label: 'Pie Chart', icon: PieChart },
                  { id: 'donut', label: 'Donut Chart', icon: PieChart },
                  { id: 'radar', label: 'Radar Spider', icon: LayoutGrid },
                  { id: 'table', label: 'Scorecard Table', icon: Table },
                ].map(item => {
                  const isAllowed = checkChartLimit(item.id);
                  const isSelected = selectedChartType === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (!isAllowed) {
                          setErrorState(`Model visualizer ${item.label} dikunci di akun free. Hubungi Admin untuk upgrade Pro.`);
                          return;
                        }
                        setSelectedChartType(item.id);
                      }}
                      className={cn(
                        "p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all relative overflow-hidden",
                        isSelected 
                          ? "bg-accent-yellow border-accent-yellow text-bg-primary shadow" 
                          : "bg-bg-tertiary border-border-subtle text-text-secondary hover:text-white"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-[8px] font-black uppercase tracking-wider">{item.label}</span>
                      {!isAllowed && (
                        <span className="absolute top-1 right-1 text-[7px] bg-red-500 text-white rounded px-1 scale-90">PRO</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CUSTOMIZATION AND THEME SELECTION PANEL */}
            <div className="bg-bg-secondary border border-border-subtle rounded-[2rem] p-6 space-y-6">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-accent-yellow" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">
                  KUSTOMISASI PRESENTASI & FORMAT
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Swatches preset themes */}
                <div className="space-y-3">
                  <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Palet Warna Preset</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.keys(COLOR_THEMES).map((themeName) => {
                      const colors = COLOR_THEMES[themeName as keyof typeof COLOR_THEMES];
                      const isSelected = selectedTheme === themeName;
                      
                      return (
                        <button
                          key={themeName}
                          onClick={() => {
                            if (!isPremium && !['davsplace', 'ocean', 'sunset'].includes(themeName)) {
                              setErrorState('Tema warna premium dikunci. Klik Hubungi Admin untuk Upgrade Pro.');
                              return;
                            }
                            setSelectedTheme(themeName as any);
                          }}
                          className={cn(
                            "p-1.5 rounded-lg border bg-bg-tertiary flex flex-col gap-1 transition-all relative",
                            isSelected ? "border-accent-yellow scale-105" : "border-border-subtle"
                          )}
                        >
                          <span className="text-[7.5px] font-black uppercase tracking-tighter text-[#94a3b8] block truncate w-full text-center">
                            {themeName}
                          </span>
                          <div className="flex gap-0.5 justify-center">
                            {colors.slice(0, 3).map((col, idx) => (
                              <div key={idx} style={{ backgroundColor: col }} className="w-2.5 h-2.5 rounded-full" />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Typography and Grid Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#cbd5e1]">TAMPIL ANGKA DATA</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showValues}
                        onChange={(e) => setShowValues(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-yellow"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#cbd5e1]">GRID DI INSTALASI</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-yellow"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#cbd5e1]">PREMIUM WATERMARK</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!isPremium}
                        checked={showWatermark}
                        onChange={(e) => setShowWatermark(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-yellow disabled:opacity-50"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Slider customization ranges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border-subtle/40 pt-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Warna Latar</label>
                  <select
                    value={chartBg}
                    onChange={(e: any) => setChartBg(e.target.value)}
                    className="w-full bg-bg-primary border border-border-subtle text-xs rounded-xl p-2 outline-none font-semibold text-white"
                  >
                    <option value="dark">Twilight Dark (Slate)</option>
                    <option value="light">Classic Light (White)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Font Judul</label>
                  <select
                    value={chartTitleFont}
                    onChange={(e: any) => setChartTitleFont(e.target.value)}
                    className="w-full bg-bg-primary border border-border-subtle text-xs rounded-xl p-2 outline-none font-semibold text-white"
                  >
                    <option value="Space Grotesk">Space Grotesk</option>
                    <option value="Inter">Inter (Sans)</option>
                    <option value="Poppins">Poppins (Warm)</option>
                    <option value="monospace">JetBrains Mono (Tech)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Tinggi Chart: {chartHeight}px</label>
                  <input
                    type="range"
                    min={200}
                    max={500}
                    step={10}
                    value={chartHeight}
                    onChange={(e) => setChartHeight(Number(e.target.value))}
                    className="w-full h-1 bg-bg-primary rounded-lg appearance-none cursor-pointer accent-accent-yellow"
                  />
                </div>
              </div>
            </div>

            {/* ACTION EXPORTS AND SAVING ROW */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-bg-secondary p-6 rounded-[2rem] border border-border-subtle">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => downloadChartImage('png')}
                  className="flex items-center gap-2 p-3 bg-bg-tertiary hover:bg-bg-primary border border-border-subtle hover:border-accent-yellow/30 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <FileDown className="w-4 h-4 text-accent-yellow" />
                  PNG
                </button>
                <button
                  onClick={() => downloadChartImage('jpeg')}
                  className={cn(
                    "flex items-center gap-2 p-3 bg-bg-tertiary hover:bg-bg-primary border border-border-subtle hover:border-accent-yellow/30 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    !isPremium && "opacity-50"
                  )}
                >
                  JPEG
                </button>
                <button
                  onClick={downloadPDFReport}
                  className={cn(
                    "flex items-center gap-2 p-3 bg-bg-tertiary hover:bg-bg-primary border border-border-subtle hover:border-accent-yellow/30 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    !isPremium && "opacity-50"
                  )}
                >
                  PDF Laporan (PRO)
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveContentToCloud}
                  disabled={savingInDashboard}
                  className="flex items-center gap-2 p-3.5 bg-accent-yellow hover:bg-white text-bg-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  {savingInDashboard ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : isSavedDone ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  {isSavedDone ? 'SAVED TO CLOUD' : 'SIMPAN KE DASHBOARD'}
                </button>
              </div>
            </div>

          </div>

          {/* AI INSIGHT GENERATOR PANEL */}
          <div className="bg-bg-secondary border border-border-subtle rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-yellow/5 blur-[60px]" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-yellow/10 rounded-xl flex items-center justify-center text-accent-yellow shadow-md">
                  <Sparkles className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-yellow block">
                    AI BUSINESS ANALYST
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-black uppercase tracking-tight text-white leading-tight">
                    DATA BUSINESS INSIGHT
                  </h3>
                </div>
              </div>

              <button
                onClick={generateAIInsights}
                disabled={generatingInsights}
                className="px-5 py-3.5 bg-bg-tertiary hover:bg-bg-primary border border-border-subtle hover:border-accent-yellow/30 rounded-xl text-[9px] font-black uppercase tracking-wider text-white hover:text-accent-yellow transition-all flex items-center gap-1.5 disabled:opacity-50 inline-flex"
              >
                {generatingInsights ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    ANALYZING...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5" />
                    GENERATE INSIGHT
                  </>
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {insightsResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 pt-4 border-t border-border-subtle"
                >
                  {/* Headline */}
                  <div className="p-4 bg-accent-yellow/10 border border-accent-yellow/20 rounded-2xl">
                    <p className="text-[8px] font-black uppercase tracking-widest text-accent-yellow">Headline Utama Temuan</p>
                    <p className="text-sm font-sans font-extrabold text-white leading-snug mt-1 italic">
                      "{insightsResult.headline}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Insights list */}
                    <div className="space-y-3">
                      <label className="text-[8px] font-black uppercase tracking-widest text-[#94a3b8] block">Butir-Butir Analisis Angka</label>
                      <ul className="space-y-2 text-xs text-text-secondary">
                        {insightsResult.insights?.map((item: string, idx: number) => (
                          <li key={idx} className="flex gap-2.5 items-start leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendation */}
                    <div className="bg-bg-tertiary border border-border-subtle p-5 rounded-2xl space-y-2">
                      <span className="text-[8px] font-black uppercase tracking-widest text-accent-yellow">Rencana Tindakan Bisnis (Actionable)</span>
                      <p className="text-xs text-white leading-relaxed font-semibold">
                        {insightsResult.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Badges footer */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border-subtle/50">
                    <div className="bg-bg-tertiary p-3.5 rounded-xl flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-wider text-text-secondary">Tren Sektor</span>
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2 py-0.5 rounded",
                        insightsResult.trend === "naik" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : insightsResult.trend === "turun" ? "bg-red-500/15 text-red-400 border border-red-500/20" : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                      )}>
                        {insightsResult.trend?.toUpperCase() || "STABIL"}
                      </span>
                    </div>

                    <div className="bg-bg-tertiary p-3.5 rounded-xl flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-wider text-text-secondary">Pencilan Anomali</span>
                      <span className="text-xs font-bold text-white text-right truncate pl-4">
                        {insightsResult.anomaly || "Normal"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="border border-dashed border-border-subtle bg-bg-tertiary/10 p-10 rounded-2xl text-center space-y-3 opacity-60">
                  <div className="w-12 h-12 bg-bg-tertiary rounded-xl flex items-center justify-center mx-auto text-text-secondary">
                    <Info className="w-6 h-6 text-accent-yellow" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase">Insight Belum Di-generate</h4>
                  <p className="text-[10px] text-text-secondary max-w-xs mx-auto leading-normal">
                    Klik tombol di atas untuk menganalisa data laporan dan menghasilkan executive dashboard summary instan dengan rekomendasi taktis.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
