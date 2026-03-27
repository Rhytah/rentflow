import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

const roles = [
  { value: 'landlord', label: 'Landlord', desc: 'I own and manage my own properties' },
  { value: 'property_manager', label: 'Property Manager', desc: 'I manage properties for owners' },
  { value: 'tenant', label: 'Tenant', desc: 'I rent a property' },
  { value: 'homeowner', label: 'Homeowner', desc: 'I own property managed by someone else' },
]

export function SignUpPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('landlord')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signUp(email, password, fullName, role)
      toast.success('Account created! Please check your email to verify.')
      navigate('/login')
    } catch (err) {
      toast.error(err?.message ?? 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="text-2xl font-semibold text-gray-900">RentFlow</span>
        </div>

        <div className="card">
          <h1 className="text-lg font-medium text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-6">Get started with RentFlow</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Full name</label>
              <input className="input" placeholder="John Kato" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
              <input type="email" className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
              <input type="password" className="input" placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      role === r.value
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className={`text-xs font-medium ${role === r.value ? 'text-brand-800' : 'text-gray-800'}`}>{r.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2 disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
