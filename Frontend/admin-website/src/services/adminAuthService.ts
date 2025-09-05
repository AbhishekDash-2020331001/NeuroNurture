const ADMIN_SERVICE_URL = 'http://localhost:8090';

export interface AdminUser {
  adminId: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  adminId: number;
  username: string;
  email: string;
  role: string;
}

export interface RegisterResponse {
  message: string;
  adminId: number;
  username: string;
  email: string;
  role: string;
}

export const adminAuthService = {
  async register(username: string, email: string, password: string): Promise<RegisterResponse> {
    const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  },

  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  async getCurrentAdmin(token: string): Promise<AdminUser> {
    const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get admin info');
    }

    return response.json();
  },

  // Store token in localStorage
  setToken(token: string): void {
    localStorage.setItem('adminToken', token);
  },

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('adminToken');
  },

  // Remove token from localStorage
  removeToken(): void {
    localStorage.removeItem('adminToken');
  },

  // Check if admin is logged in
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
};