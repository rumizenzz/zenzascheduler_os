CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    repeat_pattern VARCHAR(100),
    alarm BOOLEAN DEFAULT false,
    custom_sound_path TEXT,
    goal_linked UUID,
    completed BOOLEAN DEFAULT false,
    visibility VARCHAR(50) DEFAULT 'private',
    notes TEXT,
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);