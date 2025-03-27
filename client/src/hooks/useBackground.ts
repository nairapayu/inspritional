import { useState, useEffect } from "react";

// Collection of background image URLs for quotes
const backgroundImages = [
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Mountain landscape
  "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Sunset
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Path through forest
  "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Mountain peak
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Lake and mountains
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Starry sky
  "https://images.unsplash.com/photo-1476611317561-60117649dd94?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Clouds and mountains
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Beach sunset
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Forest
  "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"  // Ocean
];

// Map category names to ideal background types
const categoryBackgroundMap: Record<string, number[]> = {
  "Motivation": [0, 4, 6],
  "Leadership": [0, 4, 7],
  "Success": [1, 7, 9],
  "Happiness": [1, 7, 8],
  "Mindfulness": [2, 3, 8],
  "Inspiration": [0, 5, 6],
  "Perseverance": [3, 4, 6],
  "Wisdom": [2, 5, 9]
};

interface UseBackgroundReturn {
  getRandomBackground: () => string;
  getBackgroundForCategory: (category: string) => string;
  preloadBackgrounds: () => void;
}

export const useBackground = (): UseBackgroundReturn => {
  const [preloaded, setPreloaded] = useState(false);
  
  // Preload background images
  const preloadBackgrounds = () => {
    if (preloaded) return;
    
    backgroundImages.forEach(url => {
      const img = new Image();
      img.src = url;
    });
    
    setPreloaded(true);
  };
  
  // Get a random background image URL
  const getRandomBackground = (): string => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    return backgroundImages[randomIndex];
  };
  
  // Get a background image URL appropriate for a specific category
  const getBackgroundForCategory = (category: string): string => {
    if (!category) return getRandomBackground();
    
    const indices = categoryBackgroundMap[category];
    
    if (indices && indices.length > 0) {
      const randomIndex = Math.floor(Math.random() * indices.length);
      return backgroundImages[indices[randomIndex]];
    }
    
    return getRandomBackground();
  };

  return {
    getRandomBackground,
    getBackgroundForCategory,
    preloadBackgrounds
  };
};
