import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

const ToastContexto = createContext(null)

const DURACAO_PADRAO_MS = 6000

/** Toasts globais (canto superior direito), alinhados ao tema claro/escuro. */
export function useToast() {
  const ctx = useContext(ToastContexto)
  if (!ctx) {
    throw new Error('useToast deve ser usado dentro de ToastProvedor')
  }
  return ctx
}

function estiloPorTipo(tipo) {
  switch (tipo) {
    case 'sucesso':
      return 'border-emerald-300/80 bg-emerald-50 text-emerald-950 dark:border-emerald-700/60 dark:bg-emerald-950/50 dark:text-emerald-100'
    case 'erro':
      return 'border-rose-300/80 bg-rose-50 text-rose-950 dark:border-rose-700/60 dark:bg-rose-950/50 dark:text-rose-100'
    default:
      return 'border-slate-300/80 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
  }
}

export function ToastProvedor({ children }) {
  const [itens, setItens] = useState([])

  const remover = useCallback((id) => {
    setItens((lista) => lista.filter((t) => t.id !== id))
  }, [])

  const adicionar = useCallback(
    (mensagem, tipo = 'info', duracao = DURACAO_PADRAO_MS) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      setItens((lista) => [...lista, { id, mensagem, tipo }])
      if (duracao > 0) {
        window.setTimeout(() => remover(id), duracao)
      }
      return id
    },
    [remover],
  )

  const valor = useMemo(
    () => ({
      toast: {
        success: (mensagem, duracao) => adicionar(mensagem, 'sucesso', duracao),
        erro: (mensagem, duracao) => adicionar(mensagem, 'erro', duracao),
        info: (mensagem, duracao) => adicionar(mensagem, 'info', duracao),
      },
    }),
    [adicionar],
  )

  return (
    <ToastContexto.Provider value={valor}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[200] flex w-[min(100vw-2rem,22rem)] flex-col gap-2"
        aria-live="polite"
      >
        {itens.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-2 rounded-xl border-2 px-3 py-2.5 text-sm shadow-lg ${estiloPorTipo(t.tipo)}`}
          >
            <p className="min-w-0 flex-1 leading-snug">{t.mensagem}</p>
            <button
              type="button"
              className="shrink-0 rounded-md p-0.5 opacity-70 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
              aria-label="Fechar aviso"
              onClick={() => remover(t.id)}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContexto.Provider>
  )
}
