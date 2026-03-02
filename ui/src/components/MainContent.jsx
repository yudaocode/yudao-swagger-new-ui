import React from 'react'

function MainContent({ endpoint, operation }) {
  if (!operation) {
    return (
      <main className="main-content">
        <div className="content-header">
          <p className="endpoint-desc">Select an endpoint from the sidebar</p>
        </div>
      </main>
    )
  }

  const { method, path, operation: op } = operation

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2)
  }

  const getSchemaExample = (schema) => {
    if (!schema) return null
    if (schema.example) return schema.example
    if (schema.type === 'object') {
      const example = {}
      if (schema.properties) {
        Object.entries(schema.properties).forEach(([key, prop]) => {
          example[key] = getSchemaExample(prop) || ''
        })
      }
      return example
    }
    if (schema.type === 'array') {
      return [getSchemaExample(schema.items) || {}]
    }
    if (schema.type === 'string') return 'string'
    if (schema.type === 'number' || schema.type === 'integer') return 0
    if (schema.type === 'boolean') return true
    return null
  }

  const requestBody = op.requestBody
    ? formatJson(getSchemaExample(op.requestBody.content?.['application/json']?.schema) || {})
    : formatJson({})

  const successResponse = op.responses?.['200'] || op.responses?.['201']
  const responseBody = successResponse
    ? formatJson(getSchemaExample(successResponse.content?.['application/json']?.schema) || { success: true })
    : formatJson({ success: true })

  const parameters = op.parameters || []

  return (
    <main className="main-content">
      <div className="content-header">
        <div className="endpoint-header">
          <div className={`method-badge ${method.toLowerCase()}`}>{method}</div>
          <h1 className="endpoint-path">{path}</h1>
        </div>
        <p className="endpoint-desc">
          {op.description && `// ${op.description}`}
          {!op.description && op.summary && `// ${op.summary}`}
        </p>
        <div className="endpoint-meta">
          {op.security && (
            <div className="meta-item">
              <span className="meta-label">auth:</span>
              <span className="meta-value auth">bearer_token</span>
            </div>
          )}
        </div>
      </div>

      <div className="content-body">
        {parameters.length > 0 && (
          <div className="params-section">
            <div className="params-header">
              <span className="params-title">parameters</span>
              <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div className="params-table">
              {parameters.map((param, idx) => (
                <div key={idx} className="param-row">
                  <span className="param-name">{param.name}</span>
                  <span className="param-type">{param.schema?.type || 'string'}</span>
                  <span className="param-desc">{param.description || ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="try-section">
          <div className="try-header">
            <span className="try-title">try_it_out</span>
            <button className="try-button">execute</button>
          </div>

          <div className="request-section">
            <span className="request-label">&gt; request</span>
            <div className="request-box">
              <pre className="code-block">{requestBody}</pre>
            </div>
          </div>

          <div className="response-section">
            <div className="response-header">
              <span className="response-label">&gt; response</span>
              <span className="status-badge">200 OK</span>
            </div>
            <div className="response-box">
              <pre className="code-block">{responseBody}</pre>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default MainContent
