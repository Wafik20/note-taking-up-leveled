import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Here you might want to verify the token with a backend endpoint
      // For simplicity, we'll just assume the user is logged in if a token exists.
      // A better approach would be to have a /api/auth/me endpoint to get user info.
      setUser({ loggedIn: true }); 
    }
    setLoading(false);
  }, []);

  const signUp = async (data) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || 'An unknown error occurred.');
      } catch (e) {
        throw new Error(errorText || 'An unknown error occurred.');
      }
    }
    return response.json();
  };

  const signIn = async (data) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || 'An unknown error occurred.');
      } catch (e) {
        throw new Error(errorText || 'An unknown error occurred.');
      }
    }

    const { session } = await response.json();
    if (session && session.access_token) {
      localStorage.setItem('token', session.access_token);
      setUser({ loggedIn: true });
      router.push('/notes');
    } else {
      console.error("AuthContext: No access_token in session");
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const value = {
    signUp,
    signIn,
    signOut,
    user,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
