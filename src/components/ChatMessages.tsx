"use client";

import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import TipCard from './TipCard';

interface Message {
  text: string;
  sender: 'user' | 'agent';
  type?: 'thinking' | 'plan';
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTip, setShowTip] = useState(true);
  
  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Показываем подсказку только если нет сообщений от пользователя
  useEffect(() => {
    if (messages.some(msg => msg.sender === 'user')) {
      setShowTip(false);
    } else {
      setShowTip(true);
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6 bg-gray-50 dark:bg-[#1C1F21]">
      {/* Показываем TipCard, если нет сообщений или есть только сообщения от агента */}
      {showTip && (messages.length === 0 || messages.every(msg => msg.sender === 'agent')) && (
        <TipCard 
          title="Совет" 
          content="Опишите цель, которую вы хотите достичь, и StartAI поможет вам составить план действий."
        />
      )}
      
      {/* Показываем сообщение, если нет сообщений */}
      {messages.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          Начните разговор, отправив сообщение ниже.
        </div>
      )}
      
      {messages.map((msg, i) => (
        <div key={i} className="mb-4 md:mb-6 fade-in">
          {/* Аватар и имя отправителя */}
          <div className="flex items-center mb-2">
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center mr-2 ${
              msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-500 dark:bg-gray-600'
            }`}>
              {msg.sender === 'user' ? 'Вы' : 'S'}
            </div>
            <div className="font-medium text-gray-700 dark:text-gray-300 text-sm md:text-base">
              {msg.sender === 'user' ? 'Вы' : 'StartAI'}
            </div>
          </div>
          
          {/* Содержимое сообщения */}
          <div className="pl-9 md:pl-10">
            {msg.sender === 'user' ? (
              <div className="text-gray-800 dark:text-gray-100 text-sm md:text-base">{msg.text}</div>
            ) : (
              <div className="prose dark:prose-invert max-w-none text-sm md:text-base">
                {/* Добавляем заголовок для "thinking" или "plan" */}
                {msg.type === 'thinking' && (
                  <h3 className="text-gray-600 dark:text-gray-400 font-semibold mb-1 md:mb-2 text-sm md:text-base">Анализ:</h3>
                )}
                {msg.type === 'plan' && (
                  <h3 className="text-gray-600 dark:text-gray-400 font-semibold mb-1 md:mb-2 text-sm md:text-base">План:</h3>
                )}
                <ReactMarkdown 
                  components={{
                    p: ({children}) => <p className="mb-2">{children}</p>,
                    h1: ({children}) => <h1 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">{children}</h1>,
                    h2: ({children}) => <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{children}</h2>,
                    h3: ({children}) => <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2">{children}</h3>,
                    ul: ({children}) => <ul className="list-disc pl-4 md:pl-5 mb-2">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-4 md:pl-5 mb-2">{children}</ol>,
                    li: ({children}) => <li className="mb-1">{children}</li>,
                    code: ({children}) => (
                      <code className="bg-gray-200 dark:bg-gray-800 rounded px-1 py-0.5 text-xs md:text-sm">{children}</code>
                    ),
                    pre: ({children}) => (
                      <pre className="bg-gray-200 dark:bg-gray-800 rounded p-2 md:p-3 mb-2 overflow-x-auto text-xs md:text-sm">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Индикатор загрузки "Thinking..." */}
      {isLoading && (
        <div className="mb-4 md:mb-6 fade-in">
          <div className="flex items-center mb-2">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center mr-2 bg-gray-500 dark:bg-gray-600">
              S
            </div>
            <div className="font-medium text-gray-700 dark:text-gray-300 text-sm md:text-base">
              StartAI
            </div>
          </div>
          <div className="pl-9 md:pl-10">
            <div className="flex items-center">
              <span className="text-gray-600 dark:text-gray-400 font-semibold mr-1 text-sm md:text-base">Thinking</span>
              <div className="loading-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}