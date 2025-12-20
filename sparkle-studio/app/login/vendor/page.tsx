'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

declare global {
  interface Window {
    google: any;
  }
}

function VendorLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const GOOGLE_CLIENT_ID = '827839751926-62d8mnv6rl242t08qqca88j3j29udskc.apps.googleusercontent.com';

  const handleGoogleSignIn = async (response: any) => {
    try {
      setError('');
      setIsLoading(true);
      
      // Verify Google token with backend
      const verifyResponse = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: response.credential }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setError(verifyData.error || 'Google authentication failed');
        setIsLoading(false);
        return;
      }

      // Set email and name from Google
      setEmail(verifyData.email);
      setName(verifyData.name || '');
      setGoogleIdToken(response.credential);
      setIsLoading(false);
    } catch (err) {
      setError('Google authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsRegister(searchParams.get('register') === 'true');
  }, [searchParams]);

  useEffect(() => {
    // Check if script already exists
    let script = document.getElementById('google-signin-script') as HTMLScriptElement;
    
    if (!script) {
      // Load Google Sign-In script
      script = document.createElement('script');
      script.id = 'google-signin-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
          });
        }
      };

      document.head.appendChild(script);
    }

    // Render button when element is available
    const renderButton = () => {
      if (window.google && googleButtonRef.current) {
        try {
          // Clear any existing content
          googleButtonRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            type: 'standard',
          });
        } catch (err) {
          console.error('Error rendering Google button:', err);
        }
      }
    };

    // Wait a bit for DOM to update, then render
    setTimeout(() => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
        });
      }
      renderButton();
    }, 100);
    
    setTimeout(renderButton, 500);
  }, [isRegister]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Handle email/Google authentication
    // Google authentication is optional for login, required for registration
    if (isRegister && !googleIdToken) {
      setError('Please sign in with Google first to verify your email for registration');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister
        ? { email, password, name, role: 'vendor', googleIdToken }
        : { email, password, role: 'vendor', googleIdToken: googleIdToken || null };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/home/vendor');
      } else {
        setError(data.error || (isRegister ? 'Registration failed' : 'Login failed'));
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-6 py-12">
      {/* Card Container */}
      <div className="w-full max-w-7xl bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Column - Visual/Branding (40% width) */}
        <div className="hidden lg:flex lg:w-[40%] relative bg-gradient-to-br from-purple-500 via-purple-600 via-pink-500 to-purple-800 overflow-hidden">
          {/* Decorative abstract shapes */}
          <div className="absolute top-10 left-10 w-24 h-24 bg-pink-400 rounded-full opacity-30"></div>
          <div className="absolute top-32 right-20 w-32 h-12 bg-yellow-300 rounded-full opacity-40 transform rotate-12"></div>
          <div className="absolute bottom-32 left-32 w-28 h-12 bg-pink-400 rounded-full opacity-40 transform -rotate-12"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-300 rounded-full opacity-20 transform rotate-45"></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-blue-300 rounded-full opacity-30"></div>
          
          <div className="relative z-10 flex flex-col justify-between p-10 py-12 text-white w-full">
            <div>
              <Link href="/" className="text-xl font-bold mb-4 inline-flex items-center gap-2 hover:text-purple-200 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Sparkle Studio
              </Link>
            </div>
            
            {/* Image and Content Container */}
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <div className="relative mb-4">
                <img 
                  src="/media/login_page-removebg-preview.png" 
                  alt="Welcome" 
                  className="relative z-10 w-full max-w-xs h-auto object-contain drop-shadow-2xl"
                />
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2 text-white">
                  Welcome {isRegister ? '' : 'Back'}!
                </h2>
                <p className="text-purple-100 text-sm font-medium">Capturing Moments, Creating Memories</p>
              </div>
            </div>
            
            <div className="text-left text-purple-200/80 text-xs">
              Copyright © 2024, Sparkle Studio. All rights reserved.
            </div>
          </div>
        </div>

        {/* Right Column - Form (60% width) */}
        <div className="flex-1 lg:w-[60%] flex items-center justify-center bg-gray-800 px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Tabs */}
          <div className="flex gap-8 mb-6 border-b border-gray-700">
            <button
              onClick={() => setIsRegister(true)}
              className={`pb-4 px-2 font-medium text-lg transition-colors ${
                isRegister
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setIsRegister(false)}
              className={`pb-4 px-2 font-medium text-lg transition-colors ${
                !isRegister
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Sign In
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {googleIdToken && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400 text-sm">
              ✓ Google email verified: {email}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={!!googleIdToken}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!googleIdToken}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (isRegister ? 'Creating account...' : 'Logging in...') : (isRegister ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          {!isRegister && (
            <div className="mt-4 text-center">
              <Link href="/login/vendor?register=true" className="text-sm text-red-400 hover:text-red-300">
                I have an Account?
              </Link>
            </div>
          )}

          {/* Google Login Button */}
          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Or {isRegister ? 'register' : 'login'} with</span>
              </div>
            </div>

            <div>
              <div ref={googleButtonRef} className="w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VendorLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#1a1625] text-white">Loading...</div>}>
      <VendorLoginForm />
    </Suspense>
  );
}
