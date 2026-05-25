import { useMemo, useState } from 'react'
import { createLoan, deleteLoan } from '../services/api'

const emptyLoanForm = {
  bookId: '',
  memberId: '',
  dueDate: '',
}

function toDateValue(value) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 10)
}

function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function normalizeLoan(loan, books) {
  const borrowedAt =
    loan.borrowed_at ||
    loan.borrowedAt ||
    loan.loan_date ||
    loan.loanDate ||
    loan.created_at ||
    loan.createdAt

  const dueDate =
    loan.due_date || loan.dueDate || loan.due_at || loan.dueAt || loan.return_date || loan.returnDate
  const returnedAt =
    loan.returned_at || loan.returnedAt || loan.returned_date || loan.returnedDate
  const bookId = loan.book_id || loan.bookId || loan.id_book
  const memberId = loan.member_id || loan.memberId || loan.user_id || loan.userId
  const memberUserId = loan.member_user_id || loan.memberUserId || loan.user_id || loan.userId
  const matchedBook = books.find((book) => String(book.id) === String(bookId))
  const status = String(loan.status || '').toLowerCase()
  const returned = Boolean(returnedAt) || status === 'returned'
  const overdue =
    typeof loan.is_overdue === 'boolean'
      ? loan.is_overdue
      : !returned && Boolean(dueDate) && new Date(dueDate) < new Date()

  return {
    id: loan.id || loan.loan_id || loan.loanId,
    bookId,
    memberId,
    memberUserId,
    bookTitle: loan.book_title || loan.bookTitle || matchedBook?.title || `Book #${bookId}`,
    memberName: loan.member_name || loan.memberName || `Member #${memberId}`,
    memberEmail: loan.member_email || loan.memberEmail || '-',
    borrowedAt,
    dueDate,
    returnedAt,
    returned,
    overdue,
  }
}

function buildLoanPayload(form) {
  const today = toDateValue(new Date())

  return {
    book_id: Number(form.bookId),
    member_id: Number(form.memberId),
    loan_date: today,
    return_date: form.dueDate,
  }
}

function LoanManager({ books, isStaff, loading, token, user, loans, onLoansChange, onNotice }) {
  const [form, setForm] = useState(emptyLoanForm)
  const [submitting, setSubmitting] = useState(false)

  const normalizedLoans = useMemo(() => {
    const normalized = loans.map((loan) => normalizeLoan(loan, books))

    if (isStaff) {
      return normalized
    }

    return normalized.filter((loan) => String(loan.memberUserId) === String(user?.id))
  }, [books, isStaff, loans, user?.id])

  const activeLoans = useMemo(
    () => normalizedLoans.filter((loan) => !loan.returned),
    [normalizedLoans],
  )

  const availableBooks = useMemo(() => {
    const activeBookIds = new Set(activeLoans.map((loan) => String(loan.bookId)))

    return books.filter((book) => !activeBookIds.has(String(book.id)))
  }, [activeLoans, books])

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const resetForm = () => {
    setForm(emptyLoanForm)
  }

  const submitLoan = async (event) => {
    event.preventDefault()

    if (!/^\d+$/.test(form.memberId.trim())) {
      onNotice('Member ID-g too helbereer oruulna uu.')
      return
    }

    try {
      setSubmitting(true)
      await createLoan(token, buildLoanPayload(form))
      resetForm()
      onNotice('Loan entry created successfully.')
      await onLoansChange()
    } catch (error) {
      onNotice(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const removeLoan = async (loanId, bookTitle) => {
    if (!isStaff) {
      onNotice('Зөвхөн staff эрхтэй хэрэглэгч зээлэлтийг устгах боломжтой.')
      return
    }

    try {
      setSubmitting(true)
      await deleteLoan(token, loanId)
      onNotice(`"${bookTitle}" зээлэлт устгагдлаа.`)
      await onLoansChange()
    } catch (error) {
      onNotice(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass =
    'mt-1.5 w-full rounded-2xl border border-amber-200/80 bg-white/90 px-4 py-3 outline-none transition placeholder:text-amber-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:bg-amber-50/70'

  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-[0_22px_70px_rgba(146,93,44,0.12)] backdrop-blur">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
              Зээлэлт
            </div>
            <h2 className="mt-3 font-['Georgia'] text-3xl font-semibold text-rose-950">
              Зээлэлтийн системэ
            </h2>
            <p className="mt-2 text-sm text-rose-700/75">
              {isStaff
                ? 'Гишүүний ID-г оруулж номыг зээлүүлж, буцаах өдрийг хяналдаж байна.'
                : 'Өөрийн авсан номуудыг болон тэдгээрийн буцаах өдрийг эндээс харна.'}
            </p>
          </div>

          <button
            className="rounded-full border border-amber-200 bg-white px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
            type="button"
            onClick={onLoansChange}
            disabled={!token || loading}
          >
            Шинэчлэх
          </button>
        </div>
      </div>

      {isStaff && (
        <form
          className="grid gap-4 rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-[0_22px_70px_rgba(146,93,44,0.12)] backdrop-blur md:grid-cols-[1.2fr_1fr_1fr_auto]"
          onSubmit={submitLoan}
        >
          <label className="block">
            <span className="text-sm font-medium text-rose-800">Ном</span>
            <select
              className={fieldClass}
              name="bookId"
              value={form.bookId}
              onChange={updateField}
              required
            >
              <option value="">Ном сонгох</option>
              {availableBooks.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-rose-800">Гишүүний ID</span>
            <input
              className={fieldClass}
              name="memberId"
              value={form.memberId}
              onChange={updateField}
              placeholder="Жишээ: 7"
              inputMode="numeric"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-rose-800">Буцаах өдөр</span>
            <input
              className={fieldClass}
              name="dueDate"
              type="date"
              value={form.dueDate}
              min={toDateValue(new Date())}
              onChange={updateField}
              required
            />
          </label>

          <div className="flex items-end gap-2">
            <button
              className="min-h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_36px_rgba(217,119,6,0.28)] transition hover:from-amber-500 hover:to-orange-500 disabled:opacity-60"
              type="submit"
              disabled={submitting || availableBooks.length === 0}
            >
              Зээлэлт үүсгэх
            </button>
          </div>
        </form>
      )}

      {isStaff && (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 shadow-sm">
          Email bish member ID oruulna. Loan date ni automataar unuudriin ognoogoor ilgeegdэнэ.
        </div>
      )}

      {!isStaff && token && (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 shadow-sm">
          Signed in as <span className="font-semibold">{user?.email}</span>. Та нэвтэрсэн байна. ID: <span className="ml-1 font-semibold">{user?.id}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 shadow-[0_22px_70px_rgba(146,93,44,0.12)] backdrop-blur">
        {!token ? (
          <div className="px-6 py-16 text-center text-rose-700/75">
            Эхлээд нэвтэрнэ үү.
          </div>
        ) : loading ? (
          <div className="px-6 py-16 text-center text-rose-700/75">Зээлэлтүүд ачаалж байна...</div>
        ) : normalizedLoans.length === 0 ? (
          <div className="px-6 py-16 text-center text-rose-700/75">
            Зээлэлтийн бүртгэл олдсонгүй байна.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gradient-to-r from-amber-50 to-orange-50 text-xs uppercase tracking-[0.22em] text-amber-600">
                <tr>
                  <th className="px-5 py-4">Ном</th>
                  {isStaff && <th className="px-5 py-4">Гишүүн</th>}
                  <th className="px-5 py-4">Зээлэлтийн өдөр</th>
                  <th className="px-5 py-4">Буцаах өдөр</th>
                  <th className="px-5 py-4">Төлөв</th>
                  {isStaff && <th className="px-5 py-4 text-right">Үйлдэл</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/80">
                {normalizedLoans.map((loan) => (
                  <tr key={loan.id} className="transition hover:bg-amber-50/35">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-rose-950">{loan.bookTitle}</div>
                      <div className="text-xs text-rose-500">Loan #{loan.id}</div>
                    </td>
                    {isStaff && (
                      <td className="px-5 py-4 text-rose-800">
                        <div>{loan.memberName}</div>
                        <div className="text-xs text-rose-500">
                          ID: {loan.memberId}
                          {loan.memberEmail !== '-' ? ` • ${loan.memberEmail}` : ''}
                        </div>
                      </td>
                    )}
                    <td className="px-5 py-4 text-rose-800">{formatDate(loan.borrowedAt)}</td>
                    <td className="px-5 py-4 text-rose-800">{formatDate(loan.dueDate)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          loan.overdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {loan.overdue ? 'Хугацаа дуусан' : 'Идэвхтэй'}
                      </span>
                    </td>
                    {isStaff && (
                      <td className="px-5 py-4 text-right">
                        <button
                          className="rounded-full border border-pink-200 bg-pink-50 px-3.5 py-2 text-xs font-semibold text-pink-700 hover:bg-pink-100 transition"
                          type="button"
                          onClick={() => removeLoan(loan.id, loan.bookTitle)}
                          disabled={submitting}
                        >
                          Устгах
                        </button>
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

export default LoanManager
