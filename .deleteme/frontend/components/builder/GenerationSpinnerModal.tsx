'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Sparkles, Code, Cpu, Rocket } from 'lucide-react';

interface GenerationSpinnerModalProps {
  isOpen: boolean;
  projectName?: string;
  logMessages?: string[];
}

const GENERATION_STEPS = [
  { icon: Sparkles, label: 'Analyzing PRD requirements...', duration: 3 },
  { icon: Code, label: 'Generating application structure...', duration: 5 },
  { icon: Cpu, label: 'Building components...', duration: 10 },
  { icon: Rocket, label: 'Finalizing and optimizing...', duration: 8 },
];

export function GenerationSpinnerModal({ isOpen, projectName, logMessages = [] }: GenerationSpinnerModalProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isOpen) {
      setElapsedTime(0);
      setCurrentStep(0);
      return;
    }
    
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen]);
  
  // Progress through steps based on elapsed time
  useEffect(() => {
    let accumulated = 0;
    for (let i = 0; i < GENERATION_STEPS.length; i++) {
      accumulated += GENERATION_STEPS[i].duration;
      if (elapsedTime < accumulated) {
        setCurrentStep(i);
        break;
      }
    }
  }, [elapsedTime]);

  // Auto-scroll log messages
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logMessages]);
  
  if (!isOpen) return null;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const CurrentIcon = GENERATION_STEPS[currentStep]?.icon || Sparkles;
  
  // Calculate rough progress percentage
  const totalDuration = GENERATION_STEPS.reduce((sum, s) => sum + s.duration, 0);
  const progressPercent = Math.min((elapsedTime / totalDuration) * 100, 95);
  
  // Get the latest log message for the current step display
  const latestMessage = logMessages.length > 0 ? logMessages[logMessages.length - 1] : null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 overflow-hidden">
        {/* Background gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-600/10 animate-pulse" />
        
        <div className="relative">
          {/* Main spinner */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Outer ring */}
              <div className="w-24 h-24 rounded-full border-4 border-zinc-700" />
              {/* Animated ring */}
              <div 
                className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 animate-spin"
                style={{ animationDuration: '1s' }}
              />
              {/* Inner icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <CurrentIcon className="w-10 h-10 text-blue-400 animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-semibold text-white text-center mb-2">
            Generating Your App
          </h2>
          
          {projectName && (
            <p className="text-blue-300 text-center text-sm mb-4">
              {projectName}
            </p>
          )}
          
          {/* Current step - show latest log message if available */}
          <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
              <span className="text-zinc-300 text-sm truncate">
                {latestMessage || 'Initializing...'}
              </span>
            </div>
          </div>

          {/* Log messages scrollable container */}
          {logMessages.length > 1 && (
            <div className="bg-zinc-950/50 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto border border-zinc-800">
              <div className="space-y-1">
                {logMessages.slice(-8).map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`text-xs font-mono ${
                      idx === logMessages.slice(-8).length - 1 
                        ? 'text-blue-300' 
                        : 'text-zinc-500'
                    }`}
                  >
                    {msg}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          )}
          
          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          
          {/* Elapsed time */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-zinc-500 text-sm">Elapsed time:</span>
            <span className="text-2xl font-mono font-bold text-white">
              {formatTime(elapsedTime)}
            </span>
          </div>
          
          {/* Fun messages based on time */}
          <p className="text-center text-zinc-500 text-xs mt-4">
            {elapsedTime < 10 
              ? 'This usually takes 30-60 seconds...' 
              : elapsedTime < 30 
                ? 'AI is crafting your application...'
                : elapsedTime < 60 
                  ? 'Almost there, finalizing details...'
                  : 'Taking a bit longer than usual, hang tight!'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
