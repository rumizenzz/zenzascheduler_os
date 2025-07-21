import React from 'react'

export function AndroidBatteryGuide() {
  return (
    <div className="w-40 h-80 bg-white border border-gray-300 rounded-xl shadow-inner text-[10px] p-2 space-y-1">
      <div className="bg-gray-200 h-6 rounded flex items-center px-2 font-medium text-gray-700">
        App info
      </div>
      <div className="flex-1 bg-white rounded-b-xl border-t border-gray-200 mt-1 p-2 space-y-1">
        <div className="flex justify-between">
          <span>Battery</span>
          <span className="text-green-600 font-semibold">Unrestricted</span>
        </div>
        <div className="text-gray-500 mt-4 text-center">
          Settings → Apps → ZenzaLife → Battery → Unrestricted
        </div>
      </div>
    </div>
  )
}
