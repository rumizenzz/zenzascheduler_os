import * as chrono from 'chrono-node'

export interface ParsedTask {
  title: string
  start: Date
  end?: Date
}

export function parseNaturalTask(input: string, baseDate: Date = new Date()): ParsedTask | null {
  const results = chrono.parse(input, baseDate)
  if (!results.length) return null

  const result = results[0]
  const start = result.start.date()
  const end = result.end?.date()
  const text = input.replace(result.text, '').trim()
  return {
    title: text || 'Untitled Task',
    start,
    end,
  }
}
