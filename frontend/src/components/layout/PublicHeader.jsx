import React from 'react';
import { Link } from 'react-router-dom';
import { Scan, Menu, X, LayoutDashboard } from 'lucide-react';

export default function PublicHeader() {
    const [isOpen, setIsOpen] = React.useState(false);

    const navLinks = [
        { label: 'Features', path: '/features' },
        { label: 'Pricing', path: '/pricing' },
        { label: 'How It Works', path: '/how-it-works' },
        { label: 'About', path: '/about' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                        <Scan className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">
                        VeriFace
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                        <Link to="/dashboard" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                            <LayoutDashboard size={16} />
                            Dashboard
                        </Link>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-gray-400 hover:text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav */}
            <div
                className={`md:hidden absolute top-16 left-0 right-0 bg-gray-950 border-b border-white/5 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 py-6' : 'max-h-0 py-0'
                    }`}
            >
                <div className="flex flex-col gap-4 px-6">
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="text-lg font-medium text-gray-400"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-3 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold justify-center"
                            onClick={() => setIsOpen(false)}
                        >
                            <LayoutDashboard size={20} />
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
