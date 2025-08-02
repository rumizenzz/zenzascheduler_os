create table if not exists ide_file_versions (
  id uuid primary key default uuid_generate_v4(),
  file_id uuid references ide_files(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);
