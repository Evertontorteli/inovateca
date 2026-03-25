import { useMemo } from 'react'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'
import { formatarDataHora } from '../../utilitarios/datas.js'

/** Criação (pelo usuário no catálogo) e gerenciamento administrativo das reservas. */
export default function ReservasAdmin() {
  const {
    estado,
    atenderReservaComEmprestimo,
    cancelarReserva,
  } = useBiblioteca()
  const { toast } = useToast()

  const linhas = useMemo(
    () =>
      [...estado.reservas].sort(
        (a, b) => new Date(b.criadaEm) - new Date(a.criadaEm),
      ),
    [estado.reservas],
  )

  function nomeLivro(id) {
    return estado.livros.find((l) => l.id === id)?.titulo || '—'
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

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <tr>
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
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Nenhuma reserva registrada.
                </td>
              </tr>
            )}
            {linhas.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
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
    </div>
  )
}
