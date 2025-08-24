import React from 'react'
import { ScrollText } from 'lucide-react'

export function TenYearSelfLetterModule() {
  const letter = `Dear Future Me,

It's been ten years since I wrote this. I hope you stayed curious, kind, and faithful. Remember the dreams we carried in 2025 and how far we've come. Continue to put family and God first, serve others, and pursue learning with humility. Let setbacks refine you and keep gratitude at the center of everything.

With hope and determination,
Your Past Self`

  return (
    <div className="max-w-3xl mx-auto bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-8 rounded-2xl shadow-lg border border-amber-200 text-gray-800 space-y-6">
      <div className="text-center space-y-2">
        <ScrollText className="w-10 h-10 mx-auto text-amber-500" />
        <h1 className="text-4xl font-bold text-amber-700">10-Year Self Letter</h1>
      </div>
      <p className="whitespace-pre-line leading-relaxed">{letter}</p>
    </div>
  )
}

export default TenYearSelfLetterModule
