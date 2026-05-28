import React from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import AuthHeader from './AuthHeader';
import ToastContainer from '../common/Toast';

export function AuthenticatedLayout({ children }) {
    const { sidebarOpen } = useSelector((state) => state.ui);

    return (
        <div className="min-h-screen bg-gray-950">
            <Sidebar />
            <div className={`transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
                <AuthHeader />
                <main className="pt-20 px-4 pb-12 min-h-screen relative z-10">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
            <ToastContainer />
        </div>
    );
}

import PublicHeader from './PublicHeader';
import Footer from './Footer';

export function PublicLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col">
            <PublicHeader />
            <main className="flex-1 pt-16 relative z-10">
                {children}
            </main>
            <Footer />
            <ToastContainer />
        </div>
    );
}
