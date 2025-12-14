'use client';

import { useEffect, useRef, useState } from 'react';

export default function HeroSection() {
  const [splineLoaded, setSplineLoaded] = useState(false);
  const splineContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Spline viewer script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.12.6/build/spline-viewer.js';
    script.onload = () => {
      setSplineLoaded(true);
    };
    document.head.appendChild(script);

    // Function to remove Spline attribution
    const removeAttribution = () => {
      const splineViewer = document.querySelector('spline-viewer');
      if (splineViewer) {
        // Try to access shadow DOM
        const shadowRoot = splineViewer.shadowRoot;
        if (shadowRoot) {
          // Find all possible attribution elements
          const selectors = [
            'a[href*="spline"]',
            'button',
            '[class*="attribution"]',
            '[class*="watermark"]',
            '[id*="attribution"]',
            '[id*="watermark"]',
            '*[href*="spline"]',
          ];
          
          selectors.forEach((selector) => {
            const elements = shadowRoot.querySelectorAll(selector);
            elements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              if (htmlEl.textContent?.includes('Built with Spline') || 
                  htmlEl.textContent?.includes('Spline') ||
                  htmlEl.getAttribute('href')?.includes('spline')) {
                htmlEl.style.display = 'none';
                htmlEl.style.visibility = 'hidden';
                htmlEl.style.opacity = '0';
                htmlEl.style.pointerEvents = 'none';
                htmlEl.remove();
              }
            });
          });
        }
        
        // Also check for any direct children
        const directChildren = splineViewer.querySelectorAll('a, button, [class*="attribution"], [class*="watermark"]');
        directChildren.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.textContent?.includes('Built with Spline') || 
              htmlEl.textContent?.includes('Spline') ||
              htmlEl.getAttribute('href')?.includes('spline')) {
            htmlEl.style.display = 'none';
            htmlEl.remove();
          }
        });
      }
    };

    // Run immediately and then on intervals
    const interval = setInterval(removeAttribution, 500);
    
    // Also use MutationObserver to catch when elements are added
    const observer = new MutationObserver(removeAttribution);
    if (splineContainerRef.current) {
      observer.observe(splineContainerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      clearInterval(interval);
      observer.disconnect();
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <section className="snap-section flex items-center justify-center relative overflow-hidden h-screen">
      {/* Background - Pure black for both sides */}
      <div className="absolute inset-0 bg-[#000000]"></div>
      
      {/* Semicircular purple gradient on left text side - less fade */}
      <div className="absolute left-0 top-0 bottom-0 w-2/3">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at left center, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.15) 40%, transparent 60%)',
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[90vh] w-full py-4 lg:py-6 relative">
          {/* Left Side - Content */}
          <div className="text-center lg:text-left space-y-5 lg:space-y-6 order-2 lg:order-1 relative z-20 -mt-4 lg:-mt-8">
            <div className="space-y-2 lg:space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                <span className="text-white">Create Your</span>
                <span className="block bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent mt-1 lg:mt-2">
                  Perfect Jewelry
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Experience the future of jewelry with AI-powered customization and real-time AR try-on. 
                Design, visualize, and create your dream pieces instantly.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-1">
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
                className="px-5 lg:px-6 py-2.5 lg:py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-[#8B5CF6]/20 text-sm"
              >
                Try AR Try-On
              </a>
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
                className="px-5 lg:px-6 py-2.5 lg:py-3 glass-effect text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 border border-white/10 hover:border-[#8B5CF6]/50 text-sm"
              >
                Start Customizing
              </a>
            </div>

            {/* Stats or Features */}
            <div className="grid grid-cols-3 gap-4 lg:gap-5 pt-4 lg:pt-6 border-t border-white/10">
              <div>
                <div className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#C084FC] bg-clip-text text-transparent">AI</div>
                <div className="text-xs text-gray-400 mt-0.5">Powered</div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#C084FC] bg-clip-text text-transparent">AR</div>
                <div className="text-xs text-gray-400 mt-0.5">Try-On</div>
              </div>
              <div>
                <div className="text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#C084FC] bg-clip-text text-transparent leading-tight">Networking</div>
                <div className="text-xs text-gray-400 mt-0.5">Hub</div>
              </div>
            </div>
          </div>

          {/* Right Side - Spline Component - Full interaction */}
          <div 
            ref={splineContainerRef}
            className="relative w-full h-[600px] lg:h-[80vh] order-1 lg:order-2"
            style={{ 
              pointerEvents: 'auto',
              touchAction: 'auto',
              userSelect: 'none',
              isolation: 'isolate',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              minHeight: '600px'
            }}
          >
            {/* Gradient overlay for smooth blend - black to match background */}
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-gradient-to-r from-[#000000] via-[#000000]/90 via-[#000000]/60 via-[#000000]/30 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-[#000000]/50 via-transparent to-transparent z-10 pointer-events-none"></div>
            
            {!splineLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#000000] z-0">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-400 text-sm">Loading 3D Experience...</p>
                </div>
              </div>
            )}
            {splineLoaded && (
              <spline-viewer
                url="https://prod.spline.design/OIVSsQEj72vcCgTh/scene.splinecode"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'block',
                  pointerEvents: 'auto',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1,
                  borderRadius: '0',
                  border: 'none',
                  outline: 'none'
                }}
              ></spline-viewer>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

