import { useEffect, useRef, useState } from 'react'
import { extrairCorFundoSvg } from '../utilitarios/corFundoDoSvg.js'

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

/**
 * Botão alinhado aos ícones do header (tema / notificações); ao clicar, menu com conta e Sair.
 * `avatarUrl`: URL da imagem quando o cadastro oferecer avatares (opcional).
 */
export function MenuContaUsuario({
  nome = '',
  email = '',
  avatarUrl,
  aoSair,
  mostrarNome = true,
}) {
  const [aberto, setAberto] = useState(false)
  const [corFundoAvatar, setCorFundoAvatar] = useState(null)
  const ref = useRef(null)

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
    </div>
  )
}
