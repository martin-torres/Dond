-- Create admin_communications table for messages to restaurants
CREATE TABLE IF NOT EXISTS admin_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for admin_communications
ALTER TABLE admin_communications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read communications (only their own)
CREATE POLICY "Allow authenticated read on admin_communications"
    ON admin_communications FOR SELECT
    USING (
        auth.role() = 'authenticated' 
        AND restaurant_id IN (
            SELECT id FROM restaurants 
            WHERE owner_id = auth.uid()
        )
    );

-- Allow service_role to manage communications
CREATE POLICY "Allow service_role full access to admin_communications"
    ON admin_communications FOR ALL
    USING (auth.role() = 'service_role');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_communications_restaurant_id ON admin_communications(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_admin_communications_priority ON admin_communications(priority);
CREATE INDEX IF NOT EXISTS idx_admin_communications_created_at ON admin_communications(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_communications_read_at ON admin_communications(read_at);
CREATE INDEX IF NOT EXISTS idx_admin_communications_expires_at ON admin_communications(expires_at);

-- Create function to mark communication as read
CREATE OR REPLACE FUNCTION mark_communication_as_read(p_communication_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE admin_communications 
    SET read_at = NOW()
    WHERE id = p_communication_id
    AND (
        restaurant_id IN (
            SELECT id FROM restaurants 
            WHERE owner_id = auth.uid()
        )
        OR auth.role() = 'service_role'
    );
    
    RETURN FOUND;
END;
$$;

-- Create function to get unread count for a restaurant
CREATE OR REPLACE FUNCTION get_unread_communications_count(p_restaurant_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT COUNT(*)::INTEGER
    FROM admin_communications
    WHERE restaurant_id = p_restaurant_id
    AND read_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW());
$$;

-- Grant execute permission on the functions
GRANT EXECUTE ON FUNCTION mark_communication_as_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_communications_count(UUID) TO authenticated;
