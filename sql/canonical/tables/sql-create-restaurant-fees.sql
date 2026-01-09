-- Create restaurant_fees table for per-restaurant fee overrides
CREATE TABLE IF NOT EXISTS restaurant_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    fee_id UUID NOT NULL REFERENCES app_fees(id) ON DELETE CASCADE,
    custom_amount DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id, fee_id)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_restaurant_fees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_restaurant_fees_updated_at_trigger
    BEFORE UPDATE ON restaurant_fees
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurant_fees_updated_at();

-- Add RLS policies for restaurant_fees
ALTER TABLE restaurant_fees ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read restaurant fees (only their own)
CREATE POLICY "Allow authenticated read on restaurant_fees"
    ON restaurant_fees FOR SELECT
    USING (
        auth.role() = 'authenticated' 
        AND restaurant_id IN (
            SELECT id FROM restaurants 
            WHERE owner_id = auth.uid()
        )
    );

-- Allow service_role to manage restaurant fees
CREATE POLICY "Allow service_role full access to restaurant_fees"
    ON restaurant_fees FOR ALL
    USING (auth.role() = 'service_role');

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_restaurant_fees_restaurant_id ON restaurant_fees(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_fees_fee_id ON restaurant_fees(fee_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_fees_active ON restaurant_fees(is_active);
