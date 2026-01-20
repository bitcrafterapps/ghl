'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import { Settings, Key, Globe, Save, Eye, EyeOff, ChevronDown, Search, FileText, X, ExternalLink, HelpCircle, CheckCircle2, Copy, CreditCard, ToggleLeft, ToggleRight, Receipt, Filter, Calendar, DollarSign, TrendingUp, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getApiUrl, get, put } from '@/lib/api';



// Tab definitions
const TABS = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
] as const;

// Payment provider info
type PaymentProvider = 'stripe' | 'square' | 'paypal' | 'braintree';
const PAYMENT_PROVIDERS: { id: PaymentProvider; name: string; color: string; description: string; fees: string }[] = [
  { id: 'stripe', name: 'Stripe', color: 'bg-blue-500', description: 'Most popular, excellent developer experience', fees: '2.9% + 30¢' },
  { id: 'square', name: 'Square', color: 'bg-black dark:bg-white', description: 'Great for in-person + online', fees: '2.9% + 30¢' },
  { id: 'paypal', name: 'PayPal', color: 'bg-blue-600', description: 'Widely recognized, buyer protection', fees: '2.89% + 49¢' },
  { id: 'braintree', name: 'Braintree', color: 'bg-teal-500', description: 'PayPal-owned, flexible payments', fees: '2.59% + 49¢' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
];

type TabId = typeof TABS[number]['id'];

export default function SiteSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<TabId>('general');

  // Site settings state
  const [siteSettings, setSiteSettings] = useState({
    siteName: '',
    siteUrl: '',
    contactEmail: '',
    maxProjectsPerUser: 10,
    enableRegistration: true,
    requireEmailVerification: true,
  });

  // SEO settings state
  const [seoSettings, setSeoSettings] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogImage: '',
    twitterHandle: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    enableRobots: true,
    enableSitemap: true,
  });

  // Google OAuth settings state
  const [googleOAuthSettings, setGoogleOAuthSettings] = useState({
    enabled: false,
    clientId: '',
    clientSecret: '',
  });

  // Payment processor settings state
  const [paymentSettings, setPaymentSettings] = useState({
    enabled: false,
    provider: 'stripe' as PaymentProvider,
    testMode: true,
    defaultCurrency: 'USD',
    credentials: {
      // Stripe
      stripePublishableKey: '',
      stripeSecretKey: '',
      stripeWebhookSecret: '',
      // Square
      squareApplicationId: '',
      squareAccessToken: '',
      squareLocationId: '',
      // PayPal
      paypalClientId: '',
      paypalClientSecret: '',
      // Braintree
      braintreeMerchantId: '',
      braintreePublicKey: '',
      braintreePrivateKey: '',
    },
  });

  // Google OAuth setup instructions panel
  const [showGoogleSetupInstructions, setShowGoogleSetupInstructions] = useState(false);

  // Payment provider setup instructions panels
  const [showPaymentSetupInstructions, setShowPaymentSetupInstructions] = useState<PaymentProvider | null>(null);

  // Transactions state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsStats, setTransactionsStats] = useState<any>(null);
  const [transactionsPagination, setTransactionsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [transactionsFilters, setTransactionsFilters] = useState({
    search: '',
    status: 'all',
    provider: 'all',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Authenticate user
        const apiUrl = getApiUrl();
        const profileRes = await fetch(`${apiUrl}/api/v1/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok) throw new Error('Failed to authenticate');
        
        const profileData = await profileRes.json();
        setUserProfile(profileData.data || profileData); // Handle potential wrapped response
        
        if (!profileData.data?.roles?.includes('Site Admin') && !profileData.roles?.includes('Site Admin')) {
          router.push('/dashboard');
          return;
        }
        
        setIsAuthenticated(true);

        // 2. Fetch Site Settings
        const settingsRes = await get('/api/v1/site-settings', token);
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings && Object.keys(settings).length > 0) {
              setSiteSettings({
                  siteName: settings.siteName || '',
                  siteUrl: settings.siteUrl || '',
                  contactEmail: settings.contactEmail || '',
                  maxProjectsPerUser: settings.maxProjectsPerUser || 10,
                  enableRegistration: settings.enableRegistration ?? true,
                  requireEmailVerification: settings.requireEmailVerification ?? true,
              });
              
              if (settings.seo) {
                  setSeoSettings({
                      metaTitle: settings.seo.metaTitle || '',
                      metaDescription: settings.seo.metaDescription || '',
                      metaKeywords: settings.seo.metaKeywords || '',
                      ogImage: settings.seo.ogImage || '',
                      twitterHandle: settings.seo.twitterHandle || '',
                      googleAnalyticsId: settings.seo.googleAnalyticsId || '',
                      googleTagManagerId: settings.seo.googleTagManagerId || '',
                      enableRobots: settings.seo.enableRobots ?? true,
                      enableSitemap: settings.seo.enableSitemap ?? true,
                  });
              }

              if (settings.googleOAuth) {
                  setGoogleOAuthSettings({
                      enabled: settings.googleOAuth.enabled || false,
                      clientId: settings.googleOAuth.clientId || '',
                      clientSecret: settings.googleOAuth.clientSecret || '',
                  });
              }

              if (settings.paymentProcessor) {
                  setPaymentSettings({
                      enabled: settings.paymentProcessor.enabled || false,
                      provider: settings.paymentProcessor.provider || 'stripe',
                      testMode: settings.paymentProcessor.testMode ?? true,
                      defaultCurrency: settings.paymentProcessor.defaultCurrency || 'USD',
                      credentials: {
                          stripePublishableKey: settings.paymentProcessor.credentials?.stripePublishableKey || '',
                          stripeSecretKey: settings.paymentProcessor.credentials?.stripeSecretKey || '',
                          stripeWebhookSecret: settings.paymentProcessor.credentials?.stripeWebhookSecret || '',
                          squareApplicationId: settings.paymentProcessor.credentials?.squareApplicationId || '',
                          squareAccessToken: settings.paymentProcessor.credentials?.squareAccessToken || '',
                          squareLocationId: settings.paymentProcessor.credentials?.squareLocationId || '',
                          paypalClientId: settings.paymentProcessor.credentials?.paypalClientId || '',
                          paypalClientSecret: settings.paymentProcessor.credentials?.paypalClientSecret || '',
                          braintreeMerchantId: settings.paymentProcessor.credentials?.braintreeMerchantId || '',
                          braintreePublicKey: settings.paymentProcessor.credentials?.braintreePublicKey || '',
                          braintreePrivateKey: settings.paymentProcessor.credentials?.braintreePrivateKey || '',
                      },
                  });
              }
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/login');
      }
    };

    fetchData();
  }, [router]);

  const toggleApiKeyVisibility = (key: string) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 12) return '••••••••••••';
    return key.substring(0, 8) + '••••••••••••••••' + key.substring(key.length - 4);
  };



  const saveSettings = async (sectionName: string) => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      try {
          // Construct full settings object
          const payload = {
              ...siteSettings,
              seo: seoSettings,
              googleOAuth: googleOAuthSettings,
              paymentProcessor: paymentSettings
          };

          const res = await put('/api/v1/site-settings', payload, token);
          if (!res.ok) throw new Error('Failed to save settings');
          
          toast({
              title: `${sectionName} Settings Saved`,
              description: 'Settings have been updated successfully.',
          });

      } catch (error) {
          console.error('Error saving settings:', error);
          toast({
              title: 'Error Saving Settings',
              description: 'Failed to update settings. Please try again.',
              variant: 'destructive',
          });
      }
  };

  const handleSaveSiteSettings = () => saveSettings('General');
  const handleSaveSeoSettings = () => saveSettings('SEO');
  const handleSavePaymentSettings = () => saveSettings('Payment');

  // Load transactions
  const loadTransactions = async (page = 1) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setTransactionsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: transactionsPagination.limit.toString(),
        ...(transactionsFilters.search && { search: transactionsFilters.search }),
        ...(transactionsFilters.status !== 'all' && { status: transactionsFilters.status }),
        ...(transactionsFilters.provider !== 'all' && { provider: transactionsFilters.provider }),
        ...(transactionsFilters.dateFrom && { dateFrom: transactionsFilters.dateFrom }),
        ...(transactionsFilters.dateTo && { dateTo: transactionsFilters.dateTo })
      });

      const res = await get(`/api/v1/transactions?${params}`, token);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.data.transactions || []);
        setTransactionsPagination(data.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Load transaction stats
  const loadTransactionStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const params = new URLSearchParams({
        ...(transactionsFilters.dateFrom && { dateFrom: transactionsFilters.dateFrom }),
        ...(transactionsFilters.dateTo && { dateTo: transactionsFilters.dateTo })
      });

      const res = await get(`/api/v1/transactions/stats?${params}`, token);
      if (res.ok) {
        const data = await res.json();
        setTransactionsStats(data.data);
      }
    } catch (error) {
      console.error('Error loading transaction stats:', error);
    }
  };

  // Load transactions when tab is active
  useEffect(() => {
    if (activeTab === 'transactions' && isAuthenticated) {
      loadTransactions();
      loadTransactionStats();
    }
  }, [activeTab, isAuthenticated]);

  // Reload when filters change
  useEffect(() => {
    if (activeTab === 'transactions' && isAuthenticated) {
      loadTransactions(1);
      loadTransactionStats();
    }
  }, [transactionsFilters]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1C1C1C]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#205ab2]"></div>
      </div>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} noPadding>
      <SubHeader 
        icon={Settings}
        title="Site Settings"
        subtitle="Configure platform settings and AI provider integrations"
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-[#3A3A3A] mb-6">
            <nav className="flex gap-1 -mb-px">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 border-b-2 transition-colors font-medium text-sm
                      ${isActive 
                        ? 'border-[#205ab2] text-[#205ab2] dark:text-[#4a8fe7]' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="bg-white dark:bg-[#25262b] rounded-lg p-6 border border-gray-200 dark:border-[#2e2f33]">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="h-6 w-6 accent-text" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">General Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Site URL
                    </label>
                    <input
                      type="text"
                      value={siteSettings.siteUrl}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteUrl: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={siteSettings.contactEmail}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Projects Per User
                    </label>
                    <input
                      type="number"
                      value={siteSettings.maxProjectsPerUser}
                      onChange={(e) => setSiteSettings({ ...siteSettings, maxProjectsPerUser: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="enableRegistration"
                      checked={siteSettings.enableRegistration}
                      onChange={(e) => setSiteSettings({ ...siteSettings, enableRegistration: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[#205ab2] focus:ring-[#205ab2]"
                    />
                    <label htmlFor="enableRegistration" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable User Registration
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="requireEmailVerification"
                      checked={siteSettings.requireEmailVerification}
                      onChange={(e) => setSiteSettings({ ...siteSettings, requireEmailVerification: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[#205ab2] focus:ring-[#205ab2]"
                    />
                    <label htmlFor="requireEmailVerification" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Require Email Verification
                    </label>
                  </div>
                </div>

                {/* Google OAuth Section */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-[#3A3A3A]">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Google OAuth (Google Docs Export)</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Configure Google OAuth to enable direct export to Google Docs.{' '}
                    <button
                      onClick={() => setShowGoogleSetupInstructions(true)}
                      className="inline-flex items-center gap-1 text-[#205ab2] hover:underline font-medium"
                    >
                      <HelpCircle className="w-4 h-4" />
                      View Setup Instructions
                    </button>
                  </p>

                  <div className="p-4 bg-gray-50 dark:bg-[#1C1C1C] rounded-lg border border-gray-200 dark:border-[#3A3A3A]">
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="googleOAuthEnabled"
                        checked={googleOAuthSettings.enabled}
                        onChange={(e) => setGoogleOAuthSettings({ ...googleOAuthSettings, enabled: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 dark:border-[#3A3A3A] text-[#205ab2] focus:ring-[#205ab2]"
                      />
                      <label htmlFor="googleOAuthEnabled" className="font-medium text-gray-900 dark:text-white">
                        Enable Google Docs Integration
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Client ID
                        </label>
                        <input
                          type="text"
                          value={googleOAuthSettings.clientId}
                          onChange={(e) => setGoogleOAuthSettings({ ...googleOAuthSettings, clientId: e.target.value })}
                          placeholder="xxxx.apps.googleusercontent.com"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Client Secret
                        </label>
                        <div className="relative">
                          <input
                            type={showApiKeys.googleSecret ? 'text' : 'password'}
                            value={showApiKeys.googleSecret ? googleOAuthSettings.clientSecret : maskApiKey(googleOAuthSettings.clientSecret)}
                            onChange={(e) => setGoogleOAuthSettings({ ...googleOAuthSettings, clientSecret: e.target.value })}
                            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent font-mono text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => toggleApiKeyVisibility('googleSecret')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {showApiKeys.googleSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      Add <code className="bg-gray-200 dark:bg-[#2A2A2A] px-1 rounded">{typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/google/callback</code> as an authorized redirect URI in your Google Cloud Console.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveSiteSettings}
                    className="flex items-center gap-2 px-4 py-2 accent-bg text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Save className="h-4 w-4" />
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {/* SEO Settings Tab */}
            {activeTab === 'seo' && (
              <div className="bg-white dark:bg-[#25262b] rounded-lg p-6 border border-gray-200 dark:border-[#2e2f33]">
                <div className="flex items-center gap-3 mb-6">
                  <Search className="h-6 w-6 accent-text" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">SEO Settings</h2>
                </div>

                <div className="space-y-6">
                  {/* Meta Tags Section */}
                  <div className="p-4 bg-gray-50 dark:bg-[#1C1C1C] rounded-lg border border-gray-200 dark:border-[#3A3A3A]">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" /> Meta Tags
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={seoSettings.metaTitle}
                          onChange={(e) => setSeoSettings({ ...seoSettings, metaTitle: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {seoSettings.metaTitle.length}/60 characters (recommended max)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Meta Description
                        </label>
                        <textarea
                          value={seoSettings.metaDescription}
                          onChange={(e) => setSeoSettings({ ...seoSettings, metaDescription: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent resize-none"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {seoSettings.metaDescription.length}/160 characters (recommended max)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Meta Keywords
                        </label>
                        <input
                          type="text"
                          value={seoSettings.metaKeywords}
                          onChange={(e) => setSeoSettings({ ...seoSettings, metaKeywords: e.target.value })}
                          placeholder="keyword1, keyword2, keyword3"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media Section */}
                  <div className="p-4 bg-gray-50 dark:bg-[#1C1C1C] rounded-lg border border-gray-200 dark:border-[#3A3A3A]">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Social Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Open Graph Image URL
                        </label>
                        <input
                          type="text"
                          value={seoSettings.ogImage}
                          onChange={(e) => setSeoSettings({ ...seoSettings, ogImage: e.target.value })}
                          placeholder="/og-image.png"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Twitter Handle
                        </label>
                        <input
                          type="text"
                          value={seoSettings.twitterHandle}
                          onChange={(e) => setSeoSettings({ ...seoSettings, twitterHandle: e.target.value })}
                          placeholder="@yourhandle"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Analytics Section */}
                  <div className="p-4 bg-gray-50 dark:bg-[#1C1C1C] rounded-lg border border-gray-200 dark:border-[#3A3A3A]">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Analytics & Tracking</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Google Analytics ID
                        </label>
                        <input
                          type="text"
                          value={seoSettings.googleAnalyticsId}
                          onChange={(e) => setSeoSettings({ ...seoSettings, googleAnalyticsId: e.target.value })}
                          placeholder="G-XXXXXXXXXX"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Google Tag Manager ID
                        </label>
                        <input
                          type="text"
                          value={seoSettings.googleTagManagerId}
                          onChange={(e) => setSeoSettings({ ...seoSettings, googleTagManagerId: e.target.value })}
                          placeholder="GTM-XXXXXXX"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Crawling Section */}
                  <div className="p-4 bg-gray-50 dark:bg-[#1C1C1C] rounded-lg border border-gray-200 dark:border-[#3A3A3A]">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Crawling & Indexing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="enableRobots"
                          checked={seoSettings.enableRobots}
                          onChange={(e) => setSeoSettings({ ...seoSettings, enableRobots: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-[#205ab2] focus:ring-[#205ab2]"
                        />
                        <label htmlFor="enableRobots" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Enable robots.txt
                        </label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="enableSitemap"
                          checked={seoSettings.enableSitemap}
                          onChange={(e) => setSeoSettings({ ...seoSettings, enableSitemap: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-[#205ab2] focus:ring-[#205ab2]"
                        />
                        <label htmlFor="enableSitemap" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Generate sitemap.xml
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveSeoSettings}
                    className="flex items-center gap-2 px-4 py-2 accent-bg text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Save className="h-4 w-4" />
                    Save SEO Settings
                  </button>
                </div>
              </div>
            )}



            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="bg-white dark:bg-[#25262b] rounded-lg p-6 border border-gray-200 dark:border-[#2e2f33]">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="h-6 w-6 accent-text" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Processing</h2>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Configure a payment processor to enable billing and subscription features.
                  Select a provider below and enter your API credentials.
                </p>

                {/* Enable Toggle */}
                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.enabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, enabled: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 dark:border-[#3A3A3A] text-[#205ab2] focus:ring-[#205ab2]"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">Enable Payment Processing</span>
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-8">
                    When enabled, users can make payments and manage subscriptions.
                  </p>
                </div>

                {/* Provider Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Payment Provider
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PAYMENT_PROVIDERS.map((provider) => (
                      <label
                        key={provider.id}
                        className={`
                          relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${paymentSettings.provider === provider.id
                            ? 'border-[#205ab2] bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-[#3A3A3A] hover:border-gray-300 dark:hover:border-[#4A4A4A]'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="paymentProvider"
                          value={provider.id}
                          checked={paymentSettings.provider === provider.id}
                          onChange={() => setPaymentSettings({ ...paymentSettings, provider: provider.id })}
                          className="sr-only"
                        />
                        <div className={`w-10 h-10 rounded-full ${provider.color} flex items-center justify-center`}>
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{provider.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{provider.fees}</span>
                        {paymentSettings.provider === provider.id && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-4 h-4 text-[#205ab2]" />
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {PAYMENT_PROVIDERS.find(p => p.id === paymentSettings.provider)?.description}
                  </p>
                </div>

                {/* Test Mode Toggle */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-[#1C1C1C] rounded-lg border border-gray-200 dark:border-[#3A3A3A]">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {paymentSettings.testMode ? (
                          <ToggleRight className="w-5 h-5 text-amber-500" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-emerald-500" />
                        )}
                        Test Mode
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {paymentSettings.testMode
                          ? 'Using test/sandbox credentials. No real charges will be made.'
                          : 'Using live credentials. Real charges will be processed!'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentSettings({ ...paymentSettings, testMode: !paymentSettings.testMode })}
                      className={`
                        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#205ab2] focus:ring-offset-2
                        ${paymentSettings.testMode ? 'bg-amber-500' : 'bg-emerald-500'}
                      `}
                    >
                      <span
                        className={`
                          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                          ${paymentSettings.testMode ? 'translate-x-5' : 'translate-x-0'}
                        `}
                      />
                    </button>
                  </div>
                  {!paymentSettings.testMode && (
                    <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-sm text-red-700 dark:text-red-300">
                      Warning: Live mode is enabled. Ensure your credentials are correct before enabling payments.
                    </div>
                  )}
                </div>

                {/* Default Currency */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Currency
                  </label>
                  <div className="relative w-64">
                    <select
                      value={paymentSettings.defaultCurrency}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, defaultCurrency: e.target.value })}
                      className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent appearance-none cursor-pointer"
                    >
                      {CURRENCY_OPTIONS.map((currency) => (
                        <option key={currency.value} value={currency.value}>
                          {currency.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                {/* Provider-specific Credentials */}
                <div className="p-4 bg-gray-50 dark:bg-[#1C1C1C] rounded-lg border border-gray-200 dark:border-[#3A3A3A] mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {PAYMENT_PROVIDERS.find(p => p.id === paymentSettings.provider)?.name} Credentials
                    </h3>
                    <button
                      onClick={() => setShowPaymentSetupInstructions(paymentSettings.provider)}
                      className="inline-flex items-center gap-1 text-[#205ab2] hover:underline text-sm font-medium"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Setup Instructions
                    </button>
                  </div>

                  {/* Stripe Credentials */}
                  {paymentSettings.provider === 'stripe' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Publishable Key
                        </label>
                        <input
                          type="text"
                          value={paymentSettings.credentials.stripePublishableKey}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            credentials: { ...paymentSettings.credentials, stripePublishableKey: e.target.value }
                          })}
                          placeholder={paymentSettings.testMode ? 'pk_test_...' : 'pk_live_...'}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Secret Key
                        </label>
                        <div className="relative">
                          <input
                            type={showApiKeys.stripeSecret ? 'text' : 'password'}
                            value={showApiKeys.stripeSecret ? paymentSettings.credentials.stripeSecretKey : maskApiKey(paymentSettings.credentials.stripeSecretKey)}
                            onChange={(e) => setPaymentSettings({
                              ...paymentSettings,
                              credentials: { ...paymentSettings.credentials, stripeSecretKey: e.target.value }
                            })}
                            placeholder={paymentSettings.testMode ? 'sk_test_...' : 'sk_live_...'}
                            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent font-mono text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => toggleApiKeyVisibility('stripeSecret')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {showApiKeys.stripeSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Webhook Secret (optional)
                        </label>
                        <div className="relative">
                          <input
                            type={showApiKeys.stripeWebhook ? 'text' : 'password'}
                            value={showApiKeys.stripeWebhook ? paymentSettings.credentials.stripeWebhookSecret : maskApiKey(paymentSettings.credentials.stripeWebhookSecret)}
                            onChange={(e) => setPaymentSettings({
                              ...paymentSettings,
                              credentials: { ...paymentSettings.credentials, stripeWebhookSecret: e.target.value }
                            })}
                            placeholder="whsec_..."
                            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent font-mono text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => toggleApiKeyVisibility('stripeWebhook')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {showApiKeys.stripeWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Required for handling webhook events like subscription updates.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Square Credentials */}
                  {paymentSettings.provider === 'square' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Application ID
                        </label>
                        <input
                          type="text"
                          value={paymentSettings.credentials.squareApplicationId}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            credentials: { ...paymentSettings.credentials, squareApplicationId: e.target.value }
                          })}
                          placeholder={paymentSettings.testMode ? 'sandbox-sq0idb-...' : 'sq0idp-...'}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Access Token
                        </label>
                        <div className="relative">
                          <input
                            type={showApiKeys.squareToken ? 'text' : 'password'}
                            value={showApiKeys.squareToken ? paymentSettings.credentials.squareAccessToken : maskApiKey(paymentSettings.credentials.squareAccessToken)}
                            onChange={(e) => setPaymentSettings({
                              ...paymentSettings,
                              credentials: { ...paymentSettings.credentials, squareAccessToken: e.target.value }
                            })}
                            placeholder="EAAAl..."
                            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent font-mono text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => toggleApiKeyVisibility('squareToken')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {showApiKeys.squareToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location ID
                        </label>
                        <input
                          type="text"
                          value={paymentSettings.credentials.squareLocationId}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            credentials: { ...paymentSettings.credentials, squareLocationId: e.target.value }
                          })}
                          placeholder="L..."
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Find this in your Square Dashboard under Locations.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* PayPal Credentials */}
                  {paymentSettings.provider === 'paypal' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Client ID
                        </label>
                        <input
                          type="text"
                          value={paymentSettings.credentials.paypalClientId}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            credentials: { ...paymentSettings.credentials, paypalClientId: e.target.value }
                          })}
                          placeholder="AZ..."
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Client Secret
                        </label>
                        <div className="relative">
                          <input
                            type={showApiKeys.paypalSecret ? 'text' : 'password'}
                            value={showApiKeys.paypalSecret ? paymentSettings.credentials.paypalClientSecret : maskApiKey(paymentSettings.credentials.paypalClientSecret)}
                            onChange={(e) => setPaymentSettings({
                              ...paymentSettings,
                              credentials: { ...paymentSettings.credentials, paypalClientSecret: e.target.value }
                            })}
                            placeholder="EK..."
                            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent font-mono text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => toggleApiKeyVisibility('paypalSecret')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {showApiKeys.paypalSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Braintree Credentials */}
                  {paymentSettings.provider === 'braintree' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Merchant ID
                        </label>
                        <input
                          type="text"
                          value={paymentSettings.credentials.braintreeMerchantId}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            credentials: { ...paymentSettings.credentials, braintreeMerchantId: e.target.value }
                          })}
                          placeholder="your_merchant_id"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Public Key
                        </label>
                        <input
                          type="text"
                          value={paymentSettings.credentials.braintreePublicKey}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            credentials: { ...paymentSettings.credentials, braintreePublicKey: e.target.value }
                          })}
                          placeholder="your_public_key"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Private Key
                        </label>
                        <div className="relative">
                          <input
                            type={showApiKeys.braintreePrivate ? 'text' : 'password'}
                            value={showApiKeys.braintreePrivate ? paymentSettings.credentials.braintreePrivateKey : maskApiKey(paymentSettings.credentials.braintreePrivateKey)}
                            onChange={(e) => setPaymentSettings({
                              ...paymentSettings,
                              credentials: { ...paymentSettings.credentials, braintreePrivateKey: e.target.value }
                            })}
                            placeholder="your_private_key"
                            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent font-mono text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => toggleApiKeyVisibility('braintreePrivate')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {showApiKeys.braintreePrivate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSavePaymentSettings}
                    className="flex items-center gap-2 px-4 py-2 accent-bg text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Save className="h-4 w-4" />
                    Save Payment Settings
                  </button>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="bg-white dark:bg-[#25262b] rounded-lg p-6 border border-gray-200 dark:border-[#2e2f33]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-6 w-6 accent-text" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transaction History</h2>
                  </div>
                  <button
                    onClick={() => { loadTransactions(transactionsPagination.page); loadTransactionStats(); }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-[#3A3A3A] rounded-lg hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 ${transactionsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {/* Stats Cards */}
                {transactionsStats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-[#1C1C1C] rounded-lg p-4 border border-gray-200 dark:border-[#3A3A3A]">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                        <DollarSign className="h-4 w-4" />
                        Total Revenue
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${(transactionsStats.totalRevenue / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#1C1C1C] rounded-lg p-4 border border-gray-200 dark:border-[#3A3A3A]">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                        <TrendingUp className="h-4 w-4" />
                        Transactions
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {transactionsStats.totalTransactions}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#1C1C1C] rounded-lg p-4 border border-gray-200 dark:border-[#3A3A3A]">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm mb-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Captured
                      </div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {transactionsStats.statusBreakdown?.captured || 0}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#1C1C1C] rounded-lg p-4 border border-gray-200 dark:border-[#3A3A3A]">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mb-1">
                        <AlertCircle className="h-4 w-4" />
                        Failed
                      </div>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {transactionsStats.statusBreakdown?.failed || 0}
                      </div>
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-[#1C1C1C] rounded-lg border border-gray-200 dark:border-[#3A3A3A]">
                  {/* Search */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Email, name, or transaction ID..."
                        value={transactionsFilters.search}
                        onChange={(e) => setTransactionsFilters({ ...transactionsFilters, search: e.target.value })}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="w-36">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                    <select
                      value={transactionsFilters.status}
                      onChange={(e) => setTransactionsFilters({ ...transactionsFilters, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="captured">Captured</option>
                      <option value="authorized">Authorized</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  {/* Provider Filter */}
                  <div className="w-36">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Provider</label>
                    <select
                      value={transactionsFilters.provider}
                      onChange={(e) => setTransactionsFilters({ ...transactionsFilters, provider: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                    >
                      <option value="all">All Providers</option>
                      <option value="stripe">Stripe</option>
                      <option value="square">Square</option>
                      <option value="paypal">PayPal</option>
                      <option value="braintree">Braintree</option>
                    </select>
                  </div>

                  {/* Date From */}
                  <div className="w-40">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">From Date</label>
                    <input
                      type="date"
                      value={transactionsFilters.dateFrom}
                      onChange={(e) => setTransactionsFilters({ ...transactionsFilters, dateFrom: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                    />
                  </div>

                  {/* Date To */}
                  <div className="w-40">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">To Date</label>
                    <input
                      type="date"
                      value={transactionsFilters.dateTo}
                      onChange={(e) => setTransactionsFilters({ ...transactionsFilters, dateTo: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#25262b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-[#3A3A3A]">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Provider</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Card</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-[#3A3A3A]">
                      {transactionsLoading ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                            Loading transactions...
                          </td>
                        </tr>
                      ) : transactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        transactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A]">
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {new Date(txn.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(txn.createdAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {txn.billingName || txn.userName || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {txn.userEmail}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {txn.planName || txn.planId || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                              ${(txn.amount / 100).toFixed(2)} {txn.currency}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                txn.status === 'captured' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                txn.status === 'authorized' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                txn.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                txn.status === 'refunded' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                              }`}>
                                {txn.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white capitalize">
                              {txn.provider}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {txn.cardLast4 ? (
                                <span className="font-mono">
                                  {txn.cardBrand && <span className="capitalize">{txn.cardBrand}</span>} ••••{txn.cardLast4}
                                </span>
                              ) : '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {transactionsPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-[#3A3A3A]">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing {((transactionsPagination.page - 1) * transactionsPagination.limit) + 1} to {Math.min(transactionsPagination.page * transactionsPagination.limit, transactionsPagination.total)} of {transactionsPagination.total} transactions
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadTransactions(transactionsPagination.page - 1)}
                        disabled={transactionsPagination.page <= 1}
                        className="p-2 rounded-lg border border-gray-200 dark:border-[#3A3A3A] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {transactionsPagination.page} of {transactionsPagination.totalPages}
                      </span>
                      <button
                        onClick={() => loadTransactions(transactionsPagination.page + 1)}
                        disabled={transactionsPagination.page >= transactionsPagination.totalPages}
                        className="p-2 rounded-lg border border-gray-200 dark:border-[#3A3A3A] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Google OAuth Setup Instructions Panel */}
        {showGoogleSetupInstructions && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setShowGoogleSetupInstructions(false)}
            />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-[#1C1C1C] border-l border-gray-200 dark:border-[#3A3A3A] shadow-2xl z-[101] flex flex-col overflow-hidden animate-slide-in-right">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#3A3A3A] bg-gray-50 dark:bg-[#25262b]">
                <div className="flex items-center gap-3">
                  <svg className="h-8 w-8" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Google OAuth Setup</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Configure Google Docs integration</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGoogleSetupInstructions(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Step 1 */}
                <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#205ab2] text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Create a Google Cloud Project</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Go to the Google Cloud Console and create a new project (or select an existing one).
                      </p>
                      <a
                        href="https://console.cloud.google.com/projectcreate"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#205ab2] text-white rounded-lg hover:bg-[#1a4a94] transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Google Cloud Console
                      </a>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#205ab2] text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Enable the Google Docs API</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        In your project, go to APIs & Services → Library, search for "Google Docs API" and enable it.
                      </p>
                      <a
                        href="https://console.cloud.google.com/apis/library/docs.googleapis.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-[#3A3A3A] text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#4A4A4A] transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Enable Google Docs API
                      </a>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#205ab2] text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Configure OAuth Consent Screen</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Go to APIs & Services → OAuth consent screen. Choose "External" user type, fill in the app name, user support email, and developer contact information.
                      </p>
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-3">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          <strong>Tip:</strong> Add the scope <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">https://www.googleapis.com/auth/documents</code> and <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">https://www.googleapis.com/auth/drive.file</code>
                        </p>
                      </div>
                      <a
                        href="https://console.cloud.google.com/apis/credentials/consent"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-[#3A3A3A] text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#4A4A4A] transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Configure Consent Screen
                      </a>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#205ab2] text-white flex items-center justify-center font-bold text-sm shrink-0">4</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Create OAuth 2.0 Credentials</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Go to APIs & Services → Credentials → Create Credentials → OAuth client ID. Select "Web application" as the application type.
                      </p>
                      <a
                        href="https://console.cloud.google.com/apis/credentials/oauthclient"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-[#3A3A3A] text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#4A4A4A] transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Create OAuth Client
                      </a>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#205ab2] text-white flex items-center justify-center font-bold text-sm shrink-0">5</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Add Authorized Redirect URI</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        In the OAuth client settings, add the following URL as an authorized redirect URI:
                      </p>
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#1C1C1C] p-3 rounded-lg border border-gray-200 dark:border-[#3A3A3A]">
                        <code className="flex-1 text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                          {typeof window !== 'undefined' ? `${window.location.origin}/api/v1/google/callback` : '/api/v1/google/callback'}
                        </code>
                        <button
                          onClick={() => {
                            const url = typeof window !== 'undefined' ? `${window.location.origin}/api/v1/google/callback` : '';
                            navigator.clipboard.writeText(url);
                            toast({ title: 'Copied!', description: 'Redirect URI copied to clipboard' });
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#205ab2] text-white flex items-center justify-center font-bold text-sm shrink-0">6</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Copy Client ID & Secret</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        After creating the OAuth client, copy the <strong>Client ID</strong> and <strong>Client Secret</strong> and paste them in the fields above.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 7 */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Enable the Integration</h3>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        Once you've entered the Client ID and Secret, check the "Enable Google Docs Integration" checkbox and save settings. Users will then see the Google Doc export button when viewing PRD documents.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Note about testing */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-700">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Testing Mode</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    While your app is in testing mode, only test users you've added to the OAuth consent screen can use the integration.
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    To allow all users, you'll need to publish your app and complete Google's verification process.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-[#3A3A3A] bg-gray-50 dark:bg-[#25262b]">
                <button
                  onClick={() => setShowGoogleSetupInstructions(false)}
                  className="w-full px-4 py-2 bg-[#205ab2] text-white rounded-lg hover:bg-[#1a4a94] transition-colors font-medium"
                >
                  Close Instructions
                </button>
              </div>
            </div>
          </>
        )}

        {/* Payment Provider Setup Instructions Panel */}
        {showPaymentSetupInstructions && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setShowPaymentSetupInstructions(null)}
            />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-[#1C1C1C] border-l border-gray-200 dark:border-[#3A3A3A] shadow-2xl z-[101] flex flex-col overflow-hidden animate-slide-in-right">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#3A3A3A] bg-gray-50 dark:bg-[#25262b]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${PAYMENT_PROVIDERS.find(p => p.id === showPaymentSetupInstructions)?.color || 'bg-blue-500'} flex items-center justify-center`}>
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {PAYMENT_PROVIDERS.find(p => p.id === showPaymentSetupInstructions)?.name} Setup
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Configure payment processing</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentSetupInstructions(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Stripe Instructions */}
                {showPaymentSetupInstructions === 'stripe' && (
                  <>
                    <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Create a Stripe Account</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            If you don't have a Stripe account, create one at stripe.com. Complete the onboarding process to enable live payments.
                          </p>
                          <a href="https://dashboard.stripe.com/register" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                            <ExternalLink className="w-4 h-4" />
                            Create Stripe Account
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Get Your API Keys</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Go to Developers → API keys in your Stripe Dashboard. You'll find both test and live keys there.
                          </p>
                          <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-[#3A3A3A] text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#4A4A4A] transition-colors text-sm font-medium">
                            <ExternalLink className="w-4 h-4" />
                            View API Keys
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Set Up Webhooks (Optional)</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            For subscription updates and payment events, create a webhook endpoint in Stripe Dashboard → Developers → Webhooks.
                          </p>
                          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-3">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                              <strong>Webhook URL:</strong> <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">{typeof window !== 'undefined' ? `${window.location.origin}/api/v1/payments/webhook` : '/api/v1/payments/webhook'}</code>
                            </p>
                          </div>
                          <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-[#3A3A3A] text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#4A4A4A] transition-colors text-sm font-medium">
                            <ExternalLink className="w-4 h-4" />
                            Configure Webhooks
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-700">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Enter Your Keys</h3>
                          <p className="text-sm text-emerald-700 dark:text-emerald-300">
                            Copy your Publishable Key (pk_test_... or pk_live_...) and Secret Key (sk_test_... or sk_live_...) into the fields above. Start with test keys to verify the integration.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Square Instructions */}
                {showPaymentSetupInstructions === 'square' && (
                  <>
                    <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Create a Square Developer Account</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Sign up for a Square Developer account to access the APIs. Create an application in the Developer Dashboard.
                          </p>
                          <a href="https://developer.squareup.com/apps" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                            <ExternalLink className="w-4 h-4" />
                            Square Developer Dashboard
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Get Application Credentials</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            In your Square application settings, find the Application ID and Access Token. Toggle between Sandbox and Production environments.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Find Your Location ID</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Every Square account has at least one location. Find your Location ID in the Square Dashboard under Account & Settings → Locations.
                          </p>
                          <a href="https://squareup.com/dashboard/locations" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-[#3A3A3A] text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#4A4A4A] transition-colors text-sm font-medium">
                            <ExternalLink className="w-4 h-4" />
                            View Locations
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-700">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Enter Your Credentials</h3>
                          <p className="text-sm text-emerald-700 dark:text-emerald-300">
                            Enter your Application ID, Access Token, and Location ID in the fields above. Use sandbox credentials for testing.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* PayPal Instructions */}
                {showPaymentSetupInstructions === 'paypal' && (
                  <>
                    <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Create a PayPal Developer Account</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Log in to the PayPal Developer Dashboard with your PayPal business account or create a new one.
                          </p>
                          <a href="https://developer.paypal.com/dashboard/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            <ExternalLink className="w-4 h-4" />
                            PayPal Developer Dashboard
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Create a REST API App</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Go to Apps & Credentials, select Sandbox or Live, and click "Create App". Give your app a name and create it.
                          </p>
                          <a href="https://developer.paypal.com/dashboard/applications/live" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-[#3A3A3A] text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#4A4A4A] transition-colors text-sm font-medium">
                            <ExternalLink className="w-4 h-4" />
                            View Apps
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Copy API Credentials</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            After creating the app, you'll see your Client ID and Secret. Click "Show" to reveal the secret, then copy both values.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-700">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Enter Your Credentials</h3>
                          <p className="text-sm text-emerald-700 dark:text-emerald-300">
                            Paste your Client ID and Client Secret in the fields above. Use sandbox credentials for testing before going live.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Braintree Instructions */}
                {showPaymentSetupInstructions === 'braintree' && (
                  <>
                    <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Create a Braintree Account</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Sign up for a Braintree sandbox account to get started. You'll need to apply for a production account separately.
                          </p>
                          <a href="https://www.braintreepayments.com/sandbox" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium">
                            <ExternalLink className="w-4 h-4" />
                            Create Sandbox Account
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Find Your API Keys</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Log into your Braintree Control Panel. Go to Settings → API and find your Merchant ID, Public Key, and Private Key.
                          </p>
                          <a href="https://sandbox.braintreegateway.com/login" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-[#3A3A3A] text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#4A4A4A] transition-colors text-sm font-medium">
                            <ExternalLink className="w-4 h-4" />
                            Braintree Control Panel
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-[#25262b] rounded-xl p-5 border border-gray-200 dark:border-[#3A3A3A]">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Generate API Keys</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            If you don't have keys yet, click "Generate New API Key" in the API settings. Keep your Private Key secure and never share it.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-700">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Enter Your Credentials</h3>
                          <p className="text-sm text-emerald-700 dark:text-emerald-300">
                            Enter your Merchant ID, Public Key, and Private Key in the fields above. Start with sandbox credentials for testing.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Pro tip for all providers */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-700">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Pro Tip: Test Before Going Live</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Always test your integration thoroughly in test/sandbox mode before switching to live credentials. This ensures your payment flow works correctly without processing real transactions.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-[#3A3A3A] bg-gray-50 dark:bg-[#25262b]">
                <button
                  onClick={() => setShowPaymentSetupInstructions(null)}
                  className="w-full px-4 py-2 bg-[#205ab2] text-white rounded-lg hover:bg-[#1a4a94] transition-colors font-medium"
                >
                  Close Instructions
                </button>
              </div>
            </div>
          </>
        )}

        {/* Slide-in animation styles */}
        <style jsx global>{`
          @keyframes slide-in-right {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .animate-slide-in-right {
            animation: slide-in-right 0.3s ease-out;
          }
        `}</style>
    </Layout>
  );
}
