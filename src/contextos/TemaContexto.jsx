import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const CHAVE = 'inovateca_tema'

const TemaContexto = createContext(null)

/** Preferência visual: claro ou escuro (persistida no `localStorage`). */
export function useTema() {
  const ctx = useContext(TemaContexto)
  if (!ctx) {
    throw new Error('useTema deve ser usado dentro de TemaProvedor')
  }
  return ctx
}

export function TemaProvedor({ children }) {
  const [tema, setTemaState] = useState(() => {
    try {
      return localStorage.getItem(CHAVE) === 'dark' ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (tema === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem(CHAVE, tema)
    } catch {
      /* ignore */
    }
  }, [tema])

  const definirTema = useCallback((valor) => {
    setTemaState(valor === 'dark' ? 'dark' : 'light')
  }, [])

  const valor = useMemo(
    () => ({ tema, definirTema }),
    [tema, definirTema],
  )

  return (
    <TemaContexto.Provider value={valor}>{children}</TemaContexto.Provider>
  )
}
