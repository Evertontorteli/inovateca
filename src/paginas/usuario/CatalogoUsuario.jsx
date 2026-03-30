import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.jsx'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'

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

/** Consulta ao catálogo e reserva de exemplares (autoatendimento). */
export default function CatalogoUsuario() {
  const { usuarioAtual } = useAutenticacao()
  const { livrosComDetalhes, criarReserva, avaliarLivro, removerAvaliacaoLivro } = useBiblioteca()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const busca = (searchParams.get('q') || '').toLowerCase()
  const [filtroLetra, setFiltroLetra] = useState('todos')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroAutor, setFiltroAutor] = useState('todos')
  const [somenteDisponiveis, setSomenteDisponiveis] = useState(false)
  const [modalFiltro, setModalFiltro] = useState(null)
  const [paginaAtual, setPaginaAtual] = useState(1)

  const categoriasFiltro = Array.from(
    new Set(livrosComDetalhes.map((l) => l.categoria?.nome).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b))

  const autoresFiltro = Array.from(
    new Set(
      livrosComDetalhes.flatMap((l) => l.autores.map((a) => a.nome).filter(Boolean)),
    ),
  ).sort((a, b) => a.localeCompare(b))

  const filtrados = livrosComDetalhes.filter((l) => {
    const passaBusca =
      l.titulo.toLowerCase().includes(busca) ||
      l.autores.some((a) => a.nome.toLowerCase().includes(busca))
    const passaLetra =
      filtroLetra === 'todos' ||
      l.titulo.toLowerCase().startsWith(filtroLetra.toLowerCase())
    const passaCategoria =
      filtroCategoria === 'todas' || l.categoria?.nome === filtroCategoria
    const passaAutor =
      filtroAutor === 'todos' || l.autores.some((a) => a.nome === filtroAutor)
    const passaDisponiveis = !somenteDisponiveis || l.exemplaresDisponiveis > 0
    return (
      passaBusca &&
      passaLetra &&
      passaCategoria &&
      passaAutor &&
      passaDisponiveis
    )
  })
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA))
  const pagina = Math.min(paginaAtual, totalPaginas)
  const inicio = (pagina - 1) * ITENS_POR_PAGINA
  const livrosPaginados = filtrados.slice(inicio, inicio + ITENS_POR_PAGINA)

  useEffect(() => {
    setPaginaAtual(1)
  }, [busca, filtroLetra, filtroCategoria, filtroAutor, somenteDisponiveis])

  function reservar(livroId) {
    const r = criarReserva(usuarioAtual.id, livroId)
    if (!r.ok) {
      toast.erro(r.erro)
      return
    }
    toast.success('Reserva registrada.')
  }

  function avaliar(livroId, nota, notaAtual) {
    const r =
      notaAtual === nota
        ? removerAvaliacaoLivro(usuarioAtual.id, livroId)
        : avaliarLivro(usuarioAtual.id, livroId, nota)
    if (!r.ok) {
      toast.erro(r.erro)
      return
    }
    if (notaAtual === nota) {
      toast.info('Sua avaliação foi removida.')
      return
    }
    toast.success(`Avaliação registrada: ${nota}/5`)
  }

  function fecharModalFiltro() {
    setModalFiltro(null)
  }

  function tituloModalFiltro() {
    if (modalFiltro === 'letra') return 'Selecionar letra'
    if (modalFiltro === 'categoria') return 'Selecionar categoria'
    if (modalFiltro === 'autor') return 'Selecionar autor'
    if (modalFiltro === 'disponiveis') return 'Selecionar disponibilidade'
    return ''
  }

  function opcoesModalFiltro() {
    if (modalFiltro === 'letra') {
      return [
        { id: 'todos', label: 'Todas', ativo: filtroLetra === 'todos', onClick: () => setFiltroLetra('todos') },
        ...['a', 'b', 'c', 'd'].map((letra) => ({
          id: letra,
          label: letra.toUpperCase(),
          ativo: filtroLetra === letra,
          onClick: () => setFiltroLetra(letra),
        })),
      ]
    }
    if (modalFiltro === 'categoria') {
      return [
        { id: 'todas', label: 'Todas', ativo: filtroCategoria === 'todas', onClick: () => setFiltroCategoria('todas') },
        ...categoriasFiltro.map((c) => ({
          id: c,
          label: c,
          ativo: filtroCategoria === c,
          onClick: () => setFiltroCategoria(c),
        })),
      ]
    }
    if (modalFiltro === 'autor') {
      return [
        { id: 'todos', label: 'Todos', ativo: filtroAutor === 'todos', onClick: () => setFiltroAutor('todos') },
        ...autoresFiltro.map((a) => ({
          id: a,
          label: a,
          ativo: filtroAutor === a,
          onClick: () => setFiltroAutor(a),
        })),
      ]
    }
    if (modalFiltro === 'disponiveis') {
      return [
        {
          id: 'todos',
          label: 'Todos os livros',
          ativo: !somenteDisponiveis,
          onClick: () => setSomenteDisponiveis(false),
        },
        {
          id: 'somente',
          label: 'Somente disponíveis',
          ativo: somenteDisponiveis,
          onClick: () => setSomenteDisponiveis(true),
        },
      ]
    }
    return []
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Catálogo</h1>
      <p className="mt-1 text-slate-600">
        Busque por título ou autor e reserve quando houver exemplar disponível.
      </p>
      <div className="mt-4 overflow-x-auto">
        <div className="flex min-w-max items-center gap-2 pb-1">
          <button
            type="button"
            onClick={() => setModalFiltro('letra')}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-normal text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            Letra: {filtroLetra === 'todos' ? 'Todas' : filtroLetra.toUpperCase()}
          </button>
          <button
            type="button"
            onClick={() => setModalFiltro('categoria')}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-normal text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            Categoria: {filtroCategoria === 'todas' ? 'Todas' : filtroCategoria}
          </button>
          <button
            type="button"
            onClick={() => setModalFiltro('autor')}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-normal text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            Autor: {filtroAutor === 'todos' ? 'Todos' : filtroAutor}
          </button>
          <button
            type="button"
            onClick={() => setModalFiltro('disponiveis')}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-normal text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            Disponíveis: {somenteDisponiveis ? 'Somente disponíveis' : 'Todos os livros'}
          </button>
        </div>
      </div>

      {modalFiltro && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60"
            aria-label="Fechar filtro"
            onClick={fecharModalFiltro}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-600 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {tituloModalFiltro()}
              </h3>
              <button
                type="button"
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                onClick={fecharModalFiltro}
                aria-label="Fechar"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {opcoesModalFiltro().map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => {
                    op.onClick()
                    setPaginaAtual(1)
                    fecharModalFiltro()
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    op.ativo
                      ? 'bg-[#F2F9FB] text-[#0084E1] dark:bg-slate-800 dark:text-sky-400'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        {livrosComDetalhes.length} catálogos cadastrados
      </p>

      <ul className="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {livrosPaginados.map((l) => (
          <li
            key={l.id}
            className="mx-auto flex w-full max-w-[15.5rem] flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-900"
          >
            <div className="aspect-[2/3] max-h-44 w-full shrink-0 bg-slate-100 dark:bg-slate-800">
              {l.capaUrl ? (
                <img
                  src={l.capaUrl}
                  alt={`Capa: ${l.titulo}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-xs text-slate-400 dark:text-slate-500">
                  Sem capa
                </div>
              )}
            </div>
            <div className="flex flex-col p-3">
              <h2 className="text-lg font-normal text-slate-900 dark:text-slate-100">{l.titulo}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {l.autores.map((a) => a.nome).join(', ') || 'Autor não informado'}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                {l.categoria?.nome} · {l.ano}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {l.exemplaresDisponiveis}
                  </span>{' '}
                  disponíveis de {l.exemplaresTotal}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    l.exemplaresDisponiveis > 0
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                  }`}
                >
                  {l.exemplaresDisponiveis > 0 ? 'Disponível' : 'Indisponível'}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Média: {l.totalAvaliacoes ? l.mediaAvaliacao.toFixed(1) : '—'} ({l.totalAvaliacoes || 0})
              </p>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((nota) => {
                  const minhaNota =
                    l.avaliacoes?.find((a) => a.usuarioId === usuarioAtual?.id)?.nota || 0
                  return (
                    <button
                      key={nota}
                      type="button"
                      title={`Avaliar com ${nota} estrela${nota > 1 ? 's' : ''}`}
                      aria-label={`Avaliar com ${nota} estrela${nota > 1 ? 's' : ''}`}
                      className="rounded p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => avaliar(l.id, nota, minhaNota)}
                    >
                      <IconeEstrela ativa={nota <= minhaNota} />
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                disabled={l.exemplaresDisponiveis < 1}
                className="mt-4 rounded-lg bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-600"
                onClick={() => reservar(l.id)}
              >
                {l.exemplaresDisponiveis > 0 ? 'Reservar' : 'Indisponível'}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {filtrados.length > 0 && (
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
