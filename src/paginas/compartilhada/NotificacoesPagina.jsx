import { useAutenticacao } from '../../contextos/AutenticacaoContexto.jsx'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'
import { formatarDataHora } from '../../utilitarios/datas.js'

/** Lista completa de alertas internos (reservas, empréstimos, atrasos). */
export default function NotificacoesPagina() {
  const { usuarioAtual } = useAutenticacao()
  const { estado, marcarNotificacaoLida, marcarTodasNotificacoesLidas } =
    useBiblioteca()
  const { toast } = useToast()

  const lista = [...estado.notificacoes]
    .filter((n) => n.usuarioId === usuarioAtual?.id)
    .sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm))

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notificações</h1>
          <p className="mt-1 text-slate-600">
            Alertas sobre reservas, empréstimos e ocorrências de prazo.
          </p>
        </div>
        <button
          type="button"
          className="botao-formulario-secundario font-semibold"
          onClick={() => {
            if (!usuarioAtual?.id) return
            marcarTodasNotificacoesLidas(usuarioAtual.id)
            toast.success('Notificações marcadas como lidas.')
          }}
        >
          Marcar todas como lidas
        </button>
      </div>

      <ul className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        {lista.length === 0 && (
          <li className="px-4 py-12 text-center text-slate-500">Nada por aqui.</li>
        )}
        {lista.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              className={`flex w-full flex-col gap-1 px-4 py-4 text-left transition-colors hover:bg-brand/10 dark:hover:bg-brand/20 ${
                n.lida
                  ? 'bg-white dark:bg-slate-900'
                  : 'bg-slate-200/80 dark:bg-slate-800/70'
              }`}
              onClick={() => {
                if (!n.lida) marcarNotificacaoLida(n.id)
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-900 dark:text-slate-100">{n.titulo}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    n.lida
                      ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                      : 'bg-brand/15 text-[#0084E1] dark:bg-sky-900/50 dark:text-sky-300'
                  }`}
                >
                  {n.lida ? 'Lida' : 'Não lida'}
                </span>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300">{n.mensagem}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{formatarDataHora(n.criadaEm)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
