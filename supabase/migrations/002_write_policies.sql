-- ============================================================
-- RentFlow — Missing write policies
-- Run this in your Supabase SQL Editor after 001_initial_schema.sql
-- ============================================================

-- Units: owners/managers can add and edit units on their properties
create policy "units_insert" on units for insert
  with check (
    exists (
      select 1 from properties p
      where p.id = units.property_id
        and (p.owner_id = auth.uid() or p.manager_id = auth.uid())
    )
  );

create policy "units_update" on units for update
  using (
    exists (
      select 1 from properties p
      where p.id = units.property_id
        and (p.owner_id = auth.uid() or p.manager_id = auth.uid())
    )
  );

-- Leases: owners/managers can create and edit leases on units they own
create policy "leases_insert" on leases for insert
  with check (
    exists (
      select 1 from properties p
      join units u on u.property_id = p.id
      where u.id = leases.unit_id
        and (p.owner_id = auth.uid() or p.manager_id = auth.uid())
    )
  );

create policy "leases_update" on leases for update
  using (
    exists (
      select 1 from properties p
      join units u on u.property_id = p.id
      where u.id = leases.unit_id
        and (p.owner_id = auth.uid() or p.manager_id = auth.uid())
    )
  );

-- Utility bills: owners/managers can create and edit bills on their properties
create policy "utility_bills_insert" on utility_bills for insert
  with check (
    exists (
      select 1 from properties p
      where p.id = utility_bills.property_id
        and (p.owner_id = auth.uid() or p.manager_id = auth.uid())
    )
  );

create policy "utility_bills_update" on utility_bills for update
  using (
    exists (
      select 1 from properties p
      where p.id = utility_bills.property_id
        and (p.owner_id = auth.uid() or p.manager_id = auth.uid())
    )
  );

-- Maintenance: owners/managers can update requests on their properties (status, assignment)
create policy "maintenance_update" on maintenance_requests for update
  using (
    tenant_id = auth.uid() or
    exists (
      select 1 from properties p
      join units u on u.property_id = p.id
      where u.id = maintenance_requests.unit_id
        and (p.owner_id = auth.uid() or p.manager_id = auth.uid())
    )
  );
