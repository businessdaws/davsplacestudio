import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Search, 
  DollarSign, 
  Activity, 
  Clock, 
  BadgeAlert,
  Coins,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

interface CryptoTrackerProps {
  variant?: 'ticker' | 'detailed';
}

export default function CryptoTracker({ variant = 'detailed' }: CryptoTrackerProps) {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [source, setSource] = useState<string>('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState<'usd' | 'idr'>('usd');
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const USD_TO_IDR = 16150; // Standard currency conversion for localized context

  const fetchStockData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const res = await fetch('/api/coingecko/markets');
      if (!res.ok) throw new Error('API error response');
      const payload = await res.json();
      
      if (payload.data && Array.isArray(payload.data)) {
        setCoins(payload.data);
        setSource(payload.source || 'coingecko-api');
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch crypto assets:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStockData();
    // Auto-update every 45 Seconds to keep it live
    const interval = setInterval(() => {
      fetchStockData(true);
    }, 45000);
    return () => clearInterval(interval);
  }, [fetchStockData]);

  const handleRefresh = () => {
    fetchStockData(true);
  };

  const getSparklineSvgPath = (prices: number[] | undefined, width = 120, height = 40) => {
    if (!prices || prices.length < 2) return '';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min === 0 ? 1 : max - min;
    
    return prices
      .map((val, index) => {
        const x = (index / (prices.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const formatPrice = (price: number) => {
    if (currency === 'idr') {
      const idrPrice = price * USD_TO_IDR;
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(idrPrice);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 4 : 2
    }).format(price);
  };

  const formatLargeNumber = (num: number) => {
    if (currency === 'idr') {
      num = num * USD_TO_IDR;
    }
    if (num >= 1e12) return (num / 1e12).toFixed(2) + (currency === 'idr' ? ' T' : ' B');
    if (num >= 1e9) return (num / 1e9).toFixed(2) + (currency === 'idr' ? ' M' : ' B');
    if (num >= 1e6) return (num / 1e6).toFixed(2) + ' M';
    return num.toLocaleString();
  };

  const filteredCoins = coins.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (variant === 'ticker') {
    return (
      <div className="w-full bg-black/95 border-t border-b border-white/5 py-4 overflow-hidden flex items-center relative z-20 select-none">
        <style>{`
          @keyframes marquee_loop {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          .animate-marquee-smooth {
            display: flex;
            width: max-content;
            animation: marquee_loop 40s linear infinite;
          }
          .animate-marquee-smooth:hover {
            animation-play-state: paused;
          }
        `}</style>
        
        {/* Left fixed badge tab */}
        <div className="absolute left-0 top-0 bottom-0 px-5 bg-bg-primary border-r border-border-subtle/50 flex items-center gap-1.5 font-sans font-black text-[9px] uppercase tracking-[0.2em] text-accent-yellow shadow-[4px_0_12px_rgba(0,0,0,0.5)] z-30 shrink-0">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="inline">MARKET TICKER:</span>
        </div>
        
        {/* Scrolling segment marquee container */}
        <div className="flex w-full overflow-hidden items-center pl-36 xs:pl-40">
          <div className="animate-marquee-smooth flex items-center gap-14">
            {coins.length > 0 ? (
              // Double clone entries for infinitely fluid looping transition
              [...coins, ...coins, ...coins, ...coins].map((coin, idx) => {
                const isPositive = coin.price_change_percentage_24h >= 0;
                return (
                  <div key={`${coin.id}-${idx}`} className="flex items-center gap-2 text-[10px] shrink-0 font-mono tracking-tight">
                    <img src={coin.image} alt={coin.name} className="w-4 h-4 object-contain rounded-full bg-neutral-900 overflow-hidden" />
                    <span className="font-display font-black text-white">{coin.symbol.toUpperCase()}</span>
                    <span className="text-neutral-300 font-semibold">{formatPrice(coin.current_price)}</span>
                    <span className={cn(
                      "font-bold flex items-center gap-0.5",
                      isPositive ? "text-green-400" : "text-red-400"
                    )}>
                      {isPositive ? '▲' : '▼'}{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </span>
                  </div>
                );
              })
            ) : (
              Array(12).fill(null).map((_, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] text-text-secondary animate-pulse shrink-0">
                  <span className="w-4 h-4 rounded-full bg-neutral-800" />
                  <span className="w-12 h-3 bg-neutral-800 rounded" />
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Soft shadow cover over the right exit to look flawless */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-bg-primary via-bg-primary/50 to-transparent pointer-events-none z-30" />
      </div>
    );
  }

  return (
    <section id="market-asset-tracker" className="py-20 bg-bg-primary border-t border-border-subtle/50 relative overflow-hidden">
      {/* Visual background decorations */}
      <div className="absolute top-1/4 left-10 w-[300px] h-[300px] bg-accent-yellow/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[250px] h-[250px] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Simplified Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-border-subtle/30 pb-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-yellow/10 border border-accent-yellow/20 rounded-full text-accent-yellow text-[9px] font-black uppercase tracking-widest">
              <Activity className="w-3.5 h-3.5 animate-pulse text-accent-yellow" />
              Live Asset Tickering
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight uppercase">
              REALTIME MULTI-ASSET INDEX
            </h2>
          </div>
        </div>

        {/* Loading placeholder display */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-bg-secondary/40 border border-border-subtle rounded-3xl p-6 h-[220px] animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-800" />
                  <div className="space-y-2">
                    <div className="w-20 h-4 bg-neutral-800 rounded" />
                    <div className="w-12 h-3 bg-neutral-800 rounded" />
                  </div>
                </div>
                <div className="w-2/3 h-8 bg-neutral-800 rounded pt-3" />
                <div className="w-full h-10 bg-neutral-800 rounded" />
              </div>
            ))}
          </div>
        ) : filteredCoins.length === 0 ? (
          <div className="text-center py-16 bg-bg-secondary border border-border-subtle rounded-3xl flex flex-col items-center space-y-3">
            <BadgeAlert className="w-12 h-12 text-text-secondary opacity-45" />
            <p className="text-sm font-display font-black uppercase text-white tracking-widest">Aset Tidak Ditemukan</p>
            <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
              Coba gunakan keyword pencarian lain seperti 'btc' atau nama lengkap aset crypto.
            </p>
          </div>
        ) : (
          /* Multi asset grid cards displaying responsive real-time data */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoins.map((coin, idx) => {
              const isPositive = coin.price_change_percentage_24h >= 0;
              return (
                <motion.div
                  key={coin.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => setSelectedCoin(coin)}
                  className="bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle hover:border-accent-yellow/20 cursor-pointer rounded-3xl p-6 transition-all duration-300 relative overflow-hidden group hover:shadow-xl hover:shadow-black/20"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent-yellow/5 group-hover:bg-accent-yellow/10 blur-[40px] transition-colors" />
                  
                  {/* Coin Metadata Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={coin.image} 
                        alt={coin.name} 
                        className="w-10 h-10 rounded-full border border-border-subtle/50 bg-neutral-900 object-contain p-1 group-hover:scale-105 transition"
                      />
                      <div>
                        <h4 className="text-sm font-display font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                          {coin.name}
                          <span className="text-[9px] text-text-secondary font-mono px-1.5 py-0.5 bg-bg-primary rounded border border-border-subtle">
                            {coin.symbol.toUpperCase()}
                          </span>
                        </h4>
                        <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mt-0.5">
                          Peringkat #{coin.market_cap_rank}
                        </p>
                      </div>
                    </div>
                    
                    <button className="p-2 bg-bg-primary/50 group-hover:bg-accent-yellow group-hover:text-bg-primary rounded-xl transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Pricing Row */}
                  <div className="py-2">
                    <p className="text-2xl font-display font-black tracking-tight text-white group-hover:text-accent-yellow transition duration-300">
                      {formatPrice(coin.current_price)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {isPositive ? (
                        <TrendingUp className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <span className={cn(
                        "text-xs font-black uppercase tracking-wider",
                        isPositive ? "text-green-400" : "text-red-400"
                      )}>
                        {isPositive ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                      </span>
                      <span className="text-[10px] text-text-secondary font-semibold font-sans">
                        / 24 jam terakhir
                      </span>
                    </div>
                  </div>

                  {/* Sparkline mini chart visualizer using standard SVGs */}
                  <div className="mt-4 pt-4 border-t border-border-subtle/40 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">
                        Grafik Tren 7D
                      </p>
                      <svg width="100%" height="32" className="overflow-visible block">
                        <motion.path
                          d={getSparklineSvgPath(coin.sparkline_in_7d?.price, 140, 32)}
                          fill="none"
                          stroke={isPositive ? '#4ade80' : '#f87171'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 1.2, ease: "easeInOut", delay: idx * 0.05 + 0.3 }}
                        />
                      </svg>
                    </div>

                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
                        Kapitalisasi
                      </p>
                      <p className="text-[10px] font-bold text-white mt-0.5">
                        {formatLargeNumber(coin.market_cap)}
                      </p>
                      <p className="text-[8px] text-text-secondary font-mono">
                        Vol: {formatLargeNumber(coin.total_volume)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Modal detail card expansion */}
        <AnimatePresence>
          {selectedCoin && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ transform: 'scale(0.95)', opacity: 0 }}
                animate={{ transform: 'scale(1)', opacity: 1 }}
                exit={{ transform: 'scale(0.95)', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-xl bg-bg-secondary border border-border-subtle p-8 rounded-[3rem] shadow-2xl space-y-6"
              >
                {/* Header detail */}
                <div className="flex items-center justify-between border-b border-border-subtle/30 pb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedCoin.image} 
                      alt={selectedCoin.name} 
                      className="w-12 h-12 rounded-full border border-accent-yellow/20 p-1"
                    />
                    <div>
                      <span className="px-2 py-0.5 bg-accent-yellow/10 text-accent-yellow text-[8px] rounded-md font-black uppercase tracking-widest border border-accent-yellow/20">
                        Asset #{selectedCoin.market_cap_rank}
                      </span>
                      <h3 className="text-xl font-display font-black uppercase text-white mt-1">
                        {selectedCoin.name} ({selectedCoin.symbol.toUpperCase()})
                      </h3>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedCoin(null)}
                    className="p-1 px-3 py-1.5 text-[10px] font-black uppercase bg-bg-tertiary border border-border-subtle hover:text-white rounded-xl text-text-secondary transition"
                  >
                    TUTUP
                  </button>
                </div>

                {/* Grid stats cards of details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-bg-tertiary/60 border border-border-subtle rounded-2xl">
                    <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Harga Hari Ini</span>
                    <p className="text-lg font-display font-black text-accent-yellow mt-1">{formatPrice(selectedCoin.current_price)}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">IDR-Rate: 1 USD ~ {USD_TO_IDR.toLocaleString()} IDR</p>
                  </div>

                  <div className="p-4 bg-bg-tertiary/60 border border-border-subtle rounded-2xl">
                    <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Perubahan 24 Jam</span>
                    <p className={cn(
                      "text-lg font-display font-black mt-1",
                      selectedCoin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {selectedCoin.price_change_percentage_24h >= 0 ? '+' : ''}
                      {selectedCoin.price_change_percentage_24h.toFixed(3)}%
                    </p>
                    <p className="text-[10px] text-text-secondary mt-0.5">Sentimen pergerakan tren</p>
                  </div>

                  <div className="p-4 bg-bg-tertiary/60 border border-border-subtle rounded-2xl">
                    <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Tertinggi 24 Jam</span>
                    <p className="text-sm font-black text-white mt-1">{formatPrice(selectedCoin.high_24h)}</p>
                  </div>

                  <div className="p-4 bg-bg-tertiary/60 border border-border-subtle rounded-2xl">
                    <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Terendah 24 Jam</span>
                    <p className="text-sm font-black text-white mt-1">{formatPrice(selectedCoin.low_24h)}</p>
                  </div>

                  <div className="p-4 bg-bg-tertiary/60 border border-border-subtle rounded-2xl">
                    <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Kapitalisasi Pasar</span>
                    <p className="text-sm font-black text-white mt-1">{formatPrice(selectedCoin.market_cap)}</p>
                  </div>

                  <div className="p-4 bg-bg-tertiary/60 border border-border-subtle rounded-2xl">
                    <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Volume Total</span>
                    <p className="text-sm font-black text-white mt-1">{formatPrice(selectedCoin.total_volume)}</p>
                  </div>
                </div>

                {/* 7d history graph in large dialog inside details expanding visual craft */}
                {selectedCoin.sparkline_in_7d && (
                  <div className="p-5 bg-bg-tertiary border border-border-subtle rounded-[2rem]">
                    <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-wider">
                      <span className="text-text-secondary flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-accent-yellow" />
                        7-Day High Resolution Sparkline
                      </span>
                      <span className={selectedCoin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}>
                        {selectedCoin.price_change_percentage_24h >= 0 ? "Bullish trend line" : "Bearish trend line"}
                      </span>
                    </div>

                    <div className="h-28 flex items-end">
                      <svg width="100%" height="90" className="overflow-visible block">
                        <motion.path
                          d={getSparklineSvgPath(selectedCoin.sparkline_in_7d.price, 450, 90)}
                          fill="none"
                          stroke={selectedCoin.price_change_percentage_24h >= 0 ? '#4ade80' : '#f87171'}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.1 }}
                        />
                      </svg>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedCoin(null)}
                  className="w-full py-3.5 bg-accent-yellow hover:bg-white text-bg-primary font-black rounded-2xl text-[10px] uppercase tracking-wider transition-all"
                >
                  KEMBALI KE INSTRUMEN
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
