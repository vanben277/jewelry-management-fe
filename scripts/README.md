# Migration Scripts

Automated scripts to replace magic strings and numbers with constants.

## 📋 What Gets Migrated

### 1. localStorage Keys
- `"accessToken"` → `STORAGE_KEYS.ACCESS_TOKEN`
- `"userInfo"` → `STORAGE_KEYS.USER_INFO`
- `"userId"` → `STORAGE_KEYS.USER_ID`
- `"auth"` → `STORAGE_KEYS.AUTH`
- `"checkoutItems"` → `STORAGE_KEYS.CHECKOUT_ITEMS`
- `"lastOrder"` → `STORAGE_KEYS.LAST_ORDER`
- `"selectedCategory"` → `STORAGE_KEYS.SELECTED_CATEGORY`

### 2. Pagination Numbers
- `pageSize: 10` → `PAGINATION.ADMIN_PAGE_SIZE`
- `pageSize: 12` → `PAGINATION.PRODUCT_PAGE_SIZE`

### 3. Account Status
- `"ACTIVE"` → `ACCOUNT_STATUS.ACTIVE`
- `"BANNED"` → `ACCOUNT_STATUS.BANNED`

### 4. Product Status
- `"IN_STOCK"` → `PRODUCT_STATUS.IN_STOCK`
- `"SOLD_OUT"` → `PRODUCT_STATUS.SOLD_OUT`

## 🚀 Usage

### Step 1: Dry Run (Recommended)

Test the migration without making changes:

```bash
node scripts/migrate-constants.js --dry-run
```

This will show you:
- Which files will be modified
- How many replacements will be made
- Any potential errors

### Step 2: Run Migration

Apply the changes:

```bash
node scripts/migrate-constants.js
```

This will:
- ✅ Backup all original files to `.migration-backup/`
- ✅ Replace magic strings/numbers with constants
- ✅ Add necessary imports automatically
- ✅ Show detailed summary

### Step 3: Verify

Build and test the application:

```bash
npm run build
npm run dev
```

Test key features:
- Login/Logout
- Cart operations
- Admin pages
- Product filtering

### Step 4: Rollback (If Needed)

If something goes wrong, restore from backup:

```bash
node scripts/rollback-migration.js
```

This will restore all files from `.migration-backup/`

## 📊 Expected Results

Based on the codebase analysis:

- **Files to be modified**: ~25-30 files
- **Total replacements**: ~70-80 changes
- **Time**: ~30 seconds
- **Backup size**: ~500KB

## ⚠️ Important Notes

### What the Script Does:
✅ Replaces hardcoded strings with constants  
✅ Adds imports automatically  
✅ Creates backup before changes  
✅ Handles TypeScript files (.ts, .tsx)  
✅ Skips node_modules, dist, build folders  

### What the Script Does NOT Do:
❌ Replace JSON.parse() with safeParseJSON() (too complex)  
❌ Fix error: any types (requires manual review)  
❌ Optimize code logic  
❌ Run tests automatically  

### Files Excluded:
- `src/constants/app.ts` (source of constants)
- `src/utils/validation.ts` (source of utilities)
- `src/types.ts` (type definitions)
- `node_modules/`, `dist/`, `build/`

## 🔍 Manual Review Needed

After migration, manually review these files:

1. **JSON.parse Safety** (7 files):
   - `src/pages/user/OrderSuccess.tsx`
   - `src/pages/user/MyHome.tsx`
   - `src/pages/user/Login.tsx`
   - `src/pages/user/EditPersonalInfo.tsx`
   - `src/layout/admin/Head.tsx`
   - `src/hooks/useProductFilter.ts`

2. **Complex Logic** (3 files):
   - `src/pages/admin/AdminProducts.tsx` (line 387: conditional rendering)
   - `src/pages/user/OrderInfo.tsx` (payment method labels)

## 🛠️ Troubleshooting

### Issue: Import paths are wrong

**Solution**: The script assumes relative imports like `'../constants'`. If your project uses different import paths (e.g., `'@/constants'`), edit the script:

```javascript
// In migrate-constants.js, line ~250
const importStatement = `import { ${importName} } from '@/constants';`;
```

### Issue: Build fails after migration

**Solution**: 
1. Check the build error message
2. Run rollback: `node scripts/rollback-migration.js`
3. Fix the specific file manually
4. Re-run migration

### Issue: Some replacements are incorrect

**Solution**:
1. Run rollback
2. Edit the `replacements` array in `migrate-constants.js`
3. Test with `--dry-run`
4. Re-run migration

## 📝 Example Output

```
🚀 Starting migration...

📦 Creating backup directory...
✅ Backup directory: /path/to/.migration-backup

🔍 Scanning files...

📁 Found 45 TypeScript files

🔄 Processing files...

✅ Modified: src/pages/user/Login.tsx
✅ Modified: src/pages/user/Cart.tsx
✅ Modified: src/pages/admin/AdminProducts.tsx
...

============================================================
📊 MIGRATION SUMMARY
============================================================
Files processed:  45
Files modified:   28
Replacements:     76
Errors:           0
============================================================

✅ Migration completed!
📦 Original files backed up to: /path/to/.migration-backup

📝 Next steps:
   1. Run: npm run build
   2. Test the application
   3. If issues, restore from backup
```

## 🎯 Success Criteria

Migration is successful if:
- ✅ `npm run build` passes without errors
- ✅ Application runs without runtime errors
- ✅ Login/logout works
- ✅ Cart operations work
- ✅ Admin pages load correctly
- ✅ No console errors

## 🗑️ Cleanup

After verifying everything works, delete the backup:

```bash
rm -rf .migration-backup
```

Or keep it for a few days as safety net.

## 📞 Support

If you encounter issues:
1. Check the error message
2. Run rollback
3. Review the specific file manually
4. Report the issue with error details
