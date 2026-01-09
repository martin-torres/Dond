# Canonical Reconciliation Implementation Checklist

## Phase 4 — Minimal Repair Plan

### Steps to Complete

- [ ] Step 1: Create availability read model view (`table_availability`)
- [ ] Step 2: Update RLS policies to constrain access only
- [ ] Step 3: Remove `available` column from `restaurant_tables`
- [ ] Step 4: Update TypeScript types (remove `available` from Table interface)
- [ ] Step 5: Update table API to use derived availability
- [ ] Step 6: Remove UI references to stored `available` flag
- [ ] Step 7: Create comprehensive test to verify canonical compliance

### Verification Criteria

- [ ] No stored availability flags in database
- [ ] RLS policies do not filter by semantic flags
- [ ] UI renders derived truth only
- [ ] Reload does not change truth
- [ ] All existing functionality preserved
- [ ] No double-booking scenarios possible

### Files to Modify

1. Database:
   - `sql-create-availability-read-model.sql` (NEW)
   - `sql-update-rls-policy.sql` (NEW)
   - `sql-remove-available-column.sql` (NEW)

2. TypeScript:
   - `src/types/index.ts`
   - `src/api/restaurantTablesApi.ts`

3. UI Components:
   - `src/App.tsx`
   - `src/components/TableSelector.tsx`
   - `src/components/FloorPlanTablePicker.tsx`
   - `src/staff/SeedTablesToSupabase.tsx`
   - `src/staff/ManagerTablesPanel.tsx`
   - `src/staff/OwnerView.tsx`

### Success Definition

Success is achieved when:
- Exactly ONE definition exists per concept (availability, active order, payment complete)
- It is enforced everywhere
- No failure path remains
- All canonical rules are satisfied