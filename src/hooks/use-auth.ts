"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Mock user object
const mockUser = {
  uid: '1',
  email: 'test@example.com',
  displayName: 'Test User',
};

export function useAuth(required = true) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking auth state
    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) {
      setUser(JSON.parse(sessionUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && required && !user) {
      router.push('/');
    }
  }, [user, loading, required, router]);

  const signIn = (email, password) => {
    // In a real offline app, you might have a hardcoded credential check
    if (email === 'admin@gym.com' && password === 'admin') {
        const loggedInUser = { ...mockUser, email };
        sessionStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        router.push('/dashboard');
        return true;
    }
    return false;
  };

  const signOut = () => {
    sessionStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return { user, loading, signIn, signOut, isSubscriptionActive: true, gymOwner: mockUser };
}