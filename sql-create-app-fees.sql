-- Create app_fees table for global app fee structure
CREATE TABLE IF NOT EXISTS app_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_type VARCHAR(20) NOT NULL CHECK (fee_type IN ('percentage', 'fixed', 'recurring')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_app_fees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_app_fees_updated_at_trigger
    BEFORE UPDATE ON app_fees
    FOR EACH ROW
    EXECUTE FUNCTION update_app_fees_updated_at();

-- Add RLS policies for app_fees
ALTER TABLE app_fees ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read app fees
CREATE POLICY "Allow authenticated read on app_fees"
    ON app_fees FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow service_role to manage app fees
CREATE POLICY "Allow service_role full access to app_fees"
    ON app_fees FOR ALL
    USING (auth.role() = 'service_role');

-- Insert default app fees
INSERT INTO app_fees (fee_type, amount, description) VALUES
('percentage', 5.00, 'Default 5% platform fee'),
('recurring', 29.99, 'Monthly subscription fee'),
('fixed', 0.30, 'Per transaction processing fee')
ON CONFLICT DO NOTHING;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_app_fees_type ON app_fees(fee_type);
