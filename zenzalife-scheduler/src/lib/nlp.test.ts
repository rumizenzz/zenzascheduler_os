import { describe, it, expect } from 'vitest'
import { parseTaskInput } from './nlp'

describe('parseTaskInput', () => {
  it('parses time expressions', () => {
    const result = parseTaskInput('Dentist at 2pm Friday')
    expect(result).not.toBeNull()
    expect(result!.title).toBe('Dentist')
    expect(result!.start_time).toBeDefined()
  })
})
