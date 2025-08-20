/**
 * Frontend configuration for RampLO
 * Uses standard environment variables for all environments
 */

const isProduction = import.meta.env.PROD;

export const config = {
  // Environment detection
  isDevelopment: !isProduction,
  isProduction,
  
  // Stripe public key
  stripe: {
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
  },
};

// Validation - ensure required keys exist
if (!config.stripe.publicKey) {
  throw new Error('Missing VITE_STRIPE_PUBLIC_KEY environment variable');
}

console.log(`🚀 Frontend ${isProduction ? 'production' : 'development'} configuration loaded`);