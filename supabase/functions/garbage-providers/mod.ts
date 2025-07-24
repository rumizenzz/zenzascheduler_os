export interface AddressInfo {
  zip: string
}

export interface GarbageEvent {
  wasteType: string
  date: string
  time?: string
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
      return comp.getAllSubcomponents('vevent').map((ev: any) => {
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
}
