import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'
import { AVATAR_PADRAO_URL } from '../../utilitarios/avatarsPredefinidos.js'
import { NOME_SISTEMA } from '../../utilitarios/marca.js'
import { NotificacoesSino } from '../NotificacoesSino.jsx'
import { MenuContaUsuario } from '../MenuContaUsuario.jsx'
import { SeletorTema } from '../SeletorTema.jsx'

/** Ícones outline 20×20 — herdando `currentColor`. */
const icone = 'h-5 w-5 shrink-0'

function IconeCatalogo() {
  return (
    <svg className={icone} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  )
}

function IconeReservas() {
  return (
    <svg className={icone} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  )
}

function IconeEmprestimos() {
  return (
    <svg className={icone} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  )
}

function IconeNotificacoes() {
  return (
    <svg className={icone} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  )
}

const links = [
  { to: '/app/catalogo', label: 'Catálogo', Icon: IconeCatalogo },
  { to: '/app/minhas-reservas', label: 'Minhas reservas', Icon: IconeReservas },
  { to: '/app/meus-emprestimos', label: 'Meus empréstimos', Icon: IconeEmprestimos },
  { to: '/app/notificacoes', label: 'Notificações', Icon: IconeNotificacoes },
]

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-[#F2F9FB] text-[#0084E1] dark:bg-slate-800 dark:text-sky-400'
      : 'text-[#5A5D5C] hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
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
    <div className="flex min-h-screen flex-col bg-slate-100 dark:bg-slate-950 md:flex-row">
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 md:hidden">
        <span className="font-semibold text-brand-foreground dark:text-sky-400">{NOME_SISTEMA}</span>
        <div className="flex items-center gap-2">
          <SeletorTema />
          <NotificacoesSino />
          <MenuContaUsuario
            nome={usuarioAtual?.nome}
            email={usuarioAtual?.email}
            avatarUrl={usuarioAtual?.avatarUrl || AVATAR_PADRAO_URL}
            mostrarNome={false}
            aoSair={() => {
              encerrarSessao()
              setMenuAberto(false)
            }}
          />
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
        <div className="flex h-14 items-center gap-2 border-b border-slate-100 px-4 dark:border-slate-700">
          <img
            src="/logoInovateca.png"
            alt={NOME_SISTEMA}
            className="h-7 max-w-[10rem] object-contain object-left"
            decoding="async"
          />
          <button
            type="button"
            className="ml-auto md:hidden"
            onClick={() => setMenuAberto(false)}
          >
            ✕
          </button>
        </div>
        <nav className="p-3" onClick={() => setMenuAberto(false)}>
          {links.map((l) => {
            const { Icon } = l
            return (
              <NavLink key={l.to} to={l.to} className={linkClass} title={l.label}>
                <Icon />
                {l.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center justify-end border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-700 dark:bg-slate-900 md:flex">
          <div className="flex items-center gap-3">
            <SeletorTema />
            <NotificacoesSino />
            <MenuContaUsuario
              nome={usuarioAtual?.nome}
              email={usuarioAtual?.email}
              avatarUrl={usuarioAtual?.avatarUrl || AVATAR_PADRAO_URL}
              aoSair={encerrarSessao}
            />
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-white p-4 dark:bg-slate-950 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
