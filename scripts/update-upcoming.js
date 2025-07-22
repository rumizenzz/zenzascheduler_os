import { createClient } from '@supabase/supabase-js'
import { writeFile } from 'fs/promises'
import path from 'path'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data, error } = await supabase
    .from('upcoming_releases')
    .select('*')
    .order('planned_date', { ascending: true })

  if (error) throw error

  const lines = ['# Upcoming Releases', '']
  for (const r of data ?? []) {
    const date = r.planned_date ? ` (planned ${r.planned_date})` : ''
    lines.push(`## ${r.version} - ${r.title}${date}`)
    if (r.description) lines.push(r.description)
    lines.push('')
  }
  const filePath = path.resolve('UPCOMING_RELEASES.md')
  await writeFile(filePath, lines.join('\n'))
  console.log(`Updated ${filePath}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
