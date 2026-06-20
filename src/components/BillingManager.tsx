import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  FileText, 
  Receipt, 
  Plus, 
  Trash2, 
  Download, 
  Image, 
  Save, 
  Edit, 
  X, 
  Search, 
  Filter, 
  ChevronRight, 
  Printer, 
  CheckCircle2, 
  AlertTriangle,
  Coins, 
  Calendar, 
  User, 
  FileCheck, 
  Layers, 
  Eye, 
  Copy,
  Building,
  Loader2,
  ListCheck,
  Percent,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

// Interfaces
interface BillingItem {
  id: string;
  description: string;
  qty: number;
  unit: string; // e.g. Pack, Jam, Hari, Project, Penulisan, dll.
  price: number;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  beneficiaryName: string;
}

interface BillingDocument {
  id?: string;
  type: 'RECEIPT' | 'QUOTATION';
  doc_number: string;
  client_name: string;
  client_company: string;
  client_phone: string;
  client_email: string;
  project_name: string;
  project_desc: string;
  date: string;
  due_date: string;
  items: BillingItem[];
  subtotal: number;
  tax_rate: number; // percentage, e.g. 11 for 11% PPN
  tax_amount: number;
  discount_type?: 'PERCENTAGE' | 'FIXED';
  discount_rate?: number;
  discount_amount?: number;
  total: number;
  payment_method: string;
  bank_details: BankDetails;
  notes: string;
  status: 'PAID' | 'UNPAID' | 'SENT' | 'DRAFT';
  currency: 'IDR' | 'USD';
  logo_url?: string;
  created_at?: any;
}

const TEMPLATE_BANK_DETAILS: BankDetails = {
  bankName: 'Bank Central Asia (BCA)',
  accountNumber: '8090123456',
  beneficiaryName: 'STUDIO DIGITAL CREATIVE'
};

const DEFAULT_ITEMS: BillingItem[] = [
  { id: '1', description: 'Video Portofolio Sinematik Brand Teaser (1 Menit)', qty: 1, unit: 'Project', price: 7500000 },
  { id: '2', description: 'Optimasi Landing Page High-Conversion Framework', qty: 1, unit: 'Project', price: 4500000 }
];

export default function BillingManager() {
  const [documents, setDocuments] = useState<BillingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'RECEIPT' | 'QUOTATION'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'SENT' | 'DRAFT'>('ALL');
  const [exporting, setExporting] = useState(false);

  // Editing or Creating states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<BillingDocument | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [docType, setDocType] = useState<'RECEIPT' | 'QUOTATION'>('RECEIPT');
  const [docNumber, setDocNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [docDate, setDocDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  });
  const [items, setItems] = useState<BillingItem[]>(DEFAULT_ITEMS);
  const [taxRate, setTaxRate] = useState<number>(11); // PPN 11% default
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');
  const [bankDetails, setBankDetails] = useState<BankDetails>(TEMPLATE_BANK_DETAILS);
  const [notes, setNotes] = useState('Pembayaran dilakukan maksimal sesuai tanggal jatuh tempo. Terima kasih atas kerja sama Anda.');
  const [docStatus, setDocStatus] = useState<'PAID' | 'UNPAID' | 'SENT' | 'DRAFT'>('UNPAID');
  const [currency, setCurrency] = useState<'IDR' | 'USD'>('IDR');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('FIXED');
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [logoUrl, setLogoUrl] = useState<string>('');

  // Preview Scale State
  const [previewScale, setPreviewScale] = useState(1);
  const previewRef = useRef<HTMLDivElement>(null);

  // Fetch billing documents from Firestore
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'billing_docs'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      const docsList = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as BillingDocument[];
      setDocuments(docsList);
    } catch (err) {
      console.error('Fetch billing documents error:', err);
      // Fallback local storage
      const local = localStorage.getItem('billing_docs');
      if (local) {
        setDocuments(JSON.parse(local));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Format currency helpers
  const formatCurrency = (val: number, cur: 'IDR' | 'USD' = 'IDR') => {
    if (cur === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // Math calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    if (discountType === 'PERCENTAGE') {
      return Math.round((subtotal * discountRate) / 100);
    }
    return discountRate || 0;
  }, [subtotal, discountType, discountRate]);

  const taxAmount = useMemo(() => {
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    return Math.round((discountedSubtotal * taxRate) / 100);
  }, [subtotal, discountAmount, taxRate]);

  const total = useMemo(() => {
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    return discountedSubtotal + taxAmount;
  }, [subtotal, discountAmount, taxAmount]);

  // Load selected document for edit
  const openEditor = (docToEdit: BillingDocument | null = null) => {
    if (docToEdit) {
      setSelectedDoc(docToEdit);
      setDocType(docToEdit.type);
      setDocNumber(docToEdit.doc_number);
      setClientName(docToEdit.client_name);
      setClientCompany(docToEdit.client_company || '');
      setClientPhone(docToEdit.client_phone || '');
      setClientEmail(docToEdit.client_email || '');
      setProjectName(docToEdit.project_name);
      setProjectDesc(docToEdit.project_desc || '');
      setDocDate(docToEdit.date);
      setDueDate(docToEdit.due_date || '');
      setItems(docToEdit.items || []);
      setTaxRate(docToEdit.tax_rate ?? 11);
      setDiscountType(docToEdit.discount_type || 'FIXED');
      setDiscountRate(docToEdit.discount_rate || 0);
      setPaymentMethod(docToEdit.payment_method || 'Transfer Bank');
      setBankDetails(docToEdit.bank_details || TEMPLATE_BANK_DETAILS);
      setNotes(docToEdit.notes || '');
      setDocStatus(docToEdit.status);
      setCurrency(docToEdit.currency || 'IDR');
      setLogoUrl(docToEdit.logo_url || '');
    } else {
      // Create new: generate template doc number
      setSelectedDoc(null);
      setLogoUrl('');
      const prefix = docType === 'RECEIPT' ? 'REC' : 'QTN';
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const currentYear = new Date().getFullYear();
      setDocNumber(`${prefix}-${currentYear}-${randNum}`);
      setClientName('');
      setClientCompany('');
      setClientPhone('');
      setClientEmail('');
      setProjectName('');
      setProjectDesc('');
      setDocDate(new Date().toISOString().split('T')[0]);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDueDate(nextWeek.toISOString().split('T')[0]);
      setItems([
        { id: '1', description: 'Modifikasi Desain Antarmuka Proyek / Branding Pitch', qty: 1, unit: 'Project', price: 3500000 }
      ]);
      setTaxRate(11);
      setDiscountType('FIXED');
      setDiscountRate(0);
      setPaymentMethod('Transfer Bank');
      setBankDetails(TEMPLATE_BANK_DETAILS);
      setNotes(docType === 'RECEIPT' 
        ? 'Struk ini adalah bukti pembayaran sah untuk proyek yang disepakati. Terima kasih atas kerja sama Anda!' 
        : 'Penawaran ini berlaku selama 14 hari sejak tanggal diterbitkan. Silakan hubungi kami untuk mendiskusikan penyesuaian detail proyek.');
      setDocStatus(docType === 'RECEIPT' ? 'PAID' : 'DRAFT');
      setCurrency('IDR');
    }
    setIsEditorOpen(true);
  };

  // Adjust document number when type changes inside creator
  useEffect(() => {
    if (!selectedDoc && isEditorOpen) {
      const prefix = docType === 'RECEIPT' ? 'REC' : 'QTN';
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const currentYear = new Date().getFullYear();
      setDocNumber(`${prefix}-${currentYear}-${randNum}`);
      
      // Update default notes base on type
      setNotes(docType === 'RECEIPT' 
        ? 'Struk ini adalah bukti pembayaran sah untuk proyek yang disepakati. Terima kasih atas kerja sama Anda!' 
        : 'Penawaran ini berlaku selama 14 hari sejak tanggal diterbitkan. Silakan hubungi kami untuk mendiskusikan penyesuaian detail proyek.');
      
      setDocStatus(docType === 'RECEIPT' ? 'PAID' : 'DRAFT');
    }
  }, [docType, isEditorOpen, selectedDoc]);

  // Handle logo files upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File logo terlalu besar! Maksimal ukuran adalah 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Item Line
  const addItemLine = () => {
    const newItem: BillingItem = {
      id: Math.random().toString(36).substring(2, 9),
      description: '',
      qty: 1,
      unit: 'Project',
      price: 0
    };
    setItems([...items, newItem]);
  };

  // Remove Item Line
  const removeItemLine = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(it => it.id !== id));
    }
  };

  // Update Item Line
  const updateItemLine = (id: string, field: keyof BillingItem, value: any) => {
    setItems(items.map(it => {
      if (it.id === id) {
        return { ...it, [field]: value };
      }
      return it;
    }));
  };

  // Save Document to Firebase or Fallback Local Storage
  const saveDocument = async () => {
    if (!docNumber || !clientName || !projectName) {
      alert('Mohon isi nomor dokumen, nama klien, dan nama proyek!');
      return;
    }

    setSubmitting(true);
    const payload: BillingDocument = {
      type: docType,
      doc_number: docNumber,
      client_name: clientName,
      client_company: clientCompany,
      client_phone: clientPhone,
      client_email: clientEmail,
      project_name: projectName,
      project_desc: projectDesc,
      date: docDate,
      due_date: dueDate,
      items: items.map(item => ({
        id: item.id,
        description: item.description,
        qty: Number(item.qty),
        unit: item.unit,
        price: Number(item.price)
      })),
      subtotal,
      tax_rate: Number(taxRate),
      tax_amount: taxAmount,
      discount_type: discountType,
      discount_rate: Number(discountRate),
      discount_amount: discountAmount,
      total,
      payment_method: paymentMethod,
      bank_details: bankDetails,
      notes,
      status: docStatus,
      currency,
      logo_url: logoUrl
    };

    try {
      if (selectedDoc?.id) {
        // Update
        const docRef = doc(db, 'billing_docs', selectedDoc.id);
        const updatePayload = {
          ...payload,
          updated_at: serverTimestamp()
        };
        await updateDoc(docRef, updatePayload);
      } else {
        // Create new
        const createPayload = {
          ...payload,
          created_at: serverTimestamp()
        };
        await addDoc(collection(db, 'billing_docs'), createPayload);
      }

      // Refresh
      await fetchDocuments();
      setIsEditorOpen(false);
    } catch (err) {
      console.error('Failed to save document to Firestore:', err);
      // Fallback local storage
      const updatedDocs = selectedDoc?.id 
        ? documents.map(d => d.id === selectedDoc.id ? { ...payload, id: selectedDoc.id } : d)
        : [{ ...payload, id: 'local_' + Date.now() }, ...documents];
        
      localStorage.setItem('billing_docs', JSON.stringify(updatedDocs));
      setDocuments(updatedDocs);
      setIsEditorOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete document
  const deleteDocumentHandler = async (docId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen penagihan ini dari riwayat?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'billing_docs', docId));
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to delete billing document:', err);
      // Fallback local storage
      const updatedDocs = documents.filter(d => d.id !== docId);
      localStorage.setItem('billing_docs', JSON.stringify(updatedDocs));
      setDocuments(updatedDocs);
    }
  };

  // Modern High Resolution PDF export with client-side libraries
  const triggerPDFExport = async () => {
    const el = document.getElementById('billing-preview-area');
    if (!el) return;
    setExporting(true);

    try {
      // Lazy load html2canvas/jspdf dynamically inside action just in case, but since they are already in package.json, we can use them directly
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      // Hide custom overlay stamp buttons temporarily if any
      const canvas = await html2canvas(el, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 dimensions: 210mm x 297mm
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      pdf.save(`${docType}_${docNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal menghasilkan PDF. Silakan gunakan fitur Cetak (Ctrl+P) sebagai cadangan.');
    } finally {
      setExporting(false);
    }
  };

  // JPEG exporter using html2canvas
  const triggerJPEGExport = async () => {
    const el = document.getElementById('billing-preview-area');
    if (!el) return;
    setExporting(true);

    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(el, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `${docType}_${docNumber}.jpg`;
      link.href = imgUrl;
      link.click();
    } catch (error) {
      console.error('Error generating JPEG:', error);
      alert('Gagal membuat gambar JPEG.');
    } finally {
      setExporting(false);
    }
  };

  // Local printer utility
  const triggerDirectPrint = () => {
    window.print();
  };

  // Filter and search calculations
  const filteredDocRecords = useMemo(() => {
    return documents.filter(docItem => {
      const matchesSearch = 
        docItem.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        docItem.doc_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        docItem.project_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'ALL' || docItem.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || docItem.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [documents, searchQuery, typeFilter, statusFilter]);

  return (
    <div className="space-y-6 text-white pt-2">
      
      {/* Header Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bg-secondary/40 border border-border-subtle p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-text-muted font-mono uppercase tracking-wider">Total Dokumen</p>
            <h3 className="text-3xl font-display font-bold text-white">{documents.length}</h3>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
            <FileText className="w-6 h-6 text-accent-yellow" />
          </div>
        </div>

        <div className="bg-bg-secondary/40 border border-border-subtle p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-text-muted font-mono uppercase tracking-wider">Lunas (Paid Receipts)</p>
            <h3 className="text-3xl font-display font-bold text-accent-green">
              {documents.filter(d => d.type === 'RECEIPT' && d.status === 'PAID').length}
            </h3>
          </div>
          <div className="p-3 bg-accent-green/5 border border-accent-green/10 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-accent-green" />
          </div>
        </div>

        <div className="bg-bg-secondary/40 border border-border-subtle p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-text-muted font-mono uppercase tracking-wider">Penawaran (Quotations)</p>
            <h3 className="text-3xl font-display font-bold text-accent-blue">
              {documents.filter(d => d.type === 'QUOTATION').length}
            </h3>
          </div>
          <div className="p-3 bg-accent-blue/5 border border-accent-blue/10 rounded-xl">
            <TrendingUp className="w-6 h-6 text-accent-blue" />
          </div>
        </div>

        <div className="bg-bg-secondary/40 border border-border-subtle p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-text-muted font-mono uppercase tracking-wider">Belum Lunas (Unpaid Inbound)</p>
            <h3 className="text-3xl font-display font-bold text-accent-red">
              {documents.filter(d => d.status === 'UNPAID').length}
            </h3>
          </div>
          <div className="p-3 bg-accent-red/5 border border-accent-red/10 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-accent-red" />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isEditorOpen ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filter and Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-bg-secondary/20 p-4 border border-border-subtle rounded-2xl">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Cari klien, No. Dokumen, proyek..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-accent-yellow/40 focus:ring-1 focus:ring-accent-yellow/30"
                  />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  {/* Type filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="bg-bg-tertiary border border-border-subtle rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-yellow/40"
                  >
                    <option value="ALL">Semua Jenis</option>
                    <option value="RECEIPT">Receipt (Struk)</option>
                    <option value="QUOTATION">Quotation (Penawaran)</option>
                  </select>

                  {/* Status filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-bg-tertiary border border-border-subtle rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-yellow/40"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="PAID">Lunas (Paid)</option>
                    <option value="UNPAID">Belum Lunas (Unpaid)</option>
                    <option value="SENT">Terkirim (Sent)</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => openEditor(null)}
                className="w-full sm:w-auto bg-accent-yellow text-bg-primary hover:bg-accent-yellow-hover font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-accent-yellow/10"
              >
                <Plus className="w-4 h-4" />
                Buat Dokumen Baru
              </button>
            </div>

            {/* Invoices List Grid */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-accent-yellow animate-spin" />
                <p className="text-xs text-text-muted">Memuat dokumen finance...</p>
              </div>
            ) : filteredDocRecords.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-border-subtle rounded-2xl bg-bg-secondary/10">
                <FileText className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">Belum Ada Dokumen Penagihan</h4>
                <p className="text-xs text-text-muted max-w-md mx-auto px-4">
                  Gunakan tombol "Buat Dokumen Baru" untuk membuat struk pembayaran proyek atau dokumen quotation untuk klien.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredDocRecords.map((item) => (
                  <div
                    key={item.id}
                    className="bg-bg-secondary/30 border border-border-subtle rounded-2xl p-5 hover:border-accent-yellow/30 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-mono leading-none tracking-wide uppercase font-bold",
                            item.type === 'RECEIPT' 
                              ? "bg-accent-green/10 text-accent-green border border-accent-green/10"
                              : "bg-accent-blue/10 text-accent-blue border border-accent-blue/10"
                          )}>
                            {item.type === 'RECEIPT' ? 'STRUK' : 'QUOTATION'}
                          </span>
                          <span className="text-xs font-mono text-white font-medium">{item.doc_number}</span>
                        </div>
                        <h4 className="text-base font-display font-black tracking-tight text-white group-hover:text-accent-yellow transition-colors mt-1">
                          {item.project_name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <Building className="w-3.5 h-3.5" />
                          <span>{item.client_name} {item.client_company ? `(${item.client_company})` : ''}</span>
                        </div>
                      </div>

                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border",
                        item.status === 'PAID' && "bg-accent-green/10 text-accent-green border-accent-green/20",
                        item.status === 'UNPAID' && "bg-accent-red/10 text-accent-red border-accent-red/20",
                        item.status === 'SENT' && "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
                        item.status === 'DRAFT' && "bg-gray-400/10 text-gray-400 border-gray-400/20"
                      )}>
                        {item.status}
                      </span>
                    </div>

                    <div className="py-2.5 border-t border-b border-border-subtle/50 flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <p className="text-text-muted">Jumlah Total</p>
                        <p className="text-sm font-mono font-bold text-white">
                          {formatCurrency(item.total, item.currency)}
                          {item.discount_amount && item.discount_amount > 0 ? (
                            <span className="ml-1.5 text-[10px] text-accent-green bg-accent-green/10 px-1.5 py-0.5 rounded font-sans">
                              Disc: -{formatCurrency(item.discount_amount, item.currency)}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-text-muted flex items-center justify-end gap-1">
                          <Calendar className="w-3.5 h-3.5 text-text-muted" />
                          Tanggal Terbit
                        </p>
                        <p className="text-xs font-mono text-white">{item.date}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <p className="text-[11px] text-text-muted italic line-clamp-1 max-w-[200px]">
                        {item.items ? `${item.items.length} item penagihan` : 'Tidak ada item'}
                      </p>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEditor(item)}
                          className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                          title="Edit Dokumen"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Buka</span>
                        </button>
                        <button
                          onClick={() => deleteDocumentHandler(item.id!)}
                          className="bg-accent-red/5 hover:bg-accent-red/20 text-accent-red border border-accent-red/20 p-2 rounded-xl transition-all"
                          title="Hapus Dokumen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-6"
          >
            {/* Editor form (xl:col-span-5) */}
            <div className="xl:col-span-5 space-y-4 max-h-[85vh] overflow-y-auto pr-1">
              <div className="bg-bg-secondary/40 border border-border-subtle p-5 rounded-2xl space-y-5">
                <div className="flex justify-between items-center pb-2 border-b border-border-subtle/50">
                  <h3 className="text-sm font-display font-bold uppercase tracking-wider text-accent-yellow">
                    {selectedDoc ? 'Edit Dokumen' : 'Buat Dokumen Baru'}
                  </h3>
                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="p-1 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Document Type Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-text-muted">Jenis Dokumen</label>
                  <div className="grid grid-cols-2 gap-2 bg-bg-tertiary p-1 border border-border-subtle rounded-xl">
                    <button
                      type="button"
                      onClick={() => setDocType('RECEIPT')}
                      className={cn(
                        "py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                        docType === 'RECEIPT' ? "bg-accent-yellow text-bg-primary" : "text-white hover:bg-white/5"
                      )}
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      Receipt (Struk)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocType('QUOTATION')}
                      className={cn(
                        "py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                        docType === 'QUOTATION' ? "bg-accent-blue text-white" : "text-white hover:bg-white/5"
                      )}
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      Quotation
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Doc Number */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase text-text-muted">No. Dokumen</label>
                    <input
                      type="text"
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-3.5 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-accent-yellow/40"
                    />
                  </div>

                  {/* Currency Toggle */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase text-text-muted">Mata Uang</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as 'IDR' | 'USD')}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent-yellow/40"
                    >
                      <option value="IDR">Rupiah (IDR)</option>
                      <option value="USD">Dolar AS (USD)</option>
                    </select>
                  </div>
                </div>

                {/* Logo Perusahaan Upload Section */}
                <div className="space-y-2 bg-bg-tertiary/20 p-4 border border-border-subtle rounded-xl font-sans">
                  <p className="text-[11px] font-bold tracking-wider font-mono uppercase text-accent-yellow/70 flex items-center justify-between">
                    <span>Logo Perusahaan / Branding</span>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="text-accent-red hover:text-accent-red/80 font-mono text-[10px] lowercase italic font-medium cursor-pointer"
                      >
                        [hapus logo]
                      </button>
                    )}
                  </p>
                  
                  {logoUrl ? (
                    <div className="flex items-center gap-3 p-2 bg-bg-tertiary border border-border-subtle rounded-xl">
                      <img src={logoUrl} alt="Preview Logo" className="max-h-12 max-w-[120px] object-contain bg-white p-1 rounded" />
                      <div className="space-y-0.5">
                        <p className="text-xs text-white font-medium">Logo custom terpasang</p>
                        <p className="text-[10px] text-text-muted">Akan muncul di pratinjau kertas A4 & cetakan PDF</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border border-dashed border-border-subtle bg-bg-tertiary/40 rounded-xl p-4 text-center hover:border-accent-yellow/30 transition-all group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-5 h-5 text-text-muted group-hover:text-accent-yellow mx-auto mb-1.5 transition-colors" />
                      <p className="text-xs text-white font-medium mb-0.5">Upload Logo Anda</p>
                      <p className="text-[10px] text-text-muted">Format PNG/JPG/WebP, maks. 2MB</p>
                    </div>
                  )}
                </div>

                {/* Client Info Section */}
                <div className="space-y-3.5 bg-bg-tertiary/20 p-4 border border-border-subtle rounded-xl">
                  <p className="text-[11px] font-bold tracking-wider font-mono uppercase text-accent-yellow/70">Klien & Perusahaan</p>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-text-muted">Nama Klien *</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Contoh: Bpk. Heru Wijaya"
                        className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent-yellow/40"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-text-muted">Nama Perusahaan / Institusi</label>
                      <input
                        type="text"
                        value={clientCompany}
                        onChange={(e) => setClientCompany(e.target.value)}
                        placeholder="Contoh: PT. Wijaya Properti"
                        className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent-yellow/40"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] text-text-muted">Nomor Telp/WA</label>
                        <input
                          type="text"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="e.g. 0812345678"
                          className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-text-muted">Email Klien</label>
                        <input
                          type="email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="klien@pembeli.com"
                          className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Info Section */}
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase text-text-muted">Nama Proyek / Kontrak *</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. Rebranding Platform Real Estate & Video Showcase"
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent-yellow/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase text-text-muted">Deskripsi Detail Proyek</label>
                    <textarea
                      value={projectDesc}
                      onChange={(e) => setProjectDesc(e.target.value)}
                      placeholder="e.g. Pembuatan video teaser resolusi 4K untuk kluster perumahan mewah dan integrasi landing page lead generation."
                      rows={2}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent-yellow/40"
                    />
                  </div>
                </div>

                {/* Invoice Items (Product details) */}
                <div className="space-y-3.5 p-4 border border-border-subtle rounded-xl bg-bg-tertiary/10">
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] font-bold tracking-wider font-mono uppercase text-accent-yellow/70">Beban Biaya (Line Items)</p>
                    <button
                      type="button"
                      onClick={addItemLine}
                      className="text-accent-yellow hover:text-accent-yellow-hover text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Item
                    </button>
                  </div>

                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {items.map((item, idx) => (
                      <div key={item.id} className="p-3 bg-bg-tertiary border border-border-subtle rounded-xl space-y-2.5 text-xs relative">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-text-muted">Item #{idx + 1}</span>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItemLine(item.id)}
                              className="text-accent-red hover:text-accent-red/80 p-0.5 rounded transition-transform"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="Deskripsi jasa atau produk..."
                            value={item.description}
                            onChange={(e) => updateItemLine(item.id, 'description', e.target.value)}
                            className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          />

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] text-text-muted">Qty</label>
                              <input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(e) => updateItemLine(item.id, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-2 py-1 text-xs text-white text-center"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-text-muted">Unit</label>
                              <input
                                type="text"
                                placeholder="Project/Hari"
                                value={item.unit}
                                onChange={(e) => updateItemLine(item.id, 'unit', e.target.value)}
                                className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-2 py-1 text-xs text-white text-center"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-text-muted">Harga Satuan</label>
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) => updateItemLine(item.id, 'price', parseFloat(e.target.value) || 0)}
                                className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-2 py-1 text-xs text-white text-right"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Date of Issue */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase text-text-muted">Tanggal Dokumen</label>
                    <input
                      type="date"
                      value={docDate}
                      onChange={(e) => setDocDate(e.target.value)}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-3.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Due Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase text-text-muted">Tenggat Jatuh Tempo</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-3.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Discount Configuration */}
                <div className="p-3 bg-bg-tertiary/10 border border-border-subtle/50 rounded-xl space-y-2">
                  <p className="text-[11px] font-bold tracking-wider font-mono uppercase text-accent-yellow/70 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5" />
                    Potongan Harga / Fitur Diskon
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-text-muted">Tipe Diskon</label>
                      <div className="flex rounded-lg overflow-hidden border border-border-subtle bg-bg-secondary p-0.5">
                        <button
                          type="button"
                          onClick={() => setDiscountType('PERCENTAGE')}
                          className={cn(
                            "flex-1 py-1 text-[10px] uppercase font-bold tracking-tight rounded transition-all",
                            discountType === 'PERCENTAGE'
                              ? "bg-accent-yellow text-bg-primary"
                              : "text-text-muted hover:text-white"
                          )}
                        >
                          Persen (%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountType('FIXED')}
                          className={cn(
                            "flex-1 py-1 text-[10px] uppercase font-bold tracking-tight rounded transition-all",
                            discountType === 'FIXED'
                              ? "bg-accent-yellow text-bg-primary"
                              : "text-text-muted hover:text-white"
                          )}
                        >
                          Nominal ({currency})
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-text-muted">
                        Nilai ({discountType === 'PERCENTAGE' ? '%' : currency})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={discountRate}
                        onChange={(e) => setDiscountRate(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-2.5 py-1 text-xs text-white text-right focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Tax Configuration */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase text-text-muted">Persentase Pajak / PPN (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase text-text-muted">Metode Pembayaran</label>
                    <input
                      type="text"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      placeholder="e.g. Transfer BCA"
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Bank account setting */}
                <div className="space-y-2 bg-bg-tertiary/20 p-4 border border-border-subtle rounded-xl">
                  <p className="text-[11px] font-bold tracking-wider font-mono uppercase text-accent-yellow/70">Pengaturan Akun Bank Penerima</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-text-muted">Nama Bank</label>
                      <input
                        type="text"
                        value={bankDetails.bankName}
                        onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                        className="w-full bg-bg-tertiary border border-border-subtle rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-text-muted">Nomor Rekening</label>
                      <input
                        type="text"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                        className="w-full bg-bg-tertiary border border-border-subtle rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted">Nama Pemilik Rekening (Beneficiary)</label>
                    <input
                      type="text"
                      value={bankDetails.beneficiaryName}
                      onChange={(e) => setBankDetails({ ...bankDetails, beneficiaryName: e.target.value })}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-text-muted">Syarat & Ketentuan / Catatan Dokumen</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Status Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-text-muted">Status Dokumen Saat Ini</label>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-bg-tertiary border border-border-subtle rounded-xl">
                    {(['PAID', 'UNPAID', 'SENT', 'DRAFT'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setDocStatus(st)}
                        className={cn(
                          "py-1.5 rounded-lg text-[10px] font-bold font-mono transition-transform duration-100",
                          docStatus === st
                            ? st === 'PAID' ? "bg-accent-green text-bg-primary"
                              : st === 'UNPAID' ? "bg-accent-red text-white"
                              : st === 'SENT' ? "bg-accent-blue text-white"
                              : "bg-gray-400 text-bg-primary"
                            : "text-text-muted hover:text-white"
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions bottom */}
                <div className="flex gap-2.5 pt-3">
                  <button
                    onClick={saveDocument}
                    disabled={submitting}
                    className="flex-1 bg-accent-yellow hover:bg-accent-yellow-hover text-bg-primary font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border border-transparent"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {selectedDoc ? 'Simpan Perubahan' : 'Simpan ke Database'}
                  </button>

                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="bg-bg-tertiary border border-border-subtle hover:border-white/20 text-white font-medium py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    Kembali
                  </button>
                </div>
              </div>
            </div>

            {/* Document Interactive A4 Live Preview (xl:col-span-7) */}
            <div className="xl:col-span-7 space-y-4">
              <div className="flex justify-between items-center bg-bg-secondary/40 border border-border-subtle px-5 py-3 rounded-2xl">
                <span className="text-xs font-mono text-text-muted flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-accent-yellow" />
                  Pratinjau Kertas A4 (Live Preview)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={triggerPDFExport}
                    disabled={exporting}
                    className="bg-accent-green hover:bg-accent-green-hover text-bg-primary font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-accent-green/10"
                  >
                    {exporting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                    PDF
                  </button>

                  <button
                    onClick={triggerJPEGExport}
                    disabled={exporting}
                    className="bg-accent-blue hover:bg-accent-blue-hover text-white font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-md"
                  >
                    {exporting ? (
                      <Loader2 className="w-3 h-3 animate-spin animate-none" />
                    ) : (
                      <Image className="w-3 h-3" />
                    )}
                    JPEG
                  </button>

                  <button
                    onClick={triggerDirectPrint}
                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 p-1.5 rounded-lg text-xs"
                    title="Cetak Langsung (System Print)"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* The high quality visual document container */}
              <div className="w-full flex justify-center bg-bg-tertiary/10 p-5 rounded-3xl overflow-x-auto select-text custom-scrollbar">
                
                {/* Visual A4 Mockup Document */}
                <div
                  id="billing-preview-area"
                  className="w-[210mm] min-h-[297mm] bg-white text-gray-800 p-12 relative flex flex-col justify-between shadow-2xl font-sans"
                  style={{
                    boxSizing: 'border-box',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  
                  {/* Decorative Subtle Header Line bar on preview */}
                  <div className={cn(
                    "absolute top-0 left-0 right-0 h-2.5",
                    docType === 'RECEIPT' ? "bg-emerald-500" : "bg-sky-500"
                  )} />

                  {/* Top Header Block */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      {/* Company / Brand details */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="max-h-12 max-w-[140px] object-contain rounded" />
                          ) : (
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white tracking-tighter text-base shadow-sm",
                              docType === 'RECEIPT' ? "bg-emerald-500" : "bg-sky-500"
                            )}>
                              S
                            </div>
                          )}
                          <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight uppercase tracking-wider font-mono">STUDIO CREATIVE</h2>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none font-mono">Professional Digital Services</p>
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-500 space-y-0.5 leading-relaxed font-mono">
                          <p>Gedung Creative Hub Lt. 4, Jakarta Selatan, 12190</p>
                          <p>Email: finance@studiocreative.net | Telp: +62 21 8092 1002</p>
                          <p>Web: www.studiocreative.net</p>
                        </div>
                      </div>

                      {/* Document Type Title & Number block */}
                      <div className="text-right space-y-1">
                        <h1 className={cn(
                          "text-3xl font-black uppercase tracking-tighter leading-none font-sans",
                          docType === 'RECEIPT' ? "text-emerald-500" : "text-sky-500"
                        )}>
                          {docType === 'RECEIPT' ? 'RECEIPT' : 'QUOTATION'}
                        </h1>
                        <p className="text-[10px] text-gray-500 font-mono tracking-wider">BUKTI NOMOR / PENAWARAN</p>
                        <p className="text-sm font-bold font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded inline-block">
                          {docNumber}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-200">
                      {/* Client info / Target recipient */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">DITUJUKAN KEPADA:</p>
                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-gray-900 text-sm">{clientName || 'Nama Klien'}</p>
                          {clientCompany && <p className="font-medium text-gray-700">{clientCompany}</p>}
                          {clientPhone && <p className="text-gray-500 font-mono">Telp/WA: {clientPhone}</p>}
                          {clientEmail && <p className="text-gray-500 font-mono">{clientEmail}</p>}
                        </div>
                      </div>

                      {/* Project billing schedule info */}
                      <div className="space-y-2 text-right">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">INFO PENAGIHAN:</p>
                        <table className="inline-table text-xs text-gray-600">
                          <tbody>
                            <tr>
                              <td className="pr-3 text-gray-400 text-left font-mono">Tanggal Terbit:</td>
                              <td className="font-semibold font-mono text-gray-900 text-right">{docDate}</td>
                            </tr>
                            <tr>
                              <td className="pr-3 text-gray-400 text-left font-mono">Jatuh Tempo:</td>
                              <td className="font-semibold font-mono text-gray-900 text-right">{dueDate || '-'}</td>
                            </tr>
                            <tr>
                              <td className="pr-3 text-gray-400 text-left font-mono">Metode Bayar:</td>
                              <td className="font-semibold font-mono text-gray-900 text-right">{paymentMethod}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Project Title Block inside A4 paper */}
                    <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                      <p className="text-[10px] font-mono text-gray-400 font-bold uppercase leading-none">NAMA PROYEK / PEKERJAAN:</p>
                      <h4 className="text-sm font-bold text-gray-950 font-sans tracking-tight">{projectName || 'Pekerjaan atau Layanan Kreatif'}</h4>
                      {projectDesc && <p className="text-[11px] text-gray-500 leading-relaxed">{projectDesc}</p>}
                    </div>

                    {/* Table items of standard A4 */}
                    <div className="pt-4">
                      <table className="w-full text-xs text-left text-gray-600">
                        <thead>
                          <tr className="border-b border-gray-300 text-gray-400 font-bold font-mono text-[10px] tracking-wider">
                            <th className="py-2.5 pl-2">DESKRIPSI PEKERJAAN & JASA</th>
                            <th className="py-2.5 text-center w-16">QTY</th>
                            <th className="py-2.5 text-center w-20">SATUAN</th>
                            <th className="py-2.5 text-right w-32">HARGA SATUAN</th>
                            <th className="py-2.5 text-right w-32 pr-2">TOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((it) => (
                            <tr key={it.id} className="border-b border-gray-100 text-gray-700">
                              <td className="py-3 pl-2 font-medium max-w-xs">{it.description || 'Baris deskripsi item baru...'}</td>
                              <td className="py-3 text-center font-mono">{it.qty}</td>
                              <td className="py-3 text-center">{it.unit || 'Item'}</td>
                              <td className="py-3 text-right font-mono">{formatCurrency(it.price, currency)}</td>
                              <td className="py-3 text-right font-mono pr-2 font-bold text-gray-900">
                                {formatCurrency(it.qty * it.price, currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Calculations and bank terms */}
                  <div className="space-y-6 pt-4">
                    
                    {/* Totals Section */}
                    <div className="flex justify-between items-start">
                      <div className="max-w-md space-y-2 text-xs text-gray-500 leading-relaxed font-sans">
                        {/* Bank particulars */}
                        <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                          <p className="text-[10px] font-mono text-gray-400 font-bold uppercase leading-none">REKENING TRANSFER BANK:</p>
                          <p className="font-bold text-gray-900 text-xs">{bankDetails.bankName}</p>
                          <p className="font-mono font-bold text-emerald-600 text-xs">No. Rek: {bankDetails.accountNumber}</p>
                          <p className="text-gray-600 font-medium">A/N: {bankDetails.beneficiaryName}</p>
                        </div>
                      </div>

                      <div className="w-72 text-xs text-gray-600 space-y-2">
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-400 font-mono">Jumlah Subtotal:</span>
                          <span className="font-mono font-semibold text-gray-900">{formatCurrency(subtotal, currency)}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between py-1 border-b border-gray-100 text-emerald-600">
                            <span className="font-mono text-emerald-600">
                              Diskon {discountType === 'PERCENTAGE' ? `(${discountRate}%)` : '(Nominal)'}:
                            </span>
                            <span className="font-mono font-bold">-{formatCurrency(discountAmount, currency)}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-400 font-mono">Pajak PPN ({taxRate}%):</span>
                          <span className="font-mono text-gray-900">{formatCurrency(taxAmount, currency)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-t-2 border-gray-900 text-sm font-bold text-gray-900">
                          <span className="font-sans">JUMLAH TOTAL:</span>
                          <span className="font-mono text-base text-gray-950">{formatCurrency(total, currency)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Paper Footer with Terms & Stamp representation */}
                    <div className="flex justify-between items-end border-t border-gray-200 pt-6">
                      <div className="max-w-md text-[10px] text-gray-400 font-mono leading-relaxed space-y-1">
                        <p className="font-bold text-gray-500">SYARAT & KETENTUAN:</p>
                        <p>{notes || '-'}</p>
                      </div>

                      {/* Premium Sign / Authorization Spot */}
                      <div className="text-center w-48 space-y-1 relative">
                        {/* A nice status stamp badge diagonal watermark inside preview paper to look insanely authentic */}
                        {docStatus === 'PAID' && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 border-3 border-emerald-500 text-emerald-500 rounded-lg px-3 py-1 font-mono uppercase text-xs font-black tracking-widest -rotate-12 select-none opacity-80 pointer-events-none">
                            LUNAS / PAID
                          </div>
                        )}
                        {docStatus === 'SENT' && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 border-3 border-sky-500 text-sky-500 rounded-lg px-3 py-1 font-mono uppercase text-xs font-black tracking-widest -rotate-12 select-none opacity-80 pointer-events-none">
                            TERKIRIM
                          </div>
                        )}
                        {docStatus === 'UNPAID' && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 border-3 border-red-500 text-red-500 rounded-lg px-3 py-1 font-mono uppercase text-xs font-black tracking-widest -rotate-12 select-none opacity-80 pointer-events-none">
                            PENDING PAY
                          </div>
                        )}

                        <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">FINANCE REPRESENTATIVE</p>
                        <div className="h-10 flex items-center justify-center font-serif text-sm italic text-gray-400 select-none">
                          Studio Finance Dept.
                        </div>
                        <div className="border-t border-gray-300 pt-1 font-bold text-xs text-gray-800">
                          Andi Setiawan, S.E.
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
