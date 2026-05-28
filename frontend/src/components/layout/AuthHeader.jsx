import React from 'react';
import { useSelector } from 'react-redux';
import { Bell, Search, User, ChevronDown } from 'lucide-react';

export default function AuthHeader() {
    const { user } = useSelector((state) => state.auth);

    return (
        <header className="fixed top-0 right-0 left-0 md:left-auto md:w-[calc(100%-16rem)] h-16 z-30 flex items-center justify-between px-6 bg-black/20 backdrop-blur-md border-b border-white/5">
            {/* Mobile Spacer / Search Container */}
            <div className="flex-1 max-w-md hidden sm:block">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search history..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 ml-auto">
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-gray-950"></span>
                </button>

                {/* User Menu */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/5 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold">{user?.username}</p>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{user?.plan || 'Free'}</p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-105 transition-transform">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown size={14} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
            </div>
        </header>
    );
}
