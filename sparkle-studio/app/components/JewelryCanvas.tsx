'use client';

import ImageGenerationError from './ImageGenerationError';
import ImageUpload from './ImageUpload';

interface JewelryCanvasProps {
  currentImage?: string | null;
  previousImage?: string | null;
  isEditMode?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  onImageUpload?: (imageData: string) => void;
}

export default function JewelryCanvas({
  currentImage,
  previousImage,
  isEditMode = false,
  isLoading = false,
  error = null,
  onRetry,
  isRetrying = false,
  onImageUpload,
}: JewelryCanvasProps) {
  // Error state - show error UI if generation failed (MUST check first, before empty state)
  if (error && !currentImage && !isLoading) {
    return (
      <ImageGenerationError
        error={error}
        onRetry={onRetry || (() => {})}
        isRetrying={isRetrying}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black/40 to-black/60">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/80 text-lg">Creating your design...</p>
        </div>
      </div>
    );
  }

  // Empty state - only show if no error, no image, and not loading
  if (!currentImage && !previousImage && !error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black/40 to-black/60 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-black/20">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">💎</div>
            <h3 className="text-2xl font-semibold text-white/90 mb-2">
              Start creating your jewelry design
            </h3>
            <p className="text-white/60">
              Upload an image to edit or generate a new design
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Option */}
            <div className="flex flex-col items-center">
              <h4 className="text-lg font-medium text-white/90 mb-4">Upload Image</h4>
              {onImageUpload ? (
                <div className="w-full max-w-md">
                  <ImageUpload
                    onImageUpload={onImageUpload}
                    currentImage={null}
                  />
                </div>
              ) : (
                <div className="w-full max-w-md aspect-square rounded-lg border-2 border-dashed border-white/30 bg-white/5 flex items-center justify-center">
                  <p className="text-white/60">Upload component not available</p>
                </div>
              )}
            </div>
            
            {/* Generate Option */}
            <div className="flex flex-col items-center">
              <h4 className="text-lg font-medium text-white/90 mb-4">Generate New Design</h4>
              <div className="w-full max-w-md aspect-square rounded-lg border-2 border-dashed border-purple-500/50 bg-purple-500/5 flex items-center justify-center">
                <div className="text-center space-y-2 px-4">
                  <div className="text-4xl mb-2">✨</div>
                  <p className="text-white/80 font-medium">
                    Use the prompt below to generate
                  </p>
                  <p className="text-white/50 text-sm">
                    Describe your vision and click Generate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode: side-by-side comparison
  if (isEditMode && previousImage && currentImage) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black/40 to-black/60 p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4 h-full max-h-[80vh]">
          {/* Previous Image */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-sm text-white/60 font-medium mb-2">Previous</div>
            <div className="relative w-full h-full flex items-center justify-center bg-black/20 rounded-lg overflow-hidden border border-white/10">
              <img
                src={previousImage}
                alt="Previous design"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-3/4 bg-gradient-to-b from-transparent via-white/30 to-transparent" />

          {/* Current Image */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-sm text-white/60 font-medium mb-2">New</div>
            <div className="relative w-full h-full flex items-center justify-center bg-black/20 rounded-lg overflow-hidden border border-white/10">
              <img
                src={currentImage}
                alt="Current design"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Single preview mode - only show actual images, never text descriptions
  if (currentImage && currentImage.startsWith('data:image/')) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black/40 to-black/60 p-4">
        <div className="w-full max-w-4xl h-full max-h-[80vh] flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center bg-black/20 rounded-lg overflow-hidden border border-white/10 shadow-2xl">
            <img
              src={currentImage}
              alt="Jewelry design"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black/40 to-black/60">
      <p className="text-white/60">No image to display</p>
    </div>
  );
}

