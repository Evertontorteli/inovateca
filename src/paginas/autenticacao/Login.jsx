import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.jsx'
import { useToast } from '../../contextos/ToastContexto.jsx'

/** Login com e-mail e senha; redireciona conforme perfil (admin ou usuário). */
export default function Login() {
  const { login } = useAutenticacao()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const de = location.state?.de

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  function aoEnviar(e) {
    e.preventDefault()
    const r = login(email, senha)
    if (!r.ok) {
      toast.erro(r.erro)
      return
    }
    toast.success('Bem-vindo(a)!')
    const padrao =
      r.perfil === 'admin' ? '/admin/painel' : '/app/catalogo'
    if (
      de &&
      typeof de === 'string' &&
      de.startsWith('/') &&
      !de.startsWith('/login')
    ) {
      navigate(de, { replace: true })
      return
    }
    navigate(padrao, { replace: true })
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Entrar</h1>
      <p className="mt-1 text-sm text-slate-600">
        Use seu e-mail corporativo e senha.
      </p>

      <form className="mt-6 space-y-4" onSubmit={aoEnviar}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="campo-formulario mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="senha" className="block text-sm font-medium text-slate-700">
            Senha
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            autoComplete="current-password"
            required
            className="campo-formulario mt-1"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Acessar
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-center text-sm">
        <Link to="/recuperar-acesso" className="text-brand hover:underline">
          Esqueci minha senha
        </Link>
        <Link to="/primeiro-acesso" className="text-slate-600 hover:underline">
          Primeiro acesso — criar conta
        </Link>
      </div>
    </div>
  )
}
