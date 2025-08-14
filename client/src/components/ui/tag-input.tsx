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
          disabled={maxTags && value.length >= maxTags}
        />
        <Button
          type="button"
          onClick={addTag}
          disabled={!inputValue.trim() || (maxTags && value.length >= maxTags)}
          size="sm"
        >
          Add
        </Button>
      </div>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="p-0.5 hover:bg-primary/20 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {maxTags && (
        <p className="text-xs text-gray-500">
          {value.length}/{maxTags} {maxTags === 1 ? 'item' : 'items'} selected
        </p>
      )}
    </div>
  );
}