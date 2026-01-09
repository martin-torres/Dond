-- Create restaurant_analytics table for statistics and timestamps
CREATE TABLE IF NOT EXISTS restaurant_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_ms INTEGER,
    stage VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for restaurant_analytics
ALTER TABLE restaurant_analytics ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read analytics (only their own)
CREATE POLICY "Allow authenticated read on restaurant_analytics"
    ON restaurant_analytics FOR SELECT
    USING (
        auth.role() = 'authenticated' 
        AND restaurant_id IN (
            SELECT id FROM restaurants 
            WHERE owner_id = auth.uid()
        )
    );

-- Allow service_role to insert analytics
CREATE POLICY "Allow service_role insert on restaurant_analytics"
    ON restaurant_analytics FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Allow service_role to manage analytics
CREATE POLICY "Allow service_role full access to restaurant_analytics"
    ON restaurant_analytics FOR ALL
    USING (auth.role() = 'service_role');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_restaurant_analytics_restaurant_id ON restaurant_analytics(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_analytics_event_type ON restaurant_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_restaurant_analytics_timestamp ON restaurant_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_restaurant_analytics_stage ON restaurant_analytics(stage);
CREATE INDEX IF NOT EXISTS idx_restaurant_analytics_metadata ON restaurant_analytics USING GIN(metadata);

-- Create function to insert analytics
CREATE OR REPLACE FUNCTION insert_restaurant_analytics(
    p_restaurant_id UUID,
    p_event_type VARCHAR(50),
    p_duration_ms INTEGER DEFAULT NULL,
    p_stage VARCHAR(50) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    analytics_id UUID;
BEGIN
    INSERT INTO restaurant_analytics (
        restaurant_id, 
        event_type, 
        duration_ms, 
        stage, 
        metadata
    ) VALUES (
        p_restaurant_id, 
        p_event_type, 
        p_duration_ms, 
        p_stage, 
        p_metadata
    )
    RETURNING id INTO analytics_id;
    
    RETURN analytics_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION insert_restaurant_analytics(UUID, VARCHAR, INTEGER, VARCHAR, JSONB) TO authenticated;
