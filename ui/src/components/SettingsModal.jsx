import React, { useState, useEffect } from 'react'
import './SettingsModal.scss'

function SettingsModal({ isOpen, onClose, token, onSaveToken, baseUrl, apiPath, onSaveSettings }) {
  const [inputToken, setInputToken] = useState('')
  const [inputBaseUrl, setInputBaseUrl] = useState('')
  const [inputApiPath, setInputApiPath] = useState('')

  useEffect(() => {
    if (isOpen) {
      setInputToken(token || '')
      setInputBaseUrl(baseUrl || '')
      setInputApiPath(apiPath || '')
    }
  }, [isOpen, token, baseUrl, apiPath])

  const handleSave = () => {
    onSaveToken(inputToken)
    onSaveSettings({ baseUrl: inputBaseUrl, apiPath: inputApiPath })
    onClose()
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Settings</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="setting-item">
            <label className="setting-label">Base URL</label>
            <input
              type="text"
              className="setting-input"
              placeholder="e.g., http://localhost:8080 or /admin"
              value={inputBaseUrl}
              onChange={(e) => setInputBaseUrl(e.target.value)}
            />
            <p className="setting-hint">
              Base URL for API requests. Leave empty to use relative paths.
            </p>
          </div>
          <div className="setting-item">
            <label className="setting-label">API Path</label>
            <input
              type="text"
              className="setting-input"
              placeholder="e.g., /v3/api-docs"
              value={inputApiPath}
              onChange={(e) => setInputApiPath(e.target.value)}
            />
            <p className="setting-hint">
              Path to OpenAPI documentation endpoint. Default: /v3/api-docs
            </p>
          </div>
          <div className="setting-item">
            <label className="setting-label">Authorization Token</label>
            <input
              type="text"
              className="setting-input"
              placeholder="Enter your Bearer token"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
            />
            <p className="setting-hint">
              This token will be added as &quot;Authorization: Bearer {inputToken || '&lt;token&gt;'}&quot; header to all requests.
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-btn modal-btn-save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
