import React from 'react';
import { Home, Compass, Plus, MessageSquare, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './context/AuthContext';
import { SignIn } from './components/SignIn';
import { VideoFeed } from './components/VideoFeed';
import { DiscoveryGrid } from './components/DiscoveryGrid';
import { Profile } from './components/Profile';
import { CreateView } from './components/CreateView';
import { DuetRecorder } from './components/DuetRecorder';
import { BottomNav } from './components/BottomNav';
import { MOCK_VIDEOS } from './data';
import { Video } from './types';

export default function App() {
  const user = useAuth();
  const [activeTab, setActiveTab] = React.useState('home');
  const [homeFeed, setHomeFeed] = React.useState<'following' | 'foryou'>('foryou');
  const [showCreate, setShowCreate] = React.useState(false);
  const [duetVideo, setDuetVideo] = React.useState<Video | null>(null);
  const [viewingVideoId, setViewingVideoId] = React.useState<string | null>(null);
  const [isMuted, setIsMuted] = React.useState(true); // Start muted for autoplay compliance
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500); // Splash screen duration
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab: string) => {
    if (tab === 'create') {
      setShowCreate(true);
    } else {
      setActiveTab(tab);
      setViewingVideoId(null); // Clear video view when switching tabs
    }
  };

  const toggleMute = () => setIsMuted(prev => !prev);

  const currentVideos = MOCK_VIDEOS; // Could be filtered by tab in the future

  if (!user) {
    return <SignIn />;
  }

  if (showSplash) {
    return (
      <AnimatePresence>
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.3, ease: 'easeIn' }}
          className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <div className="w-20 h-20 rounded-[24px] bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-4xl font-black">
              L
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="relative h-[100dvh] w-full bg-black max-w-md mx-auto overflow-hidden shadow-2xl"
    >
        {/* Main Content Area */}
        <div className="h-full w-full">
            <AnimatePresence mode="wait">
          {viewingVideoId ? (
            <motion.div
              key="video-view"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-[60] bg-black"
            >
              <div className="absolute top-10 left-4 z-[70]">
                <button 
                  onClick={() => setViewingVideoId(null)}
                  className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20"
                >
                  <Home size={20} />
                </button>
              </div>
              <VideoFeed 
                initialVideoId={viewingVideoId} 
                isMuted={isMuted}
                onToggleMute={toggleMute}
                onDuet={setDuetVideo}
              />
            </motion.div>
          ) : (
            <>
              {activeTab === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full relative"
                >
                  {/* Top Feed Navigation */}
                  <div className="absolute top-10 left-0 right-0 z-50 flex items-center justify-center gap-6">
                    <button 
                      onClick={() => setHomeFeed('following')}
                      className={`text-sm font-black uppercase tracking-widest transition-all ${homeFeed === 'following' ? 'text-white scale-110' : 'text-white/40'}`}
                    >
                      Following
                      {homeFeed === 'following' && (
                        <motion.div layoutId="activeFeed" className="h-0.5 bg-white w-full mt-1" />
                      )}
                    </button>
                    <button 
                      onClick={() => setHomeFeed('foryou')}
                      className={`text-sm font-black uppercase tracking-widest transition-all ${homeFeed === 'foryou' ? 'text-white scale-110' : 'text-white/40'}`}
                    >
                      For You
                      {homeFeed === 'foryou' && (
                        <motion.div layoutId="activeFeed" className="h-0.5 bg-white w-full mt-1" />
                      )}
                    </button>
                  </div>

                  <VideoFeed 
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                    onDuet={setDuetVideo}
                  />
                </motion.div>
              )}

              {activeTab === 'discover' && (
                <motion.div
                  key="discover"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full w-full"
                >
                  <DiscoveryGrid onVideoClick={setViewingVideoId} />
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="h-full w-full"
                >
                  <Profile onVideoClick={setViewingVideoId} />
                </motion.div>
              )}

          {activeTab === 'inbox' && (
            <motion.div
              key="inbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full bg-bg-dark pt-16 flex flex-col"
            >
              <div className="px-6 py-4 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black uppercase tracking-widest italic">Inbox</h2>
                  <button className="text-primary text-xs font-black uppercase tracking-tighter">Messages</button>
                </div>
                
                {/* Activity Filters */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {['All activity', 'Likes', 'Comments', 'Mentions', 'Followers'].map((filter, i) => (
                    <button 
                      key={filter} 
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-glass border border-white/10 text-text-dim'}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Notifications List */}
                <div className="flex flex-col gap-6 mt-4">
                  {[
                    { user: 'dance_queen', action: 'liked your video', time: '2h', img: MOCK_VIDEOS[0].thumbnail },
                    { user: 'chef_vibe', action: 'started following you', time: '5h', img: null },
                    { user: 'nature_explorer', action: 'commented: "Amazing view!"', time: '1d', img: MOCK_VIDEOS[1].thumbnail },
                  ].map((notif, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-card-dark border border-white/10 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.user}`} alt="user" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm">
                            <span className="font-bold">@{notif.user}</span>{' '}
                            <span className="text-white/60">{notif.action}</span>
                          </p>
                          <span className="text-[10px] text-text-dim uppercase font-bold mt-0.5">{notif.time}</span>
                        </div>
                      </div>
                      {notif.img ? (
                        <div className="w-12 h-16 rounded-md overflow-hidden border border-white/10">
                          <img src={notif.img} className="w-full h-full object-cover" alt="prev" />
                        </div>
                      ) : (
                        <button className="bg-primary px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20">Follow</button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-12 flex flex-col items-center gap-4 py-10 opacity-30">
                  <MessageSquare size={48} className="text-text-dim" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]">End of notifications</p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Full-screen Create View */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ y: '100dvh' }}
            animate={{ y: 0 }}
            exit={{ y: '100dvh' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100]"
          >
            <CreateView onCancel={() => setShowCreate(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duet Recorder View */}
      <AnimatePresence>
        {duetVideo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[110]"
          >
            <DuetRecorder 
              originalVideo={duetVideo} 
              onClose={() => setDuetVideo(null)}
              onFinish={(blob) => {
                console.log('Duet finished with blob:', blob);
                setDuetVideo(null);
                // In a real app, we'd upload here
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
