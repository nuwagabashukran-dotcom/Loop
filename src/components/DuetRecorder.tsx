import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Zap, Music2, Check, RotateCcw, Play, Pause } from 'lucide-react';
import { Video } from '../types';

interface DuetRecorderProps {
  originalVideo: Video;
  onClose: () => void;
  onFinish: (blob: Blob) => void;
}

export const DuetRecorder: React.FC<DuetRecorderProps> = ({ originalVideo, onClose, onFinish }) => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordedBlob, setRecordedBlob] = React.useState<Blob | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const originalVideoRef = React.useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    async function setupCamera() {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 720, height: 1280 },
          audio: true
        });
        setStream(userStream);
        if (videoRef.current) {
          videoRef.current.srcObject = userStream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    if (!stream) return;
    
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setIsPaused(false);
    
    // Synced split-screen play
    if (originalVideoRef.current) {
      originalVideoRef.current.currentTime = 0;
      originalVideoRef.current.play();
    }

    // Progress timer
    let currentProgress = 0;
    timerRef.current = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        stopRecording();
      }
    }, 150); // Simulates 15s recording
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (originalVideoRef.current) {
        originalVideoRef.current.pause();
      }
    }
  };

  const handleFinish = () => {
    if (recordedBlob) {
      onFinish(recordedBlob);
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setProgress(0);
    if (originalVideoRef.current) {
      originalVideoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={onClose} className="text-white">
          <X size={28} />
        </button>
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <Music2 size={14} className="text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 truncate max-w-[120px]">
            Duet with {originalVideo.author.username}
          </span>
        </div>
        <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center border border-primary/40">
           <Zap size={16} className="text-primary" />
        </div>
      </div>

      {/* Grid Container for Duet (Side by Side) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Original Video */}
        <div className="flex-1 relative border-r border-white/10 overflow-hidden bg-bg-dark">
          <video
            ref={originalVideoRef}
            src={originalVideo.url}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted={recordedBlob !== null}
          />
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-black/60 border border-white/20 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest text-white/50">Original</span>
          </div>
        </div>

        {/* Right: Camera Feed / Recording */}
        <div className="flex-1 relative overflow-hidden bg-bg-dark">
          {!recordedBlob ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <video
              src={URL.createObjectURL(recordedBlob)}
              autoPlay
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            />
          )}
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-primary/60 border border-primary/20 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest text-white">Your Part</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-white/10 overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls Overlay */}
      <div className="p-8 pb-12 bg-black flex items-center justify-center gap-12 relative">
        <AnimatePresence mode="wait">
          {!recordedBlob ? (
            <motion.div 
              key="recording-controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex items-center gap-12"
            >
              <div className="flex flex-col items-center gap-2">
                <button className="w-10 h-10 rounded-full bg-glass flex items-center justify-center border border-white/10 text-white">
                  <RotateCcw size={20} />
                </button>
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Flip</span>
              </div>

              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${isRecording ? 'border-white/20 scale-110' : 'border-white'}`}
              >
                <div className={`transition-all duration-300 ${isRecording ? 'w-8 h-8 rounded-sm bg-primary' : 'w-16 h-16 rounded-full bg-primary shadow-lg shadow-primary/20'}`} />
              </button>

              <div className="flex flex-col items-center gap-2">
                <button className="w-10 h-10 rounded-full bg-glass flex items-center justify-center border border-white/10 text-white">
                  <Camera size={20} />
                </button>
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Filters</span>
              </div>
            </motion.div>
          ) : (
             <motion.div 
              key="post-recording-controls"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-12 w-full justify-center"
            >
                <button 
                  onClick={resetRecording}
                  className="w-16 h-16 rounded-full bg-glass border border-white/10 flex items-center justify-center text-white"
                >
                  <RotateCcw size={24} />
                </button>

                <button
                  onClick={handleFinish}
                  className="flex-1 max-w-[200px] h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                >
                  <Check size={24} strokeWidth={4} />
                  Post Duet
                </button>

                <button className="w-16 h-16 rounded-full bg-glass border border-white/10 flex items-center justify-center text-white">
                  <Zap size={24} />
                </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Recording side-by-side active</p>
      </div>
    </div>
  );
};
