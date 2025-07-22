CREATE TABLE change_log_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    changelog_id UUID REFERENCES change_log(id) ON DELETE CASCADE,
    user_id UUID,
    reaction TEXT CHECK (reaction IN ('thumbs_up', 'party', 'heart')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
