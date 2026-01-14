export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;
  ttl?: number; // Default time-to-live in seconds
  keyPrefix?: string;
  ssl?: boolean | {
    rejectUnauthorized: boolean;
    requestCert: boolean;
  };
  options?: Record<string, any>;
}

export interface CacheProvider {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;

  // Basic operations
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<boolean>;

  // Batch operations
  mget<T>(keys: string[]): Promise<(T | null)[]>;
  mset<T>(keyValues: Record<string, T>, ttl?: number): Promise<boolean>;
  mdelete(keys: string[]): Promise<boolean>;

  // Utility operations
  increment(key: string, value?: number): Promise<number>;
  decrement(key: string, value?: number): Promise<number>;
  expire(key: string, ttl: number): Promise<boolean>;
  ttl(key: string): Promise<number>;

  // Pattern operations
  keys(pattern: string): Promise<string[]>;
  deletePattern(pattern: string): Promise<boolean>;
} 