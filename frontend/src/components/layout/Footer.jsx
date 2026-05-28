import React from 'react';
import { Link } from 'react-router-dom';
import { Scan, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const links = {
        product: [
            { label: 'Features', path: '/features' },
            { label: 'Pricing', path: '/pricing' },
            { label: 'How It Works', path: '/how-it-works' },
        ],
        resources: [
            { label: 'FAQ', path: '/faq' },
            { label: 'Help Center', path: '/help' },
            { label: 'API Docs', path: '/api-docs' },
        ],
        legal: [
            { label: 'Terms', path: '/terms' },
            { label: 'Privacy', path: '/privacy' },
        ]
    };

    return (
        <footer className="relative z-10 bg-black/40 border-t border-white/5 py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-600 rounded-lg">
                                <Scan className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                VeriFace
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
                            Advanced AI forensics to detect Deepfakes and AI-generated imagery with state-of-the-art precision.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
                                <Github size={18} />
                            </a>
                            <a href="#" className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Product</h4>
                        <ul className="space-y-4">
                            {links.product.map(link => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Resources</h4>
                        <ul className="space-y-4">
                            {links.resources.map(link => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Newsletter</h4>
                        <p className="text-gray-400 text-sm mb-4">Subscribe for AI security updates.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                            />
                            <button className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">
                                <Mail size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-xs">
                        © {currentYear} VeriFace AI. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        {links.legal.map(link => (
                            <Link key={link.path} to={link.path} className="text-gray-500 hover:text-white text-xs transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
