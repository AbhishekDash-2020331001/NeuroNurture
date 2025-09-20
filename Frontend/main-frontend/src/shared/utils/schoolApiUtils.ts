// Utility functions for school API calls with JWT authentication

export const getSchoolAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('schoolToken');
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

export const makeAuthenticatedSchoolRequest = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const authHeaders = getSchoolAuthHeaders();
  
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
