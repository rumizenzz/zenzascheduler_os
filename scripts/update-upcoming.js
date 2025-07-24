import { createClient } from '@supabase/supabase-js'
import { readFile, writeFile } from 'fs/promises'
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

  // Update CHANGELOG with an Upcoming Releases section under [Unreleased]
  const changelogPath = path.resolve('CHANGELOG.md')
  let changelog = await readFile(changelogPath, 'utf8')
  const unreleasedMatch = changelog.match(/## \[Unreleased\][\s\S]*?(?=\n## |$)/)
  if (unreleasedMatch) {
    const unreleased = unreleasedMatch[0]
    const upcomingIndex = unreleased.indexOf('### Upcoming Releases')
    let replacement = '## [Unreleased]\n\n### Upcoming Releases\n'
    const upcomingLines = data
      ? data.map(r => {
          const date = r.planned_date ? ` (planned ${r.planned_date})` : ''
          const desc = r.description ? ` - ${r.description}` : ''
          return `- ${r.version} - ${r.title}${date}${desc}`
        })
      : []
    replacement += upcomingLines.join('\n')
    if (upcomingLines.length) replacement += '\n'
    // Keep the rest of the unreleased section after existing Upcoming Releases
    const rest =
      upcomingIndex >= 0
        ? unreleased.slice(unreleased.indexOf('### Upcoming Releases')).split(/\n/).slice(1).join('\n')
        : unreleased.replace(/^## \[Unreleased\]\n/, '')
    replacement += rest.startsWith('\n') ? rest : `\n${rest}`
    changelog = changelog.replace(unreleasedMatch[0], replacement)
    await writeFile(changelogPath, changelog)
    console.log(`Updated ${changelogPath}`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
