import React from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Save, Download, Sparkles, Image as ImageIcon, Send, Palette, Search, ExternalLink, Activity, Info, Lock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../context/ThemeContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface OutputCardProps {
  title: string;
  content?: string | string[];
  data?: {
    headline?: string;
    caption?: string;
    hashtags?: string[];
    imagePrompt?: string;
    sources?: string[];
  };
  type?: 'text' | 'list' | 'image' | 'hashtags' | 'package';
  onSave?: () => void;
  metadata?: string;
  icon?: React.ReactNode;
  isPremium?: boolean;
}

export default function OutputCard({ title, content, data, type = 'text', onSave, metadata, icon, isPremium = true }: OutputCardProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const { theme } = useTheme();

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isPackage = type === 'package' || (data && (data.headline || data.caption));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border rounded-[32px] overflow-hidden transition-all duration-500 group relative",
        theme === 'dark' 
          ? "bg-[#0A0A0A] border-white/5 hover:border-white/10 shadow-2xl" 
          : "bg-white border-slate-200/60 shadow-xl shadow-slate-200/20"
      )}
    >
      {/* Dynamic Header */}
      <div className={cn(
        "px-8 py-6 border-b flex items-center justify-between",
        theme === 'dark' ? "border-white/5 bg-white/[0.01]" : "border-slate-100 bg-slate-50/30"
      )}>
        <div className="flex items-center gap-4">
          {icon && <div className={cn(
            "p-2.5 rounded-2xl group-hover:rotate-6 transition-transform shadow-lg",
            theme === 'dark' ? "bg-white/5 text-yellow-400 shadow-black/50" : "bg-white text-yellow-600 shadow-yellow-500/10"
          )}>{icon}</div>}
          <div>
            <h3 className={cn(
              "text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-3",
              theme === 'dark' ? "text-white/40" : "text-slate-400"
            )}>
              {title}
              {!isPremium && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500 text-black text-[8px] font-black tracking-widest">
                  PRO
                </span>
              )}
            </h3>
            {metadata && <p className={cn(
              "text-xs font-bold mt-1",
              theme === 'dark' ? "text-white/80" : "text-slate-900"
            )}>{metadata}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
           {onSave && (
            <button 
              onClick={onSave}
              className={cn(
                "h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border",
                theme === 'dark' 
                  ? "bg-white/5 hover:bg-white/10 text-white/60 border-white/5" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-100 shadow-sm"
              )}
            >
              <Save className="w-3.5 h-3.5" />
              Simpan
            </button>
          )}
        </div>
      </div>
      
      <div className="p-8 space-y-8">
        {/* Package Content Redesign */}
        {isPackage && data && (
          <div className="space-y-10">
            {/* Headline Area */}
            {data.headline && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] opacity-30", theme === 'dark' ? "text-white" : "text-slate-900")}>Headline / Hook</span>
                  <button onClick={() => handleCopy(data.headline!, 'headline')} className="text-[9px] font-black uppercase tracking-widest text-yellow-500">
                    {copiedField === 'headline' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <h4 className={cn(
                  "text-2xl md:text-3xl font-black leading-tight tracking-tight",
                  theme === 'dark' ? "text-white" : "text-slate-900"
                )}>{data.headline}</h4>
              </div>
            )}

            {/* Caption Area */}
            {data.caption && (
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                  <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] opacity-30", theme === 'dark' ? "text-white" : "text-slate-900")}>Caption / Post Body</span>
                  <button onClick={() => handleCopy(data.caption!, 'caption')} className="text-[9px] font-black uppercase tracking-widest text-yellow-500">
                    {copiedField === 'caption' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className={cn(
                  "p-6 rounded-2xl border text-[15px] leading-relaxed font-medium whitespace-pre-wrap",
                  theme === 'dark' ? "bg-white/[0.02] border-white/5 text-white/70" : "bg-slate-50 border-slate-200/60 text-slate-700"
                )}>
                  {data.caption}
                </div>
              </div>
            )}

            {/* Elements Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Hashtags */}
               {data.hashtags && data.hashtags.length > 0 && (
                <div className="space-y-4">
                  <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] opacity-30", theme === 'dark' ? "text-white" : "text-slate-900")}>Hashtags</span>
                  <div className="flex flex-wrap gap-2">
                    {data.hashtags.map((tag, i) => (
                      <span key={i} className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-tighter",
                        theme === 'dark' ? "bg-white/5 border-white/5 text-white/50" : "bg-slate-100 border-slate-100 text-slate-500"
                      )}>{tag.startsWith('#') ? tag : `#${tag}`}</span>
                    ))}
                  </div>
                </div>
               )}

               {/* Sources */}
               {data.sources && data.sources.length > 0 && (
                <div className="space-y-4">
                  <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] opacity-30", theme === 'dark' ? "text-white" : "text-slate-900")}>Riset / Sumber</span>
                  <div className="space-y-2">
                    {data.sources.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] font-bold opacity-60">
                        <div className="w-1 h-1 rounded-full bg-yellow-500" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
               )}
            </div>

            {/* Image Prompt - Special Box */}
            {data.imagePrompt && (
              <div className={cn(
                "p-8 rounded-[24px] border border-dashed relative overflow-hidden group/prompt",
                theme === 'dark' ? "bg-yellow-400/[0.02] border-yellow-400/20" : "bg-yellow-50/50 border-yellow-200"
              )}>
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-yellow-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">AI Visual Prompt</span>
                  </div>
                  <button 
                    onClick={() => handleCopy(data.imagePrompt!, 'prompt')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-yellow-400/20"
                  >
                    {copiedField === 'prompt' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copy Prompt
                  </button>
                </div>
                <p className={cn(
                   "text-[13px] font-medium leading-relaxed italic opacity-80",
                   theme === 'dark' ? "text-white" : "text-slate-900"
                )}>"{data.imagePrompt}"</p>
              </div>
            )}
          </div>
        )}

        {/* Fallback for legacy types */}
        {!isPackage && (
          <>
            {type === 'list' && Array.isArray(content) && (
              <ul className="space-y-4">
                {content.map((item, i) => (
                  <li key={i} className={cn(
                    "flex gap-4 text-sm font-medium leading-relaxed group/li",
                    theme === 'dark' ? "text-white/60" : "text-slate-600"
                  )}>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full mt-2 shrink-0 transition-transform group-hover/li:scale-150",
                      theme === 'dark' ? "bg-yellow-500" : "bg-yellow-600"
                    )} />
                    {item}
                  </li>
                ))}
              </ul>
            )}
            
            {type === 'hashtags' && Array.isArray(content) && (
              <div className="flex flex-wrap gap-2">
                {content.map((tag, i) => (
                  <span key={i} className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black border transition-all cursor-pointer uppercase tracking-tighter",
                    theme === 'dark' 
                      ? "bg-white/5 text-white/50 border-white/5 hover:border-yellow-500/30 hover:text-yellow-400" 
                      : "bg-slate-50 text-slate-500 border-slate-100 hover:border-yellow-500/30 hover:text-yellow-600"
                  )}>
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}

            {type === 'text' && typeof content === 'string' && (
              <div className={cn(
                "whitespace-pre-wrap text-[15px] font-medium leading-relaxed",
                theme === 'dark' ? "text-white/70" : "text-slate-700"
              )}>
                {content}
              </div>
            )}
          </>
        )}
      </div>

      {/* Copy All Toast - Implicit in field copy buttons now */}
    </motion.div>
  );
}
