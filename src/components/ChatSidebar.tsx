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
}

export default function ChatSidebar({
  currentChatId,
  startNewChat,
  selectChat,
  handleDeleteChat,
  userEmail,
  signOut,
  user,
  onChatHistoryLoaded
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
    <div className="w-full h-full flex flex-col bg-card">
      {/* Sidebar Header */}
      <div className="p-3 md:p-4 border-b border-border">
        <button 
          className="w-full py-2 px-3 md:px-4 bg-primary hover:bg-primary-hover text-white rounded-lg flex items-center justify-center gap-2 text-sm md:text-base"
          onClick={startNewChat}
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Новый чат
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
        <button 
          onClick={signOut}
          className="w-full py-2 px-3 md:px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-lg flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Выйти
        </button>
      </div>
    </div>
  );
} 