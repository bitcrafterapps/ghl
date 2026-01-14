'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Sparkles, FileText, Search, PenTool } from 'lucide-react';

interface PrdGenerationModalProps {
  isOpen: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

const GENERATION_STEPS = [
  { icon: Search, label: 'Analyzing your description...', duration: 2 },
  { icon: Sparkles, label: 'Brainstorming features and requirements...', duration: 4 },
  { icon: FileText, label: 'Drafting the specification...', duration: 5 },
  { icon: PenTool, label: 'Refining and formatting...', duration: 3 },
];

export function PrdGenerationModal({ isOpen }: PrdGenerationModalProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particleIdRef = useRef(0);
  
  useEffect(() => {
    if (!isOpen) {
      setElapsedTime(0);
      setCurrentStep(0);
      setParticles([]);
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

  // Particle spawn function
  const spawnParticle = useCallback(() => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radiusX = rect.width / 2;
    const radiusY = rect.height / 2;
    
    // Random angle along the path
    const angle = Math.random() * Math.PI * 2;
    const x = centerX + radiusX * Math.cos(angle);
    const y = centerY + radiusY * Math.sin(angle);
    
    const newParticle: Particle = {
      id: particleIdRef.current++,
      x,
      y,
      size: Math.random() * 4 + 2,
      opacity: 1,
      speed: Math.random() * 0.02 + 0.01,
    };
    
    setParticles(prev => [...prev.slice(-15), newParticle]);
  }, []);

  // Particle animation
  useEffect(() => {
    if (!isOpen) return;

    const animate = () => {
      if (Math.random() > 0.8) {
        spawnParticle();
      }
      
      setParticles(prev => 
        prev
          .map(p => ({ ...p, opacity: p.opacity - p.speed }))
          .filter(p => p.opacity > 0)
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, spawnParticle]);
  
  if (!isOpen) return null;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const CurrentIcon = GENERATION_STEPS[currentStep]?.icon || Sparkles;
  const currentLabel = GENERATION_STEPS[currentStep]?.label || 'Generating PRD...';
  
  // Calculate rough progress percentage
  const totalDuration = GENERATION_STEPS.reduce((sum, s) => sum + s.duration, 0);
  const progressPercent = Math.min((elapsedTime / totalDuration) * 100, 95);

  const glowColor = '#3b82f6'; // Blue for PRD
  const glowColorRgb = '59, 130, 246';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal with comet effect */}
      <div 
        ref={containerRef}
        className="relative p-[3px] rounded-2xl"
        style={{
          background: `linear-gradient(135deg, rgba(${glowColorRgb}, 0.1), transparent)`,
        }}
      >
        {/* Comet head */}
        <div 
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            background: `conic-gradient(from var(--comet-angle, 0deg) at 50% 50%, 
              transparent 0deg,
              transparent 300deg,
              ${glowColor} 340deg,
              white 355deg,
              ${glowColor} 360deg
            )`,
            animation: 'comet-spin 4s linear infinite',
          }}
        />
        
        {/* Comet trail */}
        <div 
          className="absolute inset-0 rounded-2xl overflow-hidden blur-sm opacity-70"
          style={{
            background: `conic-gradient(from var(--comet-angle, 0deg) at 50% 50%, 
              transparent 0deg,
              transparent 200deg,
              rgba(${glowColorRgb}, 0.3) 280deg,
              rgba(${glowColorRgb}, 0.6) 320deg,
              ${glowColor} 350deg,
              white 358deg,
              ${glowColor} 360deg
            )`,
            animation: 'comet-spin 4s linear infinite',
          }}
        />
        
        {/* Outer glow */}
        <div 
          className="absolute -inset-1 rounded-2xl blur-lg opacity-40"
          style={{
            background: `conic-gradient(from var(--comet-angle, 0deg) at 50% 50%, 
              transparent 0deg,
              transparent 280deg,
              ${glowColor} 350deg,
              white 360deg
            )`,
            animation: 'comet-spin 4s linear infinite',
          }}
        />

        {/* Sparkle particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute pointer-events-none"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              backgroundColor: 'white',
              boxShadow: `0 0 ${particle.size * 2}px ${glowColor}, 0 0 ${particle.size * 4}px ${glowColor}`,
              opacity: particle.opacity,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      
        {/* Modal content */}
        <div className="relative bg-zinc-900 rounded-2xl shadow-2xl p-8 max-w-md w-full overflow-hidden">
          {/* Background gradient animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-sky-600/10 animate-pulse" />
          
          <div className="relative">
            {/* Main spinner */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Outer ring */}
                <div className="w-24 h-24 rounded-full border-4 border-zinc-700" />
                {/* Animated ring */}
                <div 
                  className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-blue-500 border-r-sky-400 animate-spin"
                  style={{ animationDuration: '1s' }}
                />
                {/* Inner glow */}
                <div 
                  className="absolute inset-2 rounded-full blur-md opacity-30"
                  style={{ backgroundColor: glowColor }}
                />
                {/* Inner icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <CurrentIcon className="w-10 h-10 text-blue-400 animate-pulse" />
                </div>
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-xl font-semibold text-white text-center mb-2">
              Generating PRD
            </h2>
            
            <p className="text-zinc-400 text-center text-sm mb-6">
              Creating a comprehensive specification for your app
            </p>
            
            {/* Current step */}
            <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 border border-zinc-700">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="text-zinc-300 text-sm">{currentLabel}</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mb-4">
              <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-sky-500 rounded-full transition-all duration-1000 ease-out"
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
          </div>
        </div>
      </div>

      {/* CSS for comet animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @property --comet-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        
        @keyframes comet-spin {
          from {
            --comet-angle: 0deg;
          }
          to {
            --comet-angle: 360deg;
          }
        }
      `}} />
    </div>
  );
}
