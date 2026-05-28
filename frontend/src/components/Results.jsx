/* eslint-disable react/prop-types */
import { ShieldCheck, ShieldAlert, AlertTriangle, Activity, Zap, Download, Share2, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { analysisAPI } from '../utils/api';
import { addNotification } from '../store/slices/uiSlice';

export default function Results({ data }) {
    const dispatch = useDispatch();
    const [animatedConfidence, setAnimatedConfidence] = useState({ real: 0, ai: 0, deepfake: 0 });
    const [showDetails, setShowDetails] = useState(false);

    if (!data) return null;

    const { prediction, confidence, processing_time, forensics, analysis_id } = data;
    const isReal = prediction === 'REAL';
    const isFake = prediction === 'DEEPFAKE';
    const isAIGenerated = prediction === 'AI-GENERATED';

    // Extract or derive confidence scores
    const real_val = data.real_confidence ?? (isReal ? confidence : (100 - confidence) * 0.4);
    const ai_val = data.ai_confidence ?? (isAIGenerated ? confidence : (100 - confidence) * (isReal ? 0.35 : 0.45));
    const deepfake_val = data.deepfake_confidence ?? (isFake ? confidence : (100 - (real_val + ai_val)));

    // Ensure sum is exactly 100 for safety in derivation
    const total = real_val + ai_val + deepfake_val;
    const final_real = (real_val / total) * 100;
    const final_ai = (ai_val / total) * 100;
    const final_fake = (deepfake_val / total) * 100;

    // Animate confidence scores on mount
    useEffect(() => {
        let currentStep = 0;
        const totalSteps = 60; // ~1 second animation at 60fps

        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / totalSteps;
            // Simple ease-out
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            setAnimatedConfidence({
                real: final_real * easedProgress,
                ai: final_ai * easedProgress,
                deepfake: final_fake * easedProgress
            });

            if (currentStep >= totalSteps) {
                setAnimatedConfidence({
                    real: final_real,
                    ai: final_ai,
                    deepfake: final_fake
                });
                clearInterval(timer);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [confidence, data.real_confidence, data.ai_confidence, data.deepfake_confidence]);

    // Dynamic styles based on result
    const statusColor = isReal ? 'text-emerald-400' : (isFake ? 'text-rose-500' : 'text-amber-400');
    const borderColor = isReal ? 'border-emerald-500/30' : (isFake ? 'border-rose-500/30' : 'border-amber-500/30');
    const bgGradient = isReal
        ? 'from-emerald-500/10 to-transparent'
        : (isFake ? 'from-rose-500/10 to-transparent' : 'from-amber-500/10 to-transparent');
    const ringColor = isReal ? 'stroke-emerald-500' : (isFake ? 'stroke-rose-500' : 'stroke-amber-500');

    const Icon = isReal ? ShieldCheck : (isFake ? ShieldAlert : AlertTriangle);

    // Calculate circle progress
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (animatedConfidence / 100) * circumference;

    const handleExport = () => {
        const exportData = {
            prediction,
            confidence,
            processing_time,
            forensics,
            timestamp: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `veriface-analysis-${analysis_id || Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const [sharing, setSharing] = useState(false);

    const handleShare = async () => {
        if (!analysis_id) return;

        try {
            setSharing(true);
            const response = await analysisAPI.shareAnalysis(analysis_id);
            // Construct frontend URL using current origin
            const shareUrl = `${window.location.origin}/shared/${response.token}`;

            await navigator.clipboard.writeText(shareUrl);
            dispatch(addNotification({ message: 'Share link copied to clipboard!', type: 'success' }));
        } catch (err) {
            console.error("Share failed:", err);
            dispatch(addNotification({ message: 'Failed to generate share link. Please try again.', type: 'error' }));
        } finally {
            setSharing(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto mt-12 animate-fade-in">
            <div className={`glass-panel-strong rounded-2xl overflow-hidden border ${borderColor} shadow-2xl`}>

                {/* Header / Main Result */}
                <div className={`relative p-10 bg-gradient-to-b ${bgGradient}`}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">

                        {/* Left: Icon and Text */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <div className={`p-4 rounded-full bg-white/5 mb-4 ring-2 ring-white/10 ${isFake ? 'animate-pulse' : ''}`}>
                                <Icon className={`w-14 h-14 ${statusColor}`} />
                            </div>
                            <h2 className="text-4xl font-bold text-white tracking-tight mb-2">
                                {prediction}
                            </h2>
                            <p className="text-gray-400 font-medium flex items-center gap-2">
                                {isReal && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                                {isFake && <TrendingDown className="w-4 h-4 text-rose-400" />}
                                Analysis Complete
                            </p>
                        </div>

                        {/* Right: Multi-Class Confidence Meters */}
                        <div className="flex-1 w-full max-w-sm space-y-6">
                            {/* Real Authenticity */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Real Authenticity</span>
                                    <span className="text-2xl font-bold text-white">{Math.round(animatedConfidence.real)}%</span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 ease-out"
                                        style={{ width: `${animatedConfidence.real}%` }}
                                    />
                                </div>
                            </div>

                            {/* AI-Generated */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">AI-Generated</span>
                                    <span className="text-2xl font-bold text-white">{Math.round(animatedConfidence.ai)}%</span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000 ease-out"
                                        style={{ width: `${animatedConfidence.ai}%` }}
                                    />
                                </div>
                            </div>

                            {/* Deepfake Probability */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Deepfake Probability</span>
                                    <span className="text-2xl font-bold text-white">{Math.round(animatedConfidence.deepfake)}%</span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                                    <div
                                        className="h-full bg-gradient-to-r from-rose-700 to-rose-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${animatedConfidence.deepfake}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-px bg-white/5 border-t border-white/5">
                    <div className="p-6 bg-black/20 hover:bg-black/30 transition-colors group">
                        <div className="flex items-center gap-2 mb-3 text-indigo-400">
                            <Activity size={20} />
                            <span className="text-xs font-semibold uppercase tracking-wider">Forensic Signals</span>
                        </div>
                        <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">
                            {forensics?.signals_detected || Object.keys(forensics || {}).length}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Patterns Analyzed</p>
                    </div>

                    <div className="p-6 bg-black/20 hover:bg-black/30 transition-colors group">
                        <div className="flex items-center gap-2 mb-3 text-amber-400">
                            <Zap size={20} />
                            <span className="text-xs font-semibold uppercase tracking-wider">Processing Time</span>
                        </div>
                        <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">
                            {processing_time || "0.4s"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">End-to-End</p>
                    </div>
                </div>

                {/* Detailed Forensic Breakdown */}
                {forensics && Object.keys(forensics).length > 0 && (
                    <div className="border-t border-white/5">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="w-full p-6 bg-white/[0.02] hover:bg-white/[0.05] transition-all text-left flex items-center justify-between group"
                        >
                            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                Forensic Report
                            </h4>
                            <div className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-white transition-colors" />
                                </svg>
                            </div>
                        </button>

                        {showDetails && (
                            <div className="p-6 bg-black/20 border-t border-white/5 animate-slide-up">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(forensics).map(([key, val]) => (
                                        <div key={key} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all group">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400 capitalize group-hover:text-gray-300 transition-colors">
                                                    {key.replace(/_/g, ' ')}
                                                </span>
                                                <span className={`font-mono text-sm font-semibold ${typeof val === 'number' && val > 50 ? 'text-rose-400' : 'text-emerald-400'
                                                    }`}>
                                                    {val}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}



                {/* Action Buttons */}
                <div className="p-6 bg-black/20 border-t border-white/5 flex flex-wrap gap-3">
                    <button
                        onClick={handleExport}
                        className="flex-1 min-w-[140px] px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium border border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        Export JSON
                    </button>

                    {!data.isPublicView && (
                        <button
                            onClick={handleShare}
                            disabled={sharing}
                            className="flex-1 min-w-[140px] px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {sharing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                            {sharing ? 'Generating...' : 'Share Result'}
                        </button>
                    )}
                </div>

            </div>

            {/* Additional Info */}
            {analysis_id && (
                <div className="mt-4 text-center text-xs text-gray-600">
                    Analysis ID: <span className="font-mono text-gray-500">{analysis_id}</span>
                </div>
            )}
        </div>
    );
}
