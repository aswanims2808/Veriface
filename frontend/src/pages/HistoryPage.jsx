import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Download, ExternalLink, Grid, List as ListIcon, History, Shield, ShieldCheck, ShieldAlert, AlertCircle, FileStack, Image } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { Skeleton } from '../components/common/Skeleton';
import { analysisAPI } from '../utils/api';
import { Link } from 'react-router-dom';

export default function HistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await analysisAPI.getHistory();
                // Fix: data is { analyses: [], total: ... }
                setHistory(data.analyses || []);
            } catch (err) {
                console.error('Failed to fetch history:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filteredHistory = history.filter(item =>
        item.image_filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.prediction?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            <Breadcrumbs />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Detection History</h1>
                    <p className="text-gray-400">Manage and review all your forensic analyses.</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                        <Grid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                        <ListIcon size={20} />
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="glass-panel p-4 rounded-xl border border-white/5 mb-8 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by filename or result..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    />
                </div>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Filter size={16} /> Filters
                </button>
                <button className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Trash2 size={16} /> Clear All
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass-panel p-6 rounded-2xl h-48 animate-pulse" />
                    ))}
                </div>
            ) : filteredHistory.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-2xl border border-dashed border-white/10">
                    <History size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No history found</h3>
                    <p className="text-gray-400 mb-6">You haven't performed any analyses yet.</p>
                    <Link to="/detect" className="btn-primary inline-flex">
                        Start Your First Detection
                    </Link>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHistory.map((item) => (
                        <Link
                            key={item.id}
                            to={`/results/${item.id}`}
                            className="glass-panel group hover:border-indigo-500/30 transition-all rounded-2xl overflow-hidden"
                        >
                            <div className="aspect-video bg-white/5 overflow-hidden flex items-center justify-center relative">
                                {item.status === 'Failed' ? (
                                    <div className="text-rose-500 flex flex-col items-center gap-2">
                                        <AlertCircle size={40} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Failed Analysis</span>
                                    </div>
                                ) : item.stored_filename ? (
                                    <img
                                        src={`http://localhost:5000/uploads/${item.stored_filename}`}
                                        alt={item.image_filename}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                                            if (placeholder) placeholder.style.display = 'flex';
                                        }}
                                    />
                                ) : null}

                                <div className={`image-placeholder flex flex-col items-center gap-2 text-gray-700 ${item.status !== 'Failed' && item.stored_filename ? 'hidden' : 'flex'}`}>
                                    <History size={40} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Analysis Result</span>
                                </div>

                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md flex items-center gap-1 ${item.detection_type === 'Batch' ? 'text-indigo-400' : 'text-purple-400'}`}>
                                        {item.detection_type === 'Batch' ? <FileStack size={10} /> : <Image size={10} />}
                                        {item.detection_type || 'Single'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-white font-bold truncate pr-4">{item.image_filename}</h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${item.prediction === 'REAL' ? 'bg-emerald-500/10 text-emerald-400' :
                                        item.prediction === 'DEEPFAKE' ? 'bg-rose-500/10 text-rose-400' :
                                            item.prediction === 'AI-GENERATED' ? 'bg-indigo-500/10 text-indigo-400' :
                                                'bg-amber-500/10 text-amber-400'
                                        }`}>
                                        {item.prediction}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</span>
                                    <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-sm">
                                        {item.status === 'Failed' ? (
                                            <span className="text-rose-400">FAILED</span>
                                        ) : (
                                            <>
                                                {item.confidence}% <Shield size={14} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs text-gray-400 uppercase">
                            <tr>
                                <th className="px-6 py-4 font-bold">File</th>
                                <th className="px-6 py-4 font-bold">Type</th>
                                <th className="px-6 py-4 font-bold">Result</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold">Date</th>
                                <th className="px-6 py-4 font-bold text-right pr-12">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-white truncate max-w-[200px]">{item.image_filename}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit ${item.detection_type === 'Batch' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                            {item.detection_type === 'Batch' ? <FileStack size={10} /> : <Image size={10} />}
                                            {item.detection_type || 'Single'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${item.prediction === 'REAL' ? 'bg-emerald-500/10 text-emerald-400' :
                                                item.prediction === 'DEEPFAKE' ? 'bg-rose-500/10 text-rose-400' :
                                                    item.prediction === 'AI-GENERATED' ? 'bg-indigo-500/10 text-indigo-400' :
                                                        'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                {item.prediction}
                                            </span>
                                            {item.status !== 'Failed' && <span className="text-xs font-bold text-indigo-400/70">{item.confidence}%</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold uppercase ${item.status === 'Failed' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {item.status || 'Completed'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-end">
                                            <Link to={`/results/${item.id}`} className="p-2 bg-indigo-600/10 text-indigo-400 rounded-lg hover:bg-indigo-600/20 transition-colors">
                                                <ExternalLink size={16} />
                                            </Link>
                                            <button className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
