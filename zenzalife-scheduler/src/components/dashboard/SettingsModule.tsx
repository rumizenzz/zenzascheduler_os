import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { supabase, updateUserProfile } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Settings, User, Upload, Bell, Palette, Shield, HelpCircle, Download } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import { useNotifications } from '@/hooks/useNotifications'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { AlarmModal } from '../alerts/AlarmModal'

type SettingsTab = 'profile' | 'audio' | 'notifications' | 'appearance' | 'privacy' | 'help'

const tabConfig = [
  { id: 'profile', label: 'Profile', icon: User, color: 'text-blue-500' },
  { id: 'audio', label: 'Audio & Alarms', icon: Bell, color: 'text-purple-500' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-green-500' },
  { id: 'appearance', label: 'Appearance', icon: Palette, color: 'text-pink-500' },
  { id: 'privacy', label: 'Privacy', icon: Shield, color: 'text-orange-500' },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, color: 'text-gray-500' }
]

const relationshipRoles = [
  { value: 'mom', label: 'Mom' },
  { value: 'dad', label: 'Dad' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'husband', label: 'Husband' },
  { value: 'wife', label: 'Wife' },
  { value: 'partner', label: 'Partner' },
  { value: 'individual', label: 'Individual' }
]

export function SettingsModule() {
  const { user, profile, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [loading, setLoading] = useState(false)
  const { isIncognito } = useInstallPrompt()
  const [profileData, setProfileData] = useState({
    display_name: profile?.display_name || '',
    relationship_role: profile?.relationship_role || 'individual',
    age: profile?.age || '',
    bio: profile?.bio || '',
    growth_identity: profile?.growth_identity || ''
  })
  const builtinAlarms = [
    { name: 'Lucid Skybell', url: '/alarms/lucid-skybell.mp3' },
    { name: 'Dream Siren', url: '/alarms/dream-siren.mp3' },
    { name: 'Vanilla Alert', url: '/alarms/vanilla-alert.mp3' },
    { name: 'Echo Pulse', url: '/alarms/echo-pulse.mp3' },
    { name: 'Surreal Ringtone', url: '/alarms/surreal-ringtone.mp3' }
  ]

  const [audioSettings, setAudioSettings] = useState({
    entrance_sound: true,
    task_alarms: true,
    reminder_sounds: true,
    default_alarm: localStorage.getItem('defaultAlarmSound') || builtinAlarms[0].url,
    custom_alarm_file: null as File | null,
    custom_alarm_name: '',
    custom_alarms: JSON.parse(localStorage.getItem('customAlarmSounds') || '[]') as { name: string; url: string }[]
  })
  const { playEntranceSound, playAudio } = useAudio()
  const { requestPermission, testAlarm } = useNotifications()
  const [showTestAlarm, setShowTestAlarm] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (profile) {
      setProfileData({
        display_name: profile.display_name || '',
        relationship_role: profile.relationship_role || 'individual',
        age: profile.age?.toString() || '',
        bio: profile.bio || '',
        growth_identity: profile.growth_identity || ''
      })
    }
  }, [profile])

  useEffect(() => {
    localStorage.setItem('defaultAlarmSound', audioSettings.default_alarm)
    localStorage.setItem('customAlarmSounds', JSON.stringify(audioSettings.custom_alarms))
  }, [audioSettings.default_alarm, audioSettings.custom_alarms])

  const saveProfile = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      await updateUserProfile(user.id, {
        display_name: profileData.display_name,
        relationship_role: profileData.relationship_role,
        age: profileData.age ? parseInt(profileData.age.toString()) : null,
        bio: profileData.bio,
        growth_identity: profileData.growth_identity
      })
      
      await refreshProfile()
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error('Failed to update profile: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const uploadCustomAlarm = async () => {
    if (!audioSettings.custom_alarm_file || !user) return
    
    setLoading(true)
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string
          
          const { data, error } = await supabase.functions.invoke('audio-upload', {
            body: {
              audioData: base64Data,
              fileName: `alarm-${Date.now()}-${audioSettings.custom_alarm_file!.name}`,
              userId: user.id
            }
          })
          
          if (error) throw error
          
          if (data?.publicUrl) {
            const newList = [
              ...audioSettings.custom_alarms,
              { name: audioSettings.custom_alarm_name || audioSettings.custom_alarm_file!.name, url: data.publicUrl }
            ]
            localStorage.setItem('customAlarmSounds', JSON.stringify(newList))
            setAudioSettings(prev => ({
              ...prev,
              custom_alarm_file: null,
              custom_alarm_name: '',
              custom_alarms: newList
            }))
          }
          toast.success('Custom alarm uploaded successfully!')
        } catch (error: any) {
          toast.error('Failed to upload alarm: ' + error.message)
        } finally {
          setLoading(false)
        }
      }
      reader.readAsDataURL(audioSettings.custom_alarm_file)
    } catch (error: any) {
      toast.error('Failed to process file: ' + error.message)
      setLoading(false)
    }
  }

  const exportData = async () => {
    if (!user) return
    
    try {
      // Fetch all user data
      const [tasksResult, affirmationsResult, growthResult] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('affirmations').select('*').eq('user_id', user.id),
        supabase.from('growth_logs').select('*').eq('user_id', user.id)
      ])
      
      const exportData = {
        profile: profile,
        tasks: tasksResult.data || [],
        affirmations: affirmationsResult.data || [],
        growthLogs: growthResult.data || [],
        exportDate: new Date().toISOString()
      }
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `zenzalife-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Data exported successfully!')
    } catch (error: any) {
      toast.error('Failed to export data: ' + error.message)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium text-gray-700">Display Name</label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={profileData.display_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                  className="input-dreamy w-full"
                  placeholder="Your name"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="relationshipRoleSettings" className="text-sm font-medium text-gray-700">Role in Family</label>
                <select
                  id="relationshipRoleSettings"
                  name="relationshipRoleSettings"
                  value={profileData.relationship_role}
                  onChange={(e) => setProfileData(prev => ({ ...prev, relationship_role: e.target.value }))}
                  className="input-dreamy w-full"
                >
                  {relationshipRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="age" className="text-sm font-medium text-gray-700">Age (Optional)</label>
              <input
                id="age"
                name="age"
                type="number"
                value={profileData.age}
                onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value }))}
                className="input-dreamy w-full max-w-xs"
                placeholder="Your age"
                min="1"
                max="120"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="growthIdentity" className="text-sm font-medium text-gray-700">Growth Identity</label>
              <input
                id="growthIdentity"
                name="growthIdentity"
                type="text"
                value={profileData.growth_identity}
                onChange={(e) => setProfileData(prev => ({ ...prev, growth_identity: e.target.value }))}
                className="input-dreamy w-full"
                placeholder="I am becoming..."
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                className="input-dreamy w-full h-24 resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <button
              onClick={saveProfile}
              disabled={loading}
              className="btn-dreamy-primary"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )
        
      case 'audio':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Sound Settings</h3>

              <div className="space-y-3">
                <label htmlFor="defaultAlarm" className="text-sm font-medium text-gray-700">Default Alarm Sound</label>
                <select
                  id="defaultAlarm"
                  value={audioSettings.default_alarm}
                  onChange={(e) => {
                    localStorage.setItem('defaultAlarmSound', e.target.value)
                    setAudioSettings(prev => ({ ...prev, default_alarm: e.target.value }))
                  }}
                  className="input-dreamy w-full"
                >
                  {[...builtinAlarms, ...audioSettings.custom_alarms].map(alarm => (
                    <option key={alarm.url} value={alarm.url}>
                      {alarm.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => playAudio(audioSettings.default_alarm)}
                  className="text-xs text-blue-500 underline"
                >
                  Test Selected
                </button>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    name="entranceSound"
                    type="checkbox"
                    checked={audioSettings.entrance_sound}
                    onChange={(e) => setAudioSettings(prev => ({ ...prev, entrance_sound: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Play entrance sound on app load</span>
                  <button
                    onClick={playEntranceSound}
                    className="text-xs text-blue-500 hover:text-blue-700 underline"
                  >
                    Test
                  </button>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    name="taskAlarms"
                    type="checkbox"
                    checked={audioSettings.task_alarms}
                    onChange={(e) => setAudioSettings(prev => ({ ...prev, task_alarms: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Enable task alarms</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    name="reminderSounds"
                    type="checkbox"
                    checked={audioSettings.reminder_sounds}
                    onChange={(e) => setAudioSettings(prev => ({ ...prev, reminder_sounds: e.target.checked }))}
                    className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Play reminder sounds</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Custom Alarm Upload</h3>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioSettings(prev => ({ ...prev, custom_alarm_file: e.target.files?.[0] || null }))}
                  className="input-dreamy w-full"
                />
                <input
                  type="text"
                  placeholder="Alarm name"
                  value={audioSettings.custom_alarm_name}
                  onChange={(e) => setAudioSettings(prev => ({ ...prev, custom_alarm_name: e.target.value }))}
                  className="input-dreamy w-full"
                />
                <p className="text-xs text-gray-500">
                  Upload your own alarm sound (MP3, WAV, etc.)
                </p>
                {audioSettings.custom_alarm_file && (
                  <button
                    onClick={uploadCustomAlarm}
                    disabled={loading}
                    className="btn-dreamy-primary flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {loading ? 'Uploading...' : 'Upload Alarm'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
        
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/80 rounded-xl space-y-3">
                <h4 className="font-medium text-blue-900">Browser Notifications</h4>
                <p className="text-sm text-blue-700">
                  Get notified about upcoming tasks and reminders
                </p>
                {isIncognito && (
                  <p className="text-sm text-red-600">
                    Notifications are disabled in incognito mode.
                  </p>
                )}
                <button onClick={requestPermission} className="btn-dreamy text-sm w-full">
                  Enable Notifications
                </button>
                <button
                  onClick={() => {
                    testAlarm()
                    setTimeout(() => setShowTestAlarm(true), 5000)
                  }}
                  className="btn-dreamy-primary text-sm w-full"
                >
                  Test Alarm
                </button>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    name="notifyTasks"
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Task reminders</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    name="notifyAffirmations"
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Daily affirmation reminders</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    name="notifyProgress"
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Progress tracking reminders</span>
                </label>
              </div>
            </div>
          </div>
        )
        
      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800">Appearance Settings</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <h4 className="font-medium text-gray-800 mb-2">Theme</h4>
                <p className="text-sm text-gray-600 mb-3">
                  ZenzaLife uses a dreamy, cloud-like aesthetic designed for tranquility
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={
                      theme === 'light'
                        ? 'btn-dreamy-primary text-sm'
                        : 'btn-dreamy text-sm'
                    }
                  >
                    Light {theme === 'light' && '(Current)'}
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={
                      theme === 'dark'
                        ? 'btn-dreamy-primary text-sm'
                        : 'btn-dreamy text-sm'
                    }
                  >
                    Dark {theme === 'dark' && '(Current)'}
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    name="showEntranceAnimation"
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Show entrance animation</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    name="smoothTransitions"
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Enable smooth transitions</span>
                </label>
              </div>
            </div>
          </div>
        )
        
      case 'privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800">Privacy & Data</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50/80 rounded-xl">
                <h4 className="font-medium text-green-900 mb-2">Data Export</h4>
                <p className="text-sm text-green-700 mb-3">
                  Download all your ZenzaLife data in JSON format
                </p>
                <button
                  onClick={exportData}
                  className="btn-dreamy flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export My Data
                </button>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    name="shareProgress"
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Allow family to see my progress</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    name="shareAffirmations"
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Share affirmations with family</span>
                </label>
              </div>
            </div>
          </div>
        )
        
      case 'help':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800">Help & Support</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/80 rounded-xl">
                <h4 className="font-medium text-blue-900 mb-2">About ZenzaLife</h4>
                <p className="text-sm text-blue-700 mb-3">
                  A comprehensive family life management platform designed to help you become 1% better every day.
                </p>
                <p className="text-xs text-blue-600">
                  Version 1.0.0 - Built with love for elevated living
                </p>
              </div>
              
              <div className="grid gap-3">
                <button className="p-3 bg-white/50 rounded-lg text-left hover:bg-white/70 transition-colors">
                  <h4 className="font-medium text-gray-800">Getting Started Guide</h4>
                  <p className="text-sm text-gray-600">Learn how to set up your schedule and family</p>
                </button>
                
                <button className="p-3 bg-white/50 rounded-lg text-left hover:bg-white/70 transition-colors">
                  <h4 className="font-medium text-gray-800">Keyboard Shortcuts</h4>
                  <p className="text-sm text-gray-600">Speed up your workflow with shortcuts</p>
                </button>
                
                <button className="p-3 bg-white/50 rounded-lg text-left hover:bg-white/70 transition-colors">
                  <h4 className="font-medium text-gray-800">Contact Support</h4>
                  <p className="text-sm text-gray-600">Get help with any issues or questions</p>
                </button>
              </div>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
          <Settings className="w-8 h-8 text-gray-400" />
          Settings
        </h1>
        <p className="text-gray-600/80 font-light mt-1">
          Customize your ZenzaLife experience
        </p>
      </div>

      {/* Tabs */}
      <div className="card-floating p-1">
        <div className="flex flex-wrap gap-1">
          {tabConfig.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-white shadow-sm' 
                    : 'hover:bg-white/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${
                  isActive ? 'text-gray-800' : 'text-gray-600'
                }`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="card-floating p-6">
        {renderTabContent()}
      </div>
      {showTestAlarm && (
        <AlarmModal
          eventTitle="Test Alarm"
          eventTime={new Date().toLocaleTimeString()}
          soundUrl={audioSettings.default_alarm}
          onDismiss={() => setShowTestAlarm(false)}
          onSnooze={() => {
            setShowTestAlarm(false)
            setTimeout(() => {
              setShowTestAlarm(true)
            }, 300000)
          }}
        />
      )}
    </div>
  )
}