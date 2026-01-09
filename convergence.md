Core Spine Decision (LOCKED)
orders = visit
order_items = item truth
restaurant_tables = physical context
NO bills table
NO totals stored
Payments = events
Seats = ephemeral attribution
This is no longer debatable downstream.
0.2 Write-Path Ownership Matrix (LOCKED)
This is critical. It prevents double-writes and confusion.
Table	Write Owner	Status
orders	App (existing)	KEEP
order_items	App (existing)	KEEP
restaurant_tables	Manager UI	KEEP
restaurants	Admin	KEEP
restaurant_menu_items	Admin	KEEP
seats	App	NEW
payments	App	NEW
orders.cash_tendered_amount	App	⚠️ DEPRECATE (later)
orders.change_received_confirmed	App	⚠️ DEPRECATE (later)
🔒 Rule:
After Phase 1, no new table may receive writes unless explicitly approved.
0.3 Read-Path Reality Check (IMPORTANT)
Right now:
UI computes totals
UI reconciles payment state
UI infers “who owes what”
We accept this temporarily.
📌 Important:
Phase 0 explicitly allows temporary technical debt.
We are not fixing UI yet.
0.4 Phase 0 Exit Criteria (CHECKPOINT)
You may proceed to Phase 1 only if all are true:
 Canonical JSON Spec approved
 DB mapping completed
 Write-path ownership documented
 You agree nothing is deleted yet
You have met all four.
✅ Phase 0 COMPLETE