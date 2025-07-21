CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID,
    event_id UUID,
    title VARCHAR(255),
    description TEXT,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
