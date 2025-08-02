CREATE TABLE ged_math_study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    mode TEXT NOT NULL,
    stage TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
