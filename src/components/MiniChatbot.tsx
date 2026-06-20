import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Sparkles, Loader2, EyeOff } from 'lucide-react';
import { getChatResponse } from '../lib/gemini';
import { cn } from '../lib/utils';

export default function MiniChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Halo! Saya asisten virtual Davsplace Studio. Ada yang bisa saya bantu terkait layanan desain atau video kami?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Load dismissed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mini_chatbot_dismissed');
    if (saved === 'true') {
      setIsDismissed(true);
    }

    // Add a custom event listener so footer or other components can trigger restoration
    const handleRestore = () => {
      setIsDismissed(false);
      localStorage.removeItem('mini_chatbot_dismissed');
    };

    window.addEventListener('restore-chatbot', handleRestore);
    return () => window.removeEventListener('restore-chatbot', handleRestore);
  }, []);

  const dismissChatbot = () => {
    setIsDismissed(true);
    setIsOpen(false);
    localStorage.setItem('mini_chatbot_dismissed', 'true');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const prompt = `Kamu adalah asisten virtual Davsplace Studio. 
    Bantu pengunjung memahami layanan kami (Desain Grafis, Video Editing, Dokumentasi, Konsultasi Brand).
    Arahkan mereka untuk menghubungi tim via WhatsApp untuk detail lebih lanjut.
    
    User bertanya: "${userMessage}"`;

    try {
      const responseText = await getChatResponse(prompt);
      setMessages(prev => [...prev, { role: 'ai', text: responseText || 'Maaf, saya tidak bisa menjangjawab saat ini.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Maaf, saya sedang mengalami kendala teknis. Silakan hubungi kami via WhatsApp.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-24 left-4 lg:bottom-8 lg:left-8 z-[100] flex flex-col items-start gap-2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 left-0 w-[350px] max-w-[calc(100vw-2rem)] bg-bg-secondary border border-border-subtle rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-accent-yellow flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-bg-primary">
                <div className="w-8 h-8 bg-bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent-yellow" />
                </div>
                <div>
                  <h4 className="font-display font-black text-xs leading-none">Tanya Davsplace</h4>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-70 mt-0.5">AI Assistant</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={dismissChatbot} 
                  title="Sembunyikan bantuan AI sepenuhnya"
                  className="p-1.5 hover:bg-black/10 rounded-lg transition-colors text-bg-primary flex items-center gap-1"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-wider hidden sm:inline">Hide</span>
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1.5 hover:bg-black/10 rounded-lg transition-colors text-bg-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="h-[320px] overflow-y-auto p-4 flex flex-col gap-3 scroll-smooth custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "max-w-[85%] p-3 rounded-xl text-xs leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-accent-yellow text-bg-primary font-bold self-end rounded-tr-none" 
                    : "bg-bg-tertiary text-text-primary self-start rounded-tl-none border border-border-subtle"
                )}>
                  {msg.text}
                </div>
              ))}
              {isLoading && (
                <div className="bg-bg-tertiary text-text-secondary p-3 rounded-xl rounded-tl-none self-start border border-border-subtle flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-yellow" />
                  <span className="text-[9px] font-bold uppercase tracking-widest animate-pulse">Mengetik...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-bg-tertiary border-t border-border-subtle flex gap-1.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pertanyaan..."
                style={{ fontSize: '14px' }}
                className="flex-1 bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2.5 text-xs focus:border-accent-yellow outline-none transition-all"
              />
              <button className="w-10 h-10 bg-accent-yellow rounded-lg flex items-center justify-center text-bg-primary hover:rotate-12 transition-transform shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group/launcher flex items-center">
        {/* Floating Chat Launcher Button (Much smaller, w-11 h-11) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-11 h-11 bg-accent-yellow rounded-xl shadow-2xl flex items-center justify-center text-bg-primary relative overflow-hidden"
          title="Tanya Davsplace AI"
        >
          {isOpen ? <X className="w-5 h-5 relative z-10" /> : <MessageSquare className="w-5 h-5 relative z-10" />}
        </motion.button>

        {/* Small external 'x' dismiss button when chatbot bubble is hovered to dismiss it easily */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            dismissChatbot();
          }}
          title="Sembunyikan Tombol Bot"
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-bg-secondary border border-border-subtle text-text-secondary hover:text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover/launcher:opacity-100 z-20 hover:border-red-500 hover:bg-red-500/10"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}
