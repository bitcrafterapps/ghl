'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
        <span className="text-4xl">?</span>
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
      <p className="text-zinc-400 max-w-md mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
