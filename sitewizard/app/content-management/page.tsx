'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import { RichTextEditor } from '@/components/RichTextEditor';
import {
  FileEdit,
  Save,
  Loader2,
  ChevronDown,
  RefreshCw,
  Eye,
  Layout as LayoutIcon,
  Type,
  FileText,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { getApiUrl, getSiteId } from '@/lib/api';

// Available tokens that can be inserted into content
const AVAILABLE_TOKENS = [
  { token: '{company_name}', label: 'Company Name', description: 'Your business name', category: 'Company', preview: 'Company Name' },
  { token: '{primary_city}', label: 'Primary City', description: 'Main service city', category: 'Location', preview: 'City' },
  { token: '{state}', label: 'State', description: 'Business state', category: 'Location', preview: 'State' },
  { token: '{phone}', label: 'Phone Number', description: 'Business phone', category: 'Contact', preview: '(555) 555-5555' },
  { token: '{email}', label: 'Email', description: 'Business email', category: 'Contact', preview: 'email@example.com' },
  { token: '{industry}', label: 'Industry Type', description: 'Your service type', category: 'Company', preview: 'Service' },
  { token: '{years_in_business}', label: 'Years in Business', description: 'Experience years', category: 'Company', preview: '10' },
  { token: '{service_radius}', label: 'Service Radius', description: 'Service area radius', category: 'Location', preview: '25' },
  { token: '{license}', label: 'License Number', description: 'Business license', category: 'Company', preview: 'LIC#12345' },
  { token: '{tagline}', label: 'Tagline', description: 'Company tagline', category: 'Company', preview: 'Your tagline' },
];

// Group tokens by category
const TOKEN_CATEGORIES = AVAILABLE_TOKENS.reduce((acc, token) => {
  if (!acc[token.category]) acc[token.category] = [];
  acc[token.category].push(token);
  return acc;
}, {} as Record<string, typeof AVAILABLE_TOKENS>);

// Define available pages and sections
const PAGE_SECTIONS = {
  landing: {
    label: 'Landing Page',
    icon: LayoutIcon,
    sections: {
      hero: {
        label: 'Hero Section',
        description: 'The main intro section with headline and description',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'Main headline text' },
          { key: 'subheadline', label: 'Subheadline', description: 'Supporting text below the headline' }
        ]
      },
      services: {
        label: 'Services Section',
        description: '"Our Services" section with title and description',
        contentKeys: [
          { key: 'badge', label: 'Section Badge', description: 'Small text above the heading (e.g., "Our Services")' },
          { key: 'headline', label: 'Headline', description: 'Main section heading' },
          { key: 'description', label: 'Description', description: 'Supporting text describing your services' }
        ]
      },
      'why-choose-us': {
        label: 'Why Choose Us',
        description: '"Why Choose Us" section explaining your value proposition',
        contentKeys: [
          { key: 'badge', label: 'Section Badge', description: 'Small text above the heading (e.g., "Why Choose Us")' },
          { key: 'headline', label: 'Headline', description: 'Main section heading' },
          { key: 'description', label: 'Description', description: 'Supporting text about why customers should choose you' }
        ]
      },
      testimonials: {
        label: 'Testimonials',
        description: 'Customer testimonials section',
        contentKeys: [
          { key: 'badge', label: 'Section Badge', description: 'Small text above the heading (e.g., "Testimonials")' },
          { key: 'headline', label: 'Headline', description: 'Main section heading' }
        ]
      },
      'service-areas': {
        label: 'Service Areas',
        description: 'Geographic coverage and service area information',
        contentKeys: [
          { key: 'badge', label: 'Section Badge', description: 'Small text above the heading (e.g., "Service Areas")' },
          { key: 'headline', label: 'Headline', description: 'Main section heading' },
          { key: 'description', label: 'Description', description: 'Description of your service coverage area' }
        ]
      },
      'gallery-preview': {
        label: 'Our Work / Gallery',
        description: 'Showcase of recent projects and work',
        contentKeys: [
          { key: 'badge', label: 'Section Badge', description: 'Small text above the heading (e.g., "Our Work")' },
          { key: 'headline', label: 'Headline', description: 'Main section heading' },
          { key: 'description', label: 'Description', description: 'Supporting text about your work' }
        ]
      },
      cta: {
        label: 'Call to Action',
        description: 'The main call-to-action section',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'Main CTA heading' },
          { key: 'description', label: 'Description', description: 'Supporting text encouraging action' }
        ]
      },
      footer: {
        label: 'Footer',
        description: 'Footer content and tagline',
        contentKeys: [
          { key: 'description', label: 'Footer Text', description: 'Short description in the footer' }
        ]
      }
    }
  },
  services: {
    label: 'Services Page',
    icon: LayoutIcon,
    sections: {
      hero: {
        label: 'Hero Section',
        description: 'The main intro section at the top of the services page',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'Main headline (e.g., "Our Electrical Services")' },
          { key: 'description', label: 'Description', description: 'Supporting text describing your services overview' }
        ]
      },
      'services-list': {
        label: 'Services List',
        description: 'The browsable list of services',
        contentKeys: [
          { key: 'badge', label: 'Section Badge', description: 'Small text above the heading (e.g., "What We Offer")' },
          { key: 'headline', label: 'Headline', description: 'Main section heading (e.g., "Browse Our Services")' },
          { key: 'description', label: 'Description', description: 'Instructions or supporting text for browsing services' }
        ]
      },
      cta: {
        label: 'Call to Action',
        description: 'The CTA section at the bottom of the services page',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'CTA heading (e.g., "Need Electrical Help?")' },
          { key: 'description', label: 'Description', description: 'Supporting text encouraging contact' }
        ]
      }
    }
  },
  gallery: {
    label: 'Gallery Page',
    icon: LayoutIcon,
    sections: {
      hero: {
        label: 'Hero Section',
        description: 'The main intro section at the top of the gallery page',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'Main headline (e.g., "Our Work Gallery")' },
          { key: 'description', label: 'Description', description: 'Supporting text about your portfolio' }
        ]
      },
      portfolio: {
        label: 'Portfolio Section',
        description: 'The gallery browsing section',
        contentKeys: [
          { key: 'badge', label: 'Section Badge', description: 'Small text above the heading (e.g., "Our Portfolio")' },
          { key: 'headline', label: 'Headline', description: 'Main section heading' },
          { key: 'description', label: 'Description', description: 'Instructions for browsing the gallery' }
        ]
      }
    }
  },
  about: {
    label: 'About Page',
    icon: LayoutIcon,
    sections: {
      hero: {
        label: 'Hero Section',
        description: 'The main intro section at the top of the about page',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'Main headline (e.g., "About Company Name")' },
          { key: 'description', label: 'Description', description: 'Brief intro about your company' }
        ]
      },
      story: {
        label: 'Our Story',
        description: 'The main about content section',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'Section heading (e.g., "Committed to Excellence")' },
          { key: 'content', label: 'Content', description: 'Your company story and background (supports rich text)' }
        ]
      },
      values: {
        label: 'Our Values',
        description: 'Company values section',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'Section heading (e.g., "Our Values")' },
          { key: 'description', label: 'Description', description: 'Supporting text about your values' }
        ]
      },
      team: {
        label: 'Meet Our Team',
        description: 'Team section header',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'Section heading (e.g., "Meet Our Team")' },
          { key: 'description', label: 'Description', description: 'Supporting text about your team' }
        ]
      },
      cta: {
        label: 'Call to Action',
        description: 'The CTA section at the bottom of the about page',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'CTA heading (e.g., "Ready to Work With Us?")' },
          { key: 'description', label: 'Description', description: 'Supporting text encouraging contact' }
        ]
      }
    }
  },
  reviews: {
    label: 'Reviews Page',
    icon: LayoutIcon,
    sections: {
      hero: {
        label: 'Hero Section',
        description: 'The main intro section at the top of the reviews page',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'Main headline (e.g., "Customer Reviews")' },
          { key: 'description', label: 'Description', description: 'Supporting text about your reviews' }
        ]
      },
      testimonials: {
        label: 'Testimonials Section',
        description: 'The reviews browsing section',
        contentKeys: [
          { key: 'badge', label: 'Section Badge', description: 'Small text above the heading (e.g., "Testimonials")' },
          { key: 'headline', label: 'Headline', description: 'Main section heading' },
          { key: 'description', label: 'Description', description: 'Instructions for browsing reviews' }
        ]
      },
      'leave-review': {
        label: 'Leave a Review',
        description: 'Section encouraging customers to leave reviews',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'Section heading (e.g., "Had a Great Experience?")' },
          { key: 'description', label: 'Description', description: 'Text encouraging customers to leave a review' }
        ]
      },
      cta: {
        label: 'Call to Action',
        description: 'The CTA section at the bottom of the reviews page',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'CTA heading (e.g., "Join Our Happy Customers")' },
          { key: 'description', label: 'Description', description: 'Supporting text encouraging contact' }
        ]
      }
    }
  },
  promotions: {
    label: 'Promotions Page',
    icon: LayoutIcon,
    sections: {
      hero: {
        label: 'Hero Section',
        description: 'The main intro section at the top of the promotions page',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'Main headline (e.g., "Current Promotions")' },
          { key: 'description', label: 'Description', description: 'Supporting text about your promotions' }
        ]
      },
      promos: {
        label: 'Promotions Section',
        description: 'The promo codes section',
        contentKeys: [
          { key: 'badge', label: 'Section Badge', description: 'Small text above the heading (e.g., "Limited Time Offers")' },
          { key: 'headline', label: 'Headline', description: 'Main section heading (e.g., "Use These Codes & Save")' },
          { key: 'description', label: 'Description', description: 'Instructions for using promo codes' }
        ]
      },
      cta: {
        label: 'Call to Action',
        description: 'The CTA section at the bottom of the promotions page',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'CTA heading (e.g., "Ready to Save?")' },
          { key: 'description', label: 'Description', description: 'Supporting text encouraging booking' }
        ]
      }
    }
  },
  contact: {
    label: 'Contact Page',
    icon: LayoutIcon,
    sections: {
      hero: {
        label: 'Hero Section',
        description: 'The main intro section at the top of the contact page',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'Main headline (e.g., "Contact Us")' },
          { key: 'description', label: 'Description', description: 'Brief intro text' }
        ]
      },
      'get-in-touch': {
        label: 'Get in Touch',
        description: 'Contact information section',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'Section heading (e.g., "Get in Touch")' },
          { key: 'description', label: 'Description', description: 'Supporting text about contacting you' }
        ]
      },
      form: {
        label: 'Contact Form',
        description: 'Contact form section header',
        contentKeys: [
          { key: 'headline', label: 'Headline', description: 'Form section heading (e.g., "Send Us a Message")' }
        ]
      }
    }
  }
};

interface ContentItem {
  id: string;
  siteId: string;
  page: string;
  section: string;
  contentKey: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContentManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [siteId, setSiteId] = useState<string | null>(null);

  // Selected page and section
  const [selectedPage, setSelectedPage] = useState<string>('landing');
  const [selectedSection, setSelectedSection] = useState<string>('hero');

  // Content state
  const [contentMap, setContentMap] = useState<Record<string, string>>({});
  const [originalContentMap, setOriginalContentMap] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Track which content keys have been modified
  const [modifiedKeys, setModifiedKeys] = useState<Set<string>>(new Set());

  // Get current page and section config
  const currentPageConfig = PAGE_SECTIONS[selectedPage as keyof typeof PAGE_SECTIONS];
  const currentSectionConfig = currentPageConfig?.sections[selectedSection as keyof typeof currentPageConfig.sections];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const apiUrl = getApiUrl();

      // Fetch user profile to check admin status
      fetch(`${apiUrl}/api/v1/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const hasSiteAdminRole = data.roles?.includes('Site Admin');
          const hasAdminRole = data.roles?.includes('Admin');
          setIsSiteAdmin(hasSiteAdminRole);
          setIsAdmin(hasAdminRole);

          if (!hasSiteAdminRole && !hasAdminRole) {
            router.push('/404');
            return;
          }

          // Get site ID from environment variable (for generated sites) or localStorage
          const envSiteId = getSiteId();
          const storedSiteId = localStorage.getItem('siteId');
          setSiteId(envSiteId || storedSiteId || null);

          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error:', error);
          toast({
            title: "Error",
            description: "Failed to load user profile. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
        });
    }
  }, [toast, router]);

  // Fetch content when page/section changes
  useEffect(() => {
    if (!siteId || !selectedPage || !selectedSection) return;

    const fetchContent = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = getApiUrl();

        const response = await fetch(
          `${apiUrl}/api/v1/site-content/${selectedPage}/${selectedSection}`,
          {
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
              'x-site-id': siteId
            }
          }
        );

        // Handle non-ok responses gracefully - content may not exist yet
        if (!response.ok) {
          console.warn(`Content fetch returned ${response.status} for ${selectedPage}/${selectedSection}`);
          setContentMap({});
          setOriginalContentMap({});
          setModifiedKeys(new Set());
          setHasChanges(false);
          return;
        }

        const result = await response.json();
        // Handle both wrapped {data: [...]} and direct [...] response formats
        const contentItems: ContentItem[] = Array.isArray(result) ? result : (result.data || []);

        // Build content map
        const newContentMap: Record<string, string> = {};
        contentItems.forEach(item => {
          newContentMap[item.contentKey] = item.content;
        });

        setContentMap(newContentMap);
        setOriginalContentMap(newContentMap);
        setModifiedKeys(new Set());
        setHasChanges(false);
      } catch (error) {
        console.error('Error fetching content:', error);
        // Reset to empty if fetch fails
        setContentMap({});
        setOriginalContentMap({});
      }
    };

    fetchContent();
  }, [siteId, selectedPage, selectedSection]);

  // Update content for a specific key
  const updateContent = (contentKey: string, content: string) => {
    setContentMap(prev => ({
      ...prev,
      [contentKey]: content
    }));

    // Track if this key has been modified
    const newModifiedKeys = new Set(modifiedKeys);
    if (content !== originalContentMap[contentKey]) {
      newModifiedKeys.add(contentKey);
    } else {
      newModifiedKeys.delete(contentKey);
    }
    setModifiedKeys(newModifiedKeys);
    setHasChanges(newModifiedKeys.size > 0);
  };

  // Save all modified content
  const handleSave = async () => {
    if (!siteId || modifiedKeys.size === 0) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();

      // Prepare items to save
      const items = Array.from(modifiedKeys).map(key => ({
        contentKey: key,
        content: contentMap[key] || ''
      }));

      console.log('Saving content:', { siteId, page: selectedPage, section: selectedSection, items });

      const response = await fetch(`${apiUrl}/api/v1/site-content/bulk`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-site-id': siteId
        },
        body: JSON.stringify({
          siteId,
          page: selectedPage,
          section: selectedSection,
          items
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Save failed with status ${response.status}:`, errorText);
        throw new Error(`Failed to save content: ${response.status}`);
      }

      // Update original content map
      setOriginalContentMap({ ...contentMap });
      setModifiedKeys(new Set());
      setHasChanges(false);

      toast({
        title: "Success",
        description: "Content saved successfully",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "Failed to save content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset changes
  const handleReset = () => {
    setContentMap({ ...originalContentMap });
    setModifiedKeys(new Set());
    setHasChanges(false);
  };

  if (!isSiteAdmin && !isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} isAdmin={isSiteAdmin || isAdmin} noPadding>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </Layout>
    );
  }

  if (!siteId) {
    return (
      <Layout isAuthenticated={isAuthenticated} isAdmin={isSiteAdmin || isAdmin} noPadding>
        <SubHeader
          icon={FileEdit}
          title="Content Management"
          subtitle="Edit your website content"
        />
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Site Selected</h3>
            <p className="text-gray-500 dark:text-zinc-400 text-sm mb-4">
              Please select a site from the Site Builder to manage its content.
            </p>
            <button
              onClick={() => router.push('/site-builder')}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-medium hover:from-sky-500 hover:to-blue-500 transition-all text-sm"
            >
              Go to Site Builder
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} isAdmin={isSiteAdmin || isAdmin} noPadding>
      <SubHeader
        icon={FileEdit}
        title="Content Management"
        subtitle="Edit your website content with the visual editor"
        actions={
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={cn(
                "px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm transition-all",
                hasChanges && !isSaving
                  ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white hover:from-sky-500 hover:to-blue-500 shadow-lg shadow-blue-500/25"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Page & Section Selection */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 sticky top-24">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <LayoutIcon className="w-4 h-4" />
                Select Section
              </h3>

              {/* Page Selection */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">
                  Page
                </label>
                <div className="relative">
                  <select
                    value={selectedPage}
                    onChange={(e) => {
                      setSelectedPage(e.target.value);
                      // Reset to first section of new page
                      const pageConfig = PAGE_SECTIONS[e.target.value as keyof typeof PAGE_SECTIONS];
                      if (pageConfig) {
                        setSelectedSection(Object.keys(pageConfig.sections)[0]);
                      }
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
                  >
                    {Object.entries(PAGE_SECTIONS).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Section Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">
                  Section
                </label>
                <div className="space-y-2">
                  {currentPageConfig && Object.entries(currentPageConfig.sections).map(([key, section]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedSection(key)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl transition-all",
                        selectedSection === key
                          ? "bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400"
                          : "bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-600"
                      )}
                    >
                      <div className="font-medium text-sm">{section.label}</div>
                      <div className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">
                        {section.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Indicator */}
              {hasChanges && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Unsaved changes</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Editor */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
              {/* Section Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentSectionConfig?.label}
                </h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  {currentSectionConfig?.description}
                </p>
              </div>

              {/* Token Palette */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Dynamic Tokens</span>
                  <span className="text-xs text-gray-500 dark:text-zinc-500">— Drag into editor or click to copy</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(TOKEN_CATEGORIES).map(([category, tokens]) => (
                    <div key={category} className="flex items-center gap-1">
                      <span className="text-xs text-gray-400 dark:text-zinc-500 mr-1">{category}:</span>
                      {tokens.map((tokenInfo) => (
                        <div
                          key={tokenInfo.token}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', tokenInfo.token);
                            e.dataTransfer.effectAllowed = 'copy';
                          }}
                          onClick={() => {
                            navigator.clipboard.writeText(tokenInfo.token);
                            toast({
                              title: "Copied!",
                              description: `"${tokenInfo.token}" copied to clipboard. Paste it in the editor.`,
                            });
                          }}
                          className="group relative inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-grab active:cursor-grabbing select-none"
                          title={`${tokenInfo.description} → ${tokenInfo.preview}`}
                        >
                          <GripVertical className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                          <span className="text-gray-600 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {tokenInfo.label}
                          </span>
                          {/* Tooltip */}
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {tokenInfo.token} → {tokenInfo.preview}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Editors */}
              <div className="p-6 space-y-8">
                {currentSectionConfig?.contentKeys.map((contentKeyConfig) => {
                  const isModified = modifiedKeys.has(contentKeyConfig.key);

                  return (
                    <div key={contentKeyConfig.key}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                            <Type className="w-4 h-4 text-gray-400" />
                            {contentKeyConfig.label}
                            {isModified && (
                              <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                                Modified
                              </span>
                            )}
                          </label>
                          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                            {contentKeyConfig.description}
                          </p>
                        </div>
                        {contentMap[contentKeyConfig.key] && (
                          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Has content
                          </span>
                        )}
                      </div>
                      <RichTextEditor
                        content={contentMap[contentKeyConfig.key] || ''}
                        onChange={(html) => updateContent(contentKeyConfig.key, html)}
                        placeholder={`Enter ${contentKeyConfig.label.toLowerCase()}...`}
                        minHeight="150px"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Preview Panel */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                  <Eye className="w-4 h-4" />
                  <span>Changes will appear on your live site after saving</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
