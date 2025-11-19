/**
 * Utility functions for generating Unsplash image URLs for shoes
 * 
 * Uses Unsplash Source API (deprecated but still functional) for free image access
 * Format: https://source.unsplash.com/featured/{width}x{height}/?{search-terms}
 * 
 * For production, consider using Unsplash API with an access key for better results
 */

/**
 * Generate an Unsplash image URL based on shoe brand and model
 * @param brand - Shoe brand (e.g., "Nike", "Adidas")
 * @param model - Shoe model (e.g., "Invincible 3", "Adios Pro 3")
 * @param width - Image width (default: 800)
 * @param height - Image height (default: 800)
 * @returns Unsplash Source URL
 */
export function getUnsplashImageUrl(
  brand: string,
  model: string,
  width: number = 800,
  height: number = 800
): string {
  // Clean up brand and model for search
  const searchTerms = `${brand} running shoes ${model}`
    .toLowerCase()
    .replace(/\s+/g, '+')
    .replace(/[^a-z0-9+]/g, '');

  // Use Unsplash Source API (free, no key required)
  // Note: This API is deprecated but still works
  return `https://source.unsplash.com/featured/${width}x${height}/?${searchTerms}`;
}

/**
 * Get a curated Unsplash image URL for specific popular running shoe models
 * Uses specific Unsplash photo IDs for better, more consistent results
 * 
 * These are high-quality running shoe images from Unsplash photographers
 */
export function getCuratedUnsplashImage(brand: string, model: string): string {
  // Map of brand to specific Unsplash photo IDs
  // Using variety of running shoe images for visual diversity
  const brandImages: Record<string, string[]> = {
    'asics': [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop&q=80',
    ],
    'saucony': [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop&q=80',
    ],
    'inov-8': [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&h=800&fit=crop&q=80',
    ],
    'nike': [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop&q=80',
    ],
    'brooks': [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop&q=80',
    ],
    'adidas': [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop&q=80',
    ],
    'new balance': [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&h=800&fit=crop&q=80',
    ],
  };

  const brandLower = brand.toLowerCase();
  
  // Try to find images for the brand
  if (brandImages[brandLower]) {
    // Use model name to deterministically pick an image (for consistency)
    // Hash the model name to pick from available images
    const modelHash = model.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageIndex = modelHash % brandImages[brandLower].length;
    return brandImages[brandLower][imageIndex];
  }

  // Fallback to search-based URL
  return getUnsplashImageUrl(brand, model);
}

/**
 * Get a random Unsplash running shoe image
 * Useful for variety when you have multiple shoes from the same brand
 */
export function getRandomRunningShoeImage(): string {
  // Popular Unsplash running shoe photo IDs
  const runningShoeImages = [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop', // Nike shoes
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop', // Running shoes
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop', // Trail running shoes
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop', // Athletic shoes
    'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&h=800&fit=crop', // Running shoes on track
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop', // Sneakers
  ];

  // Return a random image from the array
  return runningShoeImages[Math.floor(Math.random() * runningShoeImages.length)];
}

