import React, { useState, useMemo, useRef, useEffect } from 'react'
import './Sidebar.scss'

function Sidebar({ endpoints, selectedEndpoint, onSelectEndpoint, apiInfo, width, groups, selectedGroup, onSelectGroup, hasApiData, error, onRetry, onOpenSettings }) {
  // 从 URL 参数中读取初始搜索词
  const [searchTerm, setSearchTerm] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('search') || ''
  })
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false)
  const groupMenuRef = useRef(null)

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (groupMenuRef.current && !groupMenuRef.current.contains(event.target)) {
        setIsGroupMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentGroup = groups?.find(g => g.name === selectedGroup)

  // 当搜索词变化时，更新 URL 参数
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (searchTerm) {
      urlParams.set('search', searchTerm)
    } else {
      urlParams.delete('search')
    }
    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}${window.location.hash}`
    window.history.replaceState(null, '', newUrl)
  }, [searchTerm])

  const handleSelectGroup = (groupName) => {
    onSelectGroup(groupName)
    setIsGroupMenuOpen(false)
  }

  const filteredEndpoints = useMemo(() => {
    if (!searchTerm.trim()) return endpoints

    const term = searchTerm.toLowerCase()
    return endpoints.filter((ep) => {
      return (
        ep.path.toLowerCase().includes(term) ||
        ep.method.toLowerCase().includes(term) ||
        ep.group.toLowerCase().includes(term) ||
        ep.operation?.summary?.toLowerCase().includes(term) ||
        ep.operation?.description?.toLowerCase().includes(term)
      )
    })
  }, [endpoints, searchTerm])

  const groupedEndpoints = useMemo(() => {
    return filteredEndpoints.reduce((acc, ep) => {
      if (!acc[ep.group]) {
        acc[ep.group] = []
      }
      acc[ep.group].push(ep)
      return acc
    }, {})
  }, [filteredEndpoints])

  return (
    <aside className="sidebar" style={{ width }}>
      <div className="sidebar-header">
        <div className="logo-row">
          <div className="logo-left">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
            <span className="logo-text">{apiInfo?.title || 'swagger'}</span>
          </div>
          {/* 分组切换按钮 - 仅当有多个分组时显示 */}
          {groups && groups.length > 1 && (
            <div className="group-switcher" ref={groupMenuRef}>
              <button
                className="group-switcher-btn"
                onClick={() => setIsGroupMenuOpen(!isGroupMenuOpen)}
              >
                <span>{currentGroup?.displayName || selectedGroup}</span>
                <svg className="group-switcher-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {isGroupMenuOpen && (
                <div className="group-menu">
                  {groups.map((group) => (
                    <div
                      key={group.name}
                      className={`group-menu-item ${selectedGroup === group.name ? 'active' : ''}`}
                      onClick={() => handleSelectGroup(group.name)}
                    >
                      {group.displayName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <span className="subtitle">// {apiInfo?.description || 'api documentation'}</span>
        {apiInfo?.version && <span className="api-version">v{apiInfo.version}</span>}
      </div>

      <div className="search-section">
        <span className="search-label">search_endpoints</span>
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search API ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="search-clear"
              onClick={() => {
                setSearchTerm('')
                // 清空搜索词时，URL 参数已在 useEffect 中更新
              }}
              aria-label="Clear search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      <nav className="nav-section">
        <div className="nav-section-inner">
          <span className="nav-label">
            endpoints
            {searchTerm && (
              <span className="search-count">({filteredEndpoints.length})</span>
            )}
          </span>
          {!hasApiData ? (
            <div className="api-empty-state">
              <svg className="empty-icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p className="empty-text">
                {error ? `Failed to load: ${error}` : 'No API data available'}
              </p>
              {onOpenSettings && (
                <button className="empty-hint-text" onClick={onOpenSettings}>
                  Check settings (URL/Token) →
                </button>
              )}
              {onRetry && (
                <button className="retry-button-small" onClick={onRetry}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  Retry
                </button>
              )}
            </div>
          ) : Object.keys(groupedEndpoints).length === 0 ? (
            <div className="no-results">
              {searchTerm ? 'No matching endpoints' : 'No endpoints available'}
            </div>
          ) : (
            Object.entries(groupedEndpoints).map(([group, eps]) => (
              <div key={group} className="nav-group">
                <span className="group-label">{group}</span>
                {eps.map((ep) => (
                  <div
                    key={`${ep.method} ${ep.path}`}
                    className={`nav-item ${selectedEndpoint === `${ep.method} ${ep.path}` ? 'active' : ''}`}
                    onClick={() => onSelectEndpoint(`${ep.method} ${ep.path}`)}
                  >
                    <div className="nav-item-left">
                      <span className={`method ${ep.method.toLowerCase()}`}>{ep.method}</span>
                      <span className="path">{ep.path}</span>
                    </div>
                    {ep.operation?.summary && (
                      <span className="nav-summary">{ep.operation.summary}</span>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
