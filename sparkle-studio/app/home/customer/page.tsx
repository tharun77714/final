'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DarkVeil from '@/app/components/DarkVeil';

// Declare the spline-viewer custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { url: string }, HTMLElement>;
    }
  }
}

export default function CustomerHome() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showRobot, setShowRobot] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [splineError, setSplineError] = useState(false);
  const [robotError, setRobotError] = useState(false);
  const router = useRouter();

  // Load Spline script with error handling
  useEffect(() => {
    const removeSplineAttribution = () => {
      const splineViewers = document.querySelectorAll('spline-viewer');
      splineViewers.forEach((viewer) => {
        try {
          const shadowRoot = viewer.shadowRoot;
          if (shadowRoot) {
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

    const handleSplineError = (event: ErrorEvent) => {
      if (event.message && (event.message.includes('buffer') || event.message.includes('Data read'))) {
        console.warn('Spline buffer error caught, disabling robot');
        setRobotError(true);
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
      return false;
    };

    window.addEventListener('error', handleSplineError);

    const checkSplineReady = () => {
      try {
        if (customElements.get('spline-viewer')) {
          setSplineLoaded(true);
          return true;
        }
      } catch (e) {
        setRobotError(true);
      }
      return false;
    };

    const loadSpline = () => {
      try {
        if (checkSplineReady()) return;

        const existingScript = document.querySelector('script[src*="spline-viewer"]');
        if (existingScript) {
          let checkCount = 0;
          const maxChecks = 30;
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
          let checkCount = 0;
          const maxChecks = 30;
          const checkInterval = setInterval(() => {
            if (checkSplineReady() || checkCount >= maxChecks) {
              clearInterval(checkInterval);
              if (!robotError && checkCount < maxChecks) {
                setSplineLoaded(true);
                setTimeout(removeSplineAttribution, 500);
              }
            }
            checkCount++;
          }, 100);
        };
        script.onerror = () => {
          setSplineError(true);
          setRobotError(true);
        };
        document.head.appendChild(script);
        
        setTimeout(() => {
          removeSplineAttribution();
        }, 1000);
      } catch (e) {
        setRobotError(true);
      }
    };

    loadSpline();
    
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

  // Remove Spline attribution
  useEffect(() => {
    if (!splineLoaded) return;

    let rafId: number;
    let lastCheck = 0;
    const checkInterval = 2000;

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
    
    const timeout = setTimeout(() => {
      cancelAnimationFrame(rafId);
    }, 10000);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeout);
    };
  }, [splineLoaded]);

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

  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* DarkVeil WebGL Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <DarkVeil 
          hueShift={280}
          speed={0.5}
          resolutionScale={1}
        />
      </div>

      <div className="relative z-10">
        {/* Elegant Navbar with Glassmorphism */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto">
            <div
              className="rounded-2xl px-6 lg:px-8 py-4 backdrop-blur-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(26, 22, 37, 0.8) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center justify-between">
                <Link href="/home/customer" className="flex items-center space-x-2 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-white">Sparkle Studio</span>
                    <span className="text-purple-400 font-medium text-sm ml-2">| Customer</span>
                  </div>
                </Link>

                <div className="hidden md:flex items-center space-x-1">
                  <Link 
                    href="/home/customer" 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-purple-400 font-medium text-sm bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Home</span>
                  </Link>
                  <Link 
                    href="/gallery" 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 transition-all text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Gallery</span>
                  </Link>
                  <Link 
                    href="/ai-customization" 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 transition-all text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>AI Customization</span>
                  </Link>
                  <Link 
                    href="/ar-tryon" 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 transition-all text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>AR Try-On</span>
                  </Link>
                  <Link 
                    href="/networks" 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 transition-all text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Networks</span>
                  </Link>
                  <div className="relative profile-dropdown">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold hover:scale-110 transition-transform shadow-lg shadow-purple-500/50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-purple-500/30 overflow-hidden z-50">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
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
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-purple-500/30 overflow-hidden z-50">
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
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
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="max-w-7xl mx-auto text-center">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                Sparkle Studio
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Discover exquisite jewelry collections and connect with premium vendors worldwide
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/gallery"
                className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started
              </Link>
              <Link
                href="/networks"
                className="px-8 py-4 bg-gray-800/50 border border-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800/70 transition-all transform hover:scale-105 backdrop-blur-sm"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Spline Robot - Appears on hover/interaction */}
      {splineLoaded && !splineError && !robotError ? (
        <div
          className="fixed bottom-24 right-20 z-40 transition-all duration-500 ease-out"
          style={{
            opacity: showRobot || isChatOpen ? 1 : 0.4,
            transform: showRobot || isChatOpen ? 'translateX(0) translateY(0) rotate(-5deg) scale(1)' : 'translateX(50px) translateY(50px) rotate(8deg) scale(0.75)',
            pointerEvents: 'auto',
            width: '220px',
            height: '220px',
            willChange: 'transform, opacity',
            visibility: showRobot || isChatOpen ? 'visible' : 'visible',
          }}
          onMouseEnter={() => setShowRobot(true)}
          onMouseLeave={() => !isChatOpen && setShowRobot(false)}
        >
          <spline-viewer
            url="https://prod.spline.design/RPr04LqVOW8fwh6b/scene.splinecode"
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          />
        </div>
      ) : robotError ? null : (
        <div className="fixed bottom-24 right-20 z-40 w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
          <div className="text-purple-400 text-xs">Loading...</div>
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
        }}
        onMouseLeave={() => {
          if (!isChatOpen) {
            setShowRobot(false);
          }
        }}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110"
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
          className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-gray-800 rounded-2xl shadow-2xl border border-purple-500/30 flex flex-col overflow-hidden"
          onMouseEnter={() => setShowRobot(true)}
          onMouseLeave={() => setShowRobot(false)}
        >
          {/* Chat Header */}
          <div className="bg-purple-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Sparkle Studio Support</h3>
                <p className="text-purple-200 text-xs">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">SS</span>
              </div>
              <div className="bg-gray-700 rounded-lg px-4 py-2 max-w-[80%]">
                <p className="text-white text-sm">Hello! How can I help you today?</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 justify-end">
              <div className="bg-purple-600 rounded-lg px-4 py-2 max-w-[80%]">
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
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center transition-colors">
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
