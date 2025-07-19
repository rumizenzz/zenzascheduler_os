CREATE TABLE family_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_name VARCHAR(255) NOT NULL,
    created_by UUID NOT NULL,
    planned_children INTEGER DEFAULT 0,
    current_children INTEGER DEFAULT 0,
    children_profiles JSONB DEFAULT '[]',
    milestones JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);