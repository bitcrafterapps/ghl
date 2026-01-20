'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  File, FileJson, FileCode, FileType, Image, Palette, 
  ChevronRight, ChevronDown, Folder, FolderOpen,
  Search
} from 'lucide-react';

// Dynamically import Monaco to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-zinc-950">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ),
});

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  language?: string;
}

interface CodeEditorProps {
  files?: FileNode[];
  onFileChange?: (path: string, content: string) => void;
  readOnly?: boolean;
  activeSidebar?: 'explorer' | 'search' | 'source-control' | null;
}

export function CodeEditor({ files = [], onFileChange, readOnly = false, activeSidebar = 'explorer' }: CodeEditorProps) {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [openTabs, setOpenTabs] = useState<FileNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  
  // Extract all folder paths and expand them by default
  const getAllFolderPaths = (nodes: FileNode[]): string[] => {
    const paths: string[] = [];
    const traverse = (node: FileNode) => {
      if (node.type === 'folder') {
        paths.push(node.path);
        if (node.children) {
          node.children.forEach(traverse);
        }
      }
    };
    nodes.forEach(traverse);
    return paths;
  };

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedFolders(new Set(getAllFolderPaths(files)));
  };

  const collapseAll = () => {
    setExpandedFolders(new Set());
  };

  const openFile = (file: FileNode) => {
    setSelectedFile(file);
    if (!openTabs.find((t) => t.path === file.path)) {
      setOpenTabs((prev) => [...prev, file]);
    }
  };

  const closeTab = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenTabs((prev) => prev.filter((t) => t.path !== path));
    if (selectedFile?.path === path) {
      const remaining = openTabs.filter((t) => t.path !== path);
      setSelectedFile(remaining[remaining.length - 1] || null);
    }
  };

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (selectedFile && value !== undefined) {
        onFileChange?.(selectedFile.path, value);
      }
    },
    [selectedFile, onFileChange]
  );

  const handleEditorMount = (editor: any) => {
    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition({ line: e.position.lineNumber, column: e.position.column });
    });
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'ts':
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'tsx':
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'js':
        return <FileCode className="w-4 h-4 text-yellow-400" />;
      case 'jsx':
        return <FileCode className="w-4 h-4 text-yellow-400" />;
      case 'css':
        return <Palette className="w-4 h-4 text-cyan-400" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-amber-400" />;
      case 'html':
        return <FileCode className="w-4 h-4 text-orange-400" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'svg':
        return <Image className="w-4 h-4 text-blue-400" />;
      case 'md':
        return <FileType className="w-4 h-4 text-zinc-300" />;
      default:
        return <File className="w-4 h-4 text-zinc-400" />;
    }
  };

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          onClick={() => (node.type === 'folder' ? toggleFolder(node.path) : openFile(node))}
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-zinc-800/50 rounded text-sm ${
            selectedFile?.path === node.path ? 'bg-zinc-800 text-white' : 'text-zinc-400'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {node.type === 'folder' ? (
            <>
              {expandedFolders.has(node.path) ? (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              )}
              {expandedFolders.has(node.path) ? (
                <FolderOpen className="w-4 h-4 text-blue-400" />
              ) : (
                <Folder className="w-4 h-4 text-blue-400" />
              )}
              <span className="font-medium text-zinc-300">{node.name}</span>
            </>
          ) : (
            <>
              {getFileIcon(node.name)}
              <span className={`font-mono text-xs ${
                selectedFile?.path === node.path ? 'text-white' : 'text-zinc-400'
              }`}>{node.name}</span>
            </>
          )}
        </div>
        {node.type === 'folder' && expandedFolders.has(node.path) && node.children && (
          <div>{renderFileTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  const getLanguage = (file: FileNode | null) => {
    if (!file) return 'typescript';
    if (file.language) return file.language === 'typescript' ? 'typescript' : file.language;
    const ext = file.name.split('.').pop();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'html':
        return 'html';
      default:
        return 'plaintext';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Main Editor Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Tree Sidebar - Conditionally Rendered */}
        {activeSidebar && (
          <div className="w-60 border-r border-[#2d2d30] flex flex-col bg-[#252526]">
            {activeSidebar === 'explorer' && (
              <>
                {/* File Tree Header */}
                <div className="p-2 border-b border-[#2d2d30] flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    Explorer
                  </span>
                  <button
                    onClick={() => expandedFolders.size > 0 ? collapseAll() : expandAll()}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded hover:bg-zinc-700/50"
                    title={expandedFolders.size > 0 ? "Collapse All" : "Expand All"}
                  >
                    {expandedFolders.size > 0 ? "⊟" : "⊞"}
                  </button>
                </div>

                {/* Search */}
                <div className="p-2 border-b border-[#2d2d30]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-3 py-1.5 text-xs bg-[#3c3c3c] border border-[#3c3c3c] rounded text-white placeholder-zinc-500 focus:outline-none focus:border-[#007acc]"
                  />
                </div>

                {/* File Tree */}
                <div className="flex-1 overflow-y-auto py-1">
                  {files.length > 0 ? (
                    renderFileTree(files)
                  ) : (
                    <div className="text-center py-8 px-4">
                      <p className="text-zinc-500 text-xs">No files yet</p>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {activeSidebar === 'search' && (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-[#2d2d30]">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    Search
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full px-3 py-1.5 pl-8 text-xs bg-[#3c3c3c] border border-[#3c3c3c] rounded text-white placeholder-zinc-500 focus:outline-none focus:border-[#007acc]"
                    />
                    <Search className="w-4 h-4 text-zinc-500 absolute left-2 top-2" />
                  </div>
                  
                  <div className="pt-2">
                    <div className="text-xs text-zinc-500 text-center py-8">
                      No results found
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          {/* Tabs */}
          {openTabs.length > 0 && (
            <div className="h-9 bg-[#2d2d30] border-b border-[#2d2d30] flex items-center overflow-x-auto">
              {openTabs.map((tab) => (
                <div
                  key={tab.path}
                  onClick={() => setSelectedFile(tab)}
                  className={`flex items-center gap-2 px-4 h-full border-r border-[#2d2d30] cursor-pointer text-sm ${
                    selectedFile?.path === tab.path
                      ? 'bg-[#1e1e1e] text-white'
                      : 'bg-[#2d2d30] text-zinc-400 hover:bg-[#2a2a2a]'
                  }`}
                >
                  <span className="font-mono text-xs">{tab.name}</span>
                  <button
                    onClick={(e) => closeTab(tab.path, e)}
                    className="p-0.5 hover:bg-zinc-600 rounded text-zinc-500 hover:text-white"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Monaco Editor */}
          <div className="flex-1 bg-[#1e1e1e]">
            {selectedFile ? (
              <MonacoEditor
                height="100%"
                language={getLanguage(selectedFile)}
                value={selectedFile.content || ''}
                onChange={handleEditorChange}
                onMount={handleEditorMount}
                theme="vs-dark"
                options={{
                  readOnly,
                  minimap: { enabled: true },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                  tabSize: 2,
                  padding: { top: 16, bottom: 16 },
                  fontFamily: "'Fira Code', 'Cascadia Code', Consolas, Monaco, monospace",
                  fontLigatures: true,
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                  contextmenu: true,
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-base font-medium text-zinc-400 mb-2">No file selected</h3>
                  <p className="text-zinc-600 text-sm">
                    Select a file from the explorer to view its contents
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VSCode-like Status Bar */}
      <div className="h-6 bg-[#007acc] border-t border-[#007acc] flex items-center justify-between px-3 text-xs text-white flex-shrink-0">
        <div className="flex items-center gap-4">
          {selectedFile && (
            <>
              <span className="font-medium">{selectedFile.path}</span>
              <span className="px-2 py-0.5 bg-white/20 rounded">{getLanguage(selectedFile).toUpperCase()}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {selectedFile && (
            <>
              <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
              <span>UTF-8</span>
              <span>Spaces: 2</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
