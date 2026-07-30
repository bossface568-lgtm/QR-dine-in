import { insforge } from '../client';
import { AuthUser, ApiResponse } from '@qrdine/types';

export const authService = {
  async signUp(email: string, password: string, name: string): Promise<ApiResponse<AuthUser>> {
    try {
      const { data, error } = await insforge.auth.signUp({ email, password, name });
      if (error) throw error;
      
      return {
        data: data && data.user ? {
          id: data.user.id,
          email: data.user.email || '',
          name: (data.user.profile as any)?.name || name || null,
          created_at: data.user.createdAt || new Date().toISOString(),
        } : null,
        error: null,
      };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to sign up' } };
    }
  },

  async signIn(email: string, password: string): Promise<ApiResponse<{ user: AuthUser; accessToken: string }>> {
    try {
      const { data, error } = await insforge.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      if (!data || !data.user) {
        throw new Error('No user data returned from login');
      }

      return {
        data: {
          user: {
            id: data.user.id,
            email: data.user.email || '',
            name: (data.user.profile as any)?.name || null,
            created_at: data.user.createdAt || new Date().toISOString(),
          },
          accessToken: data.accessToken || '',
        },
        error: null,
      };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to sign in' } };
    }
  },

  async signInWithGoogle(): Promise<ApiResponse<{ url?: string }>> {
    try {
      const { data, error } = await insforge.auth.signInWithOAuth('google', {
        redirectTo: window.location.origin + '/'
      });
      if (error) throw error;
      return { data: data || null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to sign in with Google' } };
    }
  },

  async signOut(): Promise<ApiResponse<void>> {
    try {
      const { error } = await insforge.auth.signOut();
      if (error) throw error;
      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to sign out' } };
    }
  },

  async getSession(): Promise<ApiResponse<{ user: AuthUser; accessToken: string | null }>> {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error) throw error;
      
      const token = await (insforge as any).getValidAccessToken().catch(() => null);
      
      return {
        data: data && data.user ? {
          user: {
            id: data.user.id,
            email: data.user.email || '',
            name: (data.user.profile as any)?.name || null,
            created_at: data.user.createdAt || new Date().toISOString(),
          },
          accessToken: token,
        } : null,
        error: null,
      };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to get session' } };
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data } = await insforge.auth.getCurrentUser();
      if (data && data.user) {
        return {
          id: data.user.id,
          email: data.user.email || '',
          name: (data.user.profile as any)?.name || null,
          created_at: data.user.createdAt || new Date().toISOString(),
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  onAuthStateChange(callback: (event: string, user: AuthUser | null) => void): () => void {
    return insforge.auth.onAuthStateChange(async (event) => {
      const user = await this.getCurrentUser();
      callback(event as string, user);
    });
  }
};
