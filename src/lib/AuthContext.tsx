import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, firebaseSignOut } from './firebase';

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
      await firebaseSignOut(auth);
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setSession(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Firebase auth state change:', firebaseUser);
      
      if (firebaseUser) {
        // Map Firebase user to Supabase-like user object to avoid breaking existing code
        const mappedUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          user_metadata: {
            display_name: firebaseUser.displayName,
            avatar_url: firebaseUser.photoURL,
          }
        };
        setUser(mappedUser);
        setSession({ user: mappedUser });
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
