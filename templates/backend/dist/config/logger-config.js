"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureLogger = configureLogger;
const logger_1 = require("../logger");
const dotenv_1 = require("dotenv");
function configureLogger() {
    // Create a console appender with a custom pattern
    const consoleAppender = new logger_1.ConsoleAppender(new logger_1.PatternLayout("[%d] %p [%c] %m"));
    (0, dotenv_1.config)();
    const appenders = [consoleAppender];
    // Only add database appender if DATABASE_URL is set
    if (process.env.DATABASE_URL) {
        try {
            // Parse DATABASE_URL to extract connection details
            const url = new URL(process.env.DATABASE_URL);
            // Create a database appender using parsed DATABASE_URL
            const dbAppender = new logger_1.DatabaseAppender({
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
        }
        catch (error) {
            console.error("Failed to parse DATABASE_URL for logger, skipping database logging:", error);
        }
    }
    // Configure the LoggerFactory with appenders
    logger_1.LoggerFactory.configure(appenders);
    // Set enabled state based on environment variable
    logger_1.LoggerFactory.setEnabled(process.env.LOGGING_ENABLED !== "false");
}
