'use client';

import { useRef, useState, useCallback } from 'react';

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
  onImageRemove?: () => void;
  currentImage?: string | null;
  maxSizeMB?: number;
  accept?: string;
}

export default function ImageUpload({
  onImageUpload,
  onImageRemove,
  currentImage,
  maxSizeMB = 10,
  accept = 'image/jpeg,image/png,image/webp',
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndProcessFile = useCallback(
    (file: File) => {
      setError(null);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        setError(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      // Read file as base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          onImageUpload(result);
        }
      };
      reader.onerror = () => {
        setError('Failed to read image file');
      };
      reader.readAsDataURL(file);
    },
    [maxSizeMB, onImageUpload]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImageRemove) {
      onImageRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  };

  // If image exists, show preview
  if (currentImage) {
    return (
      <div className="relative group">
        <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-white/20 bg-black/20">
          <img
            src={currentImage}
            alt="Uploaded reference"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <button
              onClick={handleRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
            >
              Remove
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-400 text-center">{error}</p>
        )}
      </div>
    );
  }

  // Upload area
  return (
    <div>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative w-full aspect-square rounded-lg border-2 border-dashed 
          flex flex-col items-center justify-center cursor-pointer
          transition-all
          ${
            isDragging
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="text-center space-y-2 px-4">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-white/80 font-medium">
            {isDragging ? 'Drop image here' : 'Click or drag to upload'}
          </p>
          <p className="text-white/50 text-sm">
            Max {maxSizeMB}MB • JPEG, PNG, WebP
          </p>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}


