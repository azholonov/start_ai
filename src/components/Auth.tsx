'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Сохраняем токен в localStorage
        if (data.session?.access_token) {
          localStorage.setItem('supabase_token', data.session.access_token);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Сохраняем токен в localStorage, если пользователь сразу авторизован
        if (data.session?.access_token) {
          localStorage.setItem('supabase_token', data.session.access_token);
        }
        
        setMessage('Проверьте вашу почту для подтверждения регистрации!');
      }
    } catch (error: any) {
      setMessage(error.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md p-6 md:p-8 space-y-6 md:space-y-8 bg-card rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {isLogin ? 'Вход в StartAI' : 'Регистрация в StartAI'}
          </h1>
        </div>

        {message && (
          <div className="p-3 md:p-4 mb-4 text-sm text-white bg-primary rounded-lg">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 md:space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-foreground bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-foreground bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-white bg-primary hover:bg-primary-hover rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:text-primary-hover transition-colors"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
          </button>
        </div>
      </div>
    </div>
  );
} 