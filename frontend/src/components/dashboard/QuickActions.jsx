import React from 'react';
import { Link } from 'react-router-dom';
import { Scan, Layers, History, BarChart3, ArrowRight } from 'lucide-react';

export default function QuickActions() {
    const actions = [
        {
            title: 'Upload Image',
            desc: 'Single forensic analysis',
            icon: <Scan size={24} />,
            path: '/detect',
            color: 'from-indigo-600 to-indigo-700'
        },
        {
            title: 'Batch Detect',
            desc: 'Process up to 20 images',
            icon: <Layers size={24} />,
            path: '/detect/batch',
            color: 'from-purple-600 to-purple-700'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {actions.map((action, index) => (
                <Link
                    key={index}
                    to={action.path}
                    className={`relative group overflow-hidden bg-gradient-to-br ${action.color} p-8 rounded-2xl shadow-xl shadow-indigo-900/10 hover:shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-95`}
                >
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white shadow-xl">
                                {action.icon}
                            </div>
                            <div className="text-white">
                                <h3 className="text-xl font-bold tracking-tight mb-1">{action.title}</h3>
                                <p className="text-white/70 text-sm">{action.desc}</p>
                            </div>
                        </div>
                        <div className="p-2 border border-white/30 rounded-full text-white/50 group-hover:text-white group-hover:border-white transition-all transform group-hover:translate-x-1">
                            <ArrowRight size={20} />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
