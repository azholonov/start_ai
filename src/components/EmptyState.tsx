'use client';

import { useState, useRef, useEffect } from 'react';

interface EmptyStateProps {
  onCreateNewChat?: () => void;
  onSendMessage?: (message: string) => void;
}

export default function EmptyState({ onCreateNewChat, onSendMessage }: EmptyStateProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Автоматический фокус на поле ввода при загрузке компонента
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSendMessage = () => {
    if (!input.trim() || isLoading || !onSendMessage) return;
    
    setIsLoading(true);
    onSendMessage(input);
    setInput('');
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 md:w-10 md:h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-200 mb-2">Начните новый разговор</h2>
      <p className="text-gray-400 text-sm md:text-base max-w-md mb-6">
        Опишите цель, которую вы хотите достичь, и StartAI поможет вам составить план действий.
      </p>
      
      {/* Поле ввода для отправки сообщения */}
      <div className="w-full max-w-lg mb-8">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Опишите вашу цель..."
            className="w-full p-4 pr-16 rounded-lg bg-gray-700 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            rows={3}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className={`absolute right-4 bottom-4 p-2 rounded-md ${
              isLoading || !input.trim() ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
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
      
      <h3 className="text-lg font-medium text-gray-300 mb-3">Примеры запросов:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
        <div 
          className="bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer hover:bg-gray-750"
          onClick={() => onSendMessage && onSendMessage("Помогите мне составить бизнес-план для моего стартапа")}
        >
          <h3 className="font-medium text-gray-200 mb-1">Бизнес-план</h3>
          <p className="text-gray-400 text-sm">Помогу составить план для вашего бизнеса</p>
        </div>
        <div 
          className="bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer hover:bg-gray-750"
          onClick={() => onSendMessage && onSendMessage("Помогите мне достичь моих личных целей по саморазвитию")}
        >
          <h3 className="font-medium text-gray-200 mb-1">Личные цели</h3>
          <p className="text-gray-400 text-sm">Помогу спланировать достижение личных целей</p>
        </div>
        <div 
          className="bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer hover:bg-gray-750"
          onClick={() => onSendMessage && onSendMessage("Помогите мне составить план обучения программированию")}
        >
          <h3 className="font-medium text-gray-200 mb-1">Обучение</h3>
          <p className="text-gray-400 text-sm">Помогу составить план обучения новым навыкам</p>
        </div>
        <div 
          className="bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer hover:bg-gray-750"
          onClick={() => onSendMessage && onSendMessage("Помогите мне спланировать и организовать мой проект разработки")}
        >
          <h3 className="font-medium text-gray-200 mb-1">Проекты</h3>
          <p className="text-gray-400 text-sm">Помогу спланировать и организовать ваш проект</p>
        </div>
      </div>
    </div>
  );
} 