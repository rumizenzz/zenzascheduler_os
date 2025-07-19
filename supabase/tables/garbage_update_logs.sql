CREATE TABLE garbage_update_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    address_id UUID,
    ics_url TEXT NOT NULL,
    total_events INTEGER NOT NULL,
    upserted_events INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
