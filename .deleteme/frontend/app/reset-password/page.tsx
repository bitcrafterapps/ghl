'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Lock, ArrowRight, Loader2, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

const API_URL = getApiUrl();

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error?.message || 'Failed to reset password. The link may have expired.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Invalid Reset Link</h3>
        <p className="text-zinc-400 mb-8">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          Request a new reset link
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Password Reset Successfully!</h3>
        <p className="text-zinc-400 mb-8">
          Your password has been changed. You can now log in with your new password.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-semibold hover:from-sky-500 hover:to-blue-500 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <span className="text-red-400">⚠</span>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-zinc-500 mt-1">Must be at least 8 characters</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
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
            Resetting...
          </>
        ) : (
          <>
            Reset Password
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <Header />
      
      <main className="flex-grow flex">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-600/20 via-blue-600/10 to-transparent" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col justify-center px-16">
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              [Reset Headline]
            </h1>
            
            <p className="text-xl text-zinc-400 mb-8">
              [Reset Description]
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-300">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-sm">✓</span>
                </div>
                [Reset Requirement 1]
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-sm">✓</span>
                </div>
                [Reset Requirement 2]
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-sm">✓</span>
                </div>
                [Reset Requirement 3]
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
                <span className="text-2xl font-bold text-white">[MY_APP]</span>
              </Link>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white">Set new password</h2>
            </div>

            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            }>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
