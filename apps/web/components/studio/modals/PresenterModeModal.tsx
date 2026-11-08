'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';

interface PresenterModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PresenterModeModal({ isOpen, onClose }: PresenterModeModalProps) {
  const { project } = useEditorStore();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const slides = project?.pages || [];
  const currentSlide = slides[currentSlideIndex];

  // Presentation Timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, slides.length, onClose]);

  if (!isOpen || !project) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col select-none">
      {/* Presenter Top Bar */}
      <div className="h-12 bg-zinc-950 border-b border-zinc-800 px-6 flex items-center justify-between text-xs text-zinc-300">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-white">{project.title}</span>
          <span className="text-zinc-500">•</span>
          <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-zinc-400 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
            title="Exit Presenter Mode (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Viewer Canvas */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden bg-zinc-900">
        <div
          style={{
            width: '100%',
            maxWidth: '1200px',
            aspectRatio: '16/9',
            backgroundColor: currentSlide?.background?.color || '#090d16',
          }}
          className="rounded-xl shadow-2xl relative p-12 border border-zinc-800 flex flex-col justify-between overflow-hidden"
        >
          {/* Render Slide Elements */}
          {currentSlide?.elements.map((el) => {
            if (el.type === 'text') {
              return (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: `${(el.x / (currentSlide.width || 1280)) * 100}%`,
                    top: `${(el.y / (currentSlide.height || 720)) * 100}%`,
                    width: `${(el.width / (currentSlide.width || 1280)) * 100}%`,
                    fontSize: `${(el.style?.fontSize || 20) * 1.2}px`,
                    fontWeight: el.style?.fontWeight || 'normal',
                    color: el.style?.color || '#ffffff',
                    textAlign: el.style?.textAlign || 'left',
                  }}
                  className="leading-snug"
                >
                  {el.text}
                </div>
              );
            }

            if (el.type === 'shape') {
              return (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: `${(el.x / (currentSlide.width || 1280)) * 100}%`,
                    top: `${(el.y / (currentSlide.height || 720)) * 100}%`,
                    width: `${(el.width / (currentSlide.width || 1280)) * 100}%`,
                    height: `${(el.height / (currentSlide.height || 720)) * 100}%`,
                    backgroundColor: el.style?.fill || '#3b82f6',
                    borderColor: el.style?.stroke || '#1d4ed8',
                    borderWidth: `${el.style?.strokeWidth || 1}px`,
                    borderRadius: `${el.style?.cornerRadius || 8}px`,
                  }}
                  className="flex items-center justify-center p-4 text-center text-white font-bold"
                >
                  {el.text}
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Previous / Next Floating Hover Buttons */}
        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentSlideIndex === 0}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-950/80 hover:bg-zinc-800 disabled:opacity-20 text-white transition-all shadow-xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1))}
          disabled={currentSlideIndex === slides.length - 1}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-950/80 hover:bg-zinc-800 disabled:opacity-20 text-white transition-all shadow-xl"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Speaker Notes Drawer */}
      <div className="h-16 bg-zinc-950 border-t border-zinc-800 px-6 flex items-center justify-between text-xs text-zinc-400">
        <div>
          <span className="font-semibold text-zinc-300">Speaker Notes: </span>
          <span>{currentSlide?.slideSettings?.speakerNotes || 'No speaker notes recorded for this slide.'}</span>
        </div>
        <div className="text-[11px] text-zinc-500">
          Press Space / Arrow keys to navigate • Esc to exit
        </div>
      </div>
    </div>
  );
}

