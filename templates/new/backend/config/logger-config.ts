import {
  LoggerFactory,
  ConsoleAppender,
  DatabaseAppender,
  PatternLayout,
} from "../logger";

import { config } from "dotenv";

export function configureLogger() {
  // Create a console appender with a custom pattern
  const consoleAppender = new ConsoleAppender(
    new PatternLayout("[%d] %p [%c] %m")
  );

  config();

  const appenders: any[] = [consoleAppender];

  // Only add database appender if DATABASE_URL is set
  if (process.env.DATABASE_URL) {
    try {
      // Parse DATABASE_URL to extract connection details
      const url = new URL(process.env.DATABASE_URL);
      
      // Create a database appender using parsed DATABASE_URL
      const dbAppender = new DatabaseAppender({
        type: "postgres",
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        username: url.username,
        password: url.password,
        database: url.pathname.slice(1), // Remove leading '/'
        schema: process.env.POSTGRES_SCHEMA || "threebears",
        table: "application_logs",
        ssl: !url.hostname.includes("localhost") && !url.hostname.includes("127.0.0.1"),
      });

      appenders.push(dbAppender);
    } catch (error) {
      console.error("Failed to parse DATABASE_URL for logger, skipping database logging:", error);
    }
  }

  // Configure the LoggerFactory with appenders
  LoggerFactory.configure(appenders);

  // Set enabled state based on environment variable
  LoggerFactory.setEnabled(process.env.LOGGING_ENABLED !== "false");
}
