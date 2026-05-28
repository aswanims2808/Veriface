import React, { useState } from 'react';
import { Scan, Loader2, AlertCircle } from 'lucide-react';
import Upload from '../components/Upload';
import Results from '../components/Results';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { analysisAPI } from '../utils/api';

export default function DetectPage() {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [resetKey, setResetKey] = useState(0);

    const handleImageSelect = (imgData) => {
        setImage(imgData);
        setResult(null);
        setError(null);
    };

    const handleReset = () => {
        setImage(null);
        setResult(null);
        setError(null);
        setLoading(false);
        setResetKey(prev => prev + 1);
    };

    const analyzeImage = async () => {
        if (!image) return;
        setLoading(true);
        setError(null);

        try {
            const data = await analysisAPI.predict(image.file);
            setResult(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to analyze image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <Breadcrumbs />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Detect Image</h1>
                <p className="text-gray-400">Upload a single image for deep forensic analysis.</p>
            </div>

            <div className="flex flex-col items-center">
                <div className="w-full relative">
                    <Upload key={resetKey} onImageSelect={handleImageSelect} />

                    {image && !result && !loading && (
                        <div className="mt-8 flex justify-center animate-slide-up">
                            <button
                                onClick={analyzeImage}
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                            >
                                <Scan size={20} />
                                Analyze Authenticity
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="mt-12 flex flex-col items-center animate-fade-in text-center">
                            <div className="relative w-64 h-2 rounded-full bg-white/10 overflow-hidden mb-6">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-shimmer" />
                            </div>
                            <p className="text-indigo-400 font-medium animate-pulse">Running neural network forensics...</p>
                            <p className="text-xs text-gray-500 mt-2">Checking for GAN artifacts and noise patterns</p>
                        </div>
                    )}

                    {error && !result && (
                        <div className="mt-8 mx-auto p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl max-w-md flex items-center gap-3 animate-slide-up">
                            <AlertCircle size={20} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                </div>

                {result && (
                    <div className="w-full mt-12 animate-fade-in">
                        <Results data={result} />
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={handleReset}
                                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm transition-colors"
                            >
                                Analyze Another Image
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
