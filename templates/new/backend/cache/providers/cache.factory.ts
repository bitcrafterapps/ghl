import { CacheProvider, CacheConfig } from './cache.interface';
import { RedisProvider } from './redis.provider';
import { LoggerFactory } from '../../logger';

export type CacheType = 'redis' | 'memory';

export interface CacheFactoryConfig extends CacheConfig {
  type: CacheType;
}

export class CacheFactory {
  private static logger = LoggerFactory.getLogger('CacheFactory');

  static createProvider(config: CacheFactoryConfig): CacheProvider {
    CacheFactory.logger.debug(`Creating cache provider for type: ${config.type}`);
    
    switch (config.type) {
      case 'redis':
        return new RedisProvider(config);
      case 'memory':
        throw new Error('Memory cache provider not implemented yet');
      default:
        throw new Error(`Unknown cache type: ${config.type}`);
    }
  }
} 