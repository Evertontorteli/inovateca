import { useState } from 'react'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'

/** CRUD de categorias para organização do catálogo. */
export default function CategoriasAdmin() {
  const { estado, salvarCategoria, excluirCategoria } = useBiblioteca()
  const { toast } = useToast()
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [editandoId, setEditandoId] = useState(null)

  function aoSalvar(e) {
    e.preventDefault()
    salvarCategoria({ id: editandoId, nome, descricao })
    toast.success(editandoId ? 'Categoria atualizada.' : 'Categoria adicionada.')
    setNome('')
    setDescricao('')
    setEditandoId(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Categorias</h1>
      <p className="mt-1 text-slate-600">Classificação temática dos livros.</p>

      <form
        className="mt-8 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4 md:flex-row md:items-end md:p-6"
        onSubmit={aoSalvar}
      >
        <div className="flex-1">
          <label className="text-sm font-medium text-slate-700">Nome</label>
          <input
            required
            className="campo-formulario mt-1"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-slate-700">Descrição</label>
          <input
            className="campo-formulario mt-1"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          {editandoId ? 'Atualizar' : 'Adicionar'}
        </button>
        {editandoId && (
          <button
            type="button"
            className="rounded-lg border px-4 py-2.5 text-sm"
            onClick={() => {
              setEditandoId(null)
              setNome('')
              setDescricao('')
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      <ul className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        {estado.categorias.map((c) => (
          <li
            key={c.id}
            className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-slate-900">{c.nome}</p>
              <p className="text-sm text-slate-600">{c.descricao || '—'}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="text-sm text-brand hover:underline"
                onClick={() => {
                  setEditandoId(c.id)
                  setNome(c.nome)
                  setDescricao(c.descricao || '')
                }}
              >
                Editar
              </button>
              <button
                type="button"
                className="text-sm text-rose-600 hover:underline"
                onClick={() => {
                  excluirCategoria(c.id)
                  toast.success('Categoria removida.')
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
