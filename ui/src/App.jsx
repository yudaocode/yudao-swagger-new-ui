import { useState, useEffect, useRef, useCallback } from 'react'
import './components/App.scss'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import SettingsModal from './components/SettingsModal'
import ExportModal from './components/ExportModal'

function App() {
  // 从 URL 参数中读取初始选中的 endpoint
  const [selectedEndpoint, setSelectedEndpoint] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('endpoint') || null
  })
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })
  const [apiData, setApiData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    return parseInt(localStorage.getItem('sidebarWidth')) || 320
  })
  const [isDragging, setIsDragging] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('authToken') || ''
  })
  const [settingsBaseUrl, setSettingsBaseUrl] = useState(() => {
    return localStorage.getItem('settingsBaseUrl') || ''
  })
  const [settingsApiPath, setSettingsApiPath] = useState(() => {
    return localStorage.getItem('settingsApiPath') || ''
  })
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('group') || localStorage.getItem('selectedGroup') || 'default'
  })
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)
  const hasFetchedGroups = useRef(false)
  const lastFetchedGroup = useRef(null)

  // 当 selectedEndpoint 或 selectedGroup 变化时，更新 URL 参数
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (selectedEndpoint) {
      urlParams.set('endpoint', selectedEndpoint)
    } else {
      urlParams.delete('endpoint')
    }
    if (selectedGroup && selectedGroup !== 'default') {
      urlParams.set('group', selectedGroup)
    } else {
      urlParams.delete('group')
    }
    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}${window.location.hash}`
    window.history.replaceState(null, '', newUrl)
  }, [selectedEndpoint, selectedGroup])

  const getConfig = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const swaggerConfig = window.SWAGGER_UI_CONFIG || {}

    const baseUrl = urlParams.get('baseUrl') || settingsBaseUrl || swaggerConfig.baseUrl
    const apiPath = urlParams.get('apiPath') || settingsApiPath || swaggerConfig.apiPath || '/v3/api-docs'
    const groupsPath = urlParams.get('groupsPath') || swaggerConfig.groupsPath || '/swagger-new-ui/groups'

    return { baseUrl, apiPath, groupsPath }
  }, [settingsBaseUrl, settingsApiPath])

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
    localStorage.setItem('settingsBaseUrl', settingsBaseUrl)
  }, [settingsBaseUrl])

  useEffect(() => {
    localStorage.setItem('settingsApiPath', settingsApiPath)
  }, [settingsApiPath])

  const handleSaveSettings = useCallback(({ baseUrl, apiPath }) => {
    setSettingsBaseUrl(baseUrl)
    setSettingsApiPath(apiPath)
  }, [])

  const fetchGroups = useCallback(async () => {
    try {
      const { baseUrl, apiPath, groupsPath } = getConfig()

      let groupsUrl
      if (baseUrl) {
        if (baseUrl.startsWith('http')) {
          groupsUrl = new URL(groupsPath, baseUrl).href
        } else if (baseUrl.startsWith('/')) {
          groupsUrl = baseUrl.replace(/\/$/, '') + groupsPath
        } else {
          groupsUrl = groupsPath
        }
      } else {
        groupsUrl = groupsPath
      }

      console.log('Fetching groups from:', groupsUrl)

      const headers = {
        'Accept': 'application/json,*/*',
      }
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch(groupsUrl, { headers })

      if (response.ok) {
        const groupsData = await response.json()
        console.log('Groups loaded:', groupsData)
        setGroups(groupsData)

        const urlParams = new URLSearchParams(window.location.search)
        const urlGroup = urlParams.get('group')
        const savedGroup = localStorage.getItem('selectedGroup')
        // 优先使用 URL 中的 group 参数
        if (urlGroup && groupsData.some(g => g.name === urlGroup)) {
          setSelectedGroup(urlGroup)
        } else if (savedGroup && groupsData.some(g => g.name === savedGroup)) {
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
      const { apiPath } = getConfig()
      setGroups([{ name: 'default', displayName: '默认分组', url: apiPath }])
    }
  }, [authToken, getConfig])

  const fetchApiData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      let apiDocsUrl

      const currentGroup = groups.find(g => g.name === selectedGroup)
      const { baseUrl, apiPath } = getConfig()

      const isRealGroups = groups.length > 0 && !(groups.length === 1 && groups[0].name === 'default')
      const targetPath = isRealGroups && currentGroup ? currentGroup.url : apiPath

      if (baseUrl) {
        if (baseUrl.startsWith('http')) {
          apiDocsUrl = new URL(targetPath, baseUrl).href
        } else if (baseUrl.startsWith('/')) {
          apiDocsUrl = baseUrl.replace(/\/$/, '') + targetPath
        } else {
          apiDocsUrl = targetPath
        }
      } else {
        apiDocsUrl = targetPath
      }

      console.log('Fetching API docs from:', apiDocsUrl)

      const headers = {
        'Accept': 'application/json,*/*',
      }
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch(apiDocsUrl, { headers })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setApiData(data)
      // 不重置 selectedEndpoint，保持 URL 中的选中状态
    } catch (err) {
      console.error('Failed to fetch API docs:', err)
      setError(err.message)
      setApiData(null)
    } finally {
      setLoading(false)
    }
  }, [groups, selectedGroup, authToken, getConfig])

  const prevConfigRef = useRef(null)
  useEffect(() => {
    const config = getConfig()
    const configStr = JSON.stringify(config)
    if (prevConfigRef.current !== configStr) {
      prevConfigRef.current = configStr
      if (hasFetchedGroups.current) {
        hasFetchedGroups.current = false
        lastFetchedGroup.current = null
        setApiData(null)
        setGroups([])
      }
    }
  }, [getConfig])

  useEffect(() => {
    if (!hasFetchedGroups.current) {
      hasFetchedGroups.current = true
      fetchGroups()
    }
  }, [fetchGroups])

  useEffect(() => {
    if (groups.length > 0 && lastFetchedGroup.current !== selectedGroup) {
      lastFetchedGroup.current = selectedGroup
      fetchApiData()
    }
  }, [selectedGroup, groups, fetchApiData])

  const prevAuthToken = useRef(authToken)
  useEffect(() => {
    if (prevAuthToken.current !== authToken && hasFetchedGroups.current && groups.length > 0) {
      prevAuthToken.current = authToken
      fetchApiData()
    }
  }, [authToken, fetchApiData, groups])

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
    if (endpoints.length > 0) {
      // 如果 URL 中有 endpoint 参数，检查它是否存在于 endpoints 中
      if (selectedEndpoint) {
        const endpointExists = endpoints.some(ep => `${ep.method} ${ep.path}` === selectedEndpoint)
        if (!endpointExists) {
          // 如果 URL 中的 endpoint 不存在，则选中第一个
          const first = endpoints[0]
          setSelectedEndpoint(`${first.method} ${first.path}`)
        }
      } else {
        // 如果没有选中的 endpoint，选中第一个
        const first = endpoints[0]
        setSelectedEndpoint(`${first.method} ${first.path}`)
      }
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
    const newWidth = Math.max(200, Math.min(600, dragStartWidth.current + deltaX))
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
  }, [isDragging, sidebarWidth])

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
        hasApiData={!!apiData}
        error={error}
        onRetry={fetchApiData}
        onOpenSettings={() => setIsSettingsOpen(true)}
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
        onOpenExport={() => setIsExportOpen(true)}
        hasApiData={!!apiData}
        error={error}
        onRetry={fetchApiData}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        token={authToken}
        onSaveToken={setAuthToken}
        baseUrl={settingsBaseUrl}
        apiPath={settingsApiPath}
        onSaveSettings={handleSaveSettings}
      />
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        apiData={apiData}
      />
    </div>
  )
}

export default App
