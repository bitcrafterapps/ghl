"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBanner = generateBanner;
exports.formatServerInfo = formatServerInfo;
exports.formatRoutes = formatRoutes;
const chalk_1 = __importDefault(require("chalk"));
/**
 * Generates a colorful ASCII art banner for API startup
 * @param appName The name of the application
 * @param version The version of the application
 * @returns The formatted banner string
 */
function generateBanner(appName, version) {
    const apiName = appName || 'API Server';
    const apiVersion = version || '1.00.01';
    // ASCII art banner
    const banner = `
  ${chalk_1.default.cyan('╔═══════════════════════════════════════════════════════════╗')}
  ${chalk_1.default.cyan('║')}                                                           ${chalk_1.default.cyan('║')}
  ${chalk_1.default.cyan('║')}  ${chalk_1.default.bold.blue('     █████╗ ██████╗ ██╗')}                                  ${chalk_1.default.cyan('║')}
  ${chalk_1.default.cyan('║')}  ${chalk_1.default.bold.blue('    ██╔══██╗██╔══██╗██║')}                                  ${chalk_1.default.cyan('║')}
  ${chalk_1.default.cyan('║')}  ${chalk_1.default.bold.blue('    ███████║██████╔╝██║')}                                  ${chalk_1.default.cyan('║')}
  ${chalk_1.default.cyan('║')}  ${chalk_1.default.bold.blue('    ██╔══██║██╔═══╝ ██║')}                                  ${chalk_1.default.cyan('║')}
  ${chalk_1.default.cyan('║')}  ${chalk_1.default.bold.blue('    ██║  ██║██║     ██║')}                                  ${chalk_1.default.cyan('║')}
  ${chalk_1.default.cyan('║')}  ${chalk_1.default.bold.blue('    ╚═╝  ╚═╝╚═╝     ╚═╝')}                                  ${chalk_1.default.cyan('║')}
  ${chalk_1.default.cyan('║')}                                                           ${chalk_1.default.cyan('║')}
  ${chalk_1.default.cyan('║')}      ${chalk_1.default.bold.green(apiName)} ${chalk_1.default.yellow('v' + apiVersion)}${' '.repeat(Math.max(0, 42 - apiName.length - apiVersion.length - 1))}          ${chalk_1.default.cyan('║')}
  ${chalk_1.default.cyan('║')}                                                           ${chalk_1.default.cyan('║')}
  ${chalk_1.default.cyan('╚═══════════════════════════════════════════════════════════╝')}
  `;
    return banner;
}
/**
 * Formats server information in a colorful table
 * @param info Object containing server information
 * @returns The formatted info string
 */
function formatServerInfo(info) {
    const maxKeyLength = Math.max(...Object.keys(info).map(key => key.length));
    // Calculate max value length to ensure table is wide enough
    const maxValueLength = Math.max(...Object.values(info).map(val => String(val).length));
    // Ensure minimum width for values (at least 40 characters for URLs)
    const valueWidth = Math.max(40, maxValueLength);
    // Total width of the table
    const tableWidth = maxKeyLength + valueWidth + 5; // 5 for padding and separators
    let output = '\n';
    output += chalk_1.default.cyan('┌' + '─'.repeat(maxKeyLength + 2) + '┬' + '─'.repeat(valueWidth + 2) + '┐') + '\n';
    for (const [key, value] of Object.entries(info)) {
        const paddedKey = key.padEnd(maxKeyLength);
        const formattedValue = formatValue(value);
        output += chalk_1.default.cyan('│ ') +
            chalk_1.default.yellow(paddedKey) +
            chalk_1.default.cyan(' │ ') +
            formattedValue +
            ' '.repeat(Math.max(0, valueWidth - String(value).length)) +
            chalk_1.default.cyan(' │') + '\n';
        // Add separator line except for the last item
        if (Object.keys(info).indexOf(key) < Object.keys(info).length - 1) {
            output += chalk_1.default.cyan('├' + '─'.repeat(maxKeyLength + 2) + '┼' + '─'.repeat(valueWidth + 2) + '┤') + '\n';
        }
    }
    output += chalk_1.default.cyan('└' + '─'.repeat(maxKeyLength + 2) + '┴' + '─'.repeat(valueWidth + 2) + '┘') + '\n';
    return output;
}
/**
 * Format a value with appropriate color based on its type
 */
function formatValue(value) {
    if (value === undefined || value === null) {
        return chalk_1.default.gray('not set');
    }
    if (typeof value === 'string') {
        if (value.startsWith('http')) {
            return chalk_1.default.blue.underline(value);
        }
        return chalk_1.default.green(value);
    }
    if (typeof value === 'number') {
        return chalk_1.default.magenta(value.toString());
    }
    if (typeof value === 'boolean') {
        return value ? chalk_1.default.green('enabled') : chalk_1.default.red('disabled');
    }
    return chalk_1.default.white(String(value));
}
/**
 * Formats a route table for API endpoints
 * @param routes Array of route objects with path and method
 * @returns The formatted routes string
 */
function formatRoutes(routes) {
    if (!routes || routes.length === 0) {
        return '';
    }
    let output = '\n' + chalk_1.default.bold.cyan('Available Routes:') + '\n\n';
    for (const route of routes) {
        const method = route.method.toUpperCase();
        let methodColor;
        switch (method) {
            case 'GET':
                methodColor = chalk_1.default.bold.green(method.padEnd(7));
                break;
            case 'POST':
                methodColor = chalk_1.default.bold.yellow(method.padEnd(7));
                break;
            case 'PUT':
                methodColor = chalk_1.default.bold.blue(method.padEnd(7));
                break;
            case 'DELETE':
                methodColor = chalk_1.default.bold.red(method.padEnd(7));
                break;
            default:
                methodColor = chalk_1.default.bold.gray(method.padEnd(7));
        }
        output += `  ${methodColor} ${chalk_1.default.cyan(route.path)}\n`;
    }
    return output;
}
