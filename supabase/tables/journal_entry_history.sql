CREATE TABLE journal_entry_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
