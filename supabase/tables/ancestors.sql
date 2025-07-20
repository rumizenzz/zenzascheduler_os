CREATE TABLE ancestors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    relation VARCHAR(100),
    birth_year INTEGER,
    death_year INTEGER,
    baptized BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
