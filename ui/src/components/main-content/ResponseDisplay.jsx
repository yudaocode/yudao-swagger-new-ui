import React, { useEffect, useRef } from 'react'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'

hljs.registerLanguage('json', json)

/**
 * 响应结果展示组件
 */
function ResponseDisplay({ responseData, onCopy, copySuccess }) {
  const codeRef = useRef(null)

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2)
  }

  // Apply syntax highlighting when response data changes
  useEffect(() => {
    if (codeRef.current && responseData && !responseData.error) {
      const jsonStr = formatJson(responseData.data)
      codeRef.current.textContent = jsonStr
      codeRef.current.removeAttribute('data-highlighted')
      codeRef.current.className = 'language-json'
      hljs.highlightElement(codeRef.current)
    }
  }, [responseData])

  if (!responseData) return null

  return (
    <div className="response-display">
      <div className="response-display-header">
        <div className="response-info">
          <span className="response-label">&gt; response</span>
          {responseData.error ? (
            <span className="status-badge error">Error</span>
          ) : (
            <span className={`status-badge ${responseData.status >= 200 && responseData.status < 300 ? 'success' : ''}`}>
              {responseData.status} {responseData.statusText}
            </span>
          )}
        </div>
        <button className="copy-btn" onClick={onCopy}>
          {copySuccess ? 'copied!' : 'copy'}
        </button>
      </div>
      <div className="response-display-box">
        <pre className="code-block">
          {responseData.error ? (
            responseData.message
          ) : (
            <code ref={codeRef} className="language-json"></code>
          )}
        </pre>
      </div>
    </div>
  )
}

export default ResponseDisplay
