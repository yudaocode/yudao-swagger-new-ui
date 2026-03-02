import React from 'react'

function Sidebar({ endpoints, selectedEndpoint, onSelectEndpoint, theme, onToggleTheme, apiInfo }) {
  const groupedEndpoints = endpoints.reduce((acc, ep) => {
    if (!acc[ep.group]) {
      acc[ep.group] = []
    }
    acc[ep.group].push(ep)
    return acc
  }, {})

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-row">
          <div className="logo-left">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
            <span className="logo-text">{apiInfo?.title || 'swagger'}</span>
          </div>
          <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? (
              <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
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
          <input type="text" className="search-input" placeholder="/api/v1/..." />
        </div>
      </div>

      <nav className="nav-section">
        <span className="nav-label">endpoints</span>
        {Object.entries(groupedEndpoints).map(([group, eps]) => (
          <div key={group} className="nav-group">
            <span className="group-label">{group}</span>
            {eps.map((ep) => (
              <div
                key={`${ep.method} ${ep.path}`}
                className={`nav-item ${selectedEndpoint === `${ep.method} ${ep.path}` ? 'active' : ''}`}
                onClick={() => onSelectEndpoint(`${ep.method} ${ep.path}`)}
              >
                <span className={`method ${ep.method.toLowerCase()}`}>{ep.method}</span>
                <span className="path">{ep.path}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
