'use server';

/**
 * Server actions for jewelry generation, editing, and composition
 * All Gemini API calls are server-side only
 */

import {
  generateJewelryImage,
  editJewelryImage,
  composeJewelryImages,
} from '@/lib/gemini';

// Types for manual controls
export interface ManualControls {
  metal?: 'Gold' | 'Rose Gold' | 'Silver' | 'Platinum';
  stone?: 'Diamond' | 'Emerald' | 'Ruby' | 'Sapphire' | 'Pearl';
  stoneCut?: 'Round' | 'Princess' | 'Emerald' | 'Oval' | 'Pear' | 'Marquise' | 'Cushion' | 'Heart';
  finish?: number; // 0-100 (Matte to Glossy)
  engravingText?: string;
  complexity?: number; // 0-100 (Simple to Intricate)
}

/**
 * Merge manual controls into a natural language prompt
 */
function buildPromptFromControls(controls: ManualControls, userPrompt?: string): string {
  const parts: string[] = [];

  if (controls.metal) {
    parts.push(`Metal: ${controls.metal}`);
  }

  if (controls.stone) {
    parts.push(`Stone: ${controls.stone}`);
  }

  if (controls.stoneCut) {
    parts.push(`Stone Cut: ${controls.stoneCut}`);
  }

  if (controls.finish !== undefined) {
    const finishLevel = controls.finish < 33 ? 'Matte' : controls.finish < 66 ? 'Semi-glossy' : 'Glossy';
    parts.push(`Finish: ${finishLevel}`);
  }

  if (controls.engravingText && controls.engravingText.trim()) {
    parts.push(`Engraving: "${controls.engravingText}"`);
  }

  if (controls.complexity !== undefined) {
    const complexityLevel = controls.complexity < 33 ? 'Simple' : controls.complexity < 66 ? 'Moderate' : 'Intricate';
    parts.push(`Design Complexity: ${complexityLevel}`);
  }

  let prompt = parts.join(', ');
  
  if (userPrompt && userPrompt.trim()) {
    prompt = `${prompt}. ${userPrompt}`;
  }

  return prompt || 'Create an elegant jewelry piece';
}

/**
 * Generate jewelry image from manual controls and optional text prompt
 */
export async function generateJewelry(
  manualControls: ManualControls,
  prompt?: string
): Promise<{ success: boolean; imageData?: string; error?: string }> {
  try {
    const mergedPrompt = buildPromptFromControls(manualControls, prompt);
    
    const result = await generateJewelryImage(mergedPrompt, {
      imageSize: '2K',
    });

    // Check if result is already a data URI (image) or text (description)
    // If it's text, we'll return it anyway and let the frontend handle it
    // In production, you might want to convert text descriptions to images via another service
    
    return {
      success: true,
      imageData: result,
    };
  } catch (error) {
    console.error('Error in generateJewelry:', error);
    // Provide more detailed error message
    let errorMessage = 'Failed to generate jewelry';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Extract more details from GoogleGenerativeAI errors
      if (error.message.includes('GoogleGenerativeAI Error')) {
        errorMessage = error.message;
      }
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Regenerate jewelry with variations of current image
 */
export async function regenerateJewelry(
  currentImage: string,
  prompt?: string
): Promise<{ success: boolean; imageData?: string; error?: string }> {
  try {
    const variationPrompt = prompt 
      ? `Create a variation of this jewelry design. ${prompt}`
      : 'Create a variation of this jewelry design with subtle differences while maintaining the overall style.';

    // For regeneration, we'll use the current image as a reference
    const result = await editJewelryImage(currentImage, variationPrompt, {
      imageSize: '2K',
    });

    return {
      success: true,
      imageData: result,
    };
  } catch (error) {
    console.error('Error in regenerateJewelry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to regenerate jewelry',
    };
  }
}

/**
 * Edit existing jewelry image with new prompt
 */
export async function editJewelry(
  previousImage: string,
  prompt: string
): Promise<{ success: boolean; imageData?: string; error?: string }> {
  try {
    if (!prompt || !prompt.trim()) {
      return {
        success: false,
        error: 'Edit prompt is required',
      };
    }

    const result = await editJewelryImage(previousImage, prompt, {
      imageSize: '2K',
    });

    return {
      success: true,
      imageData: result,
    };
  } catch (error) {
    console.error('Error in editJewelry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to edit jewelry',
    };
  }
}

/**
 * Advanced composition: merge multiple reference images
 */
export async function composeAdvanced(
  referenceImages: string[],
  prompt: string
): Promise<{ success: boolean; imageData?: string; error?: string }> {
  try {
    if (referenceImages.length === 0) {
      return {
        success: false,
        error: 'At least one reference image is required',
      };
    }

    if (referenceImages.length > 3) {
      return {
        success: false,
        error: 'Maximum 3 reference images allowed',
      };
    }

    const compositionPrompt = prompt || 'Merge these reference images into one cohesive jewelry design.';

    const result = await composeJewelryImages(referenceImages, compositionPrompt, {
      imageSize: '2K',
    });

    return {
      success: true,
      imageData: result,
    };
  } catch (error) {
    console.error('Error in composeAdvanced:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to compose jewelry images',
    };
  }
}

