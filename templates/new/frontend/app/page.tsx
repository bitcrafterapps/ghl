'use client';

import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import Link from 'next/link';
import { 
  Zap, Shield, Users, Cog, Server, Palette,
  FileText, Code, Rocket, RefreshCcw, 
  Lock, Building2, CreditCard, Activity, Eye,
  Layout, Database, Cloud, CheckCircle, ArrowRight
} from 'lucide-react';
import { useEffect } from 'react';


export default function Home() {
  useEffect(() => {
    // Animation on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe all fade-in elements
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950">
      <Header />

      {/* Hero Section - Clean & Modern */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-blue-950/50 to-zinc-950"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Bears with Particles */}
            <div className="relative mb-8">
              {/* Floating Particles */}
              <div className="absolute inset-0 pointer-events-none">
                <span className="absolute text-xl animate-ping opacity-60" style={{ top: '0', left: '20%', animationDuration: '3s' }}>✨</span>
                <span className="absolute text-lg animate-ping opacity-60" style={{ top: '20%', left: '10%', animationDuration: '2.5s', animationDelay: '0.5s' }}>⭐</span>
                <span className="absolute text-xl animate-ping opacity-60" style={{ top: '-10%', left: '50%', animationDuration: '2.8s', animationDelay: '1s' }}>✨</span>
                <span className="absolute text-lg animate-ping opacity-60" style={{ top: '10%', right: '15%', animationDuration: '3.2s', animationDelay: '0.3s' }}>⭐</span>
                <span className="absolute text-xl animate-ping opacity-60" style={{ top: '5%', right: '25%', animationDuration: '2.6s', animationDelay: '0.7s' }}>✨</span>
              </div>
              {/* Bears */}
              <div className="text-7xl sm:text-8xl md:text-9xl flex justify-center gap-3 sm:gap-4">
                <span className="inline-block animate-bounce drop-shadow-2xl" style={{ animationDelay: '0s', animationDuration: '4s' }}>[ICON]</span>
              </div>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              [HEADLINE]
            </h1>
            
            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-zinc-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              [SUBHEADLINE]
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/login">
                <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl text-white font-semibold text-lg hover:from-sky-400 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 group">
                  Start Building Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/pricing">
                <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white font-semibold text-lg transition-all backdrop-blur-sm flex items-center justify-center gap-2">
                  View Pricing
                </button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>[BADGE 1]</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>[BADGE 2]</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>[BADGE 3]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/40 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>


      <Footer />
    </main>
  );
}