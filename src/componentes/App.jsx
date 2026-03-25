import { Rotas } from './Rotas.jsx'

/**
 * Raiz visual da SPA: rotas e layouts são definidos em `Rotas.jsx`.
 */
function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
      <Rotas />
    </div>
  )
}

export default App
