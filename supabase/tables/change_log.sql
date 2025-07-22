CREATE TABLE change_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
INSERT INTO change_log (message) VALUES ('Added year selector to the calendar toolbar that saves the chosen year in Supabase.');
INSERT INTO change_log (message) VALUES ('Documented the requirement to log all future changes in CHANGELOG.md.');

