CREATE TABLE change_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    tags TEXT[],
    author TEXT,
    icon_url TEXT,
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
INSERT INTO change_log (version, title, message, tags, author, icon_url)
VALUES (
  '0.1.0',
  'Calendar Year Selector',
  'Added year selector to the calendar toolbar that saves the chosen year in Supabase.',
  ARRAY['New'],
  'system',
  'calendar'
);
INSERT INTO change_log (version, title, message, tags, author)
VALUES (
  '0.1.0',
  'CHANGELOG Policy',
  'Documented the requirement to log all future changes in CHANGELOG.md.',
  ARRAY['Improved'],
  'system'
);
INSERT INTO change_log (version, title, message, tags, author)
VALUES (
  '0.1.0',
  'Professional Changelog',
  'Clarified professional changelog policy and enforced it in AGENT instructions.',
  ARRAY['Improved'],
  'system'
);
INSERT INTO change_log (version, title, message, tags, author)
VALUES (
  '0.1.0',
  'Changelog Modal',
  'Polished changelog format and copied it to the public folder for the Change Log modal.',
  ARRAY['Improved'],
  'system'
);

