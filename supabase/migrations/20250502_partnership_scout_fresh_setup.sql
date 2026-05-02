-- PARTNERSHIP SCOUT SETUP - Fresh Install
-- Drops and recreates partners_raw table with all dependencies

-- ============================================
-- 1. CLEANUP: Drop existing table and policies
-- ============================================
DROP TABLE IF EXISTS partners_raw CASCADE;

-- ============================================
-- 2. CREATE TABLE
-- ============================================
CREATE TABLE partners_raw (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_route TEXT NOT NULL DEFAULT 'platinum_circle',
    company_name TEXT NOT NULL,
    industry TEXT,
    opportunity_type TEXT[] DEFAULT '{}',
    priority_score DECIMAL(3,2) CHECK (priority_score >= 0 AND priority_score <= 1),
    contact_hint TEXT,
    raw_opportunity JSONB,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'researching', 'contacted', 'negotiating', 'closed')),
    extracted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. INDEXES
-- ============================================
CREATE INDEX idx_partners_raw_source ON partners_raw(source_route);
CREATE INDEX idx_partners_raw_status ON partners_raw(status);
CREATE INDEX idx_partners_raw_priority ON partners_raw(priority_score DESC);
CREATE INDEX idx_partners_raw_extracted ON partners_raw(extracted_at DESC);
CREATE INDEX idx_partners_raw_company ON partners_raw(company_name);
CREATE INDEX idx_partners_raw_opportunity ON partners_raw USING GIN(opportunity_type);
CREATE INDEX idx_partners_raw_json ON partners_raw USING GIN(raw_opportunity);

-- ============================================
-- 4. RLS SETUP
-- ============================================
ALTER TABLE partners_raw ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies (ignore errors if none exist)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow read access" ON partners_raw;
    DROP POLICY IF EXISTS "Allow service inserts" ON partners_raw;
    DROP POLICY IF EXISTS "Allow updates" ON partners_raw;
    DROP POLICY IF EXISTS "Allow admin full access" ON partners_raw;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Allow reads for authenticated users
CREATE POLICY "Allow read access" ON partners_raw
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow inserts from service role (edge function)
CREATE POLICY "Allow service inserts" ON partners_raw
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Allow inserts from authenticated users (for the React component)
CREATE POLICY "Allow authenticated inserts" ON partners_raw
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow updates from authenticated users
CREATE POLICY "Allow updates" ON partners_raw
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow deletes from authenticated users
CREATE POLICY "Allow deletes" ON partners_raw
    FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 5. GRANTS
-- ============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON partners_raw TO authenticated;
GRANT ALL ON partners_raw TO service_role;

-- ============================================
-- 6. AUTO-UPDATE TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_partners_raw_updated_at ON partners_raw;

CREATE TRIGGER update_partners_raw_updated_at
    BEFORE UPDATE ON partners_raw
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment below to insert test data
/*
INSERT INTO partners_raw (company_name, industry, opportunity_type, priority_score, contact_hint, status, raw_opportunity) VALUES
('Test Insurance Corp', 'Insurance', ARRAY['insurance', 'luxury'], 0.85, 'Source: Test Data', 'new', 
 '{"title": "Test Insurance seeking partnerships", "summary": "Looking for VIP concierge partners"}'::jsonb),
('Global Relocation Services', 'Relocation', ARRAY['relocation', 'partnership'], 0.75, 'Source: Test Data', 'new',
 '{"title": "Relocation company expansion", "summary": "Seeking insurance partners"}'::jsonb);
*/

-- ============================================
-- 8. VERIFY SETUP
-- ============================================
SELECT 'partners_raw table created successfully' as status;
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'partners_raw' 
ORDER BY ordinal_position;
