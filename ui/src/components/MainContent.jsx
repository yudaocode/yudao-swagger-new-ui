import React, { useState, useMemo } from 'react'

function MainContent({ endpoint, operation, apiData }) {
  const [tryItOut, setTryItOut] = useState(false)

  const resolveRef = useMemo(() => {
    const schemas = apiData?.components?.schemas || {}

    return (ref) => {
      if (!ref) return null
      if (!ref.startsWith('#/components/schemas/')) return null
      const schemaName = ref.replace('#/components/schemas/', '')
      return schemas[schemaName] || null
    }
  }, [apiData])

  const resolveSchema = useMemo(() => {
    return (schema, visited = new Set()) => {
      if (!schema) return null

      if (schema.$ref) {
        const refSchema = resolveRef(schema.$ref)
        if (refSchema && !visited.has(schema.$ref)) {
          const newVisited = new Set(visited)
          newVisited.add(schema.$ref)
          return resolveSchema(refSchema, newVisited)
        }
        return { ...schema, _refResolved: true }
      }

      if (schema.type === 'array' && schema.items) {
        return {
          ...schema,
          items: resolveSchema(schema.items, visited),
        }
      }

      if (schema.properties) {
        const resolvedProperties = {}
        Object.entries(schema.properties).forEach(([key, prop]) => {
          resolvedProperties[key] = resolveSchema(prop, visited)
        })
        return {
          ...schema,
          properties: resolvedProperties,
        }
      }

      return schema
    }
  }, [resolveRef])

  const { method, path, operation: op } = operation || {}

  const requestBodySchema = useMemo(() => {
    if (!op) return null
    const schema = op.requestBody?.content?.['application/json']?.schema
    return resolveSchema(schema)
  }, [op, resolveSchema])

  const responses = useMemo(() => {
    if (!op?.responses) return []

    return Object.entries(op.responses).map(([statusCode, response]) => {
      const schema = response.content?.['application/json']?.schema
        || response.content?.['*/*']?.schema
      return {
        statusCode,
        description: response.description,
        schema: resolveSchema(schema),
      }
    })
  }, [op, resolveSchema])

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

  const requestBodyExample = requestBodySchema
    ? formatJson(getSchemaExample(requestBodySchema) || {})
    : formatJson({})

  const successResponse = responses.find(r => r.statusCode === '200' || r.statusCode === '201') || responses[0]
  const responseBody = successResponse?.schema
    ? formatJson(getSchemaExample(successResponse.schema) || { success: true })
    : formatJson({ success: true })

  const parameters = op?.parameters || []

  const groupParametersByType = (params) => {
    return params.reduce((acc, param) => {
      const type = param.in || 'query'
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(param)
      return acc
    }, {})
  }

  const groupedParams = groupParametersByType(parameters)

  const renderSchemaProperties = (schema, prefix = '', level = 0) => {
    if (!schema) return null

    if (schema.$ref && !schema.properties) {
      const refName = schema.$ref?.replace('#/components/schemas/', '')
      return (
        <div key={`${prefix}-ref`} className="param-row" style={{ paddingLeft: `${level * 16}px` }}>
          <span className="param-name">{prefix || refName}</span>
          <span className="param-type ref-type">{refName}</span>
          <span className="param-desc"></span>
        </div>
      )
    }

    if (schema.type === 'array' && schema.items) {
      const items = schema.items
      const hasNestedProperties = items.properties || items.$ref

      return (
        <React.Fragment key={`${prefix}-array`}>
          <div className="param-row" style={{ paddingLeft: `${level * 16}px` }}>
            <span className="param-name">{prefix}</span>
            <span className="param-type">array</span>
            <span className="param-desc">{schema.description || ''}</span>
          </div>
          {hasNestedProperties && renderSchemaProperties(items, `${prefix}[]`, level + 1)}
        </React.Fragment>
      )
    }

    if (schema.type === 'object' && schema.properties) {
      const elements = []

      if (prefix) {
        elements.push(
          <div key={`${prefix}-obj-header`} className="param-row" style={{ paddingLeft: `${level * 16}px` }}>
            <span className="param-name">{prefix}</span>
            <span className="param-type">object</span>
            <span className="param-desc">{schema.description || ''}</span>
          </div>
        )
      }

      Object.entries(schema.properties).forEach(([key, prop]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key
        const required = schema.required?.includes(key)

        const hasNestedContent = (prop.type === 'object' && prop.properties) ||
                                 (prop.type === 'array' && prop.items) ||
                                 prop.$ref

        if (hasNestedContent) {
          elements.push(
            <React.Fragment key={fullKey}>
              <div className="param-row" style={{ paddingLeft: `${(prefix ? level + 1 : level) * 16}px` }}>
                <span className="param-name">
                  {fullKey}
                  {required && <span className="required">*</span>}
                </span>
                <span className="param-type">
                  {prop.$ref ? prop.$ref.replace('#/components/schemas/', '') : prop.type || 'string'}
                  {prop.format && ` (${prop.format})`}
                </span>
                <span className="param-desc">{prop.description || ''}</span>
              </div>
              {renderSchemaProperties(prop, fullKey, prefix ? level + 1 : level)}
            </React.Fragment>
          )
        } else {
          elements.push(
            <div key={fullKey} className="param-row" style={{ paddingLeft: `${(prefix ? level + 1 : level) * 16}px` }}>
              <span className="param-name">
                {fullKey}
                {required && <span className="required">*</span>}
              </span>
              <span className="param-type">
                {prop.type || 'string'}
                {prop.format && ` (${prop.format})`}
              </span>
              <span className="param-desc">{prop.description || ''}</span>
            </div>
          )
        }
      })

      return elements
    }

    return null
  }

  if (!operation) {
    return (
      <main className="main-content">
        <div className="content-header">
          <p className="endpoint-desc">Select an endpoint from the sidebar</p>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content">
      <div className="content-header">
        <div className="endpoint-header">
          <div className={`method-badge ${method.toLowerCase()}`}>{method}</div>
          <h1 className="endpoint-path">{path}</h1>
          {op.summary && <span className="endpoint-summary">{op.summary}</span>}
        </div>
        <p className="endpoint-desc">
          {op.description && `// ${op.description}`}
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
        {Object.keys(groupedParams).length > 0 && (
          <div className="params-section">
            <div className="params-header">
              <span className="params-title">parameters</span>
              <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div className="params-table">
              {Object.entries(groupedParams).map(([paramType, params]) => (
                <React.Fragment key={paramType}>
                  <div className="param-type-header">{paramType}</div>
                  {params.map((param, idx) => (
                    <div key={idx} className="param-row">
                      <span className="param-name">
                        {param.name}
                        {param.required && <span className="required">*</span>}
                      </span>
                      <span className="param-type">{param.schema?.type || 'string'}</span>
                      <span className="param-desc">{param.description || ''}</span>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {requestBodySchema && (
          <div className="params-section">
            <div className="params-header">
              <span className="params-title">request body</span>
              <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {op.requestBody?.description && (
              <p className="section-desc">{op.requestBody.description}</p>
            )}
            <div className="params-table">
              {renderSchemaProperties(requestBodySchema)}
            </div>
          </div>
        )}

        {responses.length > 0 && (
          <div className="params-section">
            <div className="params-header">
              <span className="params-title">responses</span>
              <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div className="responses-list">
              {responses.map((response) => (
                <div key={response.statusCode} className="response-item">
                  <div className="response-status">
                    <span className={`status-code ${response.statusCode.startsWith('2') ? 'success' : ''}`}>
                      {response.statusCode}
                    </span>
                    <span className="response-desc">{response.description}</span>
                  </div>
                  {response.schema && (
                    <div className="response-schema">
                      {renderSchemaProperties(response.schema)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="try-section">
          <div className="try-header">
            <span className="try-title">try_it_out</span>
            <button className="try-button" onClick={() => setTryItOut(!tryItOut)}>
              {tryItOut ? 'cancel' : 'execute'}
            </button>
          </div>

          {tryItOut && (
            <>
              {requestBodySchema && (
                <div className="request-section">
                  <span className="request-label">&gt; request</span>
                  <div className="request-box">
                    <pre className="code-block">{requestBodyExample}</pre>
                  </div>
                </div>
              )}

              <div className="response-section">
                <div className="response-header">
                  <span className="response-label">&gt; response</span>
                  <span className="status-badge">200 OK</span>
                </div>
                <div className="response-box">
                  <pre className="code-block">{responseBody}</pre>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default MainContent
