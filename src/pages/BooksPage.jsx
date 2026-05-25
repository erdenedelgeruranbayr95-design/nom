import BookManager from '../components/BookManager'
import StatCard from '../components/StatCard'
import { useMemo } from 'react'

function BooksPage({ books, loans, isStaff, loading, token, onBooksChange, onNotice }) {
    const authorsCount = useMemo(() => {
        return new Set(books.map((book) => book.author_name).filter(Boolean)).size
    }, [books])

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(252,244,247,0.96)_42%,_rgba(247,237,242,0.98)_100%)] text-rose-950 pb-12">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,214,230,0.9),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(245,199,221,0.7),_transparent_30%)]" />

            <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 grid gap-4 sm:grid-cols-2">
                    <StatCard label="Total Books" value={books.length} accent="rose" />
                    <StatCard label="Authors" value={authorsCount} accent="peach" />
                </div>

                <BookManager
                    books={books}
                    loans={loans}
                    isStaff={isStaff}
                    loading={loading}
                    token={token}
                    onBooksChange={onBooksChange}
                    onNotice={onNotice}
                />
            </section>
        </main>
    )
}

export default BooksPage
