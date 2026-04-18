import React from 'react';
import { Users } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_VIDEOS } from '../data';
import { VideoCard } from './VideoCard';
import { Video } from '../types';

interface VideoFeedProps {
  initialVideoId?: string | null;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onDuet?: (video: Video) => void;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ initialVideoId, isMuted = true, onToggleMute, onDuet }) => {
  const [activeVideoIndex, setActiveVideoIndex] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState('foryou');
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (initialVideoId && containerRef.current) {
      const index = MOCK_VIDEOS.findIndex(v => v.id === initialVideoId);
      if (index !== -1) {
        setActiveVideoIndex(index);
        const height = containerRef.current.clientHeight;
        containerRef.current.scrollTo({
          top: index * height,
          behavior: 'instant'
        });
      }
    }
  }, [initialVideoId]);

  const handleScroll = () => {
    if (containerRef.current) {
      const height = containerRef.current.clientHeight;
      const index = Math.round(containerRef.current.scrollTop / height);
      if (index !== activeVideoIndex) {
        setActiveVideoIndex(index);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
    >
      {/* Top Header Tabs */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center gap-6 pt-12 pb-4 bg-gradient-to-b from-bg-dark/60 to-transparent pointer-events-auto">
        <button 
          onClick={() => setActiveTab('following')}
          className={`font-black uppercase tracking-widest text-sm transition-all ${activeTab === 'following' ? 'text-white scale-110' : 'text-white/40'}`}
        >
          Following
        </button>
        <div className="flex flex-col items-center">
          <button 
            onClick={() => setActiveTab('foryou')}
            className={`font-black uppercase tracking-widest text-sm transition-all ${activeTab === 'foryou' ? 'text-white scale-110' : 'text-white/40'}`}
          >
            For You
          </button>
          {activeTab === 'foryou' && (
            <motion.div layoutId="tabLine" className="w-6 h-1 bg-primary rounded-full mt-1 shadow-lg shadow-primary/40" />
          )}
          {activeTab === 'following' && (
            <motion.div layoutId="tabLine" className="w-6 h-1 bg-primary rounded-full mt-1 shadow-lg shadow-primary/40 opacity-0" />
          )}
        </div>
      </div>

      {activeTab === 'foryou' ? (
        MOCK_VIDEOS.map((video, index) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            isActive={index === activeVideoIndex} 
            isMuted={isMuted}
            onToggleMute={onToggleMute}
            onDuet={onDuet}
          />
        ))
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center p-10 text-center space-y-4">
          <div className="w-20 h-20 bg-card-dark rounded-full flex items-center justify-center text-primary border border-white/5">
            <Users size={40} />
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-widest">No Following yet</h2>
          <p className="text-text-dim text-sm">Start following your favorite creators to see their latest loops here!</p>
          <button 
            onClick={() => setActiveTab('foryou')}
            className="bg-primary text-white font-black uppercase tracking-widest px-8 py-3 rounded-xl shadow-lg shadow-primary/20"
          >
            Find Creators
          </button>
        </div>
      )}
    </div>
  );
};
