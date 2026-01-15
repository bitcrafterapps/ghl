'use client';

import { clsx } from 'clsx';


interface PrdViewerProps {
  content: any;
  className?: string;
  projectName?: string;
}

export function PrdViewer({ content, className, projectName }: PrdViewerProps) {
  if (!content) return null;

  return (
    <div className={clsx("w-full max-w-4xl mx-auto p-8", className)}>
      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-8 shadow-xl">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-white mb-2">{content.overview?.name || projectName || 'Product Spec'}</h1>
          <p className="text-zinc-400 text-lg mb-8">{content.overview?.description}</p>
          
          {/* Features */}
          {Array.isArray(content.features) && content.features.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 border-b border-zinc-700 pb-2">Key Features</h2>
              <div className="grid gap-4">
                {content.features.map((feature: any, i: number) => (
                  <div key={i} className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50">
                    <h3 className="font-medium text-blue-300 mb-1">{feature.name}</h3>
                    <p className="text-sm text-zinc-400">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target Users */}
          {Array.isArray(content.targetUsers) && content.targetUsers.length > 0 && (
            <div className="mb-8">
               <h2 className="text-xl font-semibold text-white mb-4 border-b border-zinc-700 pb-2">Target Users</h2>
               <ul className="list-disc list-inside text-zinc-300 space-y-1">
                  {content.targetUsers.map((user: any, i: number) => (
                    <li key={i}><span className="font-medium text-white">{user.persona}</span>: {user.needs ? (Array.isArray(user.needs) ? user.needs.join(', ') : user.needs) : ''}</li>
                  ))}
               </ul>
            </div>
          )}
          
          {/* Data Model */}
           {Array.isArray(content.dataModel) && content.dataModel.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 border-b border-zinc-700 pb-2">Data Model</h2>
              <div className="grid gap-4 md:grid-cols-2">
                 {content.dataModel.map((entity: any, i: number) => (
                    <div key={i} className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50">
                       <h3 className="font-medium text-emerald-300 mb-2">{entity.entity}</h3>
                       <ul className="text-sm text-zinc-400 space-y-1">
                          {Array.isArray(entity.attributes) && entity.attributes.map((attr: any, j: number) => (
                             <li key={j} className="flex justify-between">
                                <span>{attr.name}</span>
                                <span className="text-zinc-600">{attr.type}</span>
                             </li>
                          ))}
                       </ul>
                    </div>
                 ))}
              </div>
            </div>
          )}
          
          {/* JSON Dump for debugging/other fields */}
          <details className="mt-8 pt-8 border-t border-zinc-700">
            <summary className="cursor-pointer text-zinc-500 hover:text-zinc-300">View Raw JSON</summary>
            <pre className="mt-4 bg-zinc-950 p-4 rounded-lg overflow-x-auto text-xs text-zinc-500">
              {JSON.stringify(content, null, 2)}
            </pre>
          </details>
       </div>
    </div>
  </div>
  );
}
