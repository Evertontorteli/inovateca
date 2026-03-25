import { Navigate } from 'react-router-dom'
import { useAutenticacao } from '../contextos/AutenticacaoContexto.jsx'

/** Envia visitante autenticado para a área correta conforme o perfil. */
export default function RedirecionarRaiz() {
  const { usuarioAtual } = useAutenticacao()
  if (!usuarioAtual) return <Navigate to="/login" replace />
  if (usuarioAtual.perfil === 'admin') {
    return <Navigate to="/admin/painel" replace />
  }
  return <Navigate to="/app/catalogo" replace />
}
