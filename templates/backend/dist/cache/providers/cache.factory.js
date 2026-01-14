"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheFactory = void 0;
const redis_provider_1 = require("./redis.provider");
const logger_1 = require("../../logger");
class CacheFactory {
    static createProvider(config) {
        CacheFactory.logger.debug(`Creating cache provider for type: ${config.type}`);
        switch (config.type) {
            case 'redis':
                return new redis_provider_1.RedisProvider(config);
            case 'memory':
                throw new Error('Memory cache provider not implemented yet');
            default:
                throw new Error(`Unknown cache type: ${config.type}`);
        }
    }
}
exports.CacheFactory = CacheFactory;
CacheFactory.logger = logger_1.LoggerFactory.getLogger('CacheFactory');
