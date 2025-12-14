'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const features = [
  {
    id: 1,
    title: 'AR Try-On',
    description: 'Experience jewelry in real-time with our advanced AR technology. See how pieces look on you before you buy.',
    media: '/media/230f7453-accc-4600-8149-2857eade02e5.jpg',
    mediaType: 'image' as const,
  },
  {
    id: 2,
    title: 'AI Customization',
    description: 'Let AI help you design your perfect piece. Customize every detail with intelligent suggestions and real-time preview.',
    media: '/media/unnamed-removebg-preview-Picsart-AiImageEnhancer_imgupscaler.ai_General_16K.jpg',
    mediaType: 'image' as const,
  },
  {
    id: 3,
    title: 'Networking Hub',
    description: 'Connect with jewelers, designers, and enthusiasts. Collaborate, share ideas, and grow your network in the jewelry community.',
    media: '/media/gmap.jpg',
    mediaType: 'image' as const,
  },
];

export default function ProductHighlight() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false); // Pause auto-play when user manually navigates
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
    setIsAutoPlaying(false);
  };

  const currentFeature = features[currentIndex];

  return (
    <section className="snap-section flex items-center justify-center relative overflow-hidden bg-[#000000] h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              Our <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-gray-400 text-sm lg:text-base max-w-2xl mx-auto">
              Discover the power of AI and AR in jewelry design
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative">
            {/* Main Feature Card */}
            <div className="relative w-full h-[500px] lg:h-[600px] rounded-2xl overflow-hidden glass-effect">
              {/* Media Display */}
              <div className="absolute inset-0">
                {currentFeature.media ? (
                  <Image
                    src={currentFeature.media}
                    alt={currentFeature.title}
                    fill
                    className="object-cover"
                    priority={currentIndex === 0}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#8B5CF6]/10 via-[#1A1A2E]/20 to-[#000000]">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 mx-auto rounded-full bg-[#8B5CF6]/20 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-[#8B5CF6]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-sm">Image Coming Soon</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent"></div>
              
              {/* Feature Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 z-10">
                <div className="max-w-2xl">
                  <h3 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                    {currentFeature.title}
                  </h3>
                  <p className="text-gray-300 text-base lg:text-lg leading-relaxed mb-4">
                    {currentFeature.description}
                  </p>
                  <a
                    href="#customer-vendor-selection"
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById('customer-vendor-selection');
                      const scrollContainer = document.querySelector('.snap-scroll-container');
                      if (element && scrollContainer) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="inline-block px-6 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-[#8B5CF6]/20"
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full glass-effect flex items-center justify-center hover:bg-white/10 transition-colors group"
              aria-label="Previous feature"
            >
              <svg
                className="w-6 h-6 text-white group-hover:text-[#8B5CF6] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full glass-effect flex items-center justify-center hover:bg-white/10 transition-colors group"
              aria-label="Next feature"
            >
              <svg
                className="w-6 h-6 text-white group-hover:text-[#8B5CF6] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-[#8B5CF6] w-8'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Feature Cards Preview (Below carousel) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mt-8 lg:mt-12">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => {
                  goToSlide(index);
                  // After a short delay, scroll to customer/vendor selection
                  setTimeout(() => {
                    const element = document.getElementById('customer-vendor-selection');
                    const scrollContainer = document.querySelector('.snap-scroll-container');
                    if (element && scrollContainer) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 300);
                }}
                className={`text-left p-4 lg:p-6 rounded-xl glass-effect border transition-all duration-300 cursor-pointer ${
                  index === currentIndex
                    ? 'border-[#8B5CF6]/50 bg-[#8B5CF6]/10'
                    : 'border-white/10 hover:border-[#8B5CF6]/30 hover:bg-white/5'
                }`}
              >
                <h4 className="text-lg lg:text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {feature.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

