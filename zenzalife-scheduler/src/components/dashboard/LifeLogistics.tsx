import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { MapPin, Plus, Home, Car, Briefcase, Building, DollarSign, Edit, Trash2 } from 'lucide-react'
import { IncomeTracker } from './IncomeTracker'
import dayjs from 'dayjs'

type LogisticsTab = 'addresses' | 'vehicles' | 'jobs' | 'businesses' | 'income'

interface Address {
  id: string
  user_id: string
  type: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  zip: string
  country: string
  provider?: string
  ics_url?: string
  start_date?: string
  end_date?: string
  status?: string
  created_at: string
  updated_at: string
}

interface Vehicle {
  id: string
  user_id: string
  make?: string
  model?: string
  year?: number
  purchase_date?: string
  status?: string
  notes?: string
  created_at: string
  updated_at: string
}

interface Job {
  id: string
  user_id: string
  company: string
  title: string
  field?: string
  start_date: string
  end_date?: string
  pay_type?: string
  pay_rate?: number
  pay_frequency?: string
  hours_per_week?: number
  is_current: boolean
  created_at: string
  updated_at: string
}

interface Business {
  id: string
  user_id: string
  name: string
  type?: string
  start_date: string
  revenue_history?: any
  expenses?: any
  status?: string
  created_at: string
  updated_at: string
}

const tabConfig = [
  { id: 'addresses', label: 'Addresses', icon: Home, color: 'text-blue-500' },
  { id: 'vehicles', label: 'Vehicles', icon: Car, color: 'text-green-500' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, color: 'text-purple-500' },
  { id: 'businesses', label: 'Businesses', icon: Building, color: 'text-orange-500' },
  { id: 'income', label: 'Income Tracking', icon: DollarSign, color: 'text-emerald-500' }
]

export function LifeLogistics() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<LogisticsTab>('addresses')
  const [addresses, setAddresses] = useState<Address[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, activeTab])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      switch (activeTab) {
        case 'addresses': {
          const { data: addressData, error: addressError } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)

          if (addressError) throw addressError
          setAddresses(addressData || [])
          break
        }

        case 'vehicles': {
          const { data: vehicleData, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (vehicleError) throw vehicleError
          setVehicles(vehicleData || [])
          break
        }

        case 'jobs': {
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('user_id', user.id)
            .order('is_current', { ascending: false })

          if (jobError) throw jobError
          setJobs(jobData || [])
          break
        }

        case 'businesses': {
          const { data: businessData, error: businessError } = await supabase
            .from('businesses')
            .select('*')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false })

          if (businessError) throw businessError
          setBusinesses(businessData || [])
          break
        }
      }
    } catch (error: any) {
      toast.error('Failed to load data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setShowModal(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setShowModal(true)
  }

  const handleDelete = async (id: string, table: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Item deleted successfully!')
      await loadData()
    } catch (error: any) {
      toast.error('Failed to delete item: ' + error.message)
    }
  }

  const handleSave = async (data: any) => {
    if (!user) return

    const table = activeTab
    const timestamp = new Date().toISOString()

    try {
      const payload = editingItem
        ? { ...data, updated_at: timestamp }
        : { ...data, user_id: user.id, created_at: timestamp, updated_at: timestamp }

      const query = editingItem
        ? supabase.from(table).update(payload).eq('id', editingItem.id)
        : supabase.from(table).insert(payload)

      const { error } = await query

      if (error) throw error

      toast.success(`Item ${editingItem ? 'updated' : 'added'} successfully!`)
      setShowModal(false)
      setEditingItem(null)
      await loadData()
    } catch (error: any) {
      toast.error('Failed to save item: ' + error.message)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'addresses':
        return (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="p-4 bg-gray-50/80 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 capitalize">{address.type}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(address)} className="p-1 text-gray-500 hover:text-blue-500">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(address.id, 'addresses')} className="p-1 text-gray-500 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-700">
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>{address.city}, {address.state} {address.zip}</p>
                  <p>{address.country}</p>
                </div>
              </div>
            ))}
            {addresses.length === 0 && (
              <p className="text-gray-600 text-center py-8">No addresses added yet.</p>
            )}
          </div>
        )
        
      case 'vehicles':
        return (
          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="p-4 bg-gray-50/80 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h4>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(vehicle)} className="p-1 text-gray-500 hover:text-blue-500">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(vehicle.id, 'vehicles')} className="p-1 text-gray-500 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  {vehicle.purchase_date && (
                    <p>Purchased: {dayjs(vehicle.purchase_date).format('MMM D, YYYY')}</p>
                  )}
                  {vehicle.status && <p>Status: {vehicle.status}</p>}
                  {vehicle.notes && <p className="col-span-2">Notes: {vehicle.notes}</p>}
                </div>
              </div>
            ))}
            {vehicles.length === 0 && (
              <p className="text-gray-600 text-center py-8">No vehicles added yet.</p>
            )}
          </div>
        )
        
      case 'jobs':
        return (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 bg-gray-50/80 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.is_current && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Current</span>
                    )}
                    <button onClick={() => handleEdit(job)} className="p-1 text-gray-500 hover:text-blue-500">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(job.id, 'jobs')} className="p-1 text-gray-500 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  {job.field && <p>Field: {job.field}</p>}
                  <p>Started: {dayjs(job.start_date).format('MMM D, YYYY')}</p>
                  {job.end_date && <p>Ended: {dayjs(job.end_date).format('MMM D, YYYY')}</p>}
                  {job.pay_rate && (
                    <p>
                      Pay: ${job.pay_rate.toLocaleString()} {job.pay_frequency ? `/ ${job.pay_frequency}` : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <p className="text-gray-600 text-center py-8">No jobs added yet.</p>
            )}
          </div>
        )
        
      case 'businesses':
        return (
          <div className="space-y-4">
            {businesses.map((business) => (
              <div key={business.id} className="p-4 bg-gray-50/80 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">{business.name}</h4>
                    {business.type && (
                      <p className="text-sm text-gray-600">{business.type}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {business.status === 'active' && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                    )}
                    <button onClick={() => handleEdit(business)} className="p-1 text-gray-500 hover:text-blue-500">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(business.id, 'businesses')} className="p-1 text-gray-500 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Started: {dayjs(business.start_date).format('MMM D, YYYY')}</p>
                  {business.status && <p className="mt-2">Status: {business.status}</p>}
                </div>
              </div>
            ))}
            {businesses.length === 0 && (
              <p className="text-gray-600 text-center py-8">No businesses added yet.</p>
            )}
          </div>
        )
        
      case 'income':
        return <IncomeTracker />
        
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-orange-400" />
            Life Logistics
          </h1>
          <p className="text-gray-600/80 font-light mt-1">
            Organize your addresses, vehicles, jobs, and business information
          </p>
        </div>
        
        {activeTab !== 'income' && (
          <button
            onClick={handleAdd}
            className="btn-dreamy-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add {tabConfig.find(t => t.id === activeTab)?.label.slice(0, -1)}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="card-floating p-1">
        <div className="flex flex-wrap gap-1">
          {tabConfig.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as LogisticsTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-white shadow-sm' 
                    : 'hover:bg-white/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${
                  isActive ? 'text-gray-800' : 'text-gray-600'
                }`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="card-floating p-6">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>

      {showModal && (
        <LogisticsModal
          tab={activeTab}
          item={editingItem}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

interface LogisticsModalProps {
  tab: LogisticsTab
  item: any
  onClose: () => void
  onSave: (data: any) => void
}

function LogisticsModal({ tab, item, onClose, onSave }: LogisticsModalProps) {
  const [formData, setFormData] = useState<any>(() => {
    switch (tab) {
      case 'addresses':
        return {
          type: item?.type || '',
          address_line1: item?.address_line1 || '',
          address_line2: item?.address_line2 || '',
          city: item?.city || '',
          state: item?.state || '',
          zip: item?.zip || '',
          country: item?.country || '',
          provider: item?.provider || '',
          ics_url: item?.ics_url || '',
          start_date: item?.start_date || '',
          end_date: item?.end_date || '',
          status: item?.status || 'current'
        }
      case 'vehicles':
        return {
          make: item?.make || '',
          model: item?.model || '',
          year: item?.year || '',
          purchase_date: item?.purchase_date || '',
          status: item?.status || 'active',
          notes: item?.notes || ''
        }
      case 'jobs':
        return {
          company: item?.company || '',
          title: item?.title || '',
          field: item?.field || '',
          start_date: item?.start_date || '',
          end_date: item?.end_date || '',
          pay_type: item?.pay_type || '',
          pay_rate: item?.pay_rate || '',
          pay_frequency: item?.pay_frequency || '',
          hours_per_week: item?.hours_per_week || '',
          is_current: item?.is_current || false
        }
      case 'businesses':
        return {
          name: item?.name || '',
          type: item?.type || '',
          start_date: item?.start_date || '',
          status: item?.status || 'active'
        }
      default:
        return {}
    }
  })

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const renderFields = () => {
    switch (tab) {
      case 'addresses':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <input
                type="text"
                value={formData.type}
                onChange={e => handleChange('type', e.target.value)}
                className="input-dreamy w-full"
                placeholder="Home"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Address Line 1</label>
              <input
                type="text"
                value={formData.address_line1}
                onChange={e => handleChange('address_line1', e.target.value)}
                className="input-dreamy w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Address Line 2</label>
              <input
                type="text"
                value={formData.address_line2}
                onChange={e => handleChange('address_line2', e.target.value)}
                className="input-dreamy w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => handleChange('city', e.target.value)}
                  className="input-dreamy w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => handleChange('state', e.target.value)}
                  className="input-dreamy w-full"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">ZIP</label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={e => handleChange('zip', e.target.value)}
                  className="input-dreamy w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={e => handleChange('country', e.target.value)}
                  className="input-dreamy w-full"
                  required
                />
              </div>
            </div>
            
          </>
        )

      case 'vehicles':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Make</label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={e => handleChange('make', e.target.value)}
                  className="input-dreamy w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={e => handleChange('model', e.target.value)}
                  className="input-dreamy w-full"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={e => handleChange('year', e.target.value)}
                  className="input-dreamy w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={e => handleChange('purchase_date', e.target.value)}
                  className="input-dreamy w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <input
                  type="text"
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                  className="input-dreamy w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={e => handleChange('notes', e.target.value)}
                  className="input-dreamy w-full"
                />
              </div>
            </div>
          </>
        )

      case 'jobs':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={e => handleChange('company', e.target.value)}
                className="input-dreamy w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                className="input-dreamy w-full"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Field</label>
                <input
                  type="text"
                  value={formData.field}
                  onChange={e => handleChange('field', e.target.value)}
                  className="input-dreamy w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Pay Rate</label>
                <input
                  type="number"
                  value={formData.pay_rate}
                  onChange={e => handleChange('pay_rate', e.target.value)}
                  className="input-dreamy w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Pay Type</label>
                <input
                  type="text"
                  value={formData.pay_type}
                  onChange={e => handleChange('pay_type', e.target.value)}
                  className="input-dreamy w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Pay Frequency</label>
                <input
                  type="text"
                  value={formData.pay_frequency}
                  onChange={e => handleChange('pay_frequency', e.target.value)}
                  className="input-dreamy w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Hours/Week</label>
              <input
                type="number"
                value={formData.hours_per_week}
                onChange={e => handleChange('hours_per_week', e.target.value)}
                className="input-dreamy w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={e => handleChange('start_date', e.target.value)}
                  className="input-dreamy w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={e => handleChange('end_date', e.target.value)}
                  className="input-dreamy w-full"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={formData.is_current}
                onChange={e => handleChange('is_current', e.target.checked)}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Current Job</span>
            </label>
          </>
        )

      case 'businesses':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Business Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                className="input-dreamy w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <input
                type="text"
                value={formData.type}
                onChange={e => handleChange('type', e.target.value)}
                className="input-dreamy w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={e => handleChange('start_date', e.target.value)}
                className="input-dreamy w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={e => handleChange('status', e.target.value)}
                className="input-dreamy w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-800 mb-6">
            {item ? 'Edit' : 'Add'} {tab.slice(0, -1)}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderFields()}
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-dreamy">
                Cancel
              </button>
              <button type="submit" className="btn-dreamy-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}