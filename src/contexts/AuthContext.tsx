'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  token: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  token: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка токена из localStorage при инициализации
  useEffect(() => {
    const storedToken = localStorage.getItem('supabase_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Сохраняем токен при изменении состояния авторизации
        if (session?.access_token) {
          setToken(session.access_token);
          localStorage.setItem('supabase_token', session.access_token);
        } else if (event === 'SIGNED_OUT') {
          setToken(null);
          localStorage.removeItem('supabase_token');
        }
        
        setLoading(false);
      }
    );

    // Получаем текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Сохраняем токен при получении сессии
      if (session?.access_token) {
        setToken(session.access_token);
        localStorage.setItem('supabase_token', session.access_token);
      }
      
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase_token');
    setToken(null);
  };

  const value = {
    session,
    user,
    loading,
    token,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 