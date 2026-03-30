import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'
import { formatarDataHora } from '../../utilitarios/datas.js'

const ITENS_POR_PAGINA = 20

/** Criação (pelo usuário no catálogo) e gerenciamento administrativo das reservas. */
export default function ReservasAdmin() {
  const {
    estado,
    atenderReservaComEmprestimo,
    cancelarReserva,
  } = useBiblioteca()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const busca = (searchParams.get('q') || '').toLowerCase().trim()

  const linhas = useMemo(() => {
    const sorted = [...estado.reservas].sort(
      (a, b) => new Date(b.criadaEm) - new Date(a.criadaEm),
    )
    if (!busca) return sorted
    return sorted.filter((r) => {
      const livro =
        estado.livros.find((l) => l.id === r.livroId)?.titulo || '—'
      const user =
        estado.usuarios.find((u) => u.id === r.usuarioId)?.nome || '—'
      return [livro, user, r.status].join(' ').toLowerCase().includes(busca)
    })
  }, [estado.reservas, estado.livros, estado.usuarios, busca])

  const [paginaAtual, setPaginaAtual] = useState(1)
  const totalPaginas = Math.max(1, Math.ceil(linhas.length / ITENS_POR_PAGINA))
  const pagina = Math.min(paginaAtual, totalPaginas)
  const inicioLista = (pagina - 1) * ITENS_POR_PAGINA
  const linhasPaginadas = linhas.slice(inicioLista, inicioLista + ITENS_POR_PAGINA)

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
      <h1 className="text-2xl font-semibold text-slate-900">Reservas</h1>
      <p className="mt-1 text-slate-600">
        Fila de interesse no acervo. Ao atender, gera empréstimo e baixa um exemplar.
      </p>

      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        {estado.reservas.length} reservas cadastradas
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="w-[5.5rem] px-4 py-3 font-medium">Capa</th>
              <th className="px-4 py-3 font-medium">Livro</th>
              <th className="px-4 py-3 font-medium">Usuário</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Quando</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  {estado.reservas.length === 0
                    ? 'Nenhuma reserva registrada.'
                    : 'Nenhuma reserva encontrada para a busca.'}
                </td>
              </tr>
            )}
            {linhasPaginadas.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="px-4 py-3 align-middle">
                  {capaLivro(r.livroId) ? (
                    <img
                      src={capaLivro(r.livroId)}
                      alt={`Capa: ${nomeLivro(r.livroId)}`}
                      className="h-20 w-14 shrink-0 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-600"
                    />
                  ) : (
                    <div className="flex h-20 w-14 items-center justify-center rounded-md bg-slate-100 px-1 text-center text-[10px] text-slate-400 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-600">
                      Sem capa
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{nomeLivro(r.livroId)}</td>
                <td className="px-4 py-3 text-slate-600">{nomeUsuario(r.usuarioId)}</td>
                <td className="px-4 py-3 capitalize">
                  <span
                    className={
                      r.status === 'ativa'
                        ? 'rounded-full bg-amber-100 px-2 py-0.5 text-amber-900'
                        : 'text-slate-600'
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-slate-500 lg:table-cell">
                  {formatarDataHora(r.criadaEm)}
                </td>
                <td className="px-4 py-3">
                  {r.status === 'ativa' && (
                    <>
                      <button
                        type="button"
                        className="text-brand hover:underline"
                        onClick={() => {
                          const res = atenderReservaComEmprestimo(r.id)
                          if (!res.ok) {
                            toast.erro(res.erro)
                            return
                          }
                          toast.success('Reserva atendida e empréstimo registrado.')
                        }}
                      >
                        Atender (emprestar)
                      </button>
                      <button
                        type="button"
                        className="ml-2 text-slate-600 hover:underline"
                        onClick={() => {
                          cancelarReserva(r.id)
                          toast.info('Reserva cancelada.')
                        }}
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {linhas.length > 0 && (
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
