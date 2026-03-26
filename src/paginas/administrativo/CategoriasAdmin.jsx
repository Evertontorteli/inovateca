import { useCallback, useEffect, useState } from 'react'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'

/** CRUD de categorias para organização do catálogo. */
export default function CategoriasAdmin() {
  const { estado, salvarCategoria, excluirCategoria } = useBiblioteca()
  const { toast } = useToast()
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)

  function aoSalvar(e) {
    e.preventDefault()
    salvarCategoria({ id: editandoId, nome, descricao })
    toast.success(editandoId ? 'Categoria atualizada.' : 'Categoria adicionada.')
    fecharModal()
  }

  const fecharModal = useCallback(() => {
    setModalAberto(false)
    setEditandoId(null)
    setNome('')
    setDescricao('')
  }, [])

  function abrirNovo() {
    setEditandoId(null)
    setNome('')
    setDescricao('')
    setModalAberto(true)
  }

  function abrirEditar(c) {
    setEditandoId(c.id)
    setNome(c.nome)
    setDescricao(c.descricao || '')
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

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Categorias</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Classificação temática dos livros.</p>
        </div>
        <button
          type="button"
          onClick={abrirNovo}
          className="shrink-0 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Nova categoria
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
            aria-labelledby="modal-categoria-titulo"
            className="relative z-10 flex max-h-[min(92vh,520px)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-900"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <h2
                id="modal-categoria-titulo"
                className="text-lg font-medium text-slate-900 dark:text-slate-100"
              >
                {editandoId ? 'Editar categoria' : 'Nova categoria'}
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
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
                  <input
                    className="campo-formulario mt-1.5"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
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

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Descrição</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {estado.categorias.map((c) => (
              <tr key={c.id} className="dark:text-slate-200">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{c.nome}</td>
                <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-400 md:table-cell">
                  {c.descricao || '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-brand hover:bg-brand/10"
                    title="Editar categoria"
                    aria-label="Editar categoria"
                    onClick={() => abrirEditar(c)}
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
                    title="Excluir categoria"
                    aria-label="Excluir categoria"
                    onClick={() => {
                      excluirCategoria(c.id)
                      toast.success('Categoria removida.')
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
    </div>
  )
}
