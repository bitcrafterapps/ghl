'use client';

import { useState } from 'react';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

import { SandpackProvider, SandpackLayout, SandpackPreview } from '@codesandbox/sandpack-react';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  language?: string;
}

const deviceSizes: Record<DeviceType, { width: string; height: string; label: string }> = {
  desktop: { width: '100%', height: '100%', label: 'Desktop' },
  tablet: { width: '768px', height: '1024px', label: 'Tablet' },
  mobile: { width: '375px', height: '667px', label: 'Mobile' },
};

interface LivePreviewProps {
  files?: FileNode[];
  previewUrl?: string; // Keep for backward compat or manual deployments
  isLoading?: boolean;
}

export function LivePreview({ files, previewUrl, isLoading = false }: LivePreviewProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [scale, setScale] = useState(100);

  const { width, height } = deviceSizes[device];

  // Transform FileNode[] to Sandpack files map
  const getSandpackFiles = (nodes?: FileNode[]) => {
    const sandpackFiles: Record<string, string> = {};
    
    const traverse = (nodeList: FileNode[]) => {
      nodeList.forEach(node => {
        if (node.type === 'file' && node.content) {
          // Remove leading slash for Sandpack
          const path = node.path.startsWith('/') ? node.path.substring(1) : node.path;
          
          // Patch: Remove "import 'tailwindcss/tailwind.css'" if present, as it causes resolve errors in Sandpack
          let cleanedContent = node.content;
          cleanedContent = cleanedContent.replace(/import\s+['"]tailwindcss\/tailwind\.css['"];?/g, '');
          
          // Prevent leading slash in Sandpack keys they should be relative (e.g. "app/page.tsx")
          // If the node path has a leading slash, we strip it.
          const relativePath = node.path.startsWith('/') ? node.path.substring(1) : node.path;
          
          sandpackFiles[relativePath] = cleanedContent;
        }
        if (node.children) {
          traverse(node.children);
        }
      });
    };

    if (nodes) traverse(nodes);
    
    // With Next.js template, we rely on Next.js file-system routing (app/page.tsx or pages/index.tsx).
    // We do NOT inject a custom index.tsx bootstrapper.

    return sandpackFiles;
  };

  const sandpackFiles = getSandpackFiles(files);
  const hasFiles = Object.keys(sandpackFiles).length > 0;

  // Debugging logs to trace file generation and paths
  console.log('LivePreview files prop:', files);
  console.log('Generated sandpackFiles keys:', Object.keys(sandpackFiles));

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
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden bg-[#1a1a1a] flex flex-col items-center justify-center p-0 relative">
        {isLoading ? (
          <div className="text-center">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
             <p className="text-zinc-400 text-sm">Building preview...</p>
          </div>
        ) : hasFiles ? (
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
              <SandpackProvider 
                template="nextjs"
                theme="dark"
                files={{
                  ...sandpackFiles
                }}
                options={{
                  initMode: 'user-visible',
                  initModeObserverOptions: { rootMargin: '1400px 0px' },
                  externalResources: ['https://cdn.tailwindcss.com']
                }}
                customSetup={{
                  dependencies: {
                    "lucide-react": "latest",
                    "react-router-dom": "latest",
                    "clsx": "latest",
                    "tailwind-merge": "latest",
                    "@tanstack/react-query": "latest",
                    "axios": "latest",
                    "date-fns": "latest",
                    "class-variance-authority": "latest",
                    "react-hook-form": "latest",
                    "zod": "latest",
                    "@hookform/resolvers": "latest",
                    "framer-motion": "latest",
                    "recharts": "latest",
                    "tailwindcss": "latest"
                  }
                }}
              >
                <SandpackLayout style={{ height: '100%', width: '100%', border: 'none', borderRadius: 0, display: 'flex', flexDirection: 'column' }}>
                  <SandpackPreview 
                    showNavigator={true}
                    showOpenInCodeSandbox={false}
                    style={{ height: '100%', width: '100%', flex: 1 }}
                  />
                </SandpackLayout>
              </SandpackProvider>
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
