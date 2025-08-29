"use client";

import { createContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';


export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== '/') {
      router.push('/');
    }
  }, [isAuthenticated, loading, router, pathname]);

  const signIn = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const loggedInUser = await res.json();
        setUser(loggedInUser);
        setIsAuthenticated(true);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error signing in:', error);
      return false;
    }
  };

  const signUp = async (email, password) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, admin_id: user.id }),
      });
      return res.ok;
    } catch (error) {
      console.error('Error signing up:', error);
      return false;
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, oldPassword, newPassword }),
      });
      return res.ok;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      setUser(null);
      setIsAuthenticated(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, isSubscriptionActive, signIn, signOut, signUp, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}
