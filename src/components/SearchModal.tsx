import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Loader2, Send, Sparkles } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { smartSearch } from '../lib/gemini';

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    // Simulation of context
    const context = `
      Services: Desain Grafis, Video Editing, Dokumentasi, Konsultasi Brand.
      Articles: 5 Trend Desain 2024, Engagement YouTube, Konsistensi Visual.
      Events: Content Creator Masterclass (25 Juni), Jakarta Creative Night (12 Juli).
    `;

    const response = await smartSearch(query, context);
    setAiResponse(response);
    setIsSearching(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
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
            className="relative w-full max-w-2xl bg-bg-secondary border border-border-subtle rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-yellow rounded-lg flex items-center justify-center text-bg-primary">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl">Pencarian Cerdas</h3>
                  <p className="text-xs text-text-secondary font-bold uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-accent-yellow" />
                    Powered by Gemini AI
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
            <div className="p-8">
              <form onSubmit={handleSearch} className="relative mb-8">
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Butuh jasa apa? Atau cari artikel..."
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-4 px-6 pr-16 text-lg focus:border-accent-yellow focus:ring-1 focus:ring-accent-yellow transition-all outline-none"
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-accent-yellow rounded-lg flex items-center justify-center text-bg-primary hover:bg-accent-yellow-bright transition-colors"
                >
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>

              {/* AI Response Area */}
              <div className="min-h-[200px] flex flex-col gap-6">
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-12 text-text-secondary">
                    <Loader2 className="w-10 h-10 animate-spin text-accent-yellow" />
                    <p className="font-bold text-sm animate-pulse tracking-widest uppercase">Menganalisis Kebutuhan Anda...</p>
                  </div>
                ) : aiResponse ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-bg-tertiary/50 border border-border-subtle rounded-xl p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-accent-yellow flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-bg-primary" />
                      </div>
                      <div className="text-sm text-text-primary leading-relaxed prose prose-invert max-w-none">
                        {aiResponse}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 py-12 text-text-secondary opacity-50">
                    <Sparkles className="w-12 h-12" />
                    <p className="text-sm font-medium">Tanyakan apapun tentang Davsplace Studio</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-bg-tertiary border-t border-border-subtle flex items-center justify-between text-[10px] font-bold text-text-secondary tracking-widest uppercase">
              <span>Enter untuk mencari</span>
              <span>ESC untuk menutup</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
