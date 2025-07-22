CREATE TABLE upcoming_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    planned_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
