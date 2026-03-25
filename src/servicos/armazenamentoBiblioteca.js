/**
 * Camada de persistência MVP: simula backend com localStorage.
 * Em produção, substituir por API REST/GraphQL e autenticação real.
 */

const CHAVE = 'biblioteca_corp_estado_v1'
const SEED_VERSAO = 2

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
  const u2 = novoId()
  const u3 = novoId()
  const u4 = novoId()
  const u5 = novoId()
  const u6 = novoId()
  const u7 = novoId()
  const u8 = novoId()
  const u9 = novoId()
  const u10 = novoId()
  const u11 = novoId()

  return {
    _meta: { seedVersao: SEED_VERSAO },
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
      {
        id: u2,
        email: 'joao.pereira@empresa.com',
        nome: 'João Pereira',
        senha: '123456',
        perfil: 'usuario',
        avatarUrl: '/avatars/avatar-3.svg',
      },
      {
        id: u3,
        email: 'ana.santos@empresa.com',
        nome: 'Ana Santos',
        senha: '123456',
        perfil: 'usuario',
        avatarUrl: '/avatars/avatar-4.svg',
      },
      {
        id: u4,
        email: 'lucas.almeida@empresa.com',
        nome: 'Lucas Almeida',
        senha: '123456',
        perfil: 'usuario',
        avatarUrl: '/avatars/avatar-5.svg',
      },
      {
        id: u5,
        email: 'beatriz.costa@empresa.com',
        nome: 'Beatriz Costa',
        senha: '123456',
        perfil: 'usuario',
        avatarUrl: '/avatars/avatar-6.svg',
      },
      {
        id: u6,
        email: 'rafael.oliveira@empresa.com',
        nome: 'Rafael Oliveira',
        senha: '123456',
        perfil: 'usuario',
        avatarUrl: '/avatars/avatar-7.svg',
      },
      {
        id: u7,
        email: 'carla.lima@empresa.com',
        nome: 'Carla Lima',
        senha: '123456',
        perfil: 'usuario',
        avatarUrl: '/avatars/avatar-8.svg',
      },
      {
        id: u8,
        email: 'diego.souza@empresa.com',
        nome: 'Diego Souza',
        senha: '123456',
        perfil: 'usuario',
        avatarUrl: '/avatars/avatar-9.svg',
      },
      {
        id: u9,
        email: 'paula.rocha@empresa.com',
        nome: 'Paula Rocha',
        senha: '123456',
        perfil: 'usuario',
        avatarUrl: '/avatars/avatar-10.svg',
      },
      {
        id: u10,
        email: 'fernando.mendes@empresa.com',
        nome: 'Fernando Mendes',
        senha: '123456',
        perfil: 'usuario',
        avatarUrl: '/avatars/avatar-11.svg',
      },
      {
        id: u11,
        email: 'juliana.fernandes@empresa.com',
        nome: 'Juliana Fernandes',
        senha: '123456',
        perfil: 'usuario',
        avatarUrl: '/avatars/avatar-12.svg',
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
    emprestimos: [
      // Devolvidos (para o ranking aparecer com exemplos)
      {
        id: novoId(),
        livroId: liv1,
        usuarioId: userId,
        reservaId: null,
        dataRetirada: '2026-02-01T10:00:00.000Z',
        dataPrevistaDevolucao: '2026-02-15T10:00:00.000Z',
        dataDevolucao: '2026-02-10T10:00:00.000Z',
        status: 'devolvido',
      },
      {
        id: novoId(),
        livroId: liv2,
        usuarioId: userId,
        reservaId: null,
        dataRetirada: '2026-02-20T10:00:00.000Z',
        dataPrevistaDevolucao: '2026-03-06T10:00:00.000Z',
        dataDevolucao: '2026-03-02T10:00:00.000Z',
        status: 'devolvido',
      },
      {
        id: novoId(),
        livroId: liv1,
        usuarioId: u2,
        reservaId: null,
        dataRetirada: '2026-02-05T10:00:00.000Z',
        dataPrevistaDevolucao: '2026-02-19T10:00:00.000Z',
        dataDevolucao: '2026-02-18T10:00:00.000Z',
        status: 'devolvido',
      },
      {
        id: novoId(),
        livroId: liv2,
        usuarioId: u3,
        reservaId: null,
        dataRetirada: '2026-02-07T10:00:00.000Z',
        dataPrevistaDevolucao: '2026-02-21T10:00:00.000Z',
        dataDevolucao: '2026-02-20T10:00:00.000Z',
        status: 'devolvido',
      },
      {
        id: novoId(),
        livroId: liv1,
        usuarioId: u3,
        reservaId: null,
        dataRetirada: '2026-03-01T10:00:00.000Z',
        dataPrevistaDevolucao: '2026-03-15T10:00:00.000Z',
        dataDevolucao: '2026-03-10T10:00:00.000Z',
        status: 'devolvido',
      },
      {
        id: novoId(),
        livroId: liv2,
        usuarioId: u4,
        reservaId: null,
        dataRetirada: '2026-02-10T10:00:00.000Z',
        dataPrevistaDevolucao: '2026-02-24T10:00:00.000Z',
        dataDevolucao: '2026-02-22T10:00:00.000Z',
        status: 'devolvido',
      },
      {
        id: novoId(),
        livroId: liv1,
        usuarioId: u4,
        reservaId: null,
        dataRetirada: '2026-03-05T10:00:00.000Z',
        dataPrevistaDevolucao: '2026-03-19T10:00:00.000Z',
        dataDevolucao: '2026-03-16T10:00:00.000Z',
        status: 'devolvido',
      },
      {
        id: novoId(),
        livroId: liv2,
        usuarioId: u4,
        reservaId: null,
        dataRetirada: '2026-03-20T10:00:00.000Z',
        dataPrevistaDevolucao: '2026-04-03T10:00:00.000Z',
        dataDevolucao: '2026-03-28T10:00:00.000Z',
        status: 'devolvido',
      },
      {
        id: novoId(),
        livroId: liv1,
        usuarioId: u5,
        reservaId: null,
        dataRetirada: '2026-02-12T10:00:00.000Z',
        dataPrevistaDevolucao: '2026-02-26T10:00:00.000Z',
        dataDevolucao: '2026-02-25T10:00:00.000Z',
        status: 'devolvido',
      },
      {
        id: novoId(),
        livroId: liv2,
        usuarioId: u6,
        reservaId: null,
        dataRetirada: '2026-02-14T10:00:00.000Z',
        dataPrevistaDevolucao: '2026-02-28T10:00:00.000Z',
        dataDevolucao: '2026-02-27T10:00:00.000Z',
        status: 'devolvido',
      },
      {
        id: novoId(),
        livroId: liv1,
        usuarioId: u6,
        reservaId: null,
        dataRetirada: '2026-03-08T10:00:00.000Z',
        dataPrevistaDevolucao: '2026-03-22T10:00:00.000Z',
        dataDevolucao: '2026-03-18T10:00:00.000Z',
        status: 'devolvido',
      },
      {
        id: novoId(),
        livroId: liv2,
        usuarioId: u7,
        reservaId: null,
        dataRetirada: '2026-02-16T10:00:00.000Z',
        dataPrevistaDevolucao: '2026-03-02T10:00:00.000Z',
        dataDevolucao: '2026-03-01T10:00:00.000Z',
        status: 'devolvido',
      },
      {
        id: novoId(),
        livroId: liv1,
        usuarioId: u8,
        reservaId: null,
        dataRetirada: '2026-02-18T10:00:00.000Z',
        dataPrevistaDevolucao: '2026-03-04T10:00:00.000Z',
        dataDevolucao: '2026-03-03T10:00:00.000Z',
        status: 'devolvido',
      },
      {
        id: novoId(),
        livroId: liv2,
        usuarioId: u9,
        reservaId: null,
        dataRetirada: '2026-02-19T10:00:00.000Z',
        dataPrevistaDevolucao: '2026-03-05T10:00:00.000Z',
        dataDevolucao: '2026-03-04T10:00:00.000Z',
        status: 'devolvido',
      },
      {
        id: novoId(),
        livroId: liv1,
        usuarioId: u10,
        reservaId: null,
        dataRetirada: '2026-02-22T10:00:00.000Z',
        dataPrevistaDevolucao: '2026-03-08T10:00:00.000Z',
        dataDevolucao: '2026-03-07T10:00:00.000Z',
        status: 'devolvido',
      },
      {
        id: novoId(),
        livroId: liv2,
        usuarioId: u11,
        reservaId: null,
        dataRetirada: '2026-02-25T10:00:00.000Z',
        dataPrevistaDevolucao: '2026-03-11T10:00:00.000Z',
        dataDevolucao: '2026-03-10T10:00:00.000Z',
        status: 'devolvido',
      },
    ],
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
    const atual = JSON.parse(bruto)
    const seedVersaoAtual = atual?._meta?.seedVersao || 0
    if (seedVersaoAtual < SEED_VERSAO) {
      const inicial = estadoSemeado()
      localStorage.setItem(CHAVE, JSON.stringify(inicial))
      return inicial
    }
    return atual
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
