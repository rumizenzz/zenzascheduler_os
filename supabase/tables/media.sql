CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID REFERENCES people(id) ON DELETE CASCADE,
    event_id UUID REFERENCES life_events(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
