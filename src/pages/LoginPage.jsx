import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

export function LoginPage() {
  const { signIn, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  async function handleReset(e) {
    e.preventDefault()
    setResetLoading(true)
    try {
      await resetPassword(email)
      setResetSent(true)
    } catch (err) {
      toast.error(err?.message ?? 'Failed to send reset email')
    } finally {
      setResetLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      toast.error(err?.message ?? 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 py-8 sm:py-12">
      <div className="w-full max-w-sm min-w-0">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">RentFlow</span>
        </div>

        <div className="card">
          {forgotMode ? (
            <>
              <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Reset password</h1>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                {resetSent ? 'Check your email for a reset link.' : "Enter your email and we'll send you a reset link."}
              </p>

              {resetSent ? (
                <button type="button" onClick={() => { setForgotMode(false); setResetSent(false) }} className="btn w-full py-2.5">
                  Back to sign in
                </button>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Email</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" disabled={resetLoading} className="btn-primary w-full py-2.5 disabled:opacity-60">
                    {resetLoading ? 'Sending...' : 'Send reset link'}
                  </button>
                  <button type="button" onClick={() => setForgotMode(false)} className="btn w-full py-2.5">
                    Back to sign in
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Welcome back</h1>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">Sign in to your account</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-500">Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotMode(true)}
                      className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => setShowPw(v => !v)}
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2.5 mt-2 disabled:opacity-60"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <p className="text-sm text-center text-gray-500 dark:text-gray-500 mt-5">
                No account?{' '}
                <Link to="/signup" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">Sign up</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
