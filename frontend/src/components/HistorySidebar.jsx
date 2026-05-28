import { useState, useEffect } from 'react';
import { X, Trash2, Clock, AlertTriangle, CheckCircle, FileImage, Loader2 } from 'lucide-react';
import { analysisAPI } from '../utils/api';

export default function HistorySidebar({ onClose, onSelectAnalysis, refreshTrigger }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchHistory(1, true);
    }, [refreshTrigger]); // Reload when triggered (e.g., after new analysis)

    const fetchHistory = async (pageNum, reset = false) => {
        try {
            if (reset) setLoading(true);
            setError(null);

            const data = await analysisAPI.getHistory(pageNum);

            if (reset) {
                setHistory(data.analyses || []);
            } else {
                setHistory(prev => [...prev, ...data.analyses]);
            }

            setHasMore(pageNum < data.total_pages);
            setPage(pageNum);
        } catch (err) {
            console.error("Failed to load history:", err);
            setError("Failed to load history. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this analysis?")) return;

        try {
            setDeletingId(id);
            await analysisAPI.deleteAnalysis(id);
            setHistory(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error("Failed to delete analysis:", err);
            alert("Failed to delete item.");
        } finally {
            setDeletingId(null);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchHistory(page + 1);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-fade-in"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md h-full bg-[#0a0a16] border-l border-white/10 shadow-2xl flex flex-col animate-slide-in-right"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-400" />
                        Analysis History
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {loading && history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                            <p className="text-gray-500 text-sm">Loading history...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center text-sm">
                            {error}
                            <button
                                onClick={() => fetchHistory(1, true)}
                                className="block mx-auto mt-2 text-xs underline hover:text-rose-300"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12 px-6">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-gray-400">No analysis history found.</p>
                            <p className="text-gray-600 text-sm mt-1">Upload an image to get started.</p>
                        </div>
                    ) : (
                        <>
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => onSelectAnalysis(item)}
                                    className="group relative p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${item.prediction === 'REAL'
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : 'bg-rose-500/10 text-rose-400'
                                                }`}>
                                                {item.prediction === 'REAL' ? (
                                                    <CheckCircle size={18} />
                                                ) : (
                                                    <AlertTriangle size={18} />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-200">
                                                    {item.prediction}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                    <FileImage size={12} />
                                                    <span className="truncate max-w-[120px]" title={item.image_filename}>
                                                        {item.image_filename || 'Unknown Image'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${item.prediction === 'REAL'
                                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                                                    : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                                                }`}>
                                                {item.confidence}%
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => handleDelete(e, item.id)}
                                        disabled={deletingId === item.id}
                                        className="absolute right-4 bottom-4 p-1.5 text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete Analysis"
                                    >
                                        {deletingId === item.id ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={14} />
                                        )}
                                    </button>
                                </div>
                            ))}

                            {hasMore && (
                                <button
                                    onClick={loadMore}
                                    className="w-full py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors mt-2"
                                >
                                    Load More
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
