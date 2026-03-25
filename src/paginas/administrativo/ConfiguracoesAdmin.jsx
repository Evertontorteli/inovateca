import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.jsx'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'
import { formatarDataHora } from '../../utilitarios/datas.js'

/** Parâmetros de regras: prazo de empréstimo e limites de reserva. */
export default function ConfiguracoesAdmin() {
  const { usuarioAtual } = useAutenticacao()
  const {
    estado,
    atualizarConfiguracao,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
    reiniciarDadosDemo,
  } = useBiblioteca()
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const abaDaUrl = searchParams.get('aba')
  const abaInicial = abaDaUrl === 'notificacoes' ? 'notificacoes' : 'parametros'
  const [aba, setAba] = useState(abaInicial)
  const [prazoEmprestimoDias, setPrazoEmprestimoDias] = useState(
    estado.configuracao.prazoEmprestimoDias,
  )
  const [maxReservasPorUsuario, setMaxReservasPorUsuario] = useState(
    estado.configuracao.maxReservasPorUsuario,
  )

  const listaNotificacoes = useMemo(
    () =>
      [...estado.notificacoes]
        .filter((n) => n.usuarioId === usuarioAtual?.id)
        .sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm)),
    [estado.notificacoes, usuarioAtual?.id],
  )

  function trocarAba(proxima) {
    setAba(proxima)
    const next = new URLSearchParams(searchParams)
    if (proxima === 'notificacoes') next.set('aba', 'notificacoes')
    else next.delete('aba')
    setSearchParams(next, { replace: true })
  }

  function aoSalvar(e) {
    e.preventDefault()
    atualizarConfiguracao({
      prazoEmprestimoDias: Number(prazoEmprestimoDias),
      maxReservasPorUsuario: Number(maxReservasPorUsuario),
    })
    toast.success('Configurações salvas localmente (MVP).')
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Configurações</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Regras aplicadas aos novos empréstimos e às reservas no autoatendimento.
      </p>

      <div className="mt-6 border-b border-slate-200 dark:border-slate-800">
        <div className="-mb-px flex flex-wrap gap-6">
          <button
            type="button"
            className={`border-b-2 pb-1 text-sm font-semibold transition-colors ${
              aba === 'parametros'
                ? 'border-[#0084E1] text-[#0084E1] dark:border-sky-400 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            onClick={() => trocarAba('parametros')}
          >
            Parâmetros
          </button>
          <button
            type="button"
            className={`border-b-2 pb-1 text-sm font-semibold transition-colors ${
              aba === 'notificacoes'
                ? 'border-[#0084E1] text-[#0084E1] dark:border-sky-400 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            onClick={() => trocarAba('notificacoes')}
          >
            Notificações
          </button>
        </div>
      </div>

      {aba === 'parametros' && (
        <form
          className="mt-6 max-w-lg space-y-6 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-6 shadow-sm"
          onSubmit={aoSalvar}
        >
          <div>
            <label htmlFor="prazo" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Prazo padrão de empréstimo (dias)
            </label>
            <input
              id="prazo"
              type="number"
              min={1}
              max={90}
              required
              className="campo-formulario mt-1"
              value={prazoEmprestimoDias}
              onChange={(e) => setPrazoEmprestimoDias(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="maxRes" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Máximo de reservas ativas por usuário
            </label>
            <input
              id="maxRes"
              type="number"
              min={1}
              max={20}
              required
              className="campo-formulario mt-1"
              value={maxReservasPorUsuario}
              onChange={(e) => setMaxReservasPorUsuario(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Salvar parâmetros
          </button>

          <div className="pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Demonstração: reinicia os dados locais (usuários, livros, reservas e empréstimos) para o seed.
            </p>
            <button
              type="button"
              className="mt-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => {
                if (!confirm('Reiniciar demonstração? Isso apaga os dados locais atuais.')) return
                const inicial = reiniciarDadosDemo()
                setPrazoEmprestimoDias(inicial.configuracao.prazoEmprestimoDias)
                setMaxReservasPorUsuario(inicial.configuracao.maxReservasPorUsuario)
                toast.success('Demonstração reiniciada.')
              }}
            >
              Reiniciar demonstração
            </button>
          </div>
        </form>
      )}

      {aba === 'notificacoes' && (
        <div className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Notificações</h2>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
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

          <ul className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            {listaNotificacoes.length === 0 && (
              <li className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                Nada por aqui.
              </li>
            )}
            {listaNotificacoes.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  className={`flex w-full flex-col gap-1 px-4 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    n.lida ? 'opacity-70' : 'bg-brand/10 dark:bg-brand/20'
                  }`}
                  onClick={() => {
                    if (!n.lida) marcarNotificacaoLida(n.id)
                  }}
                >
                  <span className="font-medium text-slate-900 dark:text-slate-100">{n.titulo}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">{n.mensagem}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatarDataHora(n.criadaEm)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Dica: você também pode marcar como lida clicando na notificação pelo sino no topo.
          </p>
        </div>
      )}
    </div>
  )
}
