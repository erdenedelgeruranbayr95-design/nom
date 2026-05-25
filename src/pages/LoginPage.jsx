import { useMemo } from 'react'
import AuthPanel from '../components/AuthPanel'
import StatCard from '../components/StatCard'

function LoginPage({ isLoggedIn, user, isStaff, books, loans, onAuthSuccess }) {
    const authorsCount = useMemo(() => {
        return new Set(books.map((book) => book.author_name).filter(Boolean)).size
    }, [books])

    const loanSummary = useMemo(() => {
        return loans.reduce(
            (summary, loan) => {
                const dueDate = loan.due_date || loan.dueDate || loan.due_at || loan.dueAt || loan.return_date || loan.returnDate
                const returnedAt = loan.returned_at || loan.returnedAt || loan.returned_date || loan.returnedDate
                const returned = Boolean(returnedAt) || String(loan.status || '').toLowerCase() === 'returned'
                const overdue =
                    typeof loan.is_overdue === 'boolean'
                        ? loan.is_overdue
                        : !returned && Boolean(dueDate) && new Date(dueDate) < new Date()

                if (!returned) {
                    summary.active += 1
                }

                if (overdue) {
                    summary.overdue += 1
                }

                return summary
            },
            { active: 0, overdue: 0 },
        )
    }, [loans])

    if (!isLoggedIn) {
        return (
            <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(252,244,247,0.96)_42%,_rgba(247,237,242,0.98)_100%)] text-rose-950">
                <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,214,230,0.9),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(245,199,221,0.7),_transparent_30%)]" />

                <section className="mx-auto grid max-w-4xl gap-8 px-4 py-12 sm:px-6 lg:px-8 lg:grid-cols-2">
                    <div className="rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-[0_24px_80px_rgba(154,90,120,0.12)] backdrop-blur">
                        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-500">
                            5-19 Library
                        </p>
                        <h1 className="mt-4 font-['Georgia'] text-4xl font-semibold leading-tight text-rose-950">
                            Library management with a calmer, clearer workflow.
                        </h1>
                        <p className="mt-5 text-base leading-7 text-rose-800/80">
                            Manage sign-in, catalog updates, and loan tracking with a single clean
                            workspace for both staff and members.
                        </p>
                    </div>

                    <div className="rounded-[2rem] border border-white/70 bg-gradient-to-br from-rose-100/80 via-white/85 to-pink-100/70 p-6 shadow-[0_22px_70px_rgba(154,90,120,0.14)] backdrop-blur">
                        <AuthPanel onAuthSuccess={onAuthSuccess} />
                    </div>
                </section>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(252,244,247,0.96)_42%,_rgba(247,237,242,0.98)_100%)] text-rose-950 pb-12">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,214,230,0.9),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(245,199,221,0.7),_transparent_30%)]" />

            <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-[0_24px_80px_rgba(154,90,120,0.12)] backdrop-blur">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-500">
                            Welcome back
                        </p>
                        <h1 className="mt-4 font-['Georgia'] text-4xl font-semibold leading-tight text-rose-950">
                            Your reading room is ready.
                        </h1>
                        <p className="mt-5 text-base leading-7 text-rose-800/80">
                            Manage your library account, browse the catalog, and track your loans all in one place.
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                            <StatCard label="Books" value={books.length} accent="rose" />
                            <StatCard
                                label={isStaff ? 'Active loans' : 'My active loans'}
                                value={loanSummary.active}
                                accent="peach"
                            />
                            <StatCard
                                label="Overdue"
                                value={loanSummary.overdue}
                                accent="blush"
                            />
                        </div>

                        <p className="mt-6 text-sm text-rose-700/75">
                            Authors in catalog: <span className="font-semibold text-rose-950">{authorsCount}</span>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default LoginPage
