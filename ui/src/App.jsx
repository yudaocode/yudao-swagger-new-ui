import { useState, useEffect, useRef } from 'react'
import './components/App.scss'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import SettingsModal from './components/SettingsModal'

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('authToken') || ''
  })
  // 分组相关状态
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(() => {
    return localStorage.getItem('selectedGroup') || 'default'
  })
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)
  const hasFetchedGroups = useRef(false)
  const lastFetchedGroup = useRef(null)

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('selectedGroup', selectedGroup)
  }, [selectedGroup])

  useEffect(() => {
    localStorage.setItem('authToken', authToken)
  }, [authToken])

  useEffect(() => {
    // Prevent duplicate fetches in React 18 Strict Mode
    if (!hasFetchedGroups.current) {
      hasFetchedGroups.current = true
      fetchGroups()
    }
  }, [])

  useEffect(() => {
    // Only fetch if groups are loaded and we haven't fetched this group yet
    if (groups.length > 0 && lastFetchedGroup.current !== selectedGroup) {
      lastFetchedGroup.current = selectedGroup
      fetchApiData()
    }
  }, [selectedGroup, groups])

  const fetchGroups = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const swaggerConfig = window.SWAGGER_UI_CONFIG || {}
      const apiPath = urlParams.get('apiPath') || swaggerConfig.apiPath || '/v3/api-docs'
      const baseUrl = urlParams.get('baseUrl') || swaggerConfig.baseUrl
      const groupsPath = urlParams.get('groupsPath') || swaggerConfig.groupsPath || '/swagger-new-ui/groups'

      // 构建 groups URL，逻辑与 fetchApiData 中构建 apiDocsUrl 一致
      let groupsUrl
      if (baseUrl) {
        if (baseUrl.startsWith('http')) {
          // baseUrl 是完整 URL 如 http://localhost:8080
          groupsUrl = new URL(groupsPath, baseUrl).href
        } else if (baseUrl.startsWith('/')) {
          // baseUrl 是路径前缀如 /admin
          // 拼接: /admin + /swagger-new-ui/groups -> /admin/swagger-new-ui/groups
          groupsUrl = baseUrl.replace(/\/$/, '') + groupsPath
        } else {
          groupsUrl = groupsPath
        }
      } else {
        // 使用相对路径
        groupsUrl = groupsPath
      }

      console.log('Fetching groups from:', groupsUrl)

      const response = await fetch(groupsUrl, {
        headers: {
          'Accept': 'application/json,*/*',
        },
      })
      
      if (response.ok) {
        const groupsData = await response.json()
        console.log('Groups loaded:', groupsData)
        setGroups(groupsData)
        
        // 如果当前选中的分组不在列表中，选择第一个分组
        const savedGroup = localStorage.getItem('selectedGroup')
        if (savedGroup && groupsData.some(g => g.name === savedGroup)) {
          setSelectedGroup(savedGroup)
        } else if (groupsData.length > 0) {
          setSelectedGroup(groupsData[0].name)
        }
      } else {
        console.log('Groups endpoint not available, using default')
        setGroups([{ name: 'default', displayName: '默认分组', url: apiPath }])
      }
    } catch (err) {
      console.log('Failed to fetch groups, using default:', err)
      const urlParams = new URLSearchParams(window.location.search)
      const swaggerConfig = window.SWAGGER_UI_CONFIG || {}
      const apiPath = urlParams.get('apiPath') || swaggerConfig.apiPath || '/v3/api-docs'
      setGroups([{ name: 'default', displayName: '默认分组', url: apiPath }])
    }
  }

  const fetchApiData = async () => {
    try {
      setLoading(true)
      let apiDocsUrl

      // 找到当前选中分组对应的 URL
      const currentGroup = groups.find(g => g.name === selectedGroup)
      const urlParams = new URLSearchParams(window.location.search)
      const swaggerConfig = window.SWAGGER_UI_CONFIG || {}
      const baseUrl = urlParams.get('baseUrl') || swaggerConfig.baseUrl

      if (currentGroup) {
        // 使用分组的 URL
        if (baseUrl && baseUrl.startsWith('http')) {
          apiDocsUrl = new URL(currentGroup.url, baseUrl).href
        } else if (baseUrl && baseUrl.startsWith('/')) {
          apiDocsUrl = baseUrl.replace(/\/$/, '') + currentGroup.url
        } else {
          apiDocsUrl = currentGroup.url
        }
      } else {
        // 降级到原有逻辑
        const apiPath = urlParams.get('apiPath') || swaggerConfig.apiPath || '/v3/api-docs'
        if (baseUrl) {
          if (baseUrl.startsWith('http')) {
            apiDocsUrl = new URL(apiPath, baseUrl).href
          } else if (baseUrl.startsWith('/')) {
            apiDocsUrl = baseUrl.replace(/\/$/, '') + apiPath
          } else {
            apiDocsUrl = apiPath
          }
        } else {
          apiDocsUrl = apiPath
        }
      }

      console.log('Fetching API docs from:', apiDocsUrl)

      const response = await fetch(apiDocsUrl, {
        headers: {
          'Accept': 'application/json,*/*',
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setApiData(data)
      setSelectedEndpoint(null) // 切换分组后重置选中的端点
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
        groups={groups}
        selectedGroup={selectedGroup}
        onSelectGroup={setSelectedGroup}
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
        authToken={authToken}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        token={authToken}
        onSaveToken={setAuthToken}
      />
    </div>
  )
}

export default App
