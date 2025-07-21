CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID,
    event_id UUID,
    media_type VARCHAR(50),
    url TEXT,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
