import React from 'react';
import { 
  X, 
  SwitchCamera, 
  SplitSquareHorizontal,
  Settings,
  Zap, 
  Timer, 
  Sparkles, 
  Wand2, 
  Type,
  Palette,
  AlignCenter,
  Music2, 
  Check, 
  ChevronRight, 
  Image as ImageIcon,
  Scissors,
  BrainCircuit,
  Loader2,
  ChevronDown,
  Volume2,
  Crop,
  Layers,
  Search,
  RotateCcw,
  Undo2,
  Redo2,
  Play,
  Combine,
  Plus,
  Save,
  FileStack,
  Filter as FilterIcon,
  Hash,
  MapPin,
  Users,
  Globe,
  Lock,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_SONGS } from '../data';
import { generateCustomEffect } from '../services/geminiService';
import { WaveformVisualizer } from './WaveformVisualizer';
import { db, storage } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../services/firebase';

const transitions = [
  { id: 'fade', label: 'Crossfade', icon: '🌫️' },
  { id: 'zoom', label: 'Deep Zoom', icon: '🔍' },
];

export const CreateView: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [recordedSegments, setRecordedSegments] = React.useState<number[]>([]);
  const [recorded, setRecorded] = React.useState(false);
  const [filter, setFilter] = React.useState('none');
  const [showEffects, setShowEffects] = React.useState(false);
  const [showMusic, setShowMusic] = React.useState(false);
  const [showCrop, setShowCrop] = React.useState(false);
  const [showSoundEffects, setShowSoundEffects] = React.useState(false);
  const [showAdvancedEdit, setShowAdvancedEdit] = React.useState(false);
  const [editTab, setEditTab] = React.useState<'trim' | 'clips' | 'transitions' | 'volume' | 'text'>('trim');
  const [caption, setCaption] = React.useState('');
  const [captionStyle, setCaptionStyle] = React.useState({
    font: 'Inter',
    size: 24,
    color: '#ffffff',
    alignment: 'center' as 'left' | 'center' | 'right',
  });
  const [aspectRatio, setAspectRatio] = React.useState('9:16');
  const [musicTab, setMusicTab] = React.useState<'discover' | 'liked' | 'recent'>('discover');
  const [selectedMusic, setSelectedMusic] = React.useState(MOCK_SONGS[0]);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [recordingMode, setRecordingMode] = React.useState('15s');
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [speed, setSpeed] = React.useState(1.0);
  const [selectedHashtags, setSelectedHashtags] = React.useState<string[]>([]);
  const [editProgress, setEditProgress] = React.useState(0);
  const [trimStart, setTrimStart] = React.useState(0);
  const [trimEnd, setTrimEnd] = React.useState(100);
  const [originalVolume, setOriginalVolume] = React.useState(100);
  const [musicVolume, setMusicVolume] = React.useState(100);
  const [fadeMusicOut, setFadeMusicOut] = React.useState(false);
  const [selectedTransition, setSelectedTransition] = React.useState(transitions[0].id);
  const [splitView, setSplitView] = React.useState(false);
  const [showExportSettings, setShowExportSettings] = React.useState(false);
  const [showTransitions, setShowTransitions] = React.useState(false);
  const [exportQuality, setExportQuality] = React.useState<'Standard' | 'HD' | '4K'>('HD');
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false);
  const [showPostScreen, setShowPostScreen] = React.useState(false);

  // Undo/Redo History
  const [history, setHistory] = React.useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);

  const captureHistory = React.useCallback(() => {
    const currentState = {
      filter,
      speed,
      trimStart,
      trimEnd,
      originalVolume,
      musicVolume,
      caption,
      captionStyle,
    };
    
    // Don't push if it's the same as the current history point
    if (historyIndex >= 0 && JSON.stringify(history[historyIndex]) === JSON.stringify(currentState)) {
      return;
    }

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    
    // Limit history size to 50
    if (newHistory.length > 50) newHistory.shift();
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [filter, speed, trimStart, trimEnd, originalVolume, musicVolume, history, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevState = history[prevIndex];
      setHistoryIndex(prevIndex);
      
      // Apply state without triggering push
      setFilter(prevState.filter);
      setSpeed(prevState.speed);
      setTrimStart(prevState.trimStart);
      setTrimEnd(prevState.trimEnd);
      setOriginalVolume(prevState.originalVolume);
      setMusicVolume(prevState.musicVolume);
      setCaption(prevState.caption);
      setCaptionStyle(prevState.captionStyle);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex];
      setHistoryIndex(nextIndex);
      
      // Apply state
      setFilter(nextState.filter);
      setSpeed(nextState.speed);
      setTrimStart(nextState.trimStart);
      setTrimEnd(nextState.trimEnd);
      setOriginalVolume(nextState.originalVolume);
      setMusicVolume(nextState.musicVolume);
      setCaption(nextState.caption);
      setCaptionStyle(nextState.captionStyle);
    }
  };

  // Initialize history when advanced edit opens
  React.useEffect(() => {
    if (showAdvancedEdit && historyIndex === -1) {
      captureHistory();
    }
  }, [showAdvancedEdit, historyIndex, captureHistory]);
  
  // Auto-capture history when editing states change
  React.useEffect(() => {
    if (showAdvancedEdit) {
      const timer = setTimeout(() => {
        captureHistory();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [filter, speed, trimStart, trimEnd, originalVolume, musicVolume, caption, captionStyle, showAdvancedEdit, captureHistory]);

  const [aiPrompt, setAiPrompt] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showAiGenerator, setShowAiGenerator] = React.useState(false);
  const [showHashtags, setShowHashtags] = React.useState(false);

  const [likedSongs] = React.useState([MOCK_SONGS[1], MOCK_SONGS[3]]);
  const [recentSongs, setRecentSongs] = React.useState<typeof MOCK_SONGS>([]);

  const [effects, setEffects] = React.useState([
    { id: 'sm-neon', label: 'Neon Soul', type: 'SuperMix', icon: '✨' },
    { id: 'sm-aurora', label: 'Aurora', type: 'SuperMix', icon: '🌈' },
    { id: 'fx-zoom', label: 'Mega Zoom', type: 'Visual', icon: '🔍' },
    { id: 'fx-shake', label: 'Vibe Shake', type: 'Motion', icon: '📳' },
    { id: 'fx-disco', label: 'Disco', type: 'Visual', icon: '💃' },
  ]);

  const filters = [
    { id: 'none', label: 'Original', color: 'bg-white' },
    { id: 'astral', label: 'Astral', color: 'bg-purple-600' },
    { id: 'glitch', label: 'Glitch', color: 'bg-secondary' },
    { id: 'vintage', label: 'Vintage', color: 'bg-orange-500' },
  ];

  const aspectRatios = [
    { id: '9:16', label: '9:16', icon: '📱' },
    { id: '1:1', label: '1:1', icon: '⬛' },
    { id: '4:5', label: '4:5', icon: '📸' },
    { id: '16:9', label: '16:9', icon: '📺' },
  ];

  const soundEffects = [
    { id: 'applause', label: 'Applause', icon: '👏' },
    { id: 'laughter', label: 'Laughter', icon: '😂' },
    { id: 'magic', label: 'Magic', icon: '🪄' },
  ];

  const recordingModes = ['10m', '60s', '15s', 'Photo', 'Text'];

  const sideTools = [
    { id: 'flip', icon: SwitchCamera, label: 'Flip', onClick: () => setIsFlipped(!isFlipped) },
    { id: 'speed', icon: Timer, label: 'Speed', onClick: () => setSpeed(prev => prev === 3.0 ? 0.3 : prev + 0.5) },
    { id: 'filters', icon: Sparkles, label: 'Filters' },
    { id: 'enhance', icon: Wand2, label: 'Enhance' },
    { id: 'hashtags', icon: Plus, label: '# Tag', onClick: () => setShowHashtags(true) },
    { id: 'ai', icon: BrainCircuit, label: 'AI Magic', onClick: () => setShowAiGenerator(true), special: true },
    { id: 'timer', icon: Timer, label: 'Timer' },
  ];

  const handleToggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setIsPaused(false);
    } else {
      // If already recording, we pause it
      setIsPaused(true);
      setRecordedSegments(prev => [...prev, 30]); // Add a mock segment
    }
  };

  const handleFinishRecording = () => {
    setIsRecording(false);
    setRecorded(true);
  };

  const handleNext = () => {
    setShowPostScreen(true);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    // Real publishing logic...
    try {
      // (This logic was implemented in handleFileChange but we'll move the core of it if needed, or simply assume they've uploaded)
      // For now we simulate the final step of publishing from the post screen
      setTimeout(() => {
        setIsPublishing(false);
        onCancel();
      }, 3000);
    } catch (error) {
       console.error(error);
       setIsPublishing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && auth.currentUser) {
      setIsUploading(true);
      try {
        const storageRef = ref(storage, `videos/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        
        await addDoc(collection(db, 'videos'), {
          authorId: auth.currentUser.uid,
          url,
          description: caption,
          createdAt: new Date().toISOString(),
          likes: 0
        });

        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setRecorded(true);
        }, 500);
      } catch (error) {
        console.error('Upload failed:', error);
        setIsUploading(false);
      }
    }
  };

  const handleGenerateAiEffect = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const newEffect = await generateCustomEffect(aiPrompt);
      setEffects(prev => [newEffect, ...prev]);
      setAiPrompt('');
      setShowAiGenerator(false);
      setShowEffects(true);
    } catch (error) {
      console.error('AI generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = () => {
    setIsSavingDraft(true);
    setTimeout(() => {
      setIsSavingDraft(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden text-white font-sans">
      {/* Camera Preview */}
      <div className={`absolute inset-0 bg-slate-900 transition-all duration-700 ${isFlipped ? 'scale-x-[-1]' : ''}`}>
        {splitView ? (
          <div className="flex w-full h-full">
            <div className="w-1/2 h-full bg-slate-800 border-r border-white/10 flex items-center justify-center p-4">
              <span className="text-[10px] font-black uppercase text-white/30">Before</span>
            </div>
            <div className="w-1/2 h-full bg-slate-900 flex items-center justify-center p-4">
              <span className="text-[10px] font-black uppercase text-white/30">After</span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
            <SwitchCamera size={100} />
            <p className="mt-4 font-black uppercase tracking-[0.5em] text-xs">Lens Active</p>
          </div>
        )}
        
        {/* Filter Overlays */}
        <AnimatePresence>
          {caption && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center p-10 pointer-events-none z-[55]"
            >
              <div 
                style={{ 
                  color: captionStyle.color,
                  fontSize: `${captionStyle.size}px`,
                  fontFamily: captionStyle.font,
                  textAlign: captionStyle.alignment
                }}
                className="max-w-full break-words drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-bold px-4 py-2"
              >
                {caption}
              </div>
            </motion.div>
          )}
          {filter !== 'none' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 pointer-events-none mix-blend-overlay ${
                filter === 'astral' ? 'bg-purple-600' :
                filter === 'glitch' ? 'bg-cyan-400' : 'bg-orange-500'
              }`}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Recording Progress Bar (Top) */}
      <div className="absolute top-12 left-4 right-4 z-50 h-1.5 bg-white/20 rounded-full overflow-hidden flex gap-0.5">
        {recordedSegments.map((seg, i) => (
          <div key={i} style={{ width: `${seg}%` }} className="h-full bg-[#FF2C55] border-r border-black/20" />
        ))}
        {isRecording && !isPaused && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: recordingMode === '15s' ? 15 : 60, ease: "linear" }}
            className="h-full bg-[#FF2C55] shadow-[0_0_10px_#FF2C55]"
          />
        )}
      </div>

      {/* Top Header */}
      {!isRecording && (
        <div className="relative z-50 flex items-center justify-between px-4 pt-16">
          <button onClick={onCancel} className="p-1">
            <X size={30} />
          </button>
          
          <button 
            onClick={() => setShowMusic(true)}
            className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/10"
          >
            <Music2 size={16} />
            <span className="text-[11px] font-bold uppercase tracking-wider truncate max-w-[120px]">
              {selectedMusic.title}
            </span>
          </button>

          <button className="p-1">
            <Zap size={24} />
          </button>
        </div>
      )}

      {/* Side Tools Sidebar */}
      <AnimatePresence>
        {!isRecording && !recorded && (
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            className="absolute right-4 top-[20%] flex flex-col gap-6 z-50"
          >
            {sideTools.map(tool => (
              <button 
                key={tool.id} 
                onClick={tool.onClick}
                className="flex flex-col items-center gap-1 group"
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${tool.special ? 'bg-primary/20 text-primary border border-primary/40' : 'hover:bg-white/10'}`}>
                  <tool.icon size={28} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold tracking-tight shadow-black drop-shadow-md">{tool.label}</span>
              </button>
            ))}
            <button className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 flex items-center justify-center rounded-full">
                <ChevronDown size={28} />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Interface */}
      <div className="mt-auto relative z-50 pointer-events-none">
        
        {/* Mode Selector */}
        {!isRecording && !recorded && (
          <div className="flex justify-center mb-8 pointer-events-auto overflow-x-hidden">
            <div className="flex gap-8 px-20">
              {recordingModes.map(mode => (
                <button
                  key={mode}
                  onClick={() => setRecordingMode(mode)}
                  className={`text-xs font-black uppercase tracking-widest transition-all ${recordingMode === mode ? 'text-white' : 'text-white/40'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Row */}
        <div className="flex items-center justify-between px-10 pb-16 pointer-events-auto">
          {/* Effects Button */}
          {!recorded ? (
            <button 
              onClick={() => setShowEffects(true)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/20 group-hover:border-white transition-all">
                <img src="https://picsum.photos/seed/tiktok_fx/40/40" className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-bold">Effects</span>
            </button>
          ) : (
            <button 
              onClick={() => { setRecorded(false); setShowAdvancedEdit(false); }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <RotateCcw size={20} />
              </div>
              <span className="text-[10px] font-bold">Discard</span>
            </button>
          )}

          {/* Record Button */}
          {!recorded && (
            <div className="flex items-center gap-8 translate-x-12">
              <button 
                onClick={handleToggleRecording}
                className={`relative flex items-center justify-center transition-all duration-300 ${isRecording && !isPaused ? 'scale-125' : ''}`}
              >
                <div className={`w-20 h-20 rounded-full border-4 ${isRecording && !isPaused ? 'border-white/40' : 'border-white'} flex items-center justify-center`}>
                  <motion.div 
                    animate={{ 
                      scale: isRecording && !isPaused ? 0.6 : 0.9,
                      borderRadius: isRecording && !isPaused ? '8px' : '50%'
                    }}
                    className="w-full h-full bg-[#FF2C55]"
                  />
                </div>
              </button>

              {(isRecording || recordedSegments.length > 0) && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleFinishRecording}
                  className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-black shadow-lg"
                >
                  <Check size={28} strokeWidth={3} />
                </motion.button>
              )}
            </div>
          )}

          {/* Upload / Next Button */}
          {!recorded ? (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/20 group-hover:border-white transition-all bg-slate-800 flex items-center justify-center">
                <ImageIcon size={24} className="text-white/40" />
              </div>
              <span className="text-[10px] font-bold">Upload</span>
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-14 h-14 rounded-full bg-[#FF2C55] flex items-center justify-center shadow-lg shadow-[#FF2C55]/20">
                <ChevronRight size={30} strokeWidth={3} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest mt-1">Next</span>
            </button>
          )}
        </div>
      </div>

      {/* Editing Sidebar (Right side after recording) */}
      <AnimatePresence>
        {recorded && !isPublishing && (
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute right-4 top-[20%] flex flex-col gap-6 z-50"
          >
            <button onClick={() => setShowAdvancedEdit(true)} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                <Scissors size={24} />
              </div>
              <span className="text-[10px] font-bold">Edit</span>
            </button>
            <button onClick={() => setShowCrop(true)} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                <Crop size={24} />
              </div>
              <span className="text-[10px] font-bold">Crop</span>
            </button>
            <button onClick={() => setShowSoundEffects(true)} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                <Volume2 size={24} />
              </div>
              <span className="text-[10px] font-bold">Volume</span>
            </button>
            <button onClick={() => setShowTransitions(true)} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                <Combine size={24} />
              </div>
              <span className="text-[10px] font-bold">Trans</span>
            </button>
            <button onClick={() => setSplitView(!splitView)} className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md border border-white/10 ${splitView ? 'bg-primary' : 'bg-black/40'}`}>
                <SplitSquareHorizontal size={24} />
              </div>
              <span className="text-[10px] font-bold">{splitView ? 'Exit' : 'Compare'}</span>
            </button>
            <button onClick={() => setShowExportSettings(true)} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                <Settings size={24} />
              </div>
              <span className="text-[10px] font-bold">Export</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inputs */}
      <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileChange} />

      {/* Post Screen Panel */}
      <AnimatePresence>
        {showPostScreen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute inset-0 bg-bg-dark z-[700] flex flex-col pt-16"
          >
            <div className="px-6 flex items-center justify-between mb-8">
              <button 
                onClick={() => setShowPostScreen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5"
              >
                <X size={20} />
              </button>
              <h2 className="text-sm font-black uppercase tracking-widest italic">New Post</h2>
              <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-20 space-y-8">
              {/* Preview & Caption Section */}
              <div className="flex gap-4">
                <div className="w-24 h-36 rounded-2xl bg-slate-800 overflow-hidden border border-white/10 shrink-0">
                  <div className="w-full h-full flex items-center justify-center relative">
                    <img 
                      src="https://picsum.photos/seed/thumb/200/300" 
                      className="w-full h-full object-cover opacity-50" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play size={20} className="text-white/40" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <textarea 
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Describe your loop..."
                    className="w-full bg-transparent border-none text-sm resize-none h-24 focus:ring-0 p-0"
                  />
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedHashtags.map(tag => (
                      <span key={tag} className="text-primary text-[10px] font-bold">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tools Divider */}
              <div className="h-px bg-white/5" />

              {/* Options List */}
              <div className="space-y-4">
                <button 
                  onClick={() => setShowHashtags(true)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-primary/10 rounded-lg"><Hash size={18} className="text-primary" /></span>
                    <span className="text-xs font-bold">Hashtags</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40">{selectedHashtags.length || 'None'}</span>
                    <ChevronRight size={16} className="text-white/20" />
                  </div>
                </button>

                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-blue-500/10 rounded-lg"><MapPin size={18} className="text-blue-500" /></span>
                    <span className="text-xs font-bold">Location</span>
                  </div>
                  <ChevronRight size={16} className="text-white/20" />
                </button>

                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-yellow-500/10 rounded-lg"><Users size={18} className="text-yellow-500" /></span>
                    <span className="text-xs font-bold">Tag Creators</span>
                  </div>
                  <ChevronRight size={16} className="text-white/20" />
                </button>
              </div>

              {/* Privacy Setting */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2">Privacy & Distribution</h3>
                <div className="p-2 bg-white/5 rounded-[24px]">
                  {[
                    { id: 'public', label: 'Everyone', icon: Globe },
                    { id: 'friends', label: 'Friends', icon: Users },
                    { id: 'private', label: 'Only Me', icon: Lock },
                  ].map((p) => (
                    <button 
                      key={p.id}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <p.icon size={16} className="text-white/60" />
                        <span className="text-xs font-medium">{p.label}</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${p.id === 'public' ? 'border-primary' : 'border-white/20'}`}>
                        {p.id === 'public' && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Switch Options */}
              <div className="space-y-2">
                 {[
                   { id: 'comments', label: 'Allow Comments', icon: MessageCircle },
                   { id: 'duet', label: 'Allow Duet', icon: Combine },
                   { id: 'stitch', label: 'Allow Stitch', icon: Scissors },
                 ].map((s) => (
                   <div key={s.id} className="flex items-center justify-between px-2 py-2">
                     <div className="flex items-center gap-3">
                       <s.icon size={16} className="text-white/40" />
                       <span className="text-xs font-medium">{s.label}</span>
                     </div>
                     <button className="w-10 h-5 bg-primary rounded-full relative">
                        <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full" />
                     </button>
                   </div>
                 ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 bg-bg-dark border-t border-white/5 flex gap-4">
              <button 
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="flex-1 py-4 bg-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10"
              >
                {isSavingDraft ? 'Saving...' : 'Draft'}
              </button>
              <button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
              >
                {isPublishing ? <Loader2 className="animate-spin" size={16} /> : 'Post to Loop'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays */}
      <AnimatePresence>
        {(isPublishing || isUploading) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 z-[500] flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="relative w-32 h-32 mb-8 items-center justify-center flex">
               <svg className="w-full h-full absolute transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                  <motion.circle
                    cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="4" fill="transparent"
                    strokeDasharray="364.4"
                    animate={{ strokeDashoffset: isPublishing ? 0 : 364.4 * (1 - uploadProgress / 100) }}
                    className="text-[#FF2C55]"
                  />
               </svg>
               {isPublishing ? <Loader2 size={48} className="animate-spin" /> : <span className="text-3xl font-black">{Math.round(uploadProgress)}%</span>}
            </div>
            <h2 className="text-xl font-black uppercase tracking-widest italic">{isPublishing ? 'Publishing Loop' : 'Syncing Loop'}</h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panels */}
      {/* Hashtag Panel */}
      <AnimatePresence>
        {showHashtags && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHashtags(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md z-[600]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute bottom-0 left-0 right-0 h-[50vh] bg-bg-dark border-t border-white/10 z-[610] rounded-t-[32px] overflow-hidden flex flex-col p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-black uppercase tracking-widest text-sm">Trending Hashtags</h2>
                <button onClick={() => setShowHashtags(false)}><X /></button>
              </div>
              <div className="flex flex-wrap gap-2 overflow-y-auto no-scrollbar pb-20">
                {['trending', 'loopviral', 'summer2024', 'goldenhour', 'lifehacks', 'recipe', 'tech', 'programmer', 'dance', 'vibe'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (selectedHashtags.includes(tag)) {
                        setSelectedHashtags(prev => prev.filter(t => t !== tag));
                      } else {
                        setSelectedHashtags(prev => [...prev, tag]);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedHashtags.includes(tag) ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-white/60'}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setShowHashtags(false)}
                className="absolute bottom-8 left-6 right-6 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-white/10"
              >
                Done ({selectedHashtags.length})
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Generator Panel */}
      <AnimatePresence>
        {showAiGenerator && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAiGenerator(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md z-[600]" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-bg-dark border border-white/10 rounded-[32px] p-8 z-[610] shadow-2xl text-center">
              <BrainCircuit size={48} className="text-primary mx-auto mb-6" />
              <h2 className="text-xl font-black uppercase mb-2">AI Visual engine</h2>
              <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. 'Cyberpunk glitch rain'" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm mb-6 h-32 resize-none" />
              <div className="flex gap-4">
                <button onClick={() => setShowAiGenerator(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Cancel</button>
                <button onClick={handleGenerateAiEffect} disabled={isGenerating || !aiPrompt.trim()} className="flex-1 py-4 bg-primary rounded-2xl font-bold uppercase tracking-widest text-[10px] disabled:opacity-50">{isGenerating ? 'Generative...' : 'Simulate'}</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Transition Panel */}
      <AnimatePresence>
        {showTransitions && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTransitions(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md z-[600]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute bottom-0 left-0 right-0 h-[40vh] bg-bg-dark border-t border-white/10 z-[610] rounded-t-[32px] overflow-hidden flex flex-col p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-black uppercase tracking-widest text-sm">Select Transition</h2>
                <button onClick={() => setShowTransitions(false)}><X /></button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {transitions.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTransition(t.id)}
                    className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${selectedTransition === t.id ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10'}`}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <span className="font-black text-xs">{t.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Export Settings Panel */}
      <AnimatePresence>
        {showExportSettings && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExportSettings(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md z-[600]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute bottom-0 left-0 right-0 h-[40vh] bg-bg-dark border-t border-white/10 z-[610] rounded-t-[32px] overflow-hidden flex flex-col p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-black uppercase tracking-widest text-sm">Export Quality</h2>
                <button onClick={() => setShowExportSettings(false)}><X /></button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {(['Standard', 'HD', '4K'] as const).map(q => (
                  <button
                    key={q}
                    onClick={() => setExportQuality(q)}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${exportQuality === q ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10'}`}
                  >
                    <span className="font-black text-xs">{q}</span>
                    <span className="text-[9px] text-white/50">{q === 'Standard' ? '480p' : q === 'HD' ? '1080p' : '2160p'}</span>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setShowExportSettings(false)}
                className="py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-white/10"
              >
                Apply
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Music Panel */}
      <AnimatePresence>
        {showMusic && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMusic(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[600]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute bottom-0 left-0 right-0 h-[80vh] bg-bg-dark border-t border-white/10 z-[610] rounded-t-[32px] overflow-hidden flex flex-col">
              <div className="p-6 flex items-center justify-between">
                <h2 className="font-black uppercase tracking-widest">Select Music</h2>
                <button onClick={() => setShowMusic(false)}><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {MOCK_SONGS.map(song => (
                  <button key={song.id} onClick={() => { setSelectedMusic(song); setShowMusic(false); }} className={`flex items-center gap-4 p-3 rounded-2xl w-full text-left border ${selectedMusic.id === song.id ? 'border-primary bg-primary/10' : 'border-transparent bg-white/5'}`}>
                    <img src={song.cover} className="w-14 h-14 rounded-xl" />
                    <div className="flex-1">
                      <h3 className="font-bold text-sm tracking-tight">{song.title}</h3>
                      <p className="text-[10px] text-text-dim uppercase tracking-widest font-black">{song.artist}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Advanced Edit Panel */}
      <AnimatePresence>
        {showAdvancedEdit && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdvancedEdit(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[600]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute bottom-0 left-0 right-0 h-[60vh] bg-bg-dark border-t border-white/10 z-[610] rounded-t-[32px] overflow-hidden flex flex-col">
              <div className="p-6 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-4">
                  <h2 className="font-black uppercase tracking-widest text-sm">Advanced Edit</h2>
                  <div className="h-4 w-px bg-white/10 mx-2" />
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleUndo} 
                      disabled={historyIndex <= 0}
                      className={`p-1.5 rounded-lg transition-colors ${historyIndex > 0 ? 'text-white hover:bg-white/10' : 'text-white/10 cursor-not-allowed'}`}
                    >
                      <Undo2 size={18} />
                    </button>
                    <button 
                      onClick={handleRedo} 
                      disabled={historyIndex >= history.length - 1}
                      className={`p-1.5 rounded-lg transition-colors ${historyIndex < history.length - 1 ? 'text-white hover:bg-white/10' : 'text-white/10 cursor-not-allowed'}`}
                    >
                      <Redo2 size={18} />
                    </button>
                  </div>
                </div>
                <button onClick={() => setShowAdvancedEdit(false)} className="bg-secondary p-2 rounded-full text-black"><Check size={20} /></button>
              </div>
              
              <div className="flex-1 p-6 flex flex-col gap-8">
                {/* Audio Waveform Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Music2 size={16} className="text-secondary" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Audio Track</span>
                    </div>
                    <span className="text-[10px] font-mono text-secondary">00:0{Math.floor(editProgress / 10)}.{editProgress % 10} / 00:15.0</span>
                  </div>
                  
                  <div className="relative group p-2">
                    <WaveformVisualizer progress={editProgress} />
                    
                    {/* Interaction Overlay for scrubbing */}
                    <div 
                      className="absolute inset-0 cursor-ew-resize z-10"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        setEditProgress(Math.round((x / rect.width) * 100));
                      }}
                    />
                  </div>
                </div>

                {/* Trimming Section */}
                {editTab === 'trim' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Scissors size={16} className="text-primary" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Trim Clip</span>
                         <button 
                           onClick={() => { setTrimStart(0); setTrimEnd(100); }}
                           className="text-[8px] font-bold text-primary hover:underline ml-2"
                         >
                           Reset
                         </button>
                      </div>
                      <div className="flex gap-3 text-[10px] font-mono">
                        <span className="text-white/60">Start: 0:{trimStart.toString().padStart(2, '0')}</span>
                        <span className="text-white/60">End: 0:{trimEnd.toString().padStart(2, '0')}</span>
                      </div>
                    </div>

                    <div className="relative h-16 bg-white/5 rounded-xl border border-white/5 overflow-hidden flex items-center px-2">
                      {/* Thumbnail Strip Mock */}
                      <div className="absolute inset-0 flex gap-0.5 opacity-30 select-none">
                         {[...Array(8)].map((_, i) => (
                           <div key={i} className="flex-1 bg-gradient-to-br from-white/20 to-transparent" />
                         ))}
                      </div>

                      {/* Trim Range Overlay */}
                      <div 
                        className="absolute top-0 bottom-0 bg-primary/20 border-x-2 border-primary z-10"
                        style={{ 
                          left: `${trimStart}%`, 
                          right: `${100 - trimEnd}%` 
                        }}
                      >
                        {/* Trim Handles */}
                        <div className="absolute top-0 bottom-0 -left-1 w-2 bg-primary cursor-ew-resize rounded-l-sm flex items-center justify-center">
                          <div className="w-0.5 h-4 bg-white/40 rounded-full" />
                        </div>
                        <div className="absolute top-0 bottom-0 -right-1 w-2 bg-primary cursor-ew-resize rounded-r-sm flex items-center justify-center">
                          <div className="w-0.5 h-4 bg-white/40 rounded-full" />
                        </div>
                      </div>

                      {/* Interaction inputs */}
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={trimStart} 
                        onChange={(e) => setTrimStart(Math.min(parseInt(e.target.value), trimEnd - 5))}
                        className="absolute inset-0 opacity-0 z-20 cursor-pointer"
                      />
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={trimEnd} 
                        onChange={(e) => setTrimEnd(Math.max(parseInt(e.target.value), trimStart + 5))}
                        className="absolute inset-0 opacity-0 z-20 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Volume Mixing Section */}
                {editTab === 'volume' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2">
                          <Volume2 size={16} className="text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Sound Mixer</span>
                       </div>
                    </div>

                    {/* Original Audio Slider */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-white">Original Audio</span>
                        <span className="text-primary">{originalVolume}%</span>
                      </div>
                      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={originalVolume}
                          onChange={(e) => setOriginalVolume(parseInt(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                        />
                        <div className="h-full bg-primary" style={{ width: `${originalVolume / 2}%` }} />
                      </div>
                    </div>

                    {/* Music Volume Slider */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-white">Music Volume</span>
                        <span className="text-primary">{musicVolume}%</span>
                      </div>
                      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={musicVolume}
                          onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                        />
                        <div className="h-full bg-secondary" style={{ width: `${musicVolume}%` }} />
                      </div>
                    </div>

                    {/* Additional Volume Enhancements */}
                    <div className="flex items-center justify-between mt-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest">Auto Normalize</label>
                      <button 
                        onClick={() => {}} 
                        className={`w-10 h-5 rounded-full relative transition-colors ${false ? 'bg-primary' : 'bg-white/10'}`}
                      >
                         <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${false ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest">Fade Out Music</label>
                      <button 
                        onClick={() => setFadeMusicOut(!fadeMusicOut)} 
                        className={`w-10 h-5 rounded-full relative transition-colors ${fadeMusicOut ? 'bg-primary' : 'bg-white/10'}`}
                      >
                         <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${fadeMusicOut ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Text Caption Section */}
                {editTab === 'text' && (
                  <div className="space-y-6">
                    {/* ...existing text stuff... */}
                  </div>
                )}

                {/* Transitions Section */}
                {editTab === 'transitions' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2">
                          <Layers size={16} className="text-secondary" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Apply Transition</span>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {transitions.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTransition(t.id)}
                          className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${selectedTransition === t.id ? 'bg-secondary/20 border-secondary' : 'bg-white/5 border-white/5'}`}
                        >
                          <span className="text-2xl">{t.icon}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline Tracks Mock */}
                <div className="flex-1 space-y-3 opacity-80">
                   <div className="h-10 w-full bg-white/5 rounded-xl border border-white/5 flex items-center px-4 gap-4">
                      <ImageIcon size={14} className="text-white/40" />
                      <div className="flex-1 h-3 bg-primary/20 rounded-full overflow-hidden">
                         <div className="h-full bg-primary/40 w-full" />
                      </div>
                   </div>
                   <div className="h-10 w-full bg-white/5 rounded-xl border border-white/5 flex items-center px-4 gap-4">
                      <Scissors size={14} className="text-white/40" />
                      <div className="flex-1 h-3 bg-secondary/20 rounded-full overflow-hidden">
                         <div className="h-full bg-secondary/40 w-[60%] ml-[20%]" />
                      </div>
                   </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-text-dim px-2">Speed</span>
                    <div className="flex bg-white/5 rounded-xl border border-white/5 p-1 gap-1">
                       {[0.5, 1, 1.5, 2].map(s => (
                         <button 
                           key={s}
                           onClick={() => setSpeed(s)}
                           className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${speed === s ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/5'}`}
                         >
                           {s}x
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-text-dim px-2">Filters</span>
                    <div className="bg-white/5 rounded-xl border border-white/5 p-1 flex gap-2 overflow-x-auto no-scrollbar">
                       {filters.map(f => (
                         <button 
                           key={f.id}
                           onClick={() => setFilter(f.id)}
                           className={`min-w-[40px] h-8 rounded-lg flex items-center justify-center transition-all border ${filter === f.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
                         >
                           <div className={`w-6 h-6 rounded-md ${f.color}`} />
                         </button>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-auto">
                  <button 
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft}
                    className="flex-1 py-4 bg-white/5 rounded-2xl flex flex-col items-center gap-1 group relative overflow-hidden"
                  >
                     <motion.div
                       animate={isSavingDraft ? { y: [-20, 0], opacity: [0, 1] } : {}}
                       className="flex flex-col items-center gap-1"
                     >
                       {isSavingDraft ? <Loader2 size={20} className="animate-spin text-primary" /> : <Save size={20} className="text-text-dim group-hover:text-white transition-colors" />}
                       <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">{isSavingDraft ? 'Syncing...' : 'Save Draft'}</span>
                     </motion.div>
                  </button>
                  <button className="flex-1 py-4 bg-white/5 rounded-2xl flex flex-col items-center gap-1">
                     <FileStack size={20} className="text-text-dim" />
                     <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Drafts</span>
                  </button>
                  <button className="flex-1 py-4 bg-primary/10 border border-primary/20 rounded-2xl flex flex-col items-center gap-1">
                     <Zap size={20} className="text-primary" />
                     <span className="text-[8px] font-bold uppercase tracking-widest text-primary/60">AI Mastering</span>
                  </button>
                </div>
              </div>

              {/* Save Success Toast */}
              <AnimatePresence>
                {showSaveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[700] bg-secondary text-black px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl"
                  >
                    <Check size={18} strokeWidth={4} />
                    <span className="text-xs font-black uppercase tracking-widest">Draft Saved</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-6 pt-0 border-t border-white/5 bg-black/20 flex items-center justify-between overflow-x-auto no-scrollbar">
                 <div className="flex gap-6 min-w-max">
                    <button onClick={() => setEditTab('trim')} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${editTab === 'trim' ? 'text-white underline decoration-primary underline-offset-8' : 'text-white/30'}`}>Trim</button>
                    <button onClick={() => setEditTab('volume')} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${editTab === 'volume' ? 'text-white underline decoration-primary underline-offset-8' : 'text-white/30'}`}>Volume</button>
                    <button onClick={() => setEditTab('text')} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${editTab === 'text' ? 'text-white underline decoration-primary underline-offset-8' : 'text-white/30'}`}>Text</button>
                    <button onClick={() => setEditTab('clips')} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${editTab === 'clips' ? 'text-white underline decoration-primary underline-offset-8' : 'text-white/30'}`}>Clips</button>
                    <button onClick={() => setEditTab('transitions')} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${editTab === 'transitions' ? 'text-white underline decoration-primary underline-offset-8' : 'text-white/30'}`}>Transitions</button>
                 </div>
                 <button className="p-2 text-white/60 ml-4"><Play size={20} fill="currentColor" /></button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Effects Panel */}
      <AnimatePresence>
        {showEffects && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEffects(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[600]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute bottom-0 left-0 right-0 bg-bg-dark/95 backdrop-blur-2xl rounded-t-[32px] border-t border-white/10 z-[610] p-6 pb-20">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-black uppercase tracking-widest text-sm">Effects</h3>
                 <button onClick={() => setShowEffects(false)}><X /></button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {effects.map(fx => (
                  <button key={fx.id} className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">{fx.icon}</div>
                    <span className="text-[10px] font-bold text-center leading-tight">{fx.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
