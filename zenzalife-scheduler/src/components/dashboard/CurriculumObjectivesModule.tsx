import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Curriculum, CurriculumObjective } from '@/lib/supabase'
import dayjs from 'dayjs'
import { Target, Plus, Trash2, Check, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function CurriculumObjectivesModule() {
  const { user } = useAuth()
  const [curriculums, setCurriculums] = useState<Curriculum[]>([])
  const [selected, setSelected] = useState<Curriculum | null>(null)
  const [objectives, setObjectives] = useState<CurriculumObjective[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCurriculum, setShowAddCurriculum] = useState(false)
  const [curriculumTitle, setCurriculumTitle] = useState('')
  const [showAddObjective, setShowAddObjective] = useState(false)
  const [objectiveContent, setObjectiveContent] = useState('')

  useEffect(() => {
    if (user) {
      void initialize()
    }
  }, [user])

  useEffect(() => {
    if (user && selected) {
      void loadObjectives(selected.id)
    }
  }, [user, selected])

  const initialize = async () => {
    try {
      await supabase.functions.invoke('ensure-curriculum-schema')
    } catch (err) {
      console.error('Failed to ensure curriculum schema', err)
    }
    await loadCurriculums()
  }

  const loadCurriculums = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('curriculums')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) {
      toast.error('Failed to load curriculums: ' + error.message)
    } else {
      setCurriculums(data || [])
    }
  }

  const loadObjectives = async (curriculumId: string) => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('curriculum_objectives')
      .select('*')
      .eq('user_id', user.id)
      .eq('curriculum_id', curriculumId)
      .order('created_at', { ascending: false })
    if (error) {
      toast.error('Failed to load objectives: ' + error.message)
    } else {
      setObjectives(data || [])
    }
    setLoading(false)
  }

  const saveCurriculum = async () => {
    if (!user || !curriculumTitle.trim()) return
    const { error } = await supabase.from('curriculums').insert({
      user_id: user.id,
      title: curriculumTitle.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (error) {
      toast.error('Failed to save curriculum: ' + error.message)
    } else {
      setCurriculumTitle('')
      setShowAddCurriculum(false)
      await loadCurriculums()
      toast.success('Curriculum added')
    }
  }

  const deleteCurriculum = async (id: string) => {
    if (!user) return
    const { error } = await supabase
      .from('curriculums')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) {
      toast.error('Failed to delete curriculum: ' + error.message)
    } else {
      if (selected?.id === id) {
        setSelected(null)
        setObjectives([])
      }
      await loadCurriculums()
      toast.success('Curriculum deleted')
    }
  }

  const saveObjective = async () => {
    if (!user || !selected || !objectiveContent.trim()) return
    const { error } = await supabase.from('curriculum_objectives').insert({
      user_id: user.id,
      curriculum_id: selected.id,
      content: objectiveContent.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (error) {
      toast.error('Failed to save objective: ' + error.message)
    } else {
      setObjectiveContent('')
      setShowAddObjective(false)
      await loadObjectives(selected.id)
      toast.success('Objective added')
    }
  }

  const toggleObjective = async (obj: CurriculumObjective) => {
    if (!user || !selected) return
    const { error } = await supabase
      .from('curriculum_objectives')
      .update({ completed: !obj.completed, updated_at: new Date().toISOString() })
      .eq('id', obj.id)
      .eq('user_id', user.id)
    if (error) {
      toast.error('Failed to update objective: ' + error.message)
    } else {
      await loadObjectives(selected.id)
    }
  }

  const deleteObjective = async (id: string) => {
    if (!user || !selected) return
    const { error } = await supabase
      .from('curriculum_objectives')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) {
      toast.error('Failed to delete objective: ' + error.message)
    } else {
      await loadObjectives(selected.id)
      toast.success('Objective deleted')
    }
  }

  if (!selected) {
    return (
      <div className="space-y-6 pb-24">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-light text-purple-200 flex items-center gap-3">
            <Target className="w-8 h-8" />
            Objectives
          </h1>
          <button
            onClick={() => setShowAddCurriculum(true)}
            className="btn-dreamy-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Curriculum
          </button>
        </div>

        {showAddCurriculum && (
          <div className="card-floating bg-purple-900/80 text-white p-4 space-y-4">
            <input
              className="input-dreamy w-full"
              value={curriculumTitle}
              onChange={e => setCurriculumTitle(e.target.value)}
              placeholder="Curriculum title"
            />
            <div className="flex gap-2 justify-end">
              <button className="btn-secondary" onClick={() => setShowAddCurriculum(false)}>
                Cancel
              </button>
              <button className="btn-dreamy-primary" onClick={saveCurriculum}>
                Save
              </button>
            </div>
          </div>
        )}

        {curriculums.length > 0 ? (
          <div className="space-y-4">
            {curriculums.map(c => (
              <div
                key={c.id}
                className="bg-gradient-to-br from-purple-800 via-purple-700 to-pink-600 p-4 rounded-lg text-white flex justify-between items-center"
              >
                <button className="text-left flex-1" onClick={() => setSelected(c)}>
                  {c.title}
                </button>
                <button onClick={() => deleteCurriculum(c.id)} className="hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">No curriculums yet</div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <button onClick={() => setSelected(null)} className="btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-3xl font-light text-purple-200 flex items-center gap-3">
          <Target className="w-8 h-8" />
          {selected.title}
        </h1>
        <button
          onClick={() => setShowAddObjective(true)}
          className="btn-dreamy-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Objective
        </button>
      </div>

      {showAddObjective && (
        <div className="card-floating bg-purple-900/80 text-white p-4 space-y-4">
          <textarea
            className="textarea-dreamy w-full"
            rows={3}
            value={objectiveContent}
            onChange={e => setObjectiveContent(e.target.value)}
            placeholder="What objective do you want to achieve?"
          />
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setShowAddObjective(false)}>
              Cancel
            </button>
            <button className="btn-dreamy-primary" onClick={saveObjective}>
              Save
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      ) : objectives.length > 0 ? (
        <div className="space-y-4">
          {objectives.map(o => (
            <div
              key={o.id}
              className="bg-gradient-to-br from-purple-800 via-purple-700 to-pink-600 p-4 rounded-lg text-white"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs opacity-80">
                  {dayjs(o.created_at).format('YYYY-MM-DD hh:mm:ss A')}
                </span>
                <div className="flex items-center gap-2 text-sm">
                  <button
                    className={`flex items-center gap-1 ${o.completed ? 'text-green-400' : 'hover:text-green-200'}`}
                    onClick={() => toggleObjective(o)}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    className="flex items-center gap-1 hover:text-purple-200"
                    onClick={() => deleteObjective(o.id)}
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
              <div className={`whitespace-pre-wrap ${o.completed ? 'line-through opacity-70' : ''}`}>{o.content}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">No objectives yet</div>
      )}
    </div>
  )
}

