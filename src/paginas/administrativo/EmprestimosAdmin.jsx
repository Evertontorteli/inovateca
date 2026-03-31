import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'
import { formatarData } from '../../utilitarios/datas.js'

const ITENS_POR_PAGINA = 20

/** Controle de empréstimos em curso e registro direto (sem reserva prévia). */
export default function EmprestimosAdmin() {
  const { estado, emprestimosComStatus, criarEmprestimoDireto } = useBiblioteca()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const busca = (searchParams.get('q') || '').toLowerCase().trim()
  const [usuarioId, setUsuarioId] = useState(estado.usuarios[0]?.id || '')
  const [livroId, setLivroId] = useState(estado.livros[0]?.id || '')
  const [modalAberto, setModalAberto] = useState(false)

  const ativos = useMemo(() => {
    const base = emprestimosComStatus.filter((e) => e.status === 'ativo')
    if (!busca) return base
    return base.filter((e) => {
      const livro =
        estado.livros.find((l) => l.id === e.livroId)?.titulo || '—'
      const user =
        estado.usuarios.find((u) => u.id === e.usuarioId)?.nome || '—'
      return [livro, user].join(' ').toLowerCase().includes(busca)
    })
  }, [emprestimosComStatus, estado.livros, estado.usuarios, busca])

  const [paginaAtual, setPaginaAtual] = useState(1)
  const totalPaginas = Math.max(1, Math.ceil(ativos.length / ITENS_POR_PAGINA))
  const pagina = Math.min(paginaAtual, totalPaginas)
  const inicioLista = (pagina - 1) * ITENS_POR_PAGINA
  const ativosPaginados = ativos.slice(inicioLista, inicioLista + ITENS_POR_PAGINA)

  useEffect(() => {
    setPaginaAtual((p) => Math.min(p, totalPaginas))
  }, [totalPaginas])

  useEffect(() => {
    setPaginaAtual(1)
  }, [busca])

  const fecharModal = useCallback(() => {
    setModalAberto(false)
  }, [])

  function abrirModal() {
    if (!usuarioId && estado.usuarios[0]?.id) setUsuarioId(estado.usuarios[0].id)
    if (!livroId && estado.livros[0]?.id) setLivroId(estado.livros[0].id)
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

  function nomeLivro(id) {
    return estado.livros.find((l) => l.id === id)?.titulo || '—'
  }
  function capaLivro(id) {
    return estado.livros.find((l) => l.id === id)?.capaUrl || ''
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
    fecharModal()
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Empréstimos</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
        Prazos calculados a partir das configurações do sistema.
          </p>
        </div>
        <button
          type="button"
          onClick={abrirModal}
          disabled={estado.usuarios.length === 0 || estado.livros.length === 0}
          className="shrink-0 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
        >
          Novo empréstimo
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
            aria-labelledby="modal-emprestimo-titulo"
            className="relative z-10 flex max-h-[min(92vh,560px)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-900"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <h2
                id="modal-emprestimo-titulo"
                className="text-lg font-medium text-slate-900 dark:text-slate-100"
              >
                Novo empréstimo direto
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

            <form className="flex min-h-0 flex-1 flex-col overflow-y-auto" onSubmit={registrarDireto}>
              <div className="space-y-4 px-4 py-4 md:px-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Usuário</label>
                  <select
                    className="campo-formulario mt-1.5"
                    value={usuarioId}
                    onChange={(e) => setUsuarioId(e.target.value)}
                    required
                  >
                    {estado.usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Livro</label>
                  <select
                    className="campo-formulario mt-1.5"
                    value={livroId}
                    onChange={(e) => setLivroId(e.target.value)}
                    required
                  >
                    {estado.livros.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.titulo} — {l.exemplaresDisponiveis} disp.
                      </option>
                    ))}
                  </select>
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
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h2 className="mt-10 text-lg font-semibold text-slate-800">Em aberto</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {emprestimosComStatus.filter((e) => e.status === 'ativo').length} empréstimos ativos
      </p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="w-[5.5rem] px-4 py-3 font-medium">Capa</th>
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
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  {emprestimosComStatus.filter((e) => e.status === 'ativo').length === 0
                    ? 'Nenhum empréstimo ativo.'
                    : 'Nenhum empréstimo encontrado para a busca.'}
                </td>
              </tr>
            )}
            {ativosPaginados.map((e) => (
              <tr key={e.id} className="border-b border-slate-100">
                <td className="px-4 py-3 align-middle">
                  {capaLivro(e.livroId) ? (
                    <img
                      src={capaLivro(e.livroId)}
                      alt={`Capa: ${nomeLivro(e.livroId)}`}
                      className="h-20 w-14 shrink-0 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-600"
                    />
                  ) : (
                    <div className="flex h-20 w-14 items-center justify-center rounded-md bg-slate-100 px-1 text-center text-[10px] text-slate-400 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-600">
                      Sem capa
                    </div>
                  )}
                </td>
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
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
                      No prazo
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ativos.length > 0 && (
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
