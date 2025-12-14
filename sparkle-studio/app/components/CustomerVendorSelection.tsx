'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// Declare the spline-viewer custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { url: string }, HTMLElement>;
    }
  }
}

export default function CustomerVendorSelection() {
  const sectionRef = useRef<HTMLElement>(null);
  const splineContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const accumulatedWheelRef = useRef(0);
  const scrollProgressRef = useRef(0);

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
      const splineViewers = document.querySelectorAll('spline-viewer');
      splineViewers.forEach((splineViewer) => {
        // Remove from shadow DOM
        const shadowRoot = splineViewer.shadowRoot;
        if (shadowRoot) {
          // Try multiple selectors to catch all attribution elements
          const selectors = [
            'a',
            'button',
            'div',
            'span',
            '[class*="attribution"]',
            '[class*="watermark"]',
            '[class*="spline"]',
            '[id*="attribution"]',
            '[id*="watermark"]',
            '[id*="spline"]',
            '*[href*="spline"]',
            '*[href*="splinetool"]',
          ];

          selectors.forEach((selector) => {
            try {
              const elements = shadowRoot.querySelectorAll(selector);
              elements.forEach((el) => {
                const htmlEl = el as HTMLElement;
                const text = htmlEl.textContent || '';
                const href = htmlEl.getAttribute('href') || '';
                
                if (text.includes('Built with Spline') ||
                    text.includes('Spline') ||
                    text.includes('splinetool') ||
                    href.includes('spline') ||
                    href.includes('splinetool') ||
                    htmlEl.classList.toString().toLowerCase().includes('attribution') ||
                    htmlEl.classList.toString().toLowerCase().includes('watermark')) {
                  htmlEl.style.display = 'none !important';
                  htmlEl.style.visibility = 'hidden !important';
                  htmlEl.style.opacity = '0 !important';
                  htmlEl.style.pointerEvents = 'none !important';
                  htmlEl.style.position = 'absolute !important';
                  htmlEl.style.left = '-9999px !important';
                  htmlEl.remove();
                }
              });
            } catch (e) {
              // Ignore errors
            }
          });
        }
        
        // Also check direct children
        const directChildren = splineViewer.querySelectorAll('a, button, div, span');
        directChildren.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const text = htmlEl.textContent || '';
          const href = htmlEl.getAttribute('href') || '';
          
          if (text.includes('Built with Spline') ||
              text.includes('Spline') ||
              href.includes('spline')) {
            htmlEl.remove();
          }
        });
      });
    };

    // Run immediately and more frequently
    removeAttribution();
    const interval = setInterval(removeAttribution, 100);
    
    // Also use MutationObserver to catch when elements are added
    const observer = new MutationObserver(removeAttribution);
    if (splineContainerRef.current) {
      observer.observe(splineContainerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'id', 'href'],
      });
    }
    
    // Also observe the document for any new spline-viewer elements
    const documentObserver = new MutationObserver(() => {
      removeAttribution();
    });
    documentObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
      documentObserver.disconnect();
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const scrollContainer = document.querySelector('.snap-scroll-container') as HTMLElement;
    if (!scrollContainer) {
      return;
    }

    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if section is at top (snapped)
      const isAtTop = rect.top >= -5 && rect.top <= 5;
      
      if (!isAtTop) {
        // Reset when section is not at top
        accumulatedWheelRef.current = 0;
        setScrollProgress(0);
        return;
      }
      
      // Calculate progress based on accumulated wheel scroll
      const animationDistance = windowHeight * 0.6; // Animation distance
      let progress = Math.min(accumulatedWheelRef.current / animationDistance, 1);
      progress = Math.max(0, Math.min(1, progress));
      
      // Apply cubic easing for curvilinear motion
      const easedProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      scrollProgressRef.current = easedProgress;
      setScrollProgress(easedProgress);
    };

    const handleWheel = (e: WheelEvent) => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const isAtTop = rect.top >= -5 && rect.top <= 5;
      
      // If section is at top and cards haven't reached center yet, prevent scroll and animate cards
      if (isAtTop && scrollProgressRef.current < 1 && e.deltaY > 0) {
        e.preventDefault();
        e.stopPropagation();
        
        // Accumulate wheel delta to animate cards
        accumulatedWheelRef.current += e.deltaY * 0.5; // Scale for smoother control
        handleScroll();
      } else if (isAtTop && scrollProgressRef.current < 1 && e.deltaY < 0 && accumulatedWheelRef.current > 0) {
        // Allow scrolling back to reset cards
        e.preventDefault();
        e.stopPropagation();
        accumulatedWheelRef.current = Math.max(0, accumulatedWheelRef.current + e.deltaY * 0.5);
        handleScroll();
      }
      // If scrollProgress >= 1, allow normal scrolling to continue
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false }); // Need preventDefault
    handleScroll();
    
    const interval = setInterval(handleScroll, 50);
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      scrollContainer.removeEventListener('wheel', handleWheel);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Curvilinear motion: Cards start at top corners and curve to center
  // Using different easing for X and Y creates a more pronounced curved path
  const easeInOutCubic = (t: number) => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // X movement uses standard easing (smooth)
  const xProgress = easeInOutCubic(scrollProgress);
  // Y movement uses quadratic easing (faster start, creates arc effect)
  const yProgress = scrollProgress * scrollProgress;
  
  // Customer card: starts at top-left corner, curves to center
  // X: starts at -400px (left), moves to 0 (center) - smooth easing
  // Y: starts at -200px (top), moves to 0 (center) - quadratic easing for arc
  const customerTranslateX = (1 - xProgress) * -400;
  const customerTranslateY = (1 - yProgress) * -200;
  
  // Vendor card: starts at top-right corner, curves to center
  // X: starts at 400px (right), moves to 0 (center) - smooth easing
  // Y: starts at -200px (top), moves to 0 (center) - quadratic easing for arc
  const vendorTranslateX = (1 - xProgress) * 400;
  const vendorTranslateY = (1 - yProgress) * -200;
  
  // Opacity should be visible even when cards are at corners
  const opacity = Math.max(0.3, scrollProgress);

  return (
    <section 
      id="customer-vendor-selection"
      ref={sectionRef}
      className="snap-section flex items-center justify-center relative bg-[#000000]"
      style={{ overflow: 'visible', minHeight: '100vh', height: '100vh', scrollSnapAlign: 'start', paddingTop: '6rem', paddingBottom: '2rem' }}
    >
      {/* Spline Background */}
      <div
        ref={splineContainerRef}
        className="absolute inset-0 w-full h-full z-0"
        style={{
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {!splineLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#000000]">
            <div className="w-16 h-16 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {splineLoaded && (
          <spline-viewer
            url="https://prod.spline.design/dv9l48QgAI4tc0-w/scene.splinecode"
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              pointerEvents: 'none',
              opacity: 0.6, // Slightly transparent so content is visible
            }}
          ></spline-viewer>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full h-full flex flex-col justify-center" style={{ overflow: 'visible' }}>
        <div className="max-w-4xl mx-auto text-center w-full">
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 transition-opacity duration-300"
            style={{ opacity }}
          >
            Choose Your
            <span className="block bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent mt-1">
              Experience
            </span>
          </h2>
          <p 
            className="text-gray-400 text-base lg:text-lg mb-8 max-w-2xl mx-auto transition-opacity duration-300"
            style={{ opacity }}
          >
            Select your role to continue to your personalized dashboard
          </p>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 relative" style={{ overflow: 'visible' }}>
            <Link
              href="/login/customer"
              className="group relative overflow-hidden rounded-2xl p-8 lg:p-12 transition-all duration-300 hover:scale-105 border-2"
              style={{
                transform: `translate(${customerTranslateX}px, ${customerTranslateY}px)`,
                opacity: opacity,
                willChange: 'transform, opacity',
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.8)';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(139, 92, 246, 0.6), 0 8px 32px rgba(139, 92, 246, 0.4), inset 0 0 60px rgba(139, 92, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5)';
              }}
            >
              {/* Lighting effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/0 via-[#8B5CF6]/0 to-[#8B5CF6]/0 group-hover:from-[#8B5CF6]/20 group-hover:via-[#A78BFA]/15 group-hover:to-[#C084FC]/10 transition-all duration-300 rounded-2xl"></div>
              
              <div className="relative z-10">
                <div className="text-5xl lg:text-6xl mb-6 filter drop-shadow-lg">👤</div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3 drop-shadow-lg">For Customers</h3>
                <p className="text-gray-300 text-sm lg:text-base drop-shadow-md">
                  Browse, try on, and customize jewelry with AR and AI
                </p>
              </div>
              
              {/* Animated glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{
                background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}></div>
            </Link>

            <Link
              href="/login/vendor"
              className="group relative overflow-hidden rounded-2xl p-8 lg:p-12 transition-all duration-300 hover:scale-105 border-2"
              style={{
                transform: `translate(${vendorTranslateX}px, ${vendorTranslateY}px)`,
                opacity: opacity,
                willChange: 'transform, opacity',
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.8)';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(139, 92, 246, 0.6), 0 8px 32px rgba(139, 92, 246, 0.4), inset 0 0 60px rgba(139, 92, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5)';
              }}
            >
              {/* Lighting effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/0 via-[#8B5CF6]/0 to-[#8B5CF6]/0 group-hover:from-[#8B5CF6]/20 group-hover:via-[#A78BFA]/15 group-hover:to-[#C084FC]/10 transition-all duration-300 rounded-2xl"></div>
              
              <div className="relative z-10">
                <div className="text-5xl lg:text-6xl mb-6 filter drop-shadow-lg">🏪</div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3 drop-shadow-lg">For Vendors</h3>
                <p className="text-gray-300 text-sm lg:text-base drop-shadow-md">
                  Manage your jewelry business with analytics and networking
                </p>
              </div>
              
              {/* Animated glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{
                background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}></div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

