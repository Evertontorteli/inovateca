import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'
import { formatarData } from '../../utilitarios/datas.js'

const ITENS_POR_PAGINA = 20

/**
 * Registro de devolução: atualiza status do empréstimo e devolve exemplar ao acervo.
 * Gera alerta interno em caso de atraso.
 */
export default function DevolucaoAdmin() {
  const { estado, emprestimosComStatus, registrarDevolucao } = useBiblioteca()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const busca = (searchParams.get('q') || '').toLowerCase().trim()

  const ativos = useMemo(() => {
    const base = emprestimosComStatus.filter((e) => e.status === 'ativo')
    if (!busca) return base
    return base.filter((e) => {
      const livroInfo = estado.livros.find((l) => l.id === e.livroId)
      const livro = livroInfo?.titulo || '—'
      const isbn = livroInfo?.isbn || ''
      const user =
        estado.usuarios.find((u) => u.id === e.usuarioId)?.nome || '—'
      return [livro, isbn, user].join(' ').toLowerCase().includes(busca)
    })
  }, [emprestimosComStatus, estado.livros, estado.usuarios, busca])

  const totalAtivos = useMemo(
    () => emprestimosComStatus.filter((e) => e.status === 'ativo').length,
    [emprestimosComStatus],
  )

  const [paginaAtual, setPaginaAtual] = useState(1)
  const totalPaginas = Math.max(1, Math.ceil(ativos.length / ITENS_POR_PAGINA))
  const pagina = Math.min(paginaAtual, totalPaginas)
  const inicioLista = (pagina - 1) * ITENS_POR_PAGINA
  const ativosPaginados = ativos.slice(inicioLista, inicioLista + ITENS_POR_PAGINA)

  useEffect(() => {
    setPaginaAtual((p) => Math.min(p, totalPaginas))
  }, [totalPaginas])

  useEffect(() => {
    setPaginaAtual(1)
  }, [busca])

  function nomeLivro(id) {
    return estado.livros.find((l) => l.id === id)?.titulo || '—'
  }
  function capaLivro(id) {
    return estado.livros.find((l) => l.id === id)?.capaUrl || ''
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

      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        {totalAtivos} aguardando devolução
      </p>

      <div className="mt-8 space-y-4">
        {ativos.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-4 py-8 text-center text-slate-500">
            {totalAtivos === 0
              ? 'Não há empréstimos aguardando devolução.'
              : 'Nenhum empréstimo encontrado para a busca.'}
          </p>
        )}
        {ativosPaginados.map((e) => (
          <article
            key={e.id}
            className={`flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between ${
              e.atrasado
                ? 'border-amber-300 dark:border-amber-600/50'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="h-20 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-600">
                {capaLivro(e.livroId) ? (
                  <img
                    src={capaLivro(e.livroId)}
                    alt={`Capa: ${nomeLivro(e.livroId)}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-slate-400 dark:text-slate-500">
                    Sem capa
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {nomeLivro(e.livroId)}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {nomeUsuario(e.usuarioId)}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Previsto: {formatarData(e.dataPrevistaDevolucao)}
                  {e.atrasado && (
                    <span className="ml-2 font-medium text-amber-800 dark:text-amber-300">
                      • em atraso
                    </span>
                  )}
                </p>
              </div>
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

      {ativos.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Página {pagina} de {totalPaginas}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
