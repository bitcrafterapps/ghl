/**
 * Auth utility functions for handling JWT tokens and authentication
 */

/**
 * Decodes a JWT token and extracts the userId
 * @param token - The JWT token to decode
 * @returns The userId from the token or null if not found/invalid
 */
export const getUserIdFromToken = (token: string): string | null => {
  try {
    // JWT token consists of three parts: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    console.log('Decoded token payload:', payload);
    
    if (!payload.userId) {
      console.error('No userId found in token');
      return null;
    }
    
    return payload.userId.toString();
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Gets the current user's token from localStorage
 * @returns The token or null if not found
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

/**
 * Checks if the user is authenticated (has a token)
 * @returns True if authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
}; 