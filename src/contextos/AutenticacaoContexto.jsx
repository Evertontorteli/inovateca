import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AVATAR_PADRAO_URL } from '../utilitarios/avatarsPredefinidos.js'
import { useBiblioteca } from './BibliotecaContexto.jsx'

const CHAVE_SESSAO = 'biblioteca_corp_sessao'

const AutenticacaoContexto = createContext(null)

/** Sessão do usuário (MVP: id no sessionStorage, sem JWT). */
export function useAutenticacao() {
  const ctx = useContext(AutenticacaoContexto)
  if (!ctx) {
    throw new Error('useAutenticacao deve ser usado dentro de AutenticacaoProvedor')
  }
  return ctx
}

function lerSessao() {
  try {
    const bruto = sessionStorage.getItem(CHAVE_SESSAO)
    return bruto ? JSON.parse(bruto) : null
  } catch {
    return null
  }
}

function gravarSessao(usuarioId) {
  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify({ usuarioId }))
}

function limparSessao() {
  sessionStorage.removeItem(CHAVE_SESSAO)
}

export function AutenticacaoProvedor({ children }) {
  const { estado, salvarUsuario } = useBiblioteca()
  const [sessao, setSessao] = useState(() => lerSessao())

  const usuarioAtual = useMemo(() => {
    if (!sessao?.usuarioId) return null
    const u = estado.usuarios.find((x) => x.id === sessao.usuarioId)
    if (!u) return null
    const { senha: _, ...resto } = u
    return resto
  }, [sessao, estado.usuarios])

  const login = useCallback(
    (email, senha) => {
      const normalizado = email.trim().toLowerCase()
      const u = estado.usuarios.find(
        (x) => x.email.toLowerCase() === normalizado && x.senha === senha,
      )
      if (!u) return { ok: false, erro: 'E-mail ou senha inválidos.' }
      gravarSessao(u.id)
      setSessao({ usuarioId: u.id })
      return { ok: true, perfil: u.perfil }
    },
    [estado.usuarios],
  )

  const logout = useCallback(() => {
    limparSessao()
    setSessao(null)
  }, [])

  /** Simulação: em produção, dispararia e-mail com link seguro (parâmetro reservado para a API futura). */
  const solicitarRecuperacao = useCallback((_email) => {
    return {
      ok: true,
      mensagem:
        'Em produção, enviaríamos instruções por e-mail. Na V1 MVP esta etapa é apenas informativa.',
    }
  }, [])

  /** Primeiro acesso: cria conta com perfil leitor corporativo. */
  const registrarPrimeiroAcesso = useCallback(
    ({ email, nome, senha }) => {
      const normalizado = email.trim().toLowerCase()
      const existe = estado.usuarios.some(
        (u) => u.email.toLowerCase() === normalizado,
      )
      if (existe) {
        return { ok: false, erro: 'Este e-mail já está cadastrado. Use o login.' }
      }
      if (!nome?.trim() || senha.length < 4) {
        return {
          ok: false,
          erro: 'Preencha nome e senha com pelo menos 4 caracteres.',
        }
      }
      salvarUsuario({
        email: normalizado,
        nome: nome.trim(),
        senha,
        perfil: 'usuario',
        avatarUrl: AVATAR_PADRAO_URL,
      })
      return {
        ok: true,
        mensagem: 'Conta criada com sucesso. Faça login com seu e-mail e senha.',
      }
    },
    [estado.usuarios, salvarUsuario],
  )

  const valor = useMemo(
    () => ({
      usuarioAtual,
      login,
      logout,
      solicitarRecuperacao,
      registrarPrimeiroAcesso,
    }),
    [
      usuarioAtual,
      login,
      logout,
      solicitarRecuperacao,
      registrarPrimeiroAcesso,
    ],
  )

  return (
    <AutenticacaoContexto.Provider value={valor}>
      {children}
    </AutenticacaoContexto.Provider>
  )
}
