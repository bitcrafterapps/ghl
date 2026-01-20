'use client';

import { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { 
  Plus, Trash2, CheckCircle, Loader2, Wand2, X, Sparkles, Search, Filter,
  Users, Layers, Database, Shield, Plug, Palette, Cpu, Target,
  FileText, FileOutput, Mic, ChevronDown
} from 'lucide-react';
import { prdApi, generationsApi } from '@/lib/builder-api';
import { getApiUrl } from '@/lib/api';
import { PrdDocumentDrawer } from './PrdDocumentDrawer';
import MDEditor from '@uiw/react-md-editor';

interface PrdEditorProps {
  content: any;
  prdId: string;
  className?: string;
  projectName?: string;
  onUpdate?: (updatedContent: any) => void;
  onUpdateProject?: (updates: { name?: string; description?: string }) => void;
}

interface SaveState {
  section: string | null;
  status: 'idle' | 'saving' | 'saved' | 'error';
}

// Tab definitions
const TABS = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'features', label: 'Features', icon: Layers },
  { id: 'users', label: 'Personas', icon: Users },
  { id: 'technical', label: 'Technical', icon: Database },
  { id: 'design', label: 'Design', icon: Palette },
] as const;

type TabId = typeof TABS[number]['id'];

// Helper to ensure value is array
const ensureArray = (val: any) => Array.isArray(val) ? val : [];

// Normalize PRD content
function normalizeContent(content: any): any {
  if (!content) return null;
  
  return {
    overview: {
      name: content.overview?.name || '',
      description: content.overview?.description || '',
      objectives: ensureArray(content.overview?.objectives),
    },
    features: ensureArray(content.features),
    epics: content.epics && content.epics.length > 0 
      ? ensureArray(content.epics) 
      : [{ id: 'epic-1', name: 'EPIC 1' }], // Default to one epic
    targetUsers: ensureArray(content.targetUsers),
    dataModel: ensureArray(content.dataModel),
    authentication: {
      methods: ensureArray(content.authentication?.methods),
      roles: ensureArray(content.authentication?.roles),
    },
    integrations: ensureArray(content.integrations),
    design: {
      colors: {
        primary: content.design?.colors?.primary || '#3b82f6',
        secondary: content.design?.colors?.secondary || '#8b5cf6',
        background: content.design?.colors?.background || '#09090b',
        surface: content.design?.colors?.surface || '#18181b',
        textPrimary: content.design?.colors?.textPrimary || '#fafafa',
        textSecondary: content.design?.colors?.textSecondary || '#a1a1aa',
        border: content.design?.colors?.border || '#27272a',
        success: content.design?.colors?.success || '#22c55e',
        error: content.design?.colors?.error || '#ef4444',
        warning: content.design?.colors?.warning || '#f59e0b',
      },
      typography: {
        headingFont: content.design?.typography?.headingFont || 'Inter',
        bodyFont: content.design?.typography?.bodyFont || 'Inter',
        baseSize: content.design?.typography?.baseSize || '16',
        headingScale: content.design?.typography?.headingScale || 'normal',
      },
      layout: {
        borderRadius: content.design?.layout?.borderRadius || 'md',
        spacingScale: content.design?.layout?.spacingScale || 'normal',
        containerWidth: content.design?.layout?.containerWidth || 'lg',
      },
      style: {
        themeMode: content.design?.style?.themeMode || 'dark',
        visualStyle: content.design?.style?.visualStyle || 'modern',
        shadowIntensity: content.design?.style?.shadowIntensity || 'subtle',
        animations: content.design?.style?.animations !== undefined ? content.design.style.animations : true,
      },
      inspirations: ensureArray(content.design?.inspirations),
    },
    technicalRequirements: {
      platforms: ensureArray(content.technicalRequirements?.platforms),
      performance: ensureArray(content.technicalRequirements?.performance),
      security: ensureArray(content.technicalRequirements?.security),
    },
    successMetrics: ensureArray(content.successMetrics),
    apiEndpoints: ensureArray(content.apiEndpoints),
  };
}

// Editable Tag Component
function EditableTag({ value, onRemove, color = 'zinc' }: { value: string; onRemove: () => void; color?: string; }) {
  const colorClasses: Record<string, string> = {
    zinc: 'bg-zinc-700/50 text-zinc-300',
    blue: 'bg-blue-500/20 text-blue-300',
    green: 'bg-green-500/20 text-green-300',
    pink: 'bg-pink-500/20 text-pink-300',
    orange: 'bg-orange-500/20 text-orange-300',
    cyan: 'bg-cyan-500/20 text-cyan-300',
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${colorClasses[color]} group`}>
      {value}
      <button onClick={onRemove} className="hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">×</button>
    </span>
  );
}

// Add Tag Input Component
function AddTagInput({ onAdd, placeholder = 'Add item...' }: { onAdd: (value: string) => void; placeholder?: string; }) {
  const [value, setValue] = useState('');
  
  const handleSubmit = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue('');
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={placeholder}
        className="px-3 py-1.5 bg-zinc-900/50 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors flex-1"
      />
      <button onClick={handleSubmit} className="p-1.5 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg transition-colors">
        <Plus className="w-4 h-4 text-zinc-400" />
      </button>
    </div>
  );
}

// Color utility functions
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function getComplementaryColors(hex: string): { name: string; color: string }[] {
  const hsl = hexToHsl(hex);
  if (hsl.s === 0 && hsl.l === 0) return [];
  
  return [
    { name: 'Complementary', color: hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l) },
    { name: 'Triadic 1', color: hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l) },
    { name: 'Triadic 2', color: hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l) },
    { name: 'Analogous 1', color: hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l) },
    { name: 'Analogous 2', color: hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l) },
  ];
}

// Color Picker Input Component with complementary suggestions
function ColorPickerInput({ onAdd, existingColors = [] }: { onAdd: (value: string) => void; existingColors?: string[] }) {
  const [color, setColor] = useState('#6366f1');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const suggestions = getComplementaryColors(color);
  
  const handleAdd = (colorToAdd: string) => {
    onAdd(colorToAdd.toUpperCase());
    setShowSuggestions(true);
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={color}
            onChange={(e) => { setColor(e.target.value); setShowSuggestions(false); }}
            className="w-12 h-10 rounded-lg cursor-pointer border-2 border-zinc-700 hover:border-pink-500 transition-colors"
            style={{ backgroundColor: color }}
          />
        </div>
        <input
          type="text"
          value={color.toUpperCase()}
          onChange={(e) => {
            const val = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
              setColor(val);
              setShowSuggestions(false);
            }
          }}
          className="w-28 px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-pink-500 transition-colors"
          placeholder="#FFFFFF"
        />
        <button
          onClick={() => handleAdd(color)}
          className="flex items-center gap-2 px-3 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Color
        </button>
      </div>
      
      {/* Complementary Color Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
          <p className="text-xs text-zinc-500 mb-2">Suggested complementary colors:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => onAdd(sug.color.toUpperCase())}
                className="flex items-center gap-2 px-2 py-1.5 bg-zinc-900/50 hover:bg-zinc-700/50 rounded-lg transition-colors group"
                title={sug.name}
              >
                <div 
                  className="w-5 h-5 rounded border border-zinc-600 group-hover:border-pink-400 transition-colors" 
                  style={{ backgroundColor: sug.color }}
                />
                <span className="text-xs text-zinc-400 group-hover:text-zinc-200">{sug.color.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// Feature Status Badge Component - shows implementation status
function FeatureStatusBadge({ status }: { status?: 'pending' | 'in-progress' | 'implemented' | 'verified' }) {
  const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
    'pending': { label: 'Pending', className: 'bg-zinc-700/50 text-zinc-400 border border-zinc-600', icon: '○' },
    'in-progress': { label: 'In Progress', className: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', icon: '◐' },
    'implemented': { label: 'Implemented', className: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', icon: '●' },
    'verified': { label: 'Complete!', className: 'bg-green-500/30 text-green-200 border border-green-400/50 shadow-lg shadow-green-500/20', icon: '✓' },
  };
  
  const config = statusConfig[status || 'pending'] || statusConfig['pending'];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${config.className}`}>
      <span className={status === 'verified' ? 'text-green-300' : ''}>{config.icon}</span>
      {config.label}
    </span>
  );
}

// Card wrapper for consistent styling
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-zinc-900/50 p-4 rounded-xl border border-zinc-700/50 ${className}`}>
      {children}
    </div>
  );
}

// Section header within a tab
function SectionHeader({ title, icon: Icon, color = 'blue', actions }: { title: string; icon: any; color?: string; actions?: React.ReactNode }) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    cyan: 'text-cyan-400',
    orange: 'text-orange-400',
    pink: 'text-pink-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
  };
  
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${colorClasses[color]}`} />
        <h3 className="font-medium text-white">{title}</h3>
      </div>
      {actions}
    </div>
  );
}

export function PrdEditor({ content, prdId, className, projectName, onUpdate, onUpdateProject }: PrdEditorProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [editedContent, setEditedContent] = useState<any>(() => normalizeContent(content));
  const [saveState, setSaveState] = useState<SaveState>({ section: null, status: 'idle' });
  const [isInitialized, setIsInitialized] = useState(false);
  const [showDocumentDrawer, setShowDocumentDrawer] = useState(false);
  const [draggedFeatureIndex, setDraggedFeatureIndex] = useState<number | null>(null);
  // AI Description Generator Modal
  const [aiGenModal, setAiGenModal] = useState<{ featureIndex: number; prompt: string; isGenerating: boolean } | null>(null);
  // AI Acceptance Criteria Generator (tracks which feature index is generating)
  const [acGenLoading, setAcGenLoading] = useState<number | null>(null);
  // Delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState<{ featureIndex: number; featureName: string } | null>(null);
  // Feature search and filter
  const [featureSearch, setFeatureSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [pointsFilter, setPointsFilter] = useState<string>('all');
  // Feature accordion state (tracks expanded feature indices)
  const [expandedFeatures, setExpandedFeatures] = useState<Set<number>>(new Set());
  // Epic state
  const [activeEpicIndex, setActiveEpicIndex] = useState(0);
  // Epic delete confirmation modal
  const [epicDeleteConfirm, setEpicDeleteConfirm] = useState<{ 
    epicIndex: number; 
    epicName: string; 
    featureCount: number;
    confirmationPhrase: string;
  } | null>(null);
  const [epicDeleteInput, setEpicDeleteInput] = useState('');

  // AI & Speech State
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Technical section sub-tabs
  const [technicalSubTab, setTechnicalSubTab] = useState<'dataModel' | 'apis'>('dataModel');
  const [isGeneratingApis, setIsGeneratingApis] = useState(false);
  
  // Feature implementation state
  const [implementingFeatureIndex, setImplementingFeatureIndex] = useState<number | null>(null);

  // Speech-to-text handler
  const handleMicClick = () => {
    // Check for browser support
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }
      
      if (finalTranscript) {
        const currentDesc = editedContent.overview?.description || '';
        const newDesc = (currentDesc + ' ' + finalTranscript).trim();
        updateField('overview', 'description', newDesc);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  // Generate name handler
  const handleGenerateName = async () => {
    const description = editedContent.overview?.description;
    if (!description?.trim()) return;
    
    setIsGeneratingName(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();
      
      const response = await fetch(`${apiUrl}/api/v1/projects/generate-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description })
      });
      
      if (!response.ok) throw new Error('Failed to generate name');
      
      const data = await response.json();
      const names = data.data?.names || data.names || [];
      const generatedName = names[0] || data.data?.name || data.name;
      
      if (generatedName) {
        updateField('overview', 'name', generatedName);
        onUpdateProject?.({ name: generatedName });
        // Don't auto-save immediately to let user decide, but update field
        // Actually, we should probably save or at least let the blur handle it. 
        // Setting state triggers re-render, blur handles save.
      }
      
      if (names.length > 0) {
        setNameSuggestions(names);
      }
    } catch (error) {
      console.error('Error generating name:', error);
    } finally {
      setIsGeneratingName(false);
    }
  };

  // Enhance description handler
  const handleEnhanceDescription = async () => {
    const description = editedContent.overview?.description;
    if (!description?.trim()) return;
    
    setIsEnhancing(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();
      
      const response = await fetch(`${apiUrl}/api/v1/projects/enhance-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description })
      });
      
      if (!response.ok) throw new Error('Failed to enhance description');
      
      const data = await response.json();
      const enhanced = data.data?.enhancedDescription || data.enhancedDescription;
      
      if (enhanced) {
        updateField('overview', 'description', enhanced);
        // We'll let the user save explicitely or via blur
      }
    } catch (error) {
      console.error('Error enhancing description:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Only sync from content prop on initial load, not after saves
  useEffect(() => {
    if (!isInitialized && content) {
      setEditedContent(normalizeContent(content));
      setIsInitialized(true);
    }
  }, [content, isInitialized]);

  const saveSection = useCallback(async (sectionId: string, sectionContent: any) => {
    setSaveState({ section: sectionId, status: 'saving' });
    try {
      await prdApi.updateSection(prdId, sectionId, sectionContent);
      setSaveState({ section: sectionId, status: 'saved' });
      setTimeout(() => setSaveState({ section: null, status: 'idle' }), 2000);
      // Note: We intentionally don't call onUpdate here to avoid resetting local state
      // The save is successful and editedContent already has the correct value
    } catch (error) {
      console.log('Failed to save section:', error);
      setSaveState({ section: sectionId, status: 'error' });
      setTimeout(() => setSaveState({ section: null, status: 'idle' }), 3000);
    }
  }, [prdId]);

  const SaveIndicator = ({ section }: { section: string }) => {
    if (saveState.section !== section) return null;
    return (
      <span className="ml-2 inline-flex items-center text-xs">
        {saveState.status === 'saving' && <><Loader2 className="w-3 h-3 animate-spin text-blue-400 mr-1" /><span className="text-zinc-400">Saving...</span></>}
        {saveState.status === 'saved' && <><CheckCircle className="w-3 h-3 text-green-400 mr-1" /><span className="text-green-400">Saved</span></>}
        {saveState.status === 'error' && <span className="text-red-400">Error saving</span>}
      </span>
    );
  };

  // Update handlers
  const updateField = (section: string, field: string, value: any) => {
    const updatedSection = { ...editedContent[section], [field]: value };
    setEditedContent({ ...editedContent, [section]: updatedSection });
  };

  const updateArrayItem = (section: string, index: number, field: string, value: any) => {
    const arr = [...editedContent[section]];
    arr[index] = { ...arr[index], [field]: value };
    setEditedContent({ ...editedContent, [section]: arr });
    return arr; // Return the new array so caller can use it for saving
  };

  const addArrayItem = (section: string, item: any) => {
    const arr = [...(editedContent[section] || []), item];
    setEditedContent({ ...editedContent, [section]: arr });
    saveSection(section, arr);
  };

  // Add item at the beginning of array (for features)
  const prependArrayItem = (section: string, item: any) => {
    const arr = [item, ...(editedContent[section] || [])];
    setEditedContent({ ...editedContent, [section]: arr });
    saveSection(section, arr);
  };

  const removeArrayItem = (section: string, index: number) => {
    const arr = editedContent[section].filter((_: any, i: number) => i !== index);
    setEditedContent({ ...editedContent, [section]: arr });
    saveSection(section, arr);
  };

  // Move feature from one position to another (for drag-drop)
  const moveFeature = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const arr = [...editedContent.features];
    const [removed] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, removed);
    setEditedContent({ ...editedContent, features: arr });
    saveSection('features', arr);
  };

  const addToNestedArray = (section: string, field: string, value: string) => {
    const updatedSection = {
      ...editedContent[section],
      [field]: [...(editedContent[section]?.[field] || []), value]
    };
    setEditedContent({ ...editedContent, [section]: updatedSection });
    saveSection(section, updatedSection);
  };

  const removeFromNestedArray = (section: string, field: string, index: number) => {
    const updatedSection = {
      ...editedContent[section],
      [field]: editedContent[section][field].filter((_: any, i: number) => i !== index)
    };
    setEditedContent({ ...editedContent, [section]: updatedSection });
    saveSection(section, updatedSection);
  };

  const addToTopLevelArray = (section: string, value: string) => {
    const arr = [...(editedContent[section] || []), value];
    setEditedContent({ ...editedContent, [section]: arr });
    saveSection(section, arr);
  };

  const removeFromTopLevelArray = (section: string, index: number) => {
    const arr = editedContent[section].filter((_: any, i: number) => i !== index);
    setEditedContent({ ...editedContent, [section]: arr });
    saveSection(section, arr);
  };

  // Generate API endpoints from data model
  const generateApisFromDataModel = () => {
    setIsGeneratingApis(true);
    
    try {
      const entities = editedContent.dataModel || [];
      const newEndpoints: any[] = [];
      
      entities.forEach((entity: any) => {
        if (!entity.entity) return;
        
        const entityName = entity.entity;
        const pluralName = entityName.toLowerCase() + 's';
        
        // Generate CRUD endpoints for each entity
        newEndpoints.push(
          { method: 'GET', path: `/api/${pluralName}`, description: `List all ${pluralName} with pagination`, entity: entityName },
          { method: 'GET', path: `/api/${pluralName}/:id`, description: `Get a single ${entityName} by ID`, entity: entityName },
          { method: 'POST', path: `/api/${pluralName}`, description: `Create a new ${entityName}`, entity: entityName },
          { method: 'PUT', path: `/api/${pluralName}/:id`, description: `Update an existing ${entityName}`, entity: entityName },
          { method: 'DELETE', path: `/api/${pluralName}/:id`, description: `Delete a ${entityName}`, entity: entityName }
        );
      });
      
      // Merge with existing endpoints (don't duplicate)
      const existingPaths = new Set((editedContent.apiEndpoints || []).map((e: any) => `${e.method}:${e.path}`));
      const uniqueNew = newEndpoints.filter(e => !existingPaths.has(`${e.method}:${e.path}`));
      const merged = [...(editedContent.apiEndpoints || []), ...uniqueNew];
      
      setEditedContent({ ...editedContent, apiEndpoints: merged });
      saveSection('apiEndpoints', merged);
    } finally {
      setIsGeneratingApis(false);
    }
  };

  // Implement a single feature without full regeneration
  const handleImplementFeature = async (featureIndex: number, feature: any) => {
    setImplementingFeatureIndex(featureIndex);
    
    try {
      // Get projectId from prdId (we need to fetch it or get it from props)
      // For now, we'll extract it from the URL if available
      const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
      const projectIdIndex = pathParts.findIndex(p => p === 'builder') + 1;
      const projectId = pathParts[projectIdIndex] || '';
      
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      
      // Get existing files from the generation or WebContainer
      // For the initial implementation, we'll pass an empty array
      // In a full implementation, this would be populated from the builder state
      const existingFiles: Array<{ path: string; content: string }> = [];
      
      // Normalize acceptance criteria
      const acceptanceCriteria = (feature.acceptanceCriteria || []).map((ac: any) => 
        typeof ac === 'string' ? ac : ac.text || ''
      ).filter(Boolean);
      
      const result = await generationsApi.implementFeature(projectId, {
        prdId,
        featureId: feature.id || `feature-${featureIndex}`,
        feature: {
          name: feature.name || '',
          description: feature.description || '',
          acceptanceCriteria,
          priority: feature.priority || 'medium',
        },
        existingFiles,
      });
      
      // Update feature status to 'implemented'
      const updatedFeatures = [...editedContent.features];
      updatedFeatures[featureIndex] = {
        ...updatedFeatures[featureIndex],
        status: 'implemented'
      };
      setEditedContent({ ...editedContent, features: updatedFeatures });
      saveSection('features', updatedFeatures);
      
      // Log success (in a real implementation, you'd show a toast)
      console.log(`Feature "${feature.name}" implemented:`, result.explanation);
      alert(`Feature "${feature.name}" implemented successfully!\n\n${result.modifiedFiles.length} file(s) modified.`);
      
    } catch (error: any) {
      console.error('Failed to implement feature:', error);
      alert(`Failed to implement feature: ${error.message || 'Unknown error'}`);
    } finally {
      setImplementingFeatureIndex(null);
    }
  };

  if (!editedContent) return null;

  return (
    <div className={clsx("w-full max-w-[90%] mx-auto p-6", className)}>
      {/* Header with Generate Document Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Edit PRD</h2>
        <button
          onClick={() => setShowDocumentDrawer(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-500/25 font-medium text-sm"
        >
          <FileOutput className="w-4 h-4" />
          Generate Document
        </button>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-xl mb-6 border border-zinc-700/50">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">Project Overview</h3>
                <SaveIndicator section="overview" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
                    Project Name
                    <span className="text-zinc-600 font-normal ml-2 lowercase">(auto-generate from description)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editedContent.overview?.name || projectName || ''}
                      onChange={(e) => {
                        updateField('overview', 'name', e.target.value);
                        onUpdateProject?.({ name: e.target.value });
                      }}
                      onBlur={() => saveSection('overview', editedContent.overview)}
                      className="w-full px-4 py-3 pr-12 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white text-lg font-medium focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Enter project name..."
                    />
                    <button
                      onClick={handleGenerateName}
                      disabled={isGeneratingName || !editedContent.overview?.description?.trim()}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                        isGeneratingName
                          ? 'bg-orange-500/50 text-white cursor-wait'
                          : !editedContent.overview?.description?.trim()
                            ? 'bg-orange-500/10 text-white/30 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-400'
                      }`}
                      title={!editedContent.overview?.description?.trim() ? 'Enter a description first' : 'Generate name from description'}
                    >
                      {isGeneratingName ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* Name Suggestion Pills */}
                  {nameSuggestions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-zinc-500 mb-2">Suggestions:</p>
                      <div className="flex flex-wrap gap-2">
                        {nameSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              updateField('overview', 'name', suggestion);
                              onUpdateProject?.({ name: suggestion });
                              saveSection('overview', { ...editedContent.overview, name: suggestion });
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                              editedContent.overview?.name === suggestion
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-blue-500/50 hover:bg-blue-500/10'
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Description</label>
                  <div className="relative" data-color-mode="dark">
                    <MDEditor
                      value={editedContent.overview?.description || ''}
                      onChange={(value) => updateField('overview', 'description', value || '')}
                      onBlur={() => saveSection('overview', editedContent.overview)}
                      preview="edit"
                      height={300}
                      className="!bg-zinc-800/50 !border-zinc-700 rounded-lg"
                    />
                  </div>
                  <div className="flex gap-2 mt-2 justify-end">
                    <button 
                      onClick={handleMicClick}
                      className={`p-2 rounded-lg transition-colors ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 hover:text-white'
                      }`}
                      title={isListening ? 'Stop recording' : 'Start voice input'}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleEnhanceDescription}
                      disabled={isEnhancing || !editedContent.overview?.description?.trim()}
                      className={`p-2 rounded-lg transition-colors ${
                        isEnhancing 
                          ? 'bg-orange-500/50 text-white cursor-wait' 
                          : !editedContent.overview?.description?.trim()
                            ? 'bg-orange-500/10 text-white/30 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-400'
                      }`}
                      title="Enhance description with AI"
                    >
                      {isEnhancing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  

                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Objectives</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editedContent.overview?.objectives?.map((obj: string, i: number) => (
                      <EditableTag key={i} value={obj} onRemove={() => removeFromNestedArray('overview', 'objectives', i)} />
                    ))}
                  </div>
                  <AddTagInput onAdd={(val) => addToNestedArray('overview', 'objectives', val)} placeholder="Add objective..." />
                </div>
              </div>
            </Card>

            {/* Success Metrics in Overview */}
            <Card>
              <SectionHeader title="Success Metrics" icon={Target} color="green" />
              <div className="flex flex-wrap gap-2 mb-3">
                {editedContent.successMetrics?.map((metric: string, i: number) => (
                  <EditableTag key={i} value={metric} color="green" onRemove={() => removeFromTopLevelArray('successMetrics', i)} />
                ))}
              </div>
              <AddTagInput onAdd={(val) => addToTopLevelArray('successMetrics', val)} placeholder="Add success metric..." />
              <SaveIndicator section="successMetrics" />
            </Card>
          </div>
        )}

        {/* FEATURES TAB */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            {/* Summary Header */}
            {editedContent.features.length > 0 && (
              <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Points</p>
                      <p className="text-2xl font-bold text-white">
                        {editedContent.features.reduce((sum: number, f: any) => sum + (f.storyPoints || 0), 0)}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-zinc-700" />
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">Epics</p>
                      <p className="text-2xl font-bold text-white">{editedContent.epics?.length || 1}</p>
                    </div>
                    <div className="h-8 w-px bg-zinc-700" />
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">Features</p>
                      <p className="text-2xl font-bold text-white">{editedContent.features.length}</p>
                    </div>
                    <div className="h-8 w-px bg-zinc-700" />
                    <div className="flex gap-3">
                      <div className="text-center">
                        <p className="text-xs text-red-400">High</p>
                        <p className="text-lg font-semibold text-red-300">
                          {editedContent.features.filter((f: any) => f.priority === 'high').reduce((sum: number, f: any) => sum + (f.storyPoints || 0), 0)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-yellow-400">Med</p>
                        <p className="text-lg font-semibold text-yellow-300">
                          {editedContent.features.filter((f: any) => f.priority === 'medium').reduce((sum: number, f: any) => sum + (f.storyPoints || 0), 0)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-green-400">Low</p>
                        <p className="text-lg font-semibold text-green-300">
                          {editedContent.features.filter((f: any) => f.priority === 'low').reduce((sum: number, f: any) => sum + (f.storyPoints || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Implementation Status */}
                    {(() => {
                      // Helper to check if all criteria are completed
                      const isFeatureComplete = (f: any): boolean => {
                        if (f.status === 'verified') return true;
                        const ac = f.acceptanceCriteria;
                        if (!ac || (Array.isArray(ac) && ac.length === 0)) return f.status === 'implemented';
                        if (typeof ac === 'string') return false;
                        if (Array.isArray(ac)) {
                          const normalized = ac.map((item: any) => 
                            typeof item === 'string' ? { text: item, completed: false } : item
                          );
                          return normalized.length > 0 && normalized.every((item: any) => item.completed);
                        }
                        return false;
                      };
                      
                      const implemented = editedContent.features.filter(isFeatureComplete).length;
                      const total = editedContent.features.length;
                      const coverage = total > 0 ? Math.round((implemented / total) * 100) : 0;
                      return (
                        <div className="text-right">
                          <p className="text-xs text-zinc-500">Implemented</p>
                          <p className="text-lg font-semibold text-green-300">{implemented}/{total}</p>
                          <div className="w-20 h-1.5 bg-zinc-700 rounded-full mt-1 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500" 
                              style={{ width: `${coverage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                    <div className="h-8 w-px bg-zinc-700" />
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Unestimated</p>
                      <p className="text-lg font-semibold text-zinc-400">
                        {editedContent.features.filter((f: any) => !f.storyPoints).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="font-medium text-white">Features</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={featureSearch}
                    onChange={(e) => setFeatureSearch(e.target.value)}
                    placeholder="Search..."
                    className="pl-8 pr-3 py-1.5 text-sm bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-500 w-36"
                  />
                </div>
                
                {/* Priority Filter */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-sm bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                
                {/* Points Filter */}
                <select
                  value={pointsFilter}
                  onChange={(e) => setPointsFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-sm bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Points</option>
                  <option value="1">1 pt</option>
                  <option value="3">3 pts</option>
                  <option value="5">5 pts</option>
                  <option value="8">8 pts</option>
                  <option value="none">Unestimated</option>
                </select>
                
                <SaveIndicator section="features" />
                <button
                  onClick={() => {
                    const epics = editedContent.epics || [{ id: 'epic-1', name: 'EPIC 1' }];
                    const newEpicNum = epics.length + 1;
                    const newEpic = { id: `epic-${Date.now()}`, name: `EPIC ${newEpicNum}` };
                    const updatedEpics = [...epics, newEpic];
                    setEditedContent({ ...editedContent, epics: updatedEpics });
                    saveSection('epics', updatedEpics);
                    setActiveEpicIndex(updatedEpics.length - 1);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Epic
                </button>
                <button
                  onClick={() => {
                    const activeEpic = editedContent.epics?.[activeEpicIndex];
                    const epicId = activeEpic?.id || 'epic-1';
                    prependArrayItem('features', { name: '', description: '', acceptanceCriteria: [], priority: 'medium', storyPoints: null, epicId });
                    // Auto-expand the new feature (it's at index 0 since we prepend)
                    setExpandedFeatures(new Set([0, ...Array.from(expandedFeatures).map(i => i + 1)]));
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Feature
                </button>
              </div>
            </div>

            {/* Epic Tabs */}
            <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-x-auto">
              {(editedContent.epics || [{ id: 'epic-1', name: 'EPIC 1' }]).map((epic: any, idx: number) => {
                const isActive = activeEpicIndex === idx;
                const epicFeatures = editedContent.features.filter((f: any) => 
                  f.epicId === epic.id || (!f.epicId && idx === 0)
                );
                const epicPoints = epicFeatures.reduce((sum: number, f: any) => sum + (f.storyPoints || 0), 0);
                const isFirstEpic = idx === 0;
                
                return (
                  <div key={epic.id} className="relative group/epic flex items-center">
                    <button
                      onClick={() => setActiveEpicIndex(idx)}
                      className={clsx(
                        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50',
                        !isFirstEpic && 'pr-8' // Extra padding for delete button
                      )}
                    >
                      {epic.name}
                      <span className={clsx(
                        'px-1.5 py-0.5 rounded text-xs',
                        isActive ? 'bg-blue-500/50' : 'bg-zinc-700/50'
                      )}>
                        {epicFeatures.length} • {epicPoints}pts
                      </span>
                    </button>
                    
                    {/* Delete button - hidden for first epic */}
                    {!isFirstEpic && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEpicDeleteConfirm({
                            epicIndex: idx,
                            epicName: epic.name,
                            featureCount: epicFeatures.length,
                            confirmationPhrase: 'DELETE'
                          });
                          setEpicDeleteInput('');
                        }}
                        className={clsx(
                          'absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded transition-all',
                          'opacity-0 group-hover/epic:opacity-100',
                          'text-zinc-500 hover:text-red-400 hover:bg-red-500/10'
                        )}
                        title={`Delete ${epic.name}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {(() => {
              // Get active epic
              const epics = editedContent.epics || [{ id: 'epic-1', name: 'EPIC 1' }];
              const activeEpic = epics[activeEpicIndex] || epics[0];
              
              // Filter features by active epic (features without epicId belong to first epic)
              const epicFeatures = editedContent.features.filter((f: any) => 
                f.epicId === activeEpic.id || (!f.epicId && activeEpicIndex === 0)
              );
              
              if (epicFeatures.length === 0) {
                return (
                  <Card className="text-center py-12">
                    <Layers className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-500">No features in {activeEpic.name}</p>
                    <button
                      onClick={() => {
                        prependArrayItem('features', { name: '', description: '', acceptanceCriteria: [], priority: 'medium', epicId: activeEpic.id });
                        // Auto-expand the new feature (it's at index 0 since we prepend)
                        setExpandedFeatures(new Set([0, ...Array.from(expandedFeatures).map(i => i + 1)]));
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm"
                    >
                      Add Your First Feature
                    </button>
                  </Card>
                );
              }
              
              // Apply search/filter to epic features
              const filteredFeatures = epicFeatures
                .map((f: any) => ({ ...f, _originalIndex: editedContent.features.indexOf(f) }))
                .filter((f: any) => {
                  // Search filter (name or description)
                  if (featureSearch.trim()) {
                    const search = featureSearch.toLowerCase();
                    const nameMatch = (f.name || '').toLowerCase().includes(search);
                    const descMatch = (f.description || '').toLowerCase().includes(search);
                    if (!nameMatch && !descMatch) return false;
                  }
                  // Priority filter
                  if (priorityFilter !== 'all' && f.priority !== priorityFilter) return false;
                  // Points filter
                  if (pointsFilter !== 'all') {
                    if (pointsFilter === 'none' && f.storyPoints) return false;
                    if (pointsFilter !== 'none' && String(f.storyPoints) !== pointsFilter) return false;
                  }
                  return true;
                });
                
                if (filteredFeatures.length === 0 && editedContent.features.length > 0) {
                  return (
                    <Card className="text-center py-8">
                      <Search className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-500">No features match your filters</p>
                      <button
                        onClick={() => { setFeatureSearch(''); setPriorityFilter('all'); setPointsFilter('all'); }}
                        className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Clear filters
                      </button>
                    </Card>
                  );
                }
                
                return filteredFeatures.map((feature: any) => {
                  const i = feature._originalIndex;
                  return (
                    <div
                  key={feature.id || i}
                  draggable
                  onDragStart={(e) => {
                    setDraggedFeatureIndex(i);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragEnd={() => setDraggedFeatureIndex(null)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedFeatureIndex !== null && draggedFeatureIndex !== i) {
                      moveFeature(draggedFeatureIndex, i);
                    }
                    setDraggedFeatureIndex(null);
                  }}
                  className={clsx(
                    'transition-all duration-200',
                    draggedFeatureIndex === i && 'opacity-50 scale-[0.98]',
                    draggedFeatureIndex !== null && draggedFeatureIndex !== i && 'border-t-2 border-transparent hover:border-blue-500'
                  )}
                >
                  <Card className={clsx('group cursor-grab active:cursor-grabbing', draggedFeatureIndex === i && 'ring-2 ring-blue-500')}>
                    <div className="flex items-start gap-3">
                      {/* Feature Number - reversed: oldest=1, newest=highest */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-sm select-none">
                        {editedContent.features.length - i}
                      </div>
                        <div className="flex-1 space-y-4">
                        {/* Row 1: Title + Points Badge + Toggle */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedFeatures);
                              if (newExpanded.has(i)) {
                                newExpanded.delete(i);
                              } else {
                                newExpanded.add(i);
                              }
                              setExpandedFeatures(newExpanded);
                            }}
                            className="p-1 text-zinc-500 hover:text-white transition-colors"
                          >
                            <ChevronDown className={clsx(
                              'w-4 h-4 transition-transform duration-200',
                              expandedFeatures.has(i) && 'rotate-180'
                            )} />
                          </button>
                          <input
                            type="text"
                            value={feature.name || ''}
                            onChange={(e) => updateArrayItem('features', i, 'name', e.target.value)}
                            onBlur={() => saveSection('features', editedContent.features)}
                            className="flex-1 bg-transparent text-white font-medium focus:outline-none border-b border-transparent hover:border-zinc-600 focus:border-blue-500 pb-1 text-lg"
                            placeholder="Feature name..."
                          />
                          {/* Points Total Badge - always visible */}
                          {feature.storyPoints && (
                            <span className={clsx(
                              'flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold',
                              feature.storyPoints === 8 
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            )}>
                              {feature.storyPoints} pt{feature.storyPoints > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      
                      {/* Collapsible Content */}
                      {expandedFeatures.has(i) && (
                        <>
                        {/* Description */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <label className="text-xs text-zinc-500">Description</label>
                            <button
                              onClick={() => setAiGenModal({ featureIndex: i, prompt: feature.name || '', isGenerating: false })}
                              className="text-zinc-500 hover:text-blue-400 transition-colors p-0.5 rounded hover:bg-blue-500/10"
                              title="Generate with AI"
                            >
                              <Wand2 className="w-3 h-3" />
                            </button>
                          </div>
                          <textarea
                            value={feature.description || ''}
                            onChange={(e) => updateArrayItem('features', i, 'description', e.target.value)}
                            onBlur={() => saveSection('features', editedContent.features)}
                            className="w-full bg-zinc-800/50 text-zinc-300 text-sm focus:outline-none resize-none rounded-lg p-3 border border-zinc-700/50 focus:border-blue-500"
                            placeholder="What does this feature do?"
                            rows={2}
                          />
                        </div>

                        {/* Status + Priority + Points selector */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Implementation Status Badge */}
                          <FeatureStatusBadge status={feature.status} />
                          
                          {/* Priority Selector */}
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-zinc-600 mr-1">Priority:</span>
                            {['high', 'medium', 'low'].map((p) => {
                              const isSelected = feature.priority === p;
                              return (
                                <button
                                  key={p}
                                  onClick={() => { 
                                    const updatedFeatures = updateArrayItem('features', i, 'priority', p); 
                                    saveSection('features', updatedFeatures); 
                                  }}
                                  className={clsx(
                                    'px-2.5 py-1 rounded text-xs capitalize font-medium transition-all',
                                    isSelected 
                                      ? p === 'high' ? 'bg-red-500 text-white ring-1 ring-red-400' 
                                        : p === 'medium' ? 'bg-yellow-500 text-black ring-1 ring-yellow-400'
                                        : 'bg-green-500 text-white ring-1 ring-green-400'
                                      : 'bg-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-600 border border-zinc-600'
                                  )}
                                >
                                  {p}
                                </button>
                              );
                            })}
                          </div>
                          
                          {/* Story Points Selector */}
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-zinc-600 mr-1">Points:</span>
                            {[1, 3, 5, 8].map((points) => {
                              const isSelected = Number(feature.storyPoints) === points;
                              return (
                                <button
                                  key={points}
                                  onClick={() => { 
                                    const updatedFeatures = updateArrayItem('features', i, 'storyPoints', points); 
                                    saveSection('features', updatedFeatures); 
                                  }}
                                  className={clsx(
                                    'w-7 h-7 rounded-full text-xs font-bold transition-all flex items-center justify-center',
                                    isSelected 
                                      ? points === 8 
                                        ? 'bg-blue-500 text-white ring-2 ring-blue-400 ring-offset-1 ring-offset-zinc-900 scale-110' 
                                        : 'bg-blue-500 text-white ring-2 ring-blue-400 ring-offset-1 ring-offset-zinc-900 scale-110'
                                      : 'bg-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-600 border border-zinc-600'
                                  )}
                                  title={points === 8 ? 'Consider breaking down into smaller stories' : `${points} story point${points > 1 ? 's' : ''}`}
                                >
                                  {points}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Warning for 8-point stories */}
                        {feature.storyPoints === 8 && (
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start gap-2">
                          <span className="text-blue-400">⚠️</span>
                          <div className="flex-1">
                            <p className="text-blue-300 text-sm font-medium">Large story detected</p>
                            <p className="text-blue-400/70 text-xs mt-0.5">
                              8-point stories are typically too complex. Consider breaking this into two features: one ~3 points and one ~5 points.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <label className="text-xs text-zinc-500">Acceptance Criteria</label>
                          <button
                            onClick={async () => {
                              const desc = feature.description;
                              if (!desc) return;
                              
                              setAcGenLoading(i);
                              
                              // Simulate AI generation (replace with actual API)
                              await new Promise(r => setTimeout(r, 1200));
                              
                              // Generate sample acceptance criteria based on description
                              const generatedCriteria = [
                                { text: `User can successfully ${desc.split(' ').slice(0, 5).join(' ').toLowerCase()}`, completed: false },
                                { text: 'System validates all input fields and displays appropriate error messages', completed: false },
                                { text: 'Feature functions correctly on both desktop and mobile devices', completed: false },
                                { text: 'Loading states are displayed during async operations', completed: false },
                              ];
                              
                              // Update the feature
                              const updatedFeatures = [...editedContent.features];
                              updatedFeatures[i] = {
                                ...updatedFeatures[i],
                                acceptanceCriteria: generatedCriteria
                              };
                              setEditedContent({ ...editedContent, features: updatedFeatures });
                              saveSection('features', updatedFeatures);
                              setAcGenLoading(null);
                            }}
                            disabled={!feature.description || acGenLoading === i}
                            className={clsx(
                              'p-0.5 rounded transition-colors',
                              feature.description
                                ? 'text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10'
                                : 'text-zinc-700 cursor-not-allowed'
                            )}
                            title={feature.description ? 'Generate from description' : 'Add description first'}
                          >
                            {acGenLoading === i ? (
                              <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                            ) : (
                              <Wand2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {/* Checklist Items */}
                        <div className="space-y-2 mb-3">
                          {(() => {
                            // Normalize acceptance criteria to array of {text, completed} objects
                            const normalizeAC = (ac: any): Array<{text: string; completed: boolean}> => {
                              if (!ac) return [];
                              if (typeof ac === 'string') {
                                return ac.split('\n').filter(Boolean).map(t => ({ text: t.replace(/^-\s*/, ''), completed: false }));
                              }
                              if (Array.isArray(ac)) {
                                return ac.map(item => {
                                  if (typeof item === 'string') return { text: item, completed: false };
                                  return { text: item.text || '', completed: item.completed || false };
                                });
                              }
                              return [];
                            };
                            
                            const criteria = normalizeAC(feature.acceptanceCriteria);
                            
                            return criteria.length === 0 ? (
                              <p className="text-zinc-600 text-sm italic py-2">No acceptance criteria defined</p>
                            ) : (
                              criteria.map((item, j) => (
                                <div key={j} className="flex items-start gap-3 bg-zinc-800/30 rounded-lg p-3 group/ac border border-zinc-700/30 hover:border-zinc-600/50 transition-colors">
                                  <button
                                    onClick={() => {
                                      const newCriteria = [...criteria];
                                      newCriteria[j] = { ...newCriteria[j], completed: !newCriteria[j].completed };
                                      
                                      // Calculate new status based on criteria completion
                                      const allCompleted = newCriteria.every(c => c.completed);
                                      const anyCompleted = newCriteria.some(c => c.completed);
                                      
                                      let newStatus = feature.status || 'pending';
                                      if (allCompleted && newCriteria.length > 0) {
                                        newStatus = 'verified';
                                      } else if (anyCompleted) {
                                        newStatus = 'in-progress';
                                      } else {
                                        newStatus = 'pending';
                                      }
                                      
                                      // Update both fields at once to avoid state race condition
                                      const updatedFeatures = [...editedContent.features];
                                      updatedFeatures[i] = { 
                                        ...updatedFeatures[i], 
                                        acceptanceCriteria: newCriteria,
                                        status: newStatus
                                      };
                                      setEditedContent({ ...editedContent, features: updatedFeatures });
                                      saveSection('features', updatedFeatures);
                                    }}
                                    className={clsx(
                                      'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0',
                                      item.completed 
                                        ? 'bg-green-500 border-green-500 text-white' 
                                        : 'border-zinc-600 hover:border-green-400'
                                    )}
                                  >
                                    {item.completed && <CheckCircle className="w-3.5 h-3.5" />}
                                  </button>
                                  <input
                                    type="text"
                                    value={item.text}
                                    onChange={(e) => {
                                      const newCriteria = [...criteria];
                                      newCriteria[j] = { ...newCriteria[j], text: e.target.value };
                                      updateArrayItem('features', i, 'acceptanceCriteria', newCriteria);
                                    }}
                                    onBlur={() => saveSection('features', editedContent.features)}
                                    className={clsx(
                                      'flex-1 bg-transparent text-sm focus:outline-none',
                                      item.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'
                                    )}
                                    placeholder="Acceptance criterion..."
                                  />
                                  <button
                                    onClick={() => {
                                      const newCriteria = criteria.filter((_, k) => k !== j);
                                      const updated = updateArrayItem('features', i, 'acceptanceCriteria', newCriteria);
                                      saveSection('features', updated);
                                    }}
                                    className="p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover/ac:opacity-100 transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))
                            );
                          })()}
                        </div>
                      </div>
                      
                      {/* Action Buttons Row - Add Criterion & Implement Feature */}
                      <div className="flex gap-3 mt-4">
                        {/* Add Criterion Button */}
                        <button
                          onClick={() => {
                            const normalizeAC = (ac: any): Array<{text: string; completed: boolean}> => {
                              if (!ac) return [];
                              if (typeof ac === 'string') {
                                return ac.split('\n').filter(Boolean).map(t => ({ text: t.replace(/^-\s*/, ''), completed: false }));
                              }
                              if (Array.isArray(ac)) {
                                return ac.map(item => {
                                  if (typeof item === 'string') return { text: item, completed: false };
                                  return { text: item.text || '', completed: item.completed || false };
                                });
                              }
                              return [];
                            };
                            const newCriteria = [...normalizeAC(feature.acceptanceCriteria), { text: '', completed: false }];
                            const updated = updateArrayItem('features', i, 'acceptanceCriteria', newCriteria);
                            saveSection('features', updated);
                          }}
                          className="flex-1 py-2 border border-dashed border-zinc-700 rounded-lg text-zinc-500 hover:border-blue-500 hover:text-blue-400 transition-colors text-xs flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Criterion
                        </button>
                        
                        {/* Implement Feature Button - hide only when all acceptance criteria are completed */}
                        {(() => {
                          // Normalize and check if all criteria are completed
                          const normalizeAC = (ac: any): Array<{text: string; completed: boolean}> => {
                            if (!ac) return [];
                            if (typeof ac === 'string') {
                              return ac.split('\n').filter(Boolean).map(t => ({ text: t.replace(/^-\s*/, ''), completed: false }));
                            }
                            if (Array.isArray(ac)) {
                              return ac.map(item => {
                                if (typeof item === 'string') return { text: item, completed: false };
                                return { text: item.text || '', completed: item.completed || false };
                              });
                            }
                            return [];
                          };
                          
                          const criteria = normalizeAC(feature.acceptanceCriteria);
                          const allCriteriaCompleted = criteria.length > 0 && criteria.every(c => c.completed);
                          
                          // Hide button only if all criteria are completed
                          if (allCriteriaCompleted) return null;
                          
                          return (
                            <button
                              onClick={() => handleImplementFeature(i, feature)}
                              disabled={implementingFeatureIndex === i}
                              className={clsx(
                                'flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all',
                                implementingFeatureIndex === i
                                  ? 'bg-green-500/30 text-green-300 cursor-wait'
                                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25'
                              )}
                            >
                              {implementingFeatureIndex === i ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Implementing...
                                </>
                              ) : (
                                <>
                                  <Cpu className="w-3 h-3" />
                                  Implement Feature
                                </>
                              )}
                            </button>
                          );
                        })()}
                      </div>
                        </>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setDeleteConfirm({ featureIndex: i, featureName: feature.name || 'Unnamed Feature' })}
                      className="p-2 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete feature"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
                </div>
                  );
                });
              })()}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">Target Personas</h3>
              <div className="flex items-center gap-2">
                <SaveIndicator section="targetUsers" />
                <button
                  onClick={() => addArrayItem('targetUsers', { persona: '', needs: [] })}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Add User
                </button>
              </div>
            </div>

            {editedContent.targetUsers.length === 0 ? (
              <Card className="text-center py-12">
                <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500">No target users defined yet</p>
                <button
                  onClick={() => addArrayItem('targetUsers', { persona: '', needs: [] })}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm"
                >
                  Add Your First User Persona
                </button>
              </Card>
            ) : (
              editedContent.targetUsers.map((user: any, i: number) => (
                <Card key={i} className="group">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={user.persona || ''}
                        onChange={(e) => updateArrayItem('targetUsers', i, 'persona', e.target.value)}
                        onBlur={() => saveSection('targetUsers', editedContent.targetUsers)}
                        className="w-full bg-transparent text-emerald-300 font-medium focus:outline-none border-b border-transparent hover:border-zinc-600 focus:border-emerald-500 pb-1 text-lg"
                        placeholder="User persona (e.g., 'Small Business Owner')..."
                      />
                      <div>
                        <label className="block text-xs text-zinc-500 mb-2">Needs & Goals</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(user.needs || []).map((need: string, j: number) => (
                            <EditableTag 
                              key={j} 
                              value={need} 
                              color="green"
                              onRemove={() => {
                                const updatedNeeds = user.needs.filter((_: any, idx: number) => idx !== j);
                                updateArrayItem('targetUsers', i, 'needs', updatedNeeds);
                                saveSection('targetUsers', editedContent.targetUsers);
                              }} 
                            />
                          ))}
                        </div>
                        <AddTagInput 
                          onAdd={(val) => {
                            const updatedNeeds = [...(user.needs || []), val];
                            updateArrayItem('targetUsers', i, 'needs', updatedNeeds);
                            saveSection('targetUsers', editedContent.targetUsers);
                          }} 
                          placeholder="Add a need or goal..." 
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeArrayItem('targetUsers', i)}
                      className="p-2 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* TECHNICAL TAB */}
        {activeTab === 'technical' && (
          <div className="space-y-6">
            {/* Sub-tab Navigation */}
            <div className="flex gap-2 p-1 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
              <button
                onClick={() => setTechnicalSubTab('dataModel')}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  technicalSubTab === 'dataModel'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                )}
              >
                <Database className="w-4 h-4" />
                Data Model
                {editedContent.dataModel?.length > 0 && (
                  <span className="bg-cyan-500/30 text-cyan-200 text-xs px-1.5 py-0.5 rounded-full">
                    {editedContent.dataModel.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTechnicalSubTab('apis')}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  technicalSubTab === 'apis'
                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                )}
              >
                <Plug className="w-4 h-4" />
                API Endpoints
                {editedContent.apiEndpoints?.length > 0 && (
                  <span className="bg-green-500/30 text-green-200 text-xs px-1.5 py-0.5 rounded-full">
                    {editedContent.apiEndpoints.length}
                  </span>
                )}
              </button>
            </div>

            {/* Data Model Sub-tab */}
            {technicalSubTab === 'dataModel' && (
            <>
            {/* Data Model */}
            <Card>
              <SectionHeader 
                title="Data Model" 
                icon={Database} 
                color="cyan"
                actions={
                  <button
                    onClick={() => addArrayItem('dataModel', { entity: '', attributes: [], relationships: [] })}
                    className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-colors text-xs"
                  >
                    <Plus className="w-3 h-3" /> Add Entity
                  </button>
                }
              />
              <SaveIndicator section="dataModel" />
              {editedContent.dataModel.length === 0 ? (
                <p className="text-zinc-500 text-sm py-4 text-center">No entities defined</p>
              ) : (
                <div className="space-y-4">
                  {editedContent.dataModel.map((entity: any, i: number) => (
                    <div key={i} className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/30 group relative">
                      <button
                        onClick={() => removeArrayItem('dataModel', i)}
                        className="absolute top-3 right-3 p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      {/* Entity Name */}
                      <input
                        type="text"
                        value={entity.entity || ''}
                        onChange={(e) => updateArrayItem('dataModel', i, 'entity', e.target.value)}
                        onBlur={() => saveSection('dataModel', editedContent.dataModel)}
                        className="w-full bg-transparent text-cyan-300 font-semibold text-lg focus:outline-none border-b border-transparent hover:border-zinc-600 focus:border-cyan-500 pb-1 mb-3"
                        placeholder="Entity name (e.g., User, Product, Order)..."
                      />
                      
                      {/* Properties/Attributes */}
                      <div className="space-y-2">
                        <p className="text-xs text-zinc-500 uppercase tracking-wide">Properties</p>
                        
                        {(entity.attributes || []).length === 0 ? (
                          <p className="text-xs text-zinc-600 italic py-2">No properties defined</p>
                        ) : (
                          <div className="space-y-1">
                            {(entity.attributes || []).map((attr: any, j: number) => (
                              <div key={j} className="flex items-center gap-2 bg-zinc-900/50 rounded-lg p-2 group/attr">
                                <input
                                  type="text"
                                  value={attr.name || ''}
                                  onChange={(e) => {
                                    const newAttrs = [...(entity.attributes || [])];
                                    newAttrs[j] = { ...newAttrs[j], name: e.target.value };
                                    updateArrayItem('dataModel', i, 'attributes', newAttrs);
                                  }}
                                  onBlur={() => saveSection('dataModel', editedContent.dataModel)}
                                  className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                                  placeholder="Property name..."
                                />
                                <select
                                  value={attr.type || 'String'}
                                  onChange={(e) => {
                                    const newAttrs = [...(entity.attributes || [])];
                                    newAttrs[j] = { ...newAttrs[j], type: e.target.value };
                                    const updated = updateArrayItem('dataModel', i, 'attributes', newAttrs);
                                    saveSection('dataModel', updated);
                                  }}
                                  className="bg-zinc-800 text-cyan-300 text-xs rounded px-2 py-1 border border-zinc-700 focus:outline-none focus:border-cyan-500"
                                >
                                  <optgroup label="Primitive Types">
                                    <option value="String">String</option>
                                    <option value="Number">Number</option>
                                    <option value="Boolean">Boolean</option>
                                    <option value="Date">Date</option>
                                    <option value="ID">ID</option>
                                    <option value="Email">Email</option>
                                    <option value="URL">URL</option>
                                  </optgroup>
                                  <optgroup label="Complex Types">
                                    <option value="Array">Array</option>
                                    <option value="Object">Object</option>
                                  </optgroup>
                                  {/* Entity References - other entities in the data model */}
                                  {editedContent.dataModel.filter((e: any, idx: number) => e.entity && idx !== i).length > 0 && (
                                    <optgroup label="Entity References">
                                      {editedContent.dataModel
                                        .filter((e: any, idx: number) => e.entity && idx !== i)
                                        .map((e: any) => (
                                          <option key={e.entity} value={e.entity}>{e.entity}</option>
                                        ))
                                      }
                                      {editedContent.dataModel
                                        .filter((e: any, idx: number) => e.entity && idx !== i)
                                        .map((e: any) => (
                                          <option key={`${e.entity}[]`} value={`${e.entity}[]`}>{e.entity}[] (array)</option>
                                        ))
                                      }
                                    </optgroup>
                                  )}
                                </select>
                                <button
                                  onClick={() => {
                                    const newAttrs = [...(entity.attributes || [])];
                                    newAttrs[j] = { ...newAttrs[j], required: !newAttrs[j].required };
                                    const updated = updateArrayItem('dataModel', i, 'attributes', newAttrs);
                                    saveSection('dataModel', updated);
                                  }}
                                  className={clsx(
                                    'text-xs px-2 py-0.5 rounded transition-colors',
                                    attr.required 
                                      ? 'bg-orange-500/20 text-orange-300' 
                                      : 'bg-zinc-700/50 text-zinc-500 hover:text-zinc-300'
                                  )}
                                >
                                  {attr.required ? 'Required' : 'Optional'}
                                </button>
                                <button
                                  onClick={() => {
                                    const newAttrs = (entity.attributes || []).filter((_: any, k: number) => k !== j);
                                    const updated = updateArrayItem('dataModel', i, 'attributes', newAttrs);
                                    saveSection('dataModel', updated);
                                  }}
                                  className="p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover/attr:opacity-100 transition-all"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Add Property Button */}
                        <button
                          onClick={() => {
                            const newAttrs = [...(entity.attributes || []), { name: '', type: 'String', required: false }];
                            const updated = updateArrayItem('dataModel', i, 'attributes', newAttrs);
                            saveSection('dataModel', updated);
                          }}
                          className="w-full py-2 border border-dashed border-zinc-700 rounded-lg text-zinc-500 hover:border-cyan-500 hover:text-cyan-400 transition-colors text-xs flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Property
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            </>
            )}

            {/* APIs Sub-tab */}
            {technicalSubTab === 'apis' && (
            <>
            <Card>
              <SectionHeader 
                title="API Endpoints" 
                icon={Plug} 
                color="green"
                actions={
                  <div className="flex gap-2">
                    <button
                      onClick={generateApisFromDataModel}
                      disabled={isGeneratingApis || editedContent.dataModel.length === 0}
                      className={clsx(
                        'flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs',
                        isGeneratingApis
                          ? 'bg-green-500/30 text-green-300 cursor-wait'
                          : editedContent.dataModel.length === 0
                            ? 'bg-zinc-700/50 text-zinc-500 cursor-not-allowed'
                            : 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
                      )}
                      title={editedContent.dataModel.length === 0 ? 'Add data model entities first' : 'Generate CRUD endpoints from data model'}
                    >
                      {isGeneratingApis ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Wand2 className="w-3 h-3" />
                      )}
                      Generate from Data Model
                    </button>
                    <button
                      onClick={() => addArrayItem('apiEndpoints', { method: 'GET', path: '/api/', description: '', entity: '' })}
                      className="flex items-center gap-1 px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors text-xs"
                    >
                      <Plus className="w-3 h-3" /> Add Endpoint
                    </button>
                  </div>
                }
              />
              <SaveIndicator section="apiEndpoints" />
              
              {editedContent.apiEndpoints.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-zinc-500 text-sm mb-4">No API endpoints defined</p>
                  <button
                    onClick={generateApisFromDataModel}
                    disabled={editedContent.dataModel.length === 0}
                    className={clsx(
                      'px-4 py-2 rounded-lg transition-colors text-sm font-medium',
                      editedContent.dataModel.length === 0
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    )}
                  >
                    {editedContent.dataModel.length === 0 
                      ? 'Add data model entities first' 
                      : '✨ Auto-generate from Data Model'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {editedContent.apiEndpoints.map((endpoint: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/30 group">
                      {/* Method Badge */}
                      <select
                        value={endpoint.method || 'GET'}
                        onChange={(e) => {
                          const updated = updateArrayItem('apiEndpoints', i, 'method', e.target.value);
                          saveSection('apiEndpoints', updated);
                        }}
                        className={clsx(
                          'px-2 py-1 rounded text-xs font-bold border-0 focus:outline-none focus:ring-1 focus:ring-white/20 cursor-pointer',
                          endpoint.method === 'GET' && 'bg-blue-500/30 text-blue-300',
                          endpoint.method === 'POST' && 'bg-green-500/30 text-green-300',
                          endpoint.method === 'PUT' && 'bg-yellow-500/30 text-yellow-300',
                          endpoint.method === 'PATCH' && 'bg-orange-500/30 text-orange-300',
                          endpoint.method === 'DELETE' && 'bg-red-500/30 text-red-300',
                          !['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(endpoint.method) && 'bg-zinc-600 text-zinc-300'
                        )}
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                      
                      {/* Path */}
                      <input
                        type="text"
                        value={endpoint.path || ''}
                        onChange={(e) => updateArrayItem('apiEndpoints', i, 'path', e.target.value)}
                        onBlur={() => saveSection('apiEndpoints', editedContent.apiEndpoints)}
                        className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none border-b border-transparent hover:border-zinc-600 focus:border-green-500"
                        placeholder="/api/resource/:id"
                      />
                      
                      {/* Entity Badge */}
                      {endpoint.entity && (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-xs">
                          {endpoint.entity}
                        </span>
                      )}
                      
                      {/* Description (on hover) */}
                      <input
                        type="text"
                        value={endpoint.description || ''}
                        onChange={(e) => updateArrayItem('apiEndpoints', i, 'description', e.target.value)}
                        onBlur={() => saveSection('apiEndpoints', editedContent.apiEndpoints)}
                        className="w-48 bg-transparent text-zinc-400 text-xs focus:outline-none border-b border-transparent hover:border-zinc-600 focus:border-green-500 opacity-60 group-hover:opacity-100 transition-opacity"
                        placeholder="Description..."
                      />
                      
                      {/* Delete */}
                      <button
                        onClick={() => removeArrayItem('apiEndpoints', i)}
                        className="p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            </>
            )}

            {/* Authentication */}
            <Card>
              <SectionHeader title="Authentication" icon={Shield} color="orange" />
              <SaveIndicator section="authentication" />
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">Auth Methods</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editedContent.authentication?.methods?.map((method: string, i: number) => (
                      <EditableTag key={i} value={method} color="orange" onRemove={() => removeFromNestedArray('authentication', 'methods', i)} />
                    ))}
                  </div>
                  
                  {/* Suggestion Pills with Conflict Detection */}
                  <div className="mb-3">
                    <p className="text-xs text-zinc-600 mb-2">Quick add:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(() => {
                        // Define auth method conflicts
                        const conflicts: Record<string, string[]> = {
                          'Email/Password': ['Magic Link', 'Passkeys'],
                          'Magic Link': ['Email/Password'],
                          'Passkeys': ['Email/Password'],
                        };
                        
                        const methods = editedContent.authentication?.methods || [];
                        
                        return ['Email/Password', 'Google OAuth', 'GitHub OAuth', 'Magic Link', 'SSO/SAML', 'Apple Sign-In', 'Microsoft OAuth', 'Phone/SMS', '2FA/MFA', 'Passkeys'].map((suggestion) => {
                          const isAdded = methods.includes(suggestion);
                          const conflictingWith = conflicts[suggestion]?.find((c: string) => methods.includes(c));
                          const hasConflict = !!conflictingWith;
                          
                          return (
                            <button
                              key={suggestion}
                              onClick={() => !isAdded && !hasConflict && addToNestedArray('authentication', 'methods', suggestion)}
                              disabled={isAdded || hasConflict}
                              title={hasConflict ? `Conflicts with "${conflictingWith}"` : undefined}
                              className={clsx(
                                'px-2.5 py-1 rounded-full text-xs transition-all',
                                isAdded 
                                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                  : hasConflict
                                    ? 'bg-red-900/20 text-red-400/50 cursor-not-allowed line-through'
                                    : 'bg-zinc-700/50 text-zinc-400 hover:bg-orange-500/20 hover:text-orange-300 cursor-pointer'
                              )}
                            >
                              {isAdded ? '✓ ' : hasConflict ? '⚠ ' : '+ '}{suggestion}
                            </button>
                          );
                        });
                      })()}
                    </div>
                    {editedContent.authentication?.methods?.some((m: string) => ['Email/Password', 'Magic Link', 'Passkeys'].includes(m)) && (
                      <p className="text-xs text-zinc-600 mt-2 italic">
                        Note: Email/Password, Magic Link, and Passkeys are mutually exclusive auth strategies.
                      </p>
                    )}
                  </div>
                  
                  <AddTagInput onAdd={(val) => addToNestedArray('authentication', 'methods', val)} placeholder="Add custom auth method..." />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">User Roles</label>
                  {editedContent.authentication?.roles?.map((role: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-zinc-800/50 p-2 rounded-lg mb-2 group">
                      <span className="text-orange-300 font-medium">{role.name}:</span>
                      <span className="text-zinc-400 text-sm flex-1">{Array.isArray(role.permissions) ? role.permissions.join(', ') : role.permissions}</span>
                      <button
                        onClick={() => {
                          const roles = editedContent.authentication.roles.filter((_: any, idx: number) => idx !== i);
                          updateField('authentication', 'roles', roles);
                          saveSection('authentication', { ...editedContent.authentication, roles });
                        }}
                        className="p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Integrations */}
            <Card>
              <SectionHeader 
                title="Integrations" 
                icon={Plug} 
                color="yellow"
                actions={
                  <button
                    onClick={() => addArrayItem('integrations', { service: '', purpose: '' })}
                    className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors text-xs"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                }
              />
              <SaveIndicator section="integrations" />
              
              {/* Integration Suggestion Pills */}
              <div className="mb-4">
                <p className="text-xs text-zinc-600 mb-2">Quick add popular integrations:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { service: 'Stripe', purpose: 'Payment processing' },
                    { service: 'SendGrid', purpose: 'Email delivery' },
                    { service: 'Twilio', purpose: 'SMS/Voice' },
                    { service: 'AWS S3', purpose: 'File storage' },
                    { service: 'OpenAI', purpose: 'AI/ML services' },
                    { service: 'Supabase', purpose: 'Database & Auth' },
                    { service: 'Firebase', purpose: 'Backend services' },
                    { service: 'Cloudflare', purpose: 'CDN & Security' },
                    { service: 'Resend', purpose: 'Transactional email' },
                    { service: 'Vercel', purpose: 'Deployment' },
                  ].map((sug) => {
                    const isAdded = editedContent.integrations?.some((i: any) => i.service === sug.service);
                    return (
                      <button
                        key={sug.service}
                        onClick={() => !isAdded && addArrayItem('integrations', sug)}
                        disabled={isAdded}
                        className={clsx(
                          'px-2.5 py-1 rounded-full text-xs transition-all',
                          isAdded 
                            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                            : 'bg-zinc-700/50 text-zinc-400 hover:bg-yellow-500/20 hover:text-yellow-300 cursor-pointer'
                        )}
                      >
                        {isAdded ? '✓ ' : '+ '}{sug.service}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {editedContent.integrations.length === 0 ? (
                <p className="text-zinc-500 text-sm py-4 text-center">No integrations defined. Click a suggestion above or use the + Add button.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {editedContent.integrations.map((integration: any, i: number) => (
                    <div key={i} className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/30 group relative">
                      <button
                        onClick={() => removeArrayItem('integrations', i)}
                        className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <input
                        type="text"
                        value={integration.service || ''}
                        onChange={(e) => updateArrayItem('integrations', i, 'service', e.target.value)}
                        onBlur={() => saveSection('integrations', editedContent.integrations)}
                        className="w-full bg-transparent text-yellow-300 font-medium focus:outline-none text-sm mb-1"
                        placeholder="Service name..."
                      />
                      <input
                        type="text"
                        value={integration.purpose || ''}
                        onChange={(e) => updateArrayItem('integrations', i, 'purpose', e.target.value)}
                        onBlur={() => saveSection('integrations', editedContent.integrations)}
                        className="w-full bg-transparent text-zinc-400 text-xs focus:outline-none"
                        placeholder="Purpose..."
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Technical Requirements */}
            <Card>
              <SectionHeader title="Technical Requirements" icon={Cpu} color="green" />
              <SaveIndicator section="technicalRequirements" />
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">Platforms</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editedContent.technicalRequirements?.platforms?.map((platform: string, i: number) => (
                      <EditableTag key={i} value={platform} color="green" onRemove={() => removeFromNestedArray('technicalRequirements', 'platforms', i)} />
                    ))}
                  </div>
                  <AddTagInput onAdd={(val) => addToNestedArray('technicalRequirements', 'platforms', val)} placeholder="Add platform..." />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">Performance Requirements</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editedContent.technicalRequirements?.performance?.map((req: string, i: number) => (
                      <EditableTag key={i} value={req} onRemove={() => removeFromNestedArray('technicalRequirements', 'performance', i)} />
                    ))}
                  </div>
                  <AddTagInput onAdd={(val) => addToNestedArray('technicalRequirements', 'performance', val)} placeholder="Add performance requirement..." />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">Security Requirements</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editedContent.technicalRequirements?.security?.map((req: string, i: number) => (
                      <EditableTag key={i} value={req} onRemove={() => removeFromNestedArray('technicalRequirements', 'security', i)} />
                    ))}
                  </div>
                  <AddTagInput onAdd={(val) => addToNestedArray('technicalRequirements', 'security', val)} placeholder="Add security requirement..." />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* DESIGN TAB */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            {/* Color Palette Card */}
            <Card>
              <SectionHeader title="Color Palette" icon={Palette} color="pink" />
              <SaveIndicator section="design" />
              
              {/* Color Theme Presets */}
              <div className="mb-6">
                <p className="text-xs text-zinc-600 mb-2">Quick apply a theme:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Midnight', colors: { primary: '#8b5cf6', secondary: '#6366f1', background: '#09090b', surface: '#18181b', textPrimary: '#fafafa', textSecondary: '#a1a1aa', border: '#27272a', success: '#22c55e', error: '#ef4444', warning: '#f59e0b' } },
                    { name: 'Ocean', colors: { primary: '#0ea5e9', secondary: '#06b6d4', background: '#0c1222', surface: '#1e293b', textPrimary: '#f8fafc', textSecondary: '#94a3b8', border: '#334155', success: '#10b981', error: '#f43f5e', warning: '#f97316' } },
                    { name: 'Forest', colors: { primary: '#22c55e', secondary: '#14b8a6', background: '#0a0f0d', surface: '#1a2420', textPrimary: '#f0fdf4', textSecondary: '#86efac', border: '#22543d', success: '#4ade80', error: '#fb7185', warning: '#fbbf24' } },
                    { name: 'Sunset', colors: { primary: '#f97316', secondary: '#f59e0b', background: '#1c1412', surface: '#292118', textPrimary: '#fef3c7', textSecondary: '#d6d3d1', border: '#44403c', success: '#84cc16', error: '#ef4444', warning: '#fbbf24' } },
                    { name: 'Rose', colors: { primary: '#ec4899', secondary: '#f43f5e', background: '#0f0912', surface: '#1c1520', textPrimary: '#fdf2f8', textSecondary: '#f9a8d4', border: '#4a1942', success: '#22c55e', error: '#ef4444', warning: '#f59e0b' } },
                    { name: 'Minimal Light', colors: { primary: '#18181b', secondary: '#3f3f46', background: '#ffffff', surface: '#f4f4f5', textPrimary: '#18181b', textSecondary: '#71717a', border: '#e4e4e7', success: '#16a34a', error: '#dc2626', warning: '#ca8a04' } },
                    { name: 'Corporate', colors: { primary: '#2563eb', secondary: '#4f46e5', background: '#ffffff', surface: '#f8fafc', textPrimary: '#0f172a', textSecondary: '#475569', border: '#e2e8f0', success: '#16a34a', error: '#dc2626', warning: '#d97706' } },
                  ].map((theme) => {
                    const isSelected = editedContent.design?.colors?.primary === theme.colors.primary;
                    return (
                    <button
                      key={theme.name}
                      onClick={() => {
                        const colors = { ...theme.colors };
                        updateField('design', 'colors', colors);
                        saveSection('design', { ...editedContent.design, colors });
                      }}
                      className={clsx(
                        "group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all",
                        isSelected
                          ? "bg-pink-500/20 border-pink-500 text-pink-300"
                          : "bg-zinc-800/50 border-zinc-700/50 hover:bg-pink-500/20 hover:border-pink-500/50"
                      )}
                    >
                      {/* Color preview dots */}
                      <div className="flex -space-x-1">
                        <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: theme.colors.primary }} />
                        <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: theme.colors.secondary }} />
                        <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: theme.colors.background }} />
                      </div>
                      <span className={clsx("text-xs transition-colors", isSelected ? "text-pink-300" : "text-zinc-400 group-hover:text-pink-300")}>{isSelected ? '✓ ' : ''}{theme.name}</span>
                    </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['primary', 'secondary', 'background', 'surface', 'textPrimary', 'textSecondary', 'border', 'success'] as const).map((colorKey) => {
                  const defaults: Record<string, string> = {
                    primary: '#3b82f6', secondary: '#8b5cf6', background: '#09090b', surface: '#18181b',
                    textPrimary: '#fafafa', textSecondary: '#a1a1aa', border: '#27272a', success: '#22c55e'
                  };
                  const labels: Record<string, string> = {
                    primary: 'Primary', secondary: 'Secondary', background: 'Background', surface: 'Surface',
                    textPrimary: 'Text Primary', textSecondary: 'Text Secondary', border: 'Border', success: 'Success'
                  };
                  return (
                    <div key={colorKey}>
                      <label className="block text-xs text-zinc-500 mb-1.5">{labels[colorKey]}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editedContent.design?.colors?.[colorKey] || defaults[colorKey]}
                          onChange={(e) => {
                            const colors = { ...(editedContent.design?.colors || {}), [colorKey]: e.target.value };
                            updateField('design', 'colors', colors);
                          }}
                          onBlur={() => saveSection('design', editedContent.design)}
                          className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={editedContent.design?.colors?.[colorKey] || defaults[colorKey]}
                          onChange={(e) => {
                            const colors = { ...(editedContent.design?.colors || {}), [colorKey]: e.target.value };
                            updateField('design', 'colors', colors);
                          }}
                          onBlur={() => saveSection('design', editedContent.design)}
                          className="flex-1 px-2 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded text-zinc-300 text-xs font-mono"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-zinc-700/50">
                {(['error', 'warning'] as const).map((colorKey) => {
                  const defaults: Record<string, string> = { error: '#ef4444', warning: '#f59e0b' };
                  return (
                    <div key={colorKey}>
                      <label className="block text-xs text-zinc-500 mb-1.5 capitalize">{colorKey}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editedContent.design?.colors?.[colorKey] || defaults[colorKey]}
                          onChange={(e) => {
                            const colors = { ...(editedContent.design?.colors || {}), [colorKey]: e.target.value };
                            updateField('design', 'colors', colors);
                          }}
                          onBlur={() => saveSection('design', editedContent.design)}
                          className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={editedContent.design?.colors?.[colorKey] || defaults[colorKey]}
                          onChange={(e) => {
                            const colors = { ...(editedContent.design?.colors || {}), [colorKey]: e.target.value };
                            updateField('design', 'colors', colors);
                          }}
                          onBlur={() => saveSection('design', editedContent.design)}
                          className="flex-1 px-2 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded text-zinc-300 text-xs font-mono"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Typography Card */}
            <Card>
              <SectionHeader title="Typography" icon={FileText} color="blue" />
              <SaveIndicator section="design" />
              
              {/* Typography Presets */}
              <div className="mb-6">
                <p className="text-xs text-zinc-600 mb-2">Quick apply a type system:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Modern Clean', typography: { headingFont: 'Inter', bodyFont: 'Inter', baseSize: '16', headingScale: 'normal' } },
                    { name: 'Professional', typography: { headingFont: 'Plus Jakarta Sans', bodyFont: 'Open Sans', baseSize: '16', headingScale: 'normal' } },
                    { name: 'Bold Impact', typography: { headingFont: 'Montserrat', bodyFont: 'Roboto', baseSize: '16', headingScale: 'loose' } },
                    { name: 'Friendly', typography: { headingFont: 'Poppins', bodyFont: 'Nunito', baseSize: '16', headingScale: 'normal' } },
                    { name: 'Tech Startup', typography: { headingFont: 'Space Grotesk', bodyFont: 'Inter', baseSize: '15', headingScale: 'tight' } },
                    { name: 'Editorial', typography: { headingFont: 'DM Sans', bodyFont: 'Source Sans Pro', baseSize: '18', headingScale: 'loose' } },
                    { name: 'Compact', typography: { headingFont: 'Roboto', bodyFont: 'Roboto', baseSize: '14', headingScale: 'tight' } },
                  ].map((preset) => {
                    const isSelected = editedContent.design?.typography?.headingFont === preset.typography.headingFont && 
                                       editedContent.design?.typography?.bodyFont === preset.typography.bodyFont;
                    return (
                    <button
                      key={preset.name}
                      onClick={() => {
                        const typography = { ...preset.typography };
                        updateField('design', 'typography', typography);
                        saveSection('design', { ...editedContent.design, typography });
                      }}
                      className={clsx(
                        "group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all",
                        isSelected
                          ? "bg-blue-500/20 border-blue-500 text-blue-300"
                          : "bg-zinc-800/50 border-zinc-700/50 hover:bg-blue-500/20 hover:border-blue-500/50"
                      )}
                    >
                      <span className={clsx("text-[10px] font-bold", isSelected ? "text-blue-300" : "text-zinc-500 group-hover:text-blue-300")} style={{ fontFamily: `${preset.typography.headingFont}, sans-serif` }}>Aa</span>
                      <span className={clsx("text-xs transition-colors", isSelected ? "text-blue-300" : "text-zinc-400 group-hover:text-blue-300")}>{isSelected ? '✓ ' : ''}{preset.name}</span>
                    </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Heading Font</label>
                  <select
                    value={editedContent.design?.typography?.headingFont || 'Inter'}
                    onChange={(e) => {
                      const typography = { ...(editedContent.design?.typography || {}), headingFont: e.target.value };
                      updateField('design', 'typography', typography);
                      saveSection('design', { ...editedContent.design, typography });
                    }}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-300"
                  >
                    {['Inter', 'Roboto', 'Outfit', 'Poppins', 'Plus Jakarta Sans', 'DM Sans', 'Montserrat', 'Space Grotesk'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Body Font</label>
                  <select
                    value={editedContent.design?.typography?.bodyFont || 'Inter'}
                    onChange={(e) => {
                      const typography = { ...(editedContent.design?.typography || {}), bodyFont: e.target.value };
                      updateField('design', 'typography', typography);
                      saveSection('design', { ...editedContent.design, typography });
                    }}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-300"
                  >
                    {['Inter', 'Roboto', 'Open Sans', 'Lato', 'Source Sans Pro', 'Nunito'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Base Font Size</label>
                  <select
                    value={editedContent.design?.typography?.baseSize || '16'}
                    onChange={(e) => {
                      const typography = { ...(editedContent.design?.typography || {}), baseSize: e.target.value };
                      updateField('design', 'typography', typography);
                      saveSection('design', { ...editedContent.design, typography });
                    }}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-300"
                  >
                    <option value="14">14px (Compact)</option>
                    <option value="15">15px (Small)</option>
                    <option value="16">16px (Default)</option>
                    <option value="18">18px (Large)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Heading Scale</label>
                  <select
                    value={editedContent.design?.typography?.headingScale || 'normal'}
                    onChange={(e) => {
                      const typography = { ...(editedContent.design?.typography || {}), headingScale: e.target.value };
                      updateField('design', 'typography', typography);
                      saveSection('design', { ...editedContent.design, typography });
                    }}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-300"
                  >
                    <option value="tight">Tight (1.125)</option>
                    <option value="normal">Normal (1.25)</option>
                    <option value="loose">Loose (1.333)</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Spacing & Layout Card */}
            <Card>
              <SectionHeader title="Spacing & Layout" icon={Layers} color="green" />
              <SaveIndicator section="design" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Border Radius</label>
                  <select
                    value={editedContent.design?.layout?.borderRadius || 'md'}
                    onChange={(e) => {
                      const layout = { ...(editedContent.design?.layout || {}), borderRadius: e.target.value };
                      updateField('design', 'layout', layout);
                      saveSection('design', { ...editedContent.design, layout });
                    }}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-300"
                  >
                    <option value="none">None</option>
                    <option value="sm">Small (4px)</option>
                    <option value="md">Medium (8px)</option>
                    <option value="lg">Large (12px)</option>
                    <option value="xl">Extra Large (16px)</option>
                    <option value="full">Full (pill)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Spacing Scale</label>
                  <select
                    value={editedContent.design?.layout?.spacingScale || 'normal'}
                    onChange={(e) => {
                      const layout = { ...(editedContent.design?.layout || {}), spacingScale: e.target.value };
                      updateField('design', 'layout', layout);
                      saveSection('design', { ...editedContent.design, layout });
                    }}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-300"
                  >
                    <option value="compact">Compact</option>
                    <option value="normal">Normal</option>
                    <option value="relaxed">Relaxed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Container Width</label>
                  <select
                    value={editedContent.design?.layout?.containerWidth || 'lg'}
                    onChange={(e) => {
                      const layout = { ...(editedContent.design?.layout || {}), containerWidth: e.target.value };
                      updateField('design', 'layout', layout);
                      saveSection('design', { ...editedContent.design, layout });
                    }}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-300"
                  >
                    <option value="sm">Small (640px)</option>
                    <option value="md">Medium (768px)</option>
                    <option value="lg">Large (1024px)</option>
                    <option value="xl">XL (1280px)</option>
                    <option value="full">Full Width</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Style Preferences Card */}
            <Card>
              <SectionHeader title="Style Preferences" icon={Sparkles} color="blue" />
              <SaveIndicator section="design" />
              
              {/* Style Presets */}
              <div className="mb-6">
                <p className="text-xs text-zinc-600 mb-2">Quick apply a style:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'SaaS Dark', style: { themeMode: 'dark', visualStyle: 'modern', shadowIntensity: 'subtle', animations: true } },
                    { name: 'SaaS Light', style: { themeMode: 'light', visualStyle: 'modern', shadowIntensity: 'medium', animations: true } },
                    { name: 'Glassmorphic', style: { themeMode: 'dark', visualStyle: 'glassmorphism', shadowIntensity: 'subtle', animations: true } },
                    { name: 'Minimal', style: { themeMode: 'light', visualStyle: 'minimal', shadowIntensity: 'none', animations: false } },
                    { name: 'Bold & Fun', style: { themeMode: 'dark', visualStyle: 'playful', shadowIntensity: 'strong', animations: true } },
                    { name: 'Enterprise', style: { themeMode: 'system', visualStyle: 'minimal', shadowIntensity: 'subtle', animations: false } },
                    { name: 'Dynamic', style: { themeMode: 'dark', visualStyle: 'bold', shadowIntensity: 'medium', animations: true } },
                  ].map((preset) => {
                    const isSelected = editedContent.design?.style?.themeMode === preset.style.themeMode && 
                                       editedContent.design?.style?.visualStyle === preset.style.visualStyle;
                    return (
                    <button
                      key={preset.name}
                      onClick={() => {
                        const style = { ...preset.style };
                        updateField('design', 'style', style);
                        saveSection('design', { ...editedContent.design, style });
                      }}
                      className={clsx(
                        "group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all",
                        isSelected
                          ? "bg-blue-500/20 border-blue-500 text-blue-300"
                          : "bg-zinc-800/50 border-zinc-700/50 hover:bg-blue-500/20 hover:border-blue-500/50"
                      )}
                    >
                      <span className={clsx("text-xs transition-colors", isSelected ? "text-blue-300" : "text-zinc-400 group-hover:text-blue-300")}>{isSelected ? '✓ ' : ''}{preset.name}</span>
                    </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Theme Mode</label>
                  <div className="flex gap-2">
                    {['light', 'dark', 'system'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          const style = { ...(editedContent.design?.style || {}), themeMode: mode };
                          updateField('design', 'style', style);
                          saveSection('design', { ...editedContent.design, style });
                        }}
                        className={clsx(
                          'flex-1 px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all',
                          editedContent.design?.style?.themeMode === mode ? 'bg-blue-500 text-white' : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700'
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Visual Style</label>
                  <select
                    value={editedContent.design?.style?.visualStyle || 'modern'}
                    onChange={(e) => {
                      const style = { ...(editedContent.design?.style || {}), visualStyle: e.target.value };
                      updateField('design', 'style', style);
                      saveSection('design', { ...editedContent.design, style });
                    }}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-300"
                  >
                    <option value="minimal">Minimal</option>
                    <option value="modern">Modern</option>
                    <option value="glassmorphism">Glassmorphism</option>
                    <option value="bold">Bold</option>
                    <option value="playful">Playful</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Shadow Intensity</label>
                  <select
                    value={editedContent.design?.style?.shadowIntensity || 'subtle'}
                    onChange={(e) => {
                      const style = { ...(editedContent.design?.style || {}), shadowIntensity: e.target.value };
                      updateField('design', 'style', style);
                      saveSection('design', { ...editedContent.design, style });
                    }}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-300"
                  >
                    <option value="none">None</option>
                    <option value="subtle">Subtle</option>
                    <option value="medium">Medium</option>
                    <option value="strong">Strong</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Animations</label>
                  <div className="flex gap-2">
                    {[{ v: true, l: 'Enabled' }, { v: false, l: 'Disabled' }].map((opt) => (
                      <button
                        key={String(opt.v)}
                        onClick={() => {
                          const style = { ...(editedContent.design?.style || {}), animations: opt.v };
                          updateField('design', 'style', style);
                          saveSection('design', { ...editedContent.design, style });
                        }}
                        className={clsx(
                          'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          editedContent.design?.style?.animations === opt.v ? 'bg-blue-500 text-white' : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700'
                        )}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Design Inspirations Card */}
            <Card>
              <SectionHeader title="Design Inspirations" icon={Target} color="orange" />
              <SaveIndicator section="design" />
              <div className="flex flex-wrap gap-2 mb-3">
                {editedContent.design?.inspirations?.map((insp: string, i: number) => (
                  <EditableTag key={i} value={insp} onRemove={() => removeFromNestedArray('design', 'inspirations', i)} />
                ))}
              </div>
              <div className="mb-3">
                <p className="text-xs text-zinc-600 mb-2">Quick add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Stripe', 'Linear', 'Notion', 'Vercel', 'Figma', 'Apple', 'Airbnb', 'Spotify'].map((s) => {
                    const added = editedContent.design?.inspirations?.includes(s);
                    return (
                      <button key={s} onClick={() => !added && addToNestedArray('design', 'inspirations', s)} disabled={added}
                        className={clsx('px-2.5 py-1 rounded-full text-xs transition-all', added ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-700/50 text-zinc-400 hover:bg-orange-500/20 hover:text-orange-300')}
                      >{added ? '✓ ' : '+ '}{s}</button>
                    );
                  })}
                </div>
              </div>
              <AddTagInput onAdd={(val) => addToNestedArray('design', 'inspirations', val)} placeholder="Add custom inspiration..." />
            </Card>
          </div>
        )}
      </div>

      {/* Raw JSON Debug */}
      <details className="mt-6">
        <summary className="cursor-pointer text-zinc-500 hover:text-zinc-300 text-sm">View Raw JSON</summary>
        <pre className="mt-2 bg-zinc-950 p-4 rounded-lg overflow-x-auto text-xs text-zinc-500 max-h-64 overflow-y-auto">
          {JSON.stringify(editedContent, null, 2)}
        </pre>
      </details>
      
      {/* Document Drawer */}
      <PrdDocumentDrawer 
        isOpen={showDocumentDrawer}
        onClose={() => setShowDocumentDrawer(false)}
        content={editedContent}
        projectName={projectName}
      />

      {/* AI Description Generator Modal */}
      {aiGenModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">AI Description Generator</h3>
              </div>
              <button
                onClick={() => setAiGenModal(null)}
                className="p-1 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Describe what this feature should do</label>
                <textarea
                  value={aiGenModal.prompt}
                  onChange={(e) => setAiGenModal({ ...aiGenModal, prompt: e.target.value })}
                  className="w-full bg-zinc-800 text-zinc-200 text-sm focus:outline-none resize-none rounded-lg p-3 border border-zinc-700 focus:border-blue-500 placeholder-zinc-600"
                  placeholder="e.g., User authentication with email and password, social login options..."
                  rows={3}
                  disabled={aiGenModal.isGenerating}
                />
              </div>
              
              {/* Feature Context */}
              <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                <p className="text-xs text-zinc-500 mb-1">Generating for:</p>
                <p className="text-sm text-white font-medium">
                  {editedContent.features[aiGenModal.featureIndex]?.name || 'Unnamed Feature'}
                </p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-zinc-700 bg-zinc-800/30">
              <button
                onClick={() => setAiGenModal(null)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                disabled={aiGenModal.isGenerating}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setAiGenModal({ ...aiGenModal, isGenerating: true });
                  
                  // Simulate AI generation (replace with actual API call)
                  await new Promise(r => setTimeout(r, 1500));
                  
                  const generatedDescription = `This feature enables ${aiGenModal.prompt.toLowerCase()}. It provides a seamless user experience with intuitive controls and responsive feedback. Key capabilities include error handling, loading states, and accessibility support.`;
                  
                  // Update the feature description
                  const updatedFeatures = [...editedContent.features];
                  updatedFeatures[aiGenModal.featureIndex] = {
                    ...updatedFeatures[aiGenModal.featureIndex],
                    description: generatedDescription
                  };
                  setEditedContent({ ...editedContent, features: updatedFeatures });
                  saveSection('features', updatedFeatures);
                  
                  setAiGenModal(null);
                }}
                disabled={!aiGenModal.prompt.trim() || aiGenModal.isGenerating}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {aiGenModal.isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Description
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-700">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                <h3 className="font-semibold text-white">Delete Feature?</h3>
              </div>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="p-1 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <p className="text-zinc-400 text-sm">
                Are you sure you want to delete <span className="text-white font-medium">"{deleteConfirm.featureName}"</span>? This action cannot be undone.
              </p>
            </div>
            
            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-zinc-700 bg-zinc-800/30">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeArrayItem('features', deleteConfirm.featureIndex);
                  setDeleteConfirm(null);
                }}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Feature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Epic Delete Confirmation Modal */}
      {epicDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-700">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                <h3 className="font-semibold text-white">Delete Epic?</h3>
              </div>
              <button
                onClick={() => {
                  setEpicDeleteConfirm(null);
                  setEpicDeleteInput('');
                }}
                className="p-1 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-300 text-sm font-medium flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  This action cannot be undone!
                </p>
              </div>
              
              <p className="text-zinc-400 text-sm">
                You are about to delete <span className="text-white font-medium">"{epicDeleteConfirm.epicName}"</span>.
                {epicDeleteConfirm.featureCount > 0 && (
                  <span className="text-red-300 font-medium">
                    {' '}This will also delete {epicDeleteConfirm.featureCount} feature{epicDeleteConfirm.featureCount > 1 ? 's' : ''} within this epic.
                  </span>
                )}
              </p>
              
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
                  Type <span className="text-red-400 font-mono">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={epicDeleteInput}
                  onChange={(e) => setEpicDeleteInput(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 font-mono"
                  autoFocus
                />
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-zinc-700 bg-zinc-800/30">
              <button
                onClick={() => {
                  setEpicDeleteConfirm(null);
                  setEpicDeleteInput('');
                }}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (epicDeleteInput === 'DELETE') {
                    const epicToDelete = editedContent.epics[epicDeleteConfirm.epicIndex];
                    
                    // Remove all features belonging to this epic
                    const updatedFeatures = editedContent.features.filter((f: any) => 
                      f.epicId !== epicToDelete.id
                    );
                    
                    // Remove the epic
                    const updatedEpics = editedContent.epics.filter((_: any, idx: number) => 
                      idx !== epicDeleteConfirm.epicIndex
                    );
                    
                    // Update state
                    setEditedContent({ 
                      ...editedContent, 
                      epics: updatedEpics,
                      features: updatedFeatures 
                    });
                    
                    // Save both sections
                    saveSection('epics', updatedEpics);
                    saveSection('features', updatedFeatures);
                    
                    // Reset active epic index if needed
                    if (activeEpicIndex >= updatedEpics.length) {
                      setActiveEpicIndex(Math.max(0, updatedEpics.length - 1));
                    }
                    
                    // Close modal
                    setEpicDeleteConfirm(null);
                    setEpicDeleteInput('');
                  }
                }}
                disabled={epicDeleteInput !== 'DELETE'}
                className={clsx(
                  'px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2',
                  epicDeleteInput === 'DELETE'
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                )}
              >
                <Trash2 className="w-4 h-4" />
                Delete Epic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
