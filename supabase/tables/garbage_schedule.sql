CREATE TABLE garbage_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    address_id UUID,
    provider VARCHAR(50),
    waste_type VARCHAR(50) NOT NULL,
    collection_day VARCHAR(20) NOT NULL,
    collection_time VARCHAR(20),
    frequency VARCHAR(20) NOT NULL,
    next_collection DATE,
    collection_year INTEGER,
    auto_reminder BOOLEAN DEFAULT false,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);