'use client';

import { useState } from 'react';
import ImageUpload from './ImageUpload';

interface AdvancedComposerProps {
  referenceImages: string[];
  onReferenceAdd: (image: string) => void;
  onReferenceRemove: (index: number) => void;
  outputImage?: string | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export default function AdvancedComposer({
  referenceImages,
  onReferenceAdd,
  onReferenceRemove,
  outputImage,
  isLoading = false,
  error = null,
  onRetry,
  isRetrying = false,
}: AdvancedComposerProps) {
  const maxReferences = 3;
  const canAddMore = referenceImages.length < maxReferences;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 space-y-6 overflow-y-auto">
      {/* Reference Images Section */}
      <div className="w-full max-w-4xl space-y-6">
        <h3 className="text-lg font-semibold text-white/90 mb-4">Reference Images</h3>
        
        <div className="space-y-6">
          {/* Existing Reference Images */}
          {referenceImages.map((image, index) => (
            <div key={index} className="relative">
              {/* Branch Line (visual connector) */}
              {index < referenceImages.length - 1 && (
                <div className="absolute left-1/2 top-full w-px h-6 bg-gradient-to-b from-white/30 to-transparent transform -translate-x-1/2" />
              )}
              
              <div className="relative">
                <ImageUpload
                  currentImage={image}
                  onImageUpload={() => {}} // Already uploaded
                  onImageRemove={() => onReferenceRemove(index)}
                />
                <div className="mt-2 text-center text-sm text-white/60">
                  Reference {index + 1}
                </div>
              </div>
            </div>
          ))}

          {/* Add Reference Button */}
          {canAddMore && (
            <div className="relative">
              {/* Branch Line from previous reference */}
              {referenceImages.length > 0 && (
                <div className="absolute left-1/2 -top-6 w-px h-6 bg-gradient-to-b from-transparent to-white/30 transform -translate-x-1/2" />
              )}
              
              <ImageUpload
                onImageUpload={onReferenceAdd}
                maxSizeMB={10}
              />
            </div>
          )}

          {/* Max References Message */}
          {!canAddMore && (
            <div className="text-center text-sm text-white/50 py-4">
              Maximum {maxReferences} reference images reached
            </div>
          )}
        </div>
      </div>

      {/* Merge Indicator */}
      {referenceImages.length > 0 && (
        <div className="flex flex-col items-center space-y-2">
          <div className="w-px h-8 bg-gradient-to-b from-white/30 via-white/20 to-transparent" />
          <div className="px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm font-medium">
            Merging {referenceImages.length} reference{referenceImages.length > 1 ? 's' : ''}...
          </div>
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-white/30" />
        </div>
      )}

      {/* Output Preview */}
      <div className="w-full max-w-4xl space-y-4">
        <h3 className="text-lg font-semibold text-white/90">Output</h3>
        
        {isLoading ? (
          <div className="w-full aspect-square rounded-lg border-2 border-white/20 bg-black/20 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white/80">Composing design...</p>
            </div>
          </div>
        ) : error && !outputImage ? (
          <div className="w-full aspect-square rounded-lg border-2 border-red-500/30 bg-red-500/10 flex items-center justify-center p-6">
            <div className="text-center space-y-4 max-w-md">
              <div className="text-4xl">⚠️</div>
              <p className="text-white/90 font-medium">Generation Failed</p>
              <p className="text-white/70 text-sm">{error}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  disabled={isRetrying}
                  className={`mt-4 px-6 py-2 rounded-lg font-medium transition-all ${
                    isRetrying
                      ? 'bg-white/10 text-white/40 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  }`}
                >
                  {isRetrying ? 'Retrying...' : 'Retry'}
                </button>
              )}
            </div>
          </div>
        ) : outputImage && outputImage.startsWith('data:image/') ? (
          <div className="relative w-full aspect-square rounded-lg border-2 border-purple-500/50 bg-black/20 overflow-hidden shadow-2xl">
            <img
              src={outputImage}
              alt="Composed jewelry design"
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-full aspect-square rounded-lg border-2 border-dashed border-white/20 bg-black/10 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">✨</div>
              <p className="text-white/60">Output will appear here</p>
              <p className="text-white/40 text-sm">
                Add reference images and generate to see the result
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

