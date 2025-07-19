import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'

interface JobIncomeLog {
  id: string
  user_id: string
  job_id: string
  date: string
  hours_worked?: number
  amount_earned: number
  notes?: string
  created_at: string
  updated_at: string
}

interface BusinessIncomeLog {
  id: string
  user_id: string
  business_id: string
  date: string
  amount_earned: number
  expenses?: number
  notes?: string
  created_at: string
  updated_at: string
}

export function IncomeTracker() {
  const { user } = useAuth()
  const [jobLogs, setJobLogs] = useState<JobIncomeLog[]>([])
  const [businessLogs, setBusinessLogs] = useState<BusinessIncomeLog[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadIncomeData()
    }
  }, [user])

  const loadIncomeData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data: jobData, error: jobError } = await supabase
        .from('job_income_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (jobError) throw jobError
      setJobLogs(jobData || [])

      const { data: businessData, error: businessError } = await supabase
        .from('business_income_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (businessError) throw businessError
      setBusinessLogs(businessData || [])

      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, company, title')
        .eq('user_id', user.id)
      setJobs(jobsData || [])

      const { data: businessesData } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('user_id', user.id)
      setBusinesses(businessesData || [])
    } catch (error: any) {
      toast.error('Failed to load income logs: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getJobName = (id: string) => {
    const job = jobs.find((j) => j.id === id)
    if (!job) return 'Job'
    return `${job.company} - ${job.title}`
  }

  const getBusinessName = (id: string) => {
    const biz = businesses.find((b) => b.id === id)
    return biz?.name || 'Business'
  }

  const incomes = [
    ...jobLogs.map((log) => ({
      id: log.id,
      type: 'job' as const,
      date: log.date,
      amount: log.amount_earned,
      name: getJobName(log.job_id),
      notes: log.notes,
    })),
    ...businessLogs.map((log) => ({
      id: log.id,
      type: 'business' as const,
      date: log.date,
      amount: log.amount_earned,
      name: getBusinessName(log.business_id),
      notes: log.notes,
    })),
  ].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      ) : incomes.length > 0 ? (
        incomes.map((income) => (
          <div key={income.id} className="p-4 bg-gray-50/80 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-800">{income.name}</h4>
                <p className="text-sm text-gray-600">
                  {dayjs(income.date).format('MMM D, YYYY')}
                </p>
              </div>
              <p className="text-lg font-medium text-emerald-600">
                ${income.amount.toFixed(2)}
              </p>
            </div>
            {income.notes && (
              <p className="text-sm text-gray-600 mt-2">{income.notes}</p>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-center py-8">No income logged yet.</p>
      )}
    </div>
  )
}
