/** Classes for text inputs and selects, red when the field has an error. */
export const inputClass = (hasError) =>
  `block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2 ${
    hasError
      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
  }`
