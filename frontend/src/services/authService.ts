import axios from 'axios';
import { API_URL } from '../config';

interface User {
  id: string;
  username: string;
  email: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
    this.user = this.getUserFromToken(this.token);
  }

  private getUserFromToken(token: string | null): User | null {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  async login(username: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });

      if (response.data.token) {
        this.token = response.data.token;
        this.user = this.getUserFromToken(this.token);
        if (this.token) {
          localStorage.setItem('token', this.token);
        }
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  // Add interceptor to handle token refresh and 401 errors
  setupInterceptors(): void {
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
}

export const authService = new AuthService(); 