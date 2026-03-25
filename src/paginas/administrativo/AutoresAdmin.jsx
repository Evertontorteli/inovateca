import { useState } from 'react'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'

/** Cadastro de autores vinculável aos livros. */
export default function AutoresAdmin() {
  const { estado, salvarAutor, excluirAutor } = useBiblioteca()
  const { toast } = useToast()
  const [nome, setNome] = useState('')
  const [editandoId, setEditandoId] = useState(null)

  function aoSalvar(e) {
    e.preventDefault()
    salvarAutor({ id: editandoId, nome })
    toast.success(editandoId ? 'Autor atualizado.' : 'Autor adicionado.')
    setNome('')
    setEditandoId(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Autores</h1>
      <p className="mt-1 text-slate-600">Base de autores para composição do acervo.</p>

      <form
        className="mt-8 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4 sm:flex-row sm:items-end sm:p-6"
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
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      <ul className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        {estado.autores.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="font-medium text-slate-900">{a.nome}</span>
            <div className="flex gap-3">
              <button
                type="button"
                className="text-sm text-brand hover:underline"
                onClick={() => {
                  setEditandoId(a.id)
                  setNome(a.nome)
                }}
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
