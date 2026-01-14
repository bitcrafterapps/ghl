import { CacheProvider } from './providers/cache.interface';
import { CacheFactory, CacheFactoryConfig } from './providers/cache.factory';
import { LoggerFactory } from '../logger';

const logger = LoggerFactory.getLogger('Cache');

let provider: CacheProvider | null = null;

// Parse Redis URL (used by Railway and other cloud providers)
function parseRedisUrl(url: string): { host: string; port: number; password?: string; database?: number } {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '6379', 10),
      password: parsed.password || undefined,
      database: parsed.pathname ? parseInt(parsed.pathname.slice(1) || '0', 10) : 0
    };
  } catch (error) {
    logger.error('Failed to parse REDIS_URL:', error);
    return { host: 'localhost', port: 6379 };
  }
}

// Initialize cache connection based on environment and configuration
const createCacheConnection = () => {
  if (provider) return provider;

  // Support REDIS_URL format (Railway, Heroku, etc.) or individual env vars
  const redisUrl = process.env.REDIS_URL;
  const redisConfig = redisUrl ? parseRedisUrl(redisUrl) : null;

  const config: CacheFactoryConfig = {
    type: (process.env.CACHE_TYPE || 'redis') as CacheFactoryConfig['type'],
    host: redisConfig?.host || process.env.CACHE_HOST || 'localhost',
    port: redisConfig?.port || parseInt(process.env.CACHE_PORT || '6379', 10),
    password: redisConfig?.password || process.env.CACHE_PASSWORD,
    database: redisConfig?.database || parseInt(process.env.CACHE_DATABASE || '0', 10),
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    keyPrefix: process.env.CACHE_KEY_PREFIX,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: true,
      requestCert: true
    } : false
  };

  provider = CacheFactory.createProvider(config);
  return provider;
};

export const cache = createCacheConnection();

// Health check function
export async function checkCacheConnection() {
  try {
    logger.debug('Starting cache connection check');
    if (!provider) {
      logger.error('No cache provider initialized');
      return false;
    }
    return await provider.isConnected();
  } catch (error) {
    logger.error('Cache connection failed:', error);
    return false;
  }
}

// Initialize cache
export const initializeCache = async () => {
  try {
    logger.debug('Initializing cache connection');
    if (!provider) {
      provider = createCacheConnection();
    }
    await provider.connect();
    logger.debug('Cache connection initialized');
    return true;
  } catch (error) {
    logger.error('Cache initialization failed:', error);
    return false;
  }
};

// Cleanup function for graceful shutdown
export const closeCache = async () => {
  try {
    if (provider) {
      await provider.disconnect();
      provider = null;
      logger.debug('Cache connection closed');
    }
  } catch (error) {
    logger.error('Error closing cache connection:', error);
    throw error;
  }
}; 