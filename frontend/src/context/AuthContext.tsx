"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession, signOut } from "next-auth/react";

interface AuthUser {
  id?: number;
  name?: string;
  email?: string;
  weight?: number | null;
  pace?: number | null;
  onboardingCompleted?: boolean;
  [key: string]: unknown;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: AuthUser | null;
  login: (token: string, userData?: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user && !user.onboardingCompleted && pathname !== "/onboarding") {
      router.push("/onboarding");
    }
  }, [user, pathname, router]);

  useEffect(() => {
    const loadAuthState = async () => {
      // Prefer NextAuth session (Google)
      const session = await getSession();
      if (session?.user) {
        // Store backend token if available from OAuth flow
        const backendToken = (session as any).backendToken;
        const backendUser = (session as any).backendUser;
        
        if (backendToken) {
          localStorage.setItem("token", backendToken);
          if (backendUser) {
            localStorage.setItem("user", JSON.stringify(backendUser));
            setUser(backendUser);
          } else {
            setUser(session.user as AuthUser);
          }
        } else {
          setUser(session.user as AuthUser);
        }
        setIsLoggedIn(true);
        return;
      }

      // Fallback to legacy email/password token
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (token) {
        setIsLoggedIn(true);
        // Optimistically set from local storage
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        // Verify and refresh user data from backend
        try {
          const res = await fetch("http://localhost:3001/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const freshUser = await res.json();
            setUser(freshUser);
            localStorage.setItem("user", JSON.stringify(freshUser));
          } else {
            // Token invalid
            logout();
          }
        } catch (e) {
          console.error("Failed to refresh user session", e);
        }
      }
    };

    loadAuthState();
    
    // Refresh auth state when page becomes visible (e.g., after OAuth redirect)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadAuthState();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also check periodically for session updates (e.g., after OAuth callback)
    const interval = setInterval(loadAuthState, 2000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  const login = (token: string, userData?: AuthUser) => {
    localStorage.setItem("token", token);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    // Sign out NextAuth session if present
    signOut({ callbackUrl: "/" });
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
