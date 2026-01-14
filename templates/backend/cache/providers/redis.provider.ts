import { createClient, RedisClientType } from 'redis';
import { CacheProvider, CacheConfig } from './cache.interface';
import { LoggerFactory } from '../../logger';

export class RedisProvider implements CacheProvider {
  private client: RedisClientType | null = null;
  private defaultTtl: number;
  private keyPrefix: string;

  constructor(private config: CacheConfig) {
    this.defaultTtl = config.ttl || 3600; // Default 1 hour
    this.keyPrefix = config.keyPrefix || '';
  }

  private getFullKey(key: string): string {
    return this.keyPrefix ? `${this.keyPrefix}:${key}` : key;
  }

  private logger = LoggerFactory.getLogger('RedisProvider');

  async connect(): Promise<void> {
    try {
      this.client = createClient({
        url: `redis://${this.config.password ? `:${this.config.password}@` : ''}${this.config.host}:${this.config.port}`,
        database: this.config.database || 0,
        socket: {
          tls: typeof this.config.ssl === 'boolean' ? this.config.ssl : true,
          rejectUnauthorized: typeof this.config.ssl === 'object' ? this.config.ssl.rejectUnauthorized : undefined
        }
      });

      await this.client.connect();
      this.logger.debug('Successfully connected to Redis');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
   
    try {
      if (this.client) {
        await this.client.quit();
        this.client = null;
        this.logger.debug('Successfully disconnected from Redis');
      }
    } catch (error) {
      this.logger.error('Error disconnecting from Redis:', error);
      throw error;
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      if (!this.client) return false;
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) throw new Error('Redis not connected');
    try {
      const value = await this.client.get(this.getFullKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!this.client) throw new Error('Redis not connected');
    try {
      const fullKey = this.getFullKey(key);
      const serializedValue = JSON.stringify(value);
      const expiry = ttl || this.defaultTtl;

      if (expiry > 0) {
        await this.client.setEx(fullKey, expiry, serializedValue);
      } else {
        await this.client.set(fullKey, serializedValue);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.client) throw new Error('Redis not connected');
    try {
      const result = await this.client.del(this.getFullKey(key));
      return result > 0;
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) throw new Error('Redis not connected');
    try {
      const result = await this.client.exists(this.getFullKey(key));
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}:`, error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    
    if (!this.client) throw new Error('Redis not connected');
    try {
      if (this.keyPrefix) {
        const keys = await this.keys('*');
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      } else {
        await this.client.flushDb();
      }
      return true;
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
      return false;
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.client) throw new Error('Redis not connected');
    try {
      const fullKeys = keys.map(key => this.getFullKey(key));
      const values = await this.client.mGet(fullKeys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      this.logger.error('Error getting multiple keys:', error);
      return keys.map(() => null);
    }
  }

  async mset<T>(keyValues: Record<string, T>, ttl?: number): Promise<boolean> {
    if (!this.client) throw new Error('Redis not connected');
    try {
      const pipeline = this.client.multi();
      const expiry = ttl || this.defaultTtl;

      Object.entries(keyValues).forEach(([key, value]) => {
        const fullKey = this.getFullKey(key);
        const serializedValue = JSON.stringify(value);
        if (expiry > 0) {
          pipeline.setEx(fullKey, expiry, serializedValue);
        } else {
          pipeline.set(fullKey, serializedValue);
        }
      });

      await pipeline.exec();
      return true;
    } catch (error) {
      this.logger.error('Error setting multiple keys:', error);
      return false;
    }
  }

  async mdelete(keys: string[]): Promise<boolean> {
    if (!this.client) throw new Error('Redis not connected');
    try {
      const fullKeys = keys.map(key => this.getFullKey(key));
      const result = await this.client.del(fullKeys);
      return result > 0;
    } catch (error) {
      this.logger.error('Error deleting multiple keys:', error);
      return false;
    }
  }

  async increment(key: string, value: number = 1): Promise<number> {
    if (!this.client) throw new Error('Redis not connected');
    try {
      return await this.client.incrBy(this.getFullKey(key), value);
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}:`, error);
      throw error;
    }
  }

  async decrement(key: string, value: number = 1): Promise<number> {
    if (!this.client) throw new Error('Redis not connected');
    try {
      return await this.client.decrBy(this.getFullKey(key), value);
    } catch (error) {
      this.logger.error(`Error decrementing key ${key}:`, error);
      throw error;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.client) throw new Error('Redis not connected');
    try {
      return await this.client.expire(this.getFullKey(key), ttl);
    } catch (error) {
      this.logger.error(`Error setting expiry for key ${key}:`, error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.client) throw new Error('Redis not connected');
    try {
      return await this.client.ttl(this.getFullKey(key));
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}:`, error);
      return -1;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.client) throw new Error('Redis not connected');
    try {
      const fullPattern = this.getFullKey(pattern);
      const keys = await this.client.keys(fullPattern);
      return this.keyPrefix
        ? keys.map(key => key.slice(this.keyPrefix.length + 1))
        : keys;
    } catch (error) {
      this.logger.error(`Error getting keys with pattern ${pattern}:`, error);
      return [];
    }
  }

  async deletePattern(pattern: string): Promise<boolean> {
    if (!this.client) throw new Error('Redis not connected');
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.mdelete(keys);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error deleting keys with pattern ${pattern}:`, error);
      return false;
    }
  }
} 