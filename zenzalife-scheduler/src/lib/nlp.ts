import * as chrono from 'chrono-node'

export interface ParsedTask {
  title: string
  start: Date
  end?: Date
}

export function parseNaturalTask(
  input: string,
  baseDate: Date = new Date(),
): ParsedTask | null {
  const results = chrono.parse(input, baseDate)
  if (!results.length) return null

  const start = results[0].start.date()
  let end = results[0].end?.date()

  if (!end && results.length > 1) {
    end = results[1].start.date()
  }

  let title = input
  for (const r of results) {
    title = title.replace(r.text, ' ')
  }
  title = title
    .replace(/\b(at|on|from|to|until|start(?:ing)?|stop|end|and)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return {
    title: title || 'Untitled Task',
    start,
    end,
  }
}
