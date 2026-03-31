import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.jsx'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'
import { formatarDataHora } from '../../utilitarios/datas.js'
import { NOME_SISTEMA } from '../../utilitarios/marca.js'

const ITENS_POR_PAGINA = 20

function IconeEstrela({ ativa }) {
  return (
    <svg
      className={`h-4 w-4 ${ativa ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-300 dark:text-slate-600'}`}
      viewBox="0 0 20 20"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden
    >
      <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.18 3.63a1 1 0 00.95.69h3.82c.96 0 1.36 1.23.58 1.8l-3.09 2.25a1 1 0 00-.37 1.12l1.18 3.63c.3.92-.76 1.69-1.54 1.12l-3.09-2.25a1 1 0 00-1.18 0l-3.09 2.25c-.78.57-1.84-.2-1.54-1.12l1.18-3.63a1 1 0 00-.37-1.12L2.5 9.05c-.78-.57-.38-1.8.58-1.8H6.9a1 1 0 00.95-.69l1.18-3.63z" />
    </svg>
  )
}

/** Acompanhamento das reservas do usuário logado. */
export default function MinhasReservasUsuario() {
  const { usuarioAtual } = useAutenticacao()
  const { estado, livrosComDetalhes, cancelarReserva } = useBiblioteca()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const busca = (searchParams.get('q') || '').toLowerCase().trim()
  const [paginaAtual, setPaginaAtual] = useState(1)

  const minhas = useMemo(
    () =>
      estado.reservas
        .filter((r) => r.usuarioId === usuarioAtual?.id)
        .sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm)),
    [estado.reservas, usuarioAtual?.id],
  )

  function dadosLivro(id) {
    const livro = livrosComDetalhes.find((l) => l.id === id)
    if (!livro) {
      return {
        titulo: '—',
        capaUrl: '',
        autores: 'Autor não informado',
        genero: 'Gênero não informado',
        mediaAvaliacao: 0,
        totalAvaliacoes: 0,
      }
    }
    return {
      titulo: livro.titulo,
      capaUrl: livro.capaUrl || '',
      autores: livro.autores.map((a) => a.nome).join(', ') || 'Autor não informado',
      genero: livro.categoria?.nome || 'Gênero não informado',
      mediaAvaliacao: livro.mediaAvaliacao || 0,
      totalAvaliacoes: livro.totalAvaliacoes || 0,
    }
  }

  const filtradas = useMemo(() => {
    if (!busca) return minhas
    return minhas.filter((r) => {
      const livro = dadosLivro(r.livroId)
      const termos = [livro.titulo, livro.autores, livro.genero].join(' ').toLowerCase()
      return termos.includes(busca)
    })
  }, [busca, minhas])
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / ITENS_POR_PAGINA))
  const pagina = Math.min(paginaAtual, totalPaginas)
  const inicio = (pagina - 1) * ITENS_POR_PAGINA
  const reservasPaginadas = filtradas.slice(inicio, inicio + ITENS_POR_PAGINA)

  useEffect(() => {
    setPaginaAtual(1)
  }, [busca])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Minhas reservas</h1>
      <p className="mt-1 text-slate-600">
        Acompanhe o status até a retirada na {NOME_SISTEMA}.
      </p>

      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        {minhas.length} reservas cadastradas
      </p>

      <ul className="mt-8 space-y-3">
        {filtradas.length === 0 && (
          <li className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-4 py-8 text-center text-slate-500">
            {busca ? 'Nenhuma reserva encontrada para a busca.' : 'Você não possui reservas.'}
          </li>
        )}
        {reservasPaginadas.map((r) => {
          const livro = dadosLivro(r.livroId)
          return (
            <li
              key={r.id}
              className="relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
            >
              <span
                className={`absolute right-4 top-4 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                  r.status === 'ativa'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : r.status === 'fila'
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                    : r.status === 'cancelada'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                      : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
                }`}
              >
                {r.status}
              </span>
              <div className="flex items-start gap-3">
                <div className="h-28 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800 sm:h-32 sm:w-24">
                  {livro.capaUrl ? (
                    <img
                      src={livro.capaUrl}
                      alt={`Capa: ${livro.titulo}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] text-slate-400 dark:text-slate-500">
                      Sem capa
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {livro.titulo}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {livro.autores}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Gênero: {livro.genero}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Média: {livro.totalAvaliacoes ? livro.mediaAvaliacao.toFixed(1) : '—'} ({livro.totalAvaliacoes})
                  </p>
                  <div className="mt-1 flex items-center gap-1" aria-label="Avaliação média do livro">
                    {[1, 2, 3, 4, 5].map((nota) => (
                      <IconeEstrela key={nota} ativa={nota <= Math.round(livro.mediaAvaliacao)} />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {formatarDataHora(r.criadaEm)}
                  </p>
                </div>
              </div>
              {(r.status === 'ativa' || r.status === 'fila') && (
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
          )
        })}
      </ul>
      {filtradas.length > 0 && (
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
