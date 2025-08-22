import { describe, test, expect } from "vitest"
import { createReviewLink, updateReviewLinkDuration, deleteReviewLink, getExpirationMessage } from './reviewLinks'

describe('reviewLinks', () => {
  test('update duration and delete links', () => {
    const link = createReviewLink('https://example.com', 60 * 60 * 1000)
    const updated = updateReviewLinkDuration(link, 30 * 60 * 1000)
    expect(updated.expiresAt.getTime() - updated.createdAt.getTime()).toBe(30 * 60 * 1000)
    const remaining = deleteReviewLink([updated], updated.id)
    expect(remaining).toHaveLength(0)
  })

  test('expiration message', () => {
    const link = createReviewLink('https://example.com', 90 * 60 * 1000)
    const msg = getExpirationMessage(link, new Date(link.createdAt.getTime() + 60 * 60 * 1000))
    expect(msg).toBe('Expires in 30m')
  })
})
