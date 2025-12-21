'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Vendor {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  mobileNumber: string;
  businessAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  yearsInBusiness: number;
  vendorType: 'Manufacturer' | 'Wholesaler' | 'Retailer';
  createdAt: string;
}

export default function CustomerHome() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Fetch vendors on component mount
  useEffect(() => {
    fetchVendors();
  }, []);

  // Filter vendors based on search and type
  useEffect(() => {
    let filtered = vendors;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (vendor) =>
          vendor.businessName.toLowerCase().includes(query) ||
          vendor.ownerName.toLowerCase().includes(query) ||
          vendor.businessAddress?.city?.toLowerCase().includes(query) ||
          vendor.businessAddress?.state?.toLowerCase().includes(query) ||
          vendor.vendorType.toLowerCase().includes(query)
      );
    }

    // Filter by vendor type
    if (selectedType) {
      filtered = filtered.filter((vendor) => vendor.vendorType === selectedType);
    }

    setFilteredVendors(filtered);
  }, [vendors, searchQuery, selectedType]);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('/api/vendors');
      const data = await response.json();

      if (data.success) {
        setVendors(data.vendors);
        setFilteredVendors(data.vendors);
      } else {
        setError('Failed to load stores');
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load stores. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-[#1a1625]">
      {/* Navbar */}
      <nav className="bg-[#252030] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Sparkle Studio</h1>
              <span className="text-gray-400">|</span>
              <span className="text-indigo-400 font-medium">Stores</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search stores by name, owner, city, or state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-[#252030] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Vendor Type Filter */}
            <div className="md:w-64">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 bg-[#252030] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Wholesaler">Wholesaler</option>
                <option value="Retailer">Retailer</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-400">
            Showing {filteredVendors.length} of {vendors.length} stores
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              <p className="mt-4 text-gray-400">Loading stores...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Stores Grid */}
        {!isLoading && !error && (
          <>
            {filteredVendors.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">No stores found</p>
                <p className="text-gray-500 text-sm mt-2">
                  {searchQuery || selectedType
                    ? 'Try adjusting your search or filters'
                    : 'No stores are registered yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="bg-[#252030] border border-gray-700 rounded-lg p-6 hover:border-indigo-500 transition-colors cursor-pointer"
                    onClick={() => {
                      // Navigate to vendor details page (can be implemented later)
                      console.log('View vendor:', vendor.id);
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {vendor.businessName}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Owner: {vendor.ownerName}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          vendor.vendorType === 'Manufacturer'
                            ? 'bg-blue-500/20 text-blue-400'
                            : vendor.vendorType === 'Wholesaler'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}
                      >
                        {vendor.vendorType}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-300">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>
                          {vendor.businessAddress?.city || 'N/A'}, {vendor.businessAddress?.state || 'N/A'}{' '}
                          {vendor.businessAddress?.pincode ? `- ${vendor.businessAddress.pincode}` : ''}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-300">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>{vendor.mobileNumber}</span>
                      </div>

                      <div className="flex items-center text-gray-300">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{vendor.yearsInBusiness} years in business</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
