import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Ancestor } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { TreePine, Plus, Check } from 'lucide-react'

export function AncestryModule() {
  const { profile } = useAuth()
  const [ancestors, setAncestors] = useState<Ancestor[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (profile?.family_id) {
      loadAncestors()
    } else {
      setLoading(false)
    }
  }, [profile])

  const loadAncestors = async () => {
    if (!profile?.family_id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ancestors')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('name', { ascending: true })
      if (error) throw error
      setAncestors(data || [])
    } catch (error: any) {
      toast.error('Failed to load ancestors: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addAncestor = async (
    name: string,
    relation: string,
    birthYear?: number,
    deathYear?: number
  ) => {
    if (!profile?.family_id) return
    try {
      const { data, error } = await supabase
        .from('ancestors')
        .insert({
          family_id: profile.family_id,
          name,
          relation,
          birth_year: birthYear,
          death_year: deathYear,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      if (error) throw error
      setAncestors(prev => [...prev, data])
      toast.success('Ancestor added!')
      setShowAddModal(false)
    } catch (error: any) {
      toast.error('Failed to add ancestor: ' + error.message)
    }
  }

  const toggleBaptized = async (ancestor: Ancestor) => {
    try {
      const { data, error } = await supabase
        .from('ancestors')
        .update({
          baptized: !ancestor.baptized,
          updated_at: new Date().toISOString()
        })
        .eq('id', ancestor.id)
        .select()
        .single()
      if (error) throw error
      setAncestors(prev => prev.map(a => (a.id === ancestor.id ? data : a)))
    } catch (error: any) {
      toast.error('Failed to update ancestor: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-light text-gray-800 flex items-center gap-3">
          <TreePine className="w-6 h-6 text-green-600" />
          Family Ancestry
        </h2>
        <button onClick={() => setShowAddModal(true)} className="btn-dreamy flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Ancestor
        </button>
      </div>

      {ancestors.length > 0 ? (
        <div className="space-y-3">
          {ancestors.map(ancestor => (
            <div key={ancestor.id} className="flex items-center gap-4 p-3 bg-white/70 rounded-xl">
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {ancestor.name}{' '}
                  {ancestor.relation && (
                    <span className="text-sm text-gray-500">({ancestor.relation})</span>
                  )}
                </p>
                {(ancestor.birth_year || ancestor.death_year) && (
                  <p className="text-xs text-gray-500">
                    {ancestor.birth_year
                      ? `${ancestor.birth_year} - ${
                          ancestor.death_year !== undefined && ancestor.death_year !== null
                            ? ancestor.death_year
                            : 'Present'
                        }`
                      : ancestor.death_year !== undefined && ancestor.death_year !== null
                      ? `Died ${ancestor.death_year}`
                      : null}
                  </p>
                )}
              </div>
              <button
                onClick={() => toggleBaptized(ancestor)}
                className={`text-sm px-2 py-1 rounded ${
                  ancestor.baptized ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {ancestor.baptized ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-4 h-4" /> Baptized
                  </span>
                ) : (
                  'Mark Baptized'
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No ancestors added yet.</p>
      )}

      {showAddModal && (
        <AddAncestorModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={addAncestor}
        />
      )}
    </div>
  )
}

interface AddAncestorModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (
    name: string,
    relation: string,
    birthYear?: number,
    deathYear?: number
  ) => void
}

function AddAncestorModal({ isOpen, onClose, onAdd }: AddAncestorModalProps) {
  const [name, setName] = useState('')
  const [relation, setRelation] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [deathYear, setDeathYear] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter a name')
      return
    }
    onAdd(
      name.trim(),
      relation.trim(),
      birthYear ? parseInt(birthYear) : undefined,
      deathYear ? parseInt(deathYear) : undefined
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-light text-gray-800">Add Ancestor</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-dreamy w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Relation</label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="input-dreamy w-full"
                placeholder="great-grandfather"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Birth Year</label>
              <input
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="input-dreamy w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Death Year (optional)</label>
              <input
                type="number"
                value={deathYear}
                onChange={(e) => setDeathYear(e.target.value)}
                className="input-dreamy w-full"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-dreamy">
                Cancel
              </button>
              <button type="submit" className="btn-dreamy-primary">
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

