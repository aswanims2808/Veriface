import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const data = [
    { name: 'Mon', detections: 45 },
    { name: 'Tue', detections: 52 },
    { name: 'Wed', detections: 38 },
    { name: 'Thu', detections: 65 },
    { name: 'Fri', detections: 48 },
    { name: 'Sat', detections: 24 },
    { name: 'Sun', detections: 31 },
];

export default function UsageChart() {
    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Detection Usage</h3>
                    <p className="text-xs text-gray-400">Activity over the last 7 days</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg">
                    <button className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-md">Week</button>
                    <button className="px-3 py-1 text-xs font-semibold text-gray-400 hover:text-white transition-colors">Month</button>
                </div>
            </div>

            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(8px)',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#818cf8' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="detections"
                            stroke="#4f46e5"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorDetections)"
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
