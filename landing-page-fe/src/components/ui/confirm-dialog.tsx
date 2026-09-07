'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('common');
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
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

  const handleCancel = useCallback(() => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    setDialog((prev) => {
      prev.onConfirm();
      return { ...prev, isOpen: false };
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
        return;
      }
      if (e.key !== 'Tab') return;

      // Focus trap — cycle Tab within the dialog
      const container = dialogRef.current;
      if (!container) return;
      const focusables = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [handleCancel]
  );

  // Focus the dialog on open + restore focus to the trigger on close
  useEffect(() => {
    if (dialog.isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      dialogRef.current?.focus();
    } else if (previouslyFocusedRef.current) {
      previouslyFocusedRef.current.focus();
      previouslyFocusedRef.current = null;
    }
  }, [dialog.isOpen]);

  if (!dialog.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="relative bg-card rounded-lg shadow-xl max-w-md w-full mx-4 p-6 outline-none"
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold mb-2">{dialog.title}</h2>
        <p id="confirm-dialog-message" className="text-muted-foreground mb-6">{dialog.message}</p>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {t('confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
