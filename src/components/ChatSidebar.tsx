'use client';

import { useState, useEffect, useRef } from 'react';
import { Chat as ChatType, getUserChats } from '@/lib/supabase';

interface ChatSidebarProps {
  currentChatId: string | null;
  startNewChat: () => void;
  selectChat: (chatId: string) => void;
  handleDeleteChat: (chatId: string, e: React.MouseEvent) => void;
  userEmail: string | undefined;
  signOut: () => void;
  user: any;
  onChatHistoryLoaded: (chats: ChatType[]) => void;
  closeSidebar: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export default function ChatSidebar({
  currentChatId,
  startNewChat,
  selectChat,
  handleDeleteChat,
  userEmail,
  signOut,
  user,
  onChatHistoryLoaded,
  closeSidebar,
  toggleTheme,
  isDarkMode
}: ChatSidebarProps) {
  const [chatHistory, setChatHistory] = useState<ChatType[]>([]);
  const hasLoadedRef = useRef(false);
  
  // Загрузка истории чатов
  useEffect(() => {
    if (user && !hasLoadedRef.current) {
      loadChatHistory();
      hasLoadedRef.current = true;
    }
  }, [user?.id]);
  
  // Загрузка истории чатов
  const loadChatHistory = async () => {
    if (!user) return;
    
    const chats = await getUserChats();
    setChatHistory(chats);
    
    // Передаем историю чатов в родительский компонент
    onChatHistoryLoaded(chats);
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-card border-r border-border">
      {/* Sidebar Header с кнопкой закрытия */}
      <div className="p-3 md:p-4 border-b border-border flex justify-between items-center">
        <div className="text-lg font-medium text-foreground">История чатов</div>
        <button 
          className="md:hidden text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white p-1 rounded-md"
          onClick={closeSidebar}
          aria-label="Закрыть сайдбар"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 p-4 text-sm">
            Нет истории чатов
          </div>
        ) : (
          chatHistory.map((chat) => (
            <button
              key={chat.id}
              className={`w-full p-3 md:p-4 text-left hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground flex flex-col gap-1 relative group ${
                currentChatId === chat.id ? 'bg-gray-200 dark:bg-gray-700' : ''
              }`}
              onClick={() => selectChat(chat.id)}
            >
              <span className="truncate text-sm md:text-base">{chat.title}</span>
              <span className="text-xs md:text-sm text-gray-500">{formatDate(chat.created_at)}</span>
              
              {/* Кнопка удаления (появляется при наведении) */}
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 p-1"
                onClick={(e) => handleDeleteChat(chat.id, e)}
                aria-label="Удалить чат"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </button>
          ))
        )}
      </div>

      {/* User Info and Logout */}
      <div className="p-3 md:p-4 border-t border-border mt-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
            {userEmail}
          </div>
        </div>
        
        {/* Контейнер для кнопок с разделителем */}
        <div className="flex items-center justify-between">
          {/* Кнопка смены темы (перемещена из хедера) */}
          <button 
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={toggleTheme}
            aria-label="Переключить тему"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          {/* Разделитель (спейсер) */}
          <div className="flex-grow"></div>
          
          {/* Кнопка выхода в виде иконки */}
          <button 
            onClick={signOut}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Выйти"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 