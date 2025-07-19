CREATE TABLE garbage_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    location_address TEXT,
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);