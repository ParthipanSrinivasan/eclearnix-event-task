import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ButtonLink } from './ui'
import { ADMIN_HOME, USER_HOME } from '../utils/routes'

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/login')
  }

  const links = (
    <>
      <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>
        Events
      </NavLink>
      {user && !isAdmin && (
        <NavLink to={USER_HOME} className={linkClass} onClick={() => setOpen(false)}>
          My Dashboard
        </NavLink>
      )}
      {isAdmin && (
        <NavLink to={ADMIN_HOME} className={linkClass} onClick={() => setOpen(false)}>
          Dashboard
        </NavLink>
      )}
    </>
  )

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">E</span>
          EventHub
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">{links}</nav>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-slate-600">
                {user.name}
                {/* Role badge, skipped when the name already says it (e.g. the default "Admin" account). */}
                {isAdmin && !/admin/i.test(user.name) && (
                  <span className="ml-2 rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">Admin</span>
                )}
              </span>
              <button type="button" onClick={handleLogout} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <ButtonLink to="/register">Sign up</ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="ml-auto rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" d={open ? 'M6 6l12 12M6 18L18 6' : 'M4 7h16M4 12h16M4 17h16'} />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">{links}</nav>
          <div className="mt-3 border-t border-slate-100 pt-3">
            {user ? (
              <button type="button" onClick={handleLogout} className="text-sm font-medium text-slate-600">
                Log out ({user.name})
              </button>
            ) : (
              <div className="flex gap-3">
                <ButtonLink to="/login" variant="secondary" onClick={() => setOpen(false)}>
                  Log in
                </ButtonLink>
                <ButtonLink to="/register" onClick={() => setOpen(false)}>
                  Sign up
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
