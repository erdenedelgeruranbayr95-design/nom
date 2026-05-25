const API_URL = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'library_token'
const USER_KEY = 'library_user'

function createRequestError(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

function getDefaultErrorMessage(path, status) {
  if (path.includes('/loans') && path.includes('/delete')) {
    return 'Зээлэлт устгах функц одоогоор ашиглах боломжгүй байна.'
  }

  if (path.includes('/books') && path.includes('/delete')) {
    return 'Ном устгах функц одоогоор ашиглах боломжгүй байна.'
  }

  if (path.startsWith('/loans') && status === 403) {
    return 'Loan endpoint-d handah erh backend deer haagdsan baina. /api/loans route bolon permission-ee shalgana uu.'
  }

  if (path.startsWith('/loans') && status === 404) {
    return 'Loan endpoint oldsongui baina. Backend deer /api/loans route baigaa esehiig shalgana uu.'
  }

  if (status === 401) {
    return 'Nevtrelt huchingui baina. Dakhin nevterne uu.'
  }

  if (status === 403) {
    return 'Ene uildeld tani erkh hureltsehgui baina.'
  }

  return 'API request failed'
}

export function getStoredAuth() {
  try {
    return {
      token: localStorage.getItem(TOKEN_KEY) || '',
      user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
    }
  } catch {
    return {
      token: '',
      user: null,
    }
  }
}

export function saveStoredAuth(auth) {
  localStorage.setItem(TOKEN_KEY, auth.token)
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user))
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return {}
  }
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new Error('Server holbogdohgui baina. Backend asaaltai esehiig shalgana uu.')
  }

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text().catch(() => '')

  if (!response.ok) {
    if (typeof data === 'string' && data.trim()) {
      // Don't show raw HTML error pages
      if (data.includes('<!DOCTYPE') || data.includes('<html') || data.includes('Cannot')) {
        throw createRequestError(
          getDefaultErrorMessage(path, response.status),
          response.status,
        )
      }
      throw createRequestError(data, response.status)
    }

    throw createRequestError(
      data?.error || data?.message || getDefaultErrorMessage(path, response.status),
      response.status,
    )
  }

  return data
}

export async function login(credentials) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  const decoded = decodeToken(data.token)

  return {
    token: data.token,
    user: {
      id: decoded.id,
      email: credentials.email,
      role: decoded.role || credentials.role,
    },
  }
}

export async function register(payload) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (data?.token) {
    const decoded = decodeToken(data.token)

    return {
      token: data.token,
      user: {
        id: decoded.id || data.user?.id,
        email: data.user?.email || payload.email,
        role: decoded.role || data.user?.role || payload.role,
      },
    }
  }

  return data?.user || data
}

export async function getBooks(token) {
  return request('/books', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function createBook(token, payload) {
  return request('/books', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

export async function updateBook(token, id, payload) {
  return request(`/books/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

export async function deleteBook(token, id) {
  const headers = {
    Authorization: `Bearer ${token}`,
  }

  try {
    return await request(`/books/${id}/delete`, {
      method: 'PATCH',
      headers,
    })
  } catch (error) {
    if (![403, 404, 405].includes(error.status)) {
      throw error
    }
  }

  try {
    return await request(`/books/${id}/delete`, {
      method: 'PUT',
      headers,
    })
  } catch (error) {
    if (![403, 404, 405].includes(error.status)) {
      throw error
    }
  }

  try {
    return await request(`/books/${id}`, {
      method: 'DELETE',
      headers,
    })
  } catch (error) {
    if (![403, 404, 405].includes(error.status)) {
      throw error
    }
  }

  return request(`/books/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      deleted: true,
      is_deleted: true,
    }),
  })
}

function createAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  }
}

export async function getLoans(token) {
  return request('/loans', {
    headers: createAuthHeaders(token),
  })
}

export async function createLoan(token, payload) {
  return request('/loans', {
    method: 'POST',
    headers: createAuthHeaders(token),
    body: JSON.stringify(payload),
  })
}

export async function returnLoan(token, loanId) {
  const headers = createAuthHeaders(token)

  try {
    return await request(`/loans/${loanId}/return`, {
      method: 'PATCH',
      headers,
    })
  } catch (error) {
    if (![403, 404, 405].includes(error.status)) {
      throw error
    }
  }

  try {
    return await request(`/loans/${loanId}/return`, {
      method: 'PUT',
      headers,
    })
  } catch (error) {
    if (![403, 404, 405].includes(error.status)) {
      throw error
    }
  }

  return request(`/loans/${loanId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      returned: true,
      status: 'returned',
    }),
  })
}

export async function deleteLoan(token, loanId) {
  const headers = createAuthHeaders(token)

  try {
    return await request(`/loans/${loanId}/delete`, {
      method: 'PATCH',
      headers,
    })
  } catch (error) {
    if (![403, 404, 405].includes(error.status)) {
      throw error
    }
  }

  try {
    return await request(`/loans/${loanId}/delete`, {
      method: 'PUT',
      headers,
    })
  } catch (error) {
    if (![403, 404, 405].includes(error.status)) {
      throw error
    }
  }

  try {
    return await request(`/loans/${loanId}`, {
      method: 'DELETE',
      headers,
    })
  } catch (error) {
    if (![403, 404, 405].includes(error.status)) {
      throw error
    }
  }

  return request(`/loans/${loanId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      deleted: true,
      is_deleted: true,
    }),
  })
}
