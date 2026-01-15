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
        const knownService = availableServices.find(s => s.slug === slugOrName || s.name === slugOrName);
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
          logoUrl: config.logoType === 'image' ? (config.logoAbsolutePath || config.logoUrl) : '',
          faviconUrl: config.faviconAbsolutePath || config.faviconUrl,
          primaryColor: config.primaryColor,
          secondaryColor: config.secondaryColor,
          accentColor: config.accentColor,
          headerFooterBg: config.headerFooterBg,
          headerFooterText: config.headerFooterText,
          fontHeading: config.fontHeading,
          fontBody: config.fontBody,
          icon: config.icon,
          tagline: config.tagline,
        },
        industry: {
          slug: config.industry,
          type: industryTypeLabel,
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
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Primary Info</label>
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
                                    <SelectItem value="emoji">Emoji Icon</SelectItem>
                                    <SelectItem value="image">Image Logo</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {config.logoType === 'emoji' ? (
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
                                            const serviceObj = availableServices.find(as => as.slug === s);
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
                                                {availableServices.filter(s => !config.services.includes(s.slug)).map(s => (
                                                    <Badge 
                                                    key={s.slug} 
                                                    variant="outline" 
                                                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all active:scale-95"
                                                    onClick={() => addService(s.slug)}
                                                    >
                                                    + {s.name}
                                                    </Badge>
                                                ))}
                                                {availableServices.every(s => config.services.includes(s.slug)) && (
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
            <div className="space-y-6">
              <Card className="sticky top-6">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                     <CardTitle className="text-lg">Live JSON Preview</CardTitle>
                     <Button variant="ghost" size="sm" onClick={handleCopyJson}>
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                     </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="bg-zinc-950 text-zinc-50 p-4 font-mono text-xs overflow-x-auto h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
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
