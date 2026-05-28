import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
            </div>

            <div className="relative z-10 text-center px-6">
                <h1 className="text-7xl md:text-9xl font-black mb-6 tracking-tighter text-white animate-slide-up">
                    Veri<span className="text-indigo-500">Face</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up delay-100">
                    AI Powered Forensic Image Detection
                </p>

                <div className="animate-slide-up delay-200">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all text-xl"
                    >
                        Start <ArrowRight size={24} />
                    </Link>
                </div>
            </div>

            {/* Subtle background grid */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none"></div>
        </div>
    );
}
