import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Ancestor } from '@/lib/supabase'

function parseGeneration(relation?: string): number {
  if (!relation) return 1
  const lower = relation.toLowerCase()
  const greatCount = (lower.match(/great/g) || []).length
  if (lower.includes('grand')) {
    return greatCount + 2
  }
  return 1
}

export function FamilyTreeMindMap() {
  const { profile } = useAuth()
  const [ancestors, setAncestors] = useState<Ancestor[]>([])

  useEffect(() => {
    const load = async () => {
      if (!profile?.family_id) return
      const { data, error } = await supabase
        .from('ancestors')
        .select('*')
        .eq('family_id', profile.family_id)
      if (!error && data) setAncestors(data)
    }
    load()
  }, [profile])

  const groups: Record<number, Ancestor[]> = {}
  ancestors.forEach(a => {
    const gen = parseGeneration(a.relation)
    if (!groups[gen]) groups[gen] = []
    groups[gen].push(a)
  })

  const generations = Object.keys(groups)
    .map(n => parseInt(n))
    .sort((a, b) => a - b)

  const radiusStep = 120

  return (
    <div className="relative flex justify-center items-center my-8 h-[500px]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow px-4 py-2">
        {profile?.display_name || 'You'}
      </div>
      {generations.map(gen => {
        const ring = groups[gen]
        const r = gen * radiusStep
        const angleStep = (2 * Math.PI) / ring.length
        return ring.map((ancestor, i) => {
          const angle = i * angleStep
          const x = r * Math.cos(angle)
          const y = r * Math.sin(angle)
          return (
            <div
              key={ancestor.id}
              className="absolute bg-white rounded-lg shadow px-3 py-1 text-sm"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {ancestor.name}
            </div>
          )
        })
      })}
    </div>
  )
}
