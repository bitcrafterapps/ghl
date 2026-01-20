import Link from 'next/link';
import { PublicLayout } from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 gap-8">
        <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white text-center">
          Site Wizard
        </h1>
        <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-blue-700 hover:bg-gray-100 font-bold border-none">
          <Link href="/login">
            Login
          </Link>
        </Button>
      </div>
    </PublicLayout>
  );
}