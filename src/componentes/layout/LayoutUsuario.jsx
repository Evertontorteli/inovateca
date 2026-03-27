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

const CHAVE_SIDEBAR_ICONES_USUARIO = 'inovateca_sidebar_usuario_icones_v1'

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
]

const linkNotificacoes = {
  to: '/app/notificacoes',
  label: 'Notificações',
  Icon: IconeNotificacoes,
}

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-[#F2F9FB] text-[#0084E1] dark:bg-slate-800 dark:text-sky-400'
      : 'text-[#5A5D5C] hover:bg-[#F2F9FB] hover:text-[#0084E1] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400'
  }`

/** Área do leitor: autoatendimento e acompanhamento pessoal (responsivo). */
export function LayoutUsuario() {
  const { usuarioAtual, logout } = useAutenticacao()
  const { salvarUsuario } = useBiblioteca()
  const { toast } = useToast()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [menuAberto, setMenuAberto] = useState(false)
  /** No desktop (md+): menu só com ícones; no mobile o drawer permanece largura completa. */
  const [sidebarSoIcones, setSidebarSoIcones] = useState(() => {
    try {
      return localStorage.getItem(CHAVE_SIDEBAR_ICONES_USUARIO) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_SIDEBAR_ICONES_USUARIO, sidebarSoIcones ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [sidebarSoIcones])

  function encerrarSessao() {
    toast.info('Sessão encerrada.')
    logout()
  }

  function salvarMeuPerfil({ nome, whatsapp, avatarUrl, senhaNova }) {
    if (!usuarioAtual?.id) return
    const alterouSenha = Boolean(senhaNova && senhaNova.length >= 4)
    salvarUsuario({
      id: usuarioAtual.id,
      nome,
      email: usuarioAtual.email,
      perfil: usuarioAtual.perfil,
      avatarUrl: avatarUrl ?? usuarioAtual.avatarUrl,
      whatsapp,
      ...(alterouSenha ? { senha: senhaNova } : {}),
    })
    if (alterouSenha) {
      toast.info(
        'Sua senha foi alterada. Você será desconectado em 8 segundos. Faça login novamente com a nova senha.',
        8000,
      )
      window.setTimeout(() => {
        logout()
      }, 8000)
      return
    }
    toast.success('Perfil atualizado.')
  }

  const rotasComBusca = ['/app/catalogo', '/app/minhas-reservas', '/app/meus-emprestimos']
  const exibindoBusca = rotasComBusca.some((rota) =>
    location.pathname.startsWith(rota),
  )
  const valorBuscaCatalogo = searchParams.get('q') || ''

  function atualizarBuscaCatalogo(valor) {
    const next = new URLSearchParams(searchParams)
    if (valor.trim()) next.set('q', valor)
    else next.delete('q')
    setSearchParams(next, { replace: true })
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
        className={`fixed inset-y-0 left-0 z-50 w-60 transform border-r border-slate-200 bg-white shadow-xl transition-transform dark:border-slate-700 dark:bg-slate-900 md:static md:translate-x-0 md:shadow-none md:overflow-x-hidden md:transition-[width] md:duration-200 md:ease-out ${
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarSoIcones ? 'md:w-[4.5rem]' : 'md:w-60'}`}
      >
        <div className="flex h-full flex-col">
          <div className={`flex h-14 items-center gap-2 border-b border-slate-100 px-4 dark:border-slate-700 ${sidebarSoIcones ? 'md:justify-center md:px-2' : ''}`}>
            <img
              src="/LogoInovaca.svg"
              alt={NOME_SISTEMA}
              className={`h-7 max-w-[10rem] object-contain object-left ${sidebarSoIcones ? 'md:hidden' : ''}`}
              decoding="async"
            />
            <button
              type="button"
              className="ml-auto md:hidden"
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
          <nav className={`flex flex-1 flex-col p-3 ${sidebarSoIcones ? 'md:px-2 md:py-2' : ''}`} onClick={() => setMenuAberto(false)}>
            {links.map((l) => {
              const { Icon } = l
              return (
                <NavLink key={l.to} to={l.to} className={linkClass} title={l.label}>
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
              to={linkNotificacoes.to}
              className={linkClass}
              title={linkNotificacoes.label}
              onClick={() => setMenuAberto(false)}
            >
              <linkNotificacoes.Icon />
              <span className={sidebarSoIcones ? 'md:sr-only' : ''}>{linkNotificacoes.label}</span>
            </NavLink>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center justify-between bg-white px-6 py-3 dark:bg-slate-900 md:flex">
          <div className="min-w-0 flex-1">
            {exibindoBusca && (
              <input
                type="search"
                placeholder="Buscar…"
                value={valorBuscaCatalogo}
                onChange={(e) => atualizarBuscaCatalogo(e.target.value)}
                className="h-[41px] w-full max-w-md rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-700 shadow-sm placeholder:text-slate-500 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
            )}
          </div>
          <div className="ml-4 flex items-center gap-3">
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
