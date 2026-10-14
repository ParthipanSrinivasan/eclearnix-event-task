export function AuthCard({ title, subtitle, footer, children }) {
  return (
    <div className="mx-auto max-w-md py-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">{subtitle}</p>
        {children}
      </div>
      <p className="mt-4 text-center text-sm text-slate-600">{footer}</p>
    </div>
  )
}
