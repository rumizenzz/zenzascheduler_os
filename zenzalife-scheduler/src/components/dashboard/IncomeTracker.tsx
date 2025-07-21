import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'
import { Plus } from 'lucide-react'

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

interface IncomeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    type: 'job' | 'business'
    job_id?: string
    business_id?: string
    date: string
    hours_worked?: number
    amount: number
    expenses?: number
    notes?: string
  }) => void
  jobs: any[]
  businesses: any[]
  saving: boolean
}

function IncomeModal({
  isOpen,
  onClose,
  onSave,
  jobs,
  businesses,
  saving,
}: IncomeModalProps) {
  const [type, setType] = useState<'job' | 'business'>('job')
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [jobId, setJobId] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [hours, setHours] = useState('')
  const [amount, setAmount] = useState('')
  const [expenses, setExpenses] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (jobs.length && !jobId) setJobId(jobs[0].id)
  }, [jobs, jobId])

  useEffect(() => {
    if (businesses.length && !businessId) setBusinessId(businesses[0].id)
  }, [businesses, businessId])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum)) {
      toast.error('Enter a valid amount')
      return
    }

    const payload = {
      type,
      job_id: type === 'job' ? jobId : undefined,
      business_id: type === 'business' ? businessId : undefined,
      date,
      hours_worked: type === 'job' && hours ? parseFloat(hours) : undefined,
      amount: amountNum,
      expenses: type === 'business' && expenses ? parseFloat(expenses) : undefined,
      notes: notes.trim() || undefined,
    }

    onSave(payload)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-800">Add Income</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">×</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="incomeType" className="text-sm font-medium text-gray-700">Type</label>
              <select
                id="incomeType"
                value={type}
                onChange={(e) => setType(e.target.value as 'job' | 'business')}
                className="input-dreamy w-full"
              >
                <option value="job">Job</option>
                <option value="business">Business</option>
              </select>
            </div>

            {type === 'job' ? (
              <div className="space-y-2">
                <label htmlFor="jobId" className="text-sm font-medium text-gray-700">Job</label>
                <select
                  id="jobId"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="input-dreamy w-full"
                >
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.company} - {job.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="businessId" className="text-sm font-medium text-gray-700">Business</label>
                <select
                  id="businessId"
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                  className="input-dreamy w-full"
                >
                  {businesses.map((biz) => (
                    <option key={biz.id} value={biz.id}>
                      {biz.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="incomeDate" className="text-sm font-medium text-gray-700">Date</label>
              <input
                id="incomeDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-dreamy w-full"
              />
            </div>

            {type === 'job' && (
              <div className="space-y-2">
                <label htmlFor="hours" className="text-sm font-medium text-gray-700">Hours Worked</label>
                <input
                  id="hours"
                  type="number"
                  step="0.1"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="input-dreamy w-full"
                  placeholder="8"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount Earned</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-dreamy w-full"
                placeholder="100.00"
                required
              />
            </div>

            {type === 'business' && (
              <div className="space-y-2">
                <label htmlFor="expenses" className="text-sm font-medium text-gray-700">Expenses</label>
                <input
                  id="expenses"
                  type="number"
                  step="0.01"
                  value={expenses}
                  onChange={(e) => setExpenses(e.target.value)}
                  className="input-dreamy w-full"
                  placeholder="0.00"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-dreamy w-full h-20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="btn-dreamy">
                Cancel
              </button>
              <button type="submit" className="btn-dreamy-primary" disabled={saving}>
                Save Income
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
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
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

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

  const saveIncome = async (data: {
    type: 'job' | 'business'
    job_id?: string
    business_id?: string
    date: string
    hours_worked?: number
    amount: number
    expenses?: number
    notes?: string
  }) => {
    if (!user) return
    setSaving(true)
    try {
      if (data.type === 'job') {
        const { error } = await supabase.from('job_income_logs').insert({
          user_id: user.id,
          job_id: data.job_id,
          date: data.date,
          hours_worked: data.hours_worked || null,
          amount_earned: data.amount,
          notes: data.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        if (error) throw error
      } else {
        const { error } = await supabase.from('business_income_logs').insert({
          user_id: user.id,
          business_id: data.business_id,
          date: data.date,
          amount_earned: data.amount,
          expenses: data.expenses || 0,
          notes: data.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        if (error) throw error
      }
      toast.success('Income saved!')
      await loadIncomeData()
      setShowModal(false)
    } catch (error: any) {
      toast.error('Failed to save income: ' + error.message)
    } finally {
      setSaving(false)
    }
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

  const jobIncomeTotal = jobLogs.reduce(
    (sum, log) => sum + (log.amount_earned || 0),
    0
  )
  const businessRevenueTotal = businessLogs.reduce(
    (sum, log) => sum + (log.amount_earned || 0),
    0
  )
  const businessExpenseTotal = businessLogs.reduce(
    (sum, log) => sum + (log.expenses || 0),
    0
  )
  const netBusinessIncome = businessRevenueTotal - businessExpenseTotal
  const totalIncome = jobIncomeTotal + netBusinessIncome

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-medium text-gray-800">Income Tracking</h3>
          <p className="text-gray-600 text-sm">
            Log earnings from jobs or businesses. Totals include business expenses.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-dreamy-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Income
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-floating p-4 text-center">
          <div className="text-lg font-medium text-emerald-600">
            ${jobIncomeTotal.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Job Income</div>
        </div>
        <div className="card-floating p-4 text-center">
          <div className="text-lg font-medium text-emerald-600">
            ${businessRevenueTotal.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Business Revenue</div>
        </div>
        <div className="card-floating p-4 text-center">
          <div className="text-lg font-medium text-red-600">
            -${businessExpenseTotal.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Business Expenses</div>
        </div>
        <div className="card-floating p-4 text-center">
          <div className="text-lg font-medium text-emerald-600">
            ${totalIncome.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Total Income</div>
        </div>
      </div>

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

      {showModal && (
        <IncomeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={saveIncome}
          jobs={jobs}
          businesses={businesses}
          saving={saving}
        />
      )}
    </div>
  )
}
