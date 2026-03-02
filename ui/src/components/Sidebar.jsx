import React, { useState, useMemo } from 'react'

function Sidebar({ endpoints, selectedEndpoint, onSelectEndpoint, apiInfo, width }) {
  const [searchTerm, setSearchTerm] = useState('')

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
            placeholder="/api/v1/..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="search-clear"
              onClick={() => setSearchTerm('')}
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
          {Object.keys(groupedEndpoints).length === 0 ? (
            <div className="no-results">No matching endpoints</div>
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
