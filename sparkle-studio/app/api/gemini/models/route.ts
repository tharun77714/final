import { NextResponse } from 'next/server';

/**
 * GET /api/gemini/models
 * Lists all available Gemini models for debugging
 * Uses REST API directly since SDK doesn't have listModels
 */
export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not set' },
        { status: 500 }
      );
    }

    // Use REST API to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: 'Failed to fetch models',
          message: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Filter models that support generateContent
    const availableModels = (data.models || [])
      .filter((model: any) => 
        model.supportedGenerationMethods?.includes('generateContent')
      )
      .map((model: any) => ({
        name: model.name,
        displayName: model.displayName,
        supportedMethods: model.supportedGenerationMethods || [],
      }));

    return NextResponse.json({
      success: true,
      models: availableModels,
    });
  } catch (error) {
    console.error('Error listing models:', error);
    return NextResponse.json(
      {
        error: 'Failed to list models',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

