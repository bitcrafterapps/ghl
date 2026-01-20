/**
 * API utility functions for making requests to the backend
 */

/**
 * Get the base API URL from environment variables or fallback to default
 */
export const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

/**
 * Get the unique site ID for multi-tenant scoping
 * This is set during site generation and stored in .env
 */
export const getSiteId = (): string | undefined => {
  return process.env.NEXT_PUBLIC_SITE_ID;
};

/**
 * Make a fetch request to the API with the correct base URL
 * Automatically includes x-site-id header for multi-tenant site scoping
 */
export const fetchApi = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const apiUrl = getApiUrl();
  const url = `${apiUrl}${endpoint}`;
  const siteId = getSiteId();
  
  // Log the request details
  console.log(`API Request: ${options.method || 'GET'} ${url}`);
  
  // Merge headers with x-site-id for multi-tenant scoping
  const headers: HeadersInit = {
    ...(options.headers as Record<string, string> || {}),
    ...(siteId ? { 'x-site-id': siteId } : {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // Add credentials: 'include' to ensure cookies are sent
      credentials: 'include'
    });
    
    // Log the response status
    console.log(`API Response: ${response.status} ${response.statusText} for ${url}`);
    
    return response;
  } catch (error) {
    // Log network errors
    console.error(`API Error for ${url}:`, error);
    throw error;
  }
};

/**
 * Helper for GET requests
 */
export const get = async (endpoint: string, token?: string): Promise<Response> => {
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetchApi(endpoint, {
    method: 'GET',
    headers
  });
};

/**
 * Helper for POST requests
 */
export const post = async (
  endpoint: string,
  data: any,
  token?: string
): Promise<Response> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetchApi(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
};

/**
 * Helper for PUT requests
 */
export const put = async (
  endpoint: string,
  data: any,
  token?: string
): Promise<Response> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetchApi(endpoint, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data)
  });
};

/**
 * Helper for DELETE requests
 */
export const del = async (endpoint: string, token?: string): Promise<Response> => {
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetchApi(endpoint, {
    method: 'DELETE',
    headers
  });
};

/**
 * Fetch the current user's profile 
 */
export const fetchCurrentUserProfile = async (token: string): Promise<any> => {
  if (!token) {
    console.error('fetchCurrentUserProfile called without a token');
    throw new Error('Authentication token is required');
  }
  
  // First check sessionStorage for cached profile
  try {
    const cachedProfile = sessionStorage.getItem('userProfile');
    if (cachedProfile) {
      console.log('API: Using cached profile from sessionStorage');
      const profileData = JSON.parse(cachedProfile);
      // Remove from sessionStorage to prevent stale data
      sessionStorage.removeItem('userProfile');
      return profileData;
    }
  } catch (error) {
    console.warn('API: Error accessing sessionStorage:', error);
    // Continue with API call if sessionStorage fails
  }
  
  // Log the token length and first/last few characters for debugging
  const tokenLength = token.length;
  const tokenPreview = tokenLength > 20 
    ? `${token.substring(0, 10)}...${token.substring(tokenLength - 10)}`
    : token;
  console.log(`API: Fetching current user profile with token (length: ${tokenLength}): ${tokenPreview}`);
  
  try {
    // Use fetchApi directly to see all request and response details
    const apiUrl = getApiUrl();
    const url = `${apiUrl}/api/v1/users/profile`;
    console.log(`API: Making profile request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include'
    });
    
    console.log(`API: Profile response status:`, response.status, response.statusText);
    
    // Log headers in a compatible way
    const headerObj: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headerObj[key] = value;
    });
    console.log('API: Profile response headers:', headerObj);
    
    const responseText = await response.text();
    console.log('API: Raw profile response length:', responseText.length);
    if (responseText.length) {
      console.log('API: Raw profile response preview:', responseText.substring(0, 100));
    }
    
    if (!response.ok) {
      console.error('API: Error fetching current user profile:', responseText);
      
      // If we get an authentication error, clear the token as it might be invalid
      if (response.status === 401) {
        console.warn('API: Authentication error - clearing token and cached profile');
        localStorage.removeItem('token');
        localStorage.removeItem('userProfile');
      }
      
      throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
    }
    
    // Parse the response only after confirming it's valid
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('API: Error parsing profile response:', parseError);
      throw new Error('Invalid response format');
    }
    
    if (!result.data) {
      console.error('API: Invalid profile response format:', result);
      throw new Error('Invalid profile response format');
    }
    
    console.log('API: Profile fetched successfully:', result.data);
    return result.data;
  } catch (error) {
    console.error('API: Error in fetchCurrentUserProfile:', error);
    throw error;
  }
};

/**
 * Fetch a user's profile by ID (requires admin privileges)
 */
export const fetchUserProfileById = async (userId: number | string, token: string): Promise<any> => {
  if (!userId || userId === 'undefined') {
    console.error('fetchUserProfileById called with invalid userId:', userId);
    throw new Error('Invalid user ID provided');
  }

  // Make sure we have a string ID
  const id = typeof userId === 'number' ? userId : userId;
  
  console.log(`Fetching user profile for ID: ${id}`);
  
  const response = await get(`/api/v1/users/profile/${id}`, token);
  if (!response.ok) {
    const text = await response.text();
    console.error(`Error fetching profile for user ${id}:`, text);
    throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}; 