import { useMemo } from 'react'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'
import { formatarData } from '../../utilitarios/datas.js'

/**
 * Registro de devolução: atualiza status do empréstimo e devolve exemplar ao acervo.
 * Gera alerta interno em caso de atraso.
 */
export default function DevolucaoAdmin() {
  const { estado, emprestimosComStatus, registrarDevolucao } = useBiblioteca()
  const { toast } = useToast()

  const ativos = useMemo(
    () => emprestimosComStatus.filter((e) => e.status === 'ativo'),
    [emprestimosComStatus],
  )

  function nomeLivro(id) {
    return estado.livros.find((l) => l.id === id)?.titulo || '—'
  }
  function nomeUsuario(id) {
    return estado.usuarios.find((u) => u.id === id)?.nome || '—'
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Devolução</h1>
      <p className="mt-1 text-slate-600">
        Confirme a entrega física do livro para liberar o exemplar e notificar o usuário.
      </p>

      <div className="mt-8 space-y-4">
        {ativos.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-4 py-8 text-center text-slate-500">
            Não há empréstimos aguardando devolução.
          </p>
        )}
        {ativos.map((e) => (
          <article
            key={e.id}
            className={`flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between ${
              e.atrasado
                ? 'border-amber-300 dark:border-amber-600/50'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <div>
              <p className="font-semibold text-slate-900">{nomeLivro(e.livroId)}</p>
              <p className="text-sm text-slate-600">{nomeUsuario(e.usuarioId)}</p>
              <p className="mt-1 text-xs text-slate-500">
                Previsto: {formatarData(e.dataPrevistaDevolucao)}
                {e.atrasado && (
                  <span className="ml-2 font-medium text-amber-800">• em atraso</span>
                )}
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
              onClick={() => {
                const r = registrarDevolucao(e.id)
                if (!r.ok) {
                  toast.erro(r.erro)
                  return
                }
                toast.success('Devolução registrada.')
              }}
            >
              Registrar devolução
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}
