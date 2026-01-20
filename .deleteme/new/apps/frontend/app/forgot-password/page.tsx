'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { siteConfig } from '@/data/config';

const API_URL = getApiUrl();

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Get hero gradient colors from branding
  const heroBgFrom = siteConfig.branding.heroBgFrom || '';
  const heroBgTo = siteConfig.branding.heroBgTo || '';
  const heroPattern = siteConfig.branding.heroPattern || 'none';
  const hasCustomGradient = heroBgFrom && heroBgTo && heroBgFrom !== '' && heroBgTo !== '';
  
  // Build gradient style
  const gradientStyle = hasCustomGradient 
    ? { background: `linear-gradient(135deg, ${heroBgFrom} 0%, ${heroBgTo} 100%)` }
    : undefined;

  // Pattern SVG options
  const patterns: Record<string, string> = {
    crosses: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    dots: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
    grid: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.2'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
    diagonal: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.15'%3E%3Cpath d='M0 40L40 0M-10 10L10 -10M30 50L50 30'/%3E%3C/g%3E%3C/svg%3E")`,
    waves: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q25 0, 50 10 T100 10' stroke='%23ffffff' stroke-opacity='0.15' fill='none'/%3E%3C/svg%3E")`,
    hexagons: `url("data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.15'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.35 11-6.35V17.9l-11-6.35L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/svg%3E")`,
    circles: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='12' stroke='%23ffffff' stroke-opacity='0.12' fill='none'/%3E%3C/svg%3E")`,
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // ... (existing logic)
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error?.message || 'Failed to send reset link');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <Header />
      
      <main className="flex-grow flex">
        {/* Left Panel - Branding */}
        <div 
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-900 items-center"
          style={gradientStyle}
        >
          {/* Default Background if no custom gradient */}
          {!hasCustomGradient && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
          )}

          {/* Background Pattern */}
          {heroPattern !== 'none' && patterns[heroPattern] && (
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: patterns[heroPattern],
              }} />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
          
          <div className="relative z-10 flex flex-col justify-center px-16">
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Account Recovery
            </h1>
            
            <p className="text-xl text-zinc-400 mb-8">
              Restore access to your {siteConfig.industry.type} business account.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-300">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-sm">✓</span>
                </div>
                Secure Verification
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-sm">✓</span>
                </div>
                Fast Recovery
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-sm">✓</span>
                </div>
                24/7 Support
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Reset Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="text-2xl">🌐</span>
                <span className="text-2xl font-bold text-white">{siteConfig.company.name}</span>
              </Link>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white">Reset your password</h2>
            </div>

            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">✓</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Check your email</h3>
                <p className="text-zinc-400 mb-8">
                  We've sent a password reset link to your email address.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <span className="text-red-400">⚠</span>
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-semibold hover:from-sky-500 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-center text-zinc-400 text-sm">
                  Remember your password?{' '}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}