'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  Zap, Shield, Code,
  Database, Lock, Globe, Palette, Terminal,
  CheckCircle, ArrowRight
} from 'lucide-react';

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-20 relative overflow-hidden min-h-screen flex items-center">
        {/* Deep space background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-zinc-950 to-zinc-950"></div>

        {/* Animated grid floor perspective */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[60vh] opacity-30"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(139, 92, 246, 0.1) 100%)',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'center bottom',
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] animate-grid-flow"></div>
        </div>

        {/* Floating code blocks - hidden on mobile */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
          {/* Left code block */}
          <div
            className="absolute left-[5%] top-[20%] w-72 p-4 rounded-xl bg-zinc-900/80 border border-blue-500/30 backdrop-blur-sm shadow-2xl shadow-blue-500/20"
            style={{ animation: 'float-left 8s ease-in-out infinite' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-2 text-xs text-zinc-500">[filename.ext]</span>
            </div>
            <div className="font-mono text-xs space-y-1">
              <div><span className="text-blue-400">[code]</span><span className="text-zinc-300"> {'{'} </span><span className="text-cyan-400">[snippet]</span><span className="text-zinc-300"> {'}'} </span></div>
              <div className="h-1"></div>
              <div><span className="text-blue-400">[keyword]</span><span className="text-cyan-400"> [function]</span><span className="text-yellow-400"> [name]</span><span className="text-zinc-300">() {'{'}</span></div>
              <div><span className="text-zinc-500 ml-4">// [Comment placeholder]</span></div>
              <div><span className="text-blue-400 ml-4">[code]</span><span className="text-zinc-300"> [</span><span className="text-cyan-400">[variable]</span><span className="text-zinc-300">] = </span><span className="text-yellow-400">[function]</span><span className="text-zinc-300">()</span></div>
              <div><span className="text-blue-400 ml-4">return</span><span className="text-zinc-300"> (</span><span className="text-cyan-400 animate-pulse">|</span></div>
            </div>
          </div>

          {/* Right code block */}
          <div
            className="absolute right-[5%] top-[30%] w-64 p-4 rounded-xl bg-zinc-900/80 border border-blue-500/30 backdrop-blur-sm shadow-2xl shadow-blue-500/20"
            style={{ animation: 'float-right 7s ease-in-out infinite 1s' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-2 text-xs text-zinc-500">[schema.file]</span>
            </div>
            <div className="font-mono text-xs space-y-1">
              <div><span className="text-blue-400">[model]</span><span className="text-yellow-400"> [Entity]</span><span className="text-zinc-300"> {'{'}</span></div>
              <div><span className="text-cyan-400 ml-4">[field1]</span><span className="text-zinc-300"> [Type] </span><span className="text-pink-400">@[attr]</span></div>
              <div><span className="text-cyan-400 ml-4">[field2]</span><span className="text-zinc-300"> [Type] </span><span className="text-pink-400">@[attr]</span></div>
              <div><span className="text-cyan-400 ml-4">[field3]</span><span className="text-zinc-300"> [Type][]</span></div>
              <div><span className="text-zinc-300">{'}'}</span></div>
            </div>
          </div>

          {/* Bottom floating API block */}
          <div
            className="absolute left-[10%] bottom-[15%] w-60 p-3 rounded-xl bg-zinc-900/80 border border-green-500/30 backdrop-blur-sm shadow-2xl shadow-green-500/20"
            style={{ animation: 'float-left 9s ease-in-out infinite 2s' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-green-400">[Status Label]</span>
            </div>
            <div className="font-mono text-xs">
              <div><span className="text-green-400">POST</span><span className="text-zinc-400"> /api/[resource]</span></div>
              <div><span className="text-green-400">GET</span><span className="text-zinc-400"> /api/[resource]/:id</span></div>
              <div><span className="text-yellow-400">PUT</span><span className="text-zinc-400"> /api/[resource]/:id</span></div>
            </div>
          </div>
        </div>

        {/* Central AI brain/neural network visualization - hidden on mobile */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-20 hidden md:block">
          {/* Orbiting rings */}
          <div className="absolute inset-0 rounded-full border border-blue-500/50 animate-spin-slow"></div>
          <div className="absolute inset-8 rounded-full border border-sky-500/40 animate-spin-slow-reverse"></div>
          <div className="absolute inset-16 rounded-full border border-pink-500/30 animate-spin-slow"></div>

          {/* Neural nodes */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-blue-400"
              style={{
                top: `${50 + 40 * Math.sin(i * Math.PI / 6)}%`,
                left: `${50 + 40 * Math.cos(i * Math.PI / 6)}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.8)',
                animation: `pulse-glow 2s ease-in-out infinite ${i * 0.2}s`,
              }}
            ></div>
          ))}

          {/* Center core */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 animate-pulse-glow" style={{ boxShadow: '0 0 60px rgba(56, 189, 248, 0.6)' }}></div>
        </div>

        {/* Particle field */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-blue-400/60"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 3}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-8 animate-fade-in backdrop-blur-sm">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
              </div>
              <span className="text-sm text-zinc-300 font-medium">[Badge Text]</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">[Label]</span>
            </div>

            {/* Dynamic headline with typing effect */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 sm:mb-8 leading-[1.1] animate-fade-in-up">
              <span className="block mb-2">[Hero Headline Line 1]</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 animate-gradient-flow">
                [Hero Headline Line 2]
              </span>
            </h1>

            {/* Typing effect subtitle - wraps on mobile */}
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 max-w-2xl mx-auto mb-8 sm:mb-12 animate-fade-in-up px-4" style={{animationDelay: '0.2s'}}>
              <span>[Hero subheading description text goes here]</span>
            </div>

            {/* CTA Buttons with glow */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold transition-all hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/80 transition-shadow"></div>
                <span className="relative z-10">[Primary CTA]</span>
                <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-zinc-900/80 border border-zinc-700 text-white font-semibold hover:bg-zinc-800/80 hover:border-blue-500/50 transition-all hover:-translate-y-1 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                [Secondary CTA]
              </Link>
            </div>

            {/* Mobile code preview - simplified single block */}
            <div className="mt-8 lg:hidden">
              <div className="max-w-xs mx-auto p-3 rounded-xl bg-zinc-900/90 border border-blue-500/30 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="ml-2 text-[10px] text-zinc-500">[file.ext]</span>
                </div>
                <div className="font-mono text-[10px] space-y-0.5 text-left">
                  <div><span className="text-blue-400">[keyword]</span> <span className="text-cyan-400">[type]</span> <span className="text-yellow-400">[Name]</span><span className="text-zinc-300">() {'{'}</span></div>
                  <div><span className="text-zinc-500 ml-2">// [Comment]</span></div>
                  <div><span className="text-blue-400 ml-2">return</span> <span className="text-zinc-300">&lt;</span><span className="text-cyan-400">[Component]</span><span className="text-zinc-300"> /&gt;</span></div>
                  <div><span className="text-zinc-300">{'}'}</span></div>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 sm:mt-16 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <p className="text-sm text-zinc-500 mb-4">[Trust indicator headline]</p>
              <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 opacity-50">
                <div className="text-zinc-400 font-semibold text-sm sm:text-base">[Partner 1]</div>
                <div className="text-zinc-400 font-semibold text-sm sm:text-base">[Partner 2]</div>
                <div className="text-zinc-400 font-semibold text-sm sm:text-base">[Partner 3]</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-zinc-600 flex justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-zinc-500 animate-scroll-indicator"></div>
          </div>
        </div>

        {/* CSS Keyframes */}
        <style jsx>{`
          @keyframes float-left {
            0%, 100% { transform: translateY(0) translateX(0) rotate(-2deg); }
            50% { transform: translateY(-15px) translateX(5px) rotate(1deg); }
          }
          @keyframes float-right {
            0%, 100% { transform: translateY(0) translateX(0) rotate(2deg); }
            50% { transform: translateY(-20px) translateX(-5px) rotate(-1deg); }
          }
          @keyframes float-icon {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
            50% { transform: translateY(-15px) scale(1.1); opacity: 1; }
          }
          @keyframes spin-slow {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }
          @keyframes spin-slow-reverse {
            from { transform: translate(-50%, -50%) rotate(360deg); }
            to { transform: translate(-50%, -50%) rotate(0deg); }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.5; box-shadow: 0 0 10px rgba(168, 85, 247, 0.5); }
            50% { opacity: 1; box-shadow: 0 0 30px rgba(168, 85, 247, 0.8); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }
          @keyframes gradient-flow {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes grid-flow {
            0% { transform: translateY(0); }
            100% { transform: translateY(4rem); }
          }
          @keyframes scroll-indicator {
            0%, 100% { transform: translateY(0); opacity: 1; }
            50% { transform: translateY(4px); opacity: 0.5; }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
            position: absolute;
            top: 50%;
            left: 50%;
          }
          .animate-spin-slow-reverse {
            animation: spin-slow-reverse 25s linear infinite;
            position: absolute;
            top: 50%;
            left: 50%;
          }
          .animate-pulse-glow {
            animation: pulse-glow 3s ease-in-out infinite;
          }
          .animate-float-icon {
            animation: float-icon 4s ease-in-out infinite;
          }
          .animate-gradient-flow {
            background-size: 200% 200%;
            animation: gradient-flow 4s ease infinite;
          }
          .animate-grid-flow {
            animation: grid-flow 3s linear infinite;
          }
          .animate-scroll-indicator {
            animation: scroll-indicator 1.5s ease-in-out infinite;
          }
          .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
          }
          .typing-text {
            overflow: hidden;
            border-right: 2px solid rgba(168, 85, 247, 0.8);
            animation: typing 3s steps(60) 1s forwards, blink 0.7s step-end infinite;
            white-space: nowrap;
            max-width: 0;
          }
          @keyframes typing {
            to { max-width: 100%; }
          }
          @keyframes blink {
            50% { border-color: transparent; }
          }
        `}</style>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Features</span>
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">
              [Section description text]
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-yellow-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4 group-hover:bg-yellow-500/20 transition-colors">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">[Feature 1 Title]</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">[Feature 1 description text goes here]</p>
            </div>

            <div className="group p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Code className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">[Feature 2 Title]</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">[Feature 2 description text goes here]</p>
            </div>

            <div className="group p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">[Feature 3 Title]</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">[Feature 3 description text goes here]</p>
            </div>

            <div className="group p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-green-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                <Lock className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">[Feature 4 Title]</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">[Feature 4 description text goes here]</p>
            </div>

            <div className="group p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                <Globe className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">[Feature 5 Title]</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">[Feature 5 description text goes here]</p>
            </div>

            <div className="group p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-pink-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
                <Palette className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">[Feature 6 Title]</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">[Feature 6 description text goes here]</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Stack */}
      <section className="py-20 bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              [Stack Section] <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">[Highlight]</span>
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">
              [Stack section description text]
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/30 transition-all text-center">
              <Terminal className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">[Tech 1]</h3>
              <p className="text-zinc-500 text-xs">[Tech 1 description]</p>
            </div>
            <div className="group p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/30 transition-all text-center">
              <Database className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">[Tech 2]</h3>
              <p className="text-zinc-500 text-xs">[Tech 2 description]</p>
            </div>
            <div className="group p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/30 transition-all text-center">
              <Palette className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">[Tech 3]</h3>
              <p className="text-zinc-500 text-xs">[Tech 3 description]</p>
            </div>
            <div className="group p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/30 transition-all text-center">
              <Shield className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">[Tech 4]</h3>
              <p className="text-zinc-500 text-xs">[Tech 4 description]</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature List */}
      <section className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10 text-center">
              Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Feature List</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                '[Feature item 1]',
                '[Feature item 2]',
                '[Feature item 3]',
                '[Feature item 4]',
                '[Feature item 5]',
                '[Feature item 6]',
                '[Feature item 7]',
                '[Feature item 8]',
                '[Feature item 9]',
                '[Feature item 10]',
                '[Feature item 11]',
                '[Feature item 12]',
                '[Feature item 13]',
                '[Feature item 14]',
                '[Feature item 15]',
                '[Feature item 16]',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-sm text-zinc-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">[CTA Headline]</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            [CTA description text]
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold hover:from-sky-400 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 group"
          >
            [CTA Button Text]
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
