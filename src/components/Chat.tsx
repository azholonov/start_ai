"use client";

// components/Chat.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  createChat, 
  getChatMessages, 
  addMessage, 
  updateChatTitle,
  deleteChat,
  Chat as ChatType,
  Message as MessageType,
  getChatById
} from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import EmptyState from './EmptyState';

interface Message {
  text: string;
  sender: 'user' | 'agent';
  type?: 'thinking' | 'plan';
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatType[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showEmptyState, setShowEmptyState] = useState(true);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Проверка размера экрана при загрузке
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Загрузка сообщений текущего чата при изменении ID чата
  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
      setShowEmptyState(false);
    }
  }, [currentChatId]);
  
  // Проверка URL на наличие ID чата
  useEffect(() => {
    if (searchParams) {
      const chatId = searchParams.get('chat');
      if (chatId) {
        setCurrentChatId(chatId);
      } else {
        // Если в URL нет ID чата, показываем EmptyState
        setShowEmptyState(true);
        setCurrentChatId(null);
      }
    }
  }, [searchParams]);

  // Обработчик загрузки истории чатов из ChatSidebar
  const handleChatHistoryLoaded = (chats: ChatType[]) => {
    setChatHistory(chats);
    
    // Не выбираем первый чат автоматически, всегда показываем EmptyState по умолчанию
    // if (chats.length > 0 && !currentChatId) {
    //   setCurrentChatId(chats[0].id);
    //   router.push(`/?chat=${chats[0].id}`);
    //   setShowEmptyState(false);
    // }
    
    // Всегда показываем EmptyState по умолчанию, если нет выбранного чата
    if (!currentChatId) {
      setShowEmptyState(true);
      router.push('/');
    }
  };
  
  // Загрузка сообщений чата
  const loadChatMessages = async (chatId: string) => {
    const chatMessages = await getChatMessages(chatId);
    
    if (chatMessages.length > 0) {
      setMessages(
        chatMessages.map((msg: MessageType) => ({
          text: msg.content,
          sender: msg.sender,
          type: msg.type
        }))
      );
    } else {
      setMessages([]);
    }
  };

  // Создание нового чата
  const startNewChat = async () => {
    setShowEmptyState(true);
    setCurrentChatId(null);
    router.push('/');
    setMessages([]);
    setInput('');
    
    // Закрываем сайдбар на мобильных устройствах
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Отправка сообщения из EmptyState (с созданием чата)
  const handleEmptyStateInput = async (message: string) => {
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Создаем новый чат с заголовком из первого сообщения
      const newChat = await createChat(message.substring(0, 50));
      
      if (newChat) {
        setChatHistory(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        router.push(`/?chat=${newChat.id}`);
        
        // Добавляем только сообщение пользователя
        const userMessage: Message = { text: message, sender: 'user' };
        setMessages([userMessage]);
        
        await addMessage(newChat.id, message, 'user');
        
        // Отправляем запрос к API
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message, 
              userId: user?.id,
              token: localStorage.getItem('supabase_token')
            }),
          });

          if (!response.ok) throw new Error('Ошибка сервера');

          const data: { thinking: string; plan: string } = await response.json();
          
          // Добавляем "thinking" ответ
          const thinkingMessage: Message = { 
            text: data.thinking, 
            sender: 'agent', 
            type: 'thinking' 
          };
          setMessages(prev => [...prev, thinkingMessage]);
          await addMessage(newChat.id, data.thinking, 'agent', 'thinking');

          // Добавляем "plan" ответ
          const planMessage: Message = { 
            text: data.plan, 
            sender: 'agent', 
            type: 'plan' 
          };
          setMessages(prev => [...prev, planMessage]);
          await addMessage(newChat.id, data.plan, 'agent', 'plan');
        } catch (error) {
          const errorMessage: Message = { text: 'Ошибка. Попробуйте снова.', sender: 'agent' };
          setMessages(prev => [...prev, errorMessage]);
          await addMessage(newChat.id, 'Ошибка. Попробуйте снова.', 'agent');
          console.error('Ошибка при получении ответа:', error);
        }
        
        setShowEmptyState(false);
        
        // Закрываем сайдбар на мобильных устройствах
        if (window.innerWidth < 768) {
          setIsSidebarOpen(false);
        }
      }
    } catch (error) {
      console.error('Не удалось создать новый чат:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Отправка сообщения в существующий чат
  const sendMessage = async () => {
    if (!input.trim() || isLoading || !currentChatId) return;

    setIsLoading(true);
    
    // Если это первое сообщение, обновляем заголовок чата
    if (messages.length === 0) {
      await updateChatTitle(currentChatId, input.substring(0, 50));
      const updatedChat = await getChatById(currentChatId);
      if (updatedChat) {
        setChatHistory(prev => 
          prev.map(chat => chat.id === currentChatId ? updatedChat : chat)
        );
      }
    }
    
    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    await addMessage(currentChatId, input, 'user');
    
    const currentInput = input;
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput, 
          userId: user?.id,
          token: localStorage.getItem('supabase_token')
        }),
      });

      if (!response.ok) throw new Error('Ошибка сервера');

      const data: { thinking: string; plan: string } = await response.json();
      
      // Добавляем "thinking" ответ
      const thinkingMessage: Message = { 
        text: data.thinking, 
        sender: 'agent', 
        type: 'thinking' 
      };
      setMessages(prev => [...prev, thinkingMessage]);
      await addMessage(currentChatId, data.thinking, 'agent', 'thinking');

      // Добавляем "plan" ответ
      const planMessage: Message = { 
        text: data.plan, 
        sender: 'agent', 
        type: 'plan' 
      };
      setMessages(prev => [...prev, planMessage]);
      await addMessage(currentChatId, data.plan, 'agent', 'plan');
    } catch (error) {
      const errorMessage: Message = { text: 'Ошибка. Попробуйте снова.', sender: 'agent' };
      setMessages(prev => [...prev, errorMessage]);
      await addMessage(currentChatId, 'Ошибка. Попробуйте снова.', 'agent');
      console.error('Ошибка при получении ответа:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Выбор чата из истории
  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    router.push(`/?chat=${chatId}`);
    setShowEmptyState(false);
    
    // Закрываем сайдбар на мобильных устройствах после выбора чата
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };
  
  // Удаление чата
  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm('Вы уверены, что хотите удалить этот чат?')) {
      const success = await deleteChat(chatId);
      
      if (success) {
        setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
        
        if (currentChatId === chatId) {
          const remainingChats = chatHistory.filter(chat => chat.id !== chatId);
          
          if (remainingChats.length > 0) {
            selectChat(remainingChats[0].id);
          } else {
            setCurrentChatId(null);
            setMessages([]);
            setShowEmptyState(true);
          }
        }
        
        console.log('Чат успешно удален');
      } else {
        console.error('Не удалось удалить чат');
      }
    }
  };

  // Переключение боковой панели
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[#1C1F21] dark:bg-gray-900 relative">
      {/* Затемнение фона при открытом сайдбаре на мобильных устройствах */}
      <div 
        className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      
      {/* Сайдбар */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden md:block'} w-64 border-r border-gray-700 flex flex-col mobile-sidebar ${isSidebarOpen ? 'open' : ''} md:static md:transform-none`}>
        <ChatSidebar 
          currentChatId={currentChatId}
          startNewChat={startNewChat}
          selectChat={selectChat}
          handleDeleteChat={handleDeleteChat}
          userEmail={user?.email}
          signOut={signOut}
          user={user}
          onChatHistoryLoaded={handleChatHistoryLoaded}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <ChatHeader toggleSidebar={toggleSidebar} />
        
        {/* Показываем EmptyState или чат */}
        {showEmptyState ? (
          <EmptyState 
            onSendMessage={handleEmptyStateInput}
          />
        ) : (
          <>
            <ChatMessages 
              messages={messages} 
              isLoading={isLoading}
            />
            <ChatInput 
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              isLoading={isLoading}
              currentChatId={currentChatId}
              messagesCount={messages.length}
            />
          </>
        )}
      </div>
    </div>
  );
}