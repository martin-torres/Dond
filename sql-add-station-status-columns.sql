-- Adds per-station production flow columns so kitchen/bar/FOH can move orders independently.
-- Safe to run multiple times because of IF NOT EXISTS.

alter table public.orders
  add column if not exists kitchen_status text null,
  add column if not exists bar_status text null,
  add column if not exists foh_request_status text null,
  add column if not exists kitchen_picked_up_at timestamptz null,
  add column if not exists kitchen_delivered_at timestamptz null,
  add column if not exists bar_picked_up_at timestamptz null,
  add column if not exists bar_delivered_at timestamptz null,
  add column if not exists foh_request_delivered_at timestamptz null;

-- Optional: keep values constrained.
-- If you prefer a proper enum, we can do that next.
alter table public.orders
  add constraint if not exists orders_kitchen_status_check
    check (kitchen_status is null or kitchen_status in ('NEW','IN_PROGRESS','READY'));

alter table public.orders
  add constraint if not exists orders_bar_status_check
    check (bar_status is null or bar_status in ('NEW','IN_PROGRESS','READY'));

alter table public.orders
  add constraint if not exists orders_foh_request_status_check
    check (foh_request_status is null or foh_request_status in ('NEW','IN_PROGRESS','READY'));

-- Backfill for existing open orders (optional but recommended):
-- initialize kitchen/bar track based on existing order_items kinds.
-- NOTE: This assumes order_items.kind is maintained as 'food' | 'drink' | 'request'.
update public.orders o
set kitchen_status = coalesce(kitchen_status, 'NEW')
where o.status in ('NEW','IN_PROGRESS','READY','PICKING_UP')
  and exists (select 1 from public.order_items i where i.order_id = o.id and i.kind = 'food');

update public.orders o
set bar_status = coalesce(bar_status, 'NEW')
where o.status in ('NEW','IN_PROGRESS','READY','PICKING_UP')
  and exists (select 1 from public.order_items i where i.order_id = o.id and i.kind = 'drink');

update public.orders o
set foh_request_status = coalesce(foh_request_status, 'NEW')
where o.order_type = 'request'
  and o.status in ('NEW','IN_PROGRESS','READY','PICKING_UP');

