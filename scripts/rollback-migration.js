#!/usr/bin/env node

/**
 * Rollback Script: Restore files from backup
 * 
 * This script restores all files from the migration backup
 * 
 * Usage: node scripts/rollback-migration.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '..', 'src');
const BACKUP_DIR = path.join(__dirname, '..', '.migration-backup');

let filesRestored = 0;

/**
 * Get all files recursively
 */
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Restore a single file
 */
function restoreFile(backupPath) {
  const relativePath = path.relative(BACKUP_DIR, backupPath);
  const originalPath = path.join(SRC_DIR, relativePath);
  
  try {
    fs.copyFileSync(backupPath, originalPath);
    filesRestored++;
    console.log(`✅ Restored: ${relativePath}`);
  } catch (error) {
    console.error(`❌ Error restoring ${relativePath}:`, error.message);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔄 Starting rollback...\n');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error('❌ Backup directory not found!');
    console.error(`   Expected: ${BACKUP_DIR}`);
    console.error('   No migration backup exists.');
    process.exit(1);
  }
  
  console.log('🔍 Scanning backup files...\n');
  const backupFiles = getAllFiles(BACKUP_DIR);
  
  if (backupFiles.length === 0) {
    console.error('❌ No backup files found!');
    process.exit(1);
  }
  
  console.log(`📁 Found ${backupFiles.length} backup files\n`);
  console.log('🔄 Restoring files...\n');
  
  backupFiles.forEach(restoreFile);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 ROLLBACK SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files restored: ${filesRestored}`);
  console.log('='.repeat(60));
  
  console.log('\n✅ Rollback completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm run build');
  console.log('   2. Verify the application works');
  console.log('   3. Delete backup: rm -rf .migration-backup');
}

// Run the script
main();
