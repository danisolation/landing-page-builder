'use client';

import { useState, useEffect } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

// Global toast state
let addToastFn: ((message: string, type: Toast['type']) => void) | null = null;

export function showToast(message: string, type: Toast['type'] = 'success') {
  if (addToastFn) {
    addToastFn(message, type);
  }
}

export default function ToastNotification() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastFn = (message: string, type: Toast['type']) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      // Tự động xóa sau 3 giây
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    return () => {
      addToastFn = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm animate-slide-in ${
            toast.type === 'success'
              ? 'bg-green-500'
              : toast.type === 'error'
              ? 'bg-red-500'
              : 'bg-yellow-500'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
