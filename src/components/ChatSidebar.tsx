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
    
    // Если историй нет, создаем новый чат
    if (chats.length === 0) {
      startNewChat();
    }
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
    <div className="w-64 border-r border-gray-700 flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-700">
        <button 
          className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2"
          onClick={startNewChat}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Новый чат
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        {chatHistory.map((chat) => (
          <button
            key={chat.id}
            className={`w-full p-4 text-left hover:bg-gray-700 text-gray-300 flex flex-col gap-1 relative group ${
              currentChatId === chat.id ? 'bg-gray-700' : ''
            }`}
            onClick={() => selectChat(chat.id)}
          >
            <span className="truncate">{chat.title}</span>
            <span className="text-sm text-gray-500">{formatDate(chat.created_at)}</span>
            
            {/* Кнопка удаления (появляется при наведении) */}
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
              onClick={(e) => handleDeleteChat(chat.id, e)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </button>
        ))}
      </div>

      {/* User Info and Logout */}
      <div className="p-4 border-t border-gray-700 mt-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-400 truncate">
            {userEmail}
          </div>
        </div>
        <button 
          onClick={signOut}
          className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Выйти
        </button>
      </div>
    </div>
  );
} 