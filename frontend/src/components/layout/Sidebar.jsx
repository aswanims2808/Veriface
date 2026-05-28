import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    LayoutDashboard,
    Scan,
    Layers,
    History,
    BarChart3,
    Settings,
    HelpCircle,
    LogOut,
    ChevronLeft,
    ChevronRight,
    User
} from 'lucide-react';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';

export default function Sidebar() {
    const { sidebarOpen } = useSelector((state) => state.ui);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <Scan size={20} />, label: 'Detect Image', path: '/detect' },
        { icon: <Layers size={20} />, label: 'Batch Detect', path: '/detect/batch' },
        { icon: <History size={20} />, label: 'History', path: '/history' },
        { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/analytics' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'
                }`}
        >
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <div className="p-1.5 bg-indigo-600 rounded-lg flex-shrink-0">
                    <Scan className="w-5 h-5 text-white" />
                </div>
                {sidebarOpen && (
                    <span className="ml-3 text-xl font-bold tracking-tight text-gradient animate-fade-in">
                        VeriFace
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto scrollbar-none">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
              ${isActive
                                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
            `}
                    >
                        <div className="flex-shrink-0">{item.icon}</div>
                        {sidebarOpen && <span className="font-medium animate-fade-in">{item.label}</span>}
                        {!sidebarOpen && (
                            <div className="absolute left-20 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Sidebar Toggle */}
            <button
                onClick={() => dispatch(toggleSidebar())}
                className="absolute -right-3 top-20 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform hidden md:flex"
            >
                {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            {/* Footer / User */}
            <div className="p-4 border-t border-white/5 space-y-2">
                <NavLink
                    to="/help"
                    className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                >
                    <HelpCircle size={20} />
                    {sidebarOpen && <span className="text-sm">Help Center</span>}
                </NavLink>

                <div className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${sidebarOpen ? 'bg-white/5' : ''}`}>
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                        {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-lg object-cover" /> : <User size={20} />}
                    </div>
                    {sidebarOpen && (
                        <div className="flex-1 min-w-0 animate-fade-in">
                            <p className="text-sm font-semibold truncate">{user?.username || 'User'}</p>
                            <p className="text-xs text-indigo-400 truncate capitalize">{user?.plan || 'Free Plan'}</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
