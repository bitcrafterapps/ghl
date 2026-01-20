import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';

interface LayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  noPadding?: boolean;
}

export function Layout({ children, isAuthenticated, isAdmin, noPadding }: LayoutProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { userProfile, refreshProfile, clearProfile } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Refresh profile when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshProfile();
    }
    
    // Initialize sidebar state from local storage
    const stored = localStorage.getItem('sidebarCollapsed');
    if (stored !== null) {
      setIsSidebarCollapsed(stored === 'true');
    }
    setIsLoaded(true);
  }, [isAuthenticated, refreshProfile]);

  const handleLogout = (isMobileLogout = false) => {
    localStorage.removeItem('token');
    clearProfile(); // Clear cached profile via AuthContext
    if (isMobileLogout) {
      // Force a page refresh for mobile logout
      window.location.href = '/login';
    } else {
      // Use router for smooth desktop logout
      router.push('/login');
    }
  };

  // Persist sidebar state
  // Persist sidebar state
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.toString());
    }
  }, [isSidebarCollapsed, isLoaded]);

  // Handle initial screen size and resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 420) {
        setIsMobileMenuOpen(false);
      }
      if (width < 1024) {
        setIsSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#1C1C1C]">
      <Header userProfile={userProfile} onLogout={() => handleLogout(false)} />
      <div className="flex-1 flex relative pt-16">
        {/* Mobile menu button - only show below 420px */}
        {isAuthenticated && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden fixed right-4 top-4 z-50 p-2 rounded-md bg-[#2A2A2A] text-[#A1A1A1] hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Mobile Sidebar - only show below 420px */}
        {isAuthenticated && (
          <div 
            className={cn(
              "fixed inset-x-0 top-16 sm:hidden transition-all duration-300 ease-in-out bg-[#1C1C1C] border-b border-[#2A2A2A]",
              isMobileMenuOpen 
                ? "translate-y-0 opacity-100" 
                : "-translate-y-full opacity-0 pointer-events-none"
            )}
          >
            <Sidebar 
              isAuthenticated={isAuthenticated} 
              isAdmin={isAdmin}
              isCollapsed={false}
              onCollapse={setIsSidebarCollapsed}
              isMobile={true}
              onMobileClose={() => setIsMobileMenuOpen(false)}
              onLogout={() => handleLogout(true)}
              userProfile={userProfile}
            />
          </div>
        )}

        {/* Desktop Sidebar - show above 420px */}
        {isAuthenticated && (
          <div className="hidden sm:block">
            <Sidebar 
              isAuthenticated={isAuthenticated} 
              isAdmin={isAdmin}
              isCollapsed={isSidebarCollapsed}
              onCollapse={setIsSidebarCollapsed}
              isMobile={false}
              userProfile={userProfile}
            />
          </div>
        )}

        <main className={cn(
          "flex-1 h-[calc(100vh-4rem)] overflow-y-auto main-content",
          isAuthenticated && [
            "mt-0", // No margin on mobile
            isSidebarCollapsed 
              ? "sm:ml-16" // Collapsed sidebar margin
              : "sm:ml-16 lg:ml-64", // Expanded sidebar margin
            "sm:mt-0" // No top margin on desktop
          ]
        )}>
          <div className={cn("h-full", !noPadding && "px-4 sm:px-6 lg:px-8 pt-4 sm:pt-0")}>
            {children}
          </div>
        </main>
      </div>
      <Toaster />
      <ImpersonationBanner />
    </div>
  );
}