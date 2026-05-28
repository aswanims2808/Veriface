/* eslint-disable react/prop-types */
import { UploadCloud, Image as ImageIcon, X, FileCheck, AlertCircle, ZoomIn } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';

export default function Upload({ onImageSelect }) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState(null);
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState('');
    const [error, setError] = useState('');
    const [isZoomed, setIsZoomed] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const processFile = (file) => {
        setError('');

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (JPG, PNG, WEBP)');
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setError('File size must be less than 10MB');
            return;
        }

        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            setFileName(file.name);
            setFileSize(formatFileSize(file.size));
            // Send both file and preview URL to parent
            onImageSelect({ file, preview: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const clearImage = (e) => {
        e.stopPropagation();
        setPreview(null);
        setFileName('');
        setFileSize('');
        setError('');
        setIsZoomed(false);
        onImageSelect(null);
    };

    // Handle Esc key to close zoom
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isZoomed) {
                setIsZoomed(false);
            }
        };

        if (isZoomed) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isZoomed]);

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                className={`relative group rounded-2xl border-2 border-dashed transition-all duration-500 ease-out overflow-hidden
          ${isDragging
                        ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02] shadow-lg shadow-indigo-500/20'
                        : preview
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'
                    }
          ${preview ? 'min-h-[500px]' : 'h-80'}
        `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleChange}
                    accept="image/*"
                    disabled={!!preview}
                />

                {preview ? (
                    <div className="absolute inset-0 w-full h-full flex flex-col z-20">
                        {/* Image Preview */}
                        <div className="flex-1 flex items-center justify-center p-6 relative">
                            <img
                                src={preview}
                                alt="Preview"
                                className="max-w-full max-h-full rounded-xl shadow-2xl object-contain transition-all duration-300 cursor-zoom-in hover:scale-[1.02]"
                                onClick={() => setIsZoomed(true)}
                            />

                            {/* Zoom Indicator */}
                            <div
                                className="absolute bottom-8 right-8 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg flex items-center gap-2 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/10 hover:bg-black/80"
                                onClick={() => setIsZoomed(true)}
                            >
                                <ZoomIn size={16} />
                                Click to zoom
                            </div>
                        </div>

                        {/* File Info Bar */}
                        <div className="bg-black/40 backdrop-blur-md border-t border-white/10 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                                        <FileCheck className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm truncate max-w-xs">{fileName}</p>
                                        <p className="text-gray-400 text-xs">{fileSize}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={clearImage}
                                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-all hover:scale-110 relative z-30"
                                    title="Remove image"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-8">
                        {/* Upload Icon */}
                        <div className={`p-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-6 transition-all duration-500 ${isDragging ? 'scale-110 rotate-6' : 'group-hover:scale-110 group-hover:rotate-3'
                            }`}>
                            <UploadCloud className={`w-16 h-16 transition-colors duration-300 ${isDragging ? 'text-indigo-400' : 'text-indigo-400/70 group-hover:text-indigo-400'
                                }`} />
                        </div>

                        {/* Text Content */}
                        <h3 className="text-2xl font-semibold text-white mb-2">
                            {isDragging ? 'Drop it here!' : 'Upload Image'}
                        </h3>
                        <p className="text-gray-400 text-base mb-4">
                            {isDragging ? 'Release to upload' : 'Drag & drop or click to browse'}
                        </p>

                        {/* Supported Formats */}
                        <div className="flex items-center gap-3 mt-4">
                            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <span className="text-xs text-gray-400">JPG</span>
                            </div>
                            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <span className="text-xs text-gray-400">PNG</span>
                            </div>
                            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <span className="text-xs text-gray-400">WEBP</span>
                            </div>
                        </div>

                        <p className="text-gray-600 text-xs mt-6">Maximum file size: 10MB</p>
                    </div>
                )}
            </div>

            {/* Image Zoom Lightbox Modal */}
            {isZoomed && preview && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in pointer-events-auto"
                    onClick={() => setIsZoomed(false)}
                >
                    {/* Close Button */}
                    <button
                        className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:rotate-90 z-[10000]"
                        onClick={() => setIsZoomed(false)}
                    >
                        <X size={32} />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
                        <img
                            src={preview}
                            alt="Zoomed"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-zoom-in"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-slide-up">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}
        </div>
    );
}
