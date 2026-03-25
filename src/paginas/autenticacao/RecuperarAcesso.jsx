import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'

/**
 * Recuperação de acesso (MVP informativo).
 * Próxima evolução: e-mail com token e fluxo seguro.
 */
export default function RecuperarAcesso() {
  const { solicitarRecuperacao } = useAutenticacao()
  const { toast } = useToast()
  const [email, setEmail] = useState('')

  function aoEnviar(e) {
    e.preventDefault()
    const r = solicitarRecuperacao(email)
    toast.info(r.mensagem || 'Solicitação registrada (simulação).')
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Recuperar acesso</h1>
      <p className="mt-1 text-sm text-slate-600">
        Informe o e-mail cadastrado. Na V1 MVP apenas simulamos a confirmação.
      </p>

      <form className="mt-6 space-y-4" onSubmit={aoEnviar}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            className="campo-formulario mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Enviar instruções (simulação)
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="text-brand hover:underline">
          Voltar ao login
        </Link>
      </p>
    </div>
  )
}
