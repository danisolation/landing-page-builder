'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

// Global confirm state
let showConfirmFn: ((title: string, message: string) => Promise<boolean>) | null = null;

export function showConfirm(title: string, message: string): Promise<boolean> {
  if (showConfirmFn) {
    return showConfirmFn(title, message);
  }
  return Promise.resolve(false);
}

export default function ConfirmDialog() {
  const [dialog, setDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    showConfirmFn = (title: string, message: string) => {
      return new Promise<boolean>((resolve) => {
        setDialog({
          isOpen: true,
          title,
          message,
          onConfirm: () => {
            setDialog((prev) => ({ ...prev, isOpen: false }));
            resolve(true);
          },
        });
      });
    };

    return () => {
      showConfirmFn = null;
    };
  }, []);

  const handleCancel = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
  };

  if (!dialog.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-semibold mb-2">{dialog.title}</h2>
        <p className="text-gray-600 mb-6">{dialog.message}</p>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={dialog.onConfirm}>
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
}
