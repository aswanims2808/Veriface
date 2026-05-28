import React, { useState } from 'react';
import { User, Bell, Shield, Key, CreditCard, Save, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { addNotification } from '../store/slices/uiSlice';

export default function SettingsPage() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('profile');
    const [showApiKey, setShowApiKey] = useState(false);
    const [apiKey] = useState('vf_live_51Msz8S9C2x7vXk6vY7z8A9B0C1D2E3F4G5H6');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <User size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
        { id: 'api', label: 'API Access', icon: <Key size={18} /> },
        { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    ];

    const handleSave = () => {
        dispatch(addNotification({ message: 'Settings saved successfully!', type: 'success' }));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        dispatch(addNotification({ message: 'API key copied to clipboard', type: 'info' }));
    };

    return (
        <div className="animate-fade-in pb-20">
            <Breadcrumbs />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Account Settings</h1>
                <p className="text-gray-400">Manage your profile, security, and application preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="lg:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1">
                    <div className="glass-panel p-8 rounded-2xl border border-white/5">
                        {activeTab === 'profile' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <button className="absolute -bottom-2 -right-2 p-2 bg-gray-900 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all shadow-lg">
                                            <Save size={14} />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{user?.username}</h3>
                                        <p className="text-gray-400 text-sm">Personal Account • {user?.plan || 'Free'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Username</label>
                                        <input
                                            type="text"
                                            defaultValue={user?.username}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                                        <input
                                            type="email"
                                            defaultValue={user?.email || 'user@example.com'}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="col-span-full space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Bio / Purpose</label>
                                        <textarea
                                            rows="3"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none"
                                            placeholder="e.g. OSINT Investigator"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-white">Change Password</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Current Password</label>
                                            <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">New Password</label>
                                            <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Confirm Password</label>
                                            <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none" />
                                        </div>
                                    </div>
                                    <button className="btn-primary w-fit px-8">Update Password</button>
                                </div>

                                <div className="pt-8 border-t border-white/5">
                                    <h3 className="text-lg font-bold text-rose-400 mb-2">Delete Account</h3>
                                    <p className="text-sm text-gray-400 mb-6">Permanently delete your account and all detection history.</p>
                                    <button className="px-6 py-2 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-xl text-sm font-bold transition-all">
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'api' && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">Your API Key</h3>
                                    <p className="text-sm text-gray-400 mb-6">Use this key to authenticate with the VeriFace Cloud API.</p>

                                    <div className="relative group">
                                        <input
                                            type={showApiKey ? "text" : "password"}
                                            value={apiKey}
                                            readOnly
                                            className="w-full bg-gray-950 border border-white/10 rounded-xl py-4 pl-4 pr-32 font-mono text-sm text-indigo-400 tracking-wider"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                            <button
                                                onClick={() => setShowApiKey(!showApiKey)}
                                                className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all"
                                            >
                                                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(apiKey)}
                                                className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all"
                                            >
                                                <Copy size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-2xl">
                                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                        <Check className="text-indigo-400" size={18} />
                                        API Documentation
                                    </h4>
                                    <p className="text-sm text-gray-400 mb-4">Integrate VeriFace into your own workflows with our high-performance REST API.</p>
                                    <button className="text-sm font-bold text-indigo-400 hover:underline">Read API Docs →</button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="mt-12 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    className="btn-primary px-12"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}

                        {activeTab === 'billing' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-2xl shadow-xl shadow-indigo-600/10 text-white relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Current Plan</p>
                                        <h3 className="text-3xl font-bold mb-6">Professional Plan</h3>
                                        <div className="flex items-end gap-2 mb-8">
                                            <span className="text-5xl font-extrabold">$29</span>
                                            <span className="text-xl opacity-70 font-medium pb-2">/ month</span>
                                        </div>
                                        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-2 rounded-lg font-bold text-sm transition-all border border-white/20">
                                            Manage Subscription
                                        </button>
                                    </div>
                                    {/* Decorative background circle */}
                                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                                </div>

                                <h4 className="text-white font-bold mb-4">Subscription Includes</h4>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        'Up to 5,000 detections/mo',
                                        'Priority GPU processing',
                                        'Advanced batch forensics',
                                        'Bulk history export',
                                        'Direct email support',
                                        'API access included'
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                                            <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <Check size={12} />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
