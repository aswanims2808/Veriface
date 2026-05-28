import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, Scan, CheckCircle2, Loader2, Download } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { addNotification } from '../store/slices/uiSlice';
import { useDispatch } from 'react-redux';
import { analysisAPI } from '../utils/api';

export default function BatchDetectPage() {
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState([]);
    const dispatch = useDispatch();

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    const onDrop = useCallback((acceptedFiles) => {
        // Calculate remaining slots
        setFiles(prevFiles => {
            if (prevFiles.length + acceptedFiles.length > 20) {
                dispatch(addNotification({ message: 'Maximum 20 files allowed for batch processing', type: 'warning' }));
                // Only take what fits
                const remainingSlots = 20 - prevFiles.length;
                if (remainingSlots <= 0) return prevFiles;
                acceptedFiles = acceptedFiles.slice(0, remainingSlots);
            }

            const newFiles = acceptedFiles.map(file => ({
                file,
                id: Math.random().toString(36).substr(2, 9),
                preview: URL.createObjectURL(file),
                status: 'pending', // pending, processing, complete, error
                result: null
            }));

            return [...prevFiles, ...newFiles];
        });
    }, [dispatch]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        maxFiles: 20,
        disabled: isProcessing || files.length >= 20
    });

    const removeFile = (id) => {
        setFiles(prev => {
            const fileToRemove = prev.find(f => f.id === id);
            if (fileToRemove) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prev.filter(f => f.id !== id);
        });
        setResults(prev => prev.filter(r => r.id !== id)); // Optional: clear result logic if needed, effectively simpler to just keep results in sync if we tracked IDs, but here results is separate. 
        // Actually, results state is just an accumulator. If we remove a file, we might want to adjust stats. 
        // However, the logic below recalculates stats based on 'files' status mainly. 
        // The 'results' array is used for counters. 
        // Let's improve stats calculation to rely on 'files' state which contains results.
    };

    const startBatchProcess = async () => {
        if (files.length === 0) return;

        setIsProcessing(true);
        // We iterate over the CURRENT files state. 
        // We can't rely on 'files' closure variable if we want to be super safe, but since we block interactions, it's fine.
        const filesToProcess = [...files];

        for (let i = 0; i < filesToProcess.length; i++) {
            const fileObj = filesToProcess[i];

            // Skip already completed
            if (fileObj.status === 'complete') continue;

            try {
                // Update status to processing
                setFiles(current =>
                    current.map(f => f.id === fileObj.id ? { ...f, status: 'processing' } : f)
                );

                // Call API
                const result = await analysisAPI.predict(fileObj.file, { type: 'Batch' });

                // Update status to complete
                setFiles(current =>
                    current.map(f => f.id === fileObj.id ? { ...f, status: 'complete', result: { ...result, timestamp: new Date().toISOString() } } : f)
                );

                // We don't necessarily need a separate 'results' array if we store result in file object.
                // But for compatibility with existing code structure let's keep logic simple.
                // Actually, relying on fileObj.result for stats is cleaner.

            } catch (err) {
                console.error('Error processing file:', fileObj.file.name, err);
                setFiles(current =>
                    current.map(f => f.id === fileObj.id ? { ...f, status: 'error' } : f)
                );
            }
        }

        setIsProcessing(false);
        dispatch(addNotification({ message: 'Batch processing completed!', type: 'success' }));
    };

    const handleExportCSV = () => {
        if (files.length === 0) return;

        const headers = ['File Name', 'File Type', 'Result Category', 'Confidence (%)', 'Status', 'Timestamp'];
        const csvContent = [
            headers.join(','),
            ...files.map(file => {
                const name = file.file.name;
                const type = file.file.type;
                const status = file.status;
                const result = file.result?.prediction || 'N/A';
                const confidence = file.result?.confidence || '0';
                const timestamp = file.result?.timestamp || new Date().toISOString();

                return [
                    `"${name}"`,
                    type,
                    result,
                    confidence,
                    status.charAt(0).toUpperCase() + status.slice(1),
                    timestamp
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `veriface_batch_results_${new Date().getTime()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Calculate stats directly from 'files' state to ensure consistency
    const stats = {
        total: files.length,
        completed: files.filter(f => f.status === 'complete').length,
        processing: files.filter(f => f.status === 'processing').length,
        errors: files.filter(f => f.status === 'error').length,
        real: files.filter(f => f.status === 'complete' && f.result?.prediction === 'REAL').length,
        ai: files.filter(f => f.status === 'complete' && f.result?.prediction === 'AI-GENERATED').length,
        deepfake: files.filter(f => f.status === 'complete' && f.result?.prediction === 'DEEPFAKE').length
    };

    return (
        <div className="animate-fade-in pb-20">
            <Breadcrumbs />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Batch Detection</h1>
                <p className="text-gray-400">Upload and analyze up to 20 images simultaneously.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left: Upload & List */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Dropzone */}
                    {!isProcessing && files.length < 20 && (
                        <div
                            {...getRootProps()}
                            className={`
                relative border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer text-center
                ${isDragActive
                                    ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                                    : 'border-white/10 hover:border-white/20 bg-white/5'}
              `}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center">
                                <div className="p-4 bg-indigo-600/20 text-indigo-400 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                                    <Upload size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {isDragActive ? 'Drop your images here' : 'Select multiple images'}
                                </h3>
                                <p className="text-gray-400 text-sm max-w-xs mx-auto">
                                    Drag and drop up to 20 images (JPG, PNG, WebP).
                                    Max 10MB per file.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 uppercase">
                                <span className="text-[10px] font-bold text-gray-400 tracking-widest">Selected Files ({files.length}/20)</span>
                                {!isProcessing && (
                                    <button
                                        onClick={() => {
                                            files.forEach(f => URL.revokeObjectURL(f.preview));
                                            setFiles([]);
                                        }}
                                        className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
                                    >
                                        CLEAR ALL
                                    </button>
                                )}
                            </div>

                            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {files.map((fileObj) => (
                                    <div key={fileObj.id} className="p-4 flex items-center gap-4 group">
                                        <div className="relative w-12 h-12 rounded-lg bg-white/5 overflow-hidden border border-white/10 flex-shrink-0">
                                            <img src={fileObj.preview} className="w-full h-full object-cover" alt={fileObj.file.name} />
                                            {fileObj.status === 'processing' && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate text-white">{fileObj.file.name}</p>
                                            <p className="text-[10px] text-gray-500 italic">{(fileObj.file.size / 1024).toFixed(0)} KB</p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {fileObj.status === 'complete' && fileObj.result && (
                                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${fileObj.result.prediction === 'REAL' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                                    }`}>
                                                    {fileObj.result.prediction}
                                                </div>
                                            )}

                                            {fileObj.status === 'error' && (
                                                <div className="text-rose-400 flex items-center gap-1">
                                                    <AlertCircle size={14} />
                                                    <span className="text-[10px] font-bold uppercase">Failed</span>
                                                </div>
                                            )}

                                            {!isProcessing && (
                                                <button
                                                    onClick={() => removeFile(fileObj.id)}
                                                    className="p-2 text-gray-500 hover:text-rose-400 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Summary & Controls */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 sticky top-24">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Scan size={20} className="text-indigo-400" />
                            Batch Summary
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Total Files</span>
                                <span className="text-white font-bold">{stats.total}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Status</span>
                                <span className={`font-bold ${stats.processing > 0 ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                    {stats.processing > 0 ? 'Processing...' : stats.completed === stats.total && stats.total > 0 ? 'Complete' : 'Pending'}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-indigo-600 h-full transition-all duration-500"
                                    style={{ width: `${(stats.completed / stats.total) * 100 || 0}%` }}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-4">
                                <div className="bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-xl text-center">
                                    <p className="text-[10px] text-emerald-500 font-bold mb-1 uppercase tracking-wider">REAL</p>
                                    <p className="text-xl font-bold text-white">{stats.real}</p>
                                </div>
                                <div className="bg-indigo-500/5 border border-indigo-500/10 p-2 rounded-xl text-center">
                                    <p className="text-[10px] text-indigo-400 font-bold mb-1 uppercase tracking-wider">AI</p>
                                    <p className="text-xl font-bold text-white">{stats.ai}</p>
                                </div>
                                <div className="bg-rose-500/5 border border-rose-500/10 p-2 rounded-xl text-center">
                                    <p className="text-[10px] text-rose-500 font-bold mb-1 uppercase tracking-wider">DEEPFAKE</p>
                                    <p className="text-xl font-bold text-white">{stats.deepfake}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={startBatchProcess}
                            disabled={isProcessing || files.length === 0 || stats.completed === stats.total}
                            className={`
                 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all
                 ${isProcessing || files.length === 0 || stats.completed === stats.total
                                    ? 'bg-white/5 text-gray-500 cursor-not-allowed shadow-none'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95'}
               `}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Processing {stats.completed + 1}/{stats.total}
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={20} />
                                    Start Batch Analysis
                                </>
                            )}
                        </button>

                        {stats.completed === stats.total && stats.total > 0 && stats.errors === 0 && (
                            <button
                                onClick={handleExportCSV}
                                className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={16} /> Export Results (CSV)
                            </button>
                        )}
                    </div>

                    {/* Analysis Results List */}
                    {files.length > 0 && (
                        <div className="glass-panel p-6 rounded-2xl border border-white/5">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                                <span>Analysis Results</span>
                                <span className="text-xs text-gray-500 font-normal">{stats.completed}/{stats.total}</span>
                            </h3>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {files.map((file) => (
                                    <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={file.preview} className="w-full h-full object-cover" alt={file.file.name} />
                                            {file.status === 'processing' && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <Loader2 size={12} className="text-white animate-spin" />
                                                </div>
                                            )}
                                            {file.status === 'error' && (
                                                <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                                                    <AlertCircle size={12} className="text-rose-500" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-white truncate mb-0.5">{file.file.name}</p>
                                            <div className="flex items-center justify-between">
                                                {file.status === 'pending' && <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Pending</span>}
                                                {file.status === 'processing' && <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider animate-pulse">Processing...</span>}
                                                {file.status === 'complete' && file.result && (
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${file.result.prediction === 'REAL' ? 'text-emerald-400' : 'text-rose-400'
                                                        }`}>
                                                        {file.result.prediction}
                                                        <span className="opacity-75 ml-1">
                                                            {file.result.confidence ? `${file.result.confidence}%` : ''}
                                                        </span>
                                                    </span>
                                                )}
                                                {file.status === 'error' && <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">Failed</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="glass-panel p-6 rounded-2xl border border-white/5 border-dashed">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Tips</h4>
                        <ul className="text-[11px] text-gray-400 space-y-2 list-disc pl-4 leading-relaxed">
                            <li>Process up to 20 files at a time for optimal performance.</li>
                            <li>Batch analysis uses the latest EfficientNet-B4 forensics model.</li>
                            <li>All results are automatically saved to your history.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
