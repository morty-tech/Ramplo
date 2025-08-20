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
if (!config.stripe.secretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}
if (!config.stripe.publicKey) {
  throw new Error('Missing VITE_STRIPE_PUBLIC_KEY');
}
if (!config.stripe.priceId) {
  throw new Error('Missing STRIPE_PRICE_ID');
}
if (!config.database.url) {
  throw new Error('Missing DATABASE_URL');
}

console.log(`🚀 ${isProduction ? 'Production' : 'Development'} configuration loaded`);