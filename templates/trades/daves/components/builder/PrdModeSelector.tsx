'use client';

import { Zap, MessageCircle, ArrowRight } from 'lucide-react';

interface PrdModeSelectorProps {
  onSelectMode: (mode: 'auto' | 'interview') => void;
}

export function PrdModeSelector({ onSelectMode }: PrdModeSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">How do you want to start?</h2>
        <p className="text-zinc-400 text-lg">Choose how you want to define your project requirements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Auto-Generate Card */}
        <div 
          onClick={() => onSelectMode('auto')}
          className="bg-[#18181b] border border-zinc-800 hover:border-blue-500/50 rounded-2xl p-8 cursor-pointer group transition-all duration-300 hover:bg-zinc-900 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors"></div>
          
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
            <Zap className="w-7 h-7 text-blue-400" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-3">Auto-Generate</h3>
          <p className="text-zinc-400 leading-relaxed mb-8 h-20">
            Perfect if you already have a clear idea. Just describe your app, and our AI will instantly generate a comprehensive PRD for you.
          </p>
          
          <div className="flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
            Select Auto-Generate <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Guided Interview Card */}
        <div 
          onClick={() => onSelectMode('interview')}
          className="bg-[#18181b] border border-zinc-800 hover:border-blue-500/50 rounded-2xl p-8 cursor-pointer group transition-all duration-300 hover:bg-zinc-900 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors"></div>
          
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
            <MessageCircle className="w-7 h-7 text-blue-400" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-3">Guided Interview</h3>
          <p className="text-zinc-400 leading-relaxed mb-8 h-20">
            Not sure where to start? Our AI product manager will interview you step-by-step to define your perfect application.
          </p>
          
          <div className="flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
            Start Interview <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
