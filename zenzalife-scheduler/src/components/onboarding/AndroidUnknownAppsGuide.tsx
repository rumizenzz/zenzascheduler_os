import React from 'react'

export function AndroidUnknownAppsGuide() {
  return (
    <div className="w-40 h-80 bg-white border border-gray-300 rounded-xl shadow-inner text-[10px] p-2 space-y-1">
      <div className="bg-gray-200 h-6 rounded flex items-center px-2 font-medium text-gray-700">
        Install unknown apps
      </div>
      <div className="flex-1 bg-white rounded-b-xl border-t border-gray-200 mt-1 p-2 space-y-1">
        <div className="space-y-1 text-center text-gray-500">
          <p>Settings → Apps → Special access</p>
          <p>→ Install unknown apps → Chrome → Allow</p>
        </div>
      </div>
    </div>
  )
}
