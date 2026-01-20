'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import { Hammer, Save, RefreshCw, Copy, Check, Info, Rocket, X, Smile, Search } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from "@/components/ui/image-upload";
import { INDUSTRIES_DATA } from './industries';

import { EMOJI_LIST, EMOJI_CATEGORIES } from './emojis';

// Design Presets - Curated color combinations
const DESIGN_PRESETS = [
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    description: 'Classic corporate look',
    primaryColor: '#2563eb',
    secondaryColor: '#f1f5f9',
    accentColor: '#10b981',
    headerFooterBg: '#0f172a',
    headerFooterText: '#ffffff',
    heroBgFrom: '#1e3a8a',
    heroBgTo: '#0f172a',
    heroPattern: 'grid',
  },
  {
    id: 'emerald-fresh',
    name: 'Emerald Fresh',
    description: 'Clean and eco-friendly',
    primaryColor: '#059669',
    secondaryColor: '#ecfdf5',
    accentColor: '#0ea5e9',
    headerFooterBg: '#064e3b',
    headerFooterText: '#ffffff',
    heroBgFrom: '#065f46',
    heroBgTo: '#022c22',
    heroPattern: 'dots',
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm and energetic',
    primaryColor: '#ea580c',
    secondaryColor: '#fff7ed',
    accentColor: '#0891b2',
    headerFooterBg: '#7c2d12',
    headerFooterText: '#ffffff',
    heroBgFrom: '#9a3412',
    heroBgTo: '#431407',
    heroPattern: 'diagonal',
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Elegant and luxurious',
    primaryColor: '#7c3aed',
    secondaryColor: '#f5f3ff',
    accentColor: '#f59e0b',
    headerFooterBg: '#3b0764',
    headerFooterText: '#ffffff',
    heroBgFrom: '#581c87',
    heroBgTo: '#1e1b4b',
    heroPattern: 'hexagons',
  },
  {
    id: 'crimson-bold',
    name: 'Crimson Bold',
    description: 'Strong and impactful',
    primaryColor: '#dc2626',
    secondaryColor: '#fef2f2',
    accentColor: '#2563eb',
    headerFooterBg: '#7f1d1d',
    headerFooterText: '#ffffff',
    heroBgFrom: '#991b1b',
    heroBgTo: '#450a0a',
    heroPattern: 'crosses',
  },
  {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    description: 'Calm and trustworthy',
    primaryColor: '#0891b2',
    secondaryColor: '#ecfeff',
    accentColor: '#8b5cf6',
    headerFooterBg: '#134e4a',
    headerFooterText: '#ffffff',
    heroBgFrom: '#115e59',
    heroBgTo: '#042f2e',
    heroPattern: 'waves',
  },
  {
    id: 'slate-modern',
    name: 'Slate Modern',
    description: 'Sleek and minimal',
    primaryColor: '#3b82f6',
    secondaryColor: '#f8fafc',
    accentColor: '#f97316',
    headerFooterBg: '#1e293b',
    headerFooterText: '#ffffff',
    heroBgFrom: '#334155',
    heroBgTo: '#0f172a',
    heroPattern: 'none',
  },
  {
    id: 'amber-warmth',
    name: 'Amber Warmth',
    description: 'Friendly and inviting',
    primaryColor: '#d97706',
    secondaryColor: '#fffbeb',
    accentColor: '#0d9488',
    headerFooterBg: '#78350f',
    headerFooterText: '#ffffff',
    heroBgFrom: '#92400e',
    heroBgTo: '#451a03',
    heroPattern: 'dots',
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Natural and grounded',
    primaryColor: '#15803d',
    secondaryColor: '#f0fdf4',
    accentColor: '#be185d',
    headerFooterBg: '#14532d',
    headerFooterText: '#ffffff',
    heroBgFrom: '#166534',
    heroBgTo: '#052e16',
    heroPattern: 'circles',
  },
  {
    id: 'navy-gold',
    name: 'Navy & Gold',
    description: 'Premium and distinguished',
    primaryColor: '#1e40af',
    secondaryColor: '#eff6ff',
    accentColor: '#ca8a04',
    headerFooterBg: '#172554',
    headerFooterText: '#fef3c7',
    heroBgFrom: '#1e3a8a',
    heroBgTo: '#0c1929',
    heroPattern: 'grid',
  },
  {
    id: 'rose-elegant',
    name: 'Rose Elegant',
    description: 'Sophisticated and soft',
    primaryColor: '#e11d48',
    secondaryColor: '#fff1f2',
    accentColor: '#6366f1',
    headerFooterBg: '#4c0519',
    headerFooterText: '#ffffff',
    heroBgFrom: '#881337',
    heroBgTo: '#1c0413',
    heroPattern: 'diagonal',
  },
  {
    id: 'sky-light',
    name: 'Sky Light',
    description: 'Airy and approachable',
    primaryColor: '#0284c7',
    secondaryColor: '#f0f9ff',
    accentColor: '#22c55e',
    headerFooterBg: '#0c4a6e',
    headerFooterText: '#ffffff',
    heroBgFrom: '#075985',
    heroBgTo: '#0a1929',
    heroPattern: 'waves',
  },
  {
    id: 'clean-white',
    name: 'Clean White',
    description: 'Light and professional',
    primaryColor: '#2563eb',
    secondaryColor: '#f8fafc',
    accentColor: '#16a34a',
    headerFooterBg: '#ffffff',
    headerFooterText: '#1e293b',
    heroBgFrom: '#1e3a8a',
    heroBgTo: '#0f172a',
    heroPattern: 'none',
  },
  {
    id: 'soft-cream',
    name: 'Soft Cream',
    description: 'Warm and welcoming',
    primaryColor: '#b45309',
    secondaryColor: '#fef3c7',
    accentColor: '#059669',
    headerFooterBg: '#fefce8',
    headerFooterText: '#713f12',
    heroBgFrom: '#92400e',
    heroBgTo: '#451a03',
    heroPattern: 'dots',
  },
  // Light Mode Presets
  {
    id: 'light-minimal',
    name: 'Light Minimal',
    description: 'Clean white aesthetic',
    primaryColor: '#0f172a',
    secondaryColor: '#f8fafc',
    accentColor: '#3b82f6',
    headerFooterBg: '#ffffff',
    headerFooterText: '#0f172a',
    heroBgFrom: '#1e293b',
    heroBgTo: '#0f172a',
    heroPattern: 'none',
  },
  {
    id: 'light-blue',
    name: 'Light Blue',
    description: 'Bright and trustworthy',
    primaryColor: '#2563eb',
    secondaryColor: '#eff6ff',
    accentColor: '#f59e0b',
    headerFooterBg: '#f8fafc',
    headerFooterText: '#1e3a8a',
    heroBgFrom: '#1d4ed8',
    heroBgTo: '#1e40af',
    heroPattern: 'none',
  },
  {
    id: 'light-green',
    name: 'Light Green',
    description: 'Fresh and natural',
    primaryColor: '#16a34a',
    secondaryColor: '#f0fdf4',
    accentColor: '#0891b2',
    headerFooterBg: '#ffffff',
    headerFooterText: '#166534',
    heroBgFrom: '#15803d',
    heroBgTo: '#14532d',
    heroPattern: 'none',
  },
  {
    id: 'light-warm',
    name: 'Light Warm',
    description: 'Soft and inviting',
    primaryColor: '#c2410c',
    secondaryColor: '#fffbeb',
    accentColor: '#0d9488',
    headerFooterBg: '#fefce8',
    headerFooterText: '#78350f',
    heroBgFrom: '#ea580c',
    heroBgTo: '#9a3412',
    heroPattern: 'none',
  },
  {
    id: 'light-gray',
    name: 'Light Gray',
    description: 'Modern and neutral',
    primaryColor: '#6366f1',
    secondaryColor: '#f9fafb',
    accentColor: '#ec4899',
    headerFooterBg: '#f3f4f6',
    headerFooterText: '#374151',
    heroBgFrom: '#4f46e5',
    heroBgTo: '#3730a3',
    heroPattern: 'none',
  },
  // Dark Mode Presets
  {
    id: 'dark-minimal',
    name: 'Dark Minimal',
    description: 'Sleek black aesthetic',
    primaryColor: '#ffffff',
    secondaryColor: '#18181b',
    accentColor: '#3b82f6',
    headerFooterBg: '#09090b',
    headerFooterText: '#fafafa',
    heroBgFrom: '#18181b',
    heroBgTo: '#09090b',
    heroPattern: 'none',
  },
  {
    id: 'dark-blue',
    name: 'Dark Blue',
    description: 'Deep and professional',
    primaryColor: '#60a5fa',
    secondaryColor: '#1e293b',
    accentColor: '#fbbf24',
    headerFooterBg: '#0f172a',
    headerFooterText: '#e2e8f0',
    heroBgFrom: '#1e3a8a',
    heroBgTo: '#0f172a',
    heroPattern: 'none',
  },
  {
    id: 'dark-emerald',
    name: 'Dark Emerald',
    description: 'Rich and luxurious',
    primaryColor: '#34d399',
    secondaryColor: '#1a2e2a',
    accentColor: '#f472b6',
    headerFooterBg: '#022c22',
    headerFooterText: '#d1fae5',
    heroBgFrom: '#065f46',
    heroBgTo: '#022c22',
    heroPattern: 'none',
  },
  {
    id: 'dark-purple',
    name: 'Dark Purple',
    description: 'Bold and creative',
    primaryColor: '#a78bfa',
    secondaryColor: '#1e1b2e',
    accentColor: '#fb923c',
    headerFooterBg: '#0f0a1e',
    headerFooterText: '#e9d5ff',
    heroBgFrom: '#581c87',
    heroBgTo: '#0f0a1e',
    heroPattern: 'none',
  },
  {
    id: 'dark-charcoal',
    name: 'Dark Charcoal',
    description: 'Sophisticated gray',
    primaryColor: '#f97316',
    secondaryColor: '#27272a',
    accentColor: '#22d3ee',
    headerFooterBg: '#18181b',
    headerFooterText: '#d4d4d8',
    heroBgFrom: '#3f3f46',
    heroBgTo: '#18181b',
    heroPattern: 'none',
  },
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    description: 'Premium dark theme',
    primaryColor: '#fbbf24',
    secondaryColor: '#1c1917',
    accentColor: '#f472b6',
    headerFooterBg: '#0c0a09',
    headerFooterText: '#fef3c7',
    heroBgFrom: '#292524',
    heroBgTo: '#0c0a09',
    heroPattern: 'none',
  },
];

// Data derived from create-new-site.js
const BUSINESS_TYPES = [
  { value: 'trades', label: 'Trades / Subcontractors' },
  { value: 'services', label: 'Home Services' }
];

const INDUSTRIES = {
  trades: [
    { value: 'hvac', label: 'HVAC', type: 'HVAC' },
    { value: 'plumbing', label: 'Plumbing', type: 'Plumbing' },
    { value: 'electrical', label: 'Electrical', type: 'Electrical' },
    { value: 'roofing', label: 'Roofing', type: 'Roofing' },
    { value: 'general-contractor', label: 'General Contractor', type: 'General Contractor' }
  ],
  services: [
    { value: 'mold-remediation', label: 'Mold Remediation', type: 'Mold Remediation' },
    { value: 'restoration', label: 'Restoration', type: 'Restoration' },
    { value: 'carpet-cleaning', label: 'Carpet Cleaning', type: 'Carpet & Tile Cleaning' },
    { value: 'pool-service', label: 'Pool Service', type: 'Pool Service' },
    { value: 'landscaping', label: 'Landscaping', type: 'Landscaping' },
    { value: 'pest-control', label: 'Pest Control', type: 'Pest Control' },
    { value: 'cleaning', label: 'Cleaning', type: 'Cleaning' },
    { value: 'painting', label: 'Painting', type: 'Painting' },
    { value: 'flooring', label: 'Flooring', type: 'Flooring' },
    { value: 'fencing', label: 'Fencing', type: 'Fencing' }
  ]
};

const DEFAULT_CONFIG = {
  // Site Info
  projectName: '',
  businessType: '',
  industry: '',
  siteUrl: '',
  
  // Services (List of slugs or names)
  services: [] as string[],

  // Company Info
  companyName: '',
  slug: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  stateFullName: '',
  zip: '',
  license: '',
  yearsInBusiness: '10',
  
  // Service Area
  primaryCity: '',
  serviceAreas: '', // comma separated string
  serviceRadius: '25',

  // Branding
  logoUrl: '',
  logoAbsolutePath: '',
  faviconUrl: '',
  faviconAbsolutePath: '',
  primaryColor: '#2563eb',
  secondaryColor: '#f1f5f9',
  accentColor: '#10b981',
  headerFooterBg: '#0f172a',
  headerFooterText: '#ffffff',
  heroBgFrom: '', // Hero gradient start color (empty = default)
  heroBgTo: '', // Hero gradient end color (empty = default)
  heroPattern: 'none', // Hero background pattern: none, crosses, dots, grid, diagonal
  logoType: 'emoji',
  icon: '🔧',
  tagline: 'Your tagline here',
  fontHeading: 'Poppins',
  fontBody: 'Inter',

  // Social
  facebookUrl: '',
  instagramUrl: '',
  googleBusinessUrl: '',
  yelpUrl: '',
  bbbUrl: '',
  nextdoorUrl: '',
  
  // Reviews
  ratingValue: '5.0',
  reviewCount: '100',
  googleReviewLink: '',

  // Hours
  hoursWeekdays: '8:00 AM - 6:00 PM',
  hoursSaturday: '9:00 AM - 4:00 PM',
  hoursSunday: 'Closed',
  emergencyService: false,

  // GHL
  ghlCalendarEmbed: '',
  ghlFormEmbed: '',
  ghlChatWidget: '',
  ghlWebhookUrl: '',
  ghlTrackingId: '',

  // SEO
  googleAnalyticsId: '',
  googleTagManagerId: '',
};

export default function SiteBuilderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<{path: string, url: string} | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [emojiCategory, setEmojiCategory] = useState('All');
  const [presetViewMode, setPresetViewMode] = useState<'grid' | 'coverflow'>('grid');
  const [coverflowIndex, setCoverflowIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const apiUrl = getApiUrl();
    fetch(`${apiUrl}/api/v1/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then(data => {
        const userData = data.data || data;
        const hasSiteAdmin = userData.roles?.includes('Site Admin');
        const hasAdmin = userData.roles?.includes('Admin');
        
        if (!hasSiteAdmin) {
           router.push('/dashboard');
           return;
        }

        setIsAuthenticated(true);
        setIsAdmin(hasAdmin);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        router.push('/login');
      });
  }, [router]);

  // Coverflow keyboard navigation
  useEffect(() => {
    if (presetViewMode !== 'coverflow') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCoverflowIndex(prev => prev === 0 ? DESIGN_PRESETS.length - 1 : prev - 1);
      } else if (e.key === 'ArrowRight') {
        setCoverflowIndex(prev => prev === DESIGN_PRESETS.length - 1 ? 0 : prev + 1);
      } else if (e.key === 'Enter') {
        const preset = DESIGN_PRESETS[coverflowIndex];
        setConfig({
          ...config,
          primaryColor: preset.primaryColor,
          secondaryColor: preset.secondaryColor,
          accentColor: preset.accentColor,
          headerFooterBg: preset.headerFooterBg,
          headerFooterText: preset.headerFooterText,
          heroBgFrom: preset.heroBgFrom,
          heroBgTo: preset.heroBgTo,
          heroPattern: 'none',
        });
        toast({
          title: `${preset.name} Applied`,
          description: "Color scheme has been updated",
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presetViewMode, coverflowIndex, config, toast]);

  // Generate slug/project from company name if empty
  useEffect(() => {
    if (config.companyName && !config.slug) {
      const suggestedSlug = config.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setConfig(prev => ({ ...prev, slug: suggestedSlug }));
    }
  }, [config.companyName]);

  useEffect(() => {
    if (config.slug && !config.projectName) {
      setConfig(prev => ({ ...prev, projectName: config.slug }));
    }
  }, [config.slug]);

  const availableServices = useMemo(() => {
    if (!config.industry) return [];
    // @ts-ignore - INDUSTRIES_DATA index signature
    const industryData = INDUSTRIES_DATA[config.industry];
    return industryData ? industryData.services : [];
  }, [config.industry]);

  const addService = (serviceSlug: string) => {
    if (!config.services.includes(serviceSlug)) {
      setConfig(prev => ({ ...prev, services: [...prev.services, serviceSlug] }));
    }
  };

  const removeService = (serviceSlug: string) => {
    setConfig(prev => ({ ...prev, services: prev.services.filter(s => s !== serviceSlug) }));
  };

  const handleAddCustomService = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customServiceInput.trim()) {
      e.preventDefault();
      addService(customServiceInput.trim());
      setCustomServiceInput('');
    }
  };

  const filteredEmojis = useMemo(() => {
    return EMOJI_LIST.filter(item => {
      const matchesSearch = item.keywords.some(k => k.toLowerCase().includes(emojiSearch.toLowerCase())) || 
                            item.category.toLowerCase().includes(emojiSearch.toLowerCase()) ||
                            item.char.includes(emojiSearch);
      const matchesCategory = emojiCategory === 'All' || item.category === emojiCategory;
      return matchesSearch && matchesCategory;
    });
  }, [emojiSearch, emojiCategory]);

  // Construct the JSON object structure requested
  const constructedConfig = useMemo(() => {
     const industryList = config.businessType ? INDUSTRIES[config.businessType as keyof typeof INDUSTRIES] : [];
     const selectedIndustry = industryList.find(i => i.value === config.industry);
     
     // @ts-ignore
     const industryData = config.industry ? INDUSTRIES_DATA[config.industry] : null;
     const industryTypeLabel = selectedIndustry?.type || industryData?.type || 'Service';

     // Resolve services
     const resolvedServices = config.services.map(slugOrName => {
        const knownService = availableServices.find((s: { slug: string; name: string }) => s.slug === slugOrName || s.name === slugOrName);
        if (knownService) return knownService;
        return {
           name: slugOrName,
           slug: slugOrName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
           shortDescription: slugOrName,
           longDescription: `Professional ${slugOrName} services.`,
           featured: false
        };
     });

     return {
        company: {
          name: config.companyName,
          slug: config.slug,
          phone: config.phone,
          email: config.email,
          address: config.address,
          city: config.city,
          state: config.state,
          stateFullName: config.stateFullName,
          zip: config.zip,
          license: config.license,
          yearsInBusiness: config.yearsInBusiness,
        },
        branding: {
          logoType: config.logoType,
          logoUrl: config.logoType === 'image' ? (config.logoAbsolutePath || config.logoUrl) : '',
          faviconUrl: config.faviconAbsolutePath || config.faviconUrl,
          primaryColor: config.primaryColor,
          secondaryColor: config.secondaryColor,
          accentColor: config.accentColor,
          headerFooterBg: config.headerFooterBg,
          headerFooterText: config.headerFooterText,
          heroBgFrom: config.heroBgFrom,
          heroBgTo: config.heroBgTo,
          heroPattern: config.heroPattern,
          fontHeading: config.fontHeading,
          fontBody: config.fontBody,
          icon: config.logoType === 'emoji' ? config.icon : '',
          tagline: config.tagline,
        },
        industry: {
          slug: config.industry,
          type: industryTypeLabel,
          serviceVerb: industryData?.serviceVerb || 'repair',
          emergencyService: config.emergencyService,
          services: resolvedServices,
          faq: [] // Placeholder
        },
        serviceArea: {
          areas: config.serviceAreas.split(',').map(s => s.trim()).filter(Boolean),
          radius: config.serviceRadius,
          primaryCity: config.primaryCity || config.city,
        },
        social: {
          facebook: config.facebookUrl,
          instagram: config.instagramUrl,
          google: config.googleBusinessUrl,
          yelp: config.yelpUrl,
          bbb: config.bbbUrl,
          nextdoor: config.nextdoorUrl,
        },
        ghl: {
          calendarEmbed: config.ghlCalendarEmbed,
          formEmbed: config.ghlFormEmbed,
          chatWidget: config.ghlChatWidget,
          webhookUrl: config.ghlWebhookUrl,
          trackingId: config.ghlTrackingId,
        },
        seo: {
          googleAnalyticsId: config.googleAnalyticsId,
          googleTagManagerId: config.googleTagManagerId,
          facebookPixelId: '',
          metaDescription: `${config.companyName} provides professional ${industryTypeLabel.toLowerCase()} services in ${config.city}, ${config.state}. ${config.yearsInBusiness}+ years experience. Licensed & insured. Call for a free estimate!`,
          metaKeywords: `${industryTypeLabel.toLowerCase()}, ${config.city}, ${config.state}, ${resolvedServices.map(s => s.name.toLowerCase()).join(', ')}`,
        },
        siteUrl: config.siteUrl,
        reviews: {
          rating: config.ratingValue,
          count: config.reviewCount,
          googleReviewLink: config.googleReviewLink,
        },
        hours: {
          weekdays: config.hoursWeekdays,
          saturday: config.hoursSaturday,
          sunday: config.hoursSunday,
          emergencyNote: config.emergencyService ? '24/7 Emergency Service Available' : '',
        },
        services: resolvedServices,
        testimonials: [],
        faq: [],
        gallery: [],
        team: [],
        
        // Metadata for the generator
        _generator: {
           projectName: config.projectName,
           businessType: config.businessType,
           iconEmoji: config.icon
        }
     };
  }, [config, availableServices]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(constructedConfig, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Configuration Copied",
      description: "JSON configuration copied to clipboard",
    });
  };

  const handleGenerate = async () => {
     setIsGenerating(true);
     try {
       const response = await fetch('/api/site-builder/generate', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(constructedConfig),
       });
 
       if (!response.ok) {
         throw new Error('Failed to generate site');
       }
 
        const result = await response.json();

        // Calculate path for instructions
        const destPath = `templates/${config.businessType === 'services' ? 'services' : 'trades'}/${config.slug}`;
        setGenerationResult({
          path: destPath,
          url: '',
        });
     } catch (error) {
       console.error(error);
       toast({
         variant: "destructive",
         title: "Error",
         description: "Failed to start site generation.",
       });
     } finally {
       setIsGenerating(false);
     }
  };

  if (isLoading) {
    return (
       <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-zinc-950">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
       </div>
    );
  }

  const industryOptions = config.businessType 
    ? INDUSTRIES[config.businessType as keyof typeof INDUSTRIES] 
    : [];

  return (
    <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} noPadding>
      <SubHeader 
        icon={Hammer}
        title="Site Builder"
        subtitle="Configure and generate new client websites"
        actions={
            <Button onClick={handleGenerate} disabled={isGenerating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
               <Rocket className="w-4 h-4 mr-2" />
               {isGenerating ? 'Generating...' : 'Generate Site'}
            </Button>
        }
      />
      
      <div className="p-6 md:p-8 bg-gray-50 dark:bg-zinc-950 min-h-screen">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Configuration Form */}
            <div className="lg:col-span-2 space-y-6">
              
              <Tabs defaultValue="company" className="w-full">
                <TabsList className="w-full grid grid-cols-5 mb-8">
                  <TabsTrigger value="company">Company</TabsTrigger>
                  <TabsTrigger value="branding">Branding</TabsTrigger>
                  <TabsTrigger value="service">Service</TabsTrigger>
                  <TabsTrigger value="setup">Setup</TabsTrigger>
                  <TabsTrigger value="integrations">Connect</TabsTrigger>
                </TabsList>

                {/* Site Setup Tab */}


                {/* Company Info Tab */}
                <TabsContent value="company">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Details</CardTitle>
                      <CardDescription>Name, address, and license information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                          <label className="text-sm font-medium">Company Name</label>
                          <Input value={config.companyName} onChange={e => {
                              const name = e.target.value;
                              const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                              setConfig({...config, companyName: name, slug, projectName: slug});
                          }} placeholder="Acme Inc" />
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-medium">Tagline</label>
                          <Input value={config.tagline} onChange={e => setConfig({...config, tagline: e.target.value})} placeholder="Professional Services you can Trust" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input value={config.phone} onChange={e => setConfig({...config, phone: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input value={config.email} onChange={e => setConfig({...config, email: e.target.value})} />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-medium">Address</label>
                          <Input value={config.address} onChange={e => setConfig({...config, address: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium">City</label>
                            <Input value={config.city} onChange={e => setConfig({...config, city: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">State (Abbr)</label>
                            <Input value={config.state} maxLength={2} onChange={e => setConfig({...config, state: e.target.value})} placeholder="CA" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Zip</label>
                            <Input value={config.zip} onChange={e => setConfig({...config, zip: e.target.value})} />
                          </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                              <label className="text-sm font-medium">State (Full)</label>
                              <Input value={config.stateFullName} onChange={e => setConfig({...config, stateFullName: e.target.value})} placeholder="California" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-medium">License #</label>
                              <Input value={config.license} onChange={e => setConfig({...config, license: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Years in Business</label>
                              <Input value={config.yearsInBusiness} onChange={e => setConfig({...config, yearsInBusiness: e.target.value})} />
                          </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Branding Tab */}
                <TabsContent value="branding">
                  <Card>
                    <CardHeader>
                      <CardTitle>Branding</CardTitle>
                      <CardDescription>Choose a preset or customize colors manually</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Design Presets */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Design Presets</label>
                          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => setPresetViewMode('grid')}
                              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                presetViewMode === 'grid'
                                  ? 'bg-background shadow-sm text-foreground'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              Grid
                            </button>
                            <button
                              type="button"
                              onClick={() => setPresetViewMode('coverflow')}
                              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                presetViewMode === 'coverflow'
                                  ? 'bg-background shadow-sm text-foreground'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              Coverflow
                            </button>
                          </div>
                        </div>

                        {/* Grid View */}
                        {presetViewMode === 'grid' && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {DESIGN_PRESETS.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  setConfig({
                                    ...config,
                                    primaryColor: preset.primaryColor,
                                    secondaryColor: preset.secondaryColor,
                                    accentColor: preset.accentColor,
                                    headerFooterBg: preset.headerFooterBg,
                                    headerFooterText: preset.headerFooterText,
                                    heroBgFrom: preset.heroBgFrom,
                                    heroBgTo: preset.heroBgTo,
                                    heroPattern: 'none',
                                  });
                                  toast({
                                    title: `${preset.name} Applied`,
                                    description: "Color scheme has been updated",
                                  });
                                }}
                                className={`relative group rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                                  config.primaryColor === preset.primaryColor &&
                                  config.headerFooterBg === preset.headerFooterBg
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-border hover:border-muted-foreground/50'
                                }`}
                              >
                                {/* Color Preview */}
                                <div className="flex gap-1 mb-2">
                                  <div
                                    className="h-6 w-6 rounded-full border border-white/20 shadow-sm"
                                    style={{ backgroundColor: preset.primaryColor }}
                                    title="Primary"
                                  />
                                  <div
                                    className="h-6 w-6 rounded-full border border-black/10 shadow-sm"
                                    style={{ backgroundColor: preset.secondaryColor }}
                                    title="Secondary"
                                  />
                                  <div
                                    className="h-6 w-6 rounded-full border border-white/20 shadow-sm"
                                    style={{ backgroundColor: preset.accentColor }}
                                    title="Accent"
                                  />
                                  <div
                                    className="h-6 w-6 rounded-full border border-white/20 shadow-sm"
                                    style={{ backgroundColor: preset.headerFooterBg }}
                                    title="Header/Footer"
                                  />
                                </div>
                                {/* Hero Gradient Preview */}
                                <div
                                  className="h-4 rounded mb-2 border border-white/10"
                                  style={{
                                    background: `linear-gradient(to right, ${preset.heroBgFrom}, ${preset.heroBgTo})`
                                  }}
                                />
                                <div className="text-left">
                                  <p className="text-xs font-medium truncate">{preset.name}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">{preset.description}</p>
                                </div>
                                {config.primaryColor === preset.primaryColor &&
                                 config.headerFooterBg === preset.headerFooterBg && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Coverflow View */}
                        {presetViewMode === 'coverflow' && (
                          <div className="relative min-h-[580px]">
                            <div className="flex items-center justify-center pt-24 pb-16 overflow-visible h-[500px]" style={{ perspective: '1200px' }}>
                              <div className="relative flex items-center justify-center h-full" style={{ transformStyle: 'preserve-3d' }}>
                                {DESIGN_PRESETS.map((preset, index) => {
                                  const offset = index - coverflowIndex;
                                  const absOffset = Math.abs(offset);
                                  const isCenter = offset === 0;
                                  const isVisible = absOffset <= 4;

                                  if (!isVisible) return null;

                                  return (
                                    <button
                                      key={preset.id}
                                      type="button"
                                      onClick={() => {
                                        if (isCenter) {
                                          setConfig({
                                            ...config,
                                            primaryColor: preset.primaryColor,
                                            secondaryColor: preset.secondaryColor,
                                            accentColor: preset.accentColor,
                                            headerFooterBg: preset.headerFooterBg,
                                            headerFooterText: preset.headerFooterText,
                                            heroBgFrom: preset.heroBgFrom,
                                            heroBgTo: preset.heroBgTo,
                                            heroPattern: 'none',
                                          });
                                          toast({
                                            title: `${preset.name} Applied`,
                                            description: "Color scheme has been updated",
                                          });
                                        } else {
                                          setCoverflowIndex(index);
                                        }
                                      }}
                                      className={`absolute rounded-2xl border-2 p-5 transition-all duration-300 ease-out ${
                                        isCenter
                                          ? 'border-primary ring-4 ring-primary/20'
                                          : 'border-border/50'
                                      }`}
                                      style={{
                                        width: '260px',
                                        backgroundColor: isCenter ? 'hsl(var(--background))' : 'hsl(var(--card))',
                                        boxShadow: isCenter
                                          ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 0, 0, 0.3)'
                                          : `0 ${10 + absOffset * 5}px ${20 + absOffset * 10}px -5px rgba(0, 0, 0, ${0.4 - absOffset * 0.05})`,
                                        transform: `
                                          translateX(${offset * 140}px)
                                          translateZ(${isCenter ? 80 : -absOffset * 60}px)
                                          rotateY(${offset * -30}deg)
                                          scale(${isCenter ? 1.15 : 1 - absOffset * 0.08})
                                        `,
                                        opacity: 1,
                                        zIndex: 20 - absOffset,
                                      }}
                                    >
                                      {/* Mini Site Preview */}
                                      <div className="rounded-xl overflow-hidden border-2 border-black/10 mb-4 shadow-inner">
                                        <div
                                          className="h-8 flex items-center justify-between px-3"
                                          style={{ backgroundColor: preset.headerFooterBg, color: preset.headerFooterText }}
                                        >
                                          <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded bg-current opacity-70" />
                                            <div className="h-1.5 w-12 rounded bg-current opacity-50" />
                                          </div>
                                          <div className="flex gap-2">
                                            <div className="h-1.5 w-6 rounded bg-current opacity-30" />
                                            <div className="h-1.5 w-6 rounded bg-current opacity-30" />
                                          </div>
                                        </div>
                                        <div
                                          className="h-24 flex flex-col items-center justify-center"
                                          style={{ background: `linear-gradient(135deg, ${preset.heroBgFrom}, ${preset.heroBgTo})` }}
                                        >
                                          <div className="h-2 w-24 rounded bg-white/80 mb-2" />
                                          <div className="h-1.5 w-32 rounded bg-white/50 mb-3" />
                                          <div
                                            className="h-6 w-16 rounded text-[8px] flex items-center justify-center font-semibold"
                                            style={{ backgroundColor: preset.primaryColor, color: '#fff' }}
                                          >
                                            CTA
                                          </div>
                                        </div>
                                        <div className="h-16 p-2" style={{ backgroundColor: preset.secondaryColor }}>
                                          <div className="h-1 w-8 rounded bg-gray-400 mx-auto mb-2" />
                                          <div className="grid grid-cols-3 gap-1.5 h-8">
                                            {[1, 2, 3].map((i) => (
                                              <div key={i} className="bg-white rounded shadow-sm" />
                                            ))}
                                          </div>
                                        </div>
                                        <div
                                          className="h-6 flex items-center justify-center"
                                          style={{ backgroundColor: preset.headerFooterBg, color: preset.headerFooterText }}
                                        >
                                          <div className="h-1 w-16 rounded bg-current opacity-30" />
                                        </div>
                                      </div>
                                      {/* Name and Colors */}
                                      <div className="text-center">
                                        <p className="text-base font-bold mb-1">{preset.name}</p>
                                        <p className="text-xs text-muted-foreground mb-3">{preset.description}</p>
                                        <div className="flex justify-center gap-1.5">
                                          <div className="w-6 h-6 rounded-full border-2 shadow-sm" style={{ backgroundColor: preset.primaryColor }} title="Primary" />
                                          <div className="w-6 h-6 rounded-full border-2 shadow-sm" style={{ backgroundColor: preset.secondaryColor }} title="Secondary" />
                                          <div className="w-6 h-6 rounded-full border-2 shadow-sm" style={{ backgroundColor: preset.accentColor }} title="Accent" />
                                          <div className="w-6 h-6 rounded-full border-2 shadow-sm" style={{ backgroundColor: preset.headerFooterBg }} title="Header/Footer" />
                                        </div>
                                      </div>
                                      {isCenter && (
                                        <>
                                          {/* Hover zones for navigation */}
                                          <div
                                            className="absolute left-0 top-0 w-1/3 h-full cursor-w-resize z-10 group/left"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setCoverflowIndex(prev => prev === 0 ? DESIGN_PRESETS.length - 1 : prev - 1);
                                            }}
                                          >
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/left:opacity-100 transition-opacity">
                                              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                              </svg>
                                            </div>
                                          </div>
                                          <div
                                            className="absolute right-0 top-0 w-1/3 h-full cursor-e-resize z-10 group/right"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setCoverflowIndex(prev => prev === DESIGN_PRESETS.length - 1 ? 0 : prev + 1);
                                            }}
                                          >
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/right:opacity-100 transition-opacity">
                                              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                              </svg>
                                            </div>
                                          </div>
                                          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full shadow-lg">
                                            Press Enter or Click to Apply
                                          </div>
                                        </>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            {/* Navigation */}
                            <div className="flex items-center justify-center gap-6 mt-2">
                              <button
                                type="button"
                                onClick={() => setCoverflowIndex(prev => prev === 0 ? DESIGN_PRESETS.length - 1 : prev - 1)}
                                className="p-3 rounded-full border-2 hover:bg-muted transition-all hover:scale-110"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              <span className="text-base font-medium text-muted-foreground min-w-[80px] text-center">
                                {coverflowIndex + 1} / {DESIGN_PRESETS.length}
                              </span>
                              <button
                                type="button"
                                onClick={() => setCoverflowIndex(prev => prev === DESIGN_PRESETS.length - 1 ? 0 : prev + 1)}
                                className="p-3 rounded-full border-2 hover:bg-muted transition-all hover:scale-110"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-sm text-muted-foreground text-center mt-3">
                              Use <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">←</kbd> <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">→</kbd> arrow keys to navigate
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">Or customize manually</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Primary</label>
                            <Input type="color" className="h-10 w-full" value={config.primaryColor} onChange={e => setConfig({...config, primaryColor: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Secondary</label>
                            <Input type="color" className="h-10 w-full" value={config.secondaryColor} onChange={e => setConfig({...config, secondaryColor: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Accent</label>
                            <Input type="color" className="h-10 w-full" value={config.accentColor} onChange={e => setConfig({...config, accentColor: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Header/Footer Bg</label>
                            <Input type="color" className="h-10 w-full" value={config.headerFooterBg} onChange={e => setConfig({...config, headerFooterBg: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Footer Text</label>
                            <Input type="color" className="h-10 w-full" value={config.headerFooterText} onChange={e => setConfig({...config, headerFooterText: e.target.value})} />
                          </div>
                          <div className="space-y-2 col-span-2 md:col-span-4">
                            <label className="text-sm font-medium">Hero Gradient</label>
                            <div className="flex gap-3 items-center">
                              <div className="flex-1 space-y-1">
                                <span className="text-xs text-muted-foreground">From</span>
                                <Input type="color" className="h-10 w-full" value={config.heroBgFrom || '#1f2937'} onChange={e => setConfig({...config, heroBgFrom: e.target.value})} />
                              </div>
                              <div className="flex-1 space-y-1">
                                <span className="text-xs text-muted-foreground">To</span>
                                <Input type="color" className="h-10 w-full" value={config.heroBgTo || '#111827'} onChange={e => setConfig({...config, heroBgTo: e.target.value})} />
                              </div>
                              {(config.heroBgFrom || config.heroBgTo) && (
                                <button 
                                  type="button"
                                  onClick={() => setConfig({...config, heroBgFrom: '', heroBgTo: ''})}
                                  className="text-xs text-muted-foreground hover:text-foreground px-2 pt-4"
                                  title="Reset to default gradient"
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">Leave empty for default dark gradient</p>
                          </div>
                      </div>
                      
                      {/* Hero Pattern Selector */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Hero Background Pattern</label>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                          {[
                            { id: 'none', label: 'None' },
                            { id: 'dots', label: 'Dots' },
                            { id: 'grid', label: 'Grid' },
                            { id: 'crosses', label: 'Crosses' },
                            { id: 'diagonal', label: 'Diagonal' },
                            { id: 'waves', label: 'Waves' },
                            { id: 'hexagons', label: 'Hexagons' },
                            { id: 'circles', label: 'Circles' },
                          ].map((pattern) => (
                            <button
                              key={pattern.id}
                              type="button"
                              onClick={() => setConfig({...config, heroPattern: pattern.id})}
                              className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                                config.heroPattern === pattern.id 
                                  ? 'border-primary ring-2 ring-primary/20' 
                                  : 'border-border hover:border-muted-foreground/50'
                              }`}
                              title={pattern.label}
                            >
                              <div className="absolute inset-0 bg-slate-800">
                                {pattern.id === 'none' && (
                                  <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                  </div>
                                )}
                                {pattern.id === 'dots' && (
                                  <svg className="w-full h-full opacity-40" viewBox="0 0 40 40"><pattern id="dots-prev" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="white"/></pattern><rect fill="url(#dots-prev)" width="40" height="40"/></svg>
                                )}
                                {pattern.id === 'grid' && (
                                  <svg className="w-full h-full opacity-30" viewBox="0 0 40 40"><pattern id="grid-prev" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 5h10M5 0v10" stroke="white" strokeWidth="0.5" fill="none"/></pattern><rect fill="url(#grid-prev)" width="40" height="40"/></svg>
                                )}
                                {pattern.id === 'crosses' && (
                                  <svg className="w-full h-full opacity-30" viewBox="0 0 40 40"><pattern id="cross-prev" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M5 3v4M3 5h4" stroke="white" strokeWidth="1" fill="none"/></pattern><rect fill="url(#cross-prev)" width="40" height="40"/></svg>
                                )}
                                {pattern.id === 'diagonal' && (
                                  <svg className="w-full h-full opacity-25" viewBox="0 0 40 40"><pattern id="diag-prev" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8L8 0" stroke="white" strokeWidth="0.5" fill="none"/></pattern><rect fill="url(#diag-prev)" width="40" height="40"/></svg>
                                )}
                                {pattern.id === 'waves' && (
                                  <svg className="w-full h-full opacity-25" viewBox="0 0 40 40"><pattern id="wave-prev" x="0" y="0" width="20" height="10" patternUnits="userSpaceOnUse"><path d="M0 5 Q5 0, 10 5 T20 5" stroke="white" strokeWidth="0.5" fill="none"/></pattern><rect fill="url(#wave-prev)" width="40" height="40"/></svg>
                                )}
                                {pattern.id === 'hexagons' && (
                                  <svg className="w-full h-full opacity-25" viewBox="0 0 40 40"><pattern id="hex-prev" x="0" y="0" width="14" height="12" patternUnits="userSpaceOnUse"><path d="M7 0L14 3.5L14 8.5L7 12L0 8.5L0 3.5Z" stroke="white" strokeWidth="0.5" fill="none"/></pattern><rect fill="url(#hex-prev)" width="40" height="40"/></svg>
                                )}
                                {pattern.id === 'circles' && (
                                  <svg className="w-full h-full opacity-20" viewBox="0 0 40 40"><pattern id="circ-prev" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="5" stroke="white" strokeWidth="0.5" fill="none"/></pattern><rect fill="url(#circ-prev)" width="40" height="40"/></svg>
                                )}
                              </div>
                              {config.heroPattern === pattern.id && (
                                <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Select a subtle background pattern for the hero section</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-sm font-medium">Footer Text Color</label>
                             <div className="flex gap-2">
                                <Input type="color" className="h-10 w-12" value={config.headerFooterText} onChange={e => setConfig({...config, headerFooterText: e.target.value})} />
                                <Input value={config.headerFooterText} onChange={e => setConfig({...config, headerFooterText: e.target.value})} className="font-mono flex-1" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-sm font-medium">Logo Type</label>
                             <Select value={config.logoType} onValueChange={(val) => setConfig({...config, logoType: val})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Logo</SelectItem>
                                    <SelectItem value="emoji">Emoji Icon</SelectItem>
                                    <SelectItem value="image">Image Logo</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {config.logoType === 'none' ? (
                             <div className="space-y-2">
                                 <label className="text-sm font-medium">Logo</label>
                                 <div className="flex items-center text-sm text-muted-foreground px-3 py-2 bg-muted/50 rounded border">
                                    No logo will be displayed - company name only
                                 </div>
                             </div>
                           ) : config.logoType === 'emoji' ? (
                             <div className="space-y-2">
                                 <label className="text-sm font-medium">Icon Emoji</label>
                                 <div className="flex gap-2">
                                    <Input value={config.icon} onChange={e => setConfig({...config, icon: e.target.value})} className="w-24 text-center text-lg" />
                                    <Button variant="outline" size="icon" onClick={() => setIsEmojiPickerOpen(true)}>
                                        <Smile className="w-4 h-4" />
                                    </Button>
                                    <div className="flex-1 flex items-center text-xs text-muted-foreground px-2 bg-muted/50 rounded">
                                        Using emoji as logo
                                    </div>
                                 </div>
                             </div>
                           ) : (
                             <div className="space-y-2">
                                 <label className="text-sm font-medium">Logo Image</label>
                                 <ImageUpload 
                                    value={config.logoUrl} 
                                    onChange={(url: string, absPath?: string) => setConfig({
                                        ...config, 
                                        logoUrl: url, 
                                        logoAbsolutePath: absPath || ''
                                    })} 
                                 />
                             </div>
                           )}
                           <div className="space-y-2">
                               <label className="text-sm font-medium">Favicon Image</label>
                               <ImageUpload 
                                    value={config.faviconUrl} 
                                    onChange={(url: string, absPath?: string) => setConfig({
                                        ...config, 
                                        faviconUrl: url, 
                                        faviconAbsolutePath: absPath || ''
                                    })} 
                                />
                           </div>
                       </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Heading Font</label>
                              <Input value={config.fontHeading} onChange={e => setConfig({...config, fontHeading: e.target.value})} placeholder="Poppins" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Body Font</label>
                              <Input value={config.fontBody} onChange={e => setConfig({...config, fontBody: e.target.value})} placeholder="Inter" />
                          </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Service & Hours Tab */}
                <TabsContent value="service">
                  <Card>
                    <CardHeader><CardTitle>Service & Hours</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Business Type</label>
                          <Select 
                              value={config.businessType} 
                              onValueChange={(val) => setConfig({...config, businessType: val, industry: '', services: []})}
                          >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type..." />
                              </SelectTrigger>
                              <SelectContent>
                                {BUSINESS_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                ))}
                              </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Industry</label>
                          <Select 
                              value={config.industry} 
                              onValueChange={(val) => setConfig({...config, industry: val, services: []})}
                              disabled={!config.businessType}
                          >
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry..." />
                              </SelectTrigger>
                              <SelectContent>
                                {industryOptions.map(ind => (
                                    <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
                                ))}
                              </SelectContent>
                          </Select>
                        </div>
                      </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Services</label>
                            <Card className="border-dashed bg-muted/20">
                                <CardContent className="p-3">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {config.services.length > 0 ? config.services.map(s => {
                                            const serviceObj = availableServices.find((as: { slug: string; name: string }) => as.slug === s);
                                            const label = serviceObj ? serviceObj.name : s;
                                            return (
                                                <Badge key={s} variant="secondary" className="pl-2 pr-1 h-7 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors group" onClick={() => removeService(s)}>
                                                  {label}
                                                  <X className="w-3 h-3 ml-1 group-hover:text-current opacity-70" />
                                                </Badge>
                                            )
                                        }) : (
                                            <span className="text-sm text-muted-foreground italic px-1">No services selected. Add/type below.</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input 
                                                className="bg-background h-9" 
                                                placeholder="Type custom service & press Enter..." 
                                                value={customServiceInput}
                                                onChange={e => setCustomServiceInput(e.target.value)}
                                                onKeyDown={handleAddCustomService}
                                            />
                                        </div>
                                    </div>
                                    {config.industry && availableServices.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-xs font-semibold text-muted-foreground mb-2 px-1 uppercase tracking-wider">Suggested for {config.industry}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {availableServices.filter((s: { slug: string; name: string }) => !config.services.includes(s.slug)).map((s: { slug: string; name: string }) => (
                                                    <Badge 
                                                    key={s.slug} 
                                                    variant="outline" 
                                                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all active:scale-95"
                                                    onClick={() => addService(s.slug)}
                                                    >
                                                    + {s.name}
                                                    </Badge>
                                                ))}
                                                {availableServices.every((s: { slug: string; name: string }) => config.services.includes(s.slug)) && (
                                                    <span className="text-xs text-muted-foreground px-1">All suggested services selected.</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Primary City</label>
                              <Input value={config.primaryCity} onChange={e => setConfig({...config, primaryCity: e.target.value})} placeholder={config.city || "Primary City"} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Service Areas (comma sep)</label>
                              <Input value={config.serviceAreas} onChange={e => setConfig({...config, serviceAreas: e.target.value})} placeholder="City 1, City 2, City 3" />
                          </div>
                        </div>
                        <div className="space-y-2 pt-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium">Service Radius</label>
                                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{config.serviceRadius} miles</span>
                            </div>
                            <input 
                              type="range" 
                              min="5" 
                              max="100" 
                              step="5" 
                              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                              value={config.serviceRadius} 
                              onChange={e => setConfig({...config, serviceRadius: e.target.value})} 
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                           <input 
                              type="checkbox" 
                              id="emergencyService"
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={config.emergencyService} 
                              onChange={e => setConfig({...config, emergencyService: e.target.checked})} 
                           />
                           <label htmlFor="emergencyService" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Offers 24/7 Emergency Service
                           </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Weekdays</label>
                              <Input value={config.hoursWeekdays} onChange={e => setConfig({...config, hoursWeekdays: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Saturday</label>
                              <Input value={config.hoursSaturday} onChange={e => setConfig({...config, hoursSaturday: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Sunday</label>
                              <Input value={config.hoursSunday} onChange={e => setConfig({...config, hoursSunday: e.target.value})} />
                          </div>
                        </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Site Setup Tab */}
                <TabsContent value="setup">
                  <Card>
                    <CardHeader>
                      <CardTitle>Site Setup</CardTitle>
                      <CardDescription>Basic site configuration and type</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">URL Slug</label>
                            <Input value={config.slug} onChange={e => setConfig({...config, slug: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project Folder</label>
                            <Input value={config.projectName} onChange={e => setConfig({...config, projectName: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-medium">Production URL</label>
                          <Input value={config.siteUrl} placeholder="https://example.com" onChange={e => setConfig({...config, siteUrl: e.target.value})} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Integrations (GHL & Social) Tab */}
                <TabsContent value="integrations">
                  <Card>
                    <CardHeader><CardTitle>Integrations</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground">GoHighLevel</h3>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Form Embed Script</label>
                          <Input value={config.ghlFormEmbed} onChange={e => setConfig({...config, ghlFormEmbed: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Chat Widget Script</label>
                          <Input value={config.ghlChatWidget} onChange={e => setConfig({...config, ghlChatWidget: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Calendar Embed Script</label>
                          <Input value={config.ghlCalendarEmbed} onChange={e => setConfig({...config, ghlCalendarEmbed: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Webhook URL</label>
                          <Input value={config.ghlWebhookUrl} onChange={e => setConfig({...config, ghlWebhookUrl: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tracking ID</label>
                          <Input value={config.ghlTrackingId} onChange={e => setConfig({...config, ghlTrackingId: e.target.value})} />
                        </div>
                        
                        <h3 className="text-sm font-semibold text-muted-foreground pt-4">Analytics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-sm font-medium">Google Analytics ID</label>
                               <Input value={config.googleAnalyticsId} onChange={e => setConfig({...config, googleAnalyticsId: e.target.value})} placeholder="G-XXXXXXXX" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-sm font-medium">Google Tag Manager ID</label>
                               <Input value={config.googleTagManagerId} onChange={e => setConfig({...config, googleTagManagerId: e.target.value})} placeholder="GTM-XXXXXXXX" />
                            </div>
                        </div>

                        <h3 className="text-sm font-semibold text-muted-foreground pt-4">Social & Reviews</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Facebook URL</label>
                              <Input value={config.facebookUrl} onChange={e => setConfig({...config, facebookUrl: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Instagram URL</label>
                              <Input value={config.instagramUrl} onChange={e => setConfig({...config, instagramUrl: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Google Business URL</label>
                              <Input value={config.googleBusinessUrl} onChange={e => setConfig({...config, googleBusinessUrl: e.target.value})} />
                          </div>
                           <div className="space-y-2">
                              <label className="text-sm font-medium">Yelp URL</label>
                              <Input value={config.yelpUrl} onChange={e => setConfig({...config, yelpUrl: e.target.value})} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Rating (0-5)</label>
                              <Input value={config.ratingValue} onChange={e => setConfig({...config, ratingValue: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Review Count</label>
                              <Input value={config.reviewCount} onChange={e => setConfig({...config, reviewCount: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-medium">Google Review Link</label>
                           <Input value={config.googleReviewLink} onChange={e => setConfig({...config, googleReviewLink: e.target.value})} />
                        </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

            </div>

            {/* Sticky Preview Sidebar */}
            <div className="space-y-4">
              {/* Live Site Preview */}
              <Card className="sticky top-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Site Preview</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                    {/* Mini Header */}
                    <div
                      className="h-7 flex items-center justify-between px-2"
                      style={{ backgroundColor: config.headerFooterBg, color: config.headerFooterText }}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-current opacity-80" />
                        <div className="h-1.5 w-12 rounded bg-current opacity-60" />
                      </div>
                      <div className="flex gap-1.5">
                        <div className="h-1.5 w-6 rounded bg-current opacity-40" />
                        <div className="h-1.5 w-6 rounded bg-current opacity-40" />
                        <div className="h-1.5 w-6 rounded bg-current opacity-40" />
                      </div>
                      <div
                        className="h-3 w-10 rounded text-[5px] flex items-center justify-center font-medium"
                        style={{ backgroundColor: config.primaryColor, color: '#fff' }}
                      >
                        CTA
                      </div>
                    </div>

                    {/* Mini Hero */}
                    <div
                      className="h-20 flex flex-col items-center justify-center relative overflow-hidden"
                      style={{
                        background: config.heroBgFrom && config.heroBgTo
                          ? `linear-gradient(135deg, ${config.heroBgFrom}, ${config.heroBgTo})`
                          : `linear-gradient(135deg, ${config.primaryColor}, ${config.headerFooterBg})`
                      }}
                    >
                      {config.heroPattern && config.heroPattern !== 'none' && (
                        <div className="absolute inset-0 opacity-10" style={{
                          backgroundImage: config.heroPattern === 'dots'
                            ? 'radial-gradient(circle, white 1px, transparent 1px)'
                            : config.heroPattern === 'grid'
                            ? 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)'
                            : 'none',
                          backgroundSize: config.heroPattern === 'dots' ? '6px 6px' : '10px 10px'
                        }} />
                      )}
                      <div className="h-2.5 w-28 rounded bg-white/90 mb-1.5" />
                      <div className="h-1.5 w-40 rounded bg-white/60 mb-2" />
                      <div className="flex gap-1.5">
                        <div
                          className="h-4 w-12 rounded text-[5px] flex items-center justify-center font-medium"
                          style={{ backgroundColor: config.primaryColor, color: '#fff' }}
                        >
                          Button
                        </div>
                        <div
                          className="h-4 w-12 rounded text-[5px] flex items-center justify-center font-medium border"
                          style={{ borderColor: 'white', color: 'white' }}
                        >
                          Button
                        </div>
                      </div>
                    </div>

                    {/* Mini Content Section */}
                    <div className="p-2" style={{ backgroundColor: config.secondaryColor }}>
                      <div className="text-center mb-1.5">
                        <div className="h-1 w-10 rounded mx-auto mb-0.5" style={{ backgroundColor: config.primaryColor }} />
                        <div className="h-1.5 w-20 rounded bg-gray-800 mx-auto mb-0.5" />
                        <div className="h-1 w-28 rounded bg-gray-400 mx-auto" />
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-white rounded p-1.5 shadow-sm">
                            <div className="h-4 rounded mb-0.5" style={{ backgroundColor: config.secondaryColor }} />
                            <div className="h-1 w-full rounded bg-gray-300 mb-0.5" />
                            <div className="h-0.5 w-3/4 rounded bg-gray-200" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mini CTA Section */}
                    <div className="p-1.5 flex items-center justify-center" style={{ backgroundColor: config.primaryColor }}>
                      <div className="h-4 w-16 rounded bg-white text-[5px] flex items-center justify-center font-medium" style={{ color: config.primaryColor }}>
                        Get Quote
                      </div>
                    </div>

                    {/* Mini Footer */}
                    <div
                      className="h-5 flex items-center justify-center gap-2 px-2"
                      style={{ backgroundColor: config.headerFooterBg, color: config.headerFooterText }}
                    >
                      <div className="h-1 w-8 rounded bg-current opacity-40" />
                      <div className="h-1 w-8 rounded bg-current opacity-40" />
                      <div className="h-1 w-8 rounded bg-current opacity-40" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* JSON Preview */}
              <Card>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                     <CardTitle className="text-lg">JSON Preview</CardTitle>
                     <Button variant="ghost" size="sm" onClick={handleCopyJson}>
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                     </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="bg-zinc-950 text-zinc-50 p-4 font-mono text-xs overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                    <pre>{JSON.stringify(constructedConfig, null, 2)}</pre>
                  </div>
                </CardContent>
              </Card>
            </div>

         </div>
      </div>

      {isEmojiPickerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsEmojiPickerOpen(false)} />
            <div className="relative z-50 w-full max-w-sm h-full bg-white dark:bg-zinc-950 shadow-2xl border-l animate-in slide-in-from-right duration-300 flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-zinc-900">
                    <h2 className="text-lg font-semibold">Select Emoji</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsEmojiPickerOpen(false)}><X className="w-5 h-5" /></Button>
                </div>
                <div className="p-4 border-b space-y-3 bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search emojis..." 
                            className="pl-9" 
                            value={emojiSearch}
                            onChange={(e) => setEmojiSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                        {EMOJI_CATEGORIES.map(cat => (
                            <Badge 
                                key={cat} 
                                variant={emojiCategory === cat ? "default" : "outline"} 
                                className="cursor-pointer whitespace-nowrap hover:bg-secondary"
                                onClick={() => setEmojiCategory(cat)}
                            >
                                {cat}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="p-4 grid grid-cols-6 gap-2 overflow-y-auto flex-1 content-start">
                    {filteredEmojis.map(item => (
                        <button 
                            key={item.char} 
                            onClick={() => {
                                setConfig({...config, icon: item.char});
                                setIsEmojiPickerOpen(false);
                            }} 
                            className="text-2xl hover:bg-muted p-2 rounded-lg transition-colors flex items-center justify-center aspect-square"
                            title={item.keywords.join(', ')}
                        >
                            {item.char}
                        </button>
                    ))}
                    {filteredEmojis.length === 0 && (
                        <div className="col-span-6 text-center text-muted-foreground py-8 text-sm">
                            No emojis found.
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {generationResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                        <Check className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Site Generated Successfully!</h2>
                        <p className="text-sm text-zinc-400">Your new website is ready to deploy.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-zinc-900 rounded-lg p-4 font-mono text-sm text-zinc-300 relative group">
                        <div className="flex justify-between items-start mb-2">
                             <span className="text-xs uppercase text-zinc-500 font-bold">Terminal Commands</span>
                             <button
                               onClick={() => {
                                  // @ts-ignore
                                  navigator.clipboard.writeText(`cd ${generationResult.path}\nnpm install\nnpm run dev`);
                                  toast({ title: "Copied to clipboard" });
                               }}
                               className="text-zinc-500 hover:text-white transition-colors"
                             >
                                <Copy className="w-4 h-4" />
                             </button>
                        </div>
                        <div className="space-y-1">
                            <div className="flex gap-2"><span className="text-green-500">$</span> cd {generationResult.path}</div>
                            <div className="flex gap-2"><span className="text-green-500">$</span> npm install</div>
                            <div className="flex gap-2"><span className="text-green-500">$</span> npm run dev</div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <Button onClick={() => setGenerationResult(null)}>Close</Button>
                </div>
            </div>
        </div>
      )}
    </Layout>
  );
}
