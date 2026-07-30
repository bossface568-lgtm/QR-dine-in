import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, restaurantService, branchService } from '@qrdine/lib';
import { AuthUser, Restaurant, Branch } from '@qrdine/types';

interface AuthContextType {
  user: AuthUser | null;
  restaurantId: string | null;
  restaurant: Restaurant | null;
  branches: Branch[];
  currentBranch: Branch | null;
  setCurrentBranchId: (id: string) => void;
  loading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const cached = localStorage.getItem('qrdine_user');
    return cached ? JSON.parse(cached) : null;
  });

  const [restaurantId, setRestaurantId] = useState<string | null>(() => {
    return localStorage.getItem('qrdine_restaurant_id');
  });

  const [restaurant, setRestaurant] = useState<Restaurant | null>(() => {
    const cached = localStorage.getItem('qrdine_restaurant');
    return cached ? JSON.parse(cached) : null;
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    const cached = localStorage.getItem('qrdine_branches');
    return cached ? JSON.parse(cached) : [];
  });

  const [currentBranchId, setCurrentBranchIdState] = useState<string | null>(() => {
    return localStorage.getItem('qrdine_current_branch_id');
  });

  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('qrdine_user');
  });

  const setCurrentBranchId = (id: string) => {
    setCurrentBranchIdState(id);
    localStorage.setItem('qrdine_current_branch_id', id);
  };

  /** Clear only restaurant-related cache. User stays logged in. */
  const clearRestaurantCache = () => {
    setRestaurantId(null);
    setRestaurant(null);
    setBranches([]);
    setCurrentBranchIdState(null);
    localStorage.removeItem('qrdine_restaurant_id');
    localStorage.removeItem('qrdine_restaurant');
    localStorage.removeItem('qrdine_branches');
    localStorage.removeItem('qrdine_current_branch_id');
  };

  /** Clear everything — user is truly signed out. */
  const clearAllCache = () => {
    setUser(null);
    clearRestaurantCache();
    localStorage.removeItem('qrdine_user');
  };

  const loadRestaurantData = async (userId: string) => {
    try {
      const userRes = await restaurantService.getRestaurantUser(userId);
      console.log('[AuthContext] Restaurant mapping result:', userRes);

      if (userRes.data) {
        const resId = userRes.data.restaurant_id;
        setRestaurantId(resId);
        localStorage.setItem('qrdine_restaurant_id', resId);

        const [restaurantRes, branchesRes] = await Promise.all([
          restaurantService.getRestaurant(resId),
          branchService.getBranches(resId, false) // filter non-archived
        ]);

        if (restaurantRes.data) {
          setRestaurant(restaurantRes.data);
          localStorage.setItem('qrdine_restaurant', JSON.stringify(restaurantRes.data));
        }

        if (branchesRes.data) {
          const activeList = branchesRes.data.filter((b: Branch) => !b.is_archived);
          setBranches(activeList);
          localStorage.setItem('qrdine_branches', JSON.stringify(activeList));
          if (activeList.length > 0) {
            const hasValid = activeList.some((b: Branch) => b.id === currentBranchId);
            if (!currentBranchId || !hasValid) {
              const defaultB = activeList.find((b: Branch) => b.is_default) || activeList[0];
              setCurrentBranchId(defaultB.id);
            }
          }
        }
      } else {
        // User is authenticated but has no restaurant yet → needs onboarding.
        // IMPORTANT: Do NOT clear the user session here.
        console.log('[AuthContext] No restaurant mapping — user needs onboarding.');
        clearRestaurantCache();
      }
    } catch (err) {
      // Database query failed (table might not exist, RLS error, etc.).
      // Keep user logged in — just clear restaurant state.
      console.warn('[AuthContext] Failed to load restaurant data:', err);
      clearRestaurantCache();
    }
  };

  const checkUserSession = async () => {
    try {
      console.log('[AuthContext] checkUserSession — URL:', window.location.href);

      // Log whether OAuth callback params are present (SDK handles exchange automatically)
      const urlParams = new URLSearchParams(window.location.search);
      const hasOAuthCode = urlParams.has('insforge_code') || urlParams.has('code');
      if (hasOAuthCode) {
        console.log('[AuthContext] OAuth callback params detected. SDK exchanging automatically...');
      }

      // getCurrentUser() automatically waits for any pending OAuth callback exchange.
      const currentUser = await authService.getCurrentUser();
      console.log('[AuthContext] getCurrentUser result:', currentUser);

      // Clean OAuth params from URL after SDK has processed them
      if (hasOAuthCode) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem('qrdine_user', JSON.stringify(currentUser));
        await loadRestaurantData(currentUser.id);
      } else {
        console.log('[AuthContext] No authenticated session.');
        clearAllCache();
      }
    } catch (err) {
      console.error('[AuthContext] checkUserSession error:', err);
      clearAllCache();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();

    const unsubscribe = authService.onAuthStateChange(async (event, authUser) => {
      console.log('[AuthContext] onAuthStateChange:', event, authUser?.email);
      if (authUser) {
        setUser(authUser);
        localStorage.setItem('qrdine_user', JSON.stringify(authUser));
        await loadRestaurantData(authUser.id);
      } else {
        clearAllCache();
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    await authService.signOut();
    clearAllCache();
  };

  const currentBranch = branches.find(b => b.id === currentBranchId) || branches[0] || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurantId,
        restaurant,
        branches,
        currentBranch,
        setCurrentBranchId,
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
