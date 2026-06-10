import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { getChatResponse } from '../lib/gemini';

export default function MiniChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Halo! Saya asisten virtual Davsplace Studio. Ada yang bisa saya bantu terkait layanan desain atau video kami?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-[400px] max-w-[calc(100vw-4rem)] bg-bg-secondary border border-border-subtle rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-accent-yellow flex items-center justify-between">
              <div className="flex items-center gap-3 text-bg-primary">
                <div className="w-10 h-10 bg-bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-accent-yellow" />
                </div>
                <div>
                  <h4 className="font-display font-bold">Tanya Davsplace</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">AI Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/10 rounded-full transition-colors text-bg-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="h-[400px] overflow-y-auto p-6 flex flex-col gap-4 scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "max-w-[80%] p-4 rounded-xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-accent-yellow text-bg-primary font-medium self-end rounded-tr-none" 
                    : "bg-bg-tertiary text-text-primary self-start rounded-tl-none border border-border-subtle"
                )}>
                  {msg.text}
                </div>
              ))}
              {isLoading && (
                <div className="bg-bg-tertiary text-text-secondary p-4 rounded-xl rounded-tl-none self-start border border-border-subtle flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Mengetik...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-bg-tertiary border-t border-border-subtle flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pertanyaan..."
                style={{ fontSize: '16px' }}
                className="flex-1 bg-bg-secondary border border-border-subtle rounded-xl px-4 py-3 text-sm focus:border-accent-yellow outline-none transition-all"
              />
              <button className="w-12 h-12 bg-accent-yellow rounded-lg flex items-center justify-center text-bg-primary hover:rotate-12 transition-transform">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-accent-yellow rounded-xl shadow-2xl flex items-center justify-center text-bg-primary group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        {isOpen ? <X className="w-7 h-7 relative z-10" /> : <MessageSquare className="w-7 h-7 relative z-10" />}
      </motion.button>
    </div>
  );
}

import { cn } from '../lib/utils';
