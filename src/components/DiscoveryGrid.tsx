import React from 'react';
import { Search, TrendingUp, Music2, Users, Heart, Radio, BrainCircuit } from 'lucide-react';
import { MOCK_VIDEOS } from '../data';
import { motion } from 'motion/react';

interface DiscoveryGridProps {
  onVideoClick: (id: string) => void;
}

export const DiscoveryGrid: React.FC<DiscoveryGridProps> = ({ onVideoClick }) => {
  const categories = [
    { id: '1', name: 'Music', icon: Music2, color: 'bg-primary/20 border-primary/40 text-primary' },
    { id: '2', name: 'Live', icon: Radio, color: 'bg-red-500/20 border-red-500/40 text-red-500' },
    { id: '3', name: 'Learn', icon: BrainCircuit, color: 'bg-secondary/20 border-secondary/40 text-secondary' },
    { id: '4', name: 'Dance', icon: TrendingUp, color: 'bg-purple-500/20 border-purple-500/40 text-purple-400' },
  ];

  return (
    <div className="h-full bg-bg-dark overflow-y-auto no-scrollbar relative pb-32">
      {/* Search Header */}
      <div className="pt-12 px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
          <input 
            type="text" 
            placeholder="Search creators, videos, trends..." 
            className="w-full bg-glass backdrop-blur-md rounded-full py-2.5 pl-10 pr-4 text-white placeholder-text-dim focus:outline-none border border-white/5 focus:border-secondary transition-all text-sm"
          />
        </div>
      </div>

      {/* Banner Section */}
      <div className="px-4 mb-8">
        <div className="h-44 rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-secondary p-6 flex flex-col justify-end relative overflow-hidden shadow-xl shadow-primary/10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-1">Trending Now</span>
          <h2 className="text-2xl font-black text-white drop-shadow-md">#LoopChallenge</h2>
          <p className="text-xs text-white/80 mt-1 font-medium">Join the global movement 🚀</p>
        </div>
      </div>

      {/* Trending Hashtags Horizontal Scroll */}
      <div className="mb-8 overflow-hidden">
        <div className="px-5 mb-3 flex items-center justify-between">
           <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-text-dim">Trending Hashtags</h3>
           <TrendingUp size={14} className="text-primary" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pb-2">
          {['trending', 'loopviral', 'summer2024', 'goldenhour', 'lifehacks', 'recipe', 'tech', 'programmer', 'dance', 'vibe'].map((tag) => (
            <button
              key={tag}
              className="whitespace-nowrap bg-card-dark border border-white/5 px-4 py-2 rounded-xl text-[11px] font-bold text-white/80 transition-all hover:bg-glass hover:border-primary/40 group flex items-center gap-2 shadow-lg"
            >
              <span className="text-primary group-hover:scale-125 transition-transform">#</span>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Live Streams Section */}
      <div className="mb-8 overflow-hidden px-4">
        <div className="flex items-center justify-between mb-4">
           <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-text-dim">Live Streams</h3>
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-tighter text-red-500">Global</span>
           </div>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
           {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[140px] aspect-[9/12] relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl group cursor-pointer">
                 <img src={`https://picsum.photos/seed/live${i}/400/600`} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="live" />
                 <div className="absolute top-2 left-2 bg-red-500 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm">Live</div>
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                 <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold truncate">@streamer_{i}</span>
                    <div className="flex items-center gap-1 text-[8px] text-white/60">
                       <Users size={8} />
                       {Math.floor(Math.random() * 50)}k viewers
                    </div>
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="px-4 mb-8 overflow-x-auto no-scrollbar flex gap-3">
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            className={`${cat.color} min-w-[110px] h-20 rounded-2xl p-4 flex flex-col justify-between cursor-pointer border backdrop-blur-sm shadow-lg`}
          >
            <cat.icon size={18} />
            <span className="text-xs font-bold uppercase tracking-tight">{cat.name}</span>
          </motion.div>
        ))}
      </div>

      {/* Discovery Grid */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-bold text-sm uppercase tracking-widest text-text-dim flex items-center gap-2">
            Trending Content
          </h3>
          <button className="text-[11px] text-primary font-black uppercase tracking-tighter">View All</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MOCK_VIDEOS.concat(MOCK_VIDEOS).map((video, i) => (
            <motion.div 
              key={`${video.id}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onVideoClick(video.id)}
              className="aspect-[3/4] relative bg-card-dark rounded-xl overflow-hidden group cursor-pointer border border-white/5 shadow-inner"
            >
              <img 
                src={video.thumbnail} 
                className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                alt="video thumbnail"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-1 left-1 flex items-center gap-0.5 text-[10px] font-bold text-white shadow-black drop-shadow-md">
                <Heart size={10} fill="currentColor" />
                {(video.likes / 1000).toFixed(1)}k
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
