import React, { useState, useEffect, useMemo } from 'react'
import './ExportModal.scss'
import { exportJson } from './export/exportJson'
import { exportHtml } from './export/exportHtml'
import { exportMarkdown } from './export/exportMarkdown'

const EXPORT_FORMATS = [
  { id: 'json', label: 'JSON', description: 'OpenAPI JSON format', enabled: true },
  { id: 'html', label: 'HTML', description: 'HTML documentation', enabled: true },
  { id: 'word', label: 'Word', description: 'Microsoft Word document', enabled: false },
  { id: 'markdown', label: 'Markdown', description: 'Markdown documentation', enabled: true },
]

function ExportModal({ isOpen, onClose, apiData }) {
  const [selectedEndpoints, setSelectedEndpoints] = useState(new Set())
  const [selectAll, setSelectAll] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedGroups, setCollapsedGroups] = useState(new Set())
  const [selectedFormat, setSelectedFormat] = useState('json')

  const endpoints = useMemo(() => {
    if (!apiData || !apiData.paths) return []
    const result = []
    Object.entries(apiData.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        const key = `${method.toUpperCase()} ${path}`
        result.push({
          key,
          method: method.toUpperCase(),
          path,
          summary: operation.summary || '',
          tags: operation.tags || ['default']
        })
      })
    })
    return result
  }, [apiData])

  const filteredEndpoints = useMemo(() => {
    if (!searchQuery) return endpoints
    const query = searchQuery.toLowerCase()
    return endpoints.filter(ep => 
      ep.path.toLowerCase().includes(query) ||
      ep.method.toLowerCase().includes(query) ||
      ep.summary.toLowerCase().includes(query) ||
      ep.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }, [endpoints, searchQuery])

  const groupedEndpoints = useMemo(() => {
    const groups = {}
    filteredEndpoints.forEach(ep => {
      ep.tags.forEach(tag => {
        if (!groups[tag]) {
          groups[tag] = []
        }
        groups[tag].push(ep)
      })
    })
    return groups
  }, [filteredEndpoints])

  const selectedEndpointList = useMemo(() => {
    return endpoints.filter(ep => selectedEndpoints.has(ep.key))
  }, [endpoints, selectedEndpoints])

  useEffect(() => {
    if (isOpen) {
      const allKeys = new Set(endpoints.map(ep => ep.key))
      setSelectedEndpoints(allKeys)
      setSelectAll(true)
      setSearchQuery('')
      setCollapsedGroups(new Set())
      setSelectedFormat('json')
    }
  }, [isOpen, endpoints])

  const handleToggleAll = () => {
    if (selectAll) {
      setSelectedEndpoints(new Set())
    } else {
      setSelectedEndpoints(new Set(endpoints.map(ep => ep.key)))
    }
    setSelectAll(!selectAll)
  }

  const handleToggleEndpoint = (key) => {
    setSelectedEndpoints(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      setSelectAll(newSet.size === endpoints.length)
      return newSet
    })
  }

  const handleToggleTag = (tag) => {
    const tagEndpoints = groupedEndpoints[tag] || []
    const tagKeys = tagEndpoints.map(ep => ep.key)
    const allTagSelected = tagKeys.every(key => selectedEndpoints.has(key))
    
    setSelectedEndpoints(prev => {
      const newSet = new Set(prev)
      tagKeys.forEach(key => {
        if (allTagSelected) {
          newSet.delete(key)
        } else {
          newSet.add(key)
        }
      })
      setSelectAll(newSet.size === endpoints.length)
      return newSet
    })
  }

  const handleToggleGroupCollapse = (tag, e) => {
    e.stopPropagation()
    setCollapsedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tag)) {
        newSet.delete(tag)
      } else {
        newSet.add(tag)
      }
      return newSet
    })
  }

  const handleExpandAll = () => {
    setCollapsedGroups(new Set())
  }

  const handleCollapseAll = () => {
    setCollapsedGroups(new Set(Object.keys(groupedEndpoints)))
  }

  const handleRemoveEndpoint = (key, e) => {
    e.stopPropagation()
    handleToggleEndpoint(key)
  }

  const handleExport = () => {
    if (!apiData) return
    
    const selectedKeys = Array.from(selectedEndpoints)
    
    if (selectedFormat === 'json') {
      exportJson(selectedKeys, apiData)
    } else if (selectedFormat === 'markdown') {
      exportMarkdown(selectedKeys, apiData)
    } else if (selectedFormat === 'html') {
      exportHtml(selectedKeys, apiData)
    }

    onClose()
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay export-modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content export-modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Export API</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="modal-body export-modal-body">
          <div className="export-column export-column-formats">
            <div className="export-column-header">
              <span className="export-column-title">Format</span>
            </div>
            <div className="export-formats-list">
              {EXPORT_FORMATS.map(format => (
                <div
                  key={format.id}
                  className={`export-format-item ${selectedFormat === format.id ? 'selected' : ''} ${!format.enabled ? 'disabled' : ''}`}
                  onClick={() => format.enabled && setSelectedFormat(format.id)}
                >
                  <div className="export-format-icon">
                    {format.id === 'json' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                      </svg>
                    )}
                    {format.id === 'html' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                        <line x1="14" y1="4" x2="14" y2="20"></line>
                        <line x1="10" y1="4" x2="10" y2="20"></line>
                      </svg>
                    )}
                    {format.id === 'word' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                    )}
                    {format.id === 'markdown' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    )}
                  </div>
                  <div className="export-format-info">
                    <span className="export-format-label">{format.label}</span>
                    <span className="export-format-desc">{format.description}</span>
                  </div>
                  {!format.enabled && <span className="export-format-soon">Soon</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="export-column export-column-tree">
            <div className="export-column-header">
              <span className="export-column-title">Select APIs</span>
              <div className="export-header-actions">
                <button className="export-text-btn" onClick={handleExpandAll}>
                  Expand all
                </button>
                <button className="export-text-btn" onClick={handleCollapseAll}>
                  Collapse all
                </button>
                <button className="export-text-btn" onClick={handleToggleAll}>
                  {selectAll ? 'Deselect all' : 'Select all'}
                </button>
              </div>
            </div>
            <div className="export-search-box">
              <svg className="export-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="export-search-input"
                placeholder="Search APIs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <nav className="export-nav-section">
              <div className="export-nav-section-inner">
                {Object.keys(groupedEndpoints).length === 0 ? (
                  <div className="export-no-results">
                    {searchQuery ? 'No matching endpoints' : 'No endpoints available'}
                  </div>
                ) : (
                  Object.entries(groupedEndpoints).map(([tag, tagEndpoints]) => {
                    const allTagSelected = tagEndpoints.every(ep => selectedEndpoints.has(ep.key))
                    const someTagSelected = tagEndpoints.some(ep => selectedEndpoints.has(ep.key))
                    const isCollapsed = collapsedGroups.has(tag)
                    return (
                      <div key={tag} className="export-nav-group">
                        <div className="export-group-header">
                          <button 
                            className="export-group-collapse-btn"
                            onClick={(e) => handleToggleGroupCollapse(tag, e)}
                          >
                            <svg 
                              className={`export-group-collapse-icon ${isCollapsed ? 'collapsed' : ''}`} 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2"
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                          <label className="export-checkbox-label">
                            <input
                              type="checkbox"
                              checked={allTagSelected}
                              indeterminate={someTagSelected && !allTagSelected}
                              onChange={() => handleToggleTag(tag)}
                            />
                            <span className="export-group-label">{tag}</span>
                            <span className="export-group-count">({tagEndpoints.length})</span>
                          </label>
                        </div>
                        {!isCollapsed && (
                          <div className="export-group-endpoints">
                            {tagEndpoints.map(ep => (
                              <label
                                key={ep.key}
                                className={`export-nav-item ${selectedEndpoints.has(ep.key) ? 'selected' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedEndpoints.has(ep.key)}
                                  onChange={() => handleToggleEndpoint(ep.key)}
                                />
                                <div className="export-nav-item-left">
                                  <span className={`export-method ${ep.method.toLowerCase()}`}>{ep.method}</span>
                                  <span className="export-path">{ep.path}</span>
                                </div>
                                {ep.summary && (
                                  <span className="export-nav-summary">{ep.summary}</span>
                                )}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </nav>
          </div>

          <div className="export-column export-column-selected">
            <div className="export-column-header">
              <span className="export-column-title">Selected</span>
              <span className="export-selected-count">{selectedEndpointList.length}</span>
            </div>
            <div className="export-stats">
              <div className="export-stat-item">
                <span className="export-stat-label">Total APIs</span>
                <span className="export-stat-value">{endpoints.length}</span>
              </div>
              <div className="export-stat-item">
                <span className="export-stat-label">Selected</span>
                <span className="export-stat-value">{selectedEndpointList.length}</span>
              </div>
              <div className="export-stat-item">
                <span className="export-stat-label">Tags</span>
                <span className="export-stat-value">{new Set(selectedEndpointList.flatMap(ep => ep.tags)).size}</span>
              </div>
            </div>
            <div className="export-selected-list">
              {selectedEndpointList.length === 0 ? (
                <div className="export-no-selection">No APIs selected</div>
              ) : (
                selectedEndpointList.map(ep => (
                  <div key={ep.key} className="export-selected-item">
                    <div className="export-selected-item-left">
                      <span className={`export-method ${ep.method.toLowerCase()}`}>{ep.method}</span>
                      <span className="export-path">{ep.path}</span>
                    </div>
                    <button 
                      className="export-remove-btn"
                      onClick={(e) => handleRemoveEndpoint(ep.key, e)}
                      aria-label="Remove"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="modal-btn modal-btn-save" 
            onClick={handleExport}
            disabled={selectedEndpoints.size === 0 || (selectedFormat !== 'json' && selectedFormat !== 'markdown' && selectedFormat !== 'html')}
          >
            Export {selectedFormat.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportModal
