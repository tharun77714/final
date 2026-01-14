'use client';

import { useState } from 'react';

interface PromptBarProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  isLoading?: boolean;
  hasImage?: boolean; // If true, show "Regenerate" instead of "Generate"
  buttonText?: string; // Custom button text (Generate/Edit/Regenerate)
}

export default function PromptBar({
  prompt,
  onPromptChange,
  onGenerate,
  isLoading = false,
  hasImage = false,
  buttonText,
}: PromptBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && prompt.trim()) {
        onGenerate();
      }
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Describe your jewelry design... (Ctrl+Enter to generate)"
              rows={2}
              className={`w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder:text-white/40 border transition-all resize-none focus:outline-none ${
                isFocused
                  ? 'border-purple-500 ring-2 ring-purple-500/50'
                  : 'border-white/20'
              }`}
              disabled={isLoading}
            />
            {prompt.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-white/50">
                {prompt.length} chars
              </div>
            )}
          </div>
          <button
            onClick={onGenerate}
            disabled={isLoading || !prompt.trim()}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isLoading || !prompt.trim()
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : buttonText ? (
              buttonText
            ) : hasImage ? (
              'Regenerate'
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


