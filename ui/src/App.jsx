import { useState, useEffect, useRef } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'

function App() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })
  const [apiData, setApiData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    return parseInt(localStorage.getItem('sidebarWidth')) || 280
  })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    fetchApiData()
  }, [])

  const fetchApiData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/v3/api-docs', {
        headers: {
          'Accept': 'application/json,*/*',
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setApiData(data)
    } catch (err) {
      console.error('Failed to fetch API docs:', err)
      setError(err.message)
      setApiData(getSampleData())
    } finally {
      setLoading(false)
    }
  }

  const getSampleData = () => ({
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
    },
    paths: {
      '/users': {
        get: {
          summary: 'List users',
          description: 'Retrieve a list of all users in the system. Supports pagination and filtering.',
          tags: ['users'],
          parameters: [
            { name: 'page', in: 'query', description: 'Page number for pagination', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', description: 'Items per page, max 50', schema: { type: 'integer' } },
          ],
        },
        post: {
          summary: 'Create user',
          description: 'Create a new user in the system.',
          tags: ['users'],
        },
      },
      '/users/{id}': {
        get: {
          summary: 'Get user',
          description: 'Retrieve a single user by ID.',
          tags: ['users'],
          parameters: [
            { name: 'id', in: 'path', required: true, description: 'User ID', schema: { type: 'integer' } },
          ],
        },
      },
      '/products': {
        get: {
          summary: 'List products',
          description: 'Retrieve a list of all products.',
          tags: ['products'],
        },
      },
      '/products/{id}': {
        delete: {
          summary: 'Delete product',
          description: 'Delete a product by ID.',
          tags: ['products'],
          parameters: [
            { name: 'id', in: 'path', required: true, description: 'Product ID', schema: { type: 'integer' } },
          ],
        },
      },
    },
  })

  const parseEndpoints = (data) => {
    if (!data || !data.paths) return []

    const endpoints = []
    Object.entries(data.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        const tags = operation.tags || ['default']
        endpoints.push({
          method: method.toUpperCase(),
          path,
          group: tags[0],
          operation,
        })
      })
    })
    return endpoints
  }

  const endpoints = parseEndpoints(apiData)

  useEffect(() => {
    if (endpoints.length > 0 && !selectedEndpoint) {
      const first = endpoints[0]
      setSelectedEndpoint(`${first.method} ${first.path}`)
    }
  }, [endpoints, selectedEndpoint])

  const getSelectedOperation = () => {
    if (!apiData || !selectedEndpoint) return null
    const [method, ...pathParts] = selectedEndpoint.split(' ')
    const path = pathParts.join(' ')
    const pathItem = apiData.paths?.[path]
    if (!pathItem) return null
    return {
      method: method.toUpperCase(),
      path,
      operation: pathItem[method.toLowerCase()],
    }
  }

  const handleDragStart = (e) => {
    setIsDragging(true)
    dragStartX.current = e.clientX
    dragStartWidth.current = sidebarWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handleDragMove = (e) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStartX.current
    const newWidth = Math.max(200, Math.min(500, dragStartWidth.current + deltaX))
    setSidebarWidth(newWidth)
  }

  const handleDragEnd = () => {
    if (isDragging) {
      setIsDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      localStorage.setItem('sidebarWidth', sidebarWidth.toString())
    }
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove)
      window.addEventListener('mouseup', handleDragEnd)
      window.addEventListener('mouseleave', handleDragEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove)
      window.removeEventListener('mouseup', handleDragEnd)
      window.removeEventListener('mouseleave', handleDragEnd)
    }
  }, [isDragging])

  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-spinner">Loading API documentation...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <Sidebar
        endpoints={endpoints}
        selectedEndpoint={selectedEndpoint}
        onSelectEndpoint={setSelectedEndpoint}
        apiInfo={apiData?.info}
        width={sidebarWidth}
      />
      <div
        className="resize-handle"
        onMouseDown={handleDragStart}
      />
      <MainContent
        endpoint={selectedEndpoint}
        operation={getSelectedOperation()}
        apiData={apiData}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
    </div>
  )
}

export default App
