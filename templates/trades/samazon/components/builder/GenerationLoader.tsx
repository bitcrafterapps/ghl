'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface GenerationLoaderProps {
  isVisible: boolean;
  phase?: {
    name: string;
    message?: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
  } | null;
  logMessages?: string[];
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

export function GenerationLoader({ isVisible, phase, logMessages = [] }: GenerationLoaderProps) {
  const [elapsed, setElapsed] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particleIdRef = useRef(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVisible) {
      setElapsed(0);
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVisible]);

  // Auto-scroll log messages
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logMessages]);

  // Particle animation system
  const spawnParticle = useCallback((angle: number, glowColor: string) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radiusX = rect.width / 2;
    const radiusY = rect.height / 2;
    
    // Calculate position on the border based on angle
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
    
    setParticles(prev => [...prev.slice(-20), newParticle]); // Keep max 20 particles
  }, []);

  // Animate particles
  useEffect(() => {
    if (!isVisible) {
      setParticles([]);
      return;
    }

    let angle = 0;
    const animate = () => {
      angle += 0.015; // Speed of comet (slower)
      
      // Spawn particles occasionally
      if (Math.random() > 0.7) {
        spawnParticle(angle, isModificationMode ? '#10b981' : '#8b5cf6');
      }
      
      // Fade out existing particles
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
  }, [isVisible, spawnParticle]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get latest log message
  const latestLogMessage = logMessages.length > 0 ? logMessages[logMessages.length - 1] : null;
  
  // Detect modification mode from log messages
  const isModificationMode = logMessages.some(msg => msg.includes('MODIFICATION MODE'));
  const modalTitle = isModificationMode ? 'Updating Application' : 'Generating Application';
  const modalDescription = isModificationMode 
    ? 'Modifying your existing code based on your request...' 
    : 'This usually takes several minutes.';

  const glowColor = isModificationMode ? '#10b981' : '#8b5cf6';
  const glowColorRgb = isModificationMode ? '16, 185, 129' : '139, 92, 246';

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Outer container with comet border effect */}
      <div 
        ref={containerRef}
        className="relative p-[3px] rounded-2xl"
        style={{
          background: `linear-gradient(135deg, rgba(${glowColorRgb}, 0.1), transparent)`,
        }}
      >
        {/* Comet head - the bright leading part */}
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
        
        {/* Comet trail - fading tail */}
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
        
        {/* Outer glow effect */}
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
        <div className="relative flex flex-col items-center max-w-md w-full p-8 bg-zinc-900 rounded-2xl shadow-2xl">
          {/* Spinner */}
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
            <div
              className={`absolute inset-0 rounded-full border-4 border-t-transparent ${isModificationMode ? 'border-emerald-500' : 'border-blue-500'} animate-spin`}
            />
            {/* Inner glow */}
            <div 
              className="absolute inset-2 rounded-full blur-md opacity-30"
              style={{ backgroundColor: glowColor }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white font-mono">
                {formatTime(elapsed)}
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            {modalTitle}
          </h2>
          
          <p className="text-zinc-400 text-center mb-4 text-sm">
            {modalDescription}
          </p>

          {/* Current Activity - Show log message or phase */}
          <div className="w-full bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700 mb-4">
            <div className="flex items-center justify-center gap-2">
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: glowColor }}
              />
              <span className="text-zinc-300 text-sm truncate">
                {latestLogMessage || (phase?.message) || 'Processing...'}
              </span>
            </div>
          </div>

          {/* Log Messages History */}
          {logMessages.length > 1 && (
            <div className="w-full bg-zinc-950/50 rounded-lg p-3 max-h-32 overflow-y-auto border border-zinc-800">
              <div className="space-y-1">
                {logMessages.slice(-8).map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`text-xs font-mono ${
                      idx === logMessages.slice(-8).length - 1 
                        ? isModificationMode ? 'text-emerald-300' : 'text-blue-300'
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
