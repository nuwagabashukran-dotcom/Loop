import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Music2, 
  Plus, 
  Disc2,
  Check,
  Play,
  Volume2,
  VolumeX,
  Users
} from 'lucide-react';
import { Video } from '../types';
import { db, auth } from '../services/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  onDuet?: (video: Video) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, isActive, onDuet }) => {
  const [liked, setLiked] = React.useState(false);
  const [likesCount, setLikesCount] = React.useState(video.likes);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [showHeartAnim, setShowHeartAnim] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const [isBuffering, setIsBuffering] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const lastTap = React.useRef<number>(0);

  const handleTap = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double Tap detected
      if (!liked) {
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 800);
    } else {
      // Single Tap detected: Play/Pause toggles
      togglePlay();
    }
    lastTap.current = now;
  };

  React.useEffect(() => {
    let isMounted = true;
    const videoElement = videoRef.current;
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (videoElement) {
      if (isActive) {
        const attemptPlay = () => {
          if (!videoElement) return;
          
          // Force a load if the state is not ready
          if (videoElement.readyState === 0) {
            videoElement.load();
          }

          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => { if (isMounted) setIsPlaying(true); })
              .catch(() => { if (isMounted) setIsPlaying(false); });
          }
        };

        attemptPlay();
        timer = setTimeout(() => {
          if (videoElement && (videoElement.paused || videoElement.readyState < 2)) {
            attemptPlay();
          }
        }, 800);
      } else {
        videoElement.pause();
        videoElement.currentTime = 0;
        setIsPlaying(false);
      }
    }

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      if (videoElement && isActive) {
        videoElement.pause();
      }
    };
  }, [isActive]);

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
        setIsPlaying(false);
      } else {
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
      }
    }
  };

  const handleLike = async () => {
    // Increment local state
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1: prev + 1);

    // Update Firestore points (only if liking)
    if (!liked) {
      try {
        const userRef = doc(db, 'users', auth.currentUser!.uid);
        await updateDoc(userRef, {
          points: increment(1)
        });
      } catch (e) {
        console.error("Error updating points:", e);
      }
    }
  };

  return (
    <div 
      onClick={handleTap}
      className="relative w-full h-[100dvh] flex items-center justify-center bg-black snap-start overflow-hidden cursor-pointer"
    >
      {/* Background Video */}
      <video
        key={`${video.id}-${retryCount}`}
        ref={videoRef}
        loop
        playsInline
        muted={false}
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        poster={video.thumbnail}
        referrerPolicy="no-referrer"
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onStalled={() => setIsBuffering(true)}
        onAbort={() => {
          console.warn('Video load aborted for ID:', video.id);
          setIsBuffering(false);
        }}
        onLoadedData={() => {
          setHasError(false);
          setIsBuffering(false);
        }}
        onError={(e) => {
          const v = e.target as HTMLVideoElement;
          console.error(`Media Error [ID: ${video.id}]:`, {
            code: v.error?.code,
            message: v.error?.message,
            url: video.url
          });
          setHasError(true);
        }}
      >
        <source src={video.url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Error Fallback when video fails or is unsupported */}
      <AnimatePresence>
        {hasError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-bg-dark/80 backdrop-blur-lg z-50 text-center p-10"
          >
            <div className="flex flex-col items-center gap-6">
               <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border border-primary/40 shadow-2xl shadow-primary/20">
                 <Disc2 size={48} className="text-primary animate-pulse" />
               </div>
               <div className="space-y-2">
                 <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white">Source Unstable</h2>
                 <p className="text-[10px] lowercase text-white/50 max-w-[200px] leading-relaxed italic">The loop is currently refreshing or your browser format is restricted. Checking for signal...</p>
               </div>
               <button 
                 onClick={() => {
                   setHasError(false);
                   setRetryCount(prev => prev + 1);
                 }}
                 className="mt-4 px-6 py-2 bg-glass border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
               >
                 Retry Signal
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute/Unmute Indicator Overlay - REMOVED */}

      {/* Tap for sound hint - REMOVED */}

      {/* Buffering/Loading Indicator */}
      <AnimatePresence>
        {isBuffering && isActive && !hasError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-20 pointer-events-none"
          >
            <div className="flex flex-col items-center gap-4">
               <Disc2 size={64} className="text-primary animate-spin opacity-80" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Syncing Loop...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Double Tap Heart Animation */}
      <AnimatePresence>
        {showHeartAnim && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{ opacity: 1, scale: 1.5, rotate: 0 }}
            exit={{ opacity: 0, scale: 2.5, y: -100 }}
            className="absolute z-30 pointer-events-none drop-shadow-[0_0_20px_rgba(255,44,85,0.8)]"
          >
            <Heart size={120} fill="#FF2C55" stroke="none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play/Pause Overlay Icon */}
      <AnimatePresence>
        {!isPlaying && isActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 2 }}
            className="absolute z-20 pointer-events-none"
          >
            <Play size={80} fill="white" className="text-white opacity-40" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Interaction Sidebar */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5 z-10">
        {/* Volume Toggle - REMOVED */}

        {/* Author Avatar */}
        <div className="relative mb-2">
          <div className="w-12 h-12 rounded-full border-2 border-secondary overflow-hidden bg-card-dark">
            <img 
              src={video.author.avatar} 
              alt={video.author.username} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {!video.author.isFollowing && (
            <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-bg-dark">
              <Plus size={12} strokeWidth={4} />
            </button>
          )}
        </div>

        {/* Like Button */}
        <div className="flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${liked ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-glass text-white border border-white/10'}`}
          >
            <Heart size={20} fill={liked ? "currentColor" : "none"} strokeWidth={liked ? 0 : 2} />
          </motion.button>
          <span className="text-[10px] font-bold mt-1 text-text-dim uppercase tracking-wider">{likesCount.toLocaleString()}</span>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center">
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              console.log("Opening comments for video:", video.id);
              // Simulate comment action and increment points
              try {
                const userRef = doc(db, 'users', auth.currentUser!.uid);
                await updateDoc(userRef, {
                  points: increment(1)
                });
              } catch (e) {
                console.error("Error updating points for comment:", e);
              }
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-glass backdrop-blur-md text-white border border-white/10"
          >
            <MessageCircle size={20} strokeWidth={2} />
          </button>
          <span className="text-[10px] font-bold mt-1 text-text-dim uppercase tracking-wider">{video.comments.toLocaleString()}</span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              console.log("Sharing video:", video.id);
              if (navigator.share) {
                navigator.share({ title: video.description, url: video.url }).catch((err) => {
                  if (err.name !== 'AbortError') console.error("Share failed:", err);
                });
              }
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-glass backdrop-blur-md text-white border border-white/10"
          >
            <Share2 size={20} strokeWidth={2} />
          </button>
          <span className="text-[10px] font-bold mt-1 text-text-dim uppercase tracking-wider">{video.shares.toLocaleString()}</span>
        </div>

        {/* Duet Button */}
        <div className="flex flex-col items-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDuet?.(video);
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/20 backdrop-blur-md text-primary border border-primary/40 shadow-lg shadow-primary/20"
          >
            <Users size={20} strokeWidth={2} />
          </button>
          <span className="text-[10px] font-bold mt-1 text-primary uppercase tracking-wider">Duet</span>
        </div>

        {/* Rotating Music Disc */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-card-dark to-gray-700 flex items-center justify-center mt-4 border-2 border-white/10"
        >
          <Music2 size={20} className="text-white ml-0.5" />
        </motion.div>
      </div>

      {/* Info Overlay */}
      <div className="absolute left-0 bottom-0 w-full p-6 pb-28 pt-12 z-10 bg-gradient-to-t from-bg-dark/80 to-transparent pointer-events-none">
        <div className="max-w-[80%]">
          <h3 className="font-bold text-lg mb-1">@{video.author.username}</h3>
          <p className="text-sm text-text-dim line-clamp-2 leading-relaxed mb-3">
            {video.description}
          </p>
          <div className="flex items-center gap-2 text-xs bg-glass backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 w-fit">
            <Music2 size={12} className="text-secondary" />
            <div className="overflow-hidden">
              <span className="whitespace-nowrap inline-block font-medium">
                {video.musicName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
