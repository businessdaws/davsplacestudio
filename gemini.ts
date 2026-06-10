import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Loader2, Send, Sparkles, ArrowRight, Calendar, Bookmark, Briefcase } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { smartSearch } from '../lib/gemini';
import { db } from '../lib/firebase';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { Link } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  type: 'article' | 'event' | 'portfolio';
  url: string;
  description?: string;
  date?: string;
}

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [queryStr, setQueryStr] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryStr.trim()) return;

    setIsSearching(true);
    setAiResponse(null);
    setResults([]);

    try {
      // 1. Fetch data from Firestore to provide context to AI and show results
      const collections = [
        { name: 'articles', type: 'article' as const, path: '/articles' },
        { name: 'events', type: 'event' as const, path: '/events' },
        { name: 'portfolios', type: 'portfolio' as const, path: '/portfolio' }
      ];

      const allData: any[] = [];
      const foundResults: SearchResult[] = [];

      for (const col of collections) {
        const snap = await getDocs(query(collection(db, col.name), limit(20)));
        snap.docs.forEach(doc => {
          const data = doc.data();
          const title = data.title || '';
          const description = data.content || data.description || '';
          
          allData.push({
            type: col.type,
            title,
            description: description.substring(0, 100)
          });

          // Basic text matching for results
          if (
            title.toLowerCase().includes(queryStr.toLowerCase()) ||
            description.toLowerCase().includes(queryStr.toLowerCase())
          ) {
            let url = `${col.path}/${doc.id}`;
            if (col.type === 'article' && data.slug) {
              url = `/artikel/${data.slug}`;
            } else if (col.type === 'event') {
              url = '/#events'; // Navigate to events section on homepage
            } else if (col.type === 'portfolio') {
              url = '/portofolio';
            }

            foundResults.push({
              id: doc.id,
              title,
              type: col.type,
              url: url,
              description: description.substring(0, 80) + '...',
              date: data.date || data.created_at?.toDate?.()?.toLocaleDateString()
            });
          }
        });
      }

      setResults(foundResults);

      // 2. AI Smart Search
      const context = JSON.stringify(allData);
      const response = await smartSearch(queryStr, context);
      setAiResponse(response);
    } catch (error) {
      console.error('Search error:', error);
      setAiResponse('Maaf, terjadi kesalahan saat melakukan pencarian. Silakan coba lagi.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bg-primary/90 backdrop-blur-xl"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full h-full sm:h-auto max-w-3xl bg-bg-secondary border border-border-subtle rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-yellow rounded-lg flex items-center justify-center text-bg-primary">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl uppercase tracking-tighter">Pencarian Cerdas</h3>
                  <p className="text-[10px] text-text-secondary font-black uppercase tracking-[0.2em] flex items-center gap-1.5 mt-0.5">
                    <Sparkles className="w-3 h-3 text-accent-yellow" />
                    AI-Powered Search
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-bg-tertiary rounded-full transition-colors text-text-secondary"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSearch} className="relative mb-8">
                <input
                  autoFocus
                  type="text"
                  value={queryStr}
                  onChange={(e) => setQueryStr(e.target.value)}
                  placeholder="Cari artikel, event, atau jasa studio..."
                  style={{ fontSize: '16px' }}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-4 px-6 pr-16 text-lg focus:border-accent-yellow focus:ring-1 focus:ring-accent-yellow transition-all outline-none font-sans"
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-accent-yellow rounded-lg flex items-center justify-center text-bg-primary hover:bg-accent-yellow-bright transition-colors"
                >
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>

              <div className="space-y-8">
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-12 text-text-secondary">
                    <Loader2 className="w-10 h-10 animate-spin text-accent-yellow" />
                    <p className="font-black text-[10px] animate-pulse tracking-[0.3em] uppercase">Menganalisis Konten Studio...</p>
                  </div>
                ) : (
                  <>
                    {aiResponse && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-accent-yellow/5 border border-accent-yellow/20 rounded-2xl p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-xl bg-accent-yellow flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-bg-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-accent-yellow mb-2">Saran AI</p>
                            <div className="text-sm text-text-primary leading-relaxed font-sans">
                              {aiResponse}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {results.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Hasil Pencarian ({results.length})</h4>
                        <div className="grid grid-cols-1 gap-3">
                          {results.map((result) => (
                            <Link 
                              key={result.id} 
                              to={result.url}
                              onClick={onClose}
                              className="group flex items-center gap-4 p-4 bg-bg-tertiary border border-border-subtle rounded-xl hover:border-accent-yellow transition-all"
                            >
                              <div className="w-10 h-10 bg-bg-secondary rounded-lg flex items-center justify-center text-text-secondary group-hover:text-accent-yellow transition-colors shrink-0">
                                {result.type === 'article' && <Bookmark className="w-5 h-5" />}
                                {result.type === 'event' && <Calendar className="w-5 h-5" />}
                                {result.type === 'portfolio' && <Briefcase className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-sm truncate group-hover:text-accent-yellow transition-colors">{result.title}</h5>
                                <p className="text-xs text-text-secondary truncate mt-0.5">{result.description}</p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-text-secondary group-hover:translate-x-1 transition-all shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {!aiResponse && results.length === 0 && !isSearching && queryStr && (
                      <div className="flex flex-col items-center justify-center gap-4 py-12 text-text-secondary opacity-50">
                        <Search className="w-12 h-12" />
                        <p className="text-sm font-bold uppercase tracking-widest">Tidak ada hasil ditemukan</p>
                      </div>
                    )}

                    {!queryStr && (
                      <div className="flex flex-col items-center justify-center gap-4 py-12 text-text-secondary opacity-50">
                        <Sparkles className="w-12 h-12" />
                        <p className="text-xs font-black uppercase tracking-[0.3em]">Cari apa saja di studio kami</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-bg-tertiary border-t border-border-subtle flex items-center justify-between text-[10px] font-black text-text-secondary tracking-widest uppercase">
              <div className="flex items-center gap-4">
                <span>Enter ↵ mencari</span>
                <span>ESC menutup</span>
              </div>
              <span className="hidden sm:inline">Davsplace Studio Search v2.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
