CREATE TABLE growth_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    score_1percent DECIMAL(5,2) DEFAULT 0.00,
    identity_tags JSONB DEFAULT '[]',
    completed_tasks INTEGER DEFAULT 0,
    missed_tasks INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);