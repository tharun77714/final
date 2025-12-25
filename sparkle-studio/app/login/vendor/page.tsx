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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState<string | null>(null);
  const [formStep, setFormStep] = useState<'form' | 'google'>('form'); // Track form step
  const [googleButtonReady, setGoogleButtonReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Vendor-specific registration fields
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [businessAddress, setBusinessAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [yearsInBusiness, setYearsInBusiness] = useState('');
  const [vendorType, setVendorType] = useState<'Manufacturer' | 'Wholesaler' | 'Retailer' | ''>('');

  const GOOGLE_CLIENT_ID = '827839751926-62d8mnv6rl242t08qqca88j3j29udskc.apps.googleusercontent.com';

  // Generate a random secure password for Google-authenticated users
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

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

      // Set email from Google and generate password
      setEmail(verifyData.email);
      const randomPassword = generateRandomPassword();
      setPassword(randomPassword);
      setGoogleIdToken(response.credential);

      // Automatically submit registration
      await handleRegistration(verifyData.email, randomPassword, response.credential);
    } catch (err) {
      setError('Google authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle registration after Google sign-in - collects all form data and saves to MongoDB
  const handleRegistration = async (userEmail: string, userPassword: string, idToken: string) => {
    try {
      // Read all form values directly from DOM to get latest data
      const getValue = (id: string) => {
        const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
        return el?.value?.trim() || '';
      };

      const getAddressValue = (placeholder: string) => {
        const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
        const el = inputs.find(input => input.placeholder === placeholder);
        return el?.value?.trim() || '';
      };

      // Read address fields - try DOM first, then state
      const streetEl = document.getElementById('businessAddressStreet') as HTMLInputElement;
      const streetValue = streetEl?.value?.trim() || businessAddress?.street?.toString().trim() || '';
      
      // Find city, state, pincode by placeholder
      const cityValue = getAddressValue('City') || businessAddress?.city?.toString().trim() || '';
      const stateValue = getAddressValue('State') || businessAddress?.state?.toString().trim() || '';
      const pincodeValue = getAddressValue('Pincode') || businessAddress?.pincode?.toString().trim() || '';

      // Collect all form data - use DOM values first, fallback to state
      const formData = {
        businessName: getValue('businessName') || businessName?.toString().trim() || '',
        ownerName: getValue('ownerName') || ownerName?.toString().trim() || '',
        mobileNumber: getValue('mobileNumber') || mobileNumber?.toString().trim() || '',
        businessAddress: {
          street: streetValue,
          city: cityValue,
          state: stateValue,
          pincode: pincodeValue,
        },
        yearsInBusiness: (() => {
          const val = getValue('yearsInBusiness') || yearsInBusiness?.toString().trim() || '0';
          const num = parseInt(val);
          return isNaN(num) ? 0 : num;
        })(),
        vendorType: getValue('vendorType') || vendorType?.toString().trim() || '',
      };

      // Send all collected data to backend - backend will handle validation
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword,
          name: formData.ownerName,
          role: 'vendor',
          googleIdToken: idToken,
          businessName: formData.businessName,
          ownerName: formData.ownerName,
          mobileNumber: formData.mobileNumber,
          businessAddress: formData.businessAddress,
          yearsInBusiness: formData.yearsInBusiness,
          vendorType: formData.vendorType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/home/vendor');
      } else {
        setError(data.error || 'Registration failed');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration. Please try again.');
      setIsLoading(false);
    }
  };

  // Validate form fields - reads from both state and DOM to ensure latest values
  const validateForm = () => {
    // Clear any previous errors first
    setError('');
    
    // Try to read from DOM first (most up-to-date), fallback to state
    const getBusinessName = () => {
      const el = document.getElementById('businessName') as HTMLInputElement;
      return el?.value?.trim() || businessName?.toString().trim() || '';
    };
    
    const getOwnerName = () => {
      const el = document.getElementById('ownerName') as HTMLInputElement;
      return el?.value?.trim() || ownerName?.toString().trim() || '';
    };
    
    const getMobileNumber = () => {
      const el = document.getElementById('mobileNumber') as HTMLInputElement;
      return el?.value?.trim() || mobileNumber?.toString().trim() || '';
    };
    
    const getStreet = () => {
      const el = document.getElementById('businessAddressStreet') as HTMLInputElement;
      return el?.value?.trim() || businessAddress?.street?.toString().trim() || '';
    };
    
    const getCity = () => {
      const el = document.querySelector('input[placeholder="City"]') as HTMLInputElement;
      return el?.value?.trim() || businessAddress?.city?.toString().trim() || '';
    };
    
    const getState = () => {
      const el = document.querySelector('input[placeholder="State"]') as HTMLInputElement;
      return el?.value?.trim() || businessAddress?.state?.toString().trim() || '';
    };
    
    const getPincode = () => {
      const el = document.querySelector('input[placeholder="Pincode"]') as HTMLInputElement;
      return el?.value?.trim() || businessAddress?.pincode?.toString().trim() || '';
    };
    
    const getYearsInBusiness = () => {
      const el = document.getElementById('yearsInBusiness') as HTMLInputElement;
      return el?.value?.trim() || yearsInBusiness?.toString().trim() || '';
    };
    
    const getVendorType = () => {
      const el = document.getElementById('vendorType') as HTMLSelectElement;
      return el?.value?.trim() || vendorType?.toString().trim() || '';
    };
    
    // Validate each field
    const businessNameVal = getBusinessName();
    if (businessNameVal.length === 0) {
      setError('Business Name is required');
      return false;
    }
    
    const ownerNameVal = getOwnerName();
    if (ownerNameVal.length === 0) {
      setError('Owner / Authorized Person Name is required');
      return false;
    }
    
    const mobileNumberVal = getMobileNumber();
    if (mobileNumberVal.length === 0) {
      setError('Mobile Number is required');
      return false;
    }
    
    const streetVal = getStreet();
    if (streetVal.length === 0) {
      setError('Business Address (Street) is required');
      return false;
    }
    
    const cityVal = getCity();
    if (cityVal.length === 0) {
      setError('Business Address (City) is required');
      return false;
    }
    
    const stateVal = getState();
    if (stateVal.length === 0) {
      setError('Business Address (State) is required');
      return false;
    }
    
    const pincodeVal = getPincode();
    if (pincodeVal.length === 0) {
      setError('Business Address (Pincode) is required');
      return false;
    }
    
    const yearsValue = getYearsInBusiness();
    const yearsNum = yearsValue ? Number(yearsValue) : NaN;
    if (!yearsValue || isNaN(yearsNum) || yearsNum < 0) {
      setError('Years in Jewellery Business is required and must be a valid number');
      return false;
    }
    
    const vendorTypeVal = getVendorType();
    if (vendorTypeVal.length === 0) {
      setError('Type of Vendor is required');
      return false;
    }
    
    return true;
  };

  // Handle Next button click
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (validateForm()) {
      setFormStep('google');
    }
  };

  // Handle login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: 'vendor',
          googleIdToken: googleIdToken || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/home/vendor');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Modified Google sign-in handler - proceed with Google sign-in and save all form data
  const handleGoogleSignInWithValidation = async (response: any) => {
    setError('');
    setIsLoading(true);
    
    // Proceed directly with Google sign-in - all form data will be collected and saved to MongoDB
    // No strict validation - backend will handle any missing required fields
    await handleGoogleSignIn(response);
  };

  useEffect(() => {
    const registerParam = searchParams.get('register') === 'true';
    setIsRegister(registerParam);
    // Reset form step when switching between login/register
    if (!registerParam) {
      setFormStep('form');
    }
  }, [searchParams]);

  useEffect(() => {
    // Initialize Google Sign-In with appropriate callback based on form step and mode
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: isRegister 
            ? (formStep === 'form' ? handleGoogleSignInWithValidation : handleGoogleSignIn)
            : handleGoogleSignIn,
        });
      }
    };

    // Render button when element is available
    const renderButton = () => {
      // Check if ref element exists and is in the DOM
      if (!googleButtonRef.current || !document.contains(googleButtonRef.current)) {
        // Element not in DOM yet, retry
        setTimeout(renderButton, 300);
        return;
      }

      if (window.google && window.google.accounts && googleButtonRef.current) {
        try {
          // Clear any existing content
          googleButtonRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: isRegister ? 'signup_with' : 'signin_with',
            type: 'standard',
          });
          setGoogleButtonReady(true);
        } catch (err) {
          console.error('Error rendering Google button:', err);
          setGoogleButtonReady(false);
          // Retry after a delay
          setTimeout(renderButton, 1000);
        }
      } else if (!window.google) {
        // If Google script not loaded, retry
        setGoogleButtonReady(false);
        setTimeout(renderButton, 500);
      }
    };

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
        initializeGoogleSignIn();
        // Try rendering button after script loads
        setTimeout(renderButton, 100);
      };

      script.onerror = () => {
        console.error('Failed to load Google Sign-In script');
        setError('Failed to load Google Sign-In. Please refresh the page.');
      };

      document.head.appendChild(script);
    } else {
      // Script already exists, re-initialize with updated callback and render
      initializeGoogleSignIn();
      setTimeout(renderButton, 100);
    }

    // Also try rendering after DOM updates
    setTimeout(renderButton, 300);
    setTimeout(renderButton, 800);
  }, [isRegister, formStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center px-6 py-12">
      {/* Card Container */}
      <div className="w-full max-w-7xl bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Column - Visual/Branding (40% width) */}
        <div className="hidden lg:flex lg:w-[40%] relative bg-gradient-to-br from-blue-500 via-blue-600 via-cyan-500 to-blue-800 overflow-hidden">
          {/* Decorative abstract shapes */}
          <div className="absolute top-10 left-10 w-24 h-24 bg-cyan-400 rounded-full opacity-30"></div>
          <div className="absolute top-32 right-20 w-32 h-12 bg-sky-300 rounded-full opacity-40 transform rotate-12"></div>
          <div className="absolute bottom-32 left-32 w-28 h-12 bg-cyan-400 rounded-full opacity-40 transform -rotate-12"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-300 rounded-full opacity-20 transform rotate-45"></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-sky-300 rounded-full opacity-30"></div>
          
          <div className="relative z-10 flex flex-col justify-between p-10 py-12 text-white w-full">
            <div>
              <Link href="/" className="text-xl font-bold mb-4 inline-flex items-center gap-2 hover:text-blue-200 transition-colors">
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
                  src="/media/vendor-removebg-preview.png" 
                  alt="Welcome" 
                  className="relative z-10 w-full max-w-xs h-auto object-contain drop-shadow-2xl"
                />
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2 text-white">
                  Welcome {isRegister ? '' : 'Back'}!
                </h2>
                <p className="text-blue-100 text-sm font-medium">Capturing Moments, Creating Memories</p>
              </div>
            </div>
            
            <div className="text-left text-blue-200/80 text-xs">
              Copyright © 2024, Sparkle Studio. All rights reserved.
            </div>
          </div>
        </div>

        {/* Right Column - Form (60% width) */}
        <div className="flex-1 lg:w-[60%] flex items-start justify-center bg-gray-800 px-6 py-8 overflow-y-auto max-h-screen">
        <div className="w-full max-w-sm py-4">
          {/* Tabs */}
          <div className="flex gap-8 mb-6 border-b border-gray-700">
            <button
              onClick={() => setIsRegister(true)}
              className={`pb-4 px-2 font-medium text-lg transition-colors ${
                isRegister
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setIsRegister(false)}
              className={`pb-4 px-2 font-medium text-lg transition-colors ${
                !isRegister
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Login Method Toggle */}

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {isRegister && formStep === 'google' && googleIdToken && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400 text-sm">
              ✓ Google email verified: {email}
            </div>
          )}

          {isRegister && formStep === 'form' ? (
            // Step 1: Form fields (no email/password)
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3" noValidate>
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-300 mb-2">
                  Business Name (as per registration) <span className="text-red-400">*</span>
                </label>
                <input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter business name"
                />
              </div>

              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium text-gray-300 mb-2">
                  Owner / Authorized Person Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="ownerName"
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter owner/authorized person name"
                />
              </div>

              <div>
                <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-300 mb-2">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <input
                  id="mobileNumber"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter mobile number"
                />
              </div>

              <div>
                <label htmlFor="businessAddressStreet" className="block text-sm font-medium text-gray-300 mb-2">
                  Business Address <span className="text-red-400">*</span>
                </label>
                <input
                  id="businessAddressStreet"
                  type="text"
                  value={businessAddress.street}
                  onChange={(e) => setBusinessAddress({ ...businessAddress, street: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                  placeholder="Street Address"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={businessAddress.city}
                    onChange={(e) => setBusinessAddress({ ...businessAddress, city: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={businessAddress.state}
                    onChange={(e) => setBusinessAddress({ ...businessAddress, state: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="State"
                  />
                </div>
                <input
                  type="text"
                  value={businessAddress.pincode}
                  onChange={(e) => setBusinessAddress({ ...businessAddress, pincode: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-3"
                  placeholder="Pincode"
                />
              </div>

              <div>
                <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-300 mb-2">
                  Years in Jewellery Business <span className="text-red-400">*</span>
                </label>
                <input
                  id="yearsInBusiness"
                  type="number"
                  value={yearsInBusiness}
                  onChange={(e) => setYearsInBusiness(e.target.value)}
                  required
                  min="0"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter years in business"
                />
              </div>

              <div>
                <label htmlFor="vendorType" className="block text-sm font-medium text-gray-300 mb-2">
                  Type of Vendor <span className="text-red-400">*</span>
                </label>
                <select
                  id="vendorType"
                  value={vendorType}
                  onChange={(e) => setVendorType(e.target.value as 'Manufacturer' | 'Wholesaler' | 'Retailer')}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select vendor type</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Retailer">Retailer</option>
                </select>
              </div>

              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 rounded border-gray-700 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-400">
                  I agree to the{' '}
                  <Link href="#" className="text-blue-400 hover:text-blue-300 underline transition-colors">
                    Terms & Conditions
                  </Link>
                </label>
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-400 mb-3 text-center">
                  Complete your registration by signing up with Google
                </p>
                <div ref={googleButtonRef} className="w-full min-h-[42px]"></div>
                {!googleButtonReady && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500">Loading Google Sign-In...</p>
                  </div>
                )}
              </div>
            </form>
          ) : isRegister && formStep === 'google' ? (
            // Step 2: Google Sign-Up
            <div className="space-y-6">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Complete Your Registration</h3>
                <p className="text-gray-400 text-sm mb-4">Please sign up with Google to verify your email and complete your vendor registration.</p>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><span className="font-medium">Business Name:</span> {businessName}</p>
                  <p><span className="font-medium">Owner Name:</span> {ownerName}</p>
                  <p><span className="font-medium">Mobile:</span> {mobileNumber}</p>
                </div>
              </div>

              <div className="mt-6">
                <div ref={googleButtonRef} className="w-full"></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormStep('form');
                  setError('');
                }}
                className="w-full text-gray-400 hover:text-gray-300 text-sm underline"
              >
                ← Back to edit information
              </button>
            </div>
          ) : (
            // Login form (existing)
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={!!googleIdToken}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Logging in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link href="/login/vendor?register=true" className="text-sm text-red-400 hover:text-red-300">
                  I have an Account?
                </Link>
              </div>
            </>
          )}

          {/* Google Login Button - Show for login mode only (registration has its own Google button in the form) */}
          {!isRegister && (
            <div className="mt-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Or login with</span>
                </div>
              </div>

              <div>
                <div ref={googleButtonRef} className="w-full"></div>
              </div>
            </div>
          )}
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
