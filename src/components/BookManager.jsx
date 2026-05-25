import { useMemo, useState } from 'react'
import { createBook, deleteBook, updateBook } from '../services/api'

const emptyBook = {
  title: '',
  author_name: '',
}

function BookManager({ books, loans, isStaff, loading, token, onBooksChange, onNotice }) {
  // Check which books are currently on loan
  const booksOnLoan = useMemo(() => {
    if (!loans) return new Set()
    return new Set(
      loans
        .filter((loan) => {
          const returnedAt = loan.returned_at || loan.returnedAt || loan.returned_date || loan.returnedDate
          const status = String(loan.status || '').toLowerCase()
          return !returnedAt && status !== 'returned'
        })
        .map((loan) => loan.book_id || loan.bookId)
    )
  }, [loans])
  const [form, setForm] = useState(emptyBook)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const resetForm = () => {
    setForm(emptyBook)
    setEditingId(null)
  }

  const submitBook = async (event) => {
    event.preventDefault()
    if (!isStaff) {
      onNotice('Зөвхөн staff эрхтэй хэрэглэгч ном өөрчилнө.')
      return
    }

    try {
      setSubmitting(true)

      if (editingId) {
        await updateBook(token, editingId, {
          title: form.title,
        })
        onNotice('Номын нэр шинэчлэгдлээ.')
      } else {
        await createBook(token, {
          title: form.title,
          author_name: form.author_name,
        })
        onNotice('Шинэ ном нэмэгдлээ.')
      }

      resetForm()
      await onBooksChange()
    } catch (error) {
      onNotice(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (book) => {
    setEditingId(book.id)
    setForm({
      title: book.title,
      author_name: book.author_name || '',
    })
  }

  const removeBook = async (book) => {
    try {
      setSubmitting(true)
      await deleteBook(token, book.id)
      onNotice(`"${book.title}" устгагдлаа.`)
      await onBooksChange()
    } catch (error) {
      onNotice(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass =
    'mt-1.5 w-full rounded-2xl border border-rose-200/80 bg-white/85 px-4 py-3 outline-none transition placeholder:text-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 disabled:bg-rose-50/70'

  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-[0_22px_70px_rgba(154,90,120,0.14)] backdrop-blur">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-500">
              Collection
            </div>
            <h2 className="mt-3 font-['Georgia'] text-3xl font-semibold text-rose-950">
              Номын жагсаалт
            </h2>
            <p className="mt-2 text-sm text-rose-700/75">
              Server: <span className="font-semibold text-rose-950">http://localhost:3000</span>
            </p>
          </div>
          <button
            className="rounded-full border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
            type="button"
            onClick={onBooksChange}
            disabled={!token || loading}
          >
            Шинэчлэх
          </button>
        </div>
      </div>

      {isStaff && (
        <form
          className="grid gap-4 rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-[0_22px_70px_rgba(154,90,120,0.14)] backdrop-blur md:grid-cols-[1fr_1fr_auto]"
          onSubmit={submitBook}
        >
          <label className="block">
            <span className="text-sm font-medium text-rose-800">Номын нэр</span>
            <input
              className={fieldClass}
              name="title"
              value={form.title}
              onChange={updateField}
              placeholder="Clean Code"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-rose-800">Зохиолч</span>
            <input
              className={fieldClass}
              name="author_name"
              value={form.author_name}
              onChange={updateField}
              placeholder="Robert C. Martin"
              disabled={Boolean(editingId)}
              required={!editingId}
            />
          </label>

          <div className="flex items-end gap-2">
            <button
              className="min-h-12 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_36px_rgba(219,112,147,0.35)] transition hover:from-rose-500 hover:to-pink-500 disabled:opacity-60"
              type="submit"
              disabled={submitting}
            >
              {editingId ? 'Засах' : 'Нэмэх'}
            </button>
            {editingId && (
              <button
                className="min-h-12 rounded-full border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-700"
                type="button"
                onClick={resetForm}
              >
                Болих
              </button>
            )}
          </div>
        </form>
      )}

      {token && !isStaff && (
        <div className="rounded-[1.5rem] border border-pink-200 bg-pink-50/80 px-4 py-3 text-sm text-rose-800 shadow-sm">
          Member эрхтэй хэрэглэгч номын жагсаалтыг зөвхөн харж уншина.
        </div>
      )}

      <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 shadow-[0_22px_70px_rgba(154,90,120,0.14)] backdrop-blur">
        {!token ? (
          <div className="px-6 py-16 text-center text-rose-700/75">
            Номын жагсаалт харахын тулд эхлээд нэвтэрнэ үү.
          </div>
        ) : loading ? (
          <div className="px-6 py-16 text-center text-rose-700/75">Уншиж байна...</div>
        ) : books.length === 0 ? (
          <div className="px-6 py-16 text-center text-rose-700/75">
            Одоогоор ном бүртгэгдээгүй байна.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gradient-to-r from-rose-50 to-pink-50 text-xs uppercase tracking-[0.22em] text-rose-500">
                <tr>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Ном</th>
                  <th className="px-5 py-4">Зохиолч</th>
                  {isStaff && <th className="px-5 py-4 text-right">Үйлдэл</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100/80">
                {books.map((book) => (
                  <tr key={book.id} className="transition hover:bg-rose-50/45">
                    <td className="px-5 py-4 font-mono text-xs text-rose-400">{book.id}</td>
                    <td className="px-5 py-4 font-semibold text-rose-950">{book.title}</td>
                    <td className="px-5 py-4 text-rose-800">{book.author_name || 'Тодорхойгүй'}</td>
                    {isStaff && (
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-full border border-rose-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-700"
                            type="button"
                            onClick={() => startEdit(book)}
                          >
                            Засах
                          </button>
                          <button
                            className="rounded-full border border-pink-200 bg-pink-50 px-3.5 py-2 text-xs font-semibold text-pink-700 transition hover:bg-pink-100 disabled:opacity-60"
                            type="button"
                            onClick={() => removeBook(book)}
                            disabled={submitting}
                            title="Номыг устгах"
                          >
                            Устгах
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default BookManager
