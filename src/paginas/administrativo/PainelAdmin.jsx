import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'

/** Resumo operacional: contagens rápidas para o administrador. */
export default function PainelAdmin() {
  const { estado } = useBiblioteca()
  const [rankingSoAvatares, setRankingSoAvatares] = useState(() => {
    try {
      const v = localStorage.getItem('inovateca_ranking_so_avatares_v1')
      if (v === null) return true
      return v === '1'
    } catch {
      return true
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(
        'inovateca_ranking_so_avatares_v1',
        rankingSoAvatares ? '1' : '0',
      )
    } catch {
      /* ignore */
    }
  }, [rankingSoAvatares])

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

  const rankingLeitores = useMemo(() => {
    const contagem = new Map()
    for (const e of estado.emprestimos) {
      if (e.status !== 'devolvido') continue
      contagem.set(e.usuarioId, (contagem.get(e.usuarioId) || 0) + 1)
    }
    return [...contagem.entries()]
      .map(([usuarioId, total]) => ({
        usuarioId,
        total,
        nome: estado.usuarios.find((u) => u.id === usuarioId)?.nome || '—',
        email: estado.usuarios.find((u) => u.id === usuarioId)?.email || '',
        avatarUrl: estado.usuarios.find((u) => u.id === usuarioId)?.avatarUrl || '',
      }))
      .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome))
      .slice(0, 8)
  }, [estado.emprestimos, estado.usuarios])

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
    <div className="flex min-w-0 items-start gap-6">
      <section className="min-w-0 flex-1">
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
      </section>

      <aside
        className={`sticky top-6 shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${
          rankingSoAvatares ? 'w-[4.5rem] p-3' : 'w-[22rem] p-5'
        }`}
        aria-label="Ranking de leitores"
      >
        <div className={`flex items-start ${rankingSoAvatares ? 'justify-center' : 'justify-between'} gap-3`}>
          {!rankingSoAvatares && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Ranking de leitores
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Mais livros concluídos (devolvidos).
              </p>
            </div>
          )}
          <button
            type="button"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-pressed={rankingSoAvatares}
            aria-label={rankingSoAvatares ? 'Expandir ranking' : 'Ocultar detalhes do ranking'}
            title={rankingSoAvatares ? 'Expandir' : 'Recolher'}
            onClick={() => setRankingSoAvatares((v) => !v)}
          >
            {rankingSoAvatares ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            )}
          </button>
        </div>

        {!rankingSoAvatares && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Top {rankingLeitores.length || 0}
            </span>
            <Link to="/admin/usuarios" className="text-xs font-semibold text-brand hover:underline">
              Ver usuários
            </Link>
          </div>
        )}

        {rankingSoAvatares ? (
          <div className="mt-3 flex flex-col items-center gap-3">
            {rankingLeitores.length === 0 && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                —
              </div>
            )}
            {rankingLeitores.map((r, idx) => (
              <div key={r.usuarioId} className="relative" title={`${idx + 1}º • ${r.nome} • ${r.total}`}>
                {r.avatarUrl ? (
                  <img
                    src={r.avatarUrl}
                    alt={r.nome}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {String(r.nome || '?').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0084E1] px-1 text-[10px] font-semibold text-white dark:bg-sky-400 dark:text-slate-950">
                  {idx + 1}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <ol className="mt-4 space-y-3">
            {rankingLeitores.length === 0 && (
              <li className="text-sm text-slate-500 dark:text-slate-400">
                Nenhuma leitura concluída ainda.
              </li>
            )}
            {rankingLeitores.map((r, idx) => (
              <li key={r.usuarioId} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {idx + 1}
                </span>
                {r.avatarUrl ? (
                  <img
                    src={r.avatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {String(r.nome || '?').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {r.nome}
                  </p>
                  {r.email && (
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{r.email}</p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-[#F2F9FB] px-2 py-0.5 text-xs font-semibold text-[#0084E1] dark:bg-slate-800 dark:text-sky-400">
                  {r.total}
                </span>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  )
}
