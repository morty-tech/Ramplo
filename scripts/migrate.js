#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Running database migration...');

try {
  // Run drizzle-kit push to ensure all tables exist
  execSync('npx drizzle-kit push', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('✅ Database migration completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}