-- Create data_imports table for tracking spreadsheet/file imports
CREATE TABLE IF NOT EXISTS data_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('csv', 'xlsx', 'json')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    records_processed INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    error_details TEXT,
    file_name TEXT,
    file_size INTEGER,
    import_options JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for data_imports
ALTER TABLE data_imports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read imports (only their own)
CREATE POLICY "Allow authenticated read on data_imports"
    ON data_imports FOR SELECT
    USING (
        auth.role() = 'authenticated' 
        AND restaurant_id IN (
            SELECT id FROM restaurants 
            WHERE owner_id = auth.uid()
        )
    );

-- Allow service_role to manage imports
CREATE POLICY "Allow service_role full access to data_imports"
    ON data_imports FOR ALL
    USING (auth.role() = 'service_role');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_data_imports_restaurant_id ON data_imports(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_data_imports_status ON data_imports(status);
CREATE INDEX IF NOT EXISTS idx_data_imports_file_type ON data_imports(file_type);
CREATE INDEX IF NOT EXISTS idx_data_imports_created_at ON data_imports(created_at);
CREATE INDEX IF NOT EXISTS idx_data_imports_started_at ON data_imports(started_at);

-- Create function to update import status
CREATE OR REPLACE FUNCTION update_data_import_status(
    p_import_id UUID,
    p_status VARCHAR(20),
    p_records_processed INTEGER DEFAULT NULL,
    p_errors INTEGER DEFAULT NULL,
    p_error_details TEXT DEFAULT NULL,
    p_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE data_imports 
    SET 
        status = p_status,
        records_processed = COALESCE(p_records_processed, records_processed),
        errors = COALESCE(p_errors, errors),
        error_details = COALESCE(p_error_details, error_details),
        started_at = COALESCE(p_started_at, started_at),
        completed_at = COALESCE(p_completed_at, completed_at)
    WHERE id = p_import_id;
    
    RETURN FOUND;
END;
$$;

-- Create function to get import progress
CREATE OR REPLACE FUNCTION get_data_import_progress(p_import_id UUID)
RETURNS TABLE(
    status VARCHAR(20),
    records_processed INTEGER,
    errors INTEGER,
    progress_percent NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        di.status,
        di.records_processed,
        di.errors,
        CASE 
            WHEN di.status = 'completed' THEN 100
            WHEN di.status = 'failed' THEN 0
            ELSE 
                CASE 
                    WHEN di.records_processed > 0 THEN 
                        (di.records_processed::NUMERIC / NULLIF(di.records_processed + di.errors, 0) * 100)
                    ELSE 0
                END
        END AS progress_percent
    FROM data_imports di
    WHERE di.id = p_import_id;
$$;

-- Grant execute permission on the functions
GRANT EXECUTE ON FUNCTION update_data_import_status(UUID, VARCHAR, INTEGER, INTEGER, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_data_import_progress(UUID) TO authenticated;
