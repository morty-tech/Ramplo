#!/usr/bin/env node

/**
 * Database Migration Script for RampLO
 * 
 * This script provides convenient commands for managing database migrations:
 * - Generate migration files from schema changes
 * - Push schema changes directly to database
 * - Apply migrations to database
 * 
 * Usage:
 *   node migrate.js push     # Push schema changes to database (recommended)
 *   node migrate.js generate # Generate migration files from schema
 *   node migrate.js migrate  # Apply migration files to database
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const commands = {
  push: 'drizzle-kit push',
  generate: 'drizzle-kit generate', 
  migrate: 'drizzle-kit migrate'
};

async function runMigration(command) {
  try {
    console.log(`🔄 Running: ${commands[command]}`);
    const { stdout, stderr } = await execAsync(commands[command]);
    
    if (stdout) {
      console.log('✅ Output:', stdout);
    }
    
    if (stderr) {
      console.log('⚠️  Warnings:', stderr);
    }
    
    console.log(`✅ Migration completed successfully!`);
  } catch (error) {
    console.error(`❌ Migration failed:`, error.message);
    if (error.stdout) console.log('Output:', error.stdout);
    if (error.stderr) console.log('Error:', error.stderr);
    process.exit(1);
  }
}

const command = process.argv[2];

if (!command || !commands[command]) {
  console.log(`
🗄️  RampLO Database Migration Tool

Usage: node migrate.js <command>

Available commands:
  push      Push schema changes directly to database (recommended)
  generate  Generate migration files from schema changes  
  migrate   Apply migration files to database

Examples:
  node migrate.js push      # Most common - push schema to database
  node migrate.js generate  # Generate migration files first
  node migrate.js migrate   # Apply generated migrations

Note: For development, 'push' is recommended as it directly applies
      schema changes without generating intermediate migration files.
`);
  process.exit(1);
}

runMigration(command);