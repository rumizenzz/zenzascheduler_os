import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, WorldClockZone } from '@/lib/supabase'

const zoneAlias: Record<string, string> = { 'Asia/Cebu': 'Asia/Manila' }

export function WorldClockOverlay() {
  const { user } = useAuth()
  const [worldZones, setWorldZones] = useState<WorldClockZone[]>([])
  const [now, setNow] = useState(new Date())
  const [dragging, setDragging] = useState<
    { id: string; offsetX: number; offsetY: number } | null
  >(null)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    visible: boolean
    zoneId: string | null
  }>({ x: 0, y: 0, visible: false, zoneId: null })

  const loadZones = async () => {
    if (!user) return
    const { data } = await supabase
      .from('world_clock_zones')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at')
    setWorldZones(data || [])
  }

  useEffect(() => {
    void loadZones()
  }, [user])

  useEffect(() => {
    const channel = user
      ? supabase
          .channel('world_clock_zones_overlay')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'world_clock_zones',
              filter: `user_id=eq.${user.id}`
            },
            () => void loadZones()
          )
          .subscribe()
      : null
    return () => {
      if (channel) void supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const startDrag = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    e.preventDefault()
    const zone = worldZones.find(z => z.id === id)
    if (!zone) return
    setDragging({
      id,
      offsetX: e.clientX - (zone.pos_x || 0),
      offsetY: e.clientY - (zone.pos_y || 0)
    })
  }

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragging) return
      const newX = e.clientX - dragging.offsetX
      const newY = e.clientY - dragging.offsetY
      setWorldZones(zones =>
        zones.map(z =>
          z.id === dragging.id ? { ...z, pos_x: newX, pos_y: newY } : z
        )
      )
    }
    const handleUp = async () => {
      if (!dragging) return
      const zone = worldZones.find(z => z.id === dragging.id)
      setDragging(null)
      if (!zone) return
      await supabase
        .from('world_clock_zones')
        .update({
          pos_x: zone.pos_x,
          pos_y: zone.pos_y,
          updated_at: new Date().toISOString()
        })
        .eq('id', zone.id)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [dragging, worldZones])

  const handleContextMenu = (e: React.MouseEvent, zoneId?: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true, zoneId: zoneId || null })
  }

  const closeContextMenu = () =>
    setContextMenu(cm => ({ ...cm, visible: false, zoneId: null }))

  useEffect(() => {
    if (!contextMenu.visible) return
    const hide = () => closeContextMenu()
    window.addEventListener('click', hide)
    return () => window.removeEventListener('click', hide)
  }, [contextMenu.visible])

  const removeZone = async (id: string) => {
    await supabase.from('world_clock_zones').delete().eq('id', id)
    setWorldZones(z => z.filter(zone => zone.id !== id))
  }

  const formatZoneTime = (zone: string) =>
    now.toLocaleTimeString([], {
      timeZone: zoneAlias[zone] || zone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

  return (
    <>
      {worldZones
        .filter(z => z.show_widget)
        .map(zone =>
          createPortal(
            <div
              key={zone.id}
              className="fixed z-[1000] cursor-move bg-black/50 text-white text-xs px-2 py-1 rounded"
              style={{ top: zone.pos_y, left: zone.pos_x }}
              onMouseDown={e => startDrag(e, zone.id)}
              onContextMenu={e => handleContextMenu(e, zone.id)}
            >
              {formatZoneTime(zone.zone)} {zone.zone}
            </div>,
            document.body
          )
        )}
      {contextMenu.visible &&
        createPortal(
          <div
            className="fixed z-[1000] p-4 rounded-xl harold-sky bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-900 text-purple-100 shadow-lg"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4">World Clock Menu</div>
            {contextMenu.zoneId && (
              <button
                onClick={() => {
                  void removeZone(contextMenu.zoneId as string)
                  closeContextMenu()
                }}
                className="btn-dreamy-secondary px-3 py-1 mt-4 w-full text-sm"
              >
                Remove Time Zone
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  )
}

export default WorldClockOverlay
