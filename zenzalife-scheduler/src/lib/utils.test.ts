import { describe, it, expect } from 'vitest'
import { cn, cleanupOverlays } from './utils'

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })
})

describe('cleanupOverlays', () => {
  it('removes non-persistent full-screen overlays', () => {
    document.body.innerHTML = `
      <div class="fixed inset-0" id="remove-me"></div>
      <div class="fixed inset-0" data-persistent="true" id="keep-me"></div>
    `

    cleanupOverlays()

    expect(document.getElementById('remove-me')).toBeNull()
    expect(document.getElementById('keep-me')).not.toBeNull()
  })
})
