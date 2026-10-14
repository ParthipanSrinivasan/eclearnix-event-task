import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Button, Field } from '../components/ui'
import { inputClass } from '../utils/styles'
import { AuthCard } from './AuthCard'

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      const user = await register(form)
      // <GuestOnly> redirects as soon as the user is set (see App.jsx).
      toast.success(`Welcome, ${user.name}! Your account is ready.`)
    } catch (err) {
      const hasFieldErrors = Object.keys(err.fieldErrors ?? {}).length > 0
      setErrors({ ...err.fieldErrors, form: hasFieldErrors ? '' : err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Sign up to register for events and track your bookings."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-semibold text-indigo-600 hover:text-indigo-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.form && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{errors.form}</p>}
        <Field label="Full name" htmlFor="name" error={errors.name}>
          <input id="name" autoComplete="name" value={form.name} onChange={update('name')} className={inputClass(errors.name)} autoFocus />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <input id="email" type="email" autoComplete="email" value={form.email} onChange={update('email')} className={inputClass(errors.email)} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters.">
          <input id="password" type="password" autoComplete="new-password" value={form.password} onChange={update('password')} className={inputClass(errors.password)} />
        </Field>
        <Button type="submit" loading={submitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}
