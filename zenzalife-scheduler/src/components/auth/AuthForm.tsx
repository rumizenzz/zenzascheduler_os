import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Heart } from 'lucide-react'

type AuthMode = 'signin' | 'signup'

interface AuthFormProps {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
}

const relationshipRoles = [
  { value: 'mom', label: 'Mom' },
  { value: 'dad', label: 'Dad' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'husband', label: 'Husband' },
  { value: 'wife', label: 'Wife' },
  { value: 'partner', label: 'Partner' },
  { value: 'individual', label: 'Individual' }
]

export function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [relationshipRole, setRelationshipRole] = useState('individual')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        toast.success('Welcome back to ZenzaLife!')
      } else {
        const { error } = await signUp(email, password, displayName, relationshipRole)
        if (error) throw error
        toast.success('Welcome to ZenzaLife! Please check your email to verify your account.')
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card-floating p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-light text-gray-800">
            {mode === 'signin' ? 'Welcome Back' : 'Join ZenzaLife'}
          </h2>
          <p className="text-sm text-gray-600/80 font-light">
            {mode === 'signin' 
              ? 'Continue your journey to 1% better every day' 
              : 'Begin your transformation into a higher version of yourself'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-light text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Display Name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-dreamy w-full"
                  placeholder="How should we call you?"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="relationshipRole" className="text-sm font-light text-gray-700 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Role in Family
                </label>
                <select
                  id="relationshipRole"
                  name="relationshipRole"
                  value={relationshipRole}
                  onChange={(e) => setRelationshipRole(e.target.value)}
                  className="input-dreamy w-full"
                >
                  {relationshipRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-light text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-dreamy w-full"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-light text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-dreamy w-full pr-12"
                placeholder="Your secure password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-dreamy-primary w-full"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
            className="text-sm text-gray-600/80 hover:text-gray-800 font-light underline underline-offset-4"
          >
            {mode === 'signin' 
              ? 'New to ZenzaLife? Create an account' 
              : 'Already have an account? Sign in'
            }
          </button>
        </div>
      </div>
    </div>
  )
}