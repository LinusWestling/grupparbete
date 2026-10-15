const baseUrl = import.meta.env.VITE_API_BASE_URL

if (!baseUrl) {
  throw new Error('VITE_API_BASE_URL must be configured in the frontend environment.')
}

export function createApiService(endpoint) {
  async function request(path = '', options = {}) {
    const headers = new Headers(options.headers)
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    let response
    let text
    try {
      response = await fetch(`${baseUrl}${endpoint}${path}`, {
        ...options,
        credentials: 'include',
        headers,
      })
      text = response.status === 204 ? '' : await response.text()
      recordApiResponse(response.status)
    } catch (error) {
      recordApiFailure(error)
      throw error
    }

    if (response.status === 204) {
      return null
    }

    let data
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      throw Object.assign(new Error(`API returned a non-JSON response: ${response.status}`), {
        status: response.status,
        errors: [],
      })
    }

    if (!response.ok || data?.status === 'error') {
      // status and errors (per-field validation messages) let forms show what went wrong.
      throw Object.assign(new Error(data?.message || `Request failed: ${response.status}`), {
        status: response.status,
        errors: data?.errors || [],
      })
    }

    return data?.data !== undefined ? data.data : data
  }

  return {
    request,
    getAll: () => request(),
  }
}
import { recordApiFailure, recordApiResponse } from './connectionStatus.js'
