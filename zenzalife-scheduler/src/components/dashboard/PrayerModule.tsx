import React from 'react'
import { DailyPrayerModule } from './DailyPrayerModule'
import { GracePrayerModule } from './GracePrayerModule'

export function PrayerModule() {
  const params = new URLSearchParams(window.location.search)
  const typeParam = params.get('type') as 'morning' | 'night' | null
  return (
    <div className="space-y-8">
      <DailyPrayerModule autoStartType={typeParam || undefined} />
      <div className="h-px bg-gray-300" />
      <GracePrayerModule />
    </div>
  )
}
