import React, { useEffect, useState } from 'react'
import { supabase, Person, Relationship } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface TreeNode {
  person: Person
  parents: TreeNode[]
  children: TreeNode[]
}

function buildTree(rootPerson: Person, allPeople: Person[], relations: Relationship[]): TreeNode {
  const node: TreeNode = { person: rootPerson, parents: [], children: [] }
  const parentRelations = relations.filter(r => r.related_person_id === rootPerson.id && r.relationship_type === 'parent')
  parentRelations.forEach(rel => {
    const parent = allPeople.find(p => p.id === rel.person_id)
    if (parent) node.parents.push(buildTree(parent, allPeople, relations))
  })
  const childRelations = relations.filter(r => r.person_id === rootPerson.id && r.relationship_type === 'parent')
  childRelations.forEach(rel => {
    const child = allPeople.find(p => p.id === rel.related_person_id)
    if (child) node.children.push(buildTree(child, allPeople, relations))
  })
  return node
}

function Tree({ node }: { node: TreeNode }) {
  return (
    <div className="text-center">
      <div className="p-2 bg-white rounded shadow inline-block min-w-[120px]">
        {node.person.first_name} {node.person.last_name}
      </div>
      {node.parents.length > 0 && (
        <div className="flex justify-center space-x-4 mt-4">
          {node.parents.map(p => (
            <Tree key={p.person.id} node={p} />
          ))}
        </div>
      )}
      {node.children.length > 0 && (
        <div className="flex justify-center space-x-4 mt-4">
          {node.children.map(c => (
            <Tree key={c.person.id} node={c} />
          ))}
        </div>
      )}
    </div>
  )
}

export function FamilyTreePedigree() {
  const { profile } = useAuth()
  const [people, setPeople] = useState<Person[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [root, setRoot] = useState<TreeNode | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!profile?.family_id) return
      const { data: peopleData } = await supabase
        .from('people')
        .select('*')
        .eq('family_id', profile.family_id)
      const { data: relData } = await supabase
        .from('relationships')
        .select('*')
        .eq('family_id', profile.family_id)
      if (peopleData && relData) {
        setPeople(peopleData)
        setRelationships(relData)
        const self = peopleData[0]
        if (self) setRoot(buildTree(self, peopleData, relData))
      }
    }
    load()
  }, [profile])

  if (!root) {
    return <p className="text-gray-600">No family data yet.</p>
  }

  return (
    <div className="overflow-auto p-4">
      <Tree node={root} />
    </div>
  )
}
