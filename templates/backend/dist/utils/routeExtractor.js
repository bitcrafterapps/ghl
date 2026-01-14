"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractRoutes = extractRoutes;
/**
 * Extracts all registered routes from an Express application
 * @param app Express application instance
 * @returns Array of route objects with path and method
 */
function extractRoutes(app) {
    var _a;
    const routes = [];
    // Get the router stack
    const stack = (_a = app._router) === null || _a === void 0 ? void 0 : _a.stack;
    if (!stack) {
        return routes;
    }
    // Helper function to process route
    function processRoute(layer, basePath = '') {
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
        }
        else if (layer.name === 'router' && layer.handle.stack) {
            // It's a sub-router
            const path = layer.regexp.source
                .replace('^\\/', '/')
                .replace('\\/?(?=\\/|$)', '')
                .replace(/\\\//g, '/')
                .replace(/\(\?:\(\[\^\\\/]\+\?\)\)/g, ':param');
            layer.handle.stack.forEach((stackItem) => {
                processRoute(stackItem, path);
            });
        }
    }
    // Process all layers
    stack.forEach((layer) => {
        processRoute(layer);
    });
    return routes;
}
