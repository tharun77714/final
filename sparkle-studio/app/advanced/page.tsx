'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdvancedComposer from '@/app/components/AdvancedComposer';
import PromptBar from '@/app/components/PromptBar';
import { composeAdvanced } from '@/app/actions/jewelry-actions';

export default function AdvancedPage() {
  const router = useRouter();

  // State management
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add reference image
  const handleReferenceAdd = useCallback((image: string) => {
    if (referenceImages.length >= 3) {
      alert('Maximum 3 reference images allowed');
      return;
    }
    setReferenceImages((prev) => [...prev, image]);
  }, [referenceImages.length]);

  // Remove reference image
  const handleReferenceRemove = useCallback((index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Generate composition
  const handleGenerate = useCallback(async () => {
    if (referenceImages.length === 0) {
      setError('Please add at least one reference image');
      return;
    }

    setIsLoading(true);
    setIsRetrying(false);
    setError(null);

    try {
      const result = await composeAdvanced(referenceImages, prompt);

      if (result.success && result.imageData) {
        let imageData = result.imageData;
        
        if (imageData.startsWith('data:image/')) {
          setOutputImage(imageData);
          setError(null);
        } else if (/^[A-Za-z0-9+/=]+$/.test(imageData) && imageData.length > 100) {
          imageData = `data:image/jpeg;base64,${imageData}`;
          setOutputImage(imageData);
          setError(null);
        } else {
          throw new Error('IMAGE_GENERATION_FAILED: Expected image data but received text description');
        }
      } else {
        const errorMsg = result.error || 'Failed to compose jewelry images';
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Composition error:', error);
      const errorMsg = error instanceof Error ? error.message : 'An error occurred while composing jewelry images';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [referenceImages, prompt]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    setError(null);
    handleGenerate();
  }, [handleGenerate]);

  // Save & Return to Editor
  const handleSaveAndReturn = useCallback(() => {
    if (!outputImage) {
      alert('Please generate an output image first');
      return;
    }

    // Store output image in sessionStorage to pass to editor
    // In a real app, you might want to use a state management solution or context
    sessionStorage.setItem('advancedOutput', outputImage);
    sessionStorage.setItem('advancedOutputTimestamp', Date.now().toString());

    // Redirect to editor
    router.push('/ai-customization');
  }, [outputImage, router]);

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-lg border-b border-white/10 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/ai-customization')}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            ← Back to Editor
          </button>
          <h1 className="text-xl font-semibold text-white">Advanced Composition</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAndReturn}
            disabled={!outputImage}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              outputImage
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            Save & Return
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Help"
          >
            ?
          </button>
        </div>
      </div>

      {/* Main Content - Vertical Composer */}
      <div className="flex-1 overflow-hidden">
        <AdvancedComposer
          referenceImages={referenceImages}
          onReferenceAdd={handleReferenceAdd}
          onReferenceRemove={handleReferenceRemove}
          outputImage={outputImage}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      </div>

      {/* Bottom Sticky Prompt Bar */}
      <PromptBar
        prompt={prompt}
        onPromptChange={setPrompt}
        onGenerate={handleGenerate}
        isLoading={isLoading}
        hasImage={!!outputImage}
      />
    </div>
  );
}

