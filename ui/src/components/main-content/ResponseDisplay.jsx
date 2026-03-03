import React, { useEffect, useRef, useMemo } from 'react'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import './ResponseDisplay.scss'

hljs.registerLanguage('json', json)

/**
 * 响应结果展示组件
 * 始终渲染占位，避免布局抖动
 */
function ResponseDisplay({ responseData, onCopy, copySuccess }) {
  const codeRef = useRef(null)

  // Memoize formatted JSON to avoid recalculation
  const formattedJson = useMemo(() => {
    if (!responseData || responseData.error) return null
    return JSON.stringify(responseData.data, null, 2)
  }, [responseData])

  // Apply syntax highlighting when response changes
  useEffect(() => {
    if (codeRef.current && formattedJson) {
      codeRef.current.textContent = formattedJson
      codeRef.current.removeAttribute('data-highlighted')
      codeRef.current.className = 'language-json'
      hljs.highlightElement(codeRef.current)
    }
  }, [formattedJson])

  // Always render the container to prevent layout shift
  return (
    <div className="response-display">
      <div className="response-display-header">
        <div className="response-info">
          <span className="response-label">&gt; response</span>
          {responseData ? (
            responseData.error ? (
              <span className="status-badge error">Error</span>
            ) : (
              <span className={`status-badge ${responseData.status >= 200 && responseData.status < 300 ? 'success' : ''}`}>
                {responseData.status} {responseData.statusText}
              </span>
            )
          ) : (
            <span className="status-badge">waiting</span>
          )}
        </div>
        {/* Always render copy button to prevent layout shift */}
        <button
          className="copy-btn"
          onClick={onCopy}
          disabled={!responseData}
          style={{ visibility: responseData ? 'visible' : 'hidden' }}
        >
          {copySuccess ? 'copied!' : 'copy'}
        </button>
      </div>
      <div className="response-display-box">
        <pre className="code-block">
          {responseData ? (
            responseData.error ? (
              responseData.message
            ) : (
              <code ref={codeRef} className="language-json" />
            )
          ) : (
            <span className="response-placeholder">Click "send request" to see the response</span>
          )}
        </pre>
      </div>
    </div>
  )
}

export default ResponseDisplay
