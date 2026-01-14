'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ManualControls from '@/app/components/ManualControls';
import PromptBar from '@/app/components/PromptBar';
import JewelryCanvas from '@/app/components/JewelryCanvas';
import { generateJewelry, regenerateJewelry, editJewelry } from '@/app/actions/jewelry-actions';
import type { ManualControls as ManualControlsType } from '@/app/actions/jewelry-actions';
import { Client } from '@gradio/client';
import { editJewelryImage } from '@/lib/gemini';

export default function AICustomizationPage() {
  const router = useRouter();

  // State management
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [previousImage, setPreviousImage] = useState<string | null>(null);
  const [imageHistory, setImageHistory] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [imageSource, setImageSource] = useState<'uploaded' | 'generated' | null>(null);
  const [isFirstGeneration, setIsFirstGeneration] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [manualControls, setManualControls] = useState<ManualControlsType>({
    finish: 50,
    complexity: 50,
  });

  // Add image to history (max 5)
  const addToHistory = useCallback((image: string) => {
    setImageHistory((prev) => {
      const newHistory = [image, ...prev].slice(0, 5);
      return newHistory;
    });
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback((imageData: string) => {
    setPreviousImage(currentImage);
    setCurrentImage(imageData);
    setImageSource('uploaded');
    setIsFirstGeneration(false); // Uploaded images can be edited immediately
    addToHistory(imageData); // Add uploaded image to history
    setIsEditMode(false);
    setError(null);
  }, [currentImage, addToHistory]);

  // Handle advanced output when returning from Advanced page
  useEffect(() => {
    const advancedOutput = sessionStorage.getItem('advancedOutput');
    const timestamp = sessionStorage.getItem('advancedOutputTimestamp');
    
    if (advancedOutput && timestamp) {
      // Check if timestamp is recent (within last minute)
      const outputTime = parseInt(timestamp, 10);
      const now = Date.now();
      if (now - outputTime < 60000) {
        setPreviousImage(currentImage);
        setCurrentImage(advancedOutput);
        addToHistory(advancedOutput);
        // Clear session storage
        sessionStorage.removeItem('advancedOutput');
        sessionStorage.removeItem('advancedOutputTimestamp');
      }
    }
  }, [currentImage, addToHistory]);

  // Helper function to convert data URI to File for API
  const dataURItoFile = (dataURI: string, filename: string = 'image.png'): File => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    return new File([blob], filename, { type: mimeString });
  };

  // Helper function to convert any image format to PNG data URI
  const convertToPNG = async (dataURI: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        try {
          const pngDataURI = canvas.toDataURL('image/png');
          resolve(pngDataURI);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataURI;
    });
  };

  // Helper function to convert any image format to JPEG data URI (better API compatibility)
  const convertToJPEG = async (dataURI: string, quality: number = 0.9): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        try {
          const jpegDataURI = canvas.toDataURL('image/jpeg', quality);
          resolve(jpegDataURI);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataURI;
    });
  };

  // Handle generation using Hugging Face Space API
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() && !manualControls.metal && !manualControls.stone) {
      return;
    }

    setIsLoading(true);
    setIsRetrying(false);
    setError(null); // Clear previous error when starting new generation
    setPreviousImage(currentImage);

    const userPrompt = prompt.trim() || 'Create an elegant jewelry piece';
    console.log('Calling API with prompt:', userPrompt);

    try {
      // Try primary API first: mrfakename/Z-Image-Turbo
      let result;
      try {
        const app = await Client.connect('mrfakename/Z-Image-Turbo');
        
        // API expects parameters as an object with named properties
        const apiParams = {
          prompt: userPrompt, // User prompt input (required)
          width: 1024, // width
          height: 1024, // height
          num_inference_steps: 9, // num_inference_steps
          randomize_seed: true, // randomize_seed
          seed: 42, // seed (default value, will be randomized if randomize_seed is true)
        };
        
        // Call the /generate_image endpoint with object parameters
        result = await app.predict('/generate_image', apiParams);
        console.log('Primary API call successful');
      } catch (primaryError) {
        // Fallback to FLUX API if primary fails
        console.log('Primary API failed, trying FLUX API...', primaryError);
        const fluxApp = await Client.connect('multimodalart/FLUX.2-dev-turbo');
        
        const fluxParams = {
          prompt: userPrompt,
          input_images: [], // Empty for generation
          seed: 0,
          randomize_seed: true,
          width: 1024,
          height: 1024,
          num_inference_steps: 30,
          guidance_scale: 2.5,
          prompt_upsampling: false,
          use_turbo: true,
        };
        
        result = await fluxApp.predict('/infer', fluxParams);
        console.log('FLUX API call successful');
      }
      
      // Extract image data from the API response
      // Response format: result.data = [imageData (string or object), seedUsed (number)]
      if (!result || !result.data || !Array.isArray(result.data) || result.data.length === 0) {
        throw new Error('IMAGE_GENERATION_FAILED: Invalid API response format');
      }

      // Log the actual response structure for debugging
      console.log('Full result.data:', result.data);
      console.log('result.data[0]:', result.data[0], 'Type:', typeof result.data[0]);
      console.log('result.data[1]:', result.data[1], 'Type:', typeof result.data[1]);

      // Safety check: ensure imageData exists
      const rawImageData = result.data[0];
      const seedUsed = result.data[1]; // Optional: seed used for generation
      
      if (!rawImageData) {
        throw new Error('IMAGE_GENERATION_FAILED: Image data is missing');
      }

      // Extract image string from rawImageData (could be string, object with url/path, etc.)
      let imageData: string;
      
      if (typeof rawImageData === 'string') {
        // Direct string (URL, base64, or data URI)
        imageData = rawImageData;
      } else if (rawImageData && typeof rawImageData === 'object') {
        // Object format - check for common properties
        if (rawImageData.url && typeof rawImageData.url === 'string') {
          imageData = rawImageData.url;
        } else if (rawImageData.path && typeof rawImageData.path === 'string') {
          imageData = rawImageData.path;
        } else if (rawImageData.data && typeof rawImageData.data === 'string') {
          imageData = rawImageData.data;
        } else {
          console.error('Unknown image data object format:', rawImageData);
          throw new Error('IMAGE_GENERATION_FAILED: Image data object format not recognized');
        }
      } else {
        console.error('Unexpected image data type:', typeof rawImageData, rawImageData);
        throw new Error('IMAGE_GENERATION_FAILED: Image data is not a string or recognized object');
      }
      
      console.log('Extracted imageData:', imageData?.substring(0, 100), 'Type:', typeof imageData);

      // Handle image data format - convert URL to data URI if needed
      let finalImageData: string = imageData;
      
      // If it's a URL (http/https), fetch and convert to data URI with timeout
      if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
        try {
          console.log('Fetching image from URL:', imageData);
          
          // Add timeout to fetch (10 seconds)
          const fetchWithTimeout = (url: string, timeout = 10000) => {
            return Promise.race([
              fetch(url),
              new Promise<Response>((_, reject) =>
                setTimeout(() => reject(new Error('Fetch timeout')), timeout)
              ),
            ]);
          };
          
          const response = await fetchWithTimeout(imageData);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const blob = await response.blob();
          const reader = new FileReader();
          
          finalImageData = await new Promise<string>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error('FileReader timeout'));
            }, 10000);
            
            reader.onloadend = () => {
              clearTimeout(timeoutId);
              resolve(reader.result as string);
            };
            reader.onerror = (error) => {
              clearTimeout(timeoutId);
              reject(error);
            };
            reader.readAsDataURL(blob);
          });
          
          console.log('Successfully converted URL to data URI');
        } catch (fetchError) {
          console.warn('Failed to fetch image URL, using URL directly:', fetchError);
          // If fetch fails, use the URL directly - modern browsers can display URLs
          finalImageData = imageData;
        }
      }
      // If it's base64 without data URI prefix, add it
      else if (!imageData.startsWith('data:image/') && /^[A-Za-z0-9+/=]+$/.test(imageData) && imageData.length > 100) {
        finalImageData = `data:image/jpeg;base64,${imageData}`;
      }
      // If it's already a data URI, use it directly
      // (no conversion needed)

      // Validate final format and set the image
      // Accept both data URIs and URLs (for direct display)
      if (finalImageData.startsWith('data:image/') || finalImageData.startsWith('http://') || finalImageData.startsWith('https://')) {
        setCurrentImage(finalImageData);
        setImageSource('generated');
        setIsFirstGeneration(false); // First generation complete
        // Don't add to history on first generation (only on edits/regenerations)
        setIsEditMode(false);
        setError(null);
      } else {
        throw new Error('IMAGE_GENERATION_FAILED: Could not convert image to valid format');
      }
    } catch (error) {
      console.error('Generation error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const errorMsg = error instanceof Error ? error.message : 'An error occurred while generating jewelry';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [prompt, manualControls, currentImage, addToHistory]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    setError(null);
    handleGenerate();
  }, [handleGenerate]);

  // Handle regeneration
  const handleRegenerate = useCallback(async () => {
    if (!currentImage) {
      setError('No image to edit. Please generate an image first.');
      return;
    }

    // Require a prompt for editing
    if (!prompt.trim()) {
      setError('Please enter a prompt to edit the image.');
      return;
    }

    setIsLoading(true);
    setPreviousImage(currentImage);
    setError(null);

    const userPrompt = prompt.trim();

    try {
      // Use Omni-Image-Editor API - accepts Blob/File/Buffer directly
      const omniApp = await Client.connect('selfit-camera/Omni-Image-Editor');
      
      // Prepare image for API - convert to File/Blob object
      let imageForAPI: File | Blob | null = null;
      if (currentImage) {
        if (currentImage.startsWith('data:image/')) {
          try {
            // Convert data URI to File object
            imageForAPI = dataURItoFile(currentImage, 'input-image.jpg');
            console.log('Converted data URI to File for Omni API');
          } catch (convError) {
            console.warn('Image conversion failed:', convError);
            throw new Error('Failed to prepare image for editing');
          }
        } else if (currentImage.startsWith('http://') || currentImage.startsWith('https://')) {
          // Fetch URL and convert to Blob
          try {
            const response = await fetch(currentImage);
            imageForAPI = await response.blob();
            console.log('Fetched image URL and converted to Blob for Omni API');
          } catch (fetchError) {
            console.warn('Failed to fetch image URL:', fetchError);
            throw new Error('Failed to load image from URL');
          }
        } else {
          throw new Error('Unsupported image format');
        }
      }

      if (!imageForAPI) {
        throw new Error('No image provided for editing');
      }

      console.log('Calling Omni-Image-Editor API for editing with prompt:', userPrompt);
      
      // Call the /edit_image_interface endpoint
      // Response format: [output_image_html, processing_status, value_19]
      const result = await omniApp.predict('/edit_image_interface', {
        input_image: imageForAPI,
        prompt: userPrompt,
      });
      
      console.log('Omni-Image-Editor API call successful');
      console.log('Full API response:', result);

      // Extract image from HTML response
      // Response format: result.data = [output_image_html (string), processing_status (string), value_19 (string)]
      if (!result || !result.data || !Array.isArray(result.data) || result.data.length === 0) {
        console.error('Invalid API response format:', result);
        throw new Error('IMAGE_GENERATION_FAILED: Invalid API response format');
      }

      const outputHtml = result.data[0];
      const processingStatus = result.data[1];

      console.log('Output HTML (first 500 chars):', outputHtml?.substring(0, 500));
      console.log('Processing status:', processingStatus);
      console.log('All response data:', result.data);

      // Check processing status for quota/limit errors first
      if (processingStatus && typeof processingStatus === 'string') {
        const statusLower = processingStatus.toLowerCase();
        if (statusLower.includes('limit') || statusLower.includes('quota') || statusLower.includes('reached') || statusLower.includes('free generation')) {
          console.log('Quota/limit error detected in processing status');
          throw new Error(`GPU quota exceeded: ${processingStatus}`);
        }
      }

      // Check if outputHtml is empty or missing
      if (!outputHtml || (typeof outputHtml === 'string' && outputHtml.trim() === '')) {
        console.error('HTML data is empty or missing:', outputHtml);
        // If we have a processing status, include it in the error
        if (processingStatus) {
          throw new Error(`IMAGE_GENERATION_FAILED: ${processingStatus}`);
        }
        throw new Error('IMAGE_GENERATION_FAILED: Image HTML data is missing or empty');
      }

      if (typeof outputHtml !== 'string') {
        console.error('HTML data is not a string:', typeof outputHtml, outputHtml);
        throw new Error('IMAGE_GENERATION_FAILED: Image HTML data is not a string');
      }

      // Check if the response is directly an image URL/data URI (not HTML)
      const trimmed = outputHtml.trim();
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
        console.log('Response is directly an image URL/data URI');
        // Use it directly
        let finalImageData = trimmed;
        
        // Convert URL to data URI if needed
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          try {
            const response = await fetch(trimmed);
            const blob = await response.blob();
            const reader = new FileReader();
            finalImageData = await new Promise<string>((resolve, reject) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch (fetchError) {
            console.warn('Failed to fetch image URL, using URL directly:', fetchError);
            finalImageData = trimmed;
          }
        }
        
        setCurrentImage(finalImageData);
        addToHistory(finalImageData);
        setIsEditMode(true);
        setError(null);
        setIsLoading(false);
        return; // Exit early
      }

      // Parse HTML to extract image URL
      // The HTML typically contains an <img> tag with src attribute
      let imageUrl: string | null = null;
      
      // Try multiple patterns to extract image URL
      // Pattern 1: Standard <img src="...">
      const imgMatch = outputHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch && imgMatch[1]) {
        imageUrl = imgMatch[1];
        console.log('Found image URL from <img> tag:', imageUrl.substring(0, 100));
      } else {
        // Pattern 2: Look for any image URL in the HTML
        const urlMatch = outputHtml.match(/(https?:\/\/[^\s<>"']+\.(?:jpg|jpeg|png|webp|gif|svg))/i);
        if (urlMatch && urlMatch[1]) {
          imageUrl = urlMatch[1];
          console.log('Found image URL from pattern match:', imageUrl.substring(0, 100));
        } else {
          // Pattern 3: Look for base64 data URI
          const base64Match = outputHtml.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
          if (base64Match && base64Match[1]) {
            imageUrl = `data:image/png;base64,${base64Match[1]}`;
            console.log('Found base64 image data');
          } else {
            // Pattern 4: Check if the HTML itself is a URL or data URI
            const trimmedHtml = outputHtml.trim();
            if (trimmedHtml.startsWith('http://') || trimmedHtml.startsWith('https://') || trimmedHtml.startsWith('data:image/')) {
              imageUrl = trimmedHtml;
              console.log('HTML itself is the image URL/data URI');
            } else {
              // Pattern 5: Try to find file path (for local files)
              const pathMatch = outputHtml.match(/(\/file\/[^\s<>"']+)/);
              if (pathMatch && pathMatch[1]) {
                // Convert relative path to full URL
                imageUrl = `https://selfit-camera-omni-image-editor.hf.space${pathMatch[1]}`;
                console.log('Found file path, converted to URL:', imageUrl);
              } else {
                console.error('Could not extract image from HTML. HTML content:', outputHtml.substring(0, 1000));
                throw new Error('IMAGE_GENERATION_FAILED: Could not extract image from HTML response');
              }
            }
          }
        }
      }

      // Convert URL to data URI if needed
      let finalImageData: string = imageUrl;
      
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        try {
          const fetchWithTimeout = (url: string, timeout = 15000) => {
            return Promise.race([
              fetch(url),
              new Promise<Response>((_, reject) =>
                setTimeout(() => reject(new Error('Fetch timeout')), timeout)
              ),
            ]);
          };
          
          const response = await fetchWithTimeout(imageUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const blob = await response.blob();
          const reader = new FileReader();
          
          finalImageData = await new Promise<string>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error('FileReader timeout'));
            }, 15000);
            
            reader.onloadend = () => {
              clearTimeout(timeoutId);
              resolve(reader.result as string);
            };
            reader.onerror = (error) => {
              clearTimeout(timeoutId);
              reject(error);
            };
            reader.readAsDataURL(blob);
          });
        } catch (fetchError) {
          console.warn('Failed to fetch image URL, using URL directly:', fetchError);
          finalImageData = imageUrl;
        }
      }

      // Validate and set the image
      if (finalImageData.startsWith('data:image/') || finalImageData.startsWith('http://') || finalImageData.startsWith('https://')) {
        setCurrentImage(finalImageData);
        addToHistory(finalImageData);
        setIsEditMode(true);
        setError(null);
      } else {
        throw new Error('IMAGE_GENERATION_FAILED: Could not convert image to valid format');
      }
    } catch (error) {
      // Only show quota/limit errors to user, silently handle other errors
      let errorMessage: string | null = null;
      let shouldShowError = false;
      
      // Try to extract error message
      try {
        if (error instanceof Error) {
          const msg = error.message || '';
          // Only show quota/limit related errors - check for various quota/limit indicators
          const msgLower = msg.toLowerCase();
          if (msgLower.includes('gpu quota') || msgLower.includes('quota') || msgLower.includes('limit') || 
              msgLower.includes('zerogpu') || msgLower.includes('reached') || msgLower.includes('free generation')) {
            // Use the original error message if it's already user-friendly, otherwise use a generic one
            if (msg.includes('GPU quota exceeded') || msg.includes('reached') || msg.includes('free generation')) {
              errorMessage = msg.includes('GPU quota exceeded') ? msg : `GPU quota exceeded: ${msg}`;
            } else {
              errorMessage = 'GPU quota exceeded. Please wait a few minutes and try again, or use the Generate button to create a new image instead.';
            }
            shouldShowError = true;
          }
        } else if (error && typeof error === 'object') {
          const errorObj = error as any;
          const msg = errorObj.message || errorObj.title || '';
          const msgLower = msg.toLowerCase();
          
          // Check for quota/limit errors
          if (msgLower.includes('gpu quota') || msgLower.includes('quota') || msgLower.includes('limit') || 
              msgLower.includes('zerogpu') || msgLower.includes('reached') || msgLower.includes('free generation') || 
              errorObj.title?.toLowerCase().includes('zerogpu')) {
            errorMessage = msg.includes('GPU quota exceeded') || msg.includes('reached') || msg.includes('free generation') 
              ? msg 
              : 'GPU quota exceeded. Please wait a few minutes and try again, or use the Generate button to create a new image instead.';
            shouldShowError = true;
          }
          // For validation errors or other non-quota errors, don't show to user
          // Just log silently for debugging
          if (!shouldShowError) {
            console.warn('Image editing failed (non-quota error, not shown to user):', {
              type: errorObj.constructor?.name || typeof errorObj,
              message: errorObj.message?.substring(0, 100) || errorObj.title,
            });
          }
        }
      } catch (extractionError) {
        // Silently handle extraction errors
        console.warn('Error extraction failed');
      }
      
      // Only set error if it's a quota/limit error
      if (shouldShowError && errorMessage) {
        setError(errorMessage);
      } else {
        // For other errors, just stop loading without showing error message
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentImage, prompt, addToHistory]);

  // Handle edit mode toggle
  const handleEditToggle = useCallback(() => {
    if (!currentImage || !previousImage) {
      alert('No previous image to compare');
      return;
    }
    setIsEditMode((prev) => !prev);
  }, [currentImage, previousImage]);

  // Handle save (disabled for now)
  const handleSave = useCallback(() => {
    // TODO: Implement save functionality
    alert('Save functionality coming soon');
  }, []);

  // Determine prompt bar button text and action based on state
  const hasImage = !!currentImage;
  let promptButtonText = 'Generate';
  let handlePromptAction = handleGenerate;
  
  if (imageSource === 'uploaded' && hasImage) {
    // Uploaded images: show "Edit" button
    promptButtonText = 'Edit';
    handlePromptAction = handleRegenerate;
  } else if (isFirstGeneration) {
    // First generation: show "Generate" button
    promptButtonText = 'Generate';
    handlePromptAction = handleGenerate;
  } else if (!isFirstGeneration && imageSource === 'generated' && hasImage) {
    // Subsequent generations: show "Regenerate" button
    promptButtonText = 'Regenerate';
    handlePromptAction = handleRegenerate;
  }

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-lg border-b border-white/10 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold text-white">Jewelry Studio</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!currentImage}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            title="Coming soon"
          >
            Save
          </button>
          <button
            onClick={handleEditToggle}
            disabled={!currentImage || !previousImage || isFirstGeneration}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isEditMode
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
            title={isFirstGeneration ? 'Complete first generation to enable edit mode' : 'Toggle side-by-side comparison'}
          >
            Edit
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showHistory
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Toggle history"
          >
            History
          </button>
          <button
            onClick={() => router.push('/advanced')}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all"
          >
            Advanced
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Help"
          >
            ?
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel - Manual Controls (Desktop only) */}
        <div className="hidden md:block w-80 flex-shrink-0 border-r border-white/10">
          <ManualControls controls={manualControls} onChange={setManualControls} />
        </div>

        {/* Main Canvas */}
        <div className="flex-1 overflow-hidden">
          <JewelryCanvas
            currentImage={currentImage}
            previousImage={previousImage}
            isEditMode={isEditMode}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
            isRetrying={isRetrying}
            onImageUpload={handleImageUpload}
          />
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-black/95 backdrop-blur-lg border-l border-white/10 z-30 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
              <h3 className="text-lg font-semibold text-white">History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div 
              className="flex-1 overflow-y-auto p-4" 
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(139, 92, 246, 0.8) rgba(0, 0, 0, 0.2)'
              }}
            >
              {imageHistory.length === 0 ? (
                <div className="text-center text-white/60 mt-8">
                  <p>No history yet</p>
                  <p className="text-sm mt-2">Edited images will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {imageHistory.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setPreviousImage(currentImage);
                        setCurrentImage(image);
                        setShowHistory(false);
                      }}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-white/20 hover:border-purple-500 cursor-pointer transition-all group flex-shrink-0"
                    >
                      <img
                        src={image}
                        alt={`History ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                          Load
                        </span>
                      </div>
                      {image === currentImage && (
                        <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                          Current
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Manual Controls (shown at bottom on mobile) */}
      <div className="md:hidden border-t border-white/10 bg-black/80 backdrop-blur-lg max-h-64 overflow-y-auto">
        <ManualControls controls={manualControls} onChange={setManualControls} />
      </div>

      {/* Bottom Sticky Prompt Bar */}
      <PromptBar
        prompt={prompt}
        onPromptChange={setPrompt}
        onGenerate={handlePromptAction}
        isLoading={isLoading}
        hasImage={hasImage}
        buttonText={promptButtonText}
      />
    </div>
  );
}

