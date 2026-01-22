'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-text-style';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Unlink,
  Highlighter,
  Undo,
  Redo,
  Code,
  Quote
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback, useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className,
  minHeight = '200px'
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Highlight.configure({
        multicolor: true
      }),
      TextStyle,
      Color
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none px-4 py-3',
          'prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-white',
          'prose-p:text-gray-700 dark:prose-p:text-zinc-300',
          'prose-strong:text-gray-900 dark:prose-strong:text-white',
          'prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline',
          'prose-ul:list-disc prose-ol:list-decimal',
          'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-zinc-600',
          'prose-code:bg-gray-100 dark:prose-code:bg-zinc-800 prose-code:px-1 prose-code:rounded'
        ),
        style: `min-height: ${minHeight}`
      },
      handleDrop: (view, event, slice, moved) => {
        // Handle token drops
        const token = event.dataTransfer?.getData('text/plain');
        if (token && token.startsWith('{') && token.endsWith('}')) {
          event.preventDefault();
          // Get drop position
          const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (coordinates) {
            // Insert token at drop position
            const transaction = view.state.tr.insertText(token, coordinates.pos);
            view.dispatch(transaction);
            return true;
          }
        }
        return false;
      },
      handleDragOver: (view, event) => {
        // Allow drop
        event.preventDefault();
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div className={cn(
        "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden",
        className
      )}>
        <div className="p-4 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    children,
    title
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-2 rounded-lg transition-all",
        isActive
          ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
          : "text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-white",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );

  const Divider = () => (
    <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700 mx-1" />
  );

  return (
    <div className={cn(
      "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden",
      className
    )}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50">
        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <select
          value={
            editor.isActive('heading', { level: 1 })
              ? 'h1'
              : editor.isActive('heading', { level: 2 })
              ? 'h2'
              : editor.isActive('heading', { level: 3 })
              ? 'h3'
              : 'p'
          }
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'p') {
              editor.chain().focus().setParagraph().run();
            } else {
              const level = parseInt(value.replace('h', '')) as 1 | 2 | 3;
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
          className="px-2 py-1.5 text-sm bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <Divider />

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

        <Divider />

        {/* Alignment */}
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

        <Divider />

        {/* Links */}
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
          title="Remove Link"
        >
          <Unlink className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Blockquote & Code */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
