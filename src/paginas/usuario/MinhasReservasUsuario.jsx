import { useMemo } from 'react'
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.jsx'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'
import { formatarDataHora } from '../../utilitarios/datas.js'
import { NOME_SISTEMA } from '../../utilitarios/marca.js'

/** Acompanhamento das reservas do usuário logado. */
export default function MinhasReservasUsuario() {
  const { usuarioAtual } = useAutenticacao()
  const { estado, cancelarReserva } = useBiblioteca()
  const { toast } = useToast()

  const minhas = useMemo(
    () =>
      estado.reservas
        .filter((r) => r.usuarioId === usuarioAtual?.id)
        .sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm)),
    [estado.reservas, usuarioAtual?.id],
  )

  function tituloLivro(id) {
    return estado.livros.find((l) => l.id === id)?.titulo || '—'
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Minhas reservas</h1>
      <p className="mt-1 text-slate-600">
        Acompanhe o status até a retirada na {NOME_SISTEMA}.
      </p>

      <ul className="mt-8 space-y-3">
        {minhas.length === 0 && (
          <li className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-4 py-8 text-center text-slate-500">
            Você não possui reservas.
          </li>
        )}
        {minhas.map((r) => (
          <li
            key={r.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-slate-900">{tituloLivro(r.livroId)}</p>
              <p className="text-sm text-slate-500">{formatarDataHora(r.criadaEm)}</p>
              <p className="mt-1 text-sm capitalize text-slate-700">Status: {r.status}</p>
            </div>
            {r.status === 'ativa' && (
              <button
                type="button"
                className="botao-formulario-secundario px-3 py-2 text-sm"
                onClick={() => {
                  cancelarReserva(r.id)
                  toast.info('Reserva cancelada.')
                }}
              >
                Cancelar reserva
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
