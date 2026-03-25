import { useMemo } from 'react'
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.jsx'
import { useBiblioteca } from '../../contextos/BibliotecaContexto.jsx'
import { formatarData } from '../../utilitarios/datas.js'
import { NOME_SISTEMA } from '../../utilitarios/marca.js'

/** Empréstimos do usuário: prazos e situação (inclui alerta visual de atraso). */
export default function MeusEmprestimosUsuario() {
  const { usuarioAtual } = useAutenticacao()
  const { estado, emprestimosComStatus } = useBiblioteca()

  const meus = useMemo(
    () =>
      emprestimosComStatus
        .filter((e) => e.usuarioId === usuarioAtual?.id)
        .sort((a, b) => new Date(b.dataRetirada) - new Date(a.dataRetirada)),
    [emprestimosComStatus, usuarioAtual?.id],
  )

  function tituloLivro(id) {
    return estado.livros.find((l) => l.id === id)?.titulo || '—'
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Meus empréstimos</h1>
      <p className="mt-1 text-slate-600">
        A devolução é registrada pelo administrador na {NOME_SISTEMA}.
      </p>

      <ul className="mt-8 space-y-3">
        {meus.length === 0 && (
          <li className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Nenhum empréstimo encontrado.
          </li>
        )}
        {meus.map((e) => (
          <li
            key={e.id}
            className={`rounded-xl border p-4 ${
              e.status === 'ativo' && e.atrasado
                ? 'border-amber-300 bg-amber-50/50'
                : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
            }`}
          >
            <p className="font-semibold text-slate-900">{tituloLivro(e.livroId)}</p>
            <p className="text-sm text-slate-600">
              Retirada: {formatarData(e.dataRetirada)} · Devolução prevista:{' '}
              {formatarData(e.dataPrevistaDevolucao)}
            </p>
            {e.status === 'devolvido' && (
              <p className="mt-1 text-sm text-brand-foreground">
                Devolvido em {formatarData(e.dataDevolucao)}
              </p>
            )}
            {e.status === 'ativo' && (
              <p className="mt-2 text-sm font-medium">
                {e.atrasado ? (
                  <span className="text-amber-900">
                    Em atraso — regularize com a {NOME_SISTEMA}.
                  </span>
                ) : (
                  <span className="text-brand-foreground">Dentro do prazo</span>
                )}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
