import { Application } from 'express';

/**
 * Extracts all registered routes from an Express application
 * @param app Express application instance
 * @returns Array of route objects with path and method
 */
export function extractRoutes(app: Application): Array<{path: string, method: string}> {
  const routes: Array<{path: string, method: string}> = [];
  
  // Get the router stack
  const stack = (app as any)._router?.stack;
  
  if (!stack) {
    return routes;
  }
  
  // Helper function to process route
  function processRoute(layer: any, basePath: string = '') {
    if (layer.route) {
      // It's a route
      const path = basePath + (layer.route.path || '');
      const methods = Object.keys(layer.route.methods)
        .filter(method => layer.route.methods[method]);
      
      methods.forEach(method => {
        routes.push({
          path,
          method
        });
      });
    } else if (layer.name === 'router' && layer.handle.stack) {
      // It's a sub-router
      const path = layer.regexp.source
        .replace('^\\/','/')
        .replace('\\/?(?=\\/|$)', '')
        .replace(/\\\//g, '/')
        .replace(/\(\?:\(\[\^\\\/]\+\?\)\)/g, ':param');
      
      layer.handle.stack.forEach((stackItem: any) => {
        processRoute(stackItem, path);
      });
    }
  }
  
  // Process all layers
  stack.forEach((layer: any) => {
    processRoute(layer);
  });
  
  return routes;
} 