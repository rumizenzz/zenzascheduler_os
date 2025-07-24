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
    return comp.getAllSubcomponents('vevent').map((ev) => {
      const e = new ICAL.Event(ev)
      const summary = e.summary || ''
      const wasteType = summary.toLowerCase().includes('recycle') ? 'recycling' : 'trash'
      const dt = e.startDate.toJSDate()
      return {
        wasteType,
        date: dt.toISOString().split('T')[0],
        time: dt.toISOString().split('T')[1]?.slice(0,5)
      }
    })
  }
}
