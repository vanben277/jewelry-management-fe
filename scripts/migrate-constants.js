#!/usr/bin/env node

/**
 * Migration Script: Replace Magic Strings/Numbers with Constants
 * 
 * This script automatically replaces hardcoded values with constants from:
 * - src/constants/app.ts
 * - src/utils/validation.ts
 * 
 * Usage: node scripts/migrate-constants.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const SRC_DIR = path.join(__dirname, '..', 'src');
const BACKUP_DIR = path.join(__dirname, '..', '.migration-backup');

// Statistics
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  replacements: 0,
  errors: 0,
};

// Replacement patterns
const replacements = [
  // ============================================
  // STORAGE KEYS
  // ============================================
  {
    pattern: /localStorage\.getItem\(['"]accessToken['"]\)/g,
    replacement: 'localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.setItem\(['"]accessToken['"]/g,
    replacement: 'localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.removeItem\(['"]accessToken['"]\)/g,
    replacement: 'localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.getItem\(['"]userInfo['"]\)/g,
    replacement: 'localStorage.getItem(STORAGE_KEYS.USER_INFO)',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.setItem\(['"]userInfo['"]/g,
    replacement: 'localStorage.setItem(STORAGE_KEYS.USER_INFO',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.removeItem\(['"]userInfo['"]\)/g,
    replacement: 'localStorage.removeItem(STORAGE_KEYS.USER_INFO)',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.getItem\(['"]userId['"]\)/g,
    replacement: 'localStorage.getItem(STORAGE_KEYS.USER_ID)',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.setItem\(['"]userId['"]/g,
    replacement: 'localStorage.setItem(STORAGE_KEYS.USER_ID',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.removeItem\(['"]userId['"]\)/g,
    replacement: 'localStorage.removeItem(STORAGE_KEYS.USER_ID)',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.getItem\(['"]auth['"]\)/g,
    replacement: 'localStorage.getItem(STORAGE_KEYS.AUTH)',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.removeItem\(['"]auth['"]\)/g,
    replacement: 'localStorage.removeItem(STORAGE_KEYS.AUTH)',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.getItem\(['"]checkoutItems['"]\)/g,
    replacement: 'localStorage.getItem(STORAGE_KEYS.CHECKOUT_ITEMS)',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.setItem\(['"]checkoutItems['"]/g,
    replacement: 'localStorage.setItem(STORAGE_KEYS.CHECKOUT_ITEMS',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.removeItem\(['"]checkoutItems['"]\)/g,
    replacement: 'localStorage.removeItem(STORAGE_KEYS.CHECKOUT_ITEMS)',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.getItem\(['"]lastOrder['"]\)/g,
    replacement: 'localStorage.getItem(STORAGE_KEYS.LAST_ORDER)',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.setItem\(['"]lastOrder['"]/g,
    replacement: 'localStorage.setItem(STORAGE_KEYS.LAST_ORDER',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.removeItem\(['"]lastOrder['"]\)/g,
    replacement: 'localStorage.removeItem(STORAGE_KEYS.LAST_ORDER)',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.getItem\(['"]selectedCategory['"]\)/g,
    replacement: 'localStorage.getItem(STORAGE_KEYS.SELECTED_CATEGORY)',
    needsImport: 'STORAGE_KEYS',
  },
  {
    pattern: /localStorage\.setItem\(['"]selectedCategory['"]/g,
    replacement: 'localStorage.setItem(STORAGE_KEYS.SELECTED_CATEGORY',
    needsImport: 'STORAGE_KEYS',
  },

  // ============================================
  // PAGINATION
  // ============================================
  {
    pattern: /pageSize:\s*10,/g,
    replacement: 'pageSize: PAGINATION.ADMIN_PAGE_SIZE,',
    needsImport: 'PAGINATION',
  },
  {
    pattern: /pageSize:\s*12,/g,
    replacement: 'pageSize: PAGINATION.PRODUCT_PAGE_SIZE,',
    needsImport: 'PAGINATION',
  },

  // ============================================
  // ACCOUNT STATUS
  // ============================================
  {
    pattern: /!==\s*['"]ACTIVE['"]/g,
    replacement: '!== ACCOUNT_STATUS.ACTIVE',
    needsImport: 'ACCOUNT_STATUS',
  },
  {
    pattern: /===\s*['"]ACTIVE['"]/g,
    replacement: '=== ACCOUNT_STATUS.ACTIVE',
    needsImport: 'ACCOUNT_STATUS',
  },
  {
    pattern: /!==\s*['"]BANNED['"]/g,
    replacement: '!== ACCOUNT_STATUS.BANNED',
    needsImport: 'ACCOUNT_STATUS',
  },
  {
    pattern: /===\s*['"]BANNED['"]/g,
    replacement: '=== ACCOUNT_STATUS.BANNED',
    needsImport: 'ACCOUNT_STATUS',
  },

  // ============================================
  // PRODUCT STATUS
  // ============================================
  {
    pattern: /===\s*['"]IN_STOCK['"]/g,
    replacement: '=== PRODUCT_STATUS.IN_STOCK',
    needsImport: 'PRODUCT_STATUS',
  },
  {
    pattern: /!==\s*['"]IN_STOCK['"]/g,
    replacement: '!== PRODUCT_STATUS.IN_STOCK',
    needsImport: 'PRODUCT_STATUS',
  },
  {
    pattern: /value=['"]IN_STOCK['"]/g,
    replacement: 'value={PRODUCT_STATUS.IN_STOCK}',
    needsImport: 'PRODUCT_STATUS',
  },
  {
    pattern: /value=['"]SOLD_OUT['"]/g,
    replacement: 'value={PRODUCT_STATUS.SOLD_OUT}',
    needsImport: 'PRODUCT_STATUS',
  },
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.migration-backup/,
  /dist/,
  /build/,
  /\.git/,
  /constants\/app\.ts$/,
  /utils\/validation\.ts$/,
  /types\.ts$/,
];

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    return false;
  }
  
  return !EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Get all TypeScript files recursively
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (shouldProcessFile(filePath)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Add import statement if not exists
 */
function addImport(content, importName, filePath) {
  // Check if already imported
  const importRegex = new RegExp(`import.*${importName}.*from.*['"].*constants`, 'g');
  if (importRegex.test(content)) {
    return content;
  }

  // Calculate relative path from file to constants
  const fileDir = path.dirname(filePath);
  const constantsPath = path.join(SRC_DIR, 'constants');
  let relativePath = path.relative(fileDir, constantsPath);
  
  // Convert Windows backslashes to forward slashes
  relativePath = relativePath.replace(/\\/g, '/');
  
  // Ensure it starts with ./
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }

  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }

  // Add import after last import
  if (lastImportIndex >= 0) {
    const importStatement = `import { ${importName} } from '${relativePath}';`;
    lines.splice(lastImportIndex + 1, 0, importStatement);
    return lines.join('\n');
  }

  // If no imports found, add at the beginning
  return `import { ${importName} } from '${relativePath}';\n${content}`;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  stats.filesProcessed++;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const neededImports = new Set();
    
    // Apply all replacements
    replacements.forEach(({ pattern, replacement, needsImport }) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        content = content.replace(pattern, replacement);
        modified = true;
        stats.replacements += matches.length;
        
        if (needsImport) {
          neededImports.add(needsImport);
        }
      }
    });
    
    // Add necessary imports
    if (modified) {
      neededImports.forEach(importName => {
        content = addImport(content, importName, filePath);
      });
      
      stats.filesModified++;
      
      if (!DRY_RUN) {
        // Backup original file
        const backupPath = filePath.replace(SRC_DIR, BACKUP_DIR);
        const backupDir = path.dirname(backupPath);
        
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        
        fs.copyFileSync(filePath, backupPath);
        
        // Write modified content
        fs.writeFileSync(filePath, content, 'utf8');
      }
      
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`✅ Modified: ${relativePath}`);
    }
  } catch (error) {
    stats.errors++;
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting migration...\n');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n');
  } else {
    console.log('📦 Creating backup directory...');
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    console.log(`✅ Backup directory: ${BACKUP_DIR}\n`);
  }
  
  console.log('🔍 Scanning files...\n');
  const files = getAllFiles(SRC_DIR);
  
  console.log(`📁 Found ${files.length} TypeScript files\n`);
  console.log('🔄 Processing files...\n');
  
  files.forEach(processFile);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files processed:  ${stats.filesProcessed}`);
  console.log(`Files modified:   ${stats.filesModified}`);
  console.log(`Replacements:     ${stats.replacements}`);
  console.log(`Errors:           ${stats.errors}`);
  console.log('='.repeat(60));
  
  if (DRY_RUN) {
    console.log('\n⚠️  This was a DRY RUN. Run without --dry-run to apply changes.');
  } else {
    console.log('\n✅ Migration completed!');
    console.log(`📦 Original files backed up to: ${BACKUP_DIR}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run build');
    console.log('   2. Test the application');
    console.log('   3. If issues, restore from backup');
  }
}

// Run the script
main();
