import chalk from 'chalk';

/**
 * Generates a colorful ASCII art banner for API startup
 * @param appName The name of the application
 * @param version The version of the application
 * @returns The formatted banner string
 */
export function generateBanner(appName: string, version: string): string {
  const apiName = appName || 'API Server';
  const apiVersion = version || '1.00.01';
  
  // ASCII art banner
  const banner = `
  ${chalk.cyan('╔═══════════════════════════════════════════════════════════╗')}
  ${chalk.cyan('║')}                                                           ${chalk.cyan('║')}
  ${chalk.cyan('║')}  ${chalk.bold.blue('     █████╗ ██████╗ ██╗')}                                  ${chalk.cyan('║')}
  ${chalk.cyan('║')}  ${chalk.bold.blue('    ██╔══██╗██╔══██╗██║')}                                  ${chalk.cyan('║')}
  ${chalk.cyan('║')}  ${chalk.bold.blue('    ███████║██████╔╝██║')}                                  ${chalk.cyan('║')}
  ${chalk.cyan('║')}  ${chalk.bold.blue('    ██╔══██║██╔═══╝ ██║')}                                  ${chalk.cyan('║')}
  ${chalk.cyan('║')}  ${chalk.bold.blue('    ██║  ██║██║     ██║')}                                  ${chalk.cyan('║')}
  ${chalk.cyan('║')}  ${chalk.bold.blue('    ╚═╝  ╚═╝╚═╝     ╚═╝')}                                  ${chalk.cyan('║')}
  ${chalk.cyan('║')}                                                           ${chalk.cyan('║')}
  ${chalk.cyan('║')}      ${chalk.bold.green(apiName)} ${chalk.yellow('v' + apiVersion)}${' '.repeat(Math.max(0, 42 - apiName.length - apiVersion.length - 1))}          ${chalk.cyan('║')}
  ${chalk.cyan('║')}                                                           ${chalk.cyan('║')}
  ${chalk.cyan('╚═══════════════════════════════════════════════════════════╝')}
  `;
  
  return banner;
}

/**
 * Formats server information in a colorful table
 * @param info Object containing server information
 * @returns The formatted info string
 */
export function formatServerInfo(info: Record<string, any>): string {
  const maxKeyLength = Math.max(...Object.keys(info).map(key => key.length));
  // Calculate max value length to ensure table is wide enough
  const maxValueLength = Math.max(...Object.values(info).map(val => String(val).length));
  // Ensure minimum width for values (at least 40 characters for URLs)
  const valueWidth = Math.max(40, maxValueLength);
  // Total width of the table
  const tableWidth = maxKeyLength + valueWidth + 5; // 5 for padding and separators
  
  let output = '\n';
  output += chalk.cyan('┌' + '─'.repeat(maxKeyLength + 2) + '┬' + '─'.repeat(valueWidth + 2) + '┐') + '\n';
  
  for (const [key, value] of Object.entries(info)) {
    const paddedKey = key.padEnd(maxKeyLength);
    const formattedValue = formatValue(value);
    
    output += chalk.cyan('│ ') + 
              chalk.yellow(paddedKey) + 
              chalk.cyan(' │ ') + 
              formattedValue + 
              ' '.repeat(Math.max(0, valueWidth - String(value).length)) + 
              chalk.cyan(' │') + '\n';
    
    // Add separator line except for the last item
    if (Object.keys(info).indexOf(key) < Object.keys(info).length - 1) {
      output += chalk.cyan('├' + '─'.repeat(maxKeyLength + 2) + '┼' + '─'.repeat(valueWidth + 2) + '┤') + '\n';
    }
  }
  
  output += chalk.cyan('└' + '─'.repeat(maxKeyLength + 2) + '┴' + '─'.repeat(valueWidth + 2) + '┘') + '\n';
  
  return output;
}

/**
 * Format a value with appropriate color based on its type
 */
function formatValue(value: any): string {
  if (value === undefined || value === null) {
    return chalk.gray('not set');
  }
  
  if (typeof value === 'string') {
    if (value.startsWith('http')) {
      return chalk.blue.underline(value);
    }
    return chalk.green(value);
  }
  
  if (typeof value === 'number') {
    return chalk.magenta(value.toString());
  }
  
  if (typeof value === 'boolean') {
    return value ? chalk.green('enabled') : chalk.red('disabled');
  }
  
  return chalk.white(String(value));
}

/**
 * Formats a route table for API endpoints
 * @param routes Array of route objects with path and method
 * @returns The formatted routes string
 */
export function formatRoutes(routes: Array<{path: string, method: string}>): string {
  if (!routes || routes.length === 0) {
    return '';
  }
  
  let output = '\n' + chalk.bold.cyan('Available Routes:') + '\n\n';
  
  for (const route of routes) {
    const method = route.method.toUpperCase();
    let methodColor;
    
    switch (method) {
      case 'GET':
        methodColor = chalk.bold.green(method.padEnd(7));
        break;
      case 'POST':
        methodColor = chalk.bold.yellow(method.padEnd(7));
        break;
      case 'PUT':
        methodColor = chalk.bold.blue(method.padEnd(7));
        break;
      case 'DELETE':
        methodColor = chalk.bold.red(method.padEnd(7));
        break;
      default:
        methodColor = chalk.bold.gray(method.padEnd(7));
    }
    
    output += `  ${methodColor} ${chalk.cyan(route.path)}\n`;
  }
  
  return output;
} 