import React, { useEffect, useState } from 'react'
import { supabase, type User as Profile } from '@/lib/supabase'
import { lazy, Suspense } from 'react'

const Tree = lazy(() => import('react-d3-tree').then(mod => ({ default: mod.Tree })))

export interface Person {
  id: string
  first_name: string
  last_name?: string
  gender?: string
  birth_date?: string
  death_date?: string
}

export interface Relationship {
  id: string
  person_id: string
  related_person_id: string
  relation_type: string
}

export function FamilyTreeView({ profile }: { profile: Profile | null }) {
  const [people, setPeople] = useState<Person[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])

  useEffect(() => {
    const load = async () => {
      if (!profile?.family_id) return
      const { data: p } = await supabase
        .from('people')
        .select('*')
        .eq('family_id', profile.family_id)
      const { data: r } = await supabase
        .from('relationships')
        .select('*')
        .in('person_id', p?.map(pe => pe.id) || [])
      setPeople(p || [])
      setRelationships(r || [])
    }
    load()
  }, [profile])

  function buildTree(rootId: string) {
    const root = people.find(p => p.id === rootId)
    if (!root) return null
    const children = relationships
      .filter(r => r.person_id === rootId && r.relation_type === 'parent')
      .map(r => buildTree(r.related_person_id))
      .filter(Boolean) as any[]
    return {
      name: root.first_name + (root.last_name ? ' ' + root.last_name : ''),
      children
    }
  }

  const treeData = profile?.id ? buildTree(profile.id) : null

  return (
    <div style={{ width: '100%', height: '600px' }}>
      {treeData && (
        <Suspense fallback={<div>Loading tree...</div>}>
          <Tree data={treeData} translate={{ x: 300, y: 200 }} zoomable zoom={0.7} />
        </Suspense>
      )}
      {people.length === 0 && (
        <p className="text-gray-600">No family tree data. Start adding relatives.</p>
      )}
    </div>
  )
}
