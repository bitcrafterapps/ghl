'use client';

import { Header } from './Header';
import { PublicFooter } from './public/PublicFooter';
import { FloatingElements } from './public/FloatingElements';

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * PublicLayout is used for public-facing pages (Home, Services, Gallery, etc.)
 * It includes the Header (with public navigation), PublicFooter, and FloatingElements.
 * 
 * For authenticated pages, use the Layout component instead which includes the Sidebar.
 */
export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">{children}</main>
      <PublicFooter />
      <FloatingElements />
    </div>
  );
}
