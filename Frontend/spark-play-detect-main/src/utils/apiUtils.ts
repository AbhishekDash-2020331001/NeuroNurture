// Utility functions for API calls with JWT authentication

export const getDoctorAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('doctorToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Adding JWT token to request:', token.substring(0, 20) + '...');
  } else {
    console.warn('No JWT token found in localStorage');
  }

  return headers;
};

export const makeAuthenticatedDoctorRequest = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const authHeaders = getDoctorAuthHeaders();
  
  const requestOptions: RequestInit = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  };

  console.log('Making authenticated request to:', url);
  console.log('Request headers:', requestOptions.headers);
  
  return fetch(url, requestOptions);
};

// Generic function for any authenticated request
export const makeAuthenticatedRequest = async (
  url: string, 
  options: RequestInit = {},
  tokenKey: string = 'token'
): Promise<Response> => {
  const token = localStorage.getItem(tokenKey);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const requestOptions: RequestInit = {
    ...options,
    headers,
  };

  return fetch(url, requestOptions);
};
