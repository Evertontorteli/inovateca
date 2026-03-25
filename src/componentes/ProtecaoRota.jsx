import { Navigate, useLocation } from 'react-router-dom'
import { useAutenticacao } from '../contextos/AutenticacaoContexto.jsx'

/**
 * Garante rota autenticada e, opcionalmente, perfil (admin | usuario).
 * Redireciona para login ou área correta conforme o perfil.
 */
export function ProtecaoRota({ children, perfil }) {
  const { usuarioAtual } = useAutenticacao()
  const location = useLocation()

  if (!usuarioAtual) {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />
  }

  if (perfil && usuarioAtual.perfil !== perfil) {
    const destino =
      usuarioAtual.perfil === 'admin' ? '/admin/painel' : '/app/catalogo'
    return <Navigate to={destino} replace />
  }

  return children
}
