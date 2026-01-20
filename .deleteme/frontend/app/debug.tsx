'use client';

import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api';

export default function DebugPage() {
  const [apiUrl, setApiUrl] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    setApiUrl(getApiUrl());
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken.substring(0, 15) + '...');
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">API URL</h2>
          <pre className="bg-gray-100 p-2 rounded">{apiUrl}</pre>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Token (truncated)</h2>
          <pre className="bg-gray-100 p-2 rounded">{token || 'No token found'}</pre>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Environment Variables</h2>
          <pre className="bg-gray-100 p-2 rounded">
            NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL || 'Not set'}
          </pre>
        </div>
      </div>
    </div>
  );
} 