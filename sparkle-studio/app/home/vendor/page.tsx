'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  description?: string;
}

// Sample featured products data
const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Diamond Solitaire Ring',
    image: '/media/230f7453-accc-4600-8149-2857eade02e5.jpg',
    price: 25000,
    category: 'Rings',
    description: 'Elegant solitaire diamond ring',
  },
  {
    id: '2',
    name: 'Pearl Necklace',
    image: '/media/unnamed-removebg-preview-Picsart-AiImageEnhancer_imgupscaler.ai_General_16K.jpg',
    price: 15000,
    category: 'Necklaces',
    description: 'Classic pearl necklace',
  },
  {
    id: '3',
    name: 'Gold Bracelet',
    image: '/media/gmap.jpg',
    price: 18000,
    category: 'Bracelets',
    description: 'Luxurious gold bracelet',
  },
  {
    id: '4',
    name: 'Emerald Earrings',
    image: '/media/login_page-removebg-preview.png',
    price: 12000,
    category: 'Earrings',
    description: 'Stunning emerald earrings',
  },
  {
    id: '5',
    name: 'Platinum Chain',
    image: '/media/vendor-removebg-preview.png',
    price: 22000,
    category: 'Chains',
    description: 'Premium platinum chain',
  },
];

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: 'AR Try-On',
    description: 'Experience jewelry in real-time with our advanced AR technology',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'AI Customization',
    description: 'Design your perfect piece with intelligent AI suggestions',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Networking Hub',
    description: 'Connect with jewelers, designers, and enthusiasts',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Secure Payments',
    description: 'Safe and secure payment processing for all transactions',
  },
];

// Declare the spline-viewer custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { url: string }, HTMLElement>;
    }
  }
}

export default function VendorHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showRobot, setShowRobot] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [splineError, setSplineError] = useState(false);
  const [robotError, setRobotError] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load Spline script with error handling
  useEffect(() => {
    // Function to remove Spline attribution
    const removeSplineAttribution = () => {
      const splineViewers = document.querySelectorAll('spline-viewer');
      splineViewers.forEach((viewer) => {
        try {
          // Access shadow DOM
          const shadowRoot = viewer.shadowRoot;
          if (shadowRoot) {
            // Remove all possible attribution elements
            const selectors = [
              'a[href*="spline"]',
              'a[href*="splinetool"]',
              'button',
              '[class*="attribution"]',
              '[class*="watermark"]',
              '[id*="attribution"]',
              '[id*="watermark"]',
              '[slot="attribution"]',
              '[data-spline-attribution]',
            ];
            
            selectors.forEach((selector) => {
              const elements = shadowRoot.querySelectorAll(selector);
              elements.forEach((el) => {
                const htmlEl = el as HTMLElement;
                if (htmlEl.textContent?.includes('Built with') || 
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
        } catch (e) {
          // Silently fail
        }
      });
    };

    // Global error handler for Spline
    const handleSplineError = (event: ErrorEvent) => {
      if (event.message && event.message.includes('buffer')) {
        console.warn('Spline buffer error caught, disabling robot');
        setRobotError(true);
        event.preventDefault();
        return true;
      }
      return false;
    };

    window.addEventListener('error', handleSplineError);

    const checkSplineReady = () => {
      try {
        if (customElements.get('spline-viewer')) {
          console.log('Spline viewer custom element is ready');
          setSplineLoaded(true);
          return true;
        }
      } catch (e) {
        console.error('Error checking Spline:', e);
        setRobotError(true);
      }
      return false;
    };

    const loadSpline = () => {
      try {
        // First check if already loaded
        if (checkSplineReady()) return;

        const existingScript = document.querySelector('script[src*="spline-viewer"]');
        if (existingScript) {
          // Script exists, wait for custom element (optimized - check less frequently)
          let checkCount = 0;
          const maxChecks = 30; // 3 seconds max (30 * 100ms)
          const checkInterval = setInterval(() => {
            if (checkSplineReady() || checkCount >= maxChecks) {
              clearInterval(checkInterval);
              if (!robotError && checkCount < maxChecks) {
                setSplineLoaded(true);
              }
            }
            checkCount++;
          }, 100);
          return;
        }

        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://unpkg.com/@splinetool/viewer@1.12.28/build/spline-viewer.js';
        script.onload = () => {
          // Wait for custom element to be defined (optimized)
          let checkCount = 0;
          const maxChecks = 30; // 3 seconds max
          const checkInterval = setInterval(() => {
            if (checkSplineReady() || checkCount >= maxChecks) {
              clearInterval(checkInterval);
              if (!robotError && checkCount < maxChecks) {
                setSplineLoaded(true);
                // Remove attribution after loading
                setTimeout(removeSplineAttribution, 500);
              }
            }
            checkCount++;
          }, 100);
        };
      script.onerror = () => {
        console.error('Failed to load Spline script');
        setSplineError(true);
        setRobotError(true);
      };
      document.head.appendChild(script);
      
      // Remove attribution once after loading (no need for interval)
      setTimeout(() => {
        removeSplineAttribution();
      }, 1000);
      } catch (e) {
        console.error('Error loading Spline:', e);
        setRobotError(true);
      }
    };

    // Try loading immediately
    loadSpline();
    
    // Also try after a delay in case DOM isn't ready
    const timeout = setTimeout(() => {
      if (!splineLoaded && !robotError) {
        loadSpline();
      }
    }, 500);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('error', handleSplineError);
    };
  }, [splineLoaded, robotError]);

  // Remove Spline attribution (optimized - runs less frequently)
  useEffect(() => {
    if (!splineLoaded) return;

    let rafId: number;
    let lastCheck = 0;
    const checkInterval = 2000; // Check every 2 seconds instead of 500ms

    const removeAttribution = (timestamp: number) => {
      if (timestamp - lastCheck >= checkInterval) {
        const splineViewers = document.querySelectorAll('spline-viewer');
        splineViewers.forEach((viewer) => {
          try {
            const shadowRoot = viewer.shadowRoot;
            if (shadowRoot) {
              const elements = shadowRoot.querySelectorAll('a, button, [class*="attribution"], [class*="watermark"]');
              elements.forEach((el) => {
                const htmlEl = el as HTMLElement;
                if (htmlEl.textContent?.includes('Built with') || 
                    htmlEl.textContent?.includes('Spline') ||
                    htmlEl.getAttribute('href')?.includes('spline')) {
                  htmlEl.style.display = 'none';
                  htmlEl.style.visibility = 'hidden';
                  htmlEl.style.opacity = '0';
                  htmlEl.remove();
                }
              });
            }
          } catch (e) {
            // Silently fail
          }
        });
        lastCheck = timestamp;
      }
      rafId = requestAnimationFrame(removeAttribution);
    };

    rafId = requestAnimationFrame(removeAttribution);
    
    // Stop after 10 seconds
    const timeout = setTimeout(() => {
      cancelAnimationFrame(rafId);
    }, 10000);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeout);
    };
  }, [splineLoaded]);

  // Auto-play slider (optimized)
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 5000); // Increased from 4000ms to reduce frequency

    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredProducts.length]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileOpen && !(event.target as Element).closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  }, [featuredProducts.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  }, [featuredProducts.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  return (
    <div className="min-h-screen relative bg-black">
      {/* Beautiful Gradient Background with Blue and Orange */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="w-full h-full bg-gradient-to-br from-black via-blue-900/30 via-orange-900/20 to-black relative overflow-hidden">
          {/* Blue gradient orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-700/15 rounded-full blur-3xl"></div>
          
          {/* Orange gradient orbs */}
          <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl"></div>
          
          {/* Additional accent gradients */}
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-blue-900/10 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-orange-900/10 to-transparent"></div>
        </div>
      </div>
      <div className="relative z-10">
      {/* Elegant Navbar with Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div
            className="rounded-2xl px-6 lg:px-8 py-4 backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(26, 22, 37, 0.8) 100%)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex items-center justify-between">
              <Link href="/home/vendor" className="flex items-center space-x-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">Sparkle Studio</span>
                  <span className="text-blue-400 font-medium text-sm ml-2">| Vendor</span>
                </div>
              </Link>

              <div className="hidden md:flex items-center space-x-1">
                <Link 
                  href="/home/vendor" 
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-blue-400 font-medium text-sm bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Home</span>
                </Link>
                <Link 
                  href="/gallery" 
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-blue-400 hover:bg-blue-500/10 transition-all text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Gallery</span>
                </Link>
                <Link 
                  href="/ai-customization" 
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-blue-400 hover:bg-blue-500/10 transition-all text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>AI Customization</span>
                </Link>
                <Link 
                  href="/ar-tryon" 
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-blue-400 hover:bg-blue-500/10 transition-all text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>AR Try-On</span>
                </Link>
                <Link 
                  href="/networks" 
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-blue-400 hover:bg-blue-500/10 transition-all text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Networks</span>
                </Link>
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold hover:scale-110 transition-transform shadow-lg shadow-blue-500/50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-blue-500/30 overflow-hidden z-50">
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:hidden relative profile-dropdown">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-blue-500/30 overflow-hidden z-50">
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
              Sparkle Studio
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Showcase your jewelry collections and connect with customers worldwide
          </p>
        </div>
      </section>

      {/* 3D Card Slider Section */}
      <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
            Featured <span className="text-blue-400">Collections</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Explore our handpicked selection of premium jewelry pieces
          </p>

          <div
            className="relative"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Slider Container */}
            <div
              ref={sliderRef}
              className="relative h-[500px] md:h-[600px] overflow-visible mx-auto"
              style={{ perspective: '1500px', perspectiveOrigin: '50% 50%', width: '100%', maxWidth: '1400px' }}
            >
              <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                {featuredProducts.map((product, index) => {
                  const offset = index - currentSlide;
                  const absOffset = Math.abs(offset);
                  const isActive = offset === 0;

                  // Calculate position and scale - make cards more visible
                  let translateX = offset * 350;
                  let scale = Math.max(0.75, 1 - absOffset * 0.12);
                  let opacity = Math.max(0.4, 1 - absOffset * 0.3);
                  let zIndex = featuredProducts.length - absOffset;

                  if (absOffset > 2) {
                    opacity = 0;
                    scale = 0.6;
                  }

                  // 3D rotation effect - smoother
                  const rotateY = offset * 15;
                  const translateZ = offset * -60;

                  return (
                    <div
                      key={product.id}
                      className="absolute transition-all duration-700 ease-out cursor-pointer"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translateX(calc(-50% + ${translateX}px)) translateY(-50%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                        opacity: opacity,
                        zIndex: zIndex,
                        transformStyle: 'preserve-3d',
                        willChange: 'transform, opacity',
                        backfaceVisibility: 'hidden',
                      }}
                      onClick={() => goToSlide(index)}
                    >
                      <div
                        className={`w-[280px] md:w-[320px] bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border-2 transition-all ${
                          isActive
                            ? 'border-blue-500 shadow-blue-500/50'
                            : 'border-gray-700 shadow-gray-900/50'
                        }`}
                        style={{
                          willChange: 'transform',
                          transform: isActive ? 'scale(1.05)' : 'scale(1)',
                        }}
                      >
                        <div className="relative h-[300px] md:h-[350px] bg-gradient-to-br from-blue-900/20 to-gray-900">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-jewelry.jpg';
                            }}
                          />
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />
                          )}
                        </div>
                        <div className="p-6 bg-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                              {product.category}
                            </span>
                            {isActive && (
                              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                          {product.description && (
                            <p className="text-sm text-gray-400 mb-4">{product.description}</p>
                          )}
                          {isActive && (
                            <div className="flex justify-center mt-4">
                              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                                View Details
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gray-800/80 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm border border-blue-500/30"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gray-800/80 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm border border-blue-500/30"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {featuredProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-blue-500 w-8'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
            Why Choose <span className="text-blue-400">Sparkle Studio</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Experience the future of jewelry shopping with cutting-edge technology
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800/50 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:transform hover:scale-105 group"
              >
                <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600/20 via-blue-800/20 to-gray-900 rounded-3xl p-12 md:p-16 border border-blue-500/30">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Explore?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Connect with premium vendors, discover unique pieces, and experience jewelry like never before
            </p>
            <Link
              href="/networks"
              className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>Copyright © 2024, Sparkle Studio. All rights reserved.</p>
        </div>
      </footer>
      </div>

      {/* Spline Robot - Appears on hover/interaction */}
      {splineLoaded && !splineError && !robotError ? (
        <div
          className="fixed bottom-24 right-20 z-40 transition-all duration-500 ease-out"
          style={{
            opacity: showRobot ? 1 : 0.4,
            transform: showRobot ? 'translateX(0) translateY(0) rotate(-5deg) scale(1)' : 'translateX(50px) translateY(50px) rotate(8deg) scale(0.75)',
            pointerEvents: 'auto',
            width: '220px',
            willChange: 'transform, opacity',
            height: '220px',
          }}
          onMouseEnter={() => {
            setShowRobot(true);
            console.log('Robot hovered');
          }}
          onMouseLeave={() => {
            if (!isChatOpen) {
              setShowRobot(false);
            }
          }}
        >
          <spline-viewer
            url="https://prod.spline.design/RPr04LqVOW8fwh6b/scene.splinecode"
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              pointerEvents: 'auto',
            }}
          ></spline-viewer>
        </div>
      ) : robotError ? null : (
        <div className="fixed bottom-24 right-20 z-40 w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
          <div className="text-blue-400 text-xs">Loading...</div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => {
          setIsChatOpen(!isChatOpen);
          setShowRobot(true);
        }}
        onMouseEnter={() => {
          setShowRobot(true);
          console.log('Chat button hovered, showing robot');
        }}
        onMouseLeave={() => {
          if (!isChatOpen) {
            setShowRobot(false);
          }
        }}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110"
        aria-label="Open chat"
      >
        {isChatOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Window Popup */}
      {isChatOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-gray-800 rounded-2xl shadow-2xl border border-blue-500/30 flex flex-col overflow-hidden"
          onMouseEnter={() => setShowRobot(true)}
          onMouseLeave={() => setShowRobot(false)}
        >
          {/* Chat Header */}
          <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Sparkle Studio Support</h3>
                <p className="text-blue-200 text-xs">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">SS</span>
              </div>
              <div className="bg-gray-700 rounded-lg px-4 py-2 max-w-[80%]">
                <p className="text-white text-sm">Hello! How can I help you today?</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 justify-end">
              <div className="bg-blue-600 rounded-lg px-4 py-2 max-w-[80%]">
                <p className="text-white text-sm">Hi, I need help with...</p>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
