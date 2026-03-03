import React from 'react'

/**
 * 响应结果展示组件
 */
function ResponseDisplay({ responseData, onCopy, copySuccess }) {
  if (!responseData) return null

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2)
  }

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
          {responseData.error
            ? responseData.message
            : formatJson(responseData.data)}
        </pre>
      </div>
    </div>
  )
}

export default ResponseDisplay
