import * as chrono from 'chrono-node'

export interface ParsedTask {
  title: string
  start_time?: string
  end_time?: string
}

export function parseTaskInput(input: string): ParsedTask | null {
  const results = chrono.parse(input)
  if (results.length === 0) return null

  const { start, end, text } = results[0]
  const title = input.replace(text, '').trim() || input
  return {
    title,
    start_time: start?.date().toISOString(),
    end_time: end?.date().toISOString(),
  }
}
