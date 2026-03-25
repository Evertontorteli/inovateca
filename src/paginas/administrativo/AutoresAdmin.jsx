import { useCallback, useEffect, useState } from 'react'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'

/** Cadastro de autores vinculável aos livros. */
export default function AutoresAdmin() {
  const { estado, salvarAutor, excluirAutor } = useBiblioteca()
  const { toast } = useToast()
  const [nome, setNome] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)

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

      <ul className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        {estado.autores.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="font-medium text-slate-900 dark:text-slate-100">{a.nome}</span>
            <div className="flex gap-3">
              <button
                type="button"
                className="text-sm text-brand hover:underline"
                onClick={() => abrirEditar(a)}
              >
                Editar
              </button>
              <button
                type="button"
                className="text-sm text-rose-600 hover:underline"
                onClick={() => {
                  excluirAutor(a.id)
                  toast.success('Autor removido.')
                }}
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
