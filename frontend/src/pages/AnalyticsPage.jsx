import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import { Download, Calendar, Filter, TrendingUp, ShieldCheck, Activity, Clock } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';

const pieData = [
    { name: 'Real', value: 65, color: '#10b981' },
    { name: 'Deepfake', value: 25, color: '#f43f5e' },
    { name: 'AI Generated', value: 10, color: '#f59e0b' },
];

const barData = [
    { range: '0-20%', count: 12 },
    { range: '20-40%', count: 18 },
    { range: '40-60%', count: 45 },
    { range: '60-80%', count: 124 },
    { range: '80-100%', count: 352 },
];

const lineData = [
    { date: '2024-01', real: 400, fake: 240 },
    { date: '2024-02', real: 300, fake: 139 },
    { date: '2024-03', real: 200, fake: 980 },
    { date: '2024-04', real: 278, fake: 390 },
    { date: '2024-05', real: 189, fake: 480 },
    { date: '2024-06', real: 239, fake: 380 },
];

export default function AnalyticsPage() {
    return (
        <div className="animate-fade-in pb-20">
            <Breadcrumbs />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Analytics Insights</h1>
                    <p className="text-gray-400">Deep dive into your forensic detection patterns and metrics.</p>
                </div>
                <button className="btn-secondary text-sm h-fit">
                    <Download size={16} /> Export Analytics (PDF)
                </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Detection Accuracy', value: '98.2%', icon: <ShieldCheck className="text-emerald-400" />, trend: '+2.4%' },
                    { label: 'Avg. Processing Time', value: '0.82s', icon: <Clock className="text-indigo-400" />, trend: '-0.1s' },
                    { label: 'Threat Detection Rate', value: '14.5%', icon: <Activity className="text-rose-400" />, trend: '+1.2%' },
                    { label: 'Forensic Reliability', value: 'High', icon: <TrendingUp className="text-purple-400" />, trend: 'Stable' },
                ].map((stat, i) => (
                    <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/5 rounded-xl border border-white/10">{stat.icon}</div>
                            <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded">{stat.trend}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Pie Chart: Detection Breakdown */}
                <div className="glass-panel p-8 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-8">Detection Breakdown</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart: Confidence Distribution */}
                <div className="glass-panel p-8 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-8">Confidence Distribution</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Area Chart: Usage Trends */}
            <div className="glass-panel p-8 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-bold text-white">Detection Trends (Monthly)</h3>
                    <div className="flex gap-2">
                        <button className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors"><Calendar size={18} /></button>
                        <button className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors"><Filter size={18} /></button>
                    </div>
                </div>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={lineData}>
                            <defs>
                                <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorFake" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            />
                            <Area type="monotone" dataKey="real" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReal)" />
                            <Area type="monotone" dataKey="fake" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorFake)" />
                            <Legend verticalAlign="top" align="right" height={36} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
