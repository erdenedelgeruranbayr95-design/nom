import LoanManager from '../components/LoanManager'
import StatCard from '../components/StatCard'
import { useMemo } from 'react'

function LoansPage({ books, loans, isStaff, loading, token, user, onLoansChange, onNotice }) {
    const visibleLoans = useMemo(() => {
        if (isStaff) {
            return loans
        }

        return loans.filter((loan) => {
            const memberUserId = loan.member_user_id || loan.memberUserId || loan.user_id || loan.userId
            return String(memberUserId) === String(user?.id)
        })
    }, [isStaff, loans, user?.id])

    const loanSummary = useMemo(() => {
        return visibleLoans.reduce(
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
    }, [visibleLoans])

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(252,244,247,0.96)_42%,_rgba(247,237,242,0.98)_100%)] text-rose-950 pb-12">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,214,230,0.9),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(245,199,221,0.7),_transparent_30%)]" />

            <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 grid gap-4 sm:grid-cols-2">
                    <StatCard
                        label={isStaff ? 'Active Loans' : 'My Active Loans'}
                        value={loanSummary.active}
                        accent="peach"
                    />
                    <StatCard label="Overdue" value={loanSummary.overdue} accent="blush" />
                </div>

                <LoanManager
                    books={books}
                    isStaff={isStaff}
                    loading={loading}
                    token={token}
                    user={user}
                    loans={visibleLoans}
                    onLoansChange={onLoansChange}
                    onNotice={onNotice}
                />
            </section>
        </main>
    )
}

export default LoansPage
