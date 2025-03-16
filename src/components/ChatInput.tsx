'use client';

import { useRef, useEffect } from 'react';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  sendMessage: () => void;
  isLoading: boolean;
  currentChatId: string | null;
  messagesCount: number;
}

export default function ChatInput({
  input,
  setInput,
  sendMessage,
  isLoading,
  currentChatId,
  messagesCount
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Автоматическое изменение высоты текстового поля
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);
  
  // Автоматический фокус на поле ввода при загрузке компонента
  useEffect(() => {
    if (textareaRef.current && !isLoading && currentChatId) {
      textareaRef.current.focus();
    }
  }, [isLoading, currentChatId]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Изменяем placeholder в зависимости от количества сообщений
  const placeholder = messagesCount === 0 
    ? "Опишите вашу цель..." 
    : "Отправьте сообщение...";

  return (
    <div className="border-t border-gray-700 p-3 md:p-6 sticky bottom-0 bg-[#1C1F21]">
      <div className="max-w-4xl mx-auto relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full p-3 pr-14 rounded-lg bg-gray-700 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] max-h-[150px]"
          rows={1}
          disabled={!currentChatId || isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !currentChatId || !input.trim()}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-md ${
            isLoading || !currentChatId || !input.trim() ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition-colors`}
          aria-label="Отправить сообщение"
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
} 