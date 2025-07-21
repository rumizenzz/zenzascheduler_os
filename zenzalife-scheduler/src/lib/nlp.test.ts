import { describe, it, expect } from 'vitest'
import { parseNaturalTask } from './nlp'

describe('parseNaturalTask', () => {
  it('parses basic phrase', () => {
    const result = parseNaturalTask('Dentist at 2pm tomorrow', new Date('2024-05-01T09:00:00Z'))
    expect(result).not.toBeNull()
    expect(result?.title).toBe('Dentist')
    expect(result?.start.getHours()).toBe(14)
  })
})
