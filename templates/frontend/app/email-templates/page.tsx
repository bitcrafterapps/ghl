'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import { DataTable, Column } from '@/components/ui/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  Mail, 
  Plus, 
  Edit, 
  Send, 
  RefreshCw,
  XCircle,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Eye,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Minus,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Type
} from 'lucide-react';
import { getAuthToken } from '@/lib/auth';
import { getApiUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';

const API_URL = getApiUrl();

// WYSIWYG Toolbar Button Component
function ToolbarButton({ 
  onClick, 
  isActive = false, 
  disabled = false,
  children, 
  title 
}: { 
  onClick: () => void; 
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode; 
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#3A3A3A] transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        isActive ? 'bg-gray-200 dark:bg-[#3A3A3A] text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
      }`}
    >
      {children}
    </button>
  );
}

// Toolbar Divider
function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-300 dark:bg-[#3A3A3A] mx-1" />;
}

// Color Picker Button
function ColorPickerButton({ 
  onColorSelect, 
  currentColor,
  title,
  icon: Icon
}: { 
  onColorSelect: (color: string) => void;
  currentColor?: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const colors = [
    '#000000', '#374151', '#6B7280', '#9CA3AF',
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
  ];

  return (
    <div className="relative group">
      <button
        type="button"
        title={title}
        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#3A3A3A] transition-colors text-gray-600 dark:text-gray-400"
      >
        <Icon className="w-4 h-4" />
      </button>
      <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-[#2A2A2A] border border-gray-300 dark:border-[#3A3A3A] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 grid grid-cols-4 gap-1">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorSelect(color)}
            className="w-6 h-6 rounded border border-gray-300 dark:border-[#3A3A3A] hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}

// WYSIWYG HTML Editor Component
function HtmlEditor({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void;
}) {
  const [showSource, setShowSource] = useState(false);
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      UnderlineExtension,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-3 focus:outline-none',
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 dark:border-[#3A3A3A] rounded-md overflow-hidden bg-white dark:bg-[#2A2A2A]">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-2 border-b border-gray-300 dark:border-[#3A3A3A] bg-gray-50 dark:bg-[#252525] flex-wrap">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarDivider />
        
        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarDivider />
        
        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarDivider />
        
        {/* Text Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarDivider />
        
        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarDivider />
        
        {/* Block Elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarDivider />
        
        {/* Link */}
        <ToolbarButton
          onClick={addLink}
          isActive={editor.isActive('link')}
          title="Add/Edit Link"
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        
        {/* Colors */}
        <ColorPickerButton
          onColorSelect={(color) => editor.chain().focus().setColor(color).run()}
          title="Text Color"
          icon={Type}
        />
        <ColorPickerButton
          onColorSelect={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
          title="Highlight Color"
          icon={Palette}
        />
        
        <div className="flex-1" />
        
        {/* Source Toggle */}
        <ToolbarButton
          onClick={() => setShowSource(!showSource)}
          isActive={showSource}
          title="View HTML Source"
        >
          <Eye className="w-4 h-4" />
        </ToolbarButton>
      </div>
      
      {/* Editor / Source Toggle */}
      {showSource ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[200px] p-3 bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white font-mono text-sm focus:outline-none"
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}

interface Template {
  id: number;
  key: string;
  name: string;
  subject: string;
  body: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EmailTemplatesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { userProfile, isProfileLoaded } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<Template> | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/v1/emails/templates`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setTemplates(data.data.templates);
      } else {
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to fetch templates',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch templates',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isProfileLoaded) {
      if (!userProfile) {
        router.push('/login');
        return;
      }
      
      const adminParams = userProfile.roles?.includes('Site Admin') || userProfile.roles?.includes('Admin');
      setIsAdmin(adminParams);
      
      if (!adminParams) {
          toast({ title: 'Access Denied', description: 'You must be a Site Admin or Admin to view this page', variant: 'destructive' });
          router.push('/dashboard');
      } else {
        fetchTemplates();
      }
    }
  }, [isProfileLoaded, userProfile]);

  const handleCreate = () => {
    setCurrentTemplate({
      key: '',
      name: '',
      subject: '',
      body: '',
      enabled: true
    });
    setIsEditing(true);
  };

  const handleEdit = (template: Template) => {
    setCurrentTemplate({ ...template });
    setIsEditing(true);
  };

  const handleTest = (template: Template) => {
    setCurrentTemplate({ ...template });
    setTestEmailAddress('');
    setIsSendingTest(true);
  };

  const handleSave = async () => {
    if (!currentTemplate?.key || !currentTemplate?.name || !currentTemplate?.subject || !currentTemplate?.body) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const token = getAuthToken();
      const isNew = !currentTemplate.id;
      const url = isNew 
        ? `${API_URL}/api/v1/emails/templates` 
        : `${API_URL}/api/v1/emails/templates/${currentTemplate.key}`;
      
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(currentTemplate)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Template ${isNew ? 'created' : 'updated'} successfully`
        });
        setIsEditing(false);
        fetchTemplates();
      } else {
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to save template',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive'
      });
    }
  };

  const handleToggleEnabled = async (template: Template) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/v1/emails/templates/${template.key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: !template.enabled })
      });

      if (response.ok) {
        // Update local state
        setTemplates(templates.map(t =>
          t.id === template.id ? { ...t, enabled: !t.enabled } : t
        ));
        toast({
          title: 'Success',
          description: `Template ${!template.enabled ? 'enabled' : 'disabled'}`
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to update template',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update template',
        variant: 'destructive'
      });
    }
  };

  const handleSendTest = async () => {
    if (!testEmailAddress || !currentTemplate) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/v1/emails/send-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          templateKey: currentTemplate.key,
          to: testEmailAddress
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Test email sent successfully'
        });
        setIsSendingTest(false);
      } else {
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to send test email',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send test email',
        variant: 'destructive'
      });
    }
  };

  const columns: Column<Template>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (template) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{template.name}</div>
          <div className="text-xs text-gray-500">{template.key}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'name'
    },
    {
      key: 'subject',
      header: 'Subject',
      cell: (template) => (
        <div className="text-gray-600 dark:text-gray-300 truncate max-w-xs">
          {template.subject}
        </div>
      )
    },
    {
      key: 'enabled',
      header: 'Enabled',
      cell: (template) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleEnabled(template); }}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{ backgroundColor: template.enabled ? '#22c55e' : '#6b7280' }}
          title={template.enabled ? 'Click to disable' : 'Click to enable'}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              template.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      ),
      sortable: true,
      sortKey: 'enabled'
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (template) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(template); }}
            className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleTest(template); }}
            className="p-1 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
            title="Send Test"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  if (!isProfileLoaded) {
    return null; // Or loading spinner
  }

  // Allow access if admin check passed
  if (!userProfile && isLoading) return null;

  return (
    <Layout isAuthenticated={!!userProfile} isAdmin={isAdmin} noPadding>
      <SubHeader 
        icon={Mail}
        title="Email Templates" 
        actions={
          <div className="flex gap-2">
            <Button onClick={fetchTemplates} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        }
      />
      
      <div className="p-6">
        <DataTable
          data={templates}
          columns={columns}
          keyField="id"
          noDataMessage="No email templates found"
          onRowClick={handleEdit}
        />
      </div>

      {/* Edit Modal */}
      {isEditing && currentTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2A2A2A]">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentTemplate.id ? 'Edit Template' : 'New Template'}
              </h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Template Key
                  </label>
                  <input
                    type="text"
                    value={currentTemplate.key}
                    onChange={(e) => setCurrentTemplate({ ...currentTemplate, key: e.target.value })}
                    disabled={!!currentTemplate.id}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#3A3A3A] rounded-md bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier (e.g., welcome_email)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={currentTemplate.name}
                    onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#3A3A3A] rounded-md bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={currentTemplate.subject}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#3A3A3A] rounded-md bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Supports variables like {'{{firstName}}'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  HTML Body
                </label>
                <HtmlEditor
                  value={currentTemplate.body || ''}
                  onChange={(body) => setCurrentTemplate({ ...currentTemplate, body })}
                />
                <p className="text-xs text-gray-500 mt-1">Use the toolbar to format. Supports variables like {'{{firstName}}'}</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={currentTemplate.enabled}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, enabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enabled
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#252525]">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Send Test Modal */}
      {isSendingTest && currentTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2A2A2A]">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Send Test Email
              </h2>
              <button 
                onClick={() => setIsSendingTest(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Sending test email for template: <strong>{currentTemplate.name}</strong>
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#3A3A3A] rounded-md bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#252525]">
              <Button variant="outline" onClick={() => setIsSendingTest(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendTest} disabled={!testEmailAddress}>
                Send Test
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
