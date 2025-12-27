'use client';

import { formatDistance } from '@/lib/location-client';

export interface Store {
  id: string;
  name: string;
  ownerName?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  images?: string[];
  categories?: string[];
  items?: string[];
  vendorType?: string;
  yearsInBusiness?: number;
  distance?: number;
}

interface StoreCardProps {
  store: Store;
  onClick?: () => void;
  isSelected?: boolean;
  theme?: 'purple' | 'blue';
}

export default function StoreCard({
  store,
  onClick,
  isSelected = false,
  theme = 'purple',
}: StoreCardProps) {
  const themeColors = {
    purple: {
      border: 'border-purple-500',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      hover: 'hover:border-purple-400',
    },
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      hover: 'hover:border-blue-400',
    },
  };

  const colors = themeColors[theme];

  // Get first image or placeholder
  const imageUrl = store.images && store.images.length > 0 
    ? store.images[0] 
    : '/placeholder-store.jpg';

  // Get rating stars
  const rating = store.rating || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  // Get items/categories preview
  const previewItems = store.items?.slice(0, 3) || store.categories?.slice(0, 3) || [];

  return (
    <div
      onClick={onClick}
      className={`bg-gray-800 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
        isSelected
          ? `${colors.border} ${colors.bg} shadow-lg`
          : 'border-gray-700 hover:border-gray-600'
      } ${colors.hover}`}
    >
      {/* Store Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-900">
        <img
          src={imageUrl}
          alt={store.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-store.jpg';
          }}
        />
        {store.distance !== undefined && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-medium">
            {formatDistance(store.distance)}
          </div>
        )}
      </div>

      {/* Store Info */}
      <div className="p-4">
        {/* Store Name */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
          {store.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < fullStars
                    ? 'text-yellow-400 fill-yellow-400'
                    : i === fullStars && hasHalfStar
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-600'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-400">
            {rating > 0 ? rating.toFixed(1) : 'No rating'}
          </span>
          {store.vendorType && (
            <span className={`text-xs px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
              {store.vendorType}
            </span>
          )}
        </div>

        {/* Address */}
        {store.address && (
          <p className="text-sm text-gray-400 mb-2 line-clamp-1">
            {[
              store.address.street,
              store.address.city,
              store.address.state,
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
        )}

        {/* Items/Categories Preview */}
        {previewItems.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {previewItems.map((item, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
              >
                {item}
              </span>
            ))}
            {(store.items?.length || 0) > 3 && (
              <span className="text-xs px-2 py-1 text-gray-400">
                +{(store.items?.length || 0) - 3} more
              </span>
            )}
          </div>
        )}

        {/* Years in Business */}
        {store.yearsInBusiness && store.yearsInBusiness > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {store.yearsInBusiness} years in business
          </p>
        )}
      </div>
    </div>
  );
}

