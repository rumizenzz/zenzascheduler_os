import React, { useEffect, useMemo, useState } from 'react'
import Tree from 'react-d3-tree'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, User, FamilyGroup } from '@/lib/supabase'

export function FamilyTree() {
  const { user, profile } = useAuth()
  const [familyMembers, setFamilyMembers] = useState<User[]>([])
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && profile) {
      loadData()
    }
  }, [user, profile])

  const loadData = async () => {
    if (!profile?.family_id) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data: family, error: familyError } = await supabase
        .from('family_groups')
        .select('*')
        .eq('id', profile.family_id)
        .maybeSingle()

      if (familyError) throw familyError
      setFamilyGroup(family)

      const { data: members, error: membersError } = await supabase
        .from('users')
        .select('*')
        .eq('family_id', profile.family_id)

      if (membersError) throw membersError
      setFamilyMembers(members || [])
    } catch (error) {
      console.error('Failed to load family tree data', error)
    } finally {
      setLoading(false)
    }
  }

  const treeData = useMemo(() => {
    if (!familyGroup) return []
    const parents = familyMembers.filter((m) =>
      ['dad', 'husband', 'mom', 'wife'].includes(
        m.relationship_role?.toLowerCase() || ''
      )
    )
    const children = familyMembers.filter((m) =>
      ['son', 'daughter'].includes(m.relationship_role?.toLowerCase() || '')
    )

    const rootName =
      parents.map((p) => p.display_name).join(' & ') ||
      `${familyGroup.family_name} Family`

    return [
      {
        name: rootName,
        children: children.map((c) => ({ name: c.display_name })),
      },
    ]
  }, [familyGroup, familyMembers])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (!familyGroup) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-600">Join or create a family to see the tree.</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[600px] bg-white rounded-xl shadow-inner p-4 overflow-auto">
      <Tree
        data={treeData}
        orientation="vertical"
        zoomable
        separation={{ siblings: 1, nonSiblings: 2 }}
        translate={{ x: 300, y: 50 }}
      />
    </div>
  )
}
