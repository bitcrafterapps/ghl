"use client";

import { Fragment, useEffect, useState } from "react";
import {
  Disclosure,
  Menu,
  Transition,
  DisclosureProps,
} from "@headlessui/react";
import type { MenuProps } from "@headlessui/react";
import type { ElementType } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Search, Bell, DumbbellIcon, FileText, LayoutDashboard, Globe, Phone, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { siteConfig, services } from "@/data/config";
import { formatPhone, formatPhoneLink } from "@/lib/utils";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface DisclosureButtonProps {
  open: boolean;
}

interface MenuItemProps {
  active: boolean;
}

interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
}

interface UserProfile {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

interface User {
  email: string;
  roles: string[];
}

interface HeaderProps {
  userProfile?: UserProfile | null;
  onLogout?: () => void;
}

interface Notification {
  id: number | string;
  title: string;
  description: string;
  time: string;
  timestamp: string;
  isRead: boolean;
}

interface ActivityItem {
  id: string;
  type: "proposal" | "template" | "company" | "user";
  action: "created" | "updated" | "deleted";
  title: string;
  timestamp: string;
  userId: string;
  isRead: boolean;
}

// Function to format the relative time (e.g., "5m ago", "1h ago")
// Works with any timezone - compares UTC milliseconds
function formatRelativeTime(timestamp: string | Date): string {
  // Early validation
  if (!timestamp) {
    return "Unknown time";
  }
  
  // Parse the timestamp - Date constructor handles most formats
  // If it's already a Date, use it; if string, parse it
  let activityTime = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  // Check if the date is valid
  if (isNaN(activityTime.getTime())) {
    return "Unknown time";
  }
  
  // TIMEZONE FIX: PostgreSQL 'timestamp without timezone' is stored as UTC,
  // but pg driver interprets it as local time when creating Date objects.
  // We need to add the timezone offset to correct back to actual UTC.
  const offsetMs = activityTime.getTimezoneOffset() * 60 * 1000;
  activityTime = new Date(activityTime.getTime() + offsetMs);
  
  // Calculate time difference using UTC milliseconds (timezone-agnostic)
  const now = new Date();
  const diffInMs = now.getTime() - activityTime.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  
  // Handle future dates or very recent
  if (diffInSeconds < 0) {
    return "Just now";
  }
  
  // Format relative time
  if (diffInSeconds < 10) {
    return "Just now";
  } else if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  } else if (diffInSeconds < 604800) { // Less than 7 days
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  } else {
    // Format date for older notifications using user's locale
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: now.getFullYear() !== activityTime.getFullYear() ? 'numeric' : undefined
    };
    return activityTime.toLocaleDateString(undefined, options);
  }
}

// Convert ActivityItem to Notification format
function activityToNotification(activity: ActivityItem): Notification {
  // Create description based on activity type
  let description = "";

  switch (activity.type) {
    case "proposal":
      description = `You ${activity.action} a proposal: ${activity.title}`;
      break;
    case "template":
      description = `You ${activity.action} a template: ${activity.title}`;
      break;
    case "company":
      description = `You ${activity.action} company information: ${activity.title}`;
      break;
    case "user":
      description = `You ${activity.action} user data: ${activity.title}`;
      break;
    default:
      description = activity.title;
  }

  // Get the timestamp
  const timestamp = activity.timestamp;
  
  // Format the time
  const formattedTime = formatRelativeTime(timestamp);
  
  return {
    id: activity.id,
    title: `${
      activity.action.charAt(0).toUpperCase() + activity.action.slice(1)
    } ${activity.type}`,
    description,
    timestamp: timestamp,
    time: formattedTime,
    isRead: activity.isRead ?? false, // Use isRead from backend, default to false if undefined
  };
}

export function Header({ userProfile, onLogout }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = !!userProfile;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Note: Read status is now persisted in the backend database, not localStorage

  // Update relative timestamps every minute
  useEffect(() => {
    // Only set up the interval if we have notifications
    if (notifications.length === 0) return;
    
    // Create a reference to the original notification timestamps
    const notificationTimestamps = notifications.map(n => n.timestamp);
    
    // Then update every minute
    const intervalId = setInterval(() => {
      updateNotificationTimes();
    }, 60000); // 60 seconds
    
    return () => clearInterval(intervalId);
  }, [notifications.length]); // Only depend on the length, not the entire array
  
  // Function to update relative timestamps
  const updateNotificationTimes = () => {
    setNotifications(prevNotifications => {
      // Create new notification objects only if the formatted time has changed
      const updatedNotifications = prevNotifications.map(notification => {
        const newTime = formatRelativeTime(notification.timestamp);
        
        if (newTime === notification.time) {
          // No change, return the same object to prevent unnecessary re-renders
          return notification;
        }
        // Time changed, create a new object
        return {
          ...notification,
          time: newTime
        };
      });
      
      // Check if any times actually changed
      const hasChanges = updatedNotifications.some(
        (notification, index) => notification !== prevNotifications[index]
      );
      
      // Only return a new array if something changed
      return hasChanges ? updatedNotifications : prevNotifications;
    });
  };

  // Function to fetch notifications that can be called from anywhere
  const fetchNotifications = async () => {
    if (!isAuthenticated || !userProfile?.id) return Promise.resolve();
    
    setIsLoadingNotifications(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return Promise.resolve();

      // Fetch the 4 most recent activities for the current user
      const queryParams = new URLSearchParams({
        page: "1",
        limit: "4",
        userId: userProfile.id as string,
        timestamp: Date.now().toString(), // Add timestamp to prevent caching
        cacheBuster: Math.random().toString() // Add additional cache buster
      });

      const response = await fetch(
        `/api/v1/dashboard/recent-changes?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          // Add cache control to prevent caching
          cache: 'no-store',
        }
      );

      if (!response.ok) throw new Error("Failed to fetch activities");

      const data = await response.json();
      
      if (!data.activities || !Array.isArray(data.activities)) {
        console.error("Invalid activities data:", data);
        return Promise.resolve();
      }
      
      // Map activity items to notification format - isRead comes from backend
      const notificationItems = data.activities.map(
        (activity: ActivityItem) => {
          // Create notification object (isRead is now set from backend)
          const notification = activityToNotification(activity);
          
          // Calculate the relative time
          notification.time = formatRelativeTime(activity.timestamp);
          
          return notification;
        }
      );

      setNotifications(notificationItems);
      return Promise.resolve();
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      return Promise.reject(error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Fetch notifications on initial load
  useEffect(() => {
    if (isAuthenticated && userProfile?.id) {
      fetchNotifications();
    }
  }, [isAuthenticated, userProfile?.id]);

  // Listen for real-time notifications via WebSocket
  useSocket({
    onNotification: (newActivity: ActivityItem) => {
      // Check if we already have this notification to avoid duplicates
      setNotifications(prev => {
        if (prev.some(n => n.id === newActivity.id)) return prev;
        
        const notification = activityToNotification(newActivity);
        notification.time = formatRelativeTime(newActivity.timestamp);
        
        return [notification, ...prev];
      });
    }
  });

  const markAsRead = async (id: number | string) => {
    // Update state optimistically
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
    
    // Persist to backend
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`/api/v1/dashboard/notifications/${id}/read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async (e?: React.MouseEvent) => {
    // Prevent the dropdown from closing when clicking the button
    if (e) {
      e.stopPropagation();
    }
    
    // Update state optimistically
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
    
    // Persist to backend
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`/api/v1/dashboard/notifications/read-all`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b shadow-lg"
      style={{
        background: 'var(--header-bg)',
        borderColor: 'var(--header-border)',
        color: 'var(--header-text)',
      }}
    >
      <div className="w-full px-4">
        <div className="relative flex h-16 items-center">
          {/* Left side - Logo (always docked left) */}
          <div className="flex items-center flex-shrink-0">
            {/* Mobile menu button - only show when not authenticated */}
            {!isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden mr-2 inline-flex items-center justify-center p-2 rounded-md text-[--header-text-secondary] hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            )}
            <Link
              href={isAuthenticated ? "/dashboard" : "/"}
              className="font-bold text-xl flex items-center gap-2 hover:text-white transition-colors"
            >
              {siteConfig.branding?.logoUrl && !siteConfig.branding.logoUrl.startsWith('{{') ? (
                 <img 
                   src={siteConfig.branding.logoUrl} 
                   alt={siteConfig.company?.name || 'Company Logo'} 
                   className="h-10 w-auto mr-2 object-contain"
                 />
              ) : (
                 <span className="text-3xl sm:text-5xl">{siteConfig.branding?.icon && !siteConfig.branding.icon.startsWith('{{') ? siteConfig.branding.icon : '🔧'}</span>
              )}
              <div className="flex flex-col -space-y-1">
                <span className="text-lg sm:text-xl font-bold text-white leading-none">{siteConfig.company?.name && !siteConfig.company.name.startsWith('{{') ? siteConfig.company.name : 'Company Name'}</span>
                <span className="text-[10px] text-[--header-text-secondary] hidden sm:block">{siteConfig.branding?.tagline && !siteConfig.branding.tagline.startsWith('{{') ? siteConfig.branding.tagline : 'Your tagline here'}</span>
              </div>
            </Link>
          </div>

          {/* Center Navigation - Only show when not authenticated (desktop) */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-1">
              <Link
                href="/"
                className={classNames(
                  pathname === "/" 
                    ? "text-white bg-white/10" 
                    : "text-zinc-300 hover:text-white hover:bg-white/5",
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                )}
              >
                Home
              </Link>
              {/* Services Dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button
                  className={classNames(
                    pathname?.startsWith("/services") 
                      ? "text-white bg-white/10" 
                      : "text-zinc-300 hover:text-white hover:bg-white/5",
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                  )}
                >
                  Services
                  <ChevronDown className="h-4 w-4" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-0 z-50 mt-2 w-64 origin-top-left rounded-xl bg-gray-900 border border-gray-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                    <div className="py-1">
                      {services.slice(0, 8).map((service: any) => (
                        <Menu.Item key={service.slug}>
                          {({ active }) => (
                            <Link
                              href={`/services/${service.slug}`}
                              className={classNames(
                                active ? 'bg-white/10 text-white' : 'text-zinc-300',
                                'block px-4 py-2.5 text-sm transition-colors'
                              )}
                            >
                              {service.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                      {services.length > 0 && (
                        <div className="border-t border-gray-800 mt-1 pt-1">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/services"
                                className={classNames(
                                  active ? 'bg-white/10 text-white' : 'text-primary',
                                  'block px-4 py-2.5 text-sm font-medium transition-colors'
                                )}
                              >
                                View All Services →
                              </Link>
                            )}
                          </Menu.Item>
                        </div>
                      )}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
              <Link
                href="/gallery"
                className={classNames(
                  pathname === "/gallery" 
                    ? "text-white bg-white/10" 
                    : "text-zinc-300 hover:text-white hover:bg-white/5",
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                )}
              >
                Gallery
              </Link>
              <Link
                href="/service-areas"
                className={classNames(
                  pathname === "/service-areas" 
                    ? "text-white bg-white/10" 
                    : "text-zinc-300 hover:text-white hover:bg-white/5",
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                )}
              >
                Service Areas
              </Link>
              <Link
                href="/about"
                className={classNames(
                  pathname === "/about" 
                    ? "text-white bg-white/10" 
                    : "text-zinc-300 hover:text-white hover:bg-white/5",
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                )}
              >
                About
              </Link>
              <Link
                href="/reviews"
                className={classNames(
                  pathname === "/reviews" 
                    ? "text-white bg-white/10" 
                    : "text-zinc-300 hover:text-white hover:bg-white/5",
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                )}
              >
                Reviews
              </Link>
              <Link
                href="/contact"
                className={classNames(
                  pathname === "/contact" 
                    ? "text-white bg-white/10" 
                    : "text-zinc-300 hover:text-white hover:bg-white/5",
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                )}
              >
                Contact
              </Link>
            </div>
          )}

          {/* Right side - notifications and user menu (always dock right) */}
          <div className="flex-1 flex items-center justify-end gap-4">
            {isAuthenticated && (
              <Menu as={Fragment}>
                <div className="relative hidden sm:block">
                  <Menu.Button 
                    className="relative flex rounded-full bg-[#2A2A2A] p-2 text-sm focus:outline-none focus:ring-2 accent-ring focus:ring-offset-2 focus:ring-offset-[#0A0A0A]"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View notifications</span>
                    <Bell
                      className={classNames(
                        unreadCount > 0 ? "text-white" : "text-[#A1A1A1]",
                        "h-5 w-5"
                      )}
                    />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full accent-bg text-[10px] font-medium text-white flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-[100] mt-2 w-80 origin-top-right rounded-md bg-[#2A2A2A] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-2 border-b border-[#3A3A3A] flex items-center justify-between">
                        <h3 className="text-sm font-medium text-white">
                          Notifications
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Just fetch notifications without chaining updateNotificationTimes
                              // The timestamps will already be fresh from the server
                              fetchNotifications();
                            }}
                            className="text-xs accent-text hover:text-white transition-colors"
                            title="Refresh notifications"
                          >
                            Refresh
                          </button>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs accent-text hover:text-white transition-colors"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {isLoadingNotifications ? (
                          <div className="px-4 py-3 text-sm text-[#A1A1A1] text-center flex justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 accent-border"></div>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-[#A1A1A1] text-center">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <Menu.Item key={notification.id}>
                              {({ active }: MenuItemProps) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className={classNames(
                                    active ? "bg-[#3A3A3A]" : "",
                                    notification.isRead ? "opacity-75" : "",
                                    "w-full px-4 py-3 flex flex-col items-start gap-1 border-b border-[#3A3A3A] last:border-0"
                                  )}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="text-sm font-medium text-white flex items-center gap-2">
                                      {notification.title}
                                      {!notification.isRead && (
                                        <span className="w-2 h-2 rounded-full accent-bg" />
                                      )}
                                    </span>
                                    <span className="text-xs text-[#A1A1A1]">
                                      {notification.time}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#A1A1A1] text-left">
                                    {notification.description}
                                  </p>
                                </button>
                              )}
                            </Menu.Item>
                          ))
                        )}
                      </div>
                    </Menu.Items>
                  </Transition>
                </div>
              </Menu>
            )}

            {isAuthenticated ? (
              <Menu as={Fragment}>
                <div className="relative ml-3 hidden sm:block">
                  <Menu.Button className="relative flex rounded-full bg-[#2A2A2A] text-sm focus:outline-none focus:ring-2 accent-ring focus:ring-offset-2 focus:ring-offset-[#1C1C1C]">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-white overflow-hidden">
                      {userProfile?.firstName ? (
                        <span className="text-sm font-medium">
                          {`${userProfile.firstName[0]}${userProfile.lastName?.[0] || ''}`}
                        </span>
                      ) : (
                        <UserCircleIcon className="h-5 w-5" />
                      )}
                    </div>
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-[100] mt-72 w-56 origin-top-right rounded-md bg-[#2A2A2A] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-3">
                      <div className="flex justify-center mb-2">
                        <div className="h-16 w-16 rounded-full bg-[#3A3A3A] flex items-center justify-center text-[#A1A1A1]">
                          {userProfile?.firstName ? (
                            <span className="text-xl font-medium">
                              {`${userProfile.firstName[0]}${userProfile.lastName?.[0] || ''}`}
                            </span>
                          ) : (
                            <UserCircleIcon className="h-12 w-12" />
                          )}
                        </div>
                      </div>
                      <p className="text-center text-base font-medium text-white">
                        {userProfile?.firstName
                          ? `${userProfile.firstName} ${userProfile.lastName || ''}`
                          : userProfile?.email}
                      </p>
                      <p className="text-center text-sm text-[#A1A1A1] mt-1">
                        {userProfile?.roles?.map((role) => role).join(", ")}
                      </p>
                    </div>
                    <div className="border-t border-[#3A3A3A]">
                      <Menu.Item>
                        {({ active }: MenuItemProps) => (
                          <Link
                            href="/profile"
                            className={classNames(
                              active ? "bg-[#3A3A3A]" : "",
                              pathname === "/profile"
                                ? "text-white"
                                : "text-[#A1A1A1]",
                              "flex px-4 py-2 text-sm items-center hover:text-white transition-colors"
                            )}
                          >
                            <UserCircleIcon
                              className="mr-3 h-5 w-5 text-[#A1A1A1]"
                              aria-hidden="true"
                            />
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <div className="border-t border-[#3A3A3A]">
                        <Menu.Item>
                          {({ active }: MenuItemProps) => (
                            <button
                              onClick={onLogout}
                              className={classNames(
                                active ? "bg-[#3A3A3A]" : "",
                                "flex w-full px-4 py-2 text-sm text-[#A1A1A1] items-center hover:text-white transition-colors"
                              )}
                            >
                              <ArrowRightOnRectangleIcon
                                className="mr-3 h-5 w-5 text-[#A1A1A1]"
                                aria-hidden="true"
                              />
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <a 
                  href={formatPhoneLink(siteConfig?.company?.phone || '')}
                  className="hidden sm:flex items-center gap-2 text-sm text-white hover:text-white/80 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">{formatPhone(siteConfig?.company?.phone || '')}</span>
                </a>
                <Link 
                  href="/free-estimate" 
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(to right, #0ea5e9, #3b82f6)',
                    color: '#ffffff',
                  }}
                >
                  Free Estimate
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {!isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden">
          <div 
            className="space-y-1 px-4 pb-4 pt-2 border-t border-white/10"
            style={{
              background: 'var(--header-bg)',
            }}
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={classNames(
                pathname === "/" ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white",
                "block rounded-lg px-3 py-2.5 text-base font-medium transition-colors"
              )}
            >
              Home
            </Link>
            {/* Mobile Services Accordion */}
            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button className={classNames(
                    pathname?.startsWith("/services") ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white",
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium transition-colors"
                  )}>
                    Services
                    <ChevronDown className={classNames(
                      open ? "rotate-180" : "",
                      "h-5 w-5 transition-transform"
                    )} />
                  </Disclosure.Button>
                  <Disclosure.Panel className="pl-4 space-y-1">
                    {services.slice(0, 8).map((service: any) => (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        {service.name}
                      </Link>
                    ))}
                    <Link
                      href="/services"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-primary font-medium hover:bg-white/5 transition-colors"
                    >
                      View All Services →
                    </Link>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
            <Link
              href="/gallery"
              onClick={() => setMobileMenuOpen(false)}
              className={classNames(
                pathname === "/gallery" ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white",
                "block rounded-lg px-3 py-2.5 text-base font-medium transition-colors"
              )}
            >
              Gallery
            </Link>
            <Link
              href="/service-areas"
              onClick={() => setMobileMenuOpen(false)}
              className={classNames(
                pathname === "/service-areas" ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white",
                "block rounded-lg px-3 py-2.5 text-base font-medium transition-colors"
              )}
            >
              Service Areas
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={classNames(
                pathname === "/about" ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white",
                "block rounded-lg px-3 py-2.5 text-base font-medium transition-colors"
              )}
            >
              About
            </Link>
            <Link
              href="/reviews"
              onClick={() => setMobileMenuOpen(false)}
              className={classNames(
                pathname === "/reviews" ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white",
                "block rounded-lg px-3 py-2.5 text-base font-medium transition-colors"
              )}
            >
              Reviews
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={classNames(
                pathname === "/contact" ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white",
                "block rounded-lg px-3 py-2.5 text-base font-medium transition-colors"
              )}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
