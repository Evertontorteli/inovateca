import { useState } from 'react'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'

/** Parâmetros de regras: prazo de empréstimo e limites de reserva. */
export default function ConfiguracoesAdmin() {
  const { estado, atualizarConfiguracao } = useBiblioteca()
  const { toast } = useToast()
  const [prazoEmprestimoDias, setPrazoEmprestimoDias] = useState(
    estado.configuracao.prazoEmprestimoDias,
  )
  const [maxReservasPorUsuario, setMaxReservasPorUsuario] = useState(
    estado.configuracao.maxReservasPorUsuario,
  )
  function aoSalvar(e) {
    e.preventDefault()
    atualizarConfiguracao({
      prazoEmprestimoDias: Number(prazoEmprestimoDias),
      maxReservasPorUsuario: Number(maxReservasPorUsuario),
    })
    toast.success('Configurações salvas localmente (MVP).')
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Configurações</h1>
      <p className="mt-1 text-slate-600">
        Regras aplicadas aos novos empréstimos e às reservas no autoatendimento.
      </p>

      <form
        className="mt-8 max-w-lg space-y-6 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-6 shadow-sm"
        onSubmit={aoSalvar}
      >
        <div>
          <label htmlFor="prazo" className="text-sm font-medium text-slate-700">
            Prazo padrão de empréstimo (dias)
          </label>
          <input
            id="prazo"
            type="number"
            min={1}
            max={90}
            required
            className="campo-formulario mt-1"
            value={prazoEmprestimoDias}
            onChange={(e) => setPrazoEmprestimoDias(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="maxRes" className="text-sm font-medium text-slate-700">
            Máximo de reservas ativas por usuário
          </label>
          <input
            id="maxRes"
            type="number"
            min={1}
            max={20}
            required
            className="campo-formulario mt-1"
            value={maxReservasPorUsuario}
            onChange={(e) => setMaxReservasPorUsuario(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Salvar parâmetros
        </button>
      </form>
    </div>
  )
}
