import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export function TagInput({ value, onChange, placeholder, maxTags, className }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim()) && (!maxTags || value.length < maxTags)) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={!!(maxTags && value.length >= maxTags)}
        />
        <Button
          type="button"
          onClick={addTag}
          disabled={!inputValue.trim() || !!(maxTags && value.length >= maxTags)}
          size="sm"
        >
          Add
        </Button>
      </div>
      
      {maxTags && (
        <p className="text-xs text-gray-500">
          {value.length}/{maxTags} {maxTags === 1 ? 'item' : 'items'} selected
        </p>
      )}
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-x-0.5 rounded-md bg-aura-200 px-2 py-1 text-xs font-medium text-aura-600">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="group relative -mr-1 size-3.5 rounded-xs hover:bg-aura-400/20">
                <span className="sr-only">Remove</span>
                <svg viewBox="0 0 14 14" className="size-3.5 stroke-aura-400 group-hover:stroke-aura-600">
                  <path d="M4 4l6 6m0-6l-6 6" />
                </svg>
                <span className="absolute -inset-1" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}