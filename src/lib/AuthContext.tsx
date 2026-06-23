import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

type AuthContextType = {
  user: any | null;
  session: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setSession(null);
      setUser(null);
    }
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user) {
        // Map user properties so that metadata is easy to access matching the existing code expectations
        const mappedUser = {
          ...initialSession.user,
          uid: initialSession.user.id,
          displayName: initialSession.user.user_metadata?.display_name || initialSession.user.user_metadata?.full_name || initialSession.user.email?.split('@')[0],
          photoURL: initialSession.user.user_metadata?.avatar_url || '',
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching Supabase session:', err);
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      console.log('Supabase auth state changes:', _event, currentSession);
      setSession(currentSession);
      if (currentSession?.user) {
        const mappedUser = {
          ...currentSession.user,
          uid: currentSession.user.id,
          displayName: currentSession.user.user_metadata?.display_name || currentSession.user.user_metadata?.full_name || currentSession.user.email?.split('@')[0],
          photoURL: currentSession.user.user_metadata?.avatar_url || '',
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
