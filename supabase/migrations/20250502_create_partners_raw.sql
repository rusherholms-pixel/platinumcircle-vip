-- Create partners_raw table for Platinum Circle
-- Stores insurance/relocation partnership leads

CREATE TABLE IF NOT EXISTS partners_raw (
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_partners_raw_source ON partners_raw(source_route);
CREATE INDEX IF NOT EXISTS idx_partners_raw_status ON partners_raw(status);
CREATE INDEX IF NOT EXISTS idx_partners_raw_priority ON partners_raw(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_partners_raw_extracted ON partners_raw(extracted_at DESC);

-- RLS policies (enable for security)
ALTER TABLE partners_raw ENABLE ROW LEVEL SECURITY;

-- Allow reads for authenticated users
CREATE POLICY "Allow read access" ON partners_raw
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow inserts from service role (edge function)
CREATE POLICY "Allow service inserts" ON partners_raw
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Allow updates from authenticated users
CREATE POLICY "Allow updates" ON partners_raw
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON partners_raw TO authenticated;
GRANT ALL ON partners_raw TO service_role;

-- Set up cron job for hourly runs (optional - can also trigger manually)
-- SELECT cron.schedule('partnership-scout', '0 * * * *', 
--   $$ SELECT net.http_post(url:='https://ejnzkmzsinepbxrniuvj.supabase.co/functions/v1/partnership-scout') $$);
