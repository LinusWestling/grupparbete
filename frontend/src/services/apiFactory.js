const baseUrl = import.meta.env.VITE_API_BASE_URL

if (!baseUrl) {
  throw new Error('VITE_API_BASE_URL must be configured in the frontend environment.')
}

export function createApiService(endpoint) {
  return {
    async getAll() {
      const response = await fetch(`${baseUrl}${endpoint}`)

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      return response.json()
    },
  }
}
