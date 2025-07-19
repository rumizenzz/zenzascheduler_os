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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);