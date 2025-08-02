import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { BookOpen } from 'lucide-react'

interface Session {
  id: string
  mode: string
  stage: string | null
}

const pdfBase = '/' + encodeURIComponent('Official GED Math PDFs')

const resources = {
  pre: [
    { name: 'GED Study Guide', file: 'GED_Study-Guide_Math.pdf' },
    { name: 'Math Grab Bag', file: 'Math-Grab-Bag.pdf' },
    { name: 'Finishing Strong in Math Workbook', file: 'Finishing-Strong-in-Math-workbook.pdf' }
  ],
  intermediate: [
    { name: 'Higher Level Math Skills', file: 'Higher-Level-Math-Skills.pdf' },
    { name: 'Intro to Higher Level Algebra Skills', file: 'Intro-to-Higher-Level-Algebra-Skills.pdf' }
  ],
  advanced: [
    { name: 'Mastering Math Skills 2', file: 'MASTERING-MATH-SKILLS-2.pdf' }
  ],
  extras: [
    { name: 'Assessment Guide for Educators', file: 'assessment_guide_for_educators_math.pdf' },
    { name: 'Math Online Resources', file: 'Math-Online-Resources.pdf' },
    { name: 'Math Formula Sheet', file: 'math_formula_sheet.pdf' }
  ]
}

export function GEDMathStudyModule() {
  const { user } = useAuth()
  const [session, setSession] = useState<Session | null>(null)
  const [showStart, setShowStart] = useState(false)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data } = await supabase
        .from('ged_math_study_sessions')
        .select('id, mode, stage')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (data) {
        setSession(data as Session)
      } else {
        setShowStart(true)
      }
    }
    load()
  }, [user])

  const startSession = async (mode: string) => {
    if (!user) return
    const { data, error } = await supabase
      .from('ged_math_study_sessions')
      .insert({ user_id: user.id, mode })
      .select('id, mode, stage')
      .single()
    if (!error && data) {
      setSession(data as Session)
      setShowStart(false)
    }
  }

  const chooseStage = async (stage: string) => {
    if (!session) return
    const { data, error } = await supabase
      .from('ged_math_study_sessions')
      .update({ stage })
      .eq('id', session.id)
      .select('id, mode, stage')
      .single()
    if (!error && data) {
      setSession(data as Session)
    }
  }

  const resetSession = async () => {
    if (!session) return
    await supabase.from('ged_math_study_sessions').delete().eq('id', session.id)
    setSession(null)
    setShowStart(true)
  }

  const renderStage = (stage: 'pre' | 'intermediate' | 'advanced') => (
    <div className="space-y-2">
      <h3 className="text-lg font-light capitalize">{stage.replace('-', ' ')} Study</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        {resources[stage].map((r) => (
          <li key={r.file}>
            <a
              href={`${pdfBase}/${r.file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:underline"
            >
              {r.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )

  if (showStart) {
    return (
      <div className="harold-sky p-6 rounded-lg text-purple-100 max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-light text-center">GED Math Study</h2>
        <p className="text-center text-sm">How would you like to begin?</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => startSession('self-assessment')} className="btn-dreamy-primary">
            Self-Assessment
          </button>
          <button onClick={() => startSession('practice-test')} className="btn-dreamy">
            Take Practice Test
          </button>
        </div>
      </div>
    )
  }

  if (!session) return null

  if (!session.stage) {
    return (
      <div className="harold-sky p-6 rounded-lg text-purple-100 max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-light text-center">Select Your Stage</h2>
        <div className="flex flex-col gap-2">
          <button onClick={() => chooseStage('pre')} className="btn-dreamy-primary">
            Pre-GED
          </button>
          <button onClick={() => chooseStage('intermediate')} className="btn-dreamy">
            Intermediate
          </button>
          <button onClick={() => chooseStage('advanced')} className="btn-dreamy">
            Advanced
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="harold-sky p-6 rounded-lg text-purple-100 space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        <h2 className="text-xl font-light">{session.stage.replace('-', ' ')} Resources</h2>
      </div>
      {renderStage(session.stage as 'pre' | 'intermediate' | 'advanced')}
      <div className="space-y-2">
        <h3 className="text-lg font-light">Additional Resources</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          {resources.extras.map((r) => (
            <li key={r.file}>
              <a
                href={`${pdfBase}/${r.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:underline"
              >
                {r.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="pt-4">
        <button onClick={resetSession} className="btn-dreamy text-sm">
          Start Over
        </button>
      </div>
    </div>
  )
}
