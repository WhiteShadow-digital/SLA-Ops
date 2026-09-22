-- ============================================================================
-- IT Hardware Asset Tracker - Supabase PostgreSQL Schema
-- Compatible with project: https://supabase.com/dashboard/project/apjeyawbuvwjbxuvzlcz
-- ============================================================================

-- 1. Create Enums if needed
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('it_staff', 'employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE asset_status AS ENUM ('available', 'checked_out', 'in_repair', 'retired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('it_staff', 'employee')),
    department TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Assets Table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    serial_number TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out', 'in_repair', 'retired')),
    location TEXT NOT NULL,
    warranty_expiration DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Asset Assignments Table
CREATE TABLE IF NOT EXISTS public.asset_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    checked_out_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    check_out_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_in_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Indexes for fast QR scanning and queries
CREATE INDEX IF NOT EXISTS idx_assets_qr_code_id ON public.assets(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_asset_id ON public.asset_assignments(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_assigned_to ON public.asset_assignments(assigned_to);

-- 6. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_assignments ENABLE ROW LEVEL SECURITY;

-- Allow public/anon and authenticated users to view profiles & inventory (for app and scanner)
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public read assets" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Public update assets" ON public.assets FOR UPDATE USING (true);
CREATE POLICY "Public insert assets" ON public.assets FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read assignments" ON public.asset_assignments FOR SELECT USING (true);
CREATE POLICY "Public insert assignments" ON public.asset_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update assignments" ON public.asset_assignments FOR UPDATE USING (true);

-- 7. Seed Initial Staff, Employees, & IT Assets
INSERT INTO public.profiles (id, full_name, email, role, department) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Alex Mercer', 'alex.mercer@company.internal', 'it_staff', 'IT Infrastructure'),
    ('22222222-2222-2222-2222-222222222222', 'Elena Rostova', 'elena.r@company.internal', 'it_staff', 'Helpdesk Support'),
    ('33333333-3333-3333-3333-333333333333', 'Marcus Vance', 'marcus.v@company.internal', 'employee', 'Engineering'),
    ('44444444-4444-4444-4444-444444444444', 'Sarah Chen', 'sarah.chen@company.internal', 'employee', 'Product Design'),
    ('55555555-5555-5555-5555-555555555555', 'David Kim', 'david.kim@company.internal', 'employee', 'Data Analytics')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.assets (id, qr_code_id, name, serial_number, category, status, location, warranty_expiration) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'AST-2026-001', 'MacBook Pro 16" M3 Max', 'C02G9988MD6R', 'Laptops', 'available', 'IT Storage Room 4B', '2027-11-15'),
    ('a0000000-0000-0000-0000-000000000002', 'AST-2026-002', 'Dell UltraSharp 32" 4K Monitor', 'CN078X-74261-2A', 'Displays', 'checked_out', 'Design Studio Desk 14', '2026-08-30'),
    ('a0000000-0000-0000-0000-000000000003', 'AST-2026-003', 'Lenovo ThinkPad X1 Carbon Gen 12', 'PF388271', 'Laptops', 'available', 'IT Staging Lab', '2027-04-10'),
    ('a0000000-0000-0000-0000-000000000004', 'AST-2026-004', 'Cisco Catalyst 1000 24-Port Switch', 'FOC2441S09G', 'Networking', 'available', 'Server Room Rack C', '2028-12-01'),
    ('a0000000-0000-0000-0000-000000000005', 'AST-2026-005', 'iPad Pro 12.9" M2 Cellular', 'DMPZ3889Q16T', 'Tablets', 'in_repair', 'Service Depot Bay 2', '2026-10-20')
ON CONFLICT (qr_code_id) DO NOTHING;

-- Initial Assignment for checked out item
INSERT INTO public.asset_assignments (asset_id, assigned_to, checked_out_by, check_out_date, notes) VALUES
    ('a0000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '14 days', 'Issued for Q3 Design Sprint & UI testing')
ON CONFLICT DO NOTHING;
