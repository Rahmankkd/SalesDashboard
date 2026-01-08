'use client';

import { Bell, Search, User } from 'lucide-react';

export function Header({ isDarkMode = false }: { isDarkMode?: boolean }) {
    return (
        <header className={`h-16 flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-md transition-colors duration-300 ${isDarkMode
                ? 'bg-transparent border-b border-white/10'
                : 'bg-white/80 border-b border-gray-100'
            }`}>
            <div className="flex items-center gap-4 w-96">
                <div className="relative w-full">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`} size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className={`w-full pl-10 pr-4 py-2 rounded-full border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all ${isDarkMode
                                ? 'bg-white/10 border-white/10 text-white placeholder-white/30 focus:bg-white/20'
                                : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'
                            }`}
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className={`relative transition-colors ${isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>
                <div className={`flex items-center gap-3 pl-6 border-l ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
                    <div className="text-right hidden sm:block">
                        <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Admin User</p>
                        <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Manager</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isDarkMode
                            ? 'bg-white/10 border-white/10 text-white'
                            : 'bg-gray-100 border-gray-200 text-gray-600'
                        }`}>
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
}
