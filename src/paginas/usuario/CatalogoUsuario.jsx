import { useState } from 'react'
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.jsx'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'

/** Consulta ao catálogo e reserva de exemplares (autoatendimento). */
export default function CatalogoUsuario() {
  const { usuarioAtual } = useAutenticacao()
  const { livrosComDetalhes, criarReserva } = useBiblioteca()
  const { toast } = useToast()
  const [busca, setBusca] = useState('')

  const filtrados = livrosComDetalhes.filter(
    (l) =>
      l.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      l.autores.some((a) => a.nome.toLowerCase().includes(busca.toLowerCase())),
  )

  function reservar(livroId) {
    const r = criarReserva(usuarioAtual.id, livroId)
    if (!r.ok) {
      toast.erro(r.erro)
      return
    }
    toast.success('Reserva registrada.')
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Catálogo</h1>
      <p className="mt-1 text-slate-600">
        Busque por título ou autor e reserve quando houver exemplar disponível.
      </p>

      <input
        type="search"
        placeholder="Buscar…"
        className="campo-formulario mt-6 max-w-md px-4 py-2.5"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtrados.map((l) => (
          <li
            key={l.id}
            className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm"
          >
            <div className="aspect-[2/3] max-h-52 w-full shrink-0 bg-slate-100 dark:bg-slate-800">
              {l.capaUrl ? (
                <img
                  src={l.capaUrl}
                  alt={`Capa: ${l.titulo}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-xs text-slate-400 dark:text-slate-500">
                  Sem capa
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{l.titulo}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {l.autores.map((a) => a.nome).join(', ') || 'Autor não informado'}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              {l.categoria?.nome} · {l.ano}
            </p>
            <p className="mt-3 text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {l.exemplaresDisponiveis}
              </span>{' '}
              disponíveis de {l.exemplaresTotal}
            </p>
            <button
              type="button"
              disabled={l.exemplaresDisponiveis < 1}
              className="mt-4 rounded-lg bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-600"
              onClick={() => reservar(l.id)}
            >
              Reservar
            </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
