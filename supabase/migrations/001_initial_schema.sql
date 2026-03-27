-- ============================================================
-- RentFlow — Full Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── ENUMS ────────────────────────────────────────────────────
create type user_role          as enum ('landlord','property_manager','tenant','homeowner');
create type payment_status     as enum ('paid','overdue','partial','pending','upcoming');
create type payment_method     as enum ('mtn_momo','airtel_money','bank_transfer','cash');
create type utility_type       as enum ('electricity','water','internet','garbage','security','other');
create type maintenance_status as enum ('open','in_progress','resolved');
create type maintenance_priority as enum ('low','medium','high','urgent');
create type reminder_channel   as enum ('sms','whatsapp','email');

-- ── PROFILES ─────────────────────────────────────────────────
-- Extends Supabase auth.users
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  phone       text,
  email       text not null,
  role        user_role not null default 'tenant',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Auto-create profile on sign-up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'tenant')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── PROPERTIES ───────────────────────────────────────────────
create table properties (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references profiles(id),
  manager_id  uuid references profiles(id),
  name        text not null,
  address     text not null,
  city        text not null default 'Kampala',
  total_units int not null default 1,
  created_at  timestamptz not null default now()
);

-- ── UNITS ────────────────────────────────────────────────────
create table units (
  id            uuid primary key default uuid_generate_v4(),
  property_id   uuid not null references properties(id) on delete cascade,
  unit_number   text not null,
  floor         int,
  bedrooms      int not null default 1,
  rent_amount   numeric(12,0) not null,
  is_occupied   boolean not null default false,
  created_at    timestamptz not null default now(),
  unique(property_id, unit_number)
);

-- ── LEASES ───────────────────────────────────────────────────
create table leases (
  id                 uuid primary key default uuid_generate_v4(),
  unit_id            uuid not null references units(id),
  tenant_id          uuid not null references profiles(id),
  start_date         date not null,
  end_date           date not null,
  rent_amount        numeric(12,0) not null,
  deposit_amount     numeric(12,0) not null default 0,
  due_day            int not null default 1 check (due_day between 1 and 28),
  late_fee_percent   numeric(5,2) not null default 5,
  grace_period_days  int not null default 3,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

-- Mark unit occupied when lease created/activated
create or replace function sync_unit_occupancy()
returns trigger as $$
begin
  update units set is_occupied = new.is_active where id = new.unit_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger lease_occupancy_sync
  after insert or update of is_active on leases
  for each row execute function sync_unit_occupancy();

-- ── PAYMENTS ─────────────────────────────────────────────────
create table payments (
  id            uuid primary key default uuid_generate_v4(),
  lease_id      uuid not null references leases(id),
  tenant_id     uuid not null references profiles(id),
  unit_id       uuid not null references units(id),
  property_id   uuid not null references properties(id),
  amount        numeric(12,0) not null default 0,
  amount_due    numeric(12,0) not null,
  period_month  int not null check (period_month between 1 and 12),
  period_year   int not null,
  status        payment_status not null default 'pending',
  method        payment_method,
  paid_at       timestamptz,
  due_date      date not null,
  late_fee      numeric(12,0) not null default 0,
  reference     text,
  notes         text,
  recorded_by   uuid references profiles(id),
  created_at    timestamptz not null default now(),
  unique(lease_id, period_month, period_year)
);

-- Auto-calculate late fee when payment status changes to overdue
create or replace function calculate_late_fee()
returns trigger as $$
declare
  v_lease leases%rowtype;
  v_days_overdue int;
begin
  if new.status = 'overdue' and old.status != 'overdue' then
    select * into v_lease from leases where id = new.lease_id;
    v_days_overdue := current_date - new.due_date::date;
    if v_days_overdue > v_lease.grace_period_days then
      new.late_fee := round(new.amount_due * v_lease.late_fee_percent / 100);
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger payment_late_fee
  before update of status on payments
  for each row execute function calculate_late_fee();

-- ── UTILITY BILLS ─────────────────────────────────────────────
create table utility_bills (
  id                 uuid primary key default uuid_generate_v4(),
  property_id        uuid not null references properties(id),
  unit_id            uuid references units(id),
  type               utility_type not null,
  provider           text not null,
  amount             numeric(12,0) not null,
  period_month       int not null check (period_month between 1 and 12),
  period_year        int not null,
  due_date           date not null,
  paid_at            timestamptz,
  status             payment_status not null default 'upcoming',
  split_among_units  boolean not null default false,
  created_at         timestamptz not null default now()
);

-- ── MAINTENANCE REQUESTS ──────────────────────────────────────
create table maintenance_requests (
  id           uuid primary key default uuid_generate_v4(),
  unit_id      uuid not null references units(id),
  tenant_id    uuid not null references profiles(id),
  title        text not null,
  description  text,
  status       maintenance_status   not null default 'open',
  priority     maintenance_priority not null default 'medium',
  assigned_to  uuid references profiles(id),
  resolved_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- ── REMINDER RULES ────────────────────────────────────────────
create table reminders (
  id                   uuid primary key default uuid_generate_v4(),
  property_id          uuid not null references properties(id),
  trigger_days_before  int not null,  -- negative = days after due
  channel              reminder_channel not null,
  message_template     text not null,
  is_active            boolean not null default true,
  apply_late_fee       boolean not null default false
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
alter table profiles             enable row level security;
alter table properties           enable row level security;
alter table units                enable row level security;
alter table leases               enable row level security;
alter table payments             enable row level security;
alter table utility_bills        enable row level security;
alter table maintenance_requests enable row level security;
alter table reminders            enable row level security;

-- Profiles: users can read all profiles, edit only their own
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Properties: owners and managers can see their properties; tenants see via lease
create policy "properties_select" on properties for select
  using (
    owner_id = auth.uid() or
    manager_id = auth.uid() or
    exists (
      select 1 from leases l
      join units u on u.id = l.unit_id
      where u.property_id = properties.id and l.tenant_id = auth.uid() and l.is_active
    )
  );
create policy "properties_insert" on properties for insert
  with check (owner_id = auth.uid());
create policy "properties_update" on properties for update
  using (owner_id = auth.uid() or manager_id = auth.uid());

-- Units: same visibility as properties
create policy "units_select" on units for select
  using (
    exists (
      select 1 from properties p
      where p.id = units.property_id
        and (p.owner_id = auth.uid() or p.manager_id = auth.uid())
    ) or
    exists (
      select 1 from leases l where l.unit_id = units.id and l.tenant_id = auth.uid() and l.is_active
    )
  );

-- Leases: landlord/manager sees all their leases; tenant sees only their own
create policy "leases_select" on leases for select
  using (
    tenant_id = auth.uid() or
    exists (
      select 1 from properties p
      join units u on u.property_id = p.id
      where u.id = leases.unit_id
        and (p.owner_id = auth.uid() or p.manager_id = auth.uid())
    )
  );

-- Payments: landlord/manager sees property payments; tenant sees own
create policy "payments_select" on payments for select
  using (
    tenant_id = auth.uid() or
    exists (
      select 1 from properties p
      where p.id = payments.property_id
        and (p.owner_id = auth.uid() or p.manager_id = auth.uid())
    )
  );
create policy "payments_insert" on payments for insert
  with check (
    exists (
      select 1 from properties p
      where p.id = payments.property_id
        and (p.owner_id = auth.uid() or p.manager_id = auth.uid())
    ) or tenant_id = auth.uid()
  );
create policy "payments_update" on payments for update
  using (
    exists (
      select 1 from properties p
      where p.id = payments.property_id
        and (p.owner_id = auth.uid() or p.manager_id = auth.uid())
    )
  );

-- Utility bills: property owners/managers only
create policy "utility_bills_select" on utility_bills for select
  using (
    exists (
      select 1 from properties p
      where p.id = utility_bills.property_id
        and (p.owner_id = auth.uid() or p.manager_id = auth.uid())
    )
  );

-- Maintenance: tenants see own; landlord/manager sees all on their properties
create policy "maintenance_select" on maintenance_requests for select
  using (
    tenant_id = auth.uid() or
    exists (
      select 1 from properties p
      join units u on u.property_id = p.id
      where u.id = maintenance_requests.unit_id
        and (p.owner_id = auth.uid() or p.manager_id = auth.uid())
    )
  );
create policy "maintenance_insert" on maintenance_requests for insert
  with check (tenant_id = auth.uid());

-- ── USEFUL VIEWS ──────────────────────────────────────────────

-- Monthly payment summary per property
create or replace view property_payment_summary as
select
  py.property_id,
  p.name as property_name,
  py.period_month,
  py.period_year,
  count(*) as total_units,
  count(*) filter (where py.status = 'paid') as paid_count,
  count(*) filter (where py.status = 'overdue') as overdue_count,
  count(*) filter (where py.status = 'partial') as partial_count,
  sum(py.amount_due) as total_expected,
  sum(py.amount) as total_collected,
  sum(py.late_fee) as total_late_fees
from payments py
join properties p on p.id = py.property_id
group by py.property_id, p.name, py.period_month, py.period_year;

-- Active leases with tenant and unit info
create or replace view active_leases_detail as
select
  l.id as lease_id,
  l.rent_amount,
  l.due_day,
  l.start_date,
  l.end_date,
  l.late_fee_percent,
  l.grace_period_days,
  u.id as unit_id,
  u.unit_number,
  u.property_id,
  pr.name as property_name,
  pr.address,
  t.id as tenant_id,
  t.full_name as tenant_name,
  t.phone as tenant_phone,
  t.email as tenant_email
from leases l
join units u on u.id = l.unit_id
join properties pr on pr.id = u.property_id
join profiles t on t.id = l.tenant_id
where l.is_active = true;

-- ── INDEXES ───────────────────────────────────────────────────
create index idx_payments_property_period on payments(property_id, period_year, period_month);
create index idx_payments_tenant on payments(tenant_id);
create index idx_payments_status on payments(status);
create index idx_leases_tenant on leases(tenant_id);
create index idx_units_property on units(property_id);
