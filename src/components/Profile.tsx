import React, { useEffect, useState } from 'react';
import { Settings, Grid, Heart, Lock, Bookmark, MoreHorizontal } from 'lucide-react';
import { MOCK_VIDEOS } from '../data';
import { motion } from 'motion/react';
import { db, auth } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface ProfileProps {
  onVideoClick: (id: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onVideoClick }) => {
  const [activeTab, setActiveTab] = React.useState('videos');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setUserProfile(doc.data());
      }
    });
    return unsubscribe;
  }, []);

  const getVideosByTab = () => {
    switch (activeTab) {
      case 'videos': return MOCK_VIDEOS;
      case 'liked': return MOCK_VIDEOS.slice(0, 2); // Mocking liked videos
      case 'locked': return [];
      default: return [];
    }
  };

  const videos = getVideosByTab();

  return (
    <div className="h-full bg-bg-dark overflow-y-auto no-scrollbar relative">
      {/* Header - Changed to absolute so it scrolls with or stays visible correctly based on container */}
      <div className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 pt-12 pb-4 bg-bg-dark/95 backdrop-blur-md border-b border-white/5">
        <div className="w-10 h-10" />
        <h2 className="font-bold text-sm uppercase tracking-[0.2em]">@{auth.currentUser?.displayName || 'Profile'}</h2>
        <div className="flex items-center gap-2">
           <button className="p-2 hover:bg-glass rounded-full transition-colors border border-transparent hover:border-white/10 text-white">
             <Settings size={20} />
           </button>
           <button className="p-2 hover:bg-glass rounded-full transition-colors border border-transparent hover:border-white/10 text-white">
             <MoreHorizontal size={20} />
           </button>
        </div>
      </div>

      <div className="pb-32">
        {/* Profile Info */}
        <div className="flex flex-col items-center px-6 mb-8">
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-primary via-purple-500 to-secondary shadow-2xl shadow-primary/20">
              <div className="w-full h-full rounded-full border-4 border-bg-dark overflow-hidden bg-card-dark">
                <img 
                  src={auth.currentUser?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} 
                  alt="avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-black mb-1">@{auth.currentUser?.displayName || 'User'}</h1>
          <p className="font-bold text-sm text-white/50 mb-4">{auth.currentUser?.email}</p>
          <p className="text-sm text-text-dim mb-8 text-center max-w-[280px] leading-relaxed">
            Welcome back! Ready to create?
          </p>

          {/* Stats */}
          <div className="flex items-center gap-10 mb-8 w-full justify-center">
            <div className="flex flex-col items-center">
              <span className="font-black text-xl leading-none">0</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim mt-2">Following</span>
            </div>
            <div className="flex flex-col items-center border-x border-white/5 px-10">
              <span className="font-black text-xl leading-none">0</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim mt-2">Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-black text-xl leading-none">{userProfile?.points || 0}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim mt-2">Points</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full max-w-[340px]">
            <button className="flex-1 bg-white text-black font-black uppercase tracking-tighter text-sm h-12 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5">
              Edit Profile
            </button>
            <button className="w-12 h-12 bg-card-dark hover:bg-gray-800 flex items-center justify-center rounded-xl transition-colors border border-white/10 text-white">
              <Bookmark size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-white/5 bg-bg-dark/50 backdrop-blur-sm sticky top-16 z-20">
          <button 
            onClick={() => setActiveTab('videos')}
            className={`flex-1 h-14 flex items-center justify-center transition-all relative ${activeTab === 'videos' ? 'text-primary' : 'text-text-dim'}`}
          >
            <Grid size={22} className={activeTab === 'videos' ? 'drop-shadow-[0_0_8px_rgba(255,44,85,0.4)]' : ''} />
            {activeTab === 'videos' && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button 
            onClick={() => setActiveTab('liked')}
            className={`flex-1 h-14 flex items-center justify-center transition-all relative ${activeTab === 'liked' ? 'text-primary' : 'text-text-dim'}`}
          >
            <Heart size={22} className={activeTab === 'liked' ? 'drop-shadow-[0_0_8px_rgba(255,44,85,0.4)]' : ''} />
            {activeTab === 'liked' && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button 
            onClick={() => setActiveTab('locked')}
            className={`flex-1 h-14 flex items-center justify-center transition-all relative ${activeTab === 'locked' ? 'text-primary' : 'text-text-dim'}`}
          >
            <Lock size={22} className={activeTab === 'locked' ? 'drop-shadow-[0_0_8_rgba(255,44,85,0.4)]' : ''} />
            {activeTab === 'locked' && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {videos.length > 0 ? (
            videos.map((video, i) => (
              <div 
                key={video.id} 
                onClick={() => onVideoClick(video.id)}
                className="aspect-[3/4] relative bg-card-dark overflow-hidden cursor-pointer group"
              >
                <img 
                  src={video.thumbnail} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt="user video"
                  referrerPolicy="no-referrer"
                />
                {activeTab === 'videos' && i === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-[9px] font-black tracking-widest px-2 py-0.5 rounded shadow-lg uppercase">
                    Pinned
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 pointer-events-none">
                  <div className="flex items-center gap-1 text-[10px] font-bold">
                     <Heart size={10} fill="white" />
                     {(video.likes / 1000).toFixed(1)}k
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-20 flex flex-col items-center justify-center text-text-dim space-y-4">
              <div className="w-16 h-16 bg-card-dark rounded-full flex items-center justify-center">
                {activeTab === 'locked' ? <Lock size={32} /> : <Grid size={32} />}
              </div>
              <div className="text-center">
                <p className="font-bold uppercase tracking-widest text-xs">No entries yet</p>
                <p className="text-[10px] mt-1 opacity-60">Videos you {activeTab} will appear here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
