"use client";

import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  text: string;
  sender: 'user' | 'agent';
  type?: 'thinking' | 'plan'; // Added type field
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean; // Добавляем новый проп для отслеживания состояния загрузки
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((msg, i) => (
        <div key={i} className="mb-6">
          {/* Аватар и имя отправителя */}
          <div className="flex items-center mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
              msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-600'
            }`}>
              {msg.sender === 'user' ? 'Вы' : 'S'}
            </div>
            <div className="font-medium text-gray-300">
              {msg.sender === 'user' ? 'Вы' : 'StartAI'}
            </div>
          </div>
          
          {/* Содержимое сообщения */}
          <div className="pl-10">
            {msg.sender === 'user' ? (
              <div className="text-gray-100">{msg.text}</div>
            ) : (
              <div className="prose prose-invert max-w-none">
                {/* Добавляем заголовок для "thinking" или "plan" */}
                {msg.type === 'thinking' && (
                  <h3 className="text-gray-400 font-semibold mb-2">Анализ:</h3>
                )}
                {msg.type === 'plan' && (
                  <h3 className="text-gray-400 font-semibold mb-2">План:</h3>
                )}
                <ReactMarkdown 
                  components={{
                    p: ({children}) => <p className="mb-2">{children}</p>,
                    h1: ({children}) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                    ul: ({children}) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
                    li: ({children}) => <li className="mb-1">{children}</li>,
                    code: ({children}) => (
                      <code className="bg-gray-800 rounded px-1 py-0.5">{children}</code>
                    ),
                    pre: ({children}) => (
                      <pre className="bg-gray-800 rounded p-3 mb-2 overflow-x-auto">
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
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-gray-600">
              S
            </div>
            <div className="font-medium text-gray-300">
              StartAI
            </div>
          </div>
          <div className="pl-10">
            <div className="flex items-center">
              <span className="text-gray-400 font-semibold mr-1">Thinking</span>
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