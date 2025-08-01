import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, FamilyGroup, User } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Users, Plus, Crown, Baby, GraduationCap, Heart, Target, ChevronDown } from 'lucide-react'
import { TabPermissionsModal, TabPermissions } from './TabPermissionsModal'

export function FamilyModule() {
  const { user, profile } = useAuth()
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup | null>(null)
  const [familyMembers, setFamilyMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateFamily, setShowCreateFamily] = useState(false)
  const [showJoinFamily, setShowJoinFamily] = useState(false)
  const [selectedMember, setSelectedMember] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<Record<string, TabPermissions>>({})
  const [showPermissions, setShowPermissions] = useState(false)

  useEffect(() => {
    if (user && profile) {
      loadFamilyData()
    }
  }, [user, profile])

  const loadFamilyData = async () => {
    if (!profile?.family_id) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      // Load family group
      const { data: family, error: familyError } = await supabase
        .from('family_groups')
        .select('*')
        .eq('id', profile.family_id)
        .maybeSingle()
      
      if (familyError) throw familyError
      setFamilyGroup(family)
      
      // Load family members
      const { data: members, error: membersError } = await supabase
        .from('users')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('created_at', { ascending: true })
      
      if (membersError) throw membersError
      setFamilyMembers(members || [])
    } catch (error: any) {
      toast.error('Failed to load family data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const createFamily = async (familyName: string) => {
    if (!user) return
    
    try {
      // Create family group
      const { data: family, error: familyError } = await supabase
        .from('family_groups')
        .insert({
          family_name: familyName,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (familyError) throw familyError
      
      // Update user's family_id
      const { error: updateError } = await supabase
        .from('users')
        .update({ family_id: family.id, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      
      if (updateError) throw updateError
      
      toast.success('Family created successfully!')
      await loadFamilyData()
      setShowCreateFamily(false)
    } catch (error: any) {
      toast.error('Failed to create family: ' + error.message)
    }
  }

  const joinFamily = async (familyId: string) => {
    if (!user) return
    
    try {
      // Check if family exists
      const { data: family, error: familyError } = await supabase
        .from('family_groups')
        .select('*')
        .eq('id', familyId)
        .maybeSingle()
      
      if (familyError) throw familyError
      
      if (!family) {
        toast.error('Family not found')
        return
      }
      
      // Update user's family_id
      const { error: updateError } = await supabase
        .from('users')
        .update({ family_id: familyId, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      
      if (updateError) throw updateError
      
      toast.success(`Joined ${family.family_name} family!`)
      await loadFamilyData()
      setShowJoinFamily(false)
    } catch (error: any) {
      toast.error('Failed to join family: ' + error.message)
    }
  }

  const handleSavePermissions = (perms: TabPermissions) => {
    if (selectedMember) {
      setPermissions(prev => ({ ...prev, [selectedMember.id]: perms }))
    }
    setShowPermissions(false)
  }

  const updateFamilyMilestone = async (milestone: string) => {
    if (!familyGroup) return
    
    try {
      const currentMilestones = (familyGroup.milestones as string[]) || []
      const updatedMilestones = [...currentMilestones, milestone]
      
      const { error } = await supabase
        .from('family_groups')
        .update({ 
          milestones: updatedMilestones,
          updated_at: new Date().toISOString() 
        })
        .eq('id', familyGroup.id)
      
      if (error) throw error
      
      toast.success('Milestone added!')
      await loadFamilyData()
    } catch (error: any) {
      toast.error('Failed to add milestone: ' + error.message)
    }
  }

  const getRoleIcon = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'mom':
      case 'wife':
        return <Heart className="w-5 h-5 text-pink-500" />
      case 'dad':
      case 'husband':
        return <Crown className="w-5 h-5 text-blue-500" />
      case 'son':
      case 'daughter':
        return <Baby className="w-5 h-5 text-yellow-500" />
      default:
        return <Users className="w-5 h-5 text-gray-500" />
    }
  }

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'mom':
      case 'wife':
        return 'bg-pink-100 text-pink-700'
      case 'dad':
      case 'husband':
        return 'bg-blue-100 text-blue-700'
      case 'son':
      case 'daughter':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (!familyGroup) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-light text-gray-800 flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-purple-400" />
            Family Management
          </h1>
          <p className="text-gray-600/80 font-light mb-8">
            Connect with your family to share schedules, goals, and growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="card-floating p-8 text-center">
            <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-3">Create New Family</h3>
            <p className="text-gray-600 mb-6">Start a new family group and invite others to join</p>
            <button
              onClick={() => setShowCreateFamily(true)}
              className="btn-dreamy-primary"
            >
              Create Family
            </button>
          </div>

          <div className="card-floating p-8 text-center">
            <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-3">Join Existing Family</h3>
            <p className="text-gray-600 mb-6">Enter a family ID to join an existing family group</p>
            <button
              onClick={() => setShowJoinFamily(true)}
              className="btn-dreamy"
            >
              Join Family
            </button>
          </div>
        </div>

        {/* Create Family Modal */}
        {showCreateFamily && (
          <CreateFamilyModal
            isOpen={showCreateFamily}
            onClose={() => setShowCreateFamily(false)}
            onCreate={createFamily}
          />
        )}

        {/* Join Family Modal */}
        {showJoinFamily && (
          <JoinFamilyModal
            isOpen={showJoinFamily}
            onClose={() => setShowJoinFamily(false)}
            onJoin={joinFamily}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" />
            {familyGroup.family_name} Family
          </h1>
          <p className="text-gray-600/80 font-light mt-1">
            Growing together, 1% better every day
          </p>
        </div>
        
        <div className="text-sm text-gray-600">
          Family ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{familyGroup.id}</span>
        </div>
      </div>

      {/* Family Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="card-floating p-6 text-center">
          <div className="text-3xl font-light text-purple-500 mb-2">
            {familyMembers.length}
          </div>
          <div className="text-sm text-gray-600">Family Members</div>
        </div>
        
        <div className="card-floating p-6 text-center">
          <div className="text-3xl font-light text-blue-500 mb-2">
            {familyGroup.current_children || 0}
          </div>
          <div className="text-sm text-gray-600">Children</div>
        </div>
        
        <div className="card-floating p-6 text-center">
          <div className="text-3xl font-light text-green-500 mb-2">
            {(familyGroup.milestones as string[])?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Milestones</div>
        </div>
        
        <div className="card-floating p-6 text-center">
          <div className="text-3xl font-light text-orange-500 mb-2">
            {familyGroup.planned_children || 0}
          </div>
          <div className="text-sm text-gray-600">Planned Children</div>
        </div>
      </div>

      {/* Family Members */}
      <div className="card-floating p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Family Members</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyMembers.map((member) => (
            <div key={member.id} className="p-4 bg-gray-50/80 rounded-xl relative">
              <button
                onClick={() => {
                  setSelectedMember(member)
                  setShowPermissions(true)
                }}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                aria-label="Manage tab permissions"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
                  {getRoleIcon(member.relationship_role)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{member.display_name}</h4>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getRoleColor(member.relationship_role)}`}>
                    {member.relationship_role || 'Member'}
                  </span>
                </div>
              </div>
              
              {member.growth_identity && (
                <p className="text-sm text-gray-600 italic">
                  "{member.growth_identity}"
                </p>
              )}
              
              {member.age && (
                <p className="text-xs text-gray-500 mt-2">Age: {member.age}</p>
              )}
              {permissions[member.id] && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Allowed Tabs:</p>
                  <ul className="text-xs text-gray-700 flex flex-wrap gap-1 mt-1">
                    {Object.entries(permissions[member.id])
                      .filter(([, allowed]) => allowed)
                      .map(([tab]) => (
                        <li key={tab} className="px-2 py-1 bg-white/60 rounded">
                          {tab}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Family Milestones */}
      <div className="card-floating p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Family Milestones</h3>
          <button
            onClick={() => {
              const milestone = prompt('Enter a new family milestone:')
              if (milestone) updateFamilyMilestone(milestone)
            }}
            className="btn-dreamy flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Milestone
          </button>
        </div>
        
        {(familyGroup.milestones as string[])?.length > 0 ? (
          <div className="space-y-3">
            {(familyGroup.milestones as string[]).map((milestone, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50/80 rounded-lg">
                <Target className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-800">{milestone}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No milestones yet. Add your first family milestone!</p>
        )}
      </div>
      {selectedMember && showPermissions && (
        <TabPermissionsModal
          member={selectedMember}
          current={permissions[selectedMember.id]}
          onSave={handleSavePermissions}
          onClose={() => setShowPermissions(false)}
        />
      )}
    </div>
  )
}

// Create Family Modal
interface CreateFamilyModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (familyName: string) => void
}

function CreateFamilyModal({ isOpen, onClose, onCreate }: CreateFamilyModalProps) {
  const [familyName, setFamilyName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!familyName.trim()) {
      toast.error('Please enter a family name')
      return
    }
    onCreate(familyName.trim())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-light text-gray-800 mb-6">Create New Family</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Family Name</label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="input-dreamy w-full"
                placeholder="The Smith Family"
                required
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-dreamy">
                Cancel
              </button>
              <button type="submit" className="btn-dreamy-primary">
                Create Family
              </button>
            </div>
          </form>
      </div>
    </div>

    </div>
  )
}

// Join Family Modal
interface JoinFamilyModalProps {
  isOpen: boolean
  onClose: () => void
  onJoin: (familyId: string) => void
}

function JoinFamilyModal({ isOpen, onClose, onJoin }: JoinFamilyModalProps) {
  const [familyId, setFamilyId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!familyId.trim()) {
      toast.error('Please enter a family ID')
      return
    }
    onJoin(familyId.trim())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-light text-gray-800 mb-6">Join Family</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Family ID</label>
              <input
                type="text"
                value={familyId}
                onChange={(e) => setFamilyId(e.target.value)}
                className="input-dreamy w-full font-mono"
                placeholder="Enter family ID"
                required
              />
              <p className="text-xs text-gray-500">
                Ask a family member for the family ID to join their group
              </p>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-dreamy">
                Cancel
              </button>
              <button type="submit" className="btn-dreamy-primary">
                Join Family
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}