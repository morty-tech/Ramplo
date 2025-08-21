/**
 * Configuration for RampLO
 * Uses standard environment variables for all environments
 */

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  // Environment detection
  isDevelopment: !isProduction,
  isProduction,
  
  // Stripe configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publicKey: process.env.VITE_STRIPE_PUBLIC_KEY,
    priceId: process.env.STRIPE_PRICE_ID,
  },
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // Other service configurations
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
  }
};

// Validation - ensure required secrets exist
if (!config.database.url) {
  throw new Error('Missing DATABASE_URL');
}

// In development, make other keys optional to avoid startup errors
if (isProduction) {
  if (!config.stripe.secretKey) {
    console.warn('Missing STRIPE_SECRET_KEY - Stripe features will be disabled');
  }
  if (!config.stripe.publicKey) {
    console.warn('Missing VITE_STRIPE_PUBLIC_KEY - Stripe features will be disabled');
  }
  if (!config.stripe.priceId) {
    console.warn('Missing STRIPE_PRICE_ID - Stripe features will be disabled');
  }
} else {
  // Development mode - log warnings for missing keys but don't throw errors
  if (!config.stripe.secretKey) {
    console.log('⚠️ STRIPE_SECRET_KEY not set - Stripe features will be disabled');
  }
  if (!config.stripe.publicKey) {
    console.log('⚠️ VITE_STRIPE_PUBLIC_KEY not set - Stripe features will be disabled');
  }  
  if (!config.stripe.priceId) {
    console.log('⚠️ STRIPE_PRICE_ID not set - Stripe features will be disabled');
  }
}

console.log(`🚀 ${isProduction ? 'Production' : 'Development'} configuration loaded`);