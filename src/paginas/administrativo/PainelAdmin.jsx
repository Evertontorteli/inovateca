import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'

function IconeLivrosSolid() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4.5 4.75A2.25 2.25 0 016.75 2.5h7a2.25 2.25 0 012.25 2.25v16.75H6.75A2.25 2.25 0 014.5 19.25V4.75zM18 4.75v16.75h.75A2.25 2.25 0 0021 19.25V6.5a2.25 2.25 0 00-2.25-2.25H18z" />
    </svg>
  )
}

function IconeUsuariosSolid() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 12a4.25 4.25 0 100-8.5 4.25 4.25 0 000 8.5zM4.5 19.25a6.75 6.75 0 0113.5 0v.75H4.5v-.75zM18.75 10.5a3.25 3.25 0 100-6.5 3.25 3.25 0 000 6.5zM18.5 14.5a5.5 5.5 0 015 5.5h-3a8.2 8.2 0 00-1.7-5.04c-.1-.13-.2-.3-.3-.46z" />
    </svg>
  )
}

function IconeReservasSolid() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 3.5A2.5 2.5 0 003.5 6v14.5l8.5-3.75 8.5 3.75V6A2.5 2.5 0 0018 3.5H6z" />
    </svg>
  )
}

function IconeEmprestimosSolid() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.75 3.5a1 1 0 00-1 1v2.25h-6a1 1 0 100 2h6v2.25a1 1 0 001.7.71l3.5-3.5a1 1 0 000-1.42l-3.5-3.5a1 1 0 00-.7-.29zM10.25 20.5a1 1 0 001-1v-2.25h6a1 1 0 100-2h-6V13a1 1 0 00-1.7-.71l-3.5 3.5a1 1 0 000 1.42l3.5 3.5a1 1 0 00.7.29z" />
    </svg>
  )
}

function IconeAtrasosSolid() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M12 2.75a9.25 9.25 0 100 18.5 9.25 9.25 0 000-18.5zM12 7a1 1 0 011 1v3.5a1 1 0 01-.3.71l-2.25 2.25a1 1 0 11-1.4-1.42L11 11.34V8a1 1 0 011-1zm.75 8.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" clipRule="evenodd" />
    </svg>
  )
}

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
    {
      label: 'Títulos no acervo',
      valor: stats.livros,
      to: '/admin/livros',
      Icon: IconeLivrosSolid,
      cor: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
      numero: 'text-sky-700 dark:text-sky-300',
      bordaDireita: 'border-r-2 border-r-sky-500 dark:border-r-sky-400',
    },
    {
      label: 'Usuários cadastrados',
      valor: stats.usuarios,
      to: '/admin/usuarios',
      Icon: IconeUsuariosSolid,
      cor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
      numero: 'text-indigo-700 dark:text-indigo-300',
      bordaDireita: 'border-r-2 border-r-indigo-500 dark:border-r-indigo-400',
    },
    {
      label: 'Reservas ativas',
      valor: stats.reservasAtivas,
      to: '/admin/reservas',
      Icon: IconeReservasSolid,
      cor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
      numero: 'text-cyan-700 dark:text-cyan-300',
      bordaDireita: 'border-r-2 border-r-cyan-500 dark:border-r-cyan-400',
    },
    {
      label: 'Empréstimos em curso',
      valor: stats.emprestimosAtivos,
      to: '/admin/emprestimos',
      Icon: IconeEmprestimosSolid,
      cor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
      numero: 'text-violet-700 dark:text-violet-300',
      bordaDireita: 'border-r-2 border-r-violet-500 dark:border-r-violet-400',
    },
    {
      label: 'Possíveis atrasos (hoje)',
      valor: stats.atrasos,
      to: '/admin/devolucao',
      destaque: stats.atrasos > 0,
      Icon: IconeAtrasosSolid,
      cor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      numero: 'text-amber-700 dark:text-amber-300',
      bordaDireita: 'border-r-2 border-r-amber-500 dark:border-r-amber-400',
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

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((c) => (
            <li key={c.label}>
              <Link
                to={c.to}
                className={`block rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
                  c.destaque
                    ? 'border-amber-300 bg-amber-50/80'
                    : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                } ${c.bordaDireita}`}
              >
                <div className="flex items-start justify-between">
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${c.cor}`}>
                    <c.Icon />
                  </span>
                  <p className={`text-3xl font-semibold ${c.numero}`}>{c.valor}</p>
                </div>
                <p className="mt-5 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                  {c.label}
                </p>
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
