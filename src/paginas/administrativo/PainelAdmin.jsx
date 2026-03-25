import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'

/** Resumo operacional: contagens rápidas para o administrador. */
export default function PainelAdmin() {
  const { estado } = useBiblioteca()

  const stats = useMemo(() => {
    const reservasAtivas = estado.reservas.filter((r) => r.status === 'ativa').length
    const emprestimosAtivos = estado.emprestimos.filter((e) => e.status === 'ativo')
      .length
    const atrasos = estado.emprestimos.filter((e) => {
      if (e.status !== 'ativo') return false
      return new Date() > new Date(e.dataPrevistaDevolucao)
    }).length
    return {
      livros: estado.livros.length,
      usuarios: estado.usuarios.length,
      reservasAtivas,
      emprestimosAtivos,
      atrasos,
    }
  }, [estado])

  const cards = [
    { label: 'Títulos no acervo', valor: stats.livros, to: '/admin/livros' },
    { label: 'Usuários cadastrados', valor: stats.usuarios, to: '/admin/usuarios' },
    { label: 'Reservas ativas', valor: stats.reservasAtivas, to: '/admin/reservas' },
    { label: 'Empréstimos em curso', valor: stats.emprestimosAtivos, to: '/admin/emprestimos' },
    {
      label: 'Possíveis atrasos (hoje)',
      valor: stats.atrasos,
      to: '/admin/devolucao',
      destaque: stats.atrasos > 0,
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Painel</h1>
      <p className="mt-1 text-slate-600">
        Visão geral do acervo e da operação — alinhado ao fluxo: consulta, reserva,
        empréstimo, acompanhamento e devolução.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <li key={c.label}>
            <Link
              to={c.to}
              className={`block rounded-xl border p-5 shadow-sm transition hover:shadow-md ${
                c.destaque
                  ? 'border-amber-300 bg-amber-50/80'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
              }`}
            >
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{c.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{c.valor}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
