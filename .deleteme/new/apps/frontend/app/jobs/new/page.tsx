'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useJobs } from '@/hooks/useJobs';
import { JobForm } from '@/components/jobs/JobForm';
import type { CreateJobDTO, JobStatus } from '@/types/jobs';
import { ArrowLeft, FolderKanban, Loader2 } from 'lucide-react';

function NewJobContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createJob } = useJobs();
  
  const initialStatus = searchParams.get('status') as JobStatus | null;
  const contactId = searchParams.get('contactId');
  
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (data: CreateJobDTO) => {
    setLoading(true);
    try {
      const newJob = await createJob(data);
      if (newJob) {
        router.push(`/jobs/${newJob.id}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    router.push('/jobs');
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/jobs"
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                <FolderKanban className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">New Job</h1>
                <p className="text-sm text-gray-500">Create a new work order</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <JobForm
          initialStatus={initialStatus || undefined}
          contactId={contactId || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={loading}
        />
      </div>
    </div>
  );
}

export default function NewJobPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    }>
      <NewJobContent />
    </Suspense>
  );
}
