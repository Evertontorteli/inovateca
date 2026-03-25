import { useMemo, useState } from 'react'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'
import { formatarData } from '../../utilitarios/datas.js'

/** Controle de empréstimos em curso e registro direto (sem reserva prévia). */
export default function EmprestimosAdmin() {
  const { estado, emprestimosComStatus, criarEmprestimoDireto } = useBiblioteca()
  const { toast } = useToast()
  const [usuarioId, setUsuarioId] = useState(estado.usuarios[0]?.id || '')
  const [livroId, setLivroId] = useState(estado.livros[0]?.id || '')

  const ativos = useMemo(
    () => emprestimosComStatus.filter((e) => e.status === 'ativo'),
    [emprestimosComStatus],
  )

  function nomeLivro(id) {
    return estado.livros.find((l) => l.id === id)?.titulo || '—'
  }
  function nomeUsuario(id) {
    return estado.usuarios.find((u) => u.id === id)?.nome || '—'
  }

  function registrarDireto(e) {
    e.preventDefault()
    const r = criarEmprestimoDireto(usuarioId, livroId)
    if (!r.ok) {
      toast.erro(r.erro)
      return
    }
    toast.success('Empréstimo registrado.')
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Empréstimos</h1>
      <p className="mt-1 text-slate-600">
        Prazos calculados a partir das configurações do sistema.
      </p>

      <form
        className="mt-8 grid gap-4 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4 md:grid-cols-3 md:items-end md:p-6"
        onSubmit={registrarDireto}
      >
        <div>
          <label className="text-sm font-medium text-slate-700">Usuário</label>
          <select
            className="campo-formulario mt-1"
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
          >
            {estado.usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome} ({u.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Livro</label>
          <select
            className="campo-formulario mt-1"
            value={livroId}
            onChange={(e) => setLivroId(e.target.value)}
          >
            {estado.livros.map((l) => (
              <option key={l.id} value={l.id}>
                {l.titulo} — {l.exemplaresDisponiveis} disp.
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="h-10 rounded-lg bg-brand text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Registrar empréstimo direto
        </button>
      </form>

      <h2 className="mt-10 text-lg font-semibold text-slate-800">Em aberto</h2>
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 font-medium">Livro</th>
              <th className="px-4 py-3 font-medium">Usuário</th>
              <th className="px-4 py-3 font-medium">Retirada</th>
              <th className="px-4 py-3 font-medium">Devolução prevista</th>
              <th className="px-4 py-3 font-medium">Situação</th>
            </tr>
          </thead>
          <tbody>
            {ativos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Nenhum empréstimo ativo.
                </td>
              </tr>
            )}
            {ativos.map((e) => (
              <tr key={e.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">{nomeLivro(e.livroId)}</td>
                <td className="px-4 py-3">{nomeUsuario(e.usuarioId)}</td>
                <td className="px-4 py-3 text-slate-600">{formatarData(e.dataRetirada)}</td>
                <td className="px-4 py-3 text-slate-600">
                  {formatarData(e.dataPrevistaDevolucao)}
                </td>
                <td className="px-4 py-3">
                  {e.atrasado ? (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800">
                      Atrasado
                    </span>
                  ) : (
                    <span className="text-brand">No prazo</span>
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
