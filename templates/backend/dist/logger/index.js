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
exports.LoggerFactory = exports.Logger = exports.DatabaseAppender = exports.FileAppender = exports.ConsoleAppender = exports.PatternLayout = exports.SimpleLayout = void 0;
const pg_1 = require("pg");
// Simple layout implementation
class SimpleLayout {
    format(message, level, context, timestamp, args) {
        return `[${timestamp.toISOString()}] [${level.toUpperCase()}] [${context}] ${message}`;
    }
}
exports.SimpleLayout = SimpleLayout;
// Pattern layout for customizable formats
class PatternLayout {
    constructor(pattern = "%d [%p] [%c] %m") {
        this.pattern = pattern;
    }
    format(message, level, context, timestamp, args) {
        return this.pattern
            .replace("%d", timestamp.toISOString())
            .replace("%p", level.toUpperCase())
            .replace("%c", context)
            .replace("%m", message);
    }
}
exports.PatternLayout = PatternLayout;
// Console appender implementation
class ConsoleAppender {
    constructor(layout = new SimpleLayout()) {
        this.layout = layout;
    }
    append(message, level, context, timestamp, args) {
        const formattedMessage = this.layout.format(message, level, context, timestamp, args);
        console[level](formattedMessage, ...args);
    }
}
exports.ConsoleAppender = ConsoleAppender;
// File appender implementation
class FileAppender {
    constructor(filePath, layout = new SimpleLayout()) {
        this.filePath = filePath;
        this.layout = layout;
        this.fs = require("fs");
        this.stream = this.fs.createWriteStream(filePath, { flags: "a" });
    }
    append(message, level, context, timestamp, args) {
        const formattedMessage = this.layout.format(message, level, context, timestamp, args);
        this.stream.write(`${formattedMessage}\n`);
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.stream.end(() => resolve());
            });
        });
    }
}
exports.FileAppender = FileAppender;
// Database appender implementation
class DatabaseAppender {
    constructor(config, layout) {
        this.config = config;
        this.layout = layout;
        this.connected = false;
        this.queue = [];
        this.connecting = false;
        this.batchSize = 100;
        this.flushInterval = 5000; // 5 seconds
        this.connect();
        this.startFlushInterval();
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connected || this.connecting)
                return;
            this.connecting = true;
            try {
                this.client = new pg_1.Pool({
                    host: this.config.host,
                    port: this.config.port,
                    user: this.config.username,
                    password: this.config.password,
                    database: this.config.database,
                    ssl: process.env.NODE_ENV === "production"
                        ? { rejectUnauthorized: false }
                        : false,
                });
                if (this.config.schema) {
                    yield this.client.connect();
                    yield this.client.query(`SET search_path TO "${this.config.schema}"`);
                }
                else {
                    yield this.client.connect();
                }
                yield this.initPostgresTable();
                this.connected = true;
                this.connecting = false;
                yield this.flush();
            }
            catch (error) {
                console.error("Failed to connect to database:", error);
                this.connecting = false;
                throw error;
            }
        });
    }
    initPostgresTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const tableName = this.config.table || "logs";
            const schema = this.config.schema || "public";
            yield this.client.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."${tableName}" (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
      level VARCHAR(10) NOT NULL,
      context VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      args JSONB,
      metadata JSONB
    );
  `);
        });
    }
    append(message, level, context, timestamp, args) {
        var _a;
        const logEntry = {
            timestamp,
            level,
            context,
            message,
            args,
            metadata: {
                formatted: (_a = this.layout) === null || _a === void 0 ? void 0 : _a.format(message, level, context, timestamp, args),
            },
        };
        this.queue.push(logEntry);
        if (this.queue.length >= this.batchSize) {
            this.flush().catch(console.error);
        }
    }
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connected || this.queue.length === 0)
                return;
            const batch = this.queue.splice(0, this.batchSize);
            try {
                const tableName = this.config.table || "logs";
                const schema = this.config.schema || "public";
                const values = batch.map((entry) => [
                    entry.timestamp,
                    entry.level,
                    entry.context,
                    entry.message,
                    JSON.stringify(entry.args),
                    JSON.stringify(entry.metadata),
                ]);
                const query = `
      INSERT INTO "${schema}"."${tableName}"
      (timestamp, level, context, message, args, metadata)
      VALUES ${values
                    .map((_, i) => {
                    const offset = i * 6; // 6 parameters per row
                    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
                })
                    .join(",")}
    `;
                yield this.client.query(query, values.flat());
            }
            catch (error) {
                console.error("Failed to flush logs to database:", error);
                // Put the batch back in the queue
                this.queue.unshift(...batch);
            }
        });
    }
    startFlushInterval() {
        setInterval(() => {
            this.flush().catch(console.error);
        }, this.flushInterval);
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connected && !this.connecting && this.queue.length > 0) {
                try {
                    yield this.connect();
                }
                catch (error) {
                    console.error("Failed to connect during close for final flush:", error);
                }
            }
            if (this.connected) {
                try {
                    yield this.flush();
                }
                catch (flushError) {
                    console.error("Error during final flush:", flushError);
                }
            }
            if (this.client) {
                try {
                    yield this.client.end();
                }
                catch (endError) {
                    console.error("Error ending database client connection:", endError);
                }
                this.connected = false;
                this.client = undefined;
            }
        });
    }
}
exports.DatabaseAppender = DatabaseAppender;
// Enhanced Logger class
class Logger {
    constructor(context, appenders) {
        this.context = context;
        this.appenders = [];
        this.logLevel = "info";
        this.enabled = true;
        // Default to console appender if none provided
        this.appenders = appenders || [new ConsoleAppender()];
        // Check environment variable for logging enabled/disabled
        this.enabled = process.env.LOGGING_ENABLED !== "false";
        // Set log level from environment variable if provided
        if (process.env.LOG_LEVEL) {
            const envLevel = process.env.LOG_LEVEL.toLowerCase();
            if (envLevel === 'debug' || envLevel === 'info' || envLevel === 'warn' || envLevel === 'error') {
                this.logLevel = envLevel;
            }
        }
    }
    setLevel(level) {
        this.logLevel = level;
    }
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    isEnabled() {
        return this.enabled;
    }
    addAppender(appender) {
        this.appenders.push(appender);
    }
    shouldLog(level) {
        if (!this.enabled)
            return false;
        const levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
        };
        return levels[level] >= levels[this.logLevel];
    }
    log(level, message, ...args) {
        if (!this.shouldLog(level))
            return;
        const timestamp = new Date();
        this.appenders.forEach((appender) => {
            appender.append(message, level, this.context, timestamp, args);
        });
    }
    debug(message, ...args) {
        this.log("debug", message, ...args);
    }
    info(message, ...args) {
        this.log("info", message, ...args);
    }
    warn(message, ...args) {
        this.log("warn", message, ...args);
    }
    error(message, ...args) {
        this.log("error", message, ...args);
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(this.appenders
                .filter((appender) => appender.close)
                .map((appender) => appender.close()));
        });
    }
}
exports.Logger = Logger;
// Factory for creating pre-configured loggers
class LoggerFactory {
    static configure(appenders) {
        // Check environment variables for logging enabled/disabled
        this.enabled = process.env.LOGGING_ENABLED !== "false";
        this.console_enabled = process.env.CONSOLE_LOGGING_ENABLED !== "false";
        this.database_enabled = process.env.DATABASE_LOGGING_ENABLED !== "false";
        this.file_enabled = process.env.FILE_LOGGING_ENABLED !== "false";
        // Filter appenders based on environment variables
        const filteredAppenders = appenders.filter(appender => {
            if (!this.enabled)
                return false;
            if (appender instanceof ConsoleAppender && !this.console_enabled)
                return false;
            if (appender instanceof DatabaseAppender && !this.database_enabled)
                return false;
            if (appender instanceof FileAppender && !this.file_enabled)
                return false;
            return true;
        });
        this.defaultAppenders = filteredAppenders.length > 0 ? filteredAppenders : [];
        // Update all existing loggers
        this.loggers.forEach((logger) => {
            // Create new filtered appenders list for each logger
            const updatedAppenders = logger['appenders'].filter(appender => {
                if (!this.enabled)
                    return false;
                if (appender instanceof ConsoleAppender && !this.console_enabled)
                    return false;
                if (appender instanceof DatabaseAppender && !this.database_enabled)
                    return false;
                if (appender instanceof FileAppender && !this.file_enabled)
                    return false;
                return true;
            });
            // Replace the logger's appenders with the filtered list
            logger['appenders'] = updatedAppenders;
            logger.setEnabled(this.enabled);
            // Set log level from environment variable if provided
            if (process.env.LOG_LEVEL) {
                const envLevel = process.env.LOG_LEVEL.toLowerCase();
                if (envLevel === 'debug' || envLevel === 'info' || envLevel === 'warn' || envLevel === 'error') {
                    logger.setLevel(envLevel);
                }
            }
        });
    }
    static setEnabled(enabled) {
        this.enabled = enabled;
        // Update all existing loggers
        this.loggers.forEach((logger) => {
            logger.setEnabled(enabled);
        });
    }
    static isEnabled() {
        return this.enabled;
    }
    static getLogger(context) {
        if (!this.loggers.has(context)) {
            // Filter default appenders based on environment variables
            const filteredAppenders = this.defaultAppenders.filter(appender => {
                if (!this.enabled)
                    return false;
                if (appender instanceof ConsoleAppender && !this.console_enabled)
                    return false;
                if (appender instanceof DatabaseAppender && !this.database_enabled)
                    return false;
                if (appender instanceof FileAppender && !this.file_enabled)
                    return false;
                return true;
            });
            const logger = new Logger(context, filteredAppenders);
            logger.setEnabled(this.enabled);
            // Set log level from environment variable if provided
            if (process.env.LOG_LEVEL) {
                const envLevel = process.env.LOG_LEVEL.toLowerCase();
                if (envLevel === 'debug' || envLevel === 'info' || envLevel === 'warn' || envLevel === 'error') {
                    logger.setLevel(envLevel);
                }
            }
            this.loggers.set(context, logger);
        }
        return this.loggers.get(context);
    }
    static closeAll() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(Array.from(this.loggers.values()).map((logger) => logger.close()));
            this.loggers.clear();
        });
    }
}
exports.LoggerFactory = LoggerFactory;
LoggerFactory.defaultAppenders = [new ConsoleAppender()];
LoggerFactory.loggers = new Map();
LoggerFactory.enabled = true;
LoggerFactory.console_enabled = true;
LoggerFactory.database_enabled = true;
LoggerFactory.file_enabled = true;
