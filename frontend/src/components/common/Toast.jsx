import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../../store/slices/uiSlice';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function ToastContainer() {
    const notifications = useSelector((state) => state.ui.notifications);
    const dispatch = useDispatch();

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
            {notifications.map((notification) => (
                <Toast
                    key={notification.id}
                    notification={notification}
                    onClose={() => dispatch(removeNotification(notification.id))}
                />
            ))}
        </div>
    );
}

function Toast({ notification, onClose }) {
    const { message, type, autoClose } = notification;

    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [autoClose, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
        error: <AlertCircle className="w-5 h-5 text-rose-400" />,
        info: <Info className="w-5 h-5 text-indigo-400" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    };

    const colors = {
        success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100',
        error: 'border-rose-500/20 bg-rose-500/10 text-rose-100',
        info: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-100',
        warning: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
    };

    return (
        <div className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl animate-slide-in-right ${colors[type] || colors.info}`}>
            {icons[type] || icons.info}
            <p className="text-sm font-medium">{message}</p>
            <button
                onClick={onClose}
                className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
}
