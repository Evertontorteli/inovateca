import { Outlet, useLocation } from 'react-router-dom'
import { SeletorTema } from '../SeletorTema.jsx'
import { useTema } from '../../contextos/TemaContexto.jsx'

/** Páginas públicas: login, recuperação e primeiro acesso (fundo neutro, cartão central). */
export function LayoutPublico() {
  const location = useLocation()
  const { tema } = useTema()
  const exibirAvisoMvp = location.pathname === '/login'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-brand/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 lg:grid lg:grid-cols-2">
      <div
        className="relative hidden bg-[#fefdfe] dark:bg-[#0d1735] lg:block"
        style={{
          backgroundColor: tema === 'dark' ? '#0d1735' : '#fefdfe',
          backgroundImage:
            tema === 'dark'
              ? "url('/wallpaper Login Escuro.png')"
              : "url('/wallpaper Login.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left bottom',
          backgroundSize: 'auto 58%',
        }}
        aria-hidden
      />
      <div className="relative flex min-h-screen items-center justify-center bg-[#fefdfe] px-4 py-10 dark:bg-[#0d1735] lg:justify-center lg:px-8">
        <div className="absolute right-4 top-4 z-10">
          <SeletorTema />
        </div>
        <div className="w-full max-w-md">
          {exibirAvisoMvp && (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <strong>MPV:</strong> Administrador:{' '}
              <code className="rounded bg-white px-1">admin@empresa.com</code> /{' '}
              <code className="rounded bg-white px-1">admin</code>
              <br />
              Usuario: <code className="rounded bg-white px-1">usuario@empresa.com</code> /{' '}
              <code className="rounded bg-white px-1">123456</code>
            </p>
          )}
          <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.12),0_2px_10px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_14px_36px_rgba(2,6,23,0.55),0_2px_10px_rgba(2,6,23,0.35)] md:p-8">
          <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
