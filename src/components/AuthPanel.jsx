import { useState } from 'react'
import { login, register } from '../services/api'

// ── Хоосон форм (reset хийхэд ашиглана) ──────────────────────────────────────
const emptyForm = {
  email: '',
  password: '',
  name: '',
  role: 'staff',
  position: 'Librarian',
}

// ── CSS class тогтмолууд ──────────────────────────────────────────────────────
const labelClass = 'text-sm font-medium text-rose-800'
const fieldClass =
  'mt-1.5 w-full rounded-2xl border border-rose-200/80 bg-white/85 px-4 py-3 ' +
  'text-rose-950 outline-none transition placeholder:text-rose-300 ' +
  'focus:border-rose-400 focus:ring-4 focus:ring-rose-100'

// ─────────────────────────────────────────────────────────────────────────────
// AuthPanel
//   Props:
//     onAuthSuccess(auth) — нэвтрэх / бүртгэл амжилттай болоход дуудагдана
//                           auth = { token, user }
// ─────────────────────────────────────────────────────────────────────────────
function AuthPanel({ onAuthSuccess }) {
  const [mode, setMode]       = useState('login')   // 'login' | 'register'
  const [form, setForm]       = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // ── Аль ч input/select өөрчлөгдөхөд нэг handler-ээр зохицуулна ──────────
  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  // ── Форм илгээх ──────────────────────────────────────────────────────────
  const submit = async (event) => {
    event.preventDefault()
    setError('')

    // Клиент талын шалгалт (зөвхөн register)
    if (mode === 'register') {
      if (!form.name.trim()) {
        setError('Нэрээ оруулна уу.')
        return
      }
      if (form.role === 'staff' && !form.position.trim()) {
        setError('Албан тушаалаа оруулна уу.')
        return
      }
    }

    setLoading(true)

    try {
      if (mode === 'register') {
        // Бүртгэл үүсгэх
        const auth = await register({
          ...form,
          name:     form.name.trim(),
          position: form.position.trim(),
        })

        if (!auth?.token) {
          setError('Бүртгэл амжилтгүй боллоо.')
          return
        }

        onAuthSuccess(auth)
        setForm(emptyForm)
        return
      }

      // Нэвтрэх
      const auth = await login({
        email:    form.email,
        password: form.password,
      })

      onAuthSuccess(auth)
      setForm(emptyForm)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-[0_22px_70px_rgba(154,90,120,0.14)] backdrop-blur">

      {/* Login / Register товч */}
      <div className="mb-5 flex rounded-full bg-rose-100/80 p-1.5">
        {['login', 'register'].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              mode === m
                ? 'bg-white text-rose-950 shadow-[0_8px_24px_rgba(154,90,120,0.15)]'
                : 'text-rose-500'
            }`}
          >
            {m === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
          </button>
        ))}
      </div>

      {/* Гарчиг */}
      <div className="mb-5">
        <p className="font-['Georgia'] text-2xl font-semibold text-rose-950">
          {mode === 'login' ? 'Тавтай морил.' : 'Шинэ бүртгэл үүсгэх'}
        </p>
        <p className="mt-1 text-sm leading-6 text-rose-700/75">
          {mode === 'login'
            ? 'Өөрийн бүртгэлээр нэвтэрч номын сангийн мэдээллээ хараарай.'
            : 'Энгийн, зөөлөн формоор хурдан бүртгүүлээд системдээ нэвтэрнэ үү.'}
        </p>
      </div>

      <form className="space-y-4" onSubmit={submit}>

        {/* Нэр — зөвхөн register */}
        {mode === 'register' && (
          <label className="block">
            <span className={labelClass}>Нэр</span>
            <input
              className={fieldClass}
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
              placeholder="Жишээ: Gardi"
              required
            />
          </label>
        )}

        {/* Имэйл */}
        <label className="block">
          <span className={labelClass}>Имэйл</span>
          <input
            className={fieldClass}
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            placeholder="name@example.com"
            required
          />
        </label>

        {/* Нууц үг */}
        <label className="block">
          <span className={labelClass}>Нууц үг</span>
          <input
            className={fieldClass}
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            placeholder="password"
            required
          />
        </label>

        {/* Эрх — зөвхөн register */}
        {mode === 'register' && (
          <label className="block">
            <span className={labelClass}>Эрх</span>
            <select
              className={fieldClass}
              name="role"
              value={form.role}
              onChange={updateField}
            >
              <option value="staff">Staff</option>
              <option value="member">Member</option>
            </select>
          </label>
        )}

        {/* Албан тушаал — зөвхөн staff бүртгэлд */}
        {mode === 'register' && form.role === 'staff' && (
          <label className="block">
            <span className={labelClass}>Албан тушаал</span>
            <input
              className={fieldClass}
              name="position"
              type="text"
              value={form.position}
              onChange={updateField}
              required
            />
          </label>
        )}

        {/* Алдааны мэдэгдэл */}
        {error && (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        {/* Submit товч */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 px-4 py-3 text-sm font-bold text-white shadow-[0_16px_36px_rgba(219,112,147,0.35)] transition hover:scale-[1.01] hover:from-rose-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? 'Түр хүлээнэ үү...'
            : mode === 'login'
              ? 'Нэвтрэх'
              : 'Бүртгээд нэвтрэх'}
        </button>

      </form>
    </section>
  )
}

export default AuthPanel