import { Outlet } from 'react-router-dom'
import { NOME_SISTEMA } from '../../utilitarios/marca.js'

/** Páginas públicas: login, recuperação e primeiro acesso (fundo neutro, cartão central). */
export function LayoutPublico() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-brand/10 px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto w-full max-w-md">
        <p className="mb-6 text-center text-sm font-medium uppercase tracking-wider text-brand-foreground dark:text-sky-400">
          {NOME_SISTEMA}
        </p>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-950/50 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
