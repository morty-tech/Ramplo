/**
 * Frontend configuration for RampLO
 * Automatically switches between development and production settings
 */

// Check multiple indicators for production environment
const isProduction = import.meta.env.PROD || 
                    import.meta.env.VITE_REPLIT_DEPLOYMENT === '1' ||
                    window.location.hostname.includes('replit.app');

export const config = {
  // Environment detection
  isDevelopment: !isProduction,
  isProduction,
  
  // Stripe public key - automatically switches based on environment
  stripe: {
    publicKey: isProduction 
      ? import.meta.env.VITE_STRIPE_PUBLIC_KEY_PROD 
      : import.meta.env.VITE_STRIPE_PUBLIC_KEY,
  },
};

// Validation - ensure required keys exist
if (!config.stripe.publicKey) {
  const envType = isProduction ? 'production' : 'development';
  const keyName = isProduction ? 'VITE_STRIPE_PUBLIC_KEY_PROD' : 'VITE_STRIPE_PUBLIC_KEY';
  throw new Error(`Missing ${keyName} for ${envType} environment`);
}

if (isProduction) {
  console.log('🚀 Frontend production configuration loaded');
} else {
  console.log('🛠️ Frontend development configuration loaded');
}