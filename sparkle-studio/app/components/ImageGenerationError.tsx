'use client';

interface ImageGenerationErrorProps {
  error: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export default function ImageGenerationError({
  error,
  onRetry,
  isRetrying = false,
}: ImageGenerationErrorProps) {
  const isQuotaError = error.includes('QUOTA_EXCEEDED') || error.includes('quota');
  const isUnavailable = error.includes('UNAVAILABLE') || error.includes('not available');

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black/40 to-black/60 p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">💎</div>
          <h3 className="text-2xl font-semibold text-white/90">
            Image Generation Unavailable
          </h3>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1 space-y-2">
              <p className="text-white/90 font-medium">
                {isQuotaError
                  ? 'API Quota Exceeded'
                  : isUnavailable
                  ? 'Image Generation Not Available'
                  : 'Generation Failed'}
              </p>
              <p className="text-white/70 text-sm leading-relaxed">
                {isQuotaError
                  ? 'Your current API plan has reached its image generation limit. Please try again later or upgrade your plan for higher limits.'
                  : isUnavailable
                  ? 'Image generation models are not available with your current API access level. Please check your API plan or try again later.'
                  : 'We encountered an issue generating your jewelry image. Please try again.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isRetrying
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
            }`}
          >
            {isRetrying ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Retrying...
              </span>
            ) : (
              'Retry Generation'
            )}
          </button>
          
          {isQuotaError && (
            <a
              href="https://ai.google.dev/gemini-api/docs/rate-limits"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg font-medium bg-white/10 hover:bg-white/20 text-white transition-colors text-center"
            >
              View Rate Limits
            </a>
          )}
        </div>

        {isQuotaError && (
          <div className="text-center text-sm text-white/50 space-y-1">
            <p>Tip: Free tier allows ~15 requests per minute.</p>
            <p>Wait 5-10 seconds between requests to avoid hitting the limit.</p>
          </div>
        )}
      </div>
    </div>
  );
}

