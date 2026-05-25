import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import LoginPage from './pages/LoginPage'
import BooksPage from './pages/BooksPage'
import LoansPage from './pages/LoansPage'
import {
  clearStoredAuth,
  getBooks,
  getLoans,
  getStoredAuth,
  saveStoredAuth,
} from './services/api'

const savedAuth = getStoredAuth()

function App() {
  const [token, setToken] = useState(savedAuth.token)
  const [user, setUser] = useState(savedAuth.user)
  const [books, setBooks] = useState([])
  const [loans, setLoans] = useState([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [loadingLoans, setLoadingLoans] = useState(false)
  const [notice, setNotice] = useState('')

  const isLoggedIn = Boolean(token)
  const isStaff = user?.role === 'staff'

  const handleAuthSuccess = (auth) => {
    setToken(auth.token)
    setUser(auth.user)
    setNotice('Successfully signed in.')
  }

  const logout = () => {
    setToken('')
    setUser(null)
    setBooks([])
    setLoans([])
    clearStoredAuth()
    setNotice('Signed out from the library system.')
  }

  const loadBooks = useCallback(async () => {
    if (!token) return

    try {
      setLoadingBooks(true)
      setBooks(await getBooks(token))
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        setNotice('Books could not be loaded with the current session.')
        return
      }

      setNotice(error.message)
    } finally {
      setLoadingBooks(false)
    }
  }, [token])

  const loadLoans = useCallback(async () => {
    if (!token) return

    try {
      setLoadingLoans(true)
      setLoans(await getLoans(token))
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        setNotice('Loan records could not be loaded with the current session.')
        return
      }

      setNotice(error.message)
    } finally {
      setLoadingLoans(false)
    }
  }, [token, user?.role])

  useEffect(() => {
    Promise.resolve().then(() => {
      loadBooks()
      loadLoans()
    })
  }, [loadBooks, loadLoans])

  useEffect(() => {
    if (token && user) {
      saveStoredAuth({ token, user })
      return
    }

    clearStoredAuth()
  }, [token, user])

  return (
    <Router>
      {isLoggedIn && (
        <Header isLoggedIn={isLoggedIn} user={user} isStaff={isStaff} onLogout={logout} />
      )}

      {notice && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-[1.5rem] border border-rose-200/70 bg-white/70 px-5 py-4 text-sm text-rose-900 shadow-sm backdrop-blur">
            {notice}
          </div>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <LoginPage
              isLoggedIn={isLoggedIn}
              user={user}
              isStaff={isStaff}
              books={books}
              loans={loans}
              onAuthSuccess={handleAuthSuccess}
            />
          }
        />

        <Route
          path="/books"
          element={
            isLoggedIn ? (
              <BooksPage
                books={books}
                loans={loans}
                isStaff={isStaff}
                loading={loadingBooks}
                token={token}
                onBooksChange={loadBooks}
                onNotice={setNotice}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/loans"
          element={
            isLoggedIn ? (
              <LoansPage
                books={books}
                loans={loans}
                isStaff={isStaff}
                loading={loadingLoans}
                token={token}
                user={user}
                onLoansChange={loadLoans}
                onNotice={setNotice}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
