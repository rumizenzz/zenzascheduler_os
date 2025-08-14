CREATE TABLE IF NOT EXISTS public.os_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  content text,
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
