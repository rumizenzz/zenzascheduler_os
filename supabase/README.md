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
