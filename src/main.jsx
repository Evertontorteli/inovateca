import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './estilos/global.css'
import App from './componentes/App.jsx'
import { AutenticacaoProvedor } from './contextos/AutenticacaoContexto.jsx'
import { BibliotecaProvedor } from './contextos/BibliotecaContexto.jsx'
import { TemaProvedor } from './contextos/TemaContexto.jsx'
import { ToastProvedor } from './contextos/ToastContexto.jsx'

// Ponto de entrada: tema, dados, sessão, toasts e roteador.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TemaProvedor>
      <BibliotecaProvedor>
        <AutenticacaoProvedor>
          <ToastProvedor>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ToastProvedor>
        </AutenticacaoProvedor>
      </BibliotecaProvedor>
    </TemaProvedor>
  </StrictMode>,
)
