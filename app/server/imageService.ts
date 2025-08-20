import { createApi } from 'unsplash-js';
import { templateImages, type TemplateImage } from '@shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';

export interface ImageSearchResult {
  id: string;
  url: string;
  alt: string;
  photographer?: string;
  source: 'database' | 'unsplash';
}

export class ImageService {
  private unsplash: any = null;

  constructor() {
    // Initialize Unsplash API if key is available
    if (process.env.UNSPLASH_ACCESS_KEY) {
      this.unsplash = createApi({
        accessKey: process.env.UNSPLASH_ACCESS_KEY
      });
    }
  }

  // Search for images by category/query
  async searchImages(query: string, count: number = 6): Promise<ImageSearchResult[]> {
    try {
      // Try dynamic Unsplash first if API key is available
      if (this.unsplash) {
        console.log(`Fetching ${count} images from Unsplash for query: ${query}`);
        return await this.searchUnsplashImages(query, count);
      }
    } catch (error) {
      console.warn('Unsplash API failed, falling back to database images:', error);
    }

    // Fallback to database images
    console.log(`Fetching images from database for category: ${query}`);
    return await this.getDatabaseImages(query);
  }

  // Get images from database (existing functionality)
  private async getDatabaseImages(category?: string): Promise<ImageSearchResult[]> {
    const query = category 
      ? db.select().from(templateImages).where(eq(templateImages.category, category))
      : db.select().from(templateImages).where(eq(templateImages.isDefault, true));
    
    const dbImages = await query;
    
    return dbImages.map((img: TemplateImage) => ({
      id: img.id,
      url: img.imageUrl,
      alt: img.imageAlt || img.name,
      source: 'database' as const
    }));
  }

  // Fetch from Unsplash API (ready for when key is approved)
  private async searchUnsplashImages(query: string, count: number): Promise<ImageSearchResult[]> {
    if (!this.unsplash) {
      throw new Error('Unsplash API not initialized');
    }

    const result = await this.unsplash.search.getPhotos({
      query,
      page: 1,
      perPage: count,
      orientation: 'landscape' // Good for social media templates
    });

    if (result.type === 'success') {
      return result.response.results.map((photo: any) => ({
        id: photo.id,
        url: photo.urls.regular, // Good size for templates
        alt: photo.alt_description || `Photo by ${photo.user.name}`,
        photographer: photo.user.name,
        source: 'unsplash' as const
      }));
    } else {
      throw new Error('Failed to fetch images from Unsplash');
    }
  }

  // Get random images for a specific category
  async getRandomImages(category: string, count: number = 6): Promise<ImageSearchResult[]> {
    // Map our categories to better Unsplash search terms
    const searchTerms: Record<string, string> = {
      'real-estate': 'real estate house property',
      'mortgage': 'mortgage home loan finance',
      'finance': 'finance business calculator money',
      'business': 'business handshake professional meeting',
      'general': 'business professional'
    };

    const searchQuery = searchTerms[category] || category;
    return await this.searchImages(searchQuery, count);
  }

  // Check if dynamic images are available
  isDynamicEnabled(): boolean {
    return !!this.unsplash;
  }
}

export const imageService = new ImageService();