import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'
import { NOME_SISTEMA } from '../../utilitarios/marca.js'
import { NotificacoesSino } from '../NotificacoesSino.jsx'
import { SeletorTema } from '../SeletorTema.jsx'

const links = [
  { to: '/app/catalogo', label: 'Catálogo' },
  { to: '/app/minhas-reservas', label: 'Minhas reservas' },
  { to: '/app/meus-emprestimos', label: 'Meus empréstimos' },
  { to: '/app/notificacoes', label: 'Notificações' },
]

const linkClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-brand text-white dark:bg-brand dark:text-white'
      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
  }`

/** Área do leitor: autoatendimento e acompanhamento pessoal (responsivo). */
export function LayoutUsuario() {
  const { usuarioAtual, logout } = useAutenticacao()
  const { toast } = useToast()
  const [menuAberto, setMenuAberto] = useState(false)

  function encerrarSessao() {
    toast.info('Sessão encerrada.')
    logout()
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 md:flex-row">
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 md:hidden">
        <span className="font-semibold text-brand-foreground dark:text-sky-400">{NOME_SISTEMA}</span>
        <div className="flex items-center gap-2">
          <SeletorTema />
          <NotificacoesSino />
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            onClick={() => setMenuAberto(true)}
          >
            Menu
          </button>
        </div>
      </header>

      {menuAberto && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Fechar menu"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 transform border-r border-slate-200 bg-white shadow-xl transition-transform dark:border-slate-700 dark:bg-slate-900 md:static md:translate-x-0 md:shadow-none ${
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center border-b border-slate-100 px-4 dark:border-slate-700">
          <p className="font-medium text-slate-800 dark:text-slate-100">Área do usuário</p>
          <button
            type="button"
            className="ml-auto md:hidden"
            onClick={() => setMenuAberto(false)}
          >
            ✕
          </button>
        </div>
        <nav className="p-3" onClick={() => setMenuAberto(false)}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 p-3 dark:border-slate-700 md:static">
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{usuarioAtual?.nome}</p>
          <button
            type="button"
            className="mt-2 w-full rounded-lg border border-slate-200 py-2 text-sm dark:border-slate-600 dark:text-slate-200"
            onClick={() => {
              encerrarSessao()
              setMenuAberto(false)
            }}
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-700 dark:bg-slate-900 md:flex">
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{NOME_SISTEMA}</h1>
          <div className="flex items-center gap-3">
            <SeletorTema />
            <NotificacoesSino />
            <span className="text-sm text-slate-600 dark:text-slate-300">{usuarioAtual?.nome}</span>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-600 dark:text-slate-200"
              onClick={encerrarSessao}
            >
              Sair
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-slate-50 p-4 dark:bg-slate-950 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
