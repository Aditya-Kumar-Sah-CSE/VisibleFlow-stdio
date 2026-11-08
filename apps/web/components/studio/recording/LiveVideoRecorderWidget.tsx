'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Circle,
  Square,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Square as StopIcon,
  Download,
  X,
  Radio,
  Settings2,
  RefreshCw,
  Move,
  Monitor,
  Share2,
  Film,
  Sparkles,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import toast from 'react-hot-toast';

export type VideoRatio = '16:9' | '9:16' | '1:1' | '4:3';

interface RatioConfig {
  label: string;
  sublabel: string;
  width: number;
  height: number;
}

export const RATIO_CONFIGS: Record<VideoRatio, RatioConfig> = {
  '16:9': { label: '16:9 Landscape', sublabel: 'YouTube & Presentation', width: 1920, height: 1080 },
  '9:16': { label: '9:16 Vertical', sublabel: 'Reels, Shorts & TikTok', width: 1080, height: 1920 },
  '1:1': { label: '1:1 Square', sublabel: 'Instagram & LinkedIn', width: 1080, height: 1080 },
  '4:3': { label: '4:3 Standard', sublabel: 'Classic & iPad', width: 1024, height: 768 },
};

export function LiveVideoRecorderWidget() {
  const { setPageDimensions, project } = useEditorStore();

  // Floating PiP States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(true);
  const [bubbleShape, setBubbleShape] = useState<'circle' | 'rounded'>('circle');
  const [bubbleSize, setBubbleSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [positionCorner, setPositionCorner] = useState<'br' | 'bl' | 'tr' | 'tl'>('br');
  const [isMirrored, setIsMirrored] = useState(true);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);

  // Screen Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [selectedRatio, setSelectedRatio] = useState<VideoRatio>('16:9');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // Media Streams & Elements
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);

  const webcamStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or teardown webcam
  useEffect(() => {
    if (isCameraActive) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [isCameraActive]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: isMicActive,
      });
      webcamStreamRef.current = stream;
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.play().catch(() => {});
      }
      toast.success('Live Camera Active');
    } catch (err: any) {
      console.error('Camera error', err);
      toast.error('Could not access camera/mic. Check browser permissions.');
      setIsCameraActive(false);
    }
  };

  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((track) => track.stop());
      webcamStreamRef.current = null;
    }
    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = null;
    }
  };

  const toggleMic = () => {
    if (webcamStreamRef.current) {
      const audioTracks = webcamStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => {
        t.enabled = !isMicActive;
      });
    }
    setIsMicActive(!isMicActive);
    toast.success(!isMicActive ? 'Microphone unmuted' : 'Microphone muted');
  };

  // Recording Timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording, isPaused]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // START RECORDING
  const handleStartRecording = async () => {
    try {
      recordedChunksRef.current = [];
      const ratioConfig = RATIO_CONFIGS[selectedRatio];

      // 1. Get Screen Stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          frameRate: 30,
        },
        audio: true,
      });
      screenStreamRef.current = screenStream;

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = screenStream;
        await screenVideoRef.current.play();
      }

      // 2. Setup Composite Canvas according to selected aspect ratio
      const canvas = compositeCanvasRef.current;
      if (!canvas) throw new Error('Composite canvas not mounted');

      canvas.width = ratioConfig.width;
      canvas.height = ratioConfig.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      // 3. Composite Animation Loop: Draws screen + camera overlay
      const drawComposite = () => {
        if (screenVideoRef.current && screenVideoRef.current.readyState >= 2) {
          // Clear background (dark studio theme)
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Calculate screen aspect-fit into target ratio canvas
          const screenW = screenVideoRef.current.videoWidth || 1920;
          const screenH = screenVideoRef.current.videoHeight || 1080;
          const screenAspect = screenW / screenH;
          const targetAspect = canvas.width / canvas.height;

          let renderW = canvas.width;
          let renderH = canvas.height;
          let renderX = 0;
          let renderY = 0;

          if (screenAspect > targetAspect) {
            renderH = canvas.width / screenAspect;
            renderY = (canvas.height - renderH) / 2;
          } else {
            renderW = canvas.height * screenAspect;
            renderX = (canvas.width - renderW) / 2;
          }

          ctx.drawImage(screenVideoRef.current, renderX, renderY, renderW, renderH);

          // Draw Picture-in-Picture Webcam if active
          if (
            isCameraActive &&
            webcamVideoRef.current &&
            webcamVideoRef.current.readyState >= 2
          ) {
            const pipSize = Math.round(canvas.width * (bubbleSize === 'sm' ? 0.16 : bubbleSize === 'md' ? 0.22 : 0.28));
            const margin = Math.round(canvas.width * 0.035);

            let pipX = canvas.width - pipSize - margin;
            let pipY = canvas.height - pipSize - margin;

            if (positionCorner === 'bl') {
              pipX = margin;
              pipY = canvas.height - pipSize - margin;
            } else if (positionCorner === 'tl') {
              pipX = margin;
              pipY = margin;
            } else if (positionCorner === 'tr') {
              pipX = canvas.width - pipSize - margin;
              pipY = margin;
            }

            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 24;
            ctx.shadowOffsetY = 8;

            if (bubbleShape === 'circle') {
              ctx.beginPath();
              ctx.arc(pipX + pipSize / 2, pipY + pipSize / 2, pipSize / 2, 0, Math.PI * 2);
              ctx.clip();
            } else {
              // Rounded Rect
              const radius = 24;
              ctx.beginPath();
              ctx.moveTo(pipX + radius, pipY);
              ctx.lineTo(pipX + pipSize - radius, pipY);
              ctx.quadraticCurveTo(pipX + pipSize, pipY, pipX + pipSize, pipY + radius);
              ctx.lineTo(pipX + pipSize, pipY + pipSize - radius);
              ctx.quadraticCurveTo(pipX + pipSize, pipY + pipSize, pipX + pipSize - radius, pipY + pipSize);
              ctx.lineTo(pipX + radius, pipY + pipSize);
              ctx.quadraticCurveTo(pipX, pipY + pipSize, pipX, pipY + pipSize - radius);
              ctx.lineTo(pipX, pipY + radius);
              ctx.quadraticCurveTo(pipX, pipY, pipX + radius, pipY);
              ctx.closePath();
              ctx.clip();
            }

            // Draw Webcam frame (mirrored if enabled)
            if (isMirrored) {
              ctx.translate(pipX + pipSize, pipY);
              ctx.scale(-1, 1);
              ctx.drawImage(webcamVideoRef.current, 0, 0, pipSize, pipSize);
            } else {
              ctx.drawImage(webcamVideoRef.current, pipX, pipY, pipSize, pipSize);
            }

            ctx.restore();

            // Border ring
            ctx.save();
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 6;
            if (bubbleShape === 'circle') {
              ctx.beginPath();
              ctx.arc(pipX + pipSize / 2, pipY + pipSize / 2, pipSize / 2, 0, Math.PI * 2);
              ctx.stroke();
            } else {
              ctx.strokeRect(pipX, pipY, pipSize, pipSize);
            }
            ctx.restore();
          }
        }

        animationFrameRef.current = requestAnimationFrame(drawComposite);
      };

      drawComposite();

      // 4. Capture Canvas stream & Combine Audio
      const canvasStream = canvas.captureStream(30);

      // Collect audio from microphone & screen
      const audioTracks: MediaStreamTrack[] = [
        ...(screenStream.getAudioTracks() || []),
        ...(webcamStreamRef.current ? webcamStreamRef.current.getAudioTracks() : []),
      ];

      audioTracks.forEach((track) => canvasStream.addTrack(track));

      // 5. Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9,opus')
        ? 'video/webm; codecs=vp9,opus'
        : 'video/webm';

      const recorder = new MediaRecorder(canvasStream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedVideoUrl(url);
        setShowPreviewModal(true);

        // Stop screen tracks
        screenStream.getTracks().forEach((track) => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      // Handle user clicking native "Stop Sharing"
      screenStream.getVideoTracks()[0].onended = () => {
        handleStopRecording();
      };

      recorder.start(1000); // 1s slices
      setIsRecording(true);
      setIsPaused(false);
      setRecordingSeconds(0);
      toast.success(`Recording started in ${ratioConfig.label}`);
    } catch (err: any) {
      console.error('Recording start failed', err);
      if (err.name !== 'NotAllowedError') {
        toast.error('Failed to start recording');
      }
      setIsRecording(false);
    }
  };

  const handlePauseRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      toast.success('Recording resumed');
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      toast.success('Recording paused');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      toast.success('Recording finished! Preview ready.');
    }
  };

  const handleApplyCanvasRatio = (ratio: VideoRatio) => {
    setSelectedRatio(ratio);
    const config = RATIO_CONFIGS[ratio];
    setPageDimensions(config.width, config.height);
    toast.success(`Canvas resized to ${config.label} (${config.width}x${config.height})`);
  };

  // Bubble size dimensions
  const getBubbleDimensions = () => {
    if (bubbleShape === 'circle') {
      if (bubbleSize === 'sm') return 'w-28 h-28';
      if (bubbleSize === 'lg') return 'w-48 h-48';
      return 'w-36 h-36';
    } else {
      if (bubbleSize === 'sm') return 'w-36 h-24';
      if (bubbleSize === 'lg') return 'w-60 h-40';
      return 'w-48 h-32';
    }
  };

  // Position placement classes
  const getPositionClass = () => {
    switch (positionCorner) {
      case 'bl':
        return 'bottom-5 left-76';
      case 'tl':
        return 'top-18 left-76';
      case 'tr':
        return 'top-18 right-80';
      case 'br':
      default:
        return 'bottom-5 right-80';
    }
  };

  return (
    <>
      {/* Hidden processing streams */}
      <div className="hidden">
        <video ref={webcamVideoRef} playsInline muted />
        <video ref={screenVideoRef} playsInline muted />
        <canvas ref={compositeCanvasRef} />
      </div>

      {/* Floating Bottom-Right Live Video PiP & Recorder Hub */}
      <div className={`fixed z-40 transition-all duration-200 select-none ${getPositionClass()}`}>
        {/* Floating Live Webcam Frame */}
        {isCameraActive && (
          <div
            className={`relative group shadow-2xl border-2 border-blue-500 overflow-hidden bg-slate-950 transition-all ${getBubbleDimensions()} ${
              bubbleShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
            }`}
          >
            <video
              ref={(node) => {
                if (node && webcamStreamRef.current) {
                  node.srcObject = webcamStreamRef.current;
                  node.play().catch(() => {});
                }
              }}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover pointer-events-none ${
                isMirrored ? 'scale-x-[-1]' : ''
              }`}
            />

            {/* Hover overlay quick controls */}
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2 p-2">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={toggleMic}
                  className={`p-1.5 rounded-full ${
                    isMicActive ? 'bg-slate-800 text-white' : 'bg-rose-600 text-white'
                  }`}
                  title={isMicActive ? 'Mute Mic' : 'Unmute Mic'}
                >
                  {isMicActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setIsMirrored(!isMirrored)}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white"
                  title="Flip Video"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setBubbleShape(bubbleShape === 'circle' ? 'rounded' : 'circle')}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white"
                  title="Toggle Shape (Circle / Box)"
                >
                  {bubbleShape === 'circle' ? <Square className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Position Corner Selector */}
              <div className="flex items-center space-x-1 text-[9px] text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded-full">
                <button
                  onClick={() => setPositionCorner(positionCorner === 'br' ? 'bl' : 'br')}
                  className="hover:text-blue-400 font-bold"
                >
                  Corner: {positionCorner.toUpperCase()}
                </button>
              </div>
            </div>

            {/* Live Indicator Pill */}
            <div className="absolute top-2 left-2 flex items-center space-x-1 bg-red-600/90 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              <span>LIVE</span>
            </div>
          </div>
        )}

        {/* Master Control Floating Bar */}
        <div className="mt-2 bg-slate-950/95 border border-slate-800 shadow-2xl rounded-2xl px-3 py-2 flex items-center space-x-2 text-slate-200 backdrop-blur-md">
          {/* Live Camera Toggle Button */}
          <button
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isCameraActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400'
                : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800'
            }`}
            title="Toggle Live Webcam PiP"
          >
            {isCameraActive ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isCameraActive ? 'Camera On' : 'Live Video'}</span>
          </button>

          {/* Screen Recording Controls */}
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all"
              title="Record Tutorial Video"
            >
              <Circle className="w-3.5 h-3.5 fill-white" />
              <span>Record Tutorial</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 bg-slate-900 border border-rose-500/40 rounded-xl px-2 py-1">
              <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-rose-400 pr-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>{formatTime(recordingSeconds)}</span>
              </div>
              <button
                onClick={handlePauseRecording}
                className="p-1 rounded hover:bg-slate-800 text-slate-300"
                title={isPaused ? 'Resume Recording' : 'Pause Recording'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleStopRecording}
                className="p-1 rounded hover:bg-rose-950 text-rose-400 hover:text-rose-300"
                title="Stop & Save Recording"
              >
                <StopIcon className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              </button>
            </div>
          )}

          {/* Aspect Ratio Selector & Settings Toggle */}
          <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
            <button
              onClick={() => setIsControlsExpanded(!isControlsExpanded)}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isControlsExpanded ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              title="Screen Ratios & Settings"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expanded Screen Ratio & Tutorial Video Settings Menu */}
        {isControlsExpanded && (
          <div className="mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl text-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                <Film className="w-3.5 h-3.5 text-blue-400" />
                <span>Tutorial Screen Ratios</span>
              </div>
              <button
                onClick={() => setIsControlsExpanded(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Multiple Screen Ratios */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Select Aspect Ratio
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(RATIO_CONFIGS) as VideoRatio[]).map((r) => {
                  const cfg = RATIO_CONFIGS[r];
                  const isSelected = selectedRatio === r;
                  return (
                    <button
                      key={r}
                      onClick={() => handleApplyCanvasRatio(r)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-600/20 text-white'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{r}</div>
                      <div className="text-[9px] text-slate-400 truncate">{cfg.sublabel}</div>
                      <div className="text-[9px] text-blue-400 font-mono mt-0.5">
                        {cfg.width}×{cfg.height}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Camera Frame Shape & Size */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Webcam Bubble Setup
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Size</span>
                <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  {(['sm', 'md', 'lg'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setBubbleSize(s)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        bubbleSize === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Shape</span>
                <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setBubbleShape('circle')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      bubbleShape === 'circle' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Circle
                  </button>
                  <button
                    onClick={() => setBubbleShape('rounded')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      bubbleShape === 'rounded' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Box
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recording Finished Preview & Export Modal */}
      {showPreviewModal && recordedVideoUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Tutorial Video Recorded</h3>
                  <p className="text-xs text-slate-400">
                    Aspect Ratio: {RATIO_CONFIGS[selectedRatio].label} • Duration: {formatTime(recordingSeconds)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video max-h-80 flex items-center justify-center">
              <video
                src={recordedVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Size: {recordedBlob ? (recordedBlob.size / 1024 / 1024).toFixed(2) : '0'} MB • Format: WebM / MP4
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 text-slate-300"
                >
                  Close
                </button>
                <a
                  href={recordedVideoUrl}
                  download={`VisualFlow-Tutorial-${selectedRatio}-${Date.now()}.webm`}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Tutorial Video</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
