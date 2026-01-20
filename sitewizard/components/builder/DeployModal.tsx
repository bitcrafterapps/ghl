'use client';

import { useState } from 'react';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  generationId?: string;
  onDeploy: (provider: string) => void;
  isDeploying: boolean;
  deploymentUrl?: string | null;
  deploymentError?: string | null;
}

type Provider = 'vercel' | 'netlify' | 'railway';

const providers: Array<{
  id: Provider;
  name: string;
  logo: string;
  description: string;
  configured: boolean;
}> = [
  {
    id: 'vercel',
    name: 'Vercel',
    logo: '▲',
    description: 'Best for Next.js apps. Fast edge network.',
    configured: true,
  },
  {
    id: 'netlify',
    name: 'Netlify',
    logo: '◆',
    description: 'Great for static sites and serverless.',
    configured: true,
  },
  {
    id: 'railway',
    name: 'Railway',
    logo: '🚂',
    description: 'Full-stack apps with databases.',
    configured: false,
  },
];

export function DeployModal({
  isOpen,
  onClose,
  projectId,
  generationId,
  onDeploy,
  isDeploying,
  deploymentUrl,
  deploymentError,
}: DeployModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<Provider>('vercel');

  if (!isOpen) return null;

  const handleDeploy = () => {
    if (!generationId) return;
    onDeploy(selectedProvider);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Deploy Your App</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Choose a platform to deploy your generated app
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {deploymentUrl ? (
            // Success State
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Deployed Successfully!</h3>
              <a
                href={deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline break-all"
              >
                {deploymentUrl}
              </a>
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() => window.open(deploymentUrl, '_blank')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
                >
                  Visit Site
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : deploymentError ? (
            // Error State
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Deployment Failed</h3>
              <p className="text-zinc-400 text-sm mb-4">{deploymentError}</p>
              <button
                onClick={handleDeploy}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : isDeploying ? (
            // Loading State
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-white mb-2">Deploying...</h3>
              <p className="text-zinc-400 text-sm">
                This usually takes several minutes
              </p>
              <div className="mt-4 bg-zinc-800 rounded-lg p-4 text-left max-h-32 overflow-y-auto">
                <p className="text-xs text-zinc-400 font-mono">
                  <span className="text-green-400">→</span> Building application...<br />
                  <span className="text-green-400">→</span> Optimizing assets...<br />
                  <span className="text-yellow-400">⏳</span> Deploying to edge network...
                </p>
              </div>
            </div>
          ) : (
            // Selection State
            <>
              {!generationId && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ Please generate code first before deploying.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider.id)}
                    disabled={!provider.configured}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                      selectedProvider === provider.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                    } ${!provider.configured ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center text-2xl">
                      {provider.logo}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{provider.name}</span>
                        {!provider.configured && (
                          <span className="text-xs px-2 py-0.5 bg-zinc-600 text-zinc-300 rounded">
                            Not configured
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400">{provider.description}</p>
                    </div>
                    {selectedProvider === provider.id && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeploy}
                  disabled={!generationId}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-lg font-semibold hover:from-blue-500 hover:to-sky-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Deploy to {providers.find(p => p.id === selectedProvider)?.name}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
