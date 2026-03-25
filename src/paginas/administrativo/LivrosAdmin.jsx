import { useCallback, useEffect, useRef, useState } from 'react'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'

/** Tamanho máximo do arquivo de capa antes de base64 (localStorage). */
const LIMITE_CAPA_BYTES = 500 * 1024

/** Cadastro e edição do acervo (livros, vínculo com categoria e autores). */
export default function LivrosAdmin() {
  const {
    livrosComDetalhes,
    estado,
    salvarLivro,
    excluirLivro,
  } = useBiblioteca()
  const { toast } = useToast()

  const criarFormVazio = useCallback(
    () => ({
      titulo: '',
      isbn: '',
      categoriaId: estado.categorias[0]?.id || '',
      autorIds: [],
      exemplaresTotal: 1,
      exemplaresDisponiveis: 1,
      ano: new Date().getFullYear(),
      capaUrl: '',
    }),
    [estado.categorias],
  )

  const [form, setForm] = useState(() => criarFormVazio())
  const [editandoId, setEditandoId] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const inputCapaRef = useRef(null)

  const fecharModal = useCallback(() => {
    setModalAberto(false)
    setEditandoId(null)
    setForm(criarFormVazio())
  }, [criarFormVazio])

  function abrirNovo() {
    setEditandoId(null)
    setForm(criarFormVazio())
    setModalAberto(true)
  }

  function abrirEditar(l) {
    setEditandoId(l.id)
    setForm({
      titulo: l.titulo,
      isbn: l.isbn,
      categoriaId: l.categoriaId,
      autorIds: [...l.autorIds],
      exemplaresTotal: l.exemplaresTotal,
      exemplaresDisponiveis: l.exemplaresDisponiveis,
      ano: l.ano,
      capaUrl: l.capaUrl || '',
    })
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

  function toggleAutor(id) {
    setForm((f) => {
      const set = new Set(f.autorIds)
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...f, autorIds: [...set] }
    })
  }

  function aoArquivoCapa(e) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    if (!arquivo.type.startsWith('image/')) {
      toast.erro('Selecione um arquivo de imagem.')
      return
    }
    if (arquivo.size > LIMITE_CAPA_BYTES) {
      toast.erro('Imagem muito grande. Máximo 500 KB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setForm((f) => ({ ...f, capaUrl: String(reader.result) }))
    }
    reader.readAsDataURL(arquivo)
  }

  function removerCapa() {
    setForm((f) => ({ ...f, capaUrl: '' }))
    if (inputCapaRef.current) inputCapaRef.current.value = ''
  }

  const urlCapaExterna =
    form.capaUrl && !form.capaUrl.startsWith('data:') ? form.capaUrl : ''

  function aoSalvar(e) {
    e.preventDefault()
    salvarLivro({ ...form, id: editandoId })
    toast.success(editandoId ? 'Livro atualizado.' : 'Livro cadastrado.')
    fecharModal()
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Livros</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Gestão do acervo físico/digital da empresa.
          </p>
        </div>
        <button
          type="button"
          onClick={abrirNovo}
          className="shrink-0 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Novo livro
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
            aria-labelledby="modal-livro-titulo"
            className="relative z-10 flex max-h-[min(92vh,760px)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-900"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <h2
                id="modal-livro-titulo"
                className="text-lg font-medium text-slate-900 dark:text-slate-100"
              >
                {editandoId ? 'Editar livro' : 'Novo livro'}
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

            <form
              className="flex min-h-0 flex-1 flex-col overflow-y-auto"
              onSubmit={aoSalvar}
            >
              <div className="space-y-4 px-4 py-4 md:px-6">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Capa (opcional)
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Envie uma imagem (até 500 KB) ou informe a URL pública da capa.
                  </p>
                  {form.capaUrl && (
                    <div className="relative mt-3 inline-block max-w-full">
                      <img
                        src={form.capaUrl}
                        alt="Pré-visualização da capa"
                        className="max-h-44 rounded-lg border border-slate-200 object-contain dark:border-slate-600"
                      />
                      <button
                        type="button"
                        className="mt-2 text-sm text-rose-600 hover:underline dark:text-rose-400"
                        onClick={removerCapa}
                      >
                        Remover imagem
                      </button>
                    </div>
                  )}
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <label
                        htmlFor="livro-capa-arquivo"
                        className="block text-xs font-medium text-slate-600 dark:text-slate-400"
                      >
                        Arquivo
                      </label>
                      <input
                        id="livro-capa-arquivo"
                        ref={inputCapaRef}
                        type="file"
                        accept="image/*"
                        className="campo-formulario mt-1.5 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-foreground"
                        onChange={aoArquivoCapa}
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="livro-capa-url"
                        className="block text-xs font-medium text-slate-600 dark:text-slate-400"
                      >
                        URL da imagem
                      </label>
                      <input
                        id="livro-capa-url"
                        type="url"
                        inputMode="url"
                        placeholder="https://…"
                        className="campo-formulario mt-1.5"
                        value={urlCapaExterna}
                        onChange={(e) =>
                          setForm({ ...form, capaUrl: e.target.value.trim() })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Título
                    </label>
                    <input
                      required
                      className="campo-formulario mt-1.5"
                      value={form.titulo}
                      onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">ISBN</label>
                    <input
                      className="campo-formulario mt-1.5"
                      value={form.isbn}
                      onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ano</label>
                    <input
                      type="number"
                      className="campo-formulario mt-1.5"
                      value={form.ano}
                      onChange={(e) => setForm({ ...form, ano: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Categoria
                    </label>
                    <select
                      required
                      className="campo-formulario mt-1.5"
                      value={form.categoriaId}
                      onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                    >
                      {estado.categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Exemplares (total)
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      className="campo-formulario mt-1.5"
                      value={form.exemplaresTotal}
                      onChange={(e) =>
                        setForm({ ...form, exemplaresTotal: Number(e.target.value) })
                      }
                    />
                  </div>
                  {editandoId && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Disponíveis agora
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        className="campo-formulario mt-1.5"
                        value={form.exemplaresDisponiveis}
                        onChange={(e) =>
                          setForm({ ...form, exemplaresDisponiveis: Number(e.target.value) })
                        }
                      />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Autores</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {estado.autores.map((a) => (
                      <label
                        key={a.id}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-slate-200 px-3 py-1 text-sm text-slate-700 hover:border-slate-300 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500"
                      >
                        <input
                          type="checkbox"
                          checked={form.autorIds.includes(a.id)}
                          onChange={() => toggleAutor(a.id)}
                          className="rounded border-slate-300 text-brand focus:ring-brand/30"
                        />
                        {a.nome}
                      </label>
                    ))}
                  </div>
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
              <th className="w-16 px-4 py-3 font-medium">Capa</th>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Autores</th>
              <th className="px-4 py-3 font-medium">Disp. / Total</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {livrosComDetalhes.map((l) => (
              <tr
                key={l.id}
                className="border-b border-slate-100 dark:border-slate-800 dark:text-slate-200"
              >
                <td className="px-4 py-3 align-middle">
                  {l.capaUrl ? (
                    <img
                      src={l.capaUrl}
                      alt=""
                      className="h-14 w-10 rounded object-cover ring-1 ring-slate-200 dark:ring-slate-600"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{l.titulo}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{l.categoria?.nome || '—'}</td>
                <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-400 md:table-cell">
                  {l.autores.map((a) => a.nome).join(', ') || '—'}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {l.exemplaresDisponiveis} / {l.exemplaresTotal}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="text-brand hover:underline"
                    onClick={() => abrirEditar(l)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="ml-3 text-rose-600 hover:underline dark:text-rose-400"
                    onClick={() => {
                      if (confirm('Excluir este livro e vínculos locais?')) {
                        excluirLivro(l.id)
                        toast.success('Livro excluído.')
                      }
                    }}
                  >
                    Excluir
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
