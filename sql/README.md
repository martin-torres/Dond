# SQL Directory - Quick Reference

**Last Updated**: 2026-01-08

---

## 🚀 Quick Start

**For schema questions**: See [`CANONICAL-SCHEMA.md`](CANONICAL-SCHEMA.md)  
**For migrations**: See [`migrations/MIGRATION-LOG.md`](migrations/MIGRATION-LOG.md)  
**For archived files**: See [`archive/OBSOLETE-README.md`](archive/OBSOLETE-README.md)

---

## 📁 Directory Structure

```
sql/
├── CANONICAL-SCHEMA.md          # ⭐ START HERE - Single source of truth
├── canonical/                   # ✅ Active, verified SQL files
│   ├── tables/                 # 11 table definitions
│   ├── views/                  # 1 view definition
│   └── policies/               # 1 RLS policy
├── migrations/                 # 📜 Completed migrations (read-only)
│   └── MIGRATION-LOG.md        # Migration history
├── samples/                    # 🧪 Sample data (demo only)
└── archive/                    # 🗑️ Obsolete files (historical)
    └── OBSOLETE-README.md      # Why files were archived
```

---

## 📊 File Counts

| Directory | SQL Files | Documentation | Total |
|-----------|-----------|---------------|-------|
| canonical/ | 13 | 0 | 13 |
| migrations/ | 11 | 1 | 12 |
| samples/ | 5 | 0 | 5 |
| archive/ | 4 | 1 | 5 |
| **Total** | **33** | **2** | **35** |

---

## 🎯 What Goes Where

### canonical/ (Active Files)
- ✅ Table definitions currently in production
- ✅ Views used by runtime code
- ✅ RLS policies that are applied
- ✅ Verified against database

### migrations/ (Completed)
- ✅ Historical migrations (already applied)
- ✅ DO NOT re-run these
- ✅ Reference only

### samples/ (Demo Data)
- ✅ Sample restaurant setups
- ✅ Demo data for testing
- ✅ NOT part of production schema

### archive/ (Obsolete)
- ❌ Unused hybrid versions
- ❌ Unused views
- ❌ Historical reference only

---

## 🔧 Making Changes

### Add a New Table
1. Create SQL file in `canonical/tables/`
2. Apply to database
3. Update `CANONICAL-SCHEMA.md`
4. Document in `migrations/MIGRATION-LOG.md`

### Modify Existing Table
1. Update SQL file in `canonical/tables/`
2. Create migration file in `migrations/`
3. Apply to database
4. Update documentation

### Deprecate a File
1. Move to `archive/`
2. Update `archive/OBSOLETE-README.md`
3. Update `CANONICAL-SCHEMA.md`

---

## 🚨 Critical Issues

### Pending: Remove "available" Column
**Status**: ⚠️ NOT YET COMPLETED  
**Priority**: 🔴 CRITICAL  
**File**: `migrations/sql-remove-available-column.sql`

**Action**: Run this migration in Supabase SQL Editor

---

## 📞 Need Help?

1. **Schema questions** → `CANONICAL-SCHEMA.md`
2. **Migration history** → `migrations/MIGRATION-LOG.md`
3. **Why was X archived?** → `archive/OBSOLETE-README.md`
4. **Verification** → Run `node verify-schema-sql.js` from project root

---

**Version**: 1.0.0  
**Maintained By**: Database Team