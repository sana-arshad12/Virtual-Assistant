// API utility functions with automatic token handling

const getServerUrl = async () => {
  // Use environment variable in production, auto-detect in development
  const productionUrl = import.meta.env.VITE_API_URL
  
  if (productionUrl && import.meta.env.PROD) {
    console.log('✅ Using production API:', productionUrl)
    return productionUrl
  }
  
  // Development mode: Try different ports in order
  const portsToTry = ['8000', '8001', '8002', '8003']
  
  for (const port of portsToTry) {
    try {
      const url = `http://localhost:${port}`
      const response = await fetch(`${url}/api/user/check-auth`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.ok || response.status === 401) {
        console.log(`✅ Server found on port ${port}`)
        return url
      }
    } catch (error) {
      console.log(`❌ Port ${port} not available`)
      continue
    }
  }
  
  // Fallback to default
  console.log('⚠️ No server found, using default port 8001')
  return 'http://localhost:8001'
}

// Cache the server URL
let cachedServerUrl = null

const getCachedServerUrl = async () => {
  if (!cachedServerUrl) {
    cachedServerUrl = await getServerUrl()
  }
  return cachedServerUrl
}

// Function to make authenticated API calls
export const authenticatedFetch = async (endpoint, options = {}) => {
  const serverUrl = await getCachedServerUrl()
  const token = localStorage.getItem('token')
  
  // Default options
  const defaultOptions = {
    credentials: 'include', // Include cookies
    headers: {}
  }

  // Only set Content-Type for JSON, let FormData set its own
  if (!options.body || !(options.body instanceof FormData)) {
    defaultOptions.headers['Content-Type'] = 'application/json'
  }

  // Add Authorization header if token exists
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`
  }

  // Merge headers carefully
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${serverUrl}${endpoint}`
  
  try {
    const response = await fetch(url, finalOptions)
    return response
  } catch (error) {
    console.error('API call failed:', error)
    // Reset cached URL on connection error
    cachedServerUrl = null
    throw error
  }
}

// Wrapper for common API methods
export const api = {
  get: async (endpoint, options = {}) => authenticatedFetch(endpoint, { method: 'GET', ...options }),
  post: async (endpoint, data, options = {}) => authenticatedFetch(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data),
    ...options 
  }),
  put: async (endpoint, data, options = {}) => authenticatedFetch(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data),
    ...options 
  }),
  delete: async (endpoint, options = {}) => authenticatedFetch(endpoint, { method: 'DELETE', ...options })
}

export default api
