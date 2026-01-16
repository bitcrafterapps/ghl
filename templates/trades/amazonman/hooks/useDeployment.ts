'use client';

import { useState, useCallback } from 'react';
import { getApiUrl } from '@/lib/api';

const API_URL = getApiUrl();

type DeploymentProvider = 'vercel' | 'netlify';

interface DeploymentResult {
  url: string;
  provider: DeploymentProvider;
  deploymentId: string;
}

export function useDeployment(projectId: string) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);

  const getToken = () => {
    const storage = localStorage.getItem('auth-storage');
    if (storage) {
      const parsed = JSON.parse(storage);
      return parsed.state?.token || null;
    }
    return localStorage.getItem('token');
  };

  const deploy = useCallback(async (generationId: string, provider: DeploymentProvider = 'vercel') => {
    setIsDeploying(true);
    setDeploymentError(null);
    setDeploymentUrl(null);

    try {
      const token = getToken();
      
      const response = await fetch(
        `${API_URL}/api/v1/deployments/projects/${projectId}/deploy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ generationId, provider }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Deployment failed');
      }

      const result: DeploymentResult = await response.json();
      setDeploymentUrl(result.url);
      
      return result;
    } catch (err: any) {
      setDeploymentError(err.message);
      throw err;
    } finally {
      setIsDeploying(false);
    }
  }, [projectId]);

  const reset = useCallback(() => {
    setIsDeploying(false);
    setDeploymentUrl(null);
    setDeploymentError(null);
  }, []);

  return {
    deploy,
    isDeploying,
    deploymentUrl,
    deploymentError,
    reset,
  };
}
