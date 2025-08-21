export interface ReviewLink {
  id: string
  url: string
  createdAt: Date
  expiresAt: Date
}

const genId = () => Math.random().toString(36).slice(2)

export function createReviewLink(url: string, durationMs: number): ReviewLink {
  const now = new Date()
  return {
    id: genId(),
    url,
    createdAt: now,
    expiresAt: new Date(now.getTime() + durationMs),
  }
}

export function updateReviewLinkDuration(link: ReviewLink, durationMs: number): ReviewLink {
  return { ...link, expiresAt: new Date(link.createdAt.getTime() + durationMs) }
}

export function deleteReviewLink(links: ReviewLink[], id: string): ReviewLink[] {
  return links.filter(l => l.id !== id)
}

export function getExpirationMessage(link: ReviewLink, now: Date = new Date()): string {
  const diffMs = link.expiresAt.getTime() - now.getTime()
  if (diffMs <= 0) return 'Expired'
  const diffSec = Math.floor(diffMs / 1000)
  const days = Math.floor(diffSec / 86400)
  const hours = Math.floor((diffSec % 86400) / 3600)
  const minutes = Math.floor((diffSec % 3600) / 60)
  if (days > 0) return `Expires in ${days}d ${hours}h`
  if (hours > 0) return `Expires in ${hours}h ${minutes}m`
  return `Expires in ${minutes}m`
}
