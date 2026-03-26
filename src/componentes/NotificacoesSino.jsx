import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAutenticacao } from '../contextos/AutenticacaoContexto.jsx'
import { useBiblioteca } from '../contextos/BibliotecaContexto.jsx'
import { formatarDataHora } from '../utilitarios/datas.js'

/** Campainha com painel de alertas internos (reservas, empréstimos, atrasos). */
export function NotificacoesSino() {
  const { usuarioAtual } = useAutenticacao()
  const { estado, marcarNotificacaoLida, marcarTodasNotificacoesLidas } =
    useBiblioteca()
  const [aberto, setAberto] = useState(false)
  const painelRef = useRef(null)

  const lista = useMemo(
    () =>
      estado.notificacoes.filter((n) => n.usuarioId === usuarioAtual?.id),
    [estado.notificacoes, usuarioAtual?.id],
  )

  const naoLidas = lista.filter((n) => !n.lida).length

  return (
    <div className="relative" ref={painelRef}>
      <button
        type="button"
        className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 md:p-2.5"
        aria-expanded={aberto}
        aria-label="Notificações"
        onClick={() => setAberto((v) => !v)}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {naoLidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-black/20 dark:bg-black/50 md:bg-transparent"
            aria-label="Fechar notificações"
            onClick={() => setAberto(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-600 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-slate-700">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Alertas
              </span>
              {naoLidas > 0 && (
                <button
                  type="button"
                  className="text-xs text-brand hover:underline"
                  onClick={() => {
                    marcarTodasNotificacoesLidas(usuarioAtual.id)
                  }}
                >
                  Marcar todas lidas
                </button>
              )}
            </div>
            <ul className="max-h-72 overflow-y-auto py-1">
              {lista.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  Nenhuma notificação.
                </li>
              )}
              {lista.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`w-full border-b border-slate-50 px-3 py-2.5 text-left text-sm last:border-0 transition-colors hover:bg-brand/10 dark:border-slate-800 dark:hover:bg-brand/20 ${
                      n.lida
                        ? 'bg-white dark:bg-slate-900'
                        : 'bg-slate-200/80 dark:bg-slate-800/70'
                    }`}
                    onClick={() => {
                      if (!n.lida) marcarNotificacaoLida(n.id)
                    }}
                  >
                    <p className="font-medium text-slate-800 dark:text-slate-100">{n.titulo}</p>
                    <p className="mt-0.5 text-slate-600 dark:text-slate-300">{n.mensagem}</p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      {formatarDataHora(n.criadaEm)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 px-3 py-2 dark:border-slate-700">
              <Link
                to={
                  usuarioAtual?.perfil === 'admin'
                    ? '/admin/configuracoes?aba=notificacoes'
                    : '/app/notificacoes'
                }
                className="text-xs font-medium text-brand hover:underline"
                onClick={() => setAberto(false)}
              >
                Ver todas
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
