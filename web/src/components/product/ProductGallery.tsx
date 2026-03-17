'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface ProductGalleryProps {
  images: {
    url: string;
    alt: string;
    isPrimary: boolean;
    width: number;
    height: number;
    position: number;
  }[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return a.position - b.position;
  });

  const currentImage = sortedImages[currentIndex] || sortedImages[0];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : sortedImages.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < sortedImages.length - 1 ? prev + 1 : 0));
  };

  if (!currentImage) {
    return (
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <ZoomIn className="h-16 w-16 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <Dialog>
          <DialogTrigger>
            <button className="w-full h-full cursor-zoom-in group">
              <Image
                src={currentImage.url}
                alt={currentImage.alt || name}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <div className="relative aspect-square">
              <Image
                src={currentImage.url}
                alt={currentImage.alt || name}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Navigation Arrows */}
        {sortedImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
            {currentIndex + 1} / {sortedImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {sortedImages.map((image, index) => (
            <button
              key={image.url || index}
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-blue-600 scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${name} ${index + 1}`}
                fill
                className="object-cover"
                sizes="20vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
