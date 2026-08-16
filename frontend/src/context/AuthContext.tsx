import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser, LoginResponse } from '../types/institution';
import { institutionApi } from '../services/institutionApi';

interface AuthContextType {
  authToken: string | null;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (authData: LoginResponse) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('edusal_auth_token') || null;
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('edusal_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  useEffect(() => {
    // Keep localStorage in sync
    if (authToken && currentUser) {
      localStorage.setItem('edusal_auth_token', authToken);
      localStorage.setItem('edusal_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('edusal_auth_token');
      localStorage.removeItem('edusal_auth_user');
    }
  }, [authToken, currentUser]);

  const login = (authData: LoginResponse) => {
    setAuthToken(authData.token);
    setCurrentUser(authData.user);
    localStorage.setItem('edusal_auth_token', authData.token);
    localStorage.setItem('edusal_auth_user', JSON.stringify(authData.user));
  };

  const logout = async () => {
    setIsLoadingAuth(true);
    try {
      if (authToken) {
        await institutionApi.logout(authToken).catch(() => {});
      }
    } finally {
      setAuthToken(null);
      setCurrentUser(null);
      localStorage.removeItem('edusal_auth_token');
      localStorage.removeItem('edusal_auth_user');
      setIsLoadingAuth(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        currentUser,
        isAuthenticated: Boolean(authToken && currentUser),
        isLoadingAuth,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
