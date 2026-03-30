import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'

const ITENS_POR_PAGINA = 20

/** Cadastro de autores vinculável aos livros. */
export default function AutoresAdmin() {
  const { estado, salvarAutor, excluirAutor } = useBiblioteca()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const busca = (searchParams.get('q') || '').toLowerCase().trim()
  const autoresFiltrados = useMemo(() => {
    if (!busca) return estado.autores
    return estado.autores.filter((a) => a.nome.toLowerCase().includes(busca))
  }, [estado.autores, busca])
  const [nome, setNome] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [paginaAtual, setPaginaAtual] = useState(1)

  const totalPaginas = Math.max(1, Math.ceil(autoresFiltrados.length / ITENS_POR_PAGINA))
  const pagina = Math.min(paginaAtual, totalPaginas)
  const inicioLista = (pagina - 1) * ITENS_POR_PAGINA
  const autoresPaginados = autoresFiltrados.slice(inicioLista, inicioLista + ITENS_POR_PAGINA)

  function aoSalvar(e) {
    e.preventDefault()
    salvarAutor({ id: editandoId, nome })
    toast.success(editandoId ? 'Autor atualizado.' : 'Autor adicionado.')
    fecharModal()
  }

  const fecharModal = useCallback(() => {
    setModalAberto(false)
    setEditandoId(null)
    setNome('')
  }, [])

  function abrirNovo() {
    setEditandoId(null)
    setNome('')
    setModalAberto(true)
  }

  function abrirEditar(a) {
    setEditandoId(a.id)
    setNome(a.nome)
    setModalAberto(true)
  }

  useEffect(() => {
    if (!modalAberto) return undefined
    document.body.style.overflow = 'hidden'
    function aoTecla(e) {
      if (e.key === 'Escape') fecharModal()
    }
    document.addEventListener('keydown', aoTecla)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', aoTecla)
    }
  }, [modalAberto, fecharModal])

  useEffect(() => {
    setPaginaAtual((p) => Math.min(p, totalPaginas))
  }, [totalPaginas])

  useEffect(() => {
    setPaginaAtual(1)
  }, [busca])

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Autores</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Base de autores para composição do acervo.</p>
        </div>
        <button
          type="button"
          onClick={abrirNovo}
          className="shrink-0 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Novo autor
        </button>
      </div>

      {modalAberto && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]"
            aria-label="Fechar"
            onClick={fecharModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-autor-titulo"
            className="relative z-10 flex max-h-[min(92vh,480px)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-900"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <h2
                id="modal-autor-titulo"
                className="text-lg font-medium text-slate-900 dark:text-slate-100"
              >
                {editandoId ? 'Editar autor' : 'Novo autor'}
              </h2>
              <button
                type="button"
                onClick={fecharModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Fechar modal"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form className="flex min-h-0 flex-1 flex-col overflow-y-auto" onSubmit={aoSalvar}>
              <div className="space-y-4 px-4 py-4 md:px-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
                  <input
                    required
                    className="campo-formulario mt-1.5"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-auto flex flex-wrap justify-end gap-2 border-t border-slate-200 px-4 py-4 dark:border-slate-700 md:px-6">
                <button type="button" className="botao-formulario-secundario" onClick={fecharModal}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        {estado.autores.length} autores cadastrados
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 font-medium">Autor</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {autoresFiltrados.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  {estado.autores.length === 0
                    ? 'Nenhum autor cadastrado.'
                    : 'Nenhum autor encontrado para a busca.'}
                </td>
              </tr>
            )}
            {autoresPaginados.map((a) => (
              <tr key={a.id} className="dark:text-slate-200">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  {a.nome}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-brand hover:bg-brand/10"
                    title="Editar autor"
                    aria-label="Editar autor"
                    onClick={() => abrirEditar(a)}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.586a2 2 0 112.828 2.828L11.828 14.828a2 2 0 01-.878.505l-3 1a.5.5 0 01-.632-.632l1-3a2 2 0 01.505-.878l8.763-8.763z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="ml-2 rounded-md p-1.5 text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-900/30"
                    title="Excluir autor"
                    aria-label="Excluir autor"
                    onClick={() => {
                      excluirAutor(a.id)
                      toast.success('Autor removido.')
                    }}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 7h12m-1 0-.867 12.142A2 2 0 0114.138 21H9.862a2 2 0 01-1.995-1.858L7 7m3 0V5a1 1 0 011-1h2a1 1 0 011 1v2"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {autoresFiltrados.length > 0 && (
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
