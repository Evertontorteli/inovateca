import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'
import {
  AVATARES_PREDEFINIDOS,
  AVATAR_PADRAO_URL,
} from '../../utilitarios/avatarsPredefinidos.js'

const ITENS_POR_PAGINA = 20

const formVazio = () => ({
  nome: '',
  email: '',
  senha: '',
  whatsapp: '',
  perfil: 'usuario',
  avatarUrl: AVATAR_PADRAO_URL,
})

function indicePorUrl(url) {
  const u = url || AVATAR_PADRAO_URL
  const i = AVATARES_PREDEFINIDOS.findIndex((a) => a.url === u)
  return i >= 0 ? i : 0
}

/** Gestão de usuários corporativos e perfil (admin / usuário). */
export default function UsuariosAdmin() {
  const { estado, salvarUsuario, excluirUsuario } = useBiblioteca()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const busca = (searchParams.get('q') || '').toLowerCase().trim()
  const usuariosFiltrados = useMemo(() => {
    if (!busca) return estado.usuarios
    return estado.usuarios.filter((u) =>
      [u.nome, u.email, u.perfil, u.whatsapp || '']
        .join(' ')
        .toLowerCase()
        .includes(busca),
    )
  }, [estado.usuarios, busca])
  const [form, setForm] = useState(formVazio)
  const [editandoId, setEditandoId] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [grelhaAvataresAberta, setGrelhaAvataresAberta] = useState(false)
  const [paginaAtual, setPaginaAtual] = useState(1)

  const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / ITENS_POR_PAGINA))
  const pagina = Math.min(paginaAtual, totalPaginas)
  const inicioLista = (pagina - 1) * ITENS_POR_PAGINA
  const usuariosPaginados = usuariosFiltrados.slice(inicioLista, inicioLista + ITENS_POR_PAGINA)

  const passoAvatar = useCallback((dir) => {
    setForm((prev) => {
      const len = AVATARES_PREDEFINIDOS.length
      const at = indicePorUrl(prev.avatarUrl)
      const novo = (at + dir + len) % len
      return { ...prev, avatarUrl: AVATARES_PREDEFINIDOS[novo].url }
    })
  }, [])

  const fecharModal = useCallback(() => {
    setModalAberto(false)
    setEditandoId(null)
    setForm(formVazio())
    setGrelhaAvataresAberta(false)
  }, [])

  function abrirNovo() {
    setEditandoId(null)
    setForm(formVazio())
    setGrelhaAvataresAberta(false)
    setModalAberto(true)
  }

  function abrirEditar(u) {
    setEditandoId(u.id)
    setForm({
      nome: u.nome,
      email: u.email,
      senha: '',
      whatsapp: u.whatsapp || '',
      perfil: u.perfil,
      avatarUrl: u.avatarUrl || AVATAR_PADRAO_URL,
    })
    setGrelhaAvataresAberta(false)
    setModalAberto(true)
  }

  useEffect(() => {
    if (!modalAberto) return undefined
    document.body.style.overflow = 'hidden'
    function aoTecla(e) {
      if (e.key === 'Escape') {
        fecharModal()
        return
      }
      const alvo = e.target
      const tag = alvo && alvo.tagName
      if (
        alvo &&
        (alvo.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT')
      ) {
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        passoAvatar(-1)
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        passoAvatar(1)
      }
    }
    document.addEventListener('keydown', aoTecla)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', aoTecla)
    }
  }, [modalAberto, fecharModal, passoAvatar])

  useEffect(() => {
    setPaginaAtual((p) => Math.min(p, totalPaginas))
  }, [totalPaginas])

  useEffect(() => {
    setPaginaAtual(1)
  }, [busca])

  function aoSalvar(e) {
    e.preventDefault()
    salvarUsuario({
      id: editandoId,
      nome: form.nome,
      email: form.email.trim().toLowerCase(),
      senha: form.senha || undefined,
      perfil: form.perfil,
      avatarUrl: form.avatarUrl || AVATAR_PADRAO_URL,
      whatsapp: form.whatsapp.trim(),
    })
    toast.success(editandoId ? 'Usuário atualizado.' : 'Usuário cadastrado.')
    fecharModal()
  }

  const indiceAtual = useMemo(() => indicePorUrl(form.avatarUrl), [form.avatarUrl])
  const totalAvatares = AVATARES_PREDEFINIDOS.length
  const avatarAnterior = AVATARES_PREDEFINIDOS[(indiceAtual - 1 + totalAvatares) % totalAvatares]
  const avatarProximo = AVATARES_PREDEFINIDOS[(indiceAtual + 1) % totalAvatares]
  const avatarCentro = AVATARES_PREDEFINIDOS[indiceAtual]

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Usuários</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Controle de acesso: administradores operam o acervo; usuários usam autoatendimento.
          </p>
        </div>
        <button
          type="button"
          onClick={abrirNovo}
          className="shrink-0 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Novo usuário
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
            aria-labelledby="modal-usuario-titulo"
            className="relative z-10 flex max-h-[min(92vh,760px)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-900"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <h2
                id="modal-usuario-titulo"
                className="text-lg font-medium text-slate-900 dark:text-slate-100"
              >
                {editandoId ? 'Editar usuário' : 'Novo usuário'}
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
              <div className="shrink-0 space-y-3 border-b border-slate-200 px-4 pb-4 pt-3 dark:border-slate-700 md:px-6">
                <div>
                  <p className="text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                    Avatar
                  </p>
                  <p className="mt-0.5 text-center text-xs text-slate-500 dark:text-slate-400">
                    Use as setas ou ← → no teclado. Aparece no menu da conta.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-0.5 sm:gap-1.5">
                  <button
                    type="button"
                    onClick={() => passoAvatar(-1)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    aria-label="Avatar anterior"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => passoAvatar(-1)}
                    className="hidden shrink-0 opacity-50 transition hover:opacity-90 sm:block"
                    aria-label={`Anterior: ${avatarAnterior.rotulo}`}
                  >
                    <img
                      src={avatarAnterior.url}
                      alt=""
                      className="h-9 w-9 rounded-lg border border-slate-200 object-cover dark:border-slate-600"
                    />
                  </button>

                  <div className="mx-0.5 shrink-0 rounded-xl bg-gradient-to-b from-slate-100 to-slate-200/90 p-0.5 shadow-inner dark:from-slate-700 dark:to-slate-800 sm:mx-1 sm:rounded-2xl sm:p-1">
                    <img
                      src={form.avatarUrl || AVATAR_PADRAO_URL}
                      alt=""
                      className="h-16 w-16 rounded-lg object-cover shadow ring-2 ring-white dark:ring-slate-900 sm:h-20 sm:w-20 sm:rounded-xl"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => passoAvatar(1)}
                    className="hidden shrink-0 opacity-50 transition hover:opacity-90 sm:block"
                    aria-label={`Próximo: ${avatarProximo.rotulo}`}
                  >
                    <img
                      src={avatarProximo.url}
                      alt=""
                      className="h-9 w-9 rounded-lg border border-slate-200 object-cover dark:border-slate-600"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => passoAvatar(1)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    aria-label="Próximo avatar"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <p className="text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                  {avatarCentro.rotulo}
                </p>
                <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
                  {indiceAtual + 1} de {totalAvatares}
                </p>

                <button
                  type="button"
                  onClick={() => setGrelhaAvataresAberta((v) => !v)}
                  className="mx-auto flex items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                  <span>{grelhaAvataresAberta ? 'Ver menos' : 'Ver mais'}</span>
                  <svg
                    className={`h-3.5 w-3.5 shrink-0 transition-transform ${grelhaAvataresAberta ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {grelhaAvataresAberta && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/90 dark:border-slate-600 dark:bg-slate-800/60">
                    <div className="max-h-[min(40vh,280px)] overflow-y-auto overscroll-contain p-3 [scrollbar-gutter:stable]">
                      <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
                        {AVATARES_PREDEFINIDOS.map((a) => {
                          const selecionado = form.avatarUrl === a.url
                          return (
                            <button
                              key={a.id}
                              type="button"
                              title={a.rotulo}
                              onClick={() => setForm({ ...form, avatarUrl: a.url })}
                              className={`rounded-lg border-2 p-0.5 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                                selecionado
                                  ? 'border-brand ring-2 ring-brand/30'
                                  : 'border-transparent hover:border-slate-300 dark:hover:border-slate-500'
                              }`}
                            >
                              <img
                                src={a.url}
                                alt=""
                                className="aspect-square w-full rounded-md object-cover"
                              />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 px-4 py-5 md:px-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
                  <input
                    required
                    className="campo-formulario mt-1.5"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
                  <input
                    type="email"
                    required
                    disabled={!!editandoId}
                    className="campo-formulario mt-1.5"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Ex.: +55 11 99999-9999"
                    className="campo-formulario mt-1.5"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Opcional. DDD e número com código do país, se quiser.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Senha {editandoId && '(deixe em branco para manter)'}
                  </label>
                  <input
                    type="password"
                    className="campo-formulario mt-1.5"
                    value={form.senha}
                    onChange={(e) => setForm({ ...form, senha: e.target.value })}
                    minLength={editandoId ? 0 : 4}
                    required={!editandoId}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Perfil</label>
                  <select
                    className="campo-formulario mt-1.5"
                    value={form.perfil}
                    onChange={(e) => setForm({ ...form, perfil: e.target.value })}
                  >
                    <option value="usuario">Usuário (catálogo e reservas)</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="mt-auto flex flex-wrap justify-end gap-2 border-t border-slate-200 px-4 py-4 dark:border-slate-700 md:px-6">
                <button
                  type="button"
                  className="botao-formulario-secundario"
                  onClick={fecharModal}
                >
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
        {estado.usuarios.length} usuários cadastrados
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 font-medium">Avatar</th>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">WhatsApp</th>
              <th className="px-4 py-3 font-medium">Perfil</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  {estado.usuarios.length === 0
                    ? 'Nenhum usuário cadastrado.'
                    : 'Nenhum usuário encontrado para a busca.'}
                </td>
              </tr>
            )}
            {usuariosPaginados.map((u) => (
              <tr
                key={u.id}
                className="border-b border-slate-100 dark:border-slate-800 dark:text-slate-200"
              >
                <td className="px-4 py-3">
                  <img
                    src={u.avatarUrl || AVATAR_PADRAO_URL}
                    alt=""
                    className="h-8 w-8 rounded-lg border border-slate-200 object-cover dark:border-slate-600"
                  />
                </td>
                <td className="px-4 py-3">{u.nome}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                <td className="max-w-[10rem] truncate px-4 py-3 text-slate-600 dark:text-slate-400">
                  {u.whatsapp?.trim() ? u.whatsapp : '—'}
                </td>
                <td className="px-4 py-3 capitalize">{u.perfil}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-brand hover:bg-brand/10"
                    title="Editar usuário"
                    aria-label="Editar usuário"
                    onClick={() => abrirEditar(u)}
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
                    title="Excluir usuário"
                    aria-label="Excluir usuário"
                    onClick={() => {
                      if (confirm(`Remover ${u.nome}?`)) {
                        excluirUsuario(u.id)
                        toast.success('Usuário removido.')
                      }
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

      {usuariosFiltrados.length > 0 && (
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
