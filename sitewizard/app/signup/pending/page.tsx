'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';

export default function PendingApprovalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[#1C1C1C]">
      {/* Back to Home Link */}
      <div className="pt-8 px-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center bg-[#205ab2]/10 p-5 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-[#205ab2]" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">Registration Successful</h1>
          
          <div className="bg-[#25262b] rounded-lg p-6 shadow-lg border border-[#2e2f33] mb-6">
            <p className="text-[#A1A1A1] mb-4">
              Thank you for signing up! Your account is currently pending approval from our administrators.
            </p>
            
            <p className="text-[#A1A1A1] mb-6">
              We'll send you an email notification once your account has been approved.
            </p>
            
            <div className="p-4 bg-[#2A2A2A] rounded-lg flex items-center">
              <Mail className="h-5 w-5 text-[#205ab2] mr-3 flex-shrink-0" />
              <p className="text-sm text-white">
                Please check your email inbox for further instructions.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/" 
              className="px-6 py-2 border border-[#3A3A3A] rounded-md text-[#A1A1A1] hover:bg-[#2A2A2A] hover:text-white transition-colors w-full sm:w-auto"
            >
              Return to Homepage
            </Link>
            
            <Link 
              href="/login" 
              className="px-6 py-2 bg-[#205ab2] text-white rounded-md hover:bg-[#205ab2] transition-colors w-full sm:w-auto"
            >
              Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 