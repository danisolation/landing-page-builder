"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface InlineTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  tag?: "span" | "div" | "h1" | "h2" | "h3" | "h4" | "p";
  /**
   * false → renders the plain tag (public pages, previews).
   * true → click-to-edit in the visual canvas.
   */
  editing?: boolean;
}

export default function InlineTextEditor({
  value,
  onChange,
  placeholder = "Click to edit...",
  className,
  multiline = false,
  tag = "span",
  editing = false,
}: InlineTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
    if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
  };

  if (!editing) {
    const TagComponent = tag;
    return <TagComponent className={className}>{value}</TagComponent>;
  }

  if (isEditing) {
    const InputComponent = multiline ? "textarea" : "input";

    return (
      <InputComponent
        ref={inputRef as never}
        value={editValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "bg-transparent border-b-2 border-blue-500 outline-none focus:bg-blue-50/50 dark:focus:bg-blue-950/50 rounded px-1 -mx-1 w-full",
          multiline && "resize-none min-h-[60px]",
          className
        )}
      />
    );
  }

  const TagComponent = tag;

  return (
    <TagComponent
      onClick={handleClick}
      className={cn(
        "cursor-text hover:bg-blue-50/30 dark:hover:bg-blue-950/30 rounded px-1 -mx-1 transition-colors",
        !value && "text-muted-foreground italic",
        className
      )}
      title="Click to edit"
    >
      {value || placeholder}
    </TagComponent>
  );
}
