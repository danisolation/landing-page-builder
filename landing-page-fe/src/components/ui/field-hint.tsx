'use client';

import { useId, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

export interface FieldHintProps {
  text: string;
}

/**
 * Help hint that works on hover, focus AND tap (mobile).
 *
 * Renders through a Portal to document.body so it escapes any parent
 * stacking context (overflow, transform, z-index) that would otherwise
 * clip or cover it. Position is computed from the trigger button's
 * bounding rect (in a layout effect, before paint) so it always sits
 * cleanly above the trigger — no flash of mispositioned content.
 */
export default function FieldHint({ text }: FieldHintProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const id = useId();
  const btnRef = useRef<HTMLButtonElement>(null);

  // Measure before the browser paints so the tooltip never flashes at (0,0).
  useLayoutEffect(() => {
    if (!show || !btnRef.current) {
      setPos(null);
      return;
    }
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top: rect.top - 8, // 8px gap above the button
      left: rect.left + rect.width / 2,
    });
  }, [show]);

  return (
    <span className="inline-flex items-center ml-1.5">
      <button
        ref={btnRef}
        type="button"
        className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold select-none hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-help"
        aria-label={text}
        aria-describedby={show && pos ? id : undefined}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onClick={(e) => {
          e.preventDefault();
          setShow((s) => !s);
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
            className="fixed z-[9999] w-max max-w-[240px] px-3 py-2 text-xs text-popover-foreground bg-popover border border-border rounded-lg shadow-lg text-left normal-case pointer-events-none"
            style={{
              top: pos.top,
              left: pos.left,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {text}
            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-border" />
          </span>,
          document.body,
        )}
    </span>
  );
}
