import React from 'react';
import { TrendingUp, TrendingDown, Clock, ShieldCheck, Activity } from 'lucide-react';

export default function StatsCards() {
    const stats = [
        {
            label: 'Total Detections',
            value: '1,284',
            change: '+12.5%',
            isPositive: true,
            icon: <Activity className="w-5 h-5" />,
            color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
        },
        {
            label: 'Monthly Usage',
            value: '84%',
            change: '+5.2%',
            isPositive: true,
            icon: <Clock className="w-5 h-5" />,
            color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        },
        {
            label: 'Avg. Confidence',
            value: '96.4%',
            change: '-0.8%',
            isPositive: false,
            icon: <ShieldCheck className="w-5 h-5" />,
            color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        },
        {
            label: 'Threats Detected',
            value: '243',
            change: '+18.3%',
            isPositive: true,
            icon: <Activity className="w-5 h-5" />,
            color: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all hover-lift"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-bold ${stat.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {stat.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {stat.change}
                        </div>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.label}</h3>
                    <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                </div>
            ))}
        </div>
    );
}
