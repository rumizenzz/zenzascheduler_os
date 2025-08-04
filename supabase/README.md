# Supabase Backend

This directory contains Supabase functions and SQL scripts.

## Fixing Missing `type` Column

If you see an error like:

```
Failed to save item: Could not find the 'type' column of 'addresses' in the schema cache
```

add the missing column with:

```sql
ALTER TABLE addresses ADD COLUMN type VARCHAR(100);
```

You can also recreate the table using `supabase/tables/addresses.sql`.

## Fixing Missing `photo_url` Column

If you encounter an error like:

```
Upload failed: Could not find the 'photo_url' column of 'grace_prayers' in the schema cache
```

add the missing column with:

```sql
ALTER TABLE grace_prayers ADD COLUMN photo_url TEXT;
```

You can also recreate the table using `supabase/tables/grace_prayers.sql`.
