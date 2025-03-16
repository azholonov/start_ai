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

interface Message {
  text: string;
  sender: 'user' | 'agent';
  type?: 'thinking' | 'plan'; // New field to differentiate response types
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatType[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Загрузка сообщений текущего чата при изменении ID чата
  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
    }
  }, [currentChatId]);
  
  // Проверка URL на наличие ID чата
  useEffect(() => {
    const chatId = searchParams.get('chat');
    if (chatId) {
      setCurrentChatId(chatId);
    }
  }, [searchParams]);

  // Обработчик загрузки истории чатов из ChatSidebar
  const handleChatHistoryLoaded = (chats: ChatType[]) => {
    setChatHistory(chats);
    
    if (!currentChatId && chats.length > 0) {
      setCurrentChatId(chats[0].id);
      router.push(`/?chat=${chats[0].id}`);
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
          type: msg.type // Assuming your DB schema can store this
        }))
      );
    } else {
      setMessages([{ text: "Какой цели вы хотите достичь?", sender: 'agent' }]);
      
      if (currentChatId) {
        await addMessage(
          currentChatId,
          "Какой цели вы хотите достичь?",
          'agent'
        );
      }
    }
  };

  // Создание нового чата
  const startNewChat = async () => {
    const newChat = await createChat("Новый чат");
    
    if (newChat) {
      setChatHistory(prev => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
      router.push(`/?chat=${newChat.id}`);
      
      setMessages([{ text: "Какой цели вы хотите достичь?", sender: 'agent' }]);
      setInput('');
      
      await addMessage(
        newChat.id,
        "Какой цели вы хотите достичь?",
        'agent'
      );
    }
  };

  // Отправка сообщения
  const sendMessage = async () => {
    if (!input.trim() || isLoading || !currentChatId) return;

    setIsLoading(true);
    
    if (messages.length === 1 && messages[0].sender === 'agent') {
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
    } finally {
      setIsLoading(false);
    }
  };

  // Выбор чата из истории
  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    router.push(`/?chat=${chatId}`);
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
            startNewChat();
          }
        }
      }
    }
  };

  // Переключение боковой панели
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[#1C1F21]">
      {isSidebarOpen && (
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
      )}

      <div className="flex-1 flex flex-col">
        <ChatHeader toggleSidebar={toggleSidebar} />
        <ChatMessages messages={messages} />
        <ChatInput 
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          isLoading={isLoading}
          currentChatId={currentChatId}
        />
      </div>
    </div>
  );
}