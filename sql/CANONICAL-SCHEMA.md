# Canonical Database Schema

**Last Updated**: 2026-01-08  
**Status**: ✅ Verified Against Production Database

---

## 📋 Overview

This document defines the **single source of truth** for the restaurant management system database schema. All SQL files in the `canonical/` directory are authoritative and verified to match the production database.

---

## 🗂️ Directory Structure

```
sql/
├── canonical/              # ✅ Active, verified SQL files
│   ├── tables/            # Core table definitions
│   ├── views/             # Database views
│   └── policies/          # Row-level security policies
├── migrations/            # Completed migrations (read-only)
├── samples/               # Sample/demo data (not production)
└── archive/               # Obsolete files (historical reference)
```

---

## ✅ Active Tables (Verified in Database)

| Table | SQL File | Runtime References | Status |
|-------|----------|-------------------|--------|
| restaurants | `canonical/tables/restaurants.sql` | 8 | ✅ Active |
| orders | `canonical/tables/seats-and-payments.sql` | 6 | ✅ Active |
| order_items | `canonical/tables/seats-and-payments.sql` | 4 | ✅ Active |
| payments | `canonical/tables/seats-and-payments.sql` | 8 | ✅ Active |
| seats | `canonical/tables/seats-and-payments.sql` | 5 | ✅ Active |
| restaurant_tables | `canonical/tables/tables-fixed.sql` | 5 | ✅ Active |
| restaurant_menu_items | `canonical/tables/menu-items-final.sql` | 3 | ✅ Active |
| promos | `canonical/tables/promos-events.sql` | 4 | ✅ Active |
| events | `canonical/tables/promos-events.sql` | 3 | ✅ Active |
| app_fees | `canonical/tables/app-fees.sql` | 5 | ✅ Active |
| restaurant_fees | `canonical/tables/restaurant-fees.sql` | 5 | ✅ Active |
| restaurant_analytics | `canonical/tables/restaurant-analytics.sql` | 4 | ✅ Active |
| admin_communications | `canonical/tables/admin-communications.sql` | 3 | ✅ Active |
| data_imports | `canonical/tables/data-imports.sql` | 3 | ✅ Active |
| system_events | `canonical/tables/system-events-table.sql` | 3 | ⚠️ Conditional |

**Total**: 15 core tables

---

## 👁️ Active Views (Verified in Database)

| View | SQL File | Runtime References | Status |
|------|----------|-------------------|--------|
| order_payment_status | `canonical/views/order-payment-status-view.sql` | 12 | ✅ Critical |
| table_availability | N/A | 0 | ❌ Not Deployed |

### View Details

#### order_payment_status
- **Purpose**: Derives payment completeness from orders and payments
- **Usage**: Critical for billing, closure logic, and availability
- **Canonical Principle**: Payment completeness is derived at read-time, never stored

#### table_availability (Not Deployed)
- **Status**: Not deployed in production
- **Reason**: Planned for Phase 4C (future work)
- **Action**: See `archive/availability-read-model.sql` for reference

---

## 🔒 Row-Level Security Policies

| Policy File | Status |
|-------------|--------|
| `canonical/policies/rls-policies.sql` | ✅ Applied |

**Canonical Principle**: RLS constrains access only, never semantics. Service role must see all rows.

---

## 📜 Migration History

All migrations listed in `migrations/MIGRATION-LOG.md` are **COMPLETED** and should **NOT** be re-run.

### Key Completed Migrations
- UUID Migration
- Request Kind Column
- Restaurant Settings Columns
- Restaurant Slug Column
- Station Status Columns
- Cleanup Duplicates
- Update Order Items
- Update Los Tacos
- Toggle Events Promos
- Final Migration

**⚠️ PENDING**: `sql-remove-available-column.sql` - MUST BE RUN to achieve canonical compliance

---

## 🗑️ Obsolete Files

See `archive/OBSOLETE-README.md` for files that were removed and why.

### Removed Hybrid Versions
- `sql-create-restaurants-hybrid.sql` → `archive/hybrid-versions/`
- `sql-create-menu-items-hybrid.sql` → `archive/hybrid-versions/`
- `sql-create-tables-hybrid.sql` → `archive/hybrid-versions/`

**Reason**: Intermediate versions during schema evolution. The "final" and "fixed" versions are canonical.

---

## 🎯 Canonical Principles

This schema adheres to the following **non-negotiable principles**:

1. **Truth is established in the database, not the UI**
2. **Derived state is computed at read-time, never stored**
3. **UI renders truth, UI never decides truth**
4. **RLS constrains access only, never semantics**
5. **Reload must not change truth**

### Forbidden Patterns
- ❌ Availability columns (must be derived)
- ❌ Table status flags (must be derived)
- ❌ UI filters deciding availability
- ❌ Background jobs mutating availability
- ❌ RLS policies with semantic logic

---

## 🔧 Making Schema Changes

### Process
1. **Update** the appropriate SQL file in `canonical/`
2. **Apply** the change to the database
3. **Update** this document
4. **Test** with runtime code
5. **Document** in `migrations/MIGRATION-LOG.md`

### Example: Adding a Column
```sql
-- 1. Add to canonical/tables/table-name.sql
ALTER TABLE table_name ADD COLUMN new_column TYPE;

-- 2. Create migration file
-- sql-add-new-column-migration.sql

-- 3. Apply to database

-- 4. Update this document

-- 5. Log in MIGRATION-LOG.md
```

---

## 🧪 Verification

To verify the schema matches the database:

```bash
node verify-schema-sql.js
```

This will:
- List all tables
- Check for the "available" column (should be removed)
- Verify views exist
- Report any discrepancies

---

## 📊 Sample Data

Sample data for demos and testing is in `samples/`:
- `los-tacos/` - Los Tacos restaurant setup
- `las-comidas/` - Las Comidas menu and promos
- `maui/` - Maui restaurant setup
- `templates/` - Template for new restaurants

**Note**: Sample data is **NOT** part of the production schema.

---

## 🚨 Known Issues

### Issue #1: "available" Column Still Exists
- **Table**: `restaurant_tables`
- **Status**: ⚠️ NOT FIXED
- **Impact**: Violates canonical compliance
- **Action**: Run `sql-remove-available-column.sql`
- **Priority**: 🔴 CRITICAL

### Issue #2: table_availability View Not Deployed
- **Status**: ℹ️ INFORMATIONAL
- **Impact**: None (not used in runtime)
- **Action**: Deploy when Phase 4C is implemented
- **Priority**: 🟢 LOW

---

## 📞 Contact

For questions about the schema:
1. Check this document first
2. Review `DATABASE-VERIFICATION-RESULTS.md`
3. Check `SQL-CANONICALIZATION-REPORT.md` for detailed analysis

---

**Version**: 1.0.0  
**Last Verified**: 2026-01-08  
**Verified By**: Database verification script