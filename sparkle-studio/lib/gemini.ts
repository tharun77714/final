/**
 * Gemini API utility functions for jewelry image generation
 * All functions are server-side only to protect API key
 */

import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  // Create a new instance for each request to ensure fresh state
  return new GoogleGenAI({ apiKey });
};

/**
 * Generate jewelry image from text prompt
 * @param prompt - Natural language prompt describing the jewelry
 * @param options - Generation options (image size, etc.)
 * @returns Base64 image data
 */
export async function generateJewelryImage(
  prompt: string,
  options: {
    imageSize?: '1K' | '2K' | '4K';
    model?: string;
    retryCount?: number;
  } = {}
): Promise<string> {
  const maxRetries = 1;
  const retryCount = options.retryCount || 0;
  
  try {
    const ai = getGeminiClient();
    
    // Use the correct free-tier model: gemini-2.5-flash-image
    // Avoid: gemini-2.5-flash-image-preview (retired)
    const modelName = options.model || 'gemini-2.5-flash-image';

    // Enhanced prompt for jewelry generation
    const enhancedPrompt = `Create a high-quality, professional jewelry design image. ${prompt}. 
    The image should be elegant, premium, and suitable for a luxury jewelry catalog. 
    Use realistic materials, proper lighting, and professional photography style. 
    Studio-lit product photograph with sharp focus on the jewelry details. 
    8k resolution, cinematic lighting, shallow depth of field, elegant grey velvet background, 
    highly detailed craftsmanship, realistic reflections on metal and gemstones.`;

    try {
      // Use the working API structure from Google AI Studio
      // Build config object - only add imageSize if specified
      const imageConfig: any = {
        aspectRatio: '1:1',
      };
      if (options.imageSize) {
        imageConfig.imageSize = options.imageSize;
      }

      // Free tier requires responseModalities: ["IMAGE"] in generationConfig
      // Contents format: [{ text: "..." }] for @google/genai package
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ text: enhancedPrompt }],
        config: {
          responseModalities: ['IMAGE'], // Required for image generation (free tier)
          imageConfig,
        },
      });

      // Extract image from response parts (matching the working code structure)
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      
      // No image found in response
      throw new Error('No image data found in response');
    } catch (error: any) {
      const errorMessage = error?.message || '';
      const isQuotaError = errorMessage.includes('429') || errorMessage.includes('quota');
      const isModelNotFound = errorMessage.includes('not found') || errorMessage.includes('404');
      
      // Retry logic: reduce image size and retry once
      if ((isQuotaError || isModelNotFound) && retryCount < maxRetries) {
        // If it's a quota error (429), wait before retrying (RPM limit is ~15/min)
        if (isQuotaError) {
          const waitTime = 5000; // Wait 5 seconds before retrying
          console.warn(`Image generation hit RPM limit. Waiting ${waitTime/1000} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        console.warn(`Image generation attempt ${retryCount + 1} failed, retrying with reduced size...`);
        
        // Reduce image size for retry (2K -> 1K)
        const reducedSize = options.imageSize === '2K' || options.imageSize === '4K' ? '1K' : '1K';
        
        // Retry with same model but reduced size
        return generateJewelryImage(prompt, {
          ...options,
          model: modelName, // Use same model, just reduce size
          imageSize: reducedSize as '1K' | '2K' | '4K',
          retryCount: retryCount + 1,
        });
      }
      
      // If all retries exhausted, throw specific error messages
      if (isQuotaError) {
        throw new Error('IMAGE_GENERATION_QUOTA_EXCEEDED: Image generation is currently unavailable due to API quota limits (429 Resource Exhausted). You may have hit the "Requests Per Minute" (RPM) limit. Please wait a moment and try again.');
      }
      if (isPermissionError) {
        throw new Error('IMAGE_GENERATION_PERMISSION_DENIED: Image generation is not available due to region restrictions or billing requirements. Ensure your project is set to a region that supports image generation and billing is enabled if required.');
      }
      if (isConfigError) {
        throw new Error('IMAGE_GENERATION_CONFIG_ERROR: Invalid configuration. Please check that responseModalities includes both TEXT and IMAGE.');
      }
      if (isModelNotFound) {
        throw new Error('IMAGE_GENERATION_UNAVAILABLE: Image generation models are not available with your current API access. Please check your API plan.');
      }
      
      // Re-throw other errors with original message
      throw error;
    }
  } catch (error) {
    console.error('Error generating jewelry image:', error);
    throw error instanceof Error ? error : new Error('Failed to generate jewelry image');
  }
}

/**
 * Edit existing jewelry image with text prompt
 * @param imageBase64 - Base64 encoded image data
 * @param prompt - Edit instructions
 * @param options - Edit options
 * @returns Base64 image data of edited image
 */
export async function editJewelryImage(
  imageBase64: string,
  prompt: string,
  options: {
    imageSize?: '1K' | '2K' | '4K';
    model?: string;
    retryCount?: number;
  } = {}
): Promise<string> {
  const maxRetries = 1;
  const retryCount = options.retryCount || 0;
  
  try {
    const ai = getGeminiClient();
    // Use the correct free-tier model: gemini-2.5-flash-image
    const modelName = options.model || 'gemini-2.5-flash-image';

    // Convert base64 to format expected by Gemini
    const imageBase64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const editPrompt = `Edit this jewelry image according to: ${prompt}. 
    Maintain the overall quality and style. Apply the changes naturally and professionally.`;

    try {
      // Use the working API structure for image editing
      const imageConfig: any = {
        aspectRatio: '1:1',
      };
      if (options.imageSize) {
        imageConfig.imageSize = options.imageSize;
      }

      // Free tier requires responseModalities: ["IMAGE"] in config
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          { text: editPrompt },
          {
            inlineData: {
              data: imageBase64Data,
              mimeType: 'image/jpeg',
            },
          },
        ],
        config: {
          responseModalities: ['IMAGE'], // Required for image generation (free tier)
          imageConfig,
        },
      });

      // Extract image from response parts
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      
      throw new Error('No image data found in response');
    } catch (error: any) {
      // Log full error details for debugging
      console.error('Gemini API Error Details (Edit):', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
        statusCode: error?.statusCode,
        fullError: error,
      });
      
      const errorMessage = error?.message || '';
      const errorCode = error?.code || error?.statusCode || '';
      const isQuotaError = errorMessage.includes('429') || errorMessage.includes('quota') || errorCode === 429 || errorCode === 'RESOURCE_EXHAUSTED';
      const isModelNotFound = errorMessage.includes('not found') || errorMessage.includes('404') || errorCode === 404;
      const isPermissionError = errorMessage.includes('403') || errorMessage.includes('permission') || errorCode === 403 || errorCode === 'PERMISSION_DENIED';
      const isConfigError = errorMessage.includes('400') || errorMessage.includes('invalid') || errorCode === 400 || errorCode === 'INVALID_ARGUMENT';
      
      // Retry logic: reduce image size and retry once
      if ((isQuotaError || isModelNotFound) && retryCount < maxRetries) {
        console.warn(`Image editing attempt ${retryCount + 1} failed, retrying with reduced size...`);
        
        const reducedSize = options.imageSize === '2K' || options.imageSize === '4K' ? '1K' : '1K';
        
        return editJewelryImage(imageBase64, prompt, {
          ...options,
          imageSize: reducedSize as '1K' | '2K' | '4K',
          retryCount: retryCount + 1,
        });
      }
      
      if (isQuotaError) {
        throw new Error('IMAGE_GENERATION_QUOTA_EXCEEDED: Image editing is currently unavailable due to API quota limits (429 Resource Exhausted). You may have hit the "Requests Per Minute" (RPM) limit. Please wait a moment and try again.');
      }
      if (isPermissionError) {
        throw new Error('IMAGE_GENERATION_PERMISSION_DENIED: Image editing is not available due to region restrictions or billing requirements.');
      }
      if (isConfigError) {
        throw new Error('IMAGE_GENERATION_CONFIG_ERROR: Invalid configuration. Please check that responseModalities includes both TEXT and IMAGE.');
      }
      if (isModelNotFound) {
        throw new Error('IMAGE_GENERATION_UNAVAILABLE: Image generation models are not available with your current API access.');
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error editing jewelry image:', error);
    throw error instanceof Error ? error : new Error('Failed to edit jewelry image');
  }
}

/**
 * Compose multiple reference images into one jewelry design
 * @param referenceImages - Array of base64 encoded reference images (max 3)
 * @param prompt - Instructions on how to merge the references
 * @param options - Composition options
 * @returns Base64 image data of composed image
 */
export async function composeJewelryImages(
  referenceImages: string[],
  prompt: string,
  options: {
    imageSize?: '1K' | '2K' | '4K';
    model?: string;
    retryCount?: number;
  } = {}
): Promise<string> {
  const maxRetries = 1;
  const retryCount = options.retryCount || 0;
  
  try {
    if (referenceImages.length === 0) {
      throw new Error('At least one reference image is required');
    }
    // gemini-2.5-flash-image supports up to 3 images
    // gemini-3-pro-image-preview supports up to 14 images
    const maxImages = options.model?.includes('gemini-3-pro-image') || options.model?.includes('3-pro-image') ? 14 : 3;
    if (referenceImages.length > maxImages) {
      throw new Error(`Maximum ${maxImages} reference images allowed for this model`);
    }

    const ai = getGeminiClient();
    // Use the correct free-tier model: gemini-2.5-flash-image
    const modelName = options.model || 'gemini-2.5-flash-image';

    // Prepare image parts
    const imageParts = referenceImages.map((img) => ({
      inlineData: {
        data: img.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, ''),
        mimeType: 'image/jpeg',
      },
    }));

    const compositionPrompt = `Merge these ${referenceImages.length} jewelry reference images into one cohesive design. 
    ${prompt}
    Create a unified, elegant jewelry piece that combines the best elements from all references. 
    Ensure the final design is harmonious and professionally rendered.`;

    try {
      // Use the working API structure for multi-image composition
      const imageConfig: any = {
        aspectRatio: '1:1',
      };
      if (options.imageSize) {
        imageConfig.imageSize = options.imageSize;
      }

      // Free tier requires responseModalities: ["IMAGE"] in config
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          { text: compositionPrompt },
          ...imageParts,
        ],
        config: {
          responseModalities: ['IMAGE'], // Required for image generation (free tier)
          imageConfig,
        },
      });

      // Extract image from response parts
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      
      throw new Error('No image data found in response');
    } catch (error: any) {
      // Log full error details for debugging
      console.error('Gemini API Error Details (Compose):', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
        statusCode: error?.statusCode,
        fullError: error,
      });
      
      const errorMessage = error?.message || '';
      const errorCode = error?.code || error?.statusCode || '';
      const isQuotaError = errorMessage.includes('429') || errorMessage.includes('quota') || errorCode === 429 || errorCode === 'RESOURCE_EXHAUSTED';
      const isModelNotFound = errorMessage.includes('not found') || errorMessage.includes('404') || errorCode === 404;
      const isPermissionError = errorMessage.includes('403') || errorMessage.includes('permission') || errorCode === 403 || errorCode === 'PERMISSION_DENIED';
      const isConfigError = errorMessage.includes('400') || errorMessage.includes('invalid') || errorCode === 400 || errorCode === 'INVALID_ARGUMENT';
      
      // Retry logic: reduce image size and retry once
      if ((isQuotaError || isModelNotFound) && retryCount < maxRetries) {
        console.warn(`Image composition attempt ${retryCount + 1} failed, retrying with reduced size...`);
        
        const reducedSize = options.imageSize === '2K' || options.imageSize === '4K' ? '1K' : '1K';
        
        return composeJewelryImages(referenceImages, prompt, {
          ...options,
          imageSize: reducedSize as '1K' | '2K' | '4K',
          retryCount: retryCount + 1,
        });
      }
      
      if (isQuotaError) {
        throw new Error('IMAGE_GENERATION_QUOTA_EXCEEDED: Image composition is currently unavailable due to API quota limits (429 Resource Exhausted). You may have hit the "Requests Per Minute" (RPM) limit. Please wait a moment and try again.');
      }
      if (isPermissionError) {
        throw new Error('IMAGE_GENERATION_PERMISSION_DENIED: Image composition is not available due to region restrictions or billing requirements.');
      }
      if (isConfigError) {
        throw new Error('IMAGE_GENERATION_CONFIG_ERROR: Invalid configuration. Please check that responseModalities includes both TEXT and IMAGE.');
      }
      if (isModelNotFound) {
        throw new Error('IMAGE_GENERATION_UNAVAILABLE: Image generation models are not available with your current API access.');
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error composing jewelry images:', error);
    throw error instanceof Error ? error : new Error('Failed to compose jewelry images');
  }
}

