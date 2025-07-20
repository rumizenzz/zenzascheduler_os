import React from 'react'

export function IOSBackgroundGuide() {
  return (
    <div className="w-40 h-80 bg-white border border-gray-300 rounded-xl shadow-inner text-[10px] p-2 space-y-1">
      <div className="bg-gray-200 h-6 rounded flex items-center px-2 font-medium text-gray-700">
        Settings
      </div>
      <div className="flex-1 bg-white rounded-b-xl border-t border-gray-200 mt-1 p-2 space-y-1">
        <div className="flex justify-between">
          <span>Background App Refresh</span>
          <span className="text-green-600 font-semibold">On</span>
        </div>
        <div className="flex justify-between">
          <span>Time Sensitive</span>
          <span className="text-green-600 font-semibold">On</span>
        </div>
        <div className="text-gray-500 mt-4 text-center">
          Settings → ZenzaLife → enable Background App Refresh
        </div>
      </div>
    </div>
  )
}
