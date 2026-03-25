import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'

/** Criação automática de conta no primeiro acesso (perfil leitor). */
export default function PrimeiroAcesso() {
  const { registrarPrimeiroAcesso } = useAutenticacao()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  function aoEnviar(e) {
    e.preventDefault()
    const r = registrarPrimeiroAcesso({ nome, email, senha })
    if (!r.ok) {
      toast.erro(r.erro)
      return
    }
    toast.success(r.mensagem || 'Conta criada. Redirecionando ao login.')
    setTimeout(() => navigate('/login', { replace: true }), 2000)
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Primeiro acesso</h1>
      <p className="mt-1 text-sm text-slate-600">
        Cadastre-se para consultar o catálogo e usar reservas. Um administrador pode
        ajustar seu perfil depois, se necessário.
      </p>

      <form className="mt-6 space-y-4" onSubmit={aoEnviar}>
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-slate-700">
            Nome completo
          </label>
          <input
            id="nome"
            required
            className="campo-formulario mt-1"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            E-mail corporativo
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
        <div>
          <label htmlFor="senha" className="block text-sm font-medium text-slate-700">
            Senha (mín. 4 caracteres)
          </label>
          <input
            id="senha"
            type="password"
            required
            minLength={4}
            className="campo-formulario mt-1"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Criar conta
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="text-brand hover:underline">
          Já tenho conta
        </Link>
      </p>
    </div>
  )
}
