import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  LogOut,
  Files,
  BookOpen,
  Newspaper,
  Bookmark,
  List,
  FolderKanban,
  Settings,
  Activity,
  Coins,
  Mail,
  ClipboardList,
  Image,
  Star,
  Hammer
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfile {
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  companyId?: number | null;
}

interface SidebarProps {
  isAuthenticated: boolean;
  isAdmin?: boolean;
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
  onLogout?: () => void;
  userProfile?: UserProfile | null;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  mobileOnly?: boolean;
}

export function Sidebar({ 
  isAuthenticated, 
  isAdmin, 
  isCollapsed, 
  onCollapse,
  isMobile,
  onMobileClose,
  onLogout,
  userProfile
}: SidebarProps) {
  const pathname = usePathname();
  // State for tooltip with delay
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle tooltip display with delay
  const showTooltip = (name: string) => {
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
    }
    tooltipTimerRef.current = setTimeout(() => {
      setActiveTooltip(name);
    }, 300); // 300ms delay before showing tooltip
  };

  const hideTooltip = () => {
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    setActiveTooltip(null);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
    };
  }, []);

  // Handle auto-collapse on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && !isMobile) {
        onCollapse(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onCollapse, isMobile]);

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Token Usage', href: '/token-usage', icon: Coins },
  ];

  if (userProfile?.roles?.includes('Site Admin')) {
    navigation.push(
      { name: 'Site Builder', href: '/site-builder', icon: Hammer },
      { name: 'Companies', href: '/companies', icon: Building2 },
      { name: 'Users', href: '/users', icon: Users },
      { name: 'Gallery Items', href: '/gallery-management', icon: Image },
      { name: 'Reviews', href: '/reviews-management', icon: Star },
      { name: 'Site Settings', href: '/site-settings', icon: Settings },
      { name: 'Site Status', href: '/site-status', icon: Activity },
      { name: 'Email Templates', href: '/email-templates', icon: Mail },
      { name: 'Email Logs', href: '/email-logs', icon: FileText },
      { name: 'Release Notes', href: '/release-notes', icon: Newspaper },
      { name: 'Log Viewer', href: '/log-viewer', icon: List }
    );
  } else if (userProfile?.roles?.includes('Admin')) {
    navigation.push(
      { name: 'Companies', href: '/companies', icon: Building2 },
      { name: 'Gallery Items', href: '/gallery-management', icon: Image },
      { name: 'Reviews', href: '/reviews-management', icon: Star }
    );
  } else if (userProfile?.companyId) {
    // Regular users with a company can access their company page
    navigation.push(
      { name: 'My Company', href: `/companies/${userProfile.companyId}`, icon: Building2 }
    );
  }

  // Add profile links for mobile view
  if (isMobile) {
    navigation.push(
      { name: 'Your Profile', href: '/profile', icon: UserCircle, mobileOnly: true },
      { name: 'Sign out', href: '#', icon: LogOut, mobileOnly: true }
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleItemClick = (item: NavItem) => {
    if (isMobile) {
      if (item.name === 'Sign out') {
        onLogout?.();
        return;
      }
      onMobileClose?.();
    }
  };

  // Tooltip component
  const Tooltip = ({ name }: { name: string }) => (
    <div className="fixed ml-16 bg-[#333333] text-white px-3 py-2 rounded-md text-sm whitespace-nowrap shadow-lg border border-[#444444] z-[100]">
      {name}
    </div>
  );

  return (
    <aside 
      className={cn(
        "bg-[#1C1C1C] transition-all duration-300 ease-in-out",
        isMobile 
          ? "w-full"
          : "fixed left-0 top-16 bottom-0 z-40 border-r border-[#2A2A2A]",
        !isMobile && (isCollapsed ? "w-16" : "w-16 lg:w-64")
      )}
    >
      <div className={cn(
        "flex flex-col",
        isMobile ? "py-2" : "h-full"
      )}>
        {/* User Profile Info - Only show in mobile */}
        {isMobile && userProfile && (
          <div className="px-4 py-3 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#2A2A2A] flex items-center justify-center text-white">
                {userProfile.firstName ? (
                  <span className="text-sm font-medium">
                    {`${userProfile.firstName[0]}${userProfile.lastName?.[0] || ''}`}
                  </span>
                ) : (
                  <UserCircle className="h-6 w-6" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  {userProfile.firstName 
                    ? `${userProfile.firstName} ${userProfile.lastName || ''}`
                    : userProfile.email}
                </div>
                <div className="text-xs text-[#A1A1A1]">
                  {userProfile.roles?.join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className={cn(
          "flex-1",
          isMobile ? "px-4" : "py-4 overflow-y-auto"
        )}>
          {navigation.map((item) => {
            // Skip mobile-only items in desktop view
            if (!isMobile && item.mobileOnly) return null;

            return (
              <div key={item.name} className="relative">
                <Link
                  href={item.href}
                  prefetch={false}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => isCollapsed && !isMobile ? showTooltip(item.name) : null}
                  onMouseLeave={hideTooltip}
                  onFocus={() => isCollapsed && !isMobile ? showTooltip(item.name) : null}
                  onBlur={hideTooltip}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors",
                    pathname === item.href 
                      ? "accent-bg text-white" 
                      : "text-[#A1A1A1] hover:bg-[#2A2A2A] hover:text-white",
                    isMobile && "justify-start"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {(!isCollapsed || isMobile) && (
                    <span className="text-sm font-medium">
                      {item.name}
                    </span>
                  )}
                  
                  {/* Tooltip - only show when sidebar is collapsed and not on mobile */}
                  {isCollapsed && !isMobile && activeTooltip === item.name && (
                    <Tooltip name={item.name} />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer - Only show on desktop */}
        {!isMobile && (
          <>
            <div className="border-t border-[#2A2A2A] py-4 px-4">
              <div className="flex justify-center items-center text-[#A1A1A1] text-sm">
                {isCollapsed ? 'v1.00.01' : 'Version 1.00.01'}
              </div>
            </div>

            {/* Collapse Button */}
            <button
              onClick={() => onCollapse(!isCollapsed)}
              className="flex items-center justify-center h-12 w-full border-t border-[#2A2A2A] text-[#A1A1A1] hover:bg-[#2A2A2A] hover:text-white transition-colors relative"
              onMouseEnter={() => isCollapsed ? showTooltip('toggle-sidebar') : null}
              onMouseLeave={hideTooltip}
              onFocus={() => isCollapsed ? showTooltip('toggle-sidebar') : null}
              onBlur={hideTooltip}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
              
              {/* Tooltip for collapse button */}
              {isCollapsed && activeTooltip === 'toggle-sidebar' && (
                <Tooltip name="Expand Sidebar" />
              )}
            </button>
          </>
        )}
      </div>
    </aside>
  );
} 