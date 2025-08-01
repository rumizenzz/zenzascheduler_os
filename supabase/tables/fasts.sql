CREATE TABLE fasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    duration_hours INTEGER NOT NULL,
    allow_water BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
