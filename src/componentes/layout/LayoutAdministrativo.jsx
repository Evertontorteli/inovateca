import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.jsx'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'
import { AVATAR_PADRAO_URL } from '../../utilitarios/avatarsPredefinidos.js'
import { NOME_SISTEMA } from '../../utilitarios/marca.js'
import { NotificacoesSino } from '../NotificacoesSino.jsx'
import { MenuContaUsuario } from '../MenuContaUsuario.jsx'
import { SeletorTema } from '../SeletorTema.jsx'

/** Ícones outline 20×20 — herdando `currentColor` do link (ativo / inativo). */
const icone = 'h-5 w-5 shrink-0'

function IconePainel() {
  return (
    <svg className={icone} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  )
}

function IconeLivros() {
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

function IconeCategorias() {
  return (
    <svg className={icone} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  )
}

function IconeAutores() {
  return (
    <svg className={icone} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )
}

function IconeUsuarios() {
  return (
    <svg className={icone} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
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

function IconeDevolucao() {
  return (
    <svg className={icone} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
      />
    </svg>
  )
}

function IconeConfiguracoes() {
  return (
    <svg className={icone} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

function IconeSair() {
  return (
    <svg className={icone} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  )
}

const links = [
  { to: '/admin/painel', label: 'Painel', Icon: IconePainel },
  { to: '/admin/livros', label: 'Livros', Icon: IconeLivros },
  { to: '/admin/categorias', label: 'Categorias', Icon: IconeCategorias },
  { to: '/admin/autores', label: 'Autores', Icon: IconeAutores },
  { to: '/admin/usuarios', label: 'Usuários', Icon: IconeUsuarios },
  { to: '/admin/reservas', label: 'Reservas', Icon: IconeReservas },
  { to: '/admin/emprestimos', label: 'Empréstimos', Icon: IconeEmprestimos },
  { to: '/admin/devolucao', label: 'Devolução', Icon: IconeDevolucao },
]

const linkConfiguracoes = {
  to: '/admin/configuracoes',
  label: 'Configurações',
  Icon: IconeConfiguracoes,
}

const CHAVE_SIDEBAR_ICONES = 'inovateca_admin_sidebar_icones'

const rotasComBusca = [
  '/admin/livros',
  '/admin/usuarios',
  '/admin/categorias',
  '/admin/autores',
  '/admin/reservas',
  '/admin/emprestimos',
  '/admin/devolucao',
]

function classeLinkNav(soIcones) {
  return ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      soIcones ? 'md:justify-center md:gap-0 md:px-2 md:py-2.5' : ''
    } ${
      isActive
        ? 'bg-[#F2F9FB] text-[#0084E1] dark:bg-slate-800 dark:text-sky-400'
        : 'text-[#5A5D5C] hover:bg-[#F2F9FB] hover:text-[#0084E1] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400'
    }`
}

/** Shell responsivo da área administrativa: menu lateral no desktop e gaveta no mobile. */
export function LayoutAdministrativo() {
  const { usuarioAtual, logout } = useAutenticacao()
  const { salvarUsuario } = useBiblioteca()
  const { toast } = useToast()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [menuAberto, setMenuAberto] = useState(false)

  const exibindoBusca = rotasComBusca.some((rota) =>
    location.pathname.startsWith(rota),
  )
  const valorBusca = searchParams.get('q') || ''

  function atualizarBusca(valor) {
    const next = new URLSearchParams(searchParams)
    if (valor.trim()) next.set('q', valor)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  function encerrarSessao() {
    toast.info('Sessão encerrada.')
    logout()
  }

  function salvarMeuPerfil({ nome, whatsapp }) {
    if (!usuarioAtual?.id) return
    salvarUsuario({
      id: usuarioAtual.id,
      nome,
      email: usuarioAtual.email,
      perfil: usuarioAtual.perfil,
      avatarUrl: usuarioAtual.avatarUrl,
      whatsapp,
    })
    toast.success('Perfil atualizado.')
  }
  /** No desktop (md+): menu só com ícones; no mobile o drawer permanece largura completa. */
  const [sidebarSoIcones, setSidebarSoIcones] = useState(() => {
    try {
      return localStorage.getItem(CHAVE_SIDEBAR_ICONES) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_SIDEBAR_ICONES, sidebarSoIcones ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [sidebarSoIcones])

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 md:flex-row dark:bg-slate-950">
      <header className="flex items-center justify-between gap-2 bg-white px-4 py-3 dark:bg-slate-900 md:hidden">
        <span className="truncate font-semibold text-slate-800 dark:text-slate-100">
          {NOME_SISTEMA}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <SeletorTema />
          <NotificacoesSino />
          <MenuContaUsuario
            nome={usuarioAtual?.nome}
            email={usuarioAtual?.email}
            perfil={usuarioAtual?.perfil}
            whatsapp={usuarioAtual?.whatsapp}
            avatarUrl={usuarioAtual?.avatarUrl || AVATAR_PADRAO_URL}
            mostrarNome={false}
            aoSalvarPerfil={salvarMeuPerfil}
            aoSair={() => {
              encerrarSessao()
              setMenuAberto(false)
            }}
          />
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            onClick={() => setMenuAberto(true)}
            aria-expanded={menuAberto}
          >
            Menu
          </button>
        </div>
      </header>

      {exibindoBusca && (
        <div className="border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900 md:hidden">
          <input
            type="search"
            placeholder="Buscar…"
            value={valorBusca}
            onChange={(e) => atualizarBusca(e.target.value)}
            className="h-[41px] w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-700 shadow-sm placeholder:text-slate-500 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
          />
        </div>
      )}

      {menuAberto && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Fechar menu"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r-2 border-r-[#F6F5F8] bg-white shadow-xl transition-transform dark:border-r-slate-700 dark:bg-slate-900 md:static md:z-0 md:translate-x-0 md:shadow-none md:overflow-x-hidden md:transition-[width] md:duration-200 md:ease-out ${
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarSoIcones ? 'md:w-[4.5rem]' : 'md:w-64'}`}
      >
        <div className="flex h-full flex-col">
        <div
          className={`flex h-14 min-w-0 w-full items-center justify-between gap-2 px-4 md:h-16 ${
            sidebarSoIcones ? 'md:justify-center md:px-2' : ''
          }`}
        >
          <img
            src="/LogoInovaca.svg"
            alt={NOME_SISTEMA}
            className={`h-7 min-w-0 max-w-[70%] object-contain object-left md:h-9 md:max-w-[11rem] ${
              sidebarSoIcones ? 'md:hidden' : ''
            }`}
            decoding="async"
          />
          <button
            type="button"
            className="shrink-0 text-slate-500 dark:text-slate-400 md:hidden"
            onClick={() => setMenuAberto(false)}
          >
            ✕
          </button>
          <button
            type="button"
            className={`hidden shrink-0 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 md:flex ${
              !sidebarSoIcones ? 'md:ml-auto' : ''
            }`}
            aria-expanded={!sidebarSoIcones}
            aria-label={sidebarSoIcones ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            title={sidebarSoIcones ? 'Expandir menu' : 'Recolher menu'}
            onClick={() => setSidebarSoIcones((v) => !v)}
          >
            {sidebarSoIcones ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            )}
          </button>
        </div>
        <nav
          className={`flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 ${sidebarSoIcones ? 'md:px-2 md:py-2' : ''}`}
          onClick={() => setMenuAberto(false)}
        >
          {links.map((l) => {
            const { Icon } = l
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={classeLinkNav(sidebarSoIcones)}
                end={l.to === '/admin/painel'}
                title={l.label}
              >
                <Icon />
                <span className={sidebarSoIcones ? 'md:sr-only' : ''}>{l.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div
          className={`border-t border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 ${
            sidebarSoIcones ? 'md:px-2 md:py-2' : ''
          }`}
        >
          <NavLink
            to={linkConfiguracoes.to}
            className={classeLinkNav(sidebarSoIcones)}
            title={linkConfiguracoes.label}
            onClick={() => setMenuAberto(false)}
          >
            <linkConfiguracoes.Icon />
            <span className={sidebarSoIcones ? 'md:sr-only' : ''}>{linkConfiguracoes.label}</span>
          </NavLink>
        </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center justify-between gap-4 bg-white px-6 py-3 dark:bg-slate-900 md:flex">
          <div className="min-w-0 flex-1">
            {exibindoBusca && (
              <input
                type="search"
                placeholder="Buscar…"
                value={valorBusca}
                onChange={(e) => atualizarBusca(e.target.value)}
                className="h-[41px] w-full max-w-md rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-700 shadow-sm placeholder:text-slate-500 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <SeletorTema />
            <NotificacoesSino />
            <MenuContaUsuario
              nome={usuarioAtual?.nome}
              email={usuarioAtual?.email}
              perfil={usuarioAtual?.perfil}
              whatsapp={usuarioAtual?.whatsapp}
              avatarUrl={usuarioAtual?.avatarUrl || AVATAR_PADRAO_URL}
              aoSalvarPerfil={salvarMeuPerfil}
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
