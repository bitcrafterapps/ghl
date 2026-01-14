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
exports.closeCache = exports.initializeCache = exports.cache = void 0;
exports.checkCacheConnection = checkCacheConnection;
const cache_factory_1 = require("./providers/cache.factory");
const logger_1 = require("../logger");
const logger = logger_1.LoggerFactory.getLogger('Cache');
let provider = null;
// Parse Redis URL (used by Railway and other cloud providers)
function parseRedisUrl(url) {
    try {
        const parsed = new URL(url);
        return {
            host: parsed.hostname,
            port: parseInt(parsed.port || '6379', 10),
            password: parsed.password || undefined,
            database: parsed.pathname ? parseInt(parsed.pathname.slice(1) || '0', 10) : 0
        };
    }
    catch (error) {
        logger.error('Failed to parse REDIS_URL:', error);
        return { host: 'localhost', port: 6379 };
    }
}
// Initialize cache connection based on environment and configuration
const createCacheConnection = () => {
    if (provider)
        return provider;
    // Support REDIS_URL format (Railway, Heroku, etc.) or individual env vars
    const redisUrl = process.env.REDIS_URL;
    const redisConfig = redisUrl ? parseRedisUrl(redisUrl) : null;
    const config = {
        type: (process.env.CACHE_TYPE || 'redis'),
        host: (redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.host) || process.env.CACHE_HOST || 'localhost',
        port: (redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.port) || parseInt(process.env.CACHE_PORT || '6379', 10),
        password: (redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.password) || process.env.CACHE_PASSWORD,
        database: (redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.database) || parseInt(process.env.CACHE_DATABASE || '0', 10),
        ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
        keyPrefix: process.env.CACHE_KEY_PREFIX,
        ssl: process.env.NODE_ENV === 'production' ? {
            rejectUnauthorized: true,
            requestCert: true
        } : false
    };
    provider = cache_factory_1.CacheFactory.createProvider(config);
    return provider;
};
exports.cache = createCacheConnection();
// Health check function
function checkCacheConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger.debug('Starting cache connection check');
            if (!provider) {
                logger.error('No cache provider initialized');
                return false;
            }
            return yield provider.isConnected();
        }
        catch (error) {
            logger.error('Cache connection failed:', error);
            return false;
        }
    });
}
// Initialize cache
const initializeCache = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.debug('Initializing cache connection');
        if (!provider) {
            provider = createCacheConnection();
        }
        yield provider.connect();
        logger.debug('Cache connection initialized');
        return true;
    }
    catch (error) {
        logger.error('Cache initialization failed:', error);
        return false;
    }
});
exports.initializeCache = initializeCache;
// Cleanup function for graceful shutdown
const closeCache = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (provider) {
            yield provider.disconnect();
            provider = null;
            logger.debug('Cache connection closed');
        }
    }
    catch (error) {
        logger.error('Error closing cache connection:', error);
        throw error;
    }
});
exports.closeCache = closeCache;
