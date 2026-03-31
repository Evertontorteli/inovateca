import { Navigate, Route, Routes } from 'react-router-dom'
import { LayoutAdministrativo } from './layout/LayoutAdministrativo.jsx'
import { LayoutPublico } from './layout/LayoutPublico.jsx'
import { LayoutUsuario } from './layout/LayoutUsuario.jsx'
import { ProtecaoRota } from './ProtecaoRota.jsx'
import RedirecionarRaiz from './RedirecionarRaiz.jsx'

import Login from '../paginas/autenticacao/Login.jsx'
import PrimeiroAcesso from '../paginas/autenticacao/PrimeiroAcesso.jsx'
import RecuperarAcesso from '../paginas/autenticacao/RecuperarAcesso.jsx'

import AutoresAdmin from '../paginas/administrativo/AutoresAdmin.jsx'
import CategoriasAdmin from '../paginas/administrativo/CategoriasAdmin.jsx'
import ConfiguracoesAdmin from '../paginas/administrativo/ConfiguracoesAdmin.jsx'
import DevolucaoAdmin from '../paginas/administrativo/DevolucaoAdmin.jsx'
import EmprestimosAdmin from '../paginas/administrativo/EmprestimosAdmin.jsx'
import LivrosAdmin from '../paginas/administrativo/LivrosAdmin.jsx'
import PainelAdmin from '../paginas/administrativo/PainelAdmin.jsx'
import ReservasAdmin from '../paginas/administrativo/ReservasAdmin.jsx'

import NotificacoesPagina from '../paginas/compartilhada/NotificacoesPagina.jsx'
import CatalogoUsuario from '../paginas/usuario/CatalogoUsuario.jsx'
import MeusEmprestimosUsuario from '../paginas/usuario/MeusEmprestimosUsuario.jsx'
import MinhasReservasUsuario from '../paginas/usuario/MinhasReservasUsuario.jsx'

/** Mapa de rotas públicas, administrativas e do usuário final. */
export function Rotas() {
  return (
    <Routes>
      <Route path="/" element={<RedirecionarRaiz />} />

      <Route element={<LayoutPublico />}>
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-acesso" element={<RecuperarAcesso />} />
        <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtecaoRota perfil="admin">
            <LayoutAdministrativo />
          </ProtecaoRota>
        }
      >
        <Route index element={<Navigate to="painel" replace />} />
        <Route path="painel" element={<PainelAdmin />} />
        <Route path="livros" element={<LivrosAdmin />} />
        <Route path="categorias" element={<CategoriasAdmin />} />
        <Route path="autores" element={<AutoresAdmin />} />
        <Route
          path="usuarios"
          element={<Navigate to="/admin/configuracoes?aba=usuarios" replace />}
        />
        <Route path="reservas" element={<ReservasAdmin />} />
        <Route path="emprestimos" element={<EmprestimosAdmin />} />
        <Route path="devolucao" element={<DevolucaoAdmin />} />
        <Route path="configuracoes" element={<ConfiguracoesAdmin />} />
        <Route
          path="notificacoes"
          element={<Navigate to="/admin/configuracoes?aba=notificacoes" replace />}
        />
      </Route>

      <Route
        path="/app"
        element={
          <ProtecaoRota perfil="usuario">
            <LayoutUsuario />
          </ProtecaoRota>
        }
      >
        <Route index element={<Navigate to="catalogo" replace />} />
        <Route path="catalogo" element={<CatalogoUsuario />} />
        <Route path="minhas-reservas" element={<MinhasReservasUsuario />} />
        <Route path="meus-emprestimos" element={<MeusEmprestimosUsuario />} />
        <Route path="notificacoes" element={<NotificacoesPagina />} />
      </Route>

      <Route path="*" element={<RedirecionarRaiz />} />
    </Routes>
  )
}
