'use client';

import { useId, useRef, useState } from 'react';

export interface FieldHintProps {
  text: string;
}

/**
 * Help hint that works on hover, focus AND tap (mobile) — the tooltip
 * wraps instead of clipping off-screen.
 */
export default function FieldHint({ text }: FieldHintProps) {
  const [show, setShow] = useState(false);
  const id = useId();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showHint = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow(true);
  };

  const hideHint = () => {
    timerRef.current = setTimeout(() => setShow(false), 120);
  };

  return (
    <span className="relative inline-flex items-center ml-1.5">
      <button
        type="button"
        className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold select-none hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-help"
        aria-label={text}
        aria-describedby={show ? id : undefined}
        onMouseEnter={showHint}
        onMouseLeave={hideHint}
        onFocus={showHint}
        onBlur={hideHint}
        onClick={(e) => {
          e.preventDefault();
          setShow((s) => !s);
        }}
      >
        ?
      </button>
      {show && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[9999] w-max max-w-[240px] px-3 py-2 text-xs text-popover-foreground bg-popover border border-border rounded-lg shadow-lg text-left normal-case"
        >
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-border" />
        </span>
      )}
    </span>
  );
}
