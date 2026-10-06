const baseUrl = import.meta.env.VITE_API_BASE_URL

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
