'use client';

import { useId, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface FieldHintProps {
  text: string;
}

const TOOLTIP_MAX_W = 240;
const GAP = 8;

/**
 * Help hint that works on hover and tap (mobile).
 *
 * Renders through a Portal to document.body so it escapes any parent
 * stacking context (overflow, transform, z-index) that would otherwise
 * clip or cover it. Position is measured synchronously in the trigger
 * handler (no flash) and clamped to the viewport so it never overflows
 * the screen edges. Flips below the button if there's no room above.
 *
 * Note: intentionally NOT shown on focus — dialogs auto-focus their
 * first focusable element on open, which would otherwise pop an
 * unwanted tooltip. Hover (desktop) and tap (mobile) cover all use cases.
 */
export default function FieldHint({ text }: FieldHintProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    below: boolean;
  } | null>(null);
  const id = useId();
  const btnRef = useRef<HTMLButtonElement>(null);

  const open = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    // Center horizontally on the button.
    let left = rect.left + rect.width / 2;
    const halfW = TOOLTIP_MAX_W / 2;
    left = Math.max(halfW + 4, Math.min(left, window.innerWidth - halfW - 4));

    // Prefer above; flip below if not enough room.
    const spaceAbove = rect.top;
    const below = spaceAbove < 60;
    const top = below ? rect.bottom + GAP : rect.top - GAP;

    setPos({ top, left, below });
    setShow(true);
  }, []);

  const close = useCallback(() => setShow(false), []);

  return (
    <span className="inline-flex items-center ml-1.5">
      <button
        ref={btnRef}
        type="button"
        tabIndex={-1}
        className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold select-none hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-help"
        aria-label={text}
        aria-describedby={show && pos ? id : undefined}
        onMouseEnter={open}
        onMouseLeave={close}
        onClick={(e) => {
          e.preventDefault();
          if (show) close();
          else open();
        }}
      >
        ?
      </button>
      {show &&
        pos &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            className="fixed z-[9999] w-max px-3 py-2 text-xs text-popover-foreground bg-popover border border-border rounded-lg shadow-lg text-left normal-case pointer-events-none"
            style={{
              maxWidth: TOOLTIP_MAX_W,
              top: pos.top,
              left: pos.left,
              transform: pos.below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
            }}
          >
            {text}
          </span>,
          document.body,
        )}
    </span>
  );
}
