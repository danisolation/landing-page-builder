'use client';

import { useState, useRef } from 'react';

export interface FieldHintProps {
  text: string;
}

export default function FieldHint({ text }: FieldHintProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLSpanElement>(null);

  const handleEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      });
    }
    setShow(true);
  };

  return (
    <>
      <span
        ref={ref}
        className="inline-flex items-center ml-1.5 cursor-help"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setShow(false)}
      >
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground text-[10px] font-bold select-none hover:bg-muted/80 transition-colors">
          ?
        </span>
      </span>
      {show && (
        <div
          className="fixed z-[9999] px-3 py-2 text-xs text-popover-foreground bg-popover border border-border rounded-lg shadow-lg whitespace-nowrap pointer-events-none -translate-x-full -translate-y-full"
          style={{ left: pos.x, top: pos.y }}
        >
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-border" />
        </div>
      )}
    </>
  );
}
