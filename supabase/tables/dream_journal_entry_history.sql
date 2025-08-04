CREATE TABLE dream_journal_entry_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES dream_journal_entries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
