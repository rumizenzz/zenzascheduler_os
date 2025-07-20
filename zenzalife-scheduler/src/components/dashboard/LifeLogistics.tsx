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
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  zip_code: string
  country: string
  is_primary?: boolean
  created_at: string
  updated_at: string
}

interface Vehicle {
  id: string
  user_id: string
  make: string
  model: string
  year: number
  color?: string
  license_plate?: string
  vin?: string
  insurance_company?: string
  policy_number?: string
  registration_expiry?: string
  created_at: string
  updated_at: string
}

interface Job {
  id: string
  user_id: string
  company_name: string
  position: string
  employment_type: string
  start_date: string
  end_date?: string
  salary?: number
  is_current: boolean
  created_at: string
  updated_at: string
}

interface Business {
  id: string
  user_id: string
  business_name: string
  business_type: string
  start_date: string
  description?: string
  status: string
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

  const saveItem = async (formData: any) => {
    if (!user) return

    const table = activeTab

    try {
      if (editingItem) {
        const { error } = await supabase
          .from(table)
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingItem.id)

        if (error) throw error
        toast.success('Item updated successfully!')
      } else {
        const { error } = await supabase
          .from(table)
          .insert({
            ...formData,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) throw error
        toast.success('Item added successfully!')
      }

      await loadData()
      setShowModal(false)
      setEditingItem(null)
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
                  <p>{address.address_line_1}</p>
                  {address.address_line_2 && <p>{address.address_line_2}</p>}
                  <p>{address.city}, {address.state} {address.zip_code}</p>
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
                  {vehicle.color && <p>Color: {vehicle.color}</p>}
                  {vehicle.license_plate && <p>License: {vehicle.license_plate}</p>}
                  {vehicle.insurance_company && <p>Insurance: {vehicle.insurance_company}</p>}
                  {vehicle.registration_expiry && (
                    <p>Registration Expires: {dayjs(vehicle.registration_expiry).format('MMM D, YYYY')}</p>
                  )}
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
                    <h4 className="font-medium text-gray-800">{job.position}</h4>
                    <p className="text-sm text-gray-600">{job.company_name}</p>
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
                  <p>Type: {job.employment_type}</p>
                  <p>Started: {dayjs(job.start_date).format('MMM D, YYYY')}</p>
                  {job.end_date && <p>Ended: {dayjs(job.end_date).format('MMM D, YYYY')}</p>}
                  {job.salary && <p>Salary: ${job.salary.toLocaleString()}</p>}
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
                    <h4 className="font-medium text-gray-800">{business.business_name}</h4>
                    <p className="text-sm text-gray-600">{business.business_type}</p>
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
                  {business.description && <p className="mt-2">{business.description}</p>}
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
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingItem(null)
          }}
          onSave={saveItem}
          tab={activeTab}
          item={editingItem}
        />
      )}
    </div>
  )
}

interface LogisticsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  tab: LogisticsTab
  item: any
}

function LogisticsModal({ isOpen, onClose, onSave, tab, item }: LogisticsModalProps) {
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    if (!isOpen) return

    switch (tab) {
      case 'addresses':
        setForm({
          type: '',
          address_line_1: '',
          address_line_2: '',
          city: '',
          state: '',
          zip_code: '',
          country: '',
          is_primary: false,
          ...(item || {})
        })
        break
      case 'vehicles':
        setForm({
          make: '',
          model: '',
          year: new Date().getFullYear(),
          ...(item || {})
        })
        break
      case 'jobs':
        setForm({
          company_name: '',
          position: '',
          employment_type: '',
          start_date: '',
          end_date: '',
          salary: '',
          is_current: true,
          ...(item || {})
        })
        break
      case 'businesses':
        setForm({
          business_name: '',
          business_type: '',
          start_date: '',
          description: '',
          status: 'active',
          ...(item || {})
        })
        break
    }
  }, [isOpen, tab, item])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      const { checked } = e.target
      setForm((prev: any) => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setForm((prev: any) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  if (!isOpen) return null

  const renderFields = () => {
    switch (tab) {
      case 'addresses':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <input
                name="type"
                value={form.type || ''}
                onChange={handleChange}
                className="input-dreamy w-full"
                placeholder="Home"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Address Line 1</label>
              <input
                name="address_line_1"
                value={form.address_line_1 || ''}
                onChange={handleChange}
                className="input-dreamy w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Address Line 2</label>
              <input
                name="address_line_2"
                value={form.address_line_2 || ''}
                onChange={handleChange}
                className="input-dreamy w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">City</label>
                <input
                  name="city"
                  value={form.city || ''}
                  onChange={handleChange}
                  className="input-dreamy w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">State</label>
                <input
                  name="state"
                  value={form.state || ''}
                  onChange={handleChange}
                  className="input-dreamy w-full"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Zip</label>
                <input
                  name="zip_code"
                  value={form.zip_code || ''}
                  onChange={handleChange}
                  className="input-dreamy w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Country</label>
                <input
                  name="country"
                  value={form.country || ''}
                  onChange={handleChange}
                  className="input-dreamy w-full"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                id="is_primary"
                name="is_primary"
                type="checkbox"
                checked={form.is_primary || false}
                onChange={handleChange}
              />
              <label htmlFor="is_primary" className="text-sm text-gray-700">Primary Address</label>
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
                  name="make"
                  value={form.make || ''}
                  onChange={handleChange}
                  className="input-dreamy w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Model</label>
                <input
                  name="model"
                  value={form.model || ''}
                  onChange={handleChange}
                  className="input-dreamy w-full"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Year</label>
              <input
                name="year"
                type="number"
                value={form.year || ''}
                onChange={handleChange}
                className="input-dreamy w-full"
              />
            </div>
          </>
        )
      case 'jobs':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Company</label>
              <input
                name="company_name"
                value={form.company_name || ''}
                onChange={handleChange}
                className="input-dreamy w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Position</label>
              <input
                name="position"
                value={form.position || ''}
                onChange={handleChange}
                className="input-dreamy w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Employment Type</label>
              <input
                name="employment_type"
                value={form.employment_type || ''}
                onChange={handleChange}
                className="input-dreamy w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <input
                  name="start_date"
                  type="date"
                  value={form.start_date || ''}
                  onChange={handleChange}
                  className="input-dreamy w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <input
                  name="end_date"
                  type="date"
                  value={form.end_date || ''}
                  onChange={handleChange}
                  className="input-dreamy w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Salary</label>
              <input
                name="salary"
                type="number"
                value={form.salary || ''}
                onChange={handleChange}
                className="input-dreamy w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_current"
                name="is_current"
                type="checkbox"
                checked={form.is_current}
                onChange={handleChange}
              />
              <label htmlFor="is_current" className="text-sm text-gray-700">Current Job</label>
            </div>
          </>
        )
      case 'businesses':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Business Name</label>
              <input
                name="business_name"
                value={form.business_name || ''}
                onChange={handleChange}
                className="input-dreamy w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Business Type</label>
              <input
                name="business_type"
                value={form.business_type || ''}
                onChange={handleChange}
                className="input-dreamy w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <input
                name="start_date"
                type="date"
                value={form.start_date || ''}
                onChange={handleChange}
                className="input-dreamy w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                className="input-dreamy w-full h-24 resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={form.status || 'active'}
                onChange={handleChange}
                className="input-dreamy w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-800 mb-4">
            {item ? 'Edit' : 'Add'} {tab.slice(0, -1)}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderFields()}
            <div className="flex justify-end gap-3 pt-2">
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