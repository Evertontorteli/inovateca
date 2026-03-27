import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '../contextos/ToastContexto.jsx'
import {
  AVATARES_PREDEFINIDOS,
  AVATAR_PADRAO_URL,
} from '../utilitarios/avatarsPredefinidos.js'
import { extrairCorFundoSvg } from '../utilitarios/corFundoDoSvg.js'

/** Tamanho máximo do arquivo de foto de perfil (base64 no localStorage). */
const LIMITE_FOTO_PERFIL_BYTES = 500 * 1024

function IconeAvatar() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )
}

function indicePorUrl(url) {
  const u = url || AVATAR_PADRAO_URL
  const i = AVATARES_PREDEFINIDOS.findIndex((a) => a.url === u)
  return i >= 0 ? i : 0
}

/**
 * Botão alinhado aos ícones do header (tema / notificações); ao clicar, menu com conta e Sair.
 * `avatarUrl`: URL da imagem quando o cadastro oferecer avatares (opcional).
 */
export function MenuContaUsuario({
  nome = '',
  email = '',
  avatarUrl,
  aoSair,
  aoSalvarPerfil,
  perfil = 'usuario',
  whatsapp = '',
  mostrarNome = true,
}) {
  const { toast } = useToast()
  const [aberto, setAberto] = useState(false)
  const [modalPerfilAberto, setModalPerfilAberto] = useState(false)
  const [formPerfil, setFormPerfil] = useState({
    nome: '',
    whatsapp: '',
    avatarUrl: AVATAR_PADRAO_URL,
    senhaNova: '',
    senhaConfirmacao: '',
  })
  const [grelhaAvataresAberta, setGrelhaAvataresAberta] = useState(false)
  const [corFundoAvatar, setCorFundoAvatar] = useState(null)
  const ref = useRef(null)
  const inputFotoRef = useRef(null)

  const edicaoPerfilUsuario = perfil === 'usuario'

  const passoAvatar = useCallback(
    (dir) => {
      if (!edicaoPerfilUsuario) return
      setFormPerfil((prev) => {
        const len = AVATARES_PREDEFINIDOS.length
        const at = indicePorUrl(prev.avatarUrl)
        const novo = (at + dir + len) % len
        return { ...prev, avatarUrl: AVATARES_PREDEFINIDOS[novo].url }
      })
    },
    [edicaoPerfilUsuario],
  )

  useEffect(() => {
    let cancelado = false
    const limparCor = () => {
      Promise.resolve().then(() => {
        if (!cancelado) setCorFundoAvatar(null)
      })
    }
    if (!avatarUrl) {
      limparCor()
      return () => {
        cancelado = true
      }
    }
    limparCor()
    extrairCorFundoSvg(avatarUrl).then((cor) => {
      if (!cancelado && cor) setCorFundoAvatar(cor)
    })
    return () => {
      cancelado = true
    }
  }, [avatarUrl])

  useEffect(() => {
    function aoPressionar(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', aoPressionar)
    return () => document.removeEventListener('mousedown', aoPressionar)
  }, [])

  useEffect(() => {
    if (!modalPerfilAberto) return undefined
    document.body.style.overflow = 'hidden'
    function aoTecla(e) {
      if (e.key === 'Escape') {
        setModalPerfilAberto(false)
        return
      }
      if (!edicaoPerfilUsuario) return
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
  }, [modalPerfilAberto, edicaoPerfilUsuario, passoAvatar])

  function aoArquivoFoto(e) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    if (!arquivo.type.startsWith('image/')) {
      toast.erro('Selecione um arquivo de imagem.')
      return
    }
    if (arquivo.size > LIMITE_FOTO_PERFIL_BYTES) {
      toast.erro('Imagem muito grande. Máximo 500 KB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setFormPerfil((f) => ({ ...f, avatarUrl: String(reader.result) }))
    }
    reader.readAsDataURL(arquivo)
  }

  function abrirMeuPerfil() {
    setFormPerfil({
      nome: nome || '',
      whatsapp: whatsapp || '',
      avatarUrl: avatarUrl || AVATAR_PADRAO_URL,
      senhaNova: '',
      senhaConfirmacao: '',
    })
    setGrelhaAvataresAberta(false)
    setAberto(false)
    setModalPerfilAberto(true)
  }

  function aoSubmitPerfil(e) {
    e.preventDefault()
    const nomeNormalizado = formPerfil.nome.trim()
    if (!nomeNormalizado) return

    if (edicaoPerfilUsuario) {
      const s1 = formPerfil.senhaNova
      const s2 = formPerfil.senhaConfirmacao
      if (s1 || s2) {
        if (s1 !== s2) {
          toast.erro('As senhas não coincidem.')
          return
        }
        if (s1.length < 4) {
          toast.erro('A nova senha deve ter pelo menos 4 caracteres.')
          return
        }
      }
      aoSalvarPerfil?.({
        nome: nomeNormalizado,
        whatsapp: formPerfil.whatsapp.trim(),
        avatarUrl: formPerfil.avatarUrl || AVATAR_PADRAO_URL,
        senhaNova: s1 ? s1 : undefined,
      })
    } else {
      aoSalvarPerfil?.({
        nome: nomeNormalizado,
        whatsapp: formPerfil.whatsapp.trim(),
      })
    }
    setModalPerfilAberto(false)
  }

  const urlAvatarForm = formPerfil.avatarUrl || ''
  const ehFotoPropria =
    urlAvatarForm.startsWith('data:') ||
    (urlAvatarForm !== '' &&
      !AVATARES_PREDEFINIDOS.some((a) => a.url === urlAvatarForm))
  const indiceAtual = indicePorUrl(formPerfil.avatarUrl)
  const totalAvatares = AVATARES_PREDEFINIDOS.length
  const avatarAnterior =
    AVATARES_PREDEFINIDOS[(indiceAtual - 1 + totalAvatares) % totalAvatares]
  const avatarProximo = AVATARES_PREDEFINIDOS[(indiceAtual + 1) % totalAvatares]
  const avatarCentro = AVATARES_PREDEFINIDOS[indiceAtual]

  return (
    <div className="flex items-center gap-2">
      {mostrarNome && (
        <span className="max-w-[10rem] truncate text-sm text-slate-600 dark:text-slate-300">
          {nome}
        </span>
      )}
      <div className="relative shrink-0" ref={ref}>
        <button
          type="button"
          className={
            avatarUrl && corFundoAvatar
              ? 'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-transparent text-slate-700 shadow-sm hover:brightness-[0.92] dark:text-slate-200 dark:hover:brightness-[0.88]'
              : 'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
          }
          style={
            avatarUrl && corFundoAvatar ? { backgroundColor: corFundoAvatar } : undefined
          }
          aria-expanded={aberto}
          aria-haspopup="menu"
          aria-label="Menu da conta e sair"
          onClick={() => setAberto((v) => !v)}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <IconeAvatar />
          )}
        </button>

        {aberto && (
          <div
            className="absolute right-0 top-full z-[60] mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-600 dark:bg-slate-900"
            role="menu"
          >
            <div className="border-b border-slate-100 px-3 pb-2 dark:border-slate-700">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                {nome || 'Usuário'}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{email}</p>
            </div>
            <button
              type="button"
              role="menuitem"
              className="mt-1 flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={abrirMeuPerfil}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A9 9 0 1118.88 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Meu perfil
            </button>
            <button
              type="button"
              role="menuitem"
              className="mt-1 flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              onClick={() => {
                setAberto(false)
                aoSair?.()
              }}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sair
            </button>
          </div>
        )}
      </div>

      {modalPerfilAberto && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]"
            aria-label="Fechar"
            onClick={() => setModalPerfilAberto(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-meu-perfil-titulo"
            className="relative z-10 flex max-h-[min(92vh,760px)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-900"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <h2 id="modal-meu-perfil-titulo" className="text-lg font-medium text-slate-900 dark:text-slate-100">
                Meu perfil
              </h2>
              <button
                type="button"
                onClick={() => setModalPerfilAberto(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Fechar modal"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form
              className="flex min-h-0 flex-1 flex-col overflow-y-auto"
              onSubmit={aoSubmitPerfil}
            >
              {edicaoPerfilUsuario && (
                <div className="shrink-0 space-y-3 border-b border-slate-200 px-4 pb-4 pt-4 dark:border-slate-700 md:px-6">
                  <input
                    ref={inputFotoRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    aria-hidden
                    onChange={aoArquivoFoto}
                  />
                  <div>
                    <p className="text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                      Avatar
                    </p>
                    <p className="mt-0.5 text-center text-xs text-slate-500 dark:text-slate-400">
                      Use as setas ou ← → fora dos campos. Toque no lápis para enviar uma foto (até 500
                      KB).
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

                    <div className="relative mx-0.5 shrink-0">
                      <div className="rounded-xl bg-gradient-to-b from-slate-100 to-slate-200/90 p-0.5 shadow-inner dark:from-slate-700 dark:to-slate-800 sm:rounded-2xl sm:p-1">
                        <img
                          src={formPerfil.avatarUrl || AVATAR_PADRAO_URL}
                          alt=""
                          className="h-16 w-16 rounded-lg object-cover shadow ring-2 ring-white dark:ring-slate-900 sm:h-20 sm:w-20 sm:rounded-xl"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => inputFotoRef.current?.click()}
                        className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        aria-label="Enviar foto do computador"
                        title="Enviar foto"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
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
                    {ehFotoPropria ? 'Foto enviada' : avatarCentro.rotulo}
                  </p>
                  <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
                    {ehFotoPropria ? 'Personalizado' : `${indiceAtual + 1} de ${totalAvatares}`}
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
                            const selecionado = formPerfil.avatarUrl === a.url
                            return (
                              <button
                                key={a.id}
                                type="button"
                                title={a.rotulo}
                                onClick={() => setFormPerfil((f) => ({ ...f, avatarUrl: a.url }))}
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
              )}

              <div className="space-y-4 px-4 py-5 md:px-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
                  <input
                    required
                    className="campo-formulario mt-1.5"
                    value={formPerfil.nome}
                    onChange={(e) => setFormPerfil((prev) => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
                  <input disabled className="campo-formulario mt-1.5 opacity-80" value={email} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">WhatsApp</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Ex.: +55 11 99999-9999"
                    className="campo-formulario mt-1.5"
                    value={formPerfil.whatsapp}
                    onChange={(e) => setFormPerfil((prev) => ({ ...prev, whatsapp: e.target.value }))}
                  />
                </div>
                {edicaoPerfilUsuario && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Nova senha
                      </label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        className="campo-formulario mt-1.5"
                        value={formPerfil.senhaNova}
                        onChange={(e) =>
                          setFormPerfil((prev) => ({ ...prev, senhaNova: e.target.value }))
                        }
                        minLength={0}
                        placeholder="Deixe em branco para não alterar"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Confirmar nova senha
                      </label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        className="campo-formulario mt-1.5"
                        value={formPerfil.senhaConfirmacao}
                        onChange={(e) =>
                          setFormPerfil((prev) => ({ ...prev, senhaConfirmacao: e.target.value }))
                        }
                        minLength={0}
                        placeholder="Repita a nova senha"
                      />
                    </div>
                  </>
                )}
                {!edicaoPerfilUsuario && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Perfil</label>
                    <input
                      disabled
                      className="campo-formulario mt-1.5 capitalize opacity-80"
                      value={perfil === 'admin' ? 'Administrador' : 'Usuário'}
                    />
                  </div>
                )}
              </div>

              <div className="mt-auto flex flex-wrap justify-end gap-2 border-t border-slate-200 px-4 py-4 dark:border-slate-700 md:px-6">
                <button type="button" className="botao-formulario-secundario" onClick={() => setModalPerfilAberto(false)}>
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
    </div>
  )
}
