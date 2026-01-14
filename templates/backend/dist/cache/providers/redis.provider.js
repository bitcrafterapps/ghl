"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisProvider = void 0;
const redis_1 = require("redis");
const logger_1 = require("../../logger");
class RedisProvider {
    constructor(config) {
        this.config = config;
        this.client = null;
        this.logger = logger_1.LoggerFactory.getLogger('RedisProvider');
        this.defaultTtl = config.ttl || 3600; // Default 1 hour
        this.keyPrefix = config.keyPrefix || '';
    }
    getFullKey(key) {
        return this.keyPrefix ? `${this.keyPrefix}:${key}` : key;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.client = (0, redis_1.createClient)({
                    url: `redis://${this.config.password ? `:${this.config.password}@` : ''}${this.config.host}:${this.config.port}`,
                    database: this.config.database || 0,
                    socket: {
                        tls: typeof this.config.ssl === 'boolean' ? this.config.ssl : true,
                        rejectUnauthorized: typeof this.config.ssl === 'object' ? this.config.ssl.rejectUnauthorized : undefined
                    }
                });
                yield this.client.connect();
                this.logger.debug('Successfully connected to Redis');
            }
            catch (error) {
                this.logger.error('Failed to connect to Redis:', error);
                throw error;
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.client) {
                    yield this.client.quit();
                    this.client = null;
                    this.logger.debug('Successfully disconnected from Redis');
                }
            }
            catch (error) {
                this.logger.error('Error disconnecting from Redis:', error);
                throw error;
            }
        });
    }
    isConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client)
                    return false;
                yield this.client.ping();
                return true;
            }
            catch (_a) {
                return false;
            }
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client)
                throw new Error('Redis not connected');
            try {
                const value = yield this.client.get(this.getFullKey(key));
                return value ? JSON.parse(value) : null;
            }
            catch (error) {
                this.logger.error(`Error getting key ${key}:`, error);
                return null;
            }
        });
    }
    set(key, value, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client)
                throw new Error('Redis not connected');
            try {
                const fullKey = this.getFullKey(key);
                const serializedValue = JSON.stringify(value);
                const expiry = ttl || this.defaultTtl;
                if (expiry > 0) {
                    yield this.client.setEx(fullKey, expiry, serializedValue);
                }
                else {
                    yield this.client.set(fullKey, serializedValue);
                }
                return true;
            }
            catch (error) {
                this.logger.error(`Error setting key ${key}:`, error);
                return false;
            }
        });
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client)
                throw new Error('Redis not connected');
            try {
                const result = yield this.client.del(this.getFullKey(key));
                return result > 0;
            }
            catch (error) {
                this.logger.error(`Error deleting key ${key}:`, error);
                return false;
            }
        });
    }
    exists(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client)
                throw new Error('Redis not connected');
            try {
                const result = yield this.client.exists(this.getFullKey(key));
                return result === 1;
            }
            catch (error) {
                this.logger.error(`Error checking existence of key ${key}:`, error);
                return false;
            }
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client)
                throw new Error('Redis not connected');
            try {
                if (this.keyPrefix) {
                    const keys = yield this.keys('*');
                    if (keys.length > 0) {
                        yield this.client.del(keys);
                    }
                }
                else {
                    yield this.client.flushDb();
                }
                return true;
            }
            catch (error) {
                this.logger.error('Error clearing cache:', error);
                return false;
            }
        });
    }
    mget(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client)
                throw new Error('Redis not connected');
            try {
                const fullKeys = keys.map(key => this.getFullKey(key));
                const values = yield this.client.mGet(fullKeys);
                return values.map(value => value ? JSON.parse(value) : null);
            }
            catch (error) {
                this.logger.error('Error getting multiple keys:', error);
                return keys.map(() => null);
            }
        });
    }
    mset(keyValues, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client)
                throw new Error('Redis not connected');
            try {
                const pipeline = this.client.multi();
                const expiry = ttl || this.defaultTtl;
                Object.entries(keyValues).forEach(([key, value]) => {
                    const fullKey = this.getFullKey(key);
                    const serializedValue = JSON.stringify(value);
                    if (expiry > 0) {
                        pipeline.setEx(fullKey, expiry, serializedValue);
                    }
                    else {
                        pipeline.set(fullKey, serializedValue);
                    }
                });
                yield pipeline.exec();
                return true;
            }
            catch (error) {
                this.logger.error('Error setting multiple keys:', error);
                return false;
            }
        });
    }
    mdelete(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client)
                throw new Error('Redis not connected');
            try {
                const fullKeys = keys.map(key => this.getFullKey(key));
                const result = yield this.client.del(fullKeys);
                return result > 0;
            }
            catch (error) {
                this.logger.error('Error deleting multiple keys:', error);
                return false;
            }
        });
    }
    increment(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, value = 1) {
            if (!this.client)
                throw new Error('Redis not connected');
            try {
                return yield this.client.incrBy(this.getFullKey(key), value);
            }
            catch (error) {
                this.logger.error(`Error incrementing key ${key}:`, error);
                throw error;
            }
        });
    }
    decrement(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, value = 1) {
            if (!this.client)
                throw new Error('Redis not connected');
            try {
                return yield this.client.decrBy(this.getFullKey(key), value);
            }
            catch (error) {
                this.logger.error(`Error decrementing key ${key}:`, error);
                throw error;
            }
        });
    }
    expire(key, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client)
                throw new Error('Redis not connected');
            try {
                return yield this.client.expire(this.getFullKey(key), ttl);
            }
            catch (error) {
                this.logger.error(`Error setting expiry for key ${key}:`, error);
                return false;
            }
        });
    }
    ttl(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client)
                throw new Error('Redis not connected');
            try {
                return yield this.client.ttl(this.getFullKey(key));
            }
            catch (error) {
                this.logger.error(`Error getting TTL for key ${key}:`, error);
                return -1;
            }
        });
    }
    keys(pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client)
                throw new Error('Redis not connected');
            try {
                const fullPattern = this.getFullKey(pattern);
                const keys = yield this.client.keys(fullPattern);
                return this.keyPrefix
                    ? keys.map(key => key.slice(this.keyPrefix.length + 1))
                    : keys;
            }
            catch (error) {
                this.logger.error(`Error getting keys with pattern ${pattern}:`, error);
                return [];
            }
        });
    }
    deletePattern(pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client)
                throw new Error('Redis not connected');
            try {
                const keys = yield this.keys(pattern);
                if (keys.length > 0) {
                    yield this.mdelete(keys);
                }
                return true;
            }
            catch (error) {
                this.logger.error(`Error deleting keys with pattern ${pattern}:`, error);
                return false;
            }
        });
    }
}
exports.RedisProvider = RedisProvider;
