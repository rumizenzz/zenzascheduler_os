const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_KEY')!

  const headers = {
    Authorization: `Bearer ${serviceRoleKey}`,
    apikey: serviceRoleKey,
    'Content-Type': 'application/json',
  }

  try {
    await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: `CREATE TABLE IF NOT EXISTS public.os_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  content text,
  app text NOT NULL DEFAULT 'note',
  x integer NOT NULL DEFAULT 0,
  y integer NOT NULL DEFAULT 0,
  width integer NOT NULL DEFAULT 300,
  height integer NOT NULL DEFAULT 200,
  z_index integer NOT NULL DEFAULT 1,
  minimized boolean NOT NULL DEFAULT false,
  maximized boolean NOT NULL DEFAULT false,
  restore_x integer,
  restore_y integer,
  restore_width integer,
  restore_height integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.os_windows ADD COLUMN IF NOT EXISTS minimized boolean NOT NULL DEFAULT false;
ALTER TABLE public.os_windows ADD COLUMN IF NOT EXISTS maximized boolean NOT NULL DEFAULT false;
ALTER TABLE public.os_windows ADD COLUMN IF NOT EXISTS restore_x integer;
ALTER TABLE public.os_windows ADD COLUMN IF NOT EXISTS restore_y integer;
ALTER TABLE public.os_windows ADD COLUMN IF NOT EXISTS restore_width integer;
ALTER TABLE public.os_windows ADD COLUMN IF NOT EXISTS restore_height integer;
ALTER TABLE public.os_windows ADD COLUMN IF NOT EXISTS app text NOT NULL DEFAULT 'note';
CREATE TABLE IF NOT EXISTS public.os_desktop_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  x integer NOT NULL DEFAULT 0,
  y integer NOT NULL DEFAULT 0,
  content text NOT NULL DEFAULT '{"files":[],"folders":[]}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);`,
      }),
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('ensure-os-schema error', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

