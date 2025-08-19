#!/usr/bin/env node
/**
 * Database migration script that can be run independently
 * Usage: node scripts/migrate.js
 */

const { execSync } = require('child_process');

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Set NODE_ENV to production if not already set
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }
    
    // Run the migration with proper error handling
    execSync('npx drizzle-kit push', { 
      stdio: 'inherit',
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ Database migration completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
    
    // Don't fail completely - allow manual intervention
    if (error.code === 'TIMEOUT') {
      console.error('Migration timed out - please run manually');
    }
    
    process.exit(1);
  }
}

// Only run if this script is called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };