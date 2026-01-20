'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  language?: string;
}

interface WebContainerPreviewProps {
  files?: FileNode[];
  isLoading?: boolean;
  onFilesUpdated?: () => void;
  onError?: (error: {
    message: string;
    filePath?: string;
    lineNumber?: number;
    columnNumber?: number;
    stackTrace?: string;
  }) => void;
  onLog?: (log: string) => void;
}

const deviceSizes: Record<DeviceType, { width: string; height: string; label: string }> = {
  desktop: { width: '100%', height: '100%', label: 'Desktop' },
  tablet: { width: '768px', height: '1024px', label: 'Tablet' },
  mobile: { width: '375px', height: '667px', label: 'Mobile' },
};

// Status messages for different phases
type StatusPhase = 'idle' | 'booting' | 'mounting' | 'installing' | 'starting' | 'ready' | 'error';

// Script to inject into layout for navigation and error capture
// Uses dangerouslySetInnerHTML to avoid JSX parsing errors with curly braces in the script
const INJECTED_SCRIPT = `
<script dangerouslySetInnerHTML={{ __html: \`
(function() {
  // Navigation handling
  window.addEventListener('message', function(event) {
    var action = event.data && event.data.action;
    if (action === 'back') window.history.back();
    if (action === 'forward') window.history.forward();
    if (action === 'reload') window.location.reload();
  });

  // Inject CSS to hide Next.js error overlays
  var style = document.createElement('style');
  style.textContent = 'nextjs-portal, [data-nextjs-dialog], [data-nextjs-dialog-overlay], [data-nextjs-codeframe], [data-nextjs-terminal], [class*="nextjs-container-errors"], [class*="error-overlay"], [class*="__next-error"] { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }';
  document.head.appendChild(style);

  // Observe and hide any dynamically added error overlays
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1 && (node.tagName === 'NEXTJS-PORTAL' || (node.getAttribute && node.getAttribute('data-nextjs-dialog')))) {
          node.style.display = 'none';
          node.style.visibility = 'hidden';
        }
      });
    });
  });
  
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
})();
\` }} />
`;

// Helper to inject script into layout - injects before </body> if found
const injectScript = (content: string) => {
  if (content.includes('</body>')) {
    return content.replace('</body>', `${INJECTED_SCRIPT}</body>`);
  }
  return content;
};
// Convert FileNode[] to WebContainer FileSystemTree format
function buildFileSystemTree(nodes: FileNode[]): Record<string, any> {
  const tree: Record<string, any> = {};

  const processNode = (node: FileNode, parentPath: string = '') => {
    // Get the relative name from the path
    const pathParts = node.path.split('/').filter(Boolean);
    const fileName = pathParts[pathParts.length - 1];

    if (node.type === 'file' && node.content !== undefined) {
      let content = node.content;
      // Inject navigation script into root layout
      if (fileName === 'layout.tsx' && (node.path.includes('app/') || node.path.includes('src/app/'))) {
        content = injectScript(content);
      }
      
      tree[node.path.startsWith('/') ? node.path.substring(1) : node.path] = {
        file: {
          contents: content,
        },
      };
    }
  };

  nodes.forEach(node => {
     if (node.children) {
        const traverse = (n: FileNode) => {
           processNode(n);
           if (n.children) n.children.forEach(traverse);
        };
        traverse(node);
     } else {
        processNode(node);
     }
  });

  // Convert flat paths to nested structure
  const nested: Record<string, any> = {};
  
  for (const [path, value] of Object.entries(tree)) {
    const parts = path.split('/');
    let current = nested;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = { directory: {} };
      }
      current = current[part].directory;
    }
    
    const fileName = parts[parts.length - 1];
    current[fileName] = value;
  }

  return nested;
}


// Generate a minimal package.json if not provided, or merge required dependencies
function ensurePackageJson(tree: Record<string, any>): Record<string, any> {
  const requiredDeps = {
    next: '14.2.15',
    react: '^18.2.0',
    'react-dom': '^18.2.0',
    'lucide-react': 'latest',
    'tailwindcss': '^3.4.0',
    'tailwindcss-animate': '^1.0.7',
    'postcss': '^8.4.0',
    'autoprefixer': '^10.4.0',
    'date-fns': '^3.0.0',
    'clsx': '^2.0.0',
    'class-variance-authority': '^0.7.0',
    'tailwind-merge': '^2.0.0',
    'zod': '^3.22.0',
    'recharts': '^2.10.0',
    'framer-motion': '^10.16.0',
  };

  const requiredDevDeps = {
    '@types/node': '^20',
    '@types/react': '^18',
    '@types/react-dom': '^18',
    typescript: '^5',
  };

  if (!tree['package.json']) {
    tree['package.json'] = {
      file: {
        contents: JSON.stringify({
          name: 'generated-app',
          version: '0.1.0',
          private: true,
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start',
          },
          dependencies: requiredDeps,
          devDependencies: requiredDevDeps,
        }, null, 2),
      },
    };
  } else {
    try {
      const existingPkg = JSON.parse(tree['package.json'].file.contents);
      existingPkg.dependencies = { ...(existingPkg.dependencies || {}), ...requiredDeps };
      existingPkg.devDependencies = { ...(existingPkg.devDependencies || {}), ...requiredDevDeps };
      
      if (!existingPkg.scripts) {
        existingPkg.scripts = {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        };
      }
      
      tree['package.json'] = {
        file: {
          contents: JSON.stringify(existingPkg, null, 2),
        },
      };
    } catch (e) {
      console.log('[WebContainer] Failed to parse existing package.json, using default');
      tree['package.json'] = {
        file: {
          contents: JSON.stringify({
            name: 'generated-app',
            version: '0.1.0',
            private: true,
            scripts: {
              dev: 'next dev',
              build: 'next build',
              start: 'next start',
            },
            dependencies: requiredDeps,
            devDependencies: requiredDevDeps,
          }, null, 2),
        },
      };
    }
  }

  // Ensure tailwind.config.js exists
  if (!tree['tailwind.config.js']) {
    tree['tailwind.config.js'] = {
      file: {
        contents: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};`,
      },
    };
  }

  // Ensure postcss.config.js exists
  if (!tree['postcss.config.js']) {
    tree['postcss.config.js'] = {
      file: {
        contents: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
      },
    };
  }

  // Ensure tsconfig.json exists
  if (!tree['tsconfig.json']) {
    tree['tsconfig.json'] = {
      file: {
        contents: JSON.stringify({
          compilerOptions: {
            lib: ['dom', 'dom.iterable', 'esnext'],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: 'esnext',
            moduleResolution: 'bundler',
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: 'preserve',
            incremental: true,
            plugins: [{ name: 'next' }],
            paths: { '@/*': ['./src/*', './*'] },
          },
          include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
          exclude: ['node_modules'],
        }, null, 2),
      },
    };
  }

  // DETECT SRC/APP vs APP and FLATTEN TO ROOT
  // Problem: Agents sometimes mix 'src/' and root paths (e.g. types in src/types, pages in app/).
  // Solution: Flatten everything to root. Move src/* contents to /*.
  // This simplifies structure and ensures Next.js finds 'app/' in root reliably.

  if (tree['src'] && tree['src'].directory) {
    console.log('[WebContainer] Flattening src/ directory to root');
    const srcDir = tree['src'].directory;
    
    // Iterate over all items in src (app, components, types, etc)
    Object.keys(srcDir).forEach((key) => {
      // If root doesn't have this key, create it
      if (!tree[key]) {
        tree[key] = srcDir[key];
      } else {
        // If conflict (e.g. app/ exists in both), merge directories
        if (tree[key].directory && srcDir[key].directory) {
          tree[key].directory = {
            ...tree[key].directory,
            ...srcDir[key].directory
          };
        } else {
          // Overwrite file
          tree[key] = srcDir[key];
        }
      }
    });

    // Remove src after flattening
    delete tree['src'];
  }

  // Set targetAppDir always to root app (since we flattened)
  if (!tree['app']) tree['app'] = { directory: {} };
  const targetAppDir = tree['app'].directory;

  // Ensure globals.css exists with Tailwind directives
  if (!targetAppDir['globals.css']) {
    targetAppDir['globals.css'] = {
      file: {
        contents: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
`,
      },
    };
  }

  // Ensure layout.tsx exists
  if (!targetAppDir['layout.tsx']) {
    targetAppDir['layout.tsx'] = {
      file: {
        contents: `import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Generated App',
  description: 'App built with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`,
      },
    };
  }

  // Ensure page.tsx exists checks for js/jsx too
  const hasIndexPage = targetAppDir['page.tsx'] || targetAppDir['page.js'] || targetAppDir['page.jsx'];
  if (!hasIndexPage) {
    targetAppDir['page.tsx'] = {
      file: {
        contents: `'use client'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome</h1>
        <p className="text-zinc-400">Your app is ready to be built.</p>
        <p className="text-xs text-zinc-600 mt-4">Generated via WebContainer</p>
      </div>
    </main>
  )
}
`,
      },
    };
  }

  // NOTE: ErrorCapture component removed - error suppression is handled via CSS in INJECTED_SCRIPT
  // This avoids modifying the generated React component tree which was causing syntax errors

  // CONFLICT FIX: Remove pages/index.tsx if app/page.tsx exists
  // Next.js can't have both pages router and app router with conflicting index files
  if (targetAppDir['page.tsx']) {
    if (tree['pages']?.directory?.['index.tsx']) {
      delete tree['pages'].directory['index.tsx'];
      console.log('[WebContainer] Removed conflicting pages/index.tsx');
    }
    if (tree['pages']?.directory?.['index.js']) {
      delete tree['pages'].directory['index.js'];
      console.log('[WebContainer] Removed conflicting pages/index.js');
    }
    // Also check src/pages
    if (tree['src']?.directory?.['pages']?.directory?.['index.tsx']) {
      delete tree['src'].directory['pages'].directory['index.tsx'];
      console.log('[WebContainer] Removed conflicting src/pages/index.tsx');
    }
  }

  return tree;
}

export function WebContainerPreview({ files, isLoading = false, onFilesUpdated, onError, onLog }: WebContainerPreviewProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [scale, setScale] = useState(100);
  const [status, setStatus] = useState<StatusPhase>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const webcontainerRef = useRef<WebContainer | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mountedRef = useRef(false);
  const lastFilesHashRef = useRef<string>('');
  const previousFilesRef = useRef<FileNode[]>([]);

  const { width, height } = deviceSizes[device];

  // Compute a simple hash of files to detect changes
  const computeFilesHash = (nodes?: FileNode[]): string => {
    if (!nodes || nodes.length === 0) return '';
    return JSON.stringify(nodes).substring(0, 100);
  };

  // Use a ref to track files to avoid re-running effect on every render
  const filesRef = useRef<FileNode[] | undefined>(files);
  filesRef.current = files;

  // Add terminal output - use functional update to avoid stale closure
  const addTerminalLine = (line: string) => {
    setTerminalOutput(prev => [...prev.slice(-50), line]);
    onLog?.(line);
  };

  // Parse runtime error from terminal output to extract file path and line number
  const parseRuntimeError = (errorText: string): {
    message: string;
    filePath?: string;
    lineNumber?: number;
    columnNumber?: number;
    stackTrace?: string;
  } => {
    const result: ReturnType<typeof parseRuntimeError> = { message: errorText };
    
    // Try to extract file path and line number from patterns like:
    // "at Component (components/TaskSummary.tsx:13:32)"
    // "components/TaskSummary.tsx (13:32)"
    // "./src/components/TaskSummary.tsx:13:32"
    const patterns = [
      /at\s+\w+\s+\(([^)]+):(\d+):(\d+)\)/,  // at Function (file:line:col)
      /([^\s(]+\.tsx?):(\d+):(\d+)/,          // file.tsx:line:col
      /([^\s(]+\.jsx?):(\d+):(\d+)/,          // file.jsx:line:col
    ];

    for (const pattern of patterns) {
      const match = errorText.match(pattern);
      if (match) {
        result.filePath = match[1].startsWith('./') ? match[1].substring(2) : match[1];
        // Ensure path starts with /
        if (result.filePath && !result.filePath.startsWith('/')) {
          result.filePath = '/' + result.filePath;
        }
        result.lineNumber = parseInt(match[2], 10);
        result.columnNumber = parseInt(match[3], 10);
        break;
      }
    }

    // Extract the actual error message (first line usually)
    const lines = errorText.split('\n');
    if (lines.length > 0) {
      // Look for common error patterns
      const errorLine = lines.find(l => 
        l.includes('Error:') || 
        l.includes('TypeError:') || 
        l.includes('ReferenceError:') ||
        l.includes('Unhandled Runtime Error')
      );
      if (errorLine) {
        result.message = errorLine.trim();
      }
    }

    result.stackTrace = errorText;
    return result;
  };

  // Write updated files to running WebContainer (for hot reload)
  useEffect(() => {
    if (!files || files.length === 0) return;
    if (!webcontainerRef.current) return;
    if (!mountedRef.current) return;
    if (status !== 'ready') return;

    // Find files that have changed
    const changedFiles: FileNode[] = [];
    const findChangedFiles = (newNodes: FileNode[], oldNodes: FileNode[]) => {
      newNodes.forEach(newNode => {
        if (newNode.type === 'file') {
          const oldNode = oldNodes.find(n => n.path === newNode.path);
          if (!oldNode || oldNode.content !== newNode.content) {
            changedFiles.push(newNode);
          }
        } else if (newNode.type === 'folder' && newNode.children) {
          const oldNode = oldNodes.find(n => n.path === newNode.path);
          if (oldNode && oldNode.children) {
            findChangedFiles(newNode.children, oldNode.children);
          }
        }
      });
    };

    findChangedFiles(files, previousFilesRef.current);

    if (changedFiles.length > 0) {
      console.log(`[WebContainer] Detected ${changedFiles.length} changed file(s), updating...`);
      
      changedFiles.forEach(async (file) => {
        try {
          const filePath = file.path.startsWith('/') ? file.path.substring(1) : file.path;
          let content = file.content || '';
          
          if (filePath.endsWith('layout.tsx') && (filePath.includes('app/') || filePath.includes('src/app/'))) {
             content = injectScript(content);
          }

          await webcontainerRef.current!.fs.writeFile(filePath, content);
          console.log(`[WebContainer] Updated: ${filePath}`);
        } catch (err) {
          console.log(`[WebContainer] Failed to update ${file.path}:`, err);
        }
      });

      addTerminalLine(`✓ Updated ${changedFiles.length} file(s) - Hot reload triggered`);
      onFilesUpdated?.();
    }

    previousFilesRef.current = files;
  }, [files, status, onFilesUpdated]);

  // Boot WebContainer and setup
  useEffect(() => {
    if (!files || files.length === 0) return;
    if (mountedRef.current) {
      console.log('[WebContainer] Already mounted, skipping initialization');
      return;
    }
    
    mountedRef.current = true;
    console.log('[WebContainer] Starting initialization...');

    const bootAndRun = async () => {
      try {
        setError(null);
        setTerminalOutput([]);
        
        setStatus('booting');
        setStatusMessage('Initializing WebContainer...');
        setTerminalOutput(['🚀 Booting WebContainer...']);

        if (!webcontainerRef.current) {
          console.log('[WebContainer] Starting boot...');
          webcontainerRef.current = await WebContainer.boot({ coep: 'require-corp' });
          console.log('[WebContainer] Boot completed successfully');
          setTerminalOutput(prev => [...prev, '✓ WebContainer booted']);
        } else {
          console.log('[WebContainer] Using existing instance');
        }

        const currentFiles = filesRef.current;
        if (!currentFiles || currentFiles.length === 0) {
          throw new Error('No files to mount');
        }

        console.log('[WebContainer] Starting mount phase...');
        setStatus('mounting');
        setStatusMessage('Mounting project files...');
        setTerminalOutput(prev => [...prev, '📁 Mounting files...']);

        console.log('[WebContainer] Building file tree from', currentFiles.length, 'files');
        let fileTree = buildFileSystemTree(currentFiles);
        console.log('[WebContainer] Raw file tree keys:', Object.keys(fileTree));
        fileTree = ensurePackageJson(fileTree);
        console.log('[WebContainer] Final file tree keys:', Object.keys(fileTree));
        
        await webcontainerRef.current.mount(fileTree);
        console.log('[WebContainer] Mount completed');
        setTerminalOutput(prev => [...prev, `✓ Mounted ${Object.keys(fileTree).length} items`]);
        
        previousFilesRef.current = currentFiles;

        setStatus('installing');
        setStatusMessage('Installing dependencies (this may take a moment)...');
        setTerminalOutput(prev => [...prev, '📦 Running npm install...']);

        const installProcess = await webcontainerRef.current.spawn('npm', ['install']);
        
        installProcess.output.pipeTo(new WritableStream({
          write(data) {
            setTerminalOutput(prev => [...prev.slice(-50), data]);
          },
        }));

        const installExitCode = await installProcess.exit;
        
        if (installExitCode !== 0) {
          throw new Error(`npm install failed with exit code ${installExitCode}`);
        }
        setTerminalOutput(prev => [...prev, '✓ Dependencies installed']);

        setStatus('starting');
        setStatusMessage('Starting Next.js dev server...');
        setTerminalOutput(prev => [...prev, '🔧 Starting dev server...']);

        const devProcess = await webcontainerRef.current.spawn('npm', ['run', 'dev']);
        
        devProcess.output.pipeTo(new WritableStream({
          write(data) {
            setTerminalOutput(prev => [...prev.slice(-50), data]);
          },
        }));

        webcontainerRef.current.on('server-ready', (port, url) => {
          console.log('[WebContainer] Server ready at', url);
          setStatus('ready');
          setStatusMessage('');
          setPreviewUrl(url);
          setTerminalOutput(prev => [...prev, `✓ Server ready at ${url}`]);
        });

        webcontainerRef.current.on('error', (err) => {
          const errorMessage = err.message || '';
          
          // Filter out non-actionable errors
          const isIgnorable = 
            errorMessage.toLowerCase().includes('process aborted') ||
            errorMessage.toLowerCase().includes('aborted') ||
            errorMessage.toLowerCase().includes('sigterm') ||
            errorMessage.toLowerCase().includes('sigkill') ||
            errorMessage.toLowerCase().includes('cancelled');
          
          if (isIgnorable) {
            console.log('[WebContainer] Container error (safe to ignore):', errorMessage);
            return; // Don't show or propagate this error
          }
          
          console.log('[WebContainer] Container error:', err);
          setError(err.message);
          setStatus('error');
          setTerminalOutput(prev => [...prev, `❌ Error: ${err.message}`]);
          onError?.({ message: err.message, stackTrace: (err as any).stack });
        });

      } catch (err: any) {
        const errorMessage = err.message || 'Failed to start preview';
        
        // Ignore non-actionable errors (happens during tab switches, etc.)
        const isIgnorable = 
          errorMessage.toLowerCase().includes('process aborted') ||
          errorMessage.toLowerCase().includes('aborted') ||
          errorMessage.toLowerCase().includes('cancelled');
        
        if (isIgnorable) {
          console.log('[WebContainer] Initialization aborted (safe to ignore):', errorMessage);
          mountedRef.current = false;
          return;
        }
        
        console.log('[WebContainer] Error during initialization:', err);
        setError(errorMessage);
        setStatus('error');
        setTerminalOutput(prev => [...prev, `❌ Error: ${errorMessage}`]);
        onError?.({ message: errorMessage });
        mountedRef.current = false;
      }
    };

    bootAndRun();
  }, [files]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[WebContainer] Component unmounting, attempting cleanup...');
      if (webcontainerRef.current) {
        try {
          console.log('[WebContainer] Calling teardown...');
          webcontainerRef.current.teardown();
          console.log('[WebContainer] Teardown completed');
        } catch (err: any) {
          console.warn('[WebContainer] Teardown error (safe to ignore):', err.message);
        } finally {
          webcontainerRef.current = null;
          mountedRef.current = false;
        }
      } else {
        console.log('[WebContainer] No instance to teardown');
      }
    };
  }, []);

  // Listen for runtime errors from the iframe
  useEffect(() => {
    // List of error patterns to ignore - hide ALL Next.js/development errors
    const IGNORED_ERROR_PATTERNS = [
      'Process aborted',
      'process aborted',
      'SIGTERM',
      'SIGKILL',
      'Cancelled',
      'Aborted',
      'hydration',
      'Hydration',
      'There was an error while hydrating',
      'did not match',
      'Text content does not match',
      'Server HTML',
      'client HTML',
      'Module not found',
      'Cannot find module',
      '@prisma/client',
      'PrismaClient',
      'export',
      'was not found',
      'NEXT_NOT_FOUND',
      'NEXT_REDIRECT',
      'ChunkLoadError',
      'Loading chunk',
      'Failed to load',
      'Minified React error',
      'useLayoutEffect',
      'Warning:',
      'ReactDOM.hydrate',
      'Expected server HTML',
      'TurboPack',
      'Hot Module Replacement',
      'Fast Refresh',
      '[Fast Refresh]',
      'attempted import',
      'Error:',
      'Unhandled Runtime Error',
      'TypeError',
      'ReferenceError',
      'SyntaxError',
      'Cannot read properties',
      'undefined is not',
      'null is not',
      'is not a function',
      'is not defined'
    ];

    const shouldIgnoreError = (message: string): boolean => {
      if (!message) return true;
      return IGNORED_ERROR_PATTERNS.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      );
    };

    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from the preview iframe, not from parent or other sources
      // The iframe's origin will be the WebContainer URL (not the same as window.origin)
      if (event.source === window) {
        // Ignore messages from the same window (parent platform)
        return;
      }
      
      // Also ignore if no iframe ref or if message doesn't come from our iframe
      if (iframeRef.current && event.source !== iframeRef.current.contentWindow) {
        return;
      }
      
      // Handle error messages from the preview iframe
      if (event.data?.type === 'error' || event.data?.type === 'unhandledrejection') {
        const errorData = event.data;
        const errorMessage = errorData.message || errorData.error || 'Unknown error';
        
        // Skip non-actionable errors
        if (shouldIgnoreError(errorMessage)) {
          console.log('[WebContainer] Ignoring non-actionable error:', errorMessage);
          return;
        }
        
        const parsedError = parseRuntimeError(errorMessage);
        
        // Override with more specific info if available
        if (errorData.filename) {
          parsedError.filePath = errorData.filename.startsWith('/') 
            ? errorData.filename 
            : '/' + errorData.filename;
        }
        if (errorData.lineno) parsedError.lineNumber = errorData.lineno;
        if (errorData.colno) parsedError.columnNumber = errorData.colno;
        if (errorData.stack) parsedError.stackTrace = errorData.stack;
        
        console.log('[WebContainer] Received error from iframe:', parsedError);
        onError?.(parsedError);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onError, parseRuntimeError]);

  const hasFiles = files && files.length > 0;

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Toolbar */}
      <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900">
        <div className="flex items-center gap-2">
          {/* Device Selector */}
          <div className="flex items-center bg-zinc-800 rounded-lg p-1">
            {Object.entries(deviceSizes).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setDevice(key as DeviceType)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  device === key
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {key === 'desktop' && '🖥️'}
                {key === 'tablet' && '📱'}
                {key === 'mobile' && '📲'}
              </button>
            ))}
          </div>

          {/* Scale */}
          <select
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded-md text-zinc-300 focus:outline-none"
          >
            <option value={50}>50%</option>
            <option value={75}>75%</option>
            <option value={100}>100%</option>
          </select>

          {/* Status indicator */}
          {status !== 'idle' && status !== 'ready' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-400"></div>
              <span>{statusMessage}</span>
            </div>
          )}

          {status === 'ready' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>Live</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
              <span>⚠️ {error}</span>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              iframeRef.current?.contentWindow?.postMessage({ action: 'back' }, '*');
            }}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
            title="Go Back"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => {
              iframeRef.current?.contentWindow?.postMessage({ action: 'forward' }, '*');
            }}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
            title="Go Forward"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => {
              iframeRef.current?.contentWindow?.postMessage({ action: 'reload' }, '*');
            }}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
            title="Reload Preview"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357-2m0 0H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden bg-[#1a1a1a] flex flex-col items-center justify-center p-0 relative">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-zinc-400 text-sm">Building preview...</p>
          </div>
        ) : hasFiles && previewUrl ? (
          <div
            className={`bg-white shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
              device !== 'desktop' ? 'border-8 border-zinc-800 rounded-[24px]' : 'border-0 w-full h-full'
            }`}
            style={{
              width: device === 'desktop' ? '100%' : width,
              height: device === 'desktop' ? '100%' : height,
              transform: `scale(${scale / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="w-full h-full border-0"
              title="Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </div>
        ) : hasFiles && status !== 'idle' && status !== 'ready' ? (
          <div className="text-center max-w-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-white mb-3">{statusMessage}</h3>
            
            {/* Terminal output */}
            <div className="mt-4 bg-zinc-900 rounded-lg p-3 text-left max-h-48 overflow-y-auto">
              <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap">
                {terminalOutput.slice(-10).join('\n') || 'Starting...'}
              </pre>
            </div>
          </div>
        ) : hasFiles && status === 'error' ? (
          <div className="text-center max-w-lg">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Preview Error</h3>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            
            {/* Terminal output */}
            <div className="mt-4 bg-zinc-900 rounded-lg p-3 text-left max-h-48 overflow-y-auto">
              <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap">
                {terminalOutput.slice(-15).join('\n')}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-md">
            <h3 className="text-xl font-bold text-white mb-3">Live Preview</h3>
            <p className="text-zinc-400">Generate an app to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
