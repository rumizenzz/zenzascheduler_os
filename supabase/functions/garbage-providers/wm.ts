import * as ICAL from 'https://esm.sh/ical.js@2.2.0'
import type { GarbageProvider, AddressInfo, GarbageEvent } from './mod.ts'

export const WasteManagementProvider: GarbageProvider = {
  async fetchSchedule(addressOrUrl: AddressInfo | string): Promise<string> {
    const url = typeof addressOrUrl === 'string'
      ? addressOrUrl
      : `https://www.wm.com/schedule/ics/${addressOrUrl.zip}`
    const res = await fetch(url, { headers: { 'User-Agent': 'ZenzaLife Scheduler Bot' } })
    if (!res.ok) {
      throw new Error('Failed to fetch schedule')
    }
    return await res.text()
  },

  parseEvents(data: string): GarbageEvent[] {
    const comp = new ICAL.Component(ICAL.parse(data))
    const vevents = comp.getAllSubcomponents('vevent')
    const events: GarbageEvent[] = []
    const end = new Date()
    end.setFullYear(end.getFullYear() + 1)

    for (const ev of vevents) {
      const e = new ICAL.Event(ev)
      const iterator = e.iterator()
      let next
      while ((next = iterator.next())) {
        const jsDate = next.toJSDate()
        if (jsDate > end) break
        const summary = e.summary || ''
        const notes = e.description || ''
        const lower = summary.toLowerCase()
        const wasteType = lower.includes('recycle')
          ? 'recycling'
          : lower.includes('compost')
          ? 'compost'
          : 'trash'
        events.push({
          wasteType,
          date: jsDate.toISOString().split('T')[0],
          time: jsDate.toISOString().split('T')[1]?.slice(0, 5),
          notes
        })
      }
    }

    return events
  }
}
