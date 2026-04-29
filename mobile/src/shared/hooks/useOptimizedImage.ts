import { useState, useEffect } from 'react';
import { Image, type NativeSyntheticEvent, type ImageLoadEventData } from 'react-native';

interface UseOptimizedImageOptions {
  initialWidth?: number;
  initialHeight?: number;
  maxSize?: number;
}

interface UseOptimizedImageReturn {
  width: number;
  height: number;
  uri: string;
  isLoaded: boolean;
  onLoad: (event: NativeSyntheticEvent<ImageLoadEventData>) => void;
  onError: () => void;
}

/**
 * Hook do optymalizacji ładowania obrazów
 * - Lazy loading
 * - Progressive loading
 * - Cache management
 */
export function useOptimizedImage(
  uri: string,
  options: UseOptimizedImageOptions = {}
): UseOptimizedImageReturn {
  const { initialWidth = 100, initialHeight = 100, maxSize = 1024 } = options;

  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!uri) {
      setError(true);
      return;
    }

    // Reset state when URI changes
    setIsLoaded(false);
    setError(false);

    // Preload image
    Image.prefetch(uri).catch(() => {
      // Prefetch failed, will load normally
    });
  }, [uri]);

  const handleLoad = (event: NativeSyntheticEvent<ImageLoadEventData>): void => {
    const { width, height } = event.nativeEvent.source;

    // Calculate aspect ratio with max size limit
    const aspectRatio = width / height;
    let newWidth = width;
    let newHeight = height;

    if (width > maxSize || height > maxSize) {
      if (width > height) {
        newWidth = Math.min(width, maxSize);
        newHeight = newWidth / aspectRatio;
      } else {
        newHeight = Math.min(height, maxSize);
        newWidth = newHeight * aspectRatio;
      }
    }

    setDimensions({ width: newWidth, height: newHeight });
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(false);
  };

  return {
    width: dimensions.width,
    height: dimensions.height,
    uri,
    isLoaded: isLoaded && !error,
    onLoad: handleLoad,
    onError: handleError,
  };
}

export default useOptimizedImage;
