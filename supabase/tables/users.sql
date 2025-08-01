CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INTEGER,
    profile_photo TEXT,
    relationship_role VARCHAR(100),
    relationship_status VARCHAR(100),
    role_type VARCHAR(50) DEFAULT 'User',
    growth_identity TEXT,
    family_id UUID,
    bio TEXT,
    entrance_sound_enabled BOOLEAN DEFAULT true,
    entrance_animation_enabled BOOLEAN DEFAULT true,
    entrance_duration_seconds INTEGER DEFAULT 6,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);