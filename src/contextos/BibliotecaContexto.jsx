import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { AVATAR_PADRAO_URL } from '../utilitarios/avatarsPredefinidos.js'
import {
  carregarEstado,
  novoId,
  reiniciarDemonstracao,
  salvarEstado,
} from '../servicos/armazenamentoBiblioteca.js'

const BibliotecaContexto = createContext(null)

/** Hook para acervo, reservas, empréstimos e configurações (MVP: localStorage). */
export function useBiblioteca() {
  const ctx = useContext(BibliotecaContexto)
  if (!ctx) {
    throw new Error('useBiblioteca deve ser usado dentro de BibliotecaProvedor')
  }
  return ctx
}

function comPersistencia(setEstado, atualizador) {
  setEstado((prev) => {
    const next = atualizador(prev)
    salvarEstado(next)
    return next
  })
}

export function BibliotecaProvedor({ children }) {
  const [estado, setEstado] = useState(() => carregarEstado())

  const livrosComDetalhes = useMemo(() => {
    const { livros, categorias, autores } = estado
    return livros.map((l) => ({
      ...l,
      categoria: categorias.find((c) => c.id === l.categoriaId),
      autores: l.autorIds
        .map((id) => autores.find((a) => a.id === id))
        .filter(Boolean),
    }))
  }, [estado])

  const salvarCategoria = useCallback((dados) => {
    comPersistencia(setEstado, (prev) => {
      if (dados.id) {
        return {
          ...prev,
          categorias: prev.categorias.map((c) =>
            c.id === dados.id ? { ...c, ...dados } : c,
          ),
        }
      }
      const novo = {
        id: novoId(),
        nome: dados.nome,
        descricao: dados.descricao || '',
      }
      return { ...prev, categorias: [...prev.categorias, novo] }
    })
  }, [])

  const excluirCategoria = useCallback((id) => {
    comPersistencia(setEstado, (prev) => ({
      ...prev,
      categorias: prev.categorias.filter((c) => c.id !== id),
    }))
  }, [])

  const salvarAutor = useCallback((dados) => {
    comPersistencia(setEstado, (prev) => {
      if (dados.id) {
        return {
          ...prev,
          autores: prev.autores.map((a) =>
            a.id === dados.id ? { ...a, ...dados } : a,
          ),
        }
      }
      const novo = { id: novoId(), nome: dados.nome }
      return { ...prev, autores: [...prev.autores, novo] }
    })
  }, [])

  const excluirAutor = useCallback((id) => {
    comPersistencia(setEstado, (prev) => ({
      ...prev,
      autores: prev.autores.filter((a) => a.id !== id),
    }))
  }, [])

  const salvarLivro = useCallback((dados) => {
    comPersistencia(setEstado, (prev) => {
      if (dados.id) {
        return {
          ...prev,
          livros: prev.livros.map((l) =>
            l.id === dados.id
              ? {
                  ...l,
                  titulo: dados.titulo,
                  isbn: dados.isbn,
                  categoriaId: dados.categoriaId,
                  autorIds: dados.autorIds,
                  exemplaresTotal: Number(dados.exemplaresTotal),
                  exemplaresDisponiveis: Math.min(
                    Number(dados.exemplaresDisponiveis),
                    Number(dados.exemplaresTotal),
                  ),
                  ano: Number(dados.ano) || l.ano,
                  capaUrl:
                    typeof dados.capaUrl === 'string'
                      ? dados.capaUrl.trim()
                      : l.capaUrl || '',
                }
              : l,
          ),
        }
      }
      const total = Number(dados.exemplaresTotal) || 1
      const novo = {
        id: novoId(),
        titulo: dados.titulo,
        isbn: dados.isbn || '',
        categoriaId: dados.categoriaId,
        autorIds: Array.isArray(dados.autorIds) ? dados.autorIds : [],
        exemplaresTotal: total,
        exemplaresDisponiveis: total,
        ano: Number(dados.ano) || new Date().getFullYear(),
        capaUrl:
          typeof dados.capaUrl === 'string' ? dados.capaUrl.trim() : '',
      }
      return { ...prev, livros: [...prev.livros, novo] }
    })
  }, [])

  const excluirLivro = useCallback((id) => {
    comPersistencia(setEstado, (prev) => ({
      ...prev,
      livros: prev.livros.filter((l) => l.id !== id),
      reservas: prev.reservas.filter((r) => r.livroId !== id),
      emprestimos: prev.emprestimos.filter((e) => e.livroId !== id),
    }))
  }, [])

  /** Retorna o id do usuário criado ou o id atualizado. */
  const salvarUsuario = useCallback((dados) => {
    const idNovo = dados.id ? null : novoId()
    comPersistencia(setEstado, (prev) => {
      if (dados.id) {
        const patch = { ...dados }
        if (!patch.senha) {
          const antigo = prev.usuarios.find((u) => u.id === dados.id)
          patch.senha = antigo?.senha
        }
        return {
          ...prev,
          usuarios: prev.usuarios.map((u) =>
            u.id === dados.id
              ? { ...u, ...patch, perfil: dados.perfil || u.perfil }
              : u,
          ),
        }
      }
      const novo = {
        id: idNovo,
        email: dados.email,
        nome: dados.nome,
        senha: dados.senha,
        perfil: dados.perfil || 'usuario',
        avatarUrl: dados.avatarUrl || AVATAR_PADRAO_URL,
      }
      return { ...prev, usuarios: [...prev.usuarios, novo] }
    })
    return dados.id || idNovo
  }, [])

  const excluirUsuario = useCallback((id) => {
    comPersistencia(setEstado, (prev) => ({
      ...prev,
      usuarios: prev.usuarios.filter((u) => u.id !== id),
    }))
  }, [])

  const adicionarNotificacao = useCallback((usuarioId, { titulo, mensagem, tipo }) => {
    comPersistencia(setEstado, (prev) => ({
      ...prev,
      notificacoes: [
        {
          id: novoId(),
          usuarioId,
          titulo,
          mensagem,
          tipo: tipo || 'sistema',
          lida: false,
          criadaEm: new Date().toISOString(),
        },
        ...prev.notificacoes,
      ],
    }))
  }, [])

  const marcarNotificacaoLida = useCallback((id) => {
    comPersistencia(setEstado, (prev) => ({
      ...prev,
      notificacoes: prev.notificacoes.map((n) =>
        n.id === id ? { ...n, lida: true } : n,
      ),
    }))
  }, [])

  const marcarTodasNotificacoesLidas = useCallback((usuarioId) => {
    comPersistencia(setEstado, (prev) => ({
      ...prev,
      notificacoes: prev.notificacoes.map((n) =>
        n.usuarioId === usuarioId ? { ...n, lida: true } : n,
      ),
    }))
  }, [])

  const criarReserva = useCallback((usuarioId, livroId) => {
    let erro = null
    comPersistencia(setEstado, (prev) => {
      const livro = prev.livros.find((l) => l.id === livroId)
      if (!livro) {
        erro = 'Livro não encontrado.'
        return prev
      }
      if (livro.exemplaresDisponiveis < 1) {
        erro = 'Não há exemplares disponíveis para reserva.'
        return prev
      }
      const ativas = prev.reservas.filter(
        (r) => r.usuarioId === usuarioId && r.status === 'ativa',
      )
      if (ativas.length >= prev.configuracao.maxReservasPorUsuario) {
        erro = `Limite de ${prev.configuracao.maxReservasPorUsuario} reservas ativas atingido.`
        return prev
      }
      const duplicada = prev.reservas.some(
        (r) =>
          r.usuarioId === usuarioId &&
          r.livroId === livroId &&
          r.status === 'ativa',
      )
      if (duplicada) {
        erro = 'Você já possui reserva ativa para este livro.'
        return prev
      }
      const reserva = {
        id: novoId(),
        livroId,
        usuarioId,
        status: 'ativa',
        criadaEm: new Date().toISOString(),
      }
      const notif = {
        id: novoId(),
        usuarioId,
        titulo: 'Reserva confirmada',
        mensagem: `Sua reserva do livro "${livro.titulo}" foi registrada.`,
        tipo: 'reserva',
        lida: false,
        criadaEm: new Date().toISOString(),
      }
      return {
        ...prev,
        reservas: [reserva, ...prev.reservas],
        notificacoes: [notif, ...prev.notificacoes],
      }
    })
    return { ok: !erro, erro }
  }, [])

  const atenderReservaComEmprestimo = useCallback((reservaId) => {
    let erro = null
    comPersistencia(setEstado, (prev) => {
      const reserva = prev.reservas.find((r) => r.id === reservaId)
      if (!reserva || reserva.status !== 'ativa') {
        erro = 'Reserva não encontrada ou não está ativa.'
        return prev
      }
      const livro = prev.livros.find((l) => l.id === reserva.livroId)
      if (!livro || livro.exemplaresDisponiveis < 1) {
        erro = 'Sem exemplar disponível para empréstimo.'
        return prev
      }
      const prazo = prev.configuracao.prazoEmprestimoDias
      const hoje = new Date()
      const prevista = new Date(hoje)
      prevista.setDate(prevista.getDate() + prazo)
      const emprestimo = {
        id: novoId(),
        livroId: reserva.livroId,
        usuarioId: reserva.usuarioId,
        reservaId: reserva.id,
        dataRetirada: hoje.toISOString(),
        dataPrevistaDevolucao: prevista.toISOString(),
        dataDevolucao: null,
        status: 'ativo',
      }
      const livros = prev.livros.map((l) =>
        l.id === livro.id
          ? { ...l, exemplaresDisponiveis: l.exemplaresDisponiveis - 1 }
          : l,
      )
      const reservas = prev.reservas.map((r) =>
        r.id === reserva.id ? { ...r, status: 'atendida' } : r,
      )
      const notif = {
        id: novoId(),
        usuarioId: reserva.usuarioId,
        titulo: 'Empréstimo realizado',
        mensagem: `Retirada registrada: "${livro.titulo}". Devolver até ${prevista.toLocaleDateString('pt-BR')}.`,
        tipo: 'emprestimo',
        lida: false,
        criadaEm: new Date().toISOString(),
      }
      return {
        ...prev,
        livros,
        reservas,
        emprestimos: [emprestimo, ...prev.emprestimos],
        notificacoes: [notif, ...prev.notificacoes],
      }
    })
    return { ok: !erro, erro }
  }, [])

  const criarEmprestimoDireto = useCallback((usuarioId, livroId) => {
    let erro = null
    comPersistencia(setEstado, (prev) => {
      const livro = prev.livros.find((l) => l.id === livroId)
      if (!livro || livro.exemplaresDisponiveis < 1) {
        erro = 'Sem exemplar disponível.'
        return prev
      }
      const prazo = prev.configuracao.prazoEmprestimoDias
      const hoje = new Date()
      const prevista = new Date(hoje)
      prevista.setDate(prevista.getDate() + prazo)
      const emprestimo = {
        id: novoId(),
        livroId,
        usuarioId,
        reservaId: null,
        dataRetirada: hoje.toISOString(),
        dataPrevistaDevolucao: prevista.toISOString(),
        dataDevolucao: null,
        status: 'ativo',
      }
      const livros = prev.livros.map((l) =>
        l.id === livro.id
          ? { ...l, exemplaresDisponiveis: l.exemplaresDisponiveis - 1 }
          : l,
      )
      const notif = {
        id: novoId(),
        usuarioId,
        titulo: 'Empréstimo realizado',
        mensagem: `Retirada: "${livro.titulo}". Devolução até ${prevista.toLocaleDateString('pt-BR')}.`,
        tipo: 'emprestimo',
        lida: false,
        criadaEm: new Date().toISOString(),
      }
      return {
        ...prev,
        livros,
        emprestimos: [emprestimo, ...prev.emprestimos],
        notificacoes: [notif, ...prev.notificacoes],
      }
    })
    return { ok: !erro, erro }
  }, [])

  const registrarDevolucao = useCallback((emprestimoId) => {
    let erro = null
    comPersistencia(setEstado, (prev) => {
      const emp = prev.emprestimos.find((e) => e.id === emprestimoId)
      if (!emp || emp.status !== 'ativo') {
        erro = 'Empréstimo não encontrado ou já devolvido.'
        return prev
      }
      const agora = new Date().toISOString()
      const prevista = new Date(emp.dataPrevistaDevolucao)
      const atrasado = new Date() > prevista
      const livros = prev.livros.map((l) =>
        l.id === emp.livroId
          ? {
              ...l,
              exemplaresDisponiveis: Math.min(
                l.exemplaresTotal,
                l.exemplaresDisponiveis + 1,
              ),
            }
          : l,
      )
      const emprestimos = prev.emprestimos.map((e) =>
        e.id === emprestimoId
          ? { ...e, status: 'devolvido', dataDevolucao: agora }
          : e,
      )
      const livro = prev.livros.find((l) => l.id === emp.livroId)
      const notif = {
        id: novoId(),
        usuarioId: emp.usuarioId,
        titulo: atrasado
          ? 'Devolução registrada (com atraso)'
          : 'Devolução registrada',
        mensagem: atrasado
          ? `O livro "${livro?.titulo}" foi devolvido após o prazo.`
          : `O livro "${livro?.titulo}" foi devolvido dentro do prazo.`,
        tipo: atrasado ? 'atraso' : 'emprestimo',
        lida: false,
        criadaEm: agora,
      }
      return {
        ...prev,
        livros,
        emprestimos,
        notificacoes: [notif, ...prev.notificacoes],
      }
    })
    return { ok: !erro, erro }
  }, [])

  const cancelarReserva = useCallback((reservaId) => {
    comPersistencia(setEstado, (prev) => ({
      ...prev,
      reservas: prev.reservas.map((r) =>
        r.id === reservaId && r.status === 'ativa'
          ? { ...r, status: 'cancelada' }
          : r,
      ),
    }))
  }, [])

  const atualizarConfiguracao = useCallback((patch) => {
    comPersistencia(setEstado, (prev) => ({
      ...prev,
      configuracao: { ...prev.configuracao, ...patch },
    }))
  }, [])

  const reiniciarDadosDemo = useCallback(() => {
    const inicial = reiniciarDemonstracao()
    setEstado(inicial)
    return inicial
  }, [])

  const emprestimosComStatus = useMemo(() => {
    const hoje = new Date()
    return estado.emprestimos.map((e) => {
      if (e.status !== 'ativo') return e
      const atrasado = hoje > new Date(e.dataPrevistaDevolucao)
      return { ...e, atrasado }
    })
  }, [estado.emprestimos])

  const valor = useMemo(
    () => ({
      estado,
      livrosComDetalhes,
      emprestimosComStatus,
      salvarCategoria,
      excluirCategoria,
      salvarAutor,
      excluirAutor,
      salvarLivro,
      excluirLivro,
      salvarUsuario,
      excluirUsuario,
      criarReserva,
      cancelarReserva,
      atenderReservaComEmprestimo,
      criarEmprestimoDireto,
      registrarDevolucao,
      adicionarNotificacao,
      marcarNotificacaoLida,
      marcarTodasNotificacoesLidas,
      atualizarConfiguracao,
      reiniciarDadosDemo,
    }),
    [
      estado,
      livrosComDetalhes,
      emprestimosComStatus,
      salvarCategoria,
      excluirCategoria,
      salvarAutor,
      excluirAutor,
      salvarLivro,
      excluirLivro,
      salvarUsuario,
      excluirUsuario,
      criarReserva,
      cancelarReserva,
      atenderReservaComEmprestimo,
      criarEmprestimoDireto,
      registrarDevolucao,
      adicionarNotificacao,
      marcarNotificacaoLida,
      marcarTodasNotificacoesLidas,
      atualizarConfiguracao,
      reiniciarDadosDemo,
    ],
  )

  return (
    <BibliotecaContexto.Provider value={valor}>
      {children}
    </BibliotecaContexto.Provider>
  )
}
