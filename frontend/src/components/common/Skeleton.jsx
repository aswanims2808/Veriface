import React from 'react';

export function Skeleton({ className, variant = 'rect' }) {
    const baseClasses = "animate-pulse bg-white/5";
    const variantClasses = {
        rect: "rounded-lg",
        circle: "rounded-full",
        text: "rounded h-4 w-full",
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
    );
}

export function CardSkeleton() {
    return (
        <div className="glass-panel p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-white/5">
            <Skeleton className="w-12 h-12 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="w-24 h-8" />
        </div>
    );
}
