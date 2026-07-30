import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, restaurantService } from '@qrdine/lib';
import { AuthUser } from '@qrdine/types';

interface AuthContextType {
  user: AuthUser | null;
  restaurantId: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Restore instantly from localStorage to bypass load delay on reload
  const [user, setUser] = useState<AuthUser | null>(() => {
    const cached = localStorage.getItem('qrdine_kitchen_user');
    return cached ? JSON.parse(cached) : null;
  });
  
  const [restaurantId, setRestaurantId] = useState<string | null>(() => {
    return localStorage.getItem('qrdine_kitchen_restaurant_id');
  });

  const [loading, setLoading] = useState(() => {
    // Skip loading spinner if we already have a cached session
    return !localStorage.getItem('qrdine_kitchen_user');
  });

  const checkUserSession = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem('qrdine_kitchen_user', JSON.stringify(currentUser));
        
        // Query user mapping to see if they belong to a restaurant and have kitchen/admin roles
        const userRes = await restaurantService.getRestaurantUser(currentUser.id);
        const userRoleName = (userRes.data as any)?.role?.name?.toLowerCase();

        if (
          userRes.data && 
          (userRoleName === 'kitchen' || 
           userRoleName === 'owner' || 
           userRoleName === 'manager' || 
           userRes.data.is_owner)
        ) {
          setRestaurantId(userRes.data.restaurant_id);
          localStorage.setItem('qrdine_kitchen_restaurant_id', userRes.data.restaurant_id);
        } else {
          setRestaurantId(null);
          localStorage.removeItem('qrdine_kitchen_restaurant_id');
        }
      } else {
        setUser(null);
        setRestaurantId(null);
        localStorage.removeItem('qrdine_kitchen_user');
        localStorage.removeItem('qrdine_kitchen_restaurant_id');
      }
    } catch {
      setUser(null);
      setRestaurantId(null);
      localStorage.removeItem('qrdine_kitchen_user');
      localStorage.removeItem('qrdine_kitchen_restaurant_id');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Revalidate session in the background
    checkUserSession();

    const unsubscribe = authService.onAuthStateChange(async (event, authUser) => {
      if (authUser) {
        setUser(authUser);
        localStorage.setItem('qrdine_kitchen_user', JSON.stringify(authUser));

        const userRes = await restaurantService.getRestaurantUser(authUser.id);
        const userRoleName = (userRes.data as any)?.role?.name?.toLowerCase();

        if (
          userRes.data && 
          (userRoleName === 'kitchen' || 
           userRoleName === 'owner' || 
           userRoleName === 'manager' || 
           userRes.data.is_owner)
        ) {
          setRestaurantId(userRes.data.restaurant_id);
          localStorage.setItem('qrdine_kitchen_restaurant_id', userRes.data.restaurant_id);
        } else {
          setRestaurantId(null);
          localStorage.removeItem('qrdine_kitchen_restaurant_id');
        }
      } else {
        setUser(null);
        setRestaurantId(null);
        localStorage.removeItem('qrdine_kitchen_user');
        localStorage.removeItem('qrdine_kitchen_restaurant_id');
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    await authService.signOut();
    setUser(null);
    setRestaurantId(null);
    localStorage.removeItem('qrdine_kitchen_user');
    localStorage.removeItem('qrdine_kitchen_restaurant_id');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurantId,
        loading,
        logout,
        refreshAuth: checkUserSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
