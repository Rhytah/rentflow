import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { useUpdateProfile } from '@/hooks/useProfile'
import { Card, CardHeader, Avatar } from '@/components/shared'
import toast from 'react-hot-toast'

export function SettingsPage() {
  const { profile, signOut, updatePassword, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const { mutateAsync: updateProfile, isPending: savingProfile } = useUpdateProfile()

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)

  async function handleProfileSubmit(e) {
    e.preventDefault()
    try {
      await updateProfile({ id: profile.id, full_name: fullName, phone })
      await refreshProfile()
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordSaving(true)
    try {
      await updatePassword(newPassword)
      setNewPassword('')
      toast.success('Password updated')
    } catch (err) {
      toast.error(err?.message ?? 'Failed to update password')
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-2xl">
      <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h1>

      <Card>
        <div className="flex items-center gap-3 mb-5">
          <Avatar name={profile?.full_name ?? '?'} size="lg" />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{profile?.full_name}</p>
            <span className="pill pill-blue capitalize text-[10px] mt-1 inline-block">
              {profile?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        <CardHeader title="Profile" />
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Full name</label>
            <input className="input" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Phone</label>
            <input className="input" placeholder="07X XXX XXXX" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Email</label>
            <input className="input opacity-60" value={profile?.email ?? ''} disabled />
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary px-4 py-2 disabled:opacity-60">
            {savingProfile ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Password" />
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">New password</label>
            <input
              type="password"
              className="input"
              placeholder="Min 8 characters"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <button type="submit" disabled={passwordSaving} className="btn-primary px-4 py-2 disabled:opacity-60">
            {passwordSaving ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Session" />
        <button
          type="button"
          onClick={handleSignOut}
          className="btn text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 px-4 py-2"
        >
          Sign out
        </button>
      </Card>
    </div>
  )
}
