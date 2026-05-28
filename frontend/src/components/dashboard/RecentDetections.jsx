import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ShieldAlert, ShieldCheck, ChevronRight } from 'lucide-react';

export default function RecentDetections() {
    const detections = [
        {
            id: '1',
            filename: 'profile_001.jpg',
            prediction: 'REAL',
            confidence: 98.2,
            time: '2 mins ago',
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            icon: <ShieldCheck size={16} />
        },
        {
            id: '2',
            filename: 'interview_clip.mp4',
            prediction: 'DEEPFAKE',
            confidence: 94.7,
            time: '1 hour ago',
            color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
            icon: <ShieldAlert size={16} />
        },
        {
            id: '3',
            filename: 'generated_face.png',
            prediction: 'AI_GENERATED',
            confidence: 89.1,
            time: '3 hours ago',
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            icon: <Shield size={16} />
        },
        {
            id: '4',
            filename: 'passport_scan.pdf',
            prediction: 'REAL',
            confidence: 99.8,
            time: '5 hours ago',
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            icon: <ShieldCheck size={16} />
        }
    ];

    return (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white tracking-tight">Recent Activity</h3>
                <Link to="/history" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors">
                    View All <ChevronRight size={14} />
                </Link>
            </div>

            <div className="divide-y divide-white/5">
                {detections.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-white/5 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{item.filename}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.color}`}>
                                        {item.prediction.replace('_', ' ')}
                                    </span>
                                    <span className="text-[10px] text-gray-500">{item.time}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-white">{item.confidence}%</p>
                                <p className="text-[10px] text-gray-500">Confidence</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
