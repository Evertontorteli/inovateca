import { useEffect, useRef, useState } from 'react'
import { useTema } from '../contextos/TemaContexto.jsx'

/** Botão com menu para escolher tema claro ou escuro (grava no navegador). */
export function SeletorTema() {
  const { tema, definirTema } = useTema()
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

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
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 md:p-2.5"
        aria-expanded={aberto}
        aria-haspopup="listbox"
        aria-label="Escolher tema claro ou escuro"
        onClick={() => setAberto((v) => !v)}
      >
        {tema === 'dark' ? (
          <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </button>

      {aberto && (
        <div
          className="absolute right-0 top-full z-[60] mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-600 dark:bg-slate-900"
          role="listbox"
          aria-label="Opções de tema"
        >
          <button
            type="button"
            role="option"
            aria-selected={tema === 'light'}
            className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm ${
              tema === 'light'
                ? 'bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-white'
                : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            onClick={() => {
              definirTema('light')
              setAberto(false)
            }}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Tema claro
            {tema === 'light' && <span className="ml-auto text-brand">✓</span>}
          </button>
          <button
            type="button"
            role="option"
            aria-selected={tema === 'dark'}
            className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm ${
              tema === 'dark'
                ? 'bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-white'
                : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            onClick={() => {
              definirTema('dark')
              setAberto(false)
            }}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
            Tema escuro
            {tema === 'dark' && <span className="ml-auto text-brand">✓</span>}
          </button>
        </div>
      )}
    </div>
  )
}
