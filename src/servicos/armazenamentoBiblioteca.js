/**
 * Camada de persistência MVP: simula backend com localStorage.
 * Em produção, substituir por API REST/GraphQL e autenticação real.
 */

const CHAVE = 'biblioteca_corp_estado_v1'

/** Gera identificador único simples para registros novos. */
export function novoId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Estado inicial com dados de demonstração para a V1. */
function estadoSemeado() {
  const catFic = novoId()
  const catNeg = novoId()
  const aut1 = novoId()
  const aut2 = novoId()
  const liv1 = novoId()
  const liv2 = novoId()
  const adminId = novoId()
  const userId = novoId()

  return {
    usuarios: [
      {
        id: adminId,
        email: 'admin@empresa.com',
        nome: 'Administrador',
        senha: 'admin',
        perfil: 'admin',
        avatarUrl: '/avatars/avatar-1.svg',
      },
      {
        id: userId,
        email: 'usuario@empresa.com',
        nome: 'Maria Silva',
        senha: '123456',
        perfil: 'usuario',
        avatarUrl: '/avatars/avatar-2.svg',
      },
    ],
    categorias: [
      { id: catFic, nome: 'Ficção', descricao: 'Romances e contos' },
      { id: catNeg, nome: 'Negócios', descricao: 'Gestão e liderança' },
    ],
    autores: [
      { id: aut1, nome: 'Clarice Lispector' },
      { id: aut2, nome: 'Peter Drucker' },
    ],
    livros: [
      {
        id: liv1,
        titulo: 'A Hora da Estrela',
        isbn: '978-85-359-0277-1',
        categoriaId: catFic,
        autorIds: [aut1],
        exemplaresTotal: 3,
        exemplaresDisponiveis: 2,
        ano: 1977,
      },
      {
        id: liv2,
        titulo: 'Administração de Empresas',
        isbn: '978-85-352-3678-2',
        categoriaId: catNeg,
        autorIds: [aut2],
        exemplaresTotal: 2,
        exemplaresDisponiveis: 2,
        ano: 2006,
      },
    ],
    reservas: [],
    emprestimos: [],
    notificacoes: [],
    configuracao: {
      prazoEmprestimoDias: 14,
      maxReservasPorUsuario: 3,
      diasExpiracaoReserva: 3,
    },
  }
}

/** Lê o estado salvo ou cria o seed na primeira execução. */
export function carregarEstado() {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) {
      const inicial = estadoSemeado()
      localStorage.setItem(CHAVE, JSON.stringify(inicial))
      return inicial
    }
    return JSON.parse(bruto)
  } catch {
    const inicial = estadoSemeado()
    localStorage.setItem(CHAVE, JSON.stringify(inicial))
    return inicial
  }
}

/** Persiste o estado completo no navegador. */
export function salvarEstado(estado) {
  localStorage.setItem(CHAVE, JSON.stringify(estado))
}

/** Reseta para dados de demonstração (útil em testes). */
export function reiniciarDemonstracao() {
  const inicial = estadoSemeado()
  salvarEstado(inicial)
  return inicial
}
