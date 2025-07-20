import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'
import { Plus, Edit, Trash2 } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

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
  income?: {
    id: string
    type: 'job' | 'business'
    job_id?: string
    business_id?: string
    date: string
    hours_worked?: number
    amount: number
    expenses?: number
    notes?: string
  } | null
  onDelete?: () => void
}

function IncomeModal({
  isOpen,
  onClose,
  onSave,
  jobs,
  businesses,
  saving,
  income,
  onDelete,
}: IncomeModalProps) {
  const [type, setType] = useState<'job' | 'business'>(income?.type || 'job')
  const [date, setDate] = useState(
    income?.date ? dayjs(income.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  )
  const [jobId, setJobId] = useState(income?.job_id || '')
  const [businessId, setBusinessId] = useState(income?.business_id || '')
  const [hours, setHours] = useState(
    income && income.type === 'job' && income.hours_worked ? String(income.hours_worked) : ''
  )
  const [amount, setAmount] = useState(income ? String(income.amount) : '')
  const [expenses, setExpenses] = useState(
    income && income.type === 'business' && income.expenses ? String(income.expenses) : ''
  )
  const [notes, setNotes] = useState(income?.notes || '')

  useEffect(() => {
    if (jobs.length && !jobId) setJobId(jobs[0].id)
  }, [jobs, jobId])

  useEffect(() => {
    if (businesses.length && !businessId) setBusinessId(businesses[0].id)
  }, [businesses, businessId])

  useEffect(() => {
    if (income) {
      setType(income.type)
      setDate(dayjs(income.date).format('YYYY-MM-DD'))
      setJobId(income.job_id || '')
      setBusinessId(income.business_id || '')
      setHours(
        income.type === 'job' && income.hours_worked ? String(income.hours_worked) : ''
      )
      setAmount(String(income.amount))
      setExpenses(
        income.type === 'business' && income.expenses ? String(income.expenses) : ''
      )
      setNotes(income.notes || '')
    }
  }, [income])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum)) {
      toast.error('Enter a valid amount')
      return
    }

    const payload = {
      id: income?.id,
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
            <h2 className="text-xl font-medium text-gray-800">
              {income ? 'Edit Income' : 'Add Income'}
            </h2>
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

            <div className="flex justify-between pt-2">
              {income && onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="btn-dreamy text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              ) : (
                <span />
              )}

              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="btn-dreamy">
                  Cancel
                </button>
                <button type="submit" className="btn-dreamy-primary" disabled={saving}>
                  {income ? 'Update Income' : 'Save Income'}
                </button>
              </div>
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
  const [editingIncome, setEditingIncome] = useState<{
    id: string
    type: 'job' | 'business'
    job_id?: string
    business_id?: string
    date: string
    hours_worked?: number
    amount: number
    expenses?: number
    notes?: string
  } | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<string>('')

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

  const handleDelete = async (income: {
    id: string
    type: 'job' | 'business'
  }) => {
    if (!user) return
    if (!confirm('Delete this income entry?')) return
    try {
      const table = income.type === 'job' ? 'job_income_logs' : 'business_income_logs'
      const { error } = await supabase.from(table).delete().eq('id', income.id)
      if (error) throw error
      toast.success('Income deleted')
      await loadIncomeData()
      setShowModal(false)
      setEditingIncome(null)
    } catch (error: any) {
      toast.error('Failed to delete income: ' + error.message)
    }
  }

  const saveIncome = async (data: {
    id?: string
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
        const { error } = data.id
          ? await supabase
              .from('job_income_logs')
              .update({
                job_id: data.job_id,
                date: data.date,
                hours_worked: data.hours_worked || null,
                amount_earned: data.amount,
                notes: data.notes || null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', data.id)
          : await supabase.from('job_income_logs').insert({
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
        const { error } = data.id
          ? await supabase
              .from('business_income_logs')
              .update({
                business_id: data.business_id,
                date: data.date,
                amount_earned: data.amount,
                expenses: data.expenses || 0,
                notes: data.notes || null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', data.id)
          : await supabase.from('business_income_logs').insert({
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
      setEditingIncome(null)
    } catch (error: any) {
      toast.error('Failed to save income: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const filterLogs = <T extends { date: string }>(logs: T[]) =>
    logs.filter((log) => {
      const year = dayjs(log.date).format('YYYY')
      const month = dayjs(log.date).format('MM')
      return (
        (selectedYear ? year === selectedYear : true) &&
        (selectedMonth ? month === selectedMonth : true)
      )
    })

  const incomes = [
    ...filterLogs(jobLogs).map((log) => ({
      id: log.id,
      type: 'job' as const,
      date: log.date,
      amount: log.amount_earned,
      name: getJobName(log.job_id),
      notes: log.notes,
    })),
    ...filterLogs(businessLogs).map((log) => ({
      id: log.id,
      type: 'business' as const,
      date: log.date,
      amount: log.amount_earned,
      name: getBusinessName(log.business_id),
      notes: log.notes,
    })),
  ].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())

  const jobIncomeTotal = filterLogs(jobLogs).reduce(
    (sum, log) => sum + (log.amount_earned || 0),
    0
  )
  const businessRevenueTotal = filterLogs(businessLogs).reduce(
    (sum, log) => sum + (log.amount_earned || 0),
    0
  )
  const businessExpenseTotal = filterLogs(businessLogs).reduce(
    (sum, log) => sum + (log.expenses || 0),
    0
  )
  const netBusinessIncome = businessRevenueTotal - businessExpenseTotal
  const totalIncome = jobIncomeTotal + netBusinessIncome

  const years = Array.from(
    new Set([...jobLogs, ...businessLogs].map((l) => dayjs(l.date).format('YYYY')))
  ).sort()

  const monthlyTotals = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0')
    const jobsTotal = filterLogs(jobLogs).filter((log) => dayjs(log.date).format('MM') === month).reduce((sum, l) => sum + (l.amount_earned || 0), 0)
    const bizRevenue = filterLogs(businessLogs).filter((log) => dayjs(log.date).format('MM') === month).reduce((sum, l) => sum + (l.amount_earned || 0), 0)
    const bizExpenses = filterLogs(businessLogs).filter((log) => dayjs(log.date).format('MM') === month).reduce((sum, l) => sum + (l.expenses || 0), 0)
    const total = jobsTotal + (bizRevenue - bizExpenses)
    return { month: dayjs(`${month}-01`, 'MM-DD').format('MMM'), total }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h3 className="text-xl font-medium text-gray-800">Income Tracking</h3>
          <p className="text-gray-600 text-sm">
            Log earnings from jobs or businesses. Totals include business expenses.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="input-dreamy"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-dreamy"
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={String(i + 1).padStart(2, '0')}>
                {dayjs(String(i + 1), 'M').format('MMM')}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setEditingIncome(null)
              setShowModal(true)
            }}
            className="btn-dreamy-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Income
          </button>
        </div>
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

      <div className="card-floating p-4">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyTotals}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
            <Bar dataKey="total" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
          </div>
        ) : incomes.length > 0 ? (
          incomes.map((income) => (
            <div key={income.id} className="p-4 bg-gray-50/80 rounded-xl">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h4 className="font-medium text-gray-800">{income.name}</h4>
                  <p className="text-sm text-gray-600">
                    {dayjs(income.date).format('MMM D, YYYY')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium text-emerald-600">
                    ${income.amount.toFixed(2)}
                  </p>
                  <button
                    onClick={() => {
                      if (income.type === 'job') {
                        const log = jobLogs.find((l) => l.id === income.id)
                        if (log)
                          setEditingIncome({
                            id: log.id,
                            type: 'job',
                            job_id: log.job_id,
                            date: log.date,
                            hours_worked: log.hours_worked || undefined,
                            amount: log.amount_earned,
                            notes: log.notes || undefined,
                          })
                      } else {
                        const log = businessLogs.find((l) => l.id === income.id)
                        if (log)
                          setEditingIncome({
                            id: log.id,
                            type: 'business',
                            business_id: log.business_id,
                            date: log.date,
                            amount: log.amount_earned,
                            expenses: log.expenses || undefined,
                            notes: log.notes || undefined,
                          })
                      }
                      setShowModal(true)
                    }}
                    className="p-1 text-gray-500 hover:text-blue-500"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {income.notes && (
                <p className="text-sm text-gray-600 mt-1">{income.notes}</p>
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
          onClose={() => {
            setShowModal(false)
            setEditingIncome(null)
          }}
          onSave={saveIncome}
          jobs={jobs}
          businesses={businesses}
          saving={saving}
          income={editingIncome}
          onDelete={editingIncome ? () => handleDelete(editingIncome) : undefined}
        />
      )}
    </div>
  )
}
