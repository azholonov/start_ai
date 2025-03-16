'use client';

import ThemeToggle from './ThemeToggle';

interface ChatHeaderProps {
  toggleSidebar: () => void;
}

export default function ChatHeader({ toggleSidebar }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1C1F21] sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={toggleSidebar}
          aria-label="Переключить боковую панель"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="text-xl font-semibold text-gray-800 dark:text-white">StartAI</div>
      </div>
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <button 
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Поделиться"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>
    </div>
  );
} 