export interface AddressInfo {
  zip: string
}

export interface GarbageEvent {
  wasteType: string
  date: string
  time?: string
  notes?: string
}

export interface GarbageProvider {
  fetchSchedule(addressOrUrl: AddressInfo | string): Promise<string>
  parseEvents(data: string): GarbageEvent[]
}

import * as ICAL from 'https://esm.sh/ical.js@2.2.0'

export { RepublicServicesProvider } from './republic.ts'
export { WasteManagementProvider } from './wm.ts'

export const providers: Record<string, GarbageProvider> = {
  republic: await import('./republic.ts').then(m => m.RepublicServicesProvider),
  wm: await import('./wm.ts').then(m => m.WasteManagementProvider),
  manual: {
    async fetchSchedule(data: string | AddressInfo): Promise<string> {
      if (typeof data !== 'string') throw new Error('ICS data required')
      return data
    },
    parseEvents(data: string) {
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
}
