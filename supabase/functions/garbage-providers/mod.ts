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

export { RepublicServicesProvider } from './republic.ts'

export const providers: Record<string, GarbageProvider> = {
  republic: await import('./republic.ts').then(m => m.RepublicServicesProvider)
}
