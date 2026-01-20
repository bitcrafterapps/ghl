import { Pool } from 'pg';

export type LogLevel = "debug" | "info" | "warn" | "error";

// Database configuration interface
export interface DatabaseConfig {
  type: "postgres" | "mongodb" | "mysql" | "neo4j";
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  schema?: string;
  table?: string;
  collection?: string;
  ssl?: boolean;
}

// Log entry interface
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  context: string;
  message: string;
  args?: any[];
  metadata?: Record<string, any>;
}

// Layout interface for formatting log messages
export interface Layout {
  format(
    message: string,
    level: LogLevel,
    context: string,
    timestamp: Date,
    args: any[]
  ): string;
}

// Simple layout implementation
export class SimpleLayout implements Layout {
  format(
    message: string,
    level: LogLevel,
    context: string,
    timestamp: Date,
    args: any[]
  ): string {
    return `[${timestamp.toISOString()}] [${level.toUpperCase()}] [${context}] ${message}`;
  }
}

// Pattern layout for customizable formats
export class PatternLayout implements Layout {
  constructor(private pattern: string = "%d [%p] [%c] %m") {}

  format(
    message: string,
    level: LogLevel,
    context: string,
    timestamp: Date,
    args: any[]
  ): string {
    return this.pattern
      .replace("%d", timestamp.toISOString())
      .replace("%p", level.toUpperCase())
      .replace("%c", context)
      .replace("%m", message);
  }
}

// Appender interface for different output destinations
export interface Appender {
  append(
    message: string,
    level: LogLevel,
    context: string,
    timestamp: Date,
    args: any[]
  ): void;
  close?(): Promise<void>;
}

// Console appender implementation
export class ConsoleAppender implements Appender {
  constructor(private layout: Layout = new SimpleLayout()) {}

  append(
    message: string,
    level: LogLevel,
    context: string,
    timestamp: Date,
    args: any[]
  ): void {
    const formattedMessage = this.layout.format(
      message,
      level,
      context,
      timestamp,
      args
    );
    console[level](formattedMessage, ...args);
  }
}

// File appender implementation
export class FileAppender implements Appender {
  private fs: any;
  private stream: any;

  constructor(
    private filePath: string,
    private layout: Layout = new SimpleLayout()
  ) {
    this.fs = require("fs");
    this.stream = this.fs.createWriteStream(filePath, { flags: "a" });
  }

  append(
    message: string,
    level: LogLevel,
    context: string,
    timestamp: Date,
    args: any[]
  ): void {
    const formattedMessage = this.layout.format(
      message,
      level,
      context,
      timestamp,
      args
    );
    this.stream.write(`${formattedMessage}\n`);
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.stream.end(() => resolve());
    });
  }
}

// Database appender implementation
export class DatabaseAppender implements Appender {
  private client: any;
  private connected: boolean = false;
  private queue: LogEntry[] = [];
  private connecting: boolean = false;
  private batchSize: number = 100;
  private flushInterval: number = 5000; // 5 seconds

  constructor(private config: DatabaseConfig, private layout?: Layout) {
    this.connect();
    this.startFlushInterval();
  }

  private async connect(): Promise<void> {
    if (this.connected || this.connecting) return;
    this.connecting = true;

    try {
      this.client = new Pool({
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
        await this.client.connect();
        await this.client.query(`SET search_path TO "${this.config.schema}"`);
      } else {
        await this.client.connect();
      }

      await this.initPostgresTable();
      this.connected = true;
      this.connecting = false;

      await this.flush();
    } catch (error) {
      console.error("Failed to connect to database:", error);
      this.connecting = false;
      throw error;
    }
  }

  private async initPostgresTable(): Promise<void> {
    const tableName = this.config.table || "logs";
    const schema = this.config.schema || "public";
    await this.client.query(`
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
  }

  append(
    message: string,
    level: LogLevel,
    context: string,
    timestamp: Date,
    args: any[]
  ): void {
    const logEntry: LogEntry = {
      timestamp,
      level,
      context,
      message,
      args,
      metadata: {
        formatted: this.layout?.format(
          message,
          level,
          context,
          timestamp,
          args
        ),
      },
    };

    this.queue.push(logEntry);
    if (this.queue.length >= this.batchSize) {
      this.flush().catch(console.error);
    }
  }

  private async flush(): Promise<void> {
    if (!this.connected || this.queue.length === 0) return;

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
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${
            offset + 4
          }, $${offset + 5}, $${offset + 6})`;
        })
        .join(",")}
    `;

      await this.client.query(query, values.flat());
    } catch (error) {
      console.error("Failed to flush logs to database:", error);
      // Put the batch back in the queue
      this.queue.unshift(...batch);
    }
  }

  private startFlushInterval(): void {
    setInterval(() => {
      this.flush().catch(console.error);
    }, this.flushInterval);
  }

  async close(): Promise<void> {

    if (!this.connected && !this.connecting && this.queue.length > 0) {
      try {
        await this.connect();
      } catch (error) {
        console.error("Failed to connect during close for final flush:", error);
      }
    }
    
    if (this.connected) {
      try {
        await this.flush();
      } catch (flushError) {
        console.error("Error during final flush:", flushError);
      }
    }
    
    if (this.client) {
      try {
        await this.client.end();
      } catch (endError) {
        console.error("Error ending database client connection:", endError);
      }
      this.connected = false;
      this.client = undefined;
    }
  }
}

// Enhanced Logger class
export class Logger {
  private appenders: Appender[] = [];
  private logLevel: LogLevel = "info";
  private enabled: boolean = true;

  constructor(private context: string, appenders?: Appender[]) {
    // Default to console appender if none provided
    this.appenders = appenders || [new ConsoleAppender()];

    // Check environment variable for logging enabled/disabled
    this.enabled = process.env.LOGGING_ENABLED !== "false";
    
    // Set log level from environment variable if provided
    if (process.env.LOG_LEVEL) {
      const envLevel = process.env.LOG_LEVEL.toLowerCase() as LogLevel;
      if (envLevel === 'debug' || envLevel === 'info' || envLevel === 'warn' || envLevel === 'error') {
        this.logLevel = envLevel;
      }
    }
  }

  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  addAppender(appender: Appender): void {
    this.appenders.push(appender);
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;

    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.logLevel];
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date();
    this.appenders.forEach((appender) => {
      appender.append(message, level, this.context, timestamp, args);
    });
  }

  debug(message: string, ...args: any[]): void {
    this.log("debug", message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log("info", message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log("warn", message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log("error", message, ...args);
  }

  async close(): Promise<void> {
    await Promise.all(
      this.appenders
        .filter((appender) => appender.close)
        .map((appender) => appender.close!())
    );
  }
}

// Factory for creating pre-configured loggers
export class LoggerFactory {
  private static defaultAppenders: Appender[] = [new ConsoleAppender()];
  private static loggers: Map<string, Logger> = new Map();
  private static enabled: boolean = true;
  private static console_enabled: boolean = true;
  private static database_enabled: boolean = true;
  private static file_enabled: boolean = true;

  static configure(appenders: Appender[]): void {
    // Check environment variables for logging enabled/disabled
    this.enabled = process.env.LOGGING_ENABLED !== "false";
    this.console_enabled = process.env.CONSOLE_LOGGING_ENABLED !== "false";
    this.database_enabled = process.env.DATABASE_LOGGING_ENABLED !== "false";
    this.file_enabled = process.env.FILE_LOGGING_ENABLED !== "false";

    // Filter appenders based on environment variables
    const filteredAppenders = appenders.filter(appender => {
      if (!this.enabled) return false;
      if (appender instanceof ConsoleAppender && !this.console_enabled) return false;
      if (appender instanceof DatabaseAppender && !this.database_enabled) return false;
      if (appender instanceof FileAppender && !this.file_enabled) return false;
      return true;
    });

    this.defaultAppenders = filteredAppenders.length > 0 ? filteredAppenders : [];

    // Update all existing loggers
    this.loggers.forEach((logger) => {
      // Create new filtered appenders list for each logger
      const updatedAppenders = logger['appenders'].filter(appender => {
        if (!this.enabled) return false;
        if (appender instanceof ConsoleAppender && !this.console_enabled) return false;
        if (appender instanceof DatabaseAppender && !this.database_enabled) return false;
        if (appender instanceof FileAppender && !this.file_enabled) return false;
        return true;
      });
      
      // Replace the logger's appenders with the filtered list
      logger['appenders'] = updatedAppenders;
      logger.setEnabled(this.enabled);
      
      // Set log level from environment variable if provided
      if (process.env.LOG_LEVEL) {
        const envLevel = process.env.LOG_LEVEL.toLowerCase() as LogLevel;
        if (envLevel === 'debug' || envLevel === 'info' || envLevel === 'warn' || envLevel === 'error') {
          logger.setLevel(envLevel);
        }
      }
    });
  }

  static setEnabled(enabled: boolean): void {
    this.enabled = enabled;

    // Update all existing loggers
    this.loggers.forEach((logger) => {
      logger.setEnabled(enabled);
    });
  }

  static isEnabled(): boolean {
    return this.enabled;
  }

  static getLogger(context: string): Logger {
    if (!this.loggers.has(context)) {
      // Filter default appenders based on environment variables
      const filteredAppenders = this.defaultAppenders.filter(appender => {
        if (!this.enabled) return false;
        if (appender instanceof ConsoleAppender && !this.console_enabled) return false;
        if (appender instanceof DatabaseAppender && !this.database_enabled) return false;
        if (appender instanceof FileAppender && !this.file_enabled) return false;
        return true;
      });
      
      const logger = new Logger(context, filteredAppenders);
      logger.setEnabled(this.enabled);
      
      // Set log level from environment variable if provided
      if (process.env.LOG_LEVEL) {
        const envLevel = process.env.LOG_LEVEL.toLowerCase() as LogLevel;
        if (envLevel === 'debug' || envLevel === 'info' || envLevel === 'warn' || envLevel === 'error') {
          logger.setLevel(envLevel);
        }
      }
      
      this.loggers.set(context, logger);
    }
    return this.loggers.get(context)!;
  }

  static async closeAll(): Promise<void> {
    await Promise.all(
      Array.from(this.loggers.values()).map((logger) => logger.close())
    );
    this.loggers.clear();
  }
}
