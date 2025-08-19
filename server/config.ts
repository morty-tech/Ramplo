/**
 * Environment-aware configuration for RampLO
 * Automatically switches between development and production settings
 */

const isProduction = process.env.REPLIT_DEPLOYMENT === '1';

export const config = {
  // Environment detection
  isDevelopment: !isProduction,
  isProduction,
  
  // Stripe configuration - automatically switches based on environment
  stripe: {
    secretKey: isProduction 
      ? process.env.STRIPE_SECRET_KEY_PROD 
      : process.env.STRIPE_SECRET_KEY,
    publicKey: isProduction 
      ? process.env.VITE_STRIPE_PUBLIC_KEY_PROD 
      : process.env.VITE_STRIPE_PUBLIC_KEY,
    priceId: isProduction 
      ? process.env.STRIPE_PRICE_ID_PROD 
      : process.env.STRIPE_PRICE_ID,
  },
  
  // Database configuration - separate databases for dev/prod
  database: {
    url: isProduction 
      ? process.env.DATABASE_URL_PROD 
      : process.env.DATABASE_URL,
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
if (isProduction) {
  if (!config.stripe.secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY_PROD for production deployment');
  }
  if (!config.stripe.publicKey) {
    throw new Error('Missing VITE_STRIPE_PUBLIC_KEY_PROD for production deployment');
  }
  if (!config.stripe.priceId) {
    throw new Error('Missing STRIPE_PRICE_ID_PROD for production deployment');
  }
  console.log('🚀 Production configuration loaded');
} else {
  if (!config.stripe.secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY for development');
  }
  console.log('🛠️ Development configuration loaded');
}

// Database validation
if (isProduction) {
  if (!process.env.DATABASE_URL_PROD) {
    throw new Error('Missing DATABASE_URL_PROD for production deployment');
  }
} else {
  if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL for development');
  }
}

if (!config.database.url) {
  throw new Error('DATABASE_URL must be set');
}