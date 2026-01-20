'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import { 
  Activity, 
  Server, 
  Database, 
  Globe, 
  Wifi, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Cpu,
  HardDrive,
  ExternalLink,
  Zap,
  FileCode,
  MemoryStick,
  ChevronDown,
  ChevronRight,
  Info
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getApiUrl } from '@/lib/api';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'checking';
  responseTime?: number;
  lastChecked: Date;
  details?: string;
  error?: string;
  endpoint?: string;
  diagnostics?: {
    suggestion: string;
    commands?: string[];
    documentation?: string;
  };
}

interface SystemMetrics {
  uptime?: string;
  memoryUsage?: { used: number; total: number; percentage: number };
  cpuUsage?: number;
  nodeVersion?: string;
  environment?: string;
}

export default function SiteStatusPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastFullCheck, setLastFullCheck] = useState<Date>(new Date());
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({});

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Frontend', status: 'checking', lastChecked: new Date() },
    { name: 'Backend API', status: 'checking', lastChecked: new Date() },
    { name: 'Database', status: 'checking', lastChecked: new Date() },
    { name: 'Redis Cache', status: 'checking', lastChecked: new Date() },
    { name: 'WebSocket', status: 'checking', lastChecked: new Date() },
  ]);

  const [metrics, setMetrics] = useState<SystemMetrics>({});

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const apiUrl = getApiUrl();
      fetch(`${apiUrl}/api/v1/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to authenticate');
          return res.json();
        })
        .then((data) => {
          setUserProfile(data);
          if (!data.roles?.includes('Site Admin')) {
            router.push('/dashboard');
            return;
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error:', error);
          router.push('/login');
        });
    } else {
      router.push('/login');
    }
  }, [router]);

  // Check all services
  const checkServices = useCallback(async () => {
    setIsRefreshing(true);
    const apiUrl = getApiUrl();
    const token = localStorage.getItem('token');
    const newServices: ServiceStatus[] = [];

    // Check Frontend
    const frontendStart = performance.now();
    try {
      const res = await fetch(window.location.origin, { method: 'HEAD' });
      const responseTime = Math.round(performance.now() - frontendStart);
      newServices.push({
        name: 'Frontend',
        status: res.ok ? 'operational' : 'degraded',
        responseTime,
        lastChecked: new Date(),
        details: `Next.js application responding`,
        endpoint: window.location.origin,
      });
    } catch (error: any) {
      newServices.push({
        name: 'Frontend',
        status: 'down',
        lastChecked: new Date(),
        error: error.message,
        endpoint: window.location.origin,
      });
    }

    // Check Backend API
    const backendStart = performance.now();
    try {
      const res = await fetch(`${apiUrl}/api/v1/health`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const responseTime = Math.round(performance.now() - backendStart);
      const data = await res.json().catch(() => ({}));
      
      newServices.push({
        name: 'Backend API',
        status: res.ok ? 'operational' : 'degraded',
        responseTime,
        lastChecked: new Date(),
        details: data.message || 'API responding normally',
        endpoint: `${apiUrl}/api/v1/health`,
      });

      // Extract metrics from health response
      if (data.system) {
        setMetrics({
          uptime: data.system.uptime,
          memoryUsage: data.system.memory,
          cpuUsage: data.system.cpu,
          nodeVersion: data.system.nodeVersion,
          environment: data.system.environment,
        });
      }
    } catch (error: any) {
      newServices.push({
        name: 'Backend API',
        status: 'down',
        lastChecked: new Date(),
        error: error.message || 'Failed to connect',
        endpoint: `${apiUrl}/api/v1/health`,
      });
    }

    // Check Database
    const dbStart = performance.now();
    try {
      const res = await fetch(`${apiUrl}/api/v1/health/db`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const responseTime = Math.round(performance.now() - dbStart);
      const data = await res.json().catch(() => ({}));
      
      newServices.push({
        name: 'Database',
        status: res.ok && data.status === 'connected' ? 'operational' : 'degraded',
        responseTime,
        lastChecked: new Date(),
        details: data.type ? `${data.type} - ${data.status || 'unknown'}` : 'PostgreSQL',
        endpoint: `${apiUrl}/api/v1/health/db`,
      });
    } catch (error: any) {
      newServices.push({
        name: 'Database',
        status: 'down',
        lastChecked: new Date(),
        error: error.message || 'Connection failed',
        endpoint: `${apiUrl}/api/v1/health/db`,
      });
    }

    // Check Redis
    const redisStart = performance.now();
    try {
      const res = await fetch(`${apiUrl}/api/v1/health/redis`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const responseTime = Math.round(performance.now() - redisStart);
      const data = await res.json().catch(() => ({}));
      
      newServices.push({
        name: 'Redis Cache',
        status: res.ok && data.status === 'connected' ? 'operational' : 'degraded',
        responseTime,
        lastChecked: new Date(),
        details: data.status || 'Cache service',
        endpoint: `${apiUrl}/api/v1/health/redis`,
      });
    } catch (error: any) {
      newServices.push({
        name: 'Redis Cache',
        status: 'down',
        lastChecked: new Date(),
        error: error.message || 'Connection failed',
        endpoint: `${apiUrl}/api/v1/health/redis`,
      });
    }

    // Check WebSocket (using Socket.IO since backend uses socket.io)
    const wsStart = performance.now();
    try {
      // Dynamically import socket.io-client to avoid SSR issues
      const { io } = await import('socket.io-client');
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 5000);

        // Create a temporary socket connection for health check
        const testSocket = io(apiUrl, {
          auth: { token },
          transports: ['websocket'],
          timeout: 5000,
          autoConnect: true,
        });

        testSocket.on('connect', () => {
          clearTimeout(timeout);
          testSocket.disconnect();
          resolve();
        });

        testSocket.on('connect_error', (err: Error) => {
          clearTimeout(timeout);
          testSocket.disconnect();
          reject(new Error(err.message || 'Socket.IO connection error'));
        });
      });

      const responseTime = Math.round(performance.now() - wsStart);
      newServices.push({
        name: 'WebSocket',
        status: 'operational',
        responseTime,
        lastChecked: new Date(),
        details: 'Socket.IO real-time connection available',
        endpoint: `${apiUrl} (Socket.IO)`,
      });
    } catch (error: any) {
      const responseTime = Math.round(performance.now() - wsStart);
      newServices.push({
        name: 'WebSocket',
        status: 'degraded',
        lastChecked: new Date(),
        responseTime,
        details: error.message || 'Socket.IO connection failed',
        error: error.message,
        endpoint: `${apiUrl} (Socket.IO)`,
      });
    }

    setServices(newServices);
    setLastFullCheck(new Date());
    setIsRefreshing(false);
  }, []);

  // Initial check
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      checkServices();
    }
  }, [isLoading, isAuthenticated, checkServices]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && !isLoading && isAuthenticated) {
      const interval = setInterval(checkServices, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isLoading, isAuthenticated, checkServices]);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      case 'degraded':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
      case 'down':
        return 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400';
      case 'checking':
        return 'bg-gray-500/10 border-gray-500/20 text-gray-600 dark:text-gray-400';
    }
  };

  const getOverallStatus = () => {
    if (services.some(s => s.status === 'checking')) return 'checking';
    if (services.some(s => s.status === 'down')) return 'down';
    if (services.some(s => s.status === 'degraded')) return 'degraded';
    return 'operational';
  };

  const getOverallStatusText = (): string => {
    const status = getOverallStatus();
    switch (status) {
      case 'operational':
        return 'All Systems Operational';
      case 'degraded':
        return 'Some Systems Degraded';
      case 'down':
        return 'System Outage Detected';
      case 'checking':
        return 'Checking Status...';
      default:
        return 'Unknown Status';
    }
  };

  const formatUptime = (uptimeSeconds?: string) => {
    if (!uptimeSeconds) return 'N/A';
    const seconds = parseInt(uptimeSeconds);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1C1C1C]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#205ab2]"></div>
      </div>
    );
  }

  const apiUrl = getApiUrl();

  return (
    <Layout isAuthenticated={isAuthenticated} noPadding>
      <SubHeader 
        icon={Activity}
        title="Site Status"
        subtitle="Monitor system health and service availability"
        actions={
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#205ab2] focus:ring-[#205ab2]"
              />
              Auto-refresh (30s)
            </label>
            <button
              onClick={checkServices}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-opacity disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Status Banner */}
        <div className={`rounded-lg p-4 mb-6 border ${getStatusColor(getOverallStatus())}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(getOverallStatus())}
              <span className="text-lg font-semibold">{getOverallStatusText()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-75">
              <Clock className="h-4 w-4" />
              Last checked: {lastFullCheck.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Service Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Service Status Cards */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Server className="h-5 w-5" />
              Service Status
            </h2>
            
            {services.map((service) => {
              const isExpanded = expandedServices[service.name] || false;
              const hasIssue = service.status === 'degraded' || service.status === 'down';
              
              return (
                <div
                  key={service.name}
                  className="bg-white dark:bg-[#25262b] rounded-lg border border-gray-200 dark:border-[#2e2f33] overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2e2f33] transition-colors"
                    onClick={() => setExpandedServices(prev => ({ ...prev, [service.name]: !prev[service.name] }))}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                          {service.endpoint && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {service.endpoint}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {service.responseTime !== undefined && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {service.responseTime}ms
                            </div>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {service.lastChecked.toLocaleTimeString()}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-[#3A3A3A] bg-gray-50 dark:bg-[#1C1C1C]">
                      <div className="pt-4 space-y-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {service.details}
                        </div>
                        {hasIssue && service.error && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex items-start gap-2">
                              <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-red-700 dark:text-red-400">
                                {service.error}
                              </div>
                            </div>
                          </div>
                        )}
                        {service.diagnostics && (
                          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-amber-700 dark:text-amber-400">
                                <strong>Suggestion:</strong> {service.diagnostics.suggestion}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* System Metrics */}
            <div className="bg-white dark:bg-[#25262b] rounded-lg p-4 border border-gray-200 dark:border-[#2e2f33]">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                System Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatUptime(metrics.uptime)}
                  </span>
                </div>
                {metrics.memoryUsage && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Memory</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {metrics.memoryUsage.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-[#3A3A3A] rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${metrics.memoryUsage.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Node Version</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metrics.nodeVersion || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Environment</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metrics.environment || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* API Links */}
            <div className="bg-white dark:bg-[#25262b] rounded-lg p-4 border border-gray-200 dark:border-[#2e2f33]">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Quick Links
              </h3>
              <div className="space-y-2">
                <a
                  href={`${apiUrl}/api/v1/health`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <div className="flex-1">
                    <div className="font-medium">Health Endpoint</div>
                    <div className="text-xs text-gray-500">/api/v1/health</div>
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href={`${apiUrl}/api-docs`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <div className="flex-1">
                    <div className="font-medium">API Documentation</div>
                    <div className="text-xs text-gray-500">/api-docs</div>
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Troubleshooting Tips */}
            <div className="bg-white dark:bg-[#25262b] rounded-lg p-4 border border-gray-200 dark:border-[#2e2f33]">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Info className="h-5 w-5" />
                Troubleshooting
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex gap-2">
                  <span className="text-emerald-500">•</span>
                  <p><strong>Frontend down:</strong> Check if Next.js server is running</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-500">•</span>
                  <p><strong>Backend down:</strong> Verify API server is running on port 3001</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-500">•</span>
                  <p><strong>Database issues:</strong> Check PostgreSQL connection string</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-500">•</span>
                  <p><strong>Redis issues:</strong> Ensure Redis server is accessible</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

