import { clearCurrentChild } from './childUtils';

/**
 * Centralized logout function that:
 * 1. Calls the backend logout endpoint
 * 2. Clears child selection from localStorage
 * 3. Redirects to the landing page
 */
export const performLogout = async (): Promise<void> => {
  try {
    // Call backend logout endpoint
    await fetch('http://localhost:8080/auth/logout', { 
      method: 'POST', 
      credentials: 'include' 
    });
    
    // Clear child selection
    clearCurrentChild();
    
    // Redirect to landing page
    window.location.href = '/';
  } catch (error) {
    console.error('Error during logout:', error);
    // Even if logout fails, clear local data and redirect
    clearCurrentChild();
    window.location.href = '/';
  }
};
