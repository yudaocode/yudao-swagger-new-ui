import React, { useState, useMemo, useEffect, useRef } from 'react'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)

function MainContent({ endpoint, operation, apiData, theme, onToggleTheme, authToken, onOpenSettings }) {
  const [activeLang, setActiveLang] = useState('curl')
  const [requestBody, setRequestBody] = useState('')
  const [responseData, setResponseData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paramValues, setParamValues] = useState({})
  const [collapsedSections, setCollapsedSections] = useState({
    parameters: false,
    requestBody: false,
  })
  const [copySuccess, setCopySuccess] = useState(false)

  const codeRef = useRef(null)

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

  const requestBodyExample = useMemo(() => {
    return requestBodySchema
      ? formatJson(getSchemaExample(requestBodySchema) || {})
      : formatJson({})
  }, [requestBodySchema])

  // Track previous operation to reset values only when operation changes
  const prevOperationRef = React.useRef(null)

  // Initialize request body and params when operation changes
  React.useEffect(() => {
    if (prevOperationRef.current !== operation) {
      prevOperationRef.current = operation
      setRequestBody(requestBodyExample)
      const initialValues = {}
      const params = op?.parameters || []
      params.forEach(param => {
        initialValues[`${param.in}_${param.name}`] = ''
      })
      setParamValues(initialValues)
    }
  }, [operation])

  const parameters = op?.parameters || []
  const groupedParams = useMemo(() => {
    return parameters.reduce((acc, param) => {
      const type = param.in || 'query'
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(param)
      return acc
    }, {})
  }, [parameters])

  const handleToggleSection = (sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeExamples[activeLang])
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getBaseUrl = () => {
    const servers = apiData?.servers || []
    if (servers.length > 0) {
      return servers[0].url
    }
    return ''
  }

  // Generate code examples
  const codeExamples = useMemo(() => {
    if (!path || !method) {
      return { curl: '', java: '', nodejs: '', python: '' }
    }

    const baseUrl = getBaseUrl()
    const fullPath = path.replace(/\{(\w+)\}/g, (_, key) => {
      const val = paramValues[`path_${key}`] || `{${key}}`
      return val
    })
    const url = `${baseUrl}${fullPath}`

    // Build headers
    const requestHeaders = {
      'Content-Type': 'application/json',
    }
    if (authToken) {
      requestHeaders['Authorization'] = `Bearer ${authToken}`
    } else if (op?.security) {
      requestHeaders['Authorization'] = 'Bearer <your_token>'
    }

    // Build query params
    const queryParams = []
    if (groupedParams.query) {
      groupedParams.query.forEach(param => {
        const val = paramValues[`query_${param.name}`]
        if (val) {
          queryParams.push(`${param.name}=${encodeURIComponent(val)}`)
        }
      })
    }
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''

    const curlHeaders = Object.entries(requestHeaders)
      .map(([k, v]) => `  -H "${k}: ${v}"`)
      .join(' \\\n')

    const curl = `curl -X ${method.toUpperCase()} \\
  "${url}${queryString}" \\
${curlHeaders}${requestBodySchema ? ` \\
  -d '${requestBody.replace(/'/g, "\\'")}'` : ''}`

    const java = `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

public class ApiRequest {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String url = "${url}${queryString}";

        Map<String, String> headers = new HashMap<>();
        ${Object.entries(requestHeaders).map(([k, v]) => `headers.put("${k}", "${v}");`).join('\n        ')}

        HttpRequest.Builder builder = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .${method.toLowerCase()}(HttpRequest.BodyPublishers${requestBodySchema ? `.ofString(${JSON.stringify(requestBody)})` : '.noBody()'});

        headers.forEach(builder::header);

        HttpResponse<String> response = client.send(
            builder.build(),
            HttpResponse.BodyHandlers.ofString()
        );

        System.out.println(response.body());
    }
}`

    const nodejs = `const fetch = require('node-fetch');

const url = "${url}${queryString}";
const options = {
  method: '${method.toUpperCase()}',
  headers: {
${Object.entries(requestHeaders).map(([k, v]) => `    '${k}': '${v}'`).join(',\n')}
  }${requestBodySchema ? `,
  body: ${JSON.stringify(requestBody)}` : ''}
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));`

    const python = `import requests

url = "${url}${queryString}"

headers = {
${Object.entries(requestHeaders).map(([k, v]) => `    "${k}": "${v}"`).join(',\n')}
}
${requestBodySchema ? `
payload = ${requestBody}
` : ''}
response = requests.${method.toLowerCase()}(
    url,
    headers=headers${requestBodySchema ? ',\n    json=payload' : ''}
)

print(response.status_code)
print(response.json())`

    return { curl, java, nodejs, python }
  }, [method, path, requestBody, paramValues, groupedParams, apiData, requestBodySchema, op?.security, authToken])

  // Apply syntax highlighting when code changes
  useEffect(() => {
    if (codeRef.current) {
      // Clear previous highlighting first
      codeRef.current.removeAttribute('data-highlighted')
      codeRef.current.className = codeRef.current.className.replace(/hljs/g, '').trim()
      // Apply new highlighting
      hljs.highlightElement(codeRef.current)
    }
  }, [activeLang])

  const handleParamChange = (paramType, paramName, value) => {
    setParamValues(prev => ({
      ...prev,
      [`${paramType}_${paramName}`]: value
    }))
  }

  const handleSendRequest = async () => {
    setLoading(true)
    setResponseData(null)

    try {
      let fullPath = path.replace(/\{(\w+)\}/g, (_, key) => {
        return paramValues[`path_${key}`] || `{${key}}`
      })

      const queryParams = []
      if (groupedParams.query) {
        groupedParams.query.forEach(param => {
          const val = paramValues[`query_${param.name}`]
          if (val) {
            queryParams.push(`${param.name}=${encodeURIComponent(val)}`)
          }
        })
      }
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''

      const headers = {
        'Content-Type': 'application/json',
      }
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const options = {
        method: method.toUpperCase(),
        headers,
      }

      if (requestBodySchema && requestBody) {
        options.body = requestBody
      }

      const response = await fetch(fullPath + queryString, options)
      const data = await response.json()

      setResponseData({
        status: response.status,
        statusText: response.statusText,
        data,
      })
    } catch (error) {
      setResponseData({
        error: true,
        message: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const renderSchemaProperties = (schema, prefix = '', level = 0) => {
    if (!schema) return null

    if (schema.$ref && !schema.properties) {
      const refName = schema.$ref?.replace('#/components/schemas/', '')
      return (
        <div key={`${prefix}-ref`} className="param-row" style={{ paddingLeft: `${level * 16}px` }}>
          <div className="param-col-left">
            <span className="param-name">{prefix || refName}</span>
            <span className="param-type ref-type">{refName}</span>
          </div>
          <div className="param-col-right">
            <span className="param-desc"></span>
          </div>
        </div>
      )
    }

    if (schema.type === 'array' && schema.items) {
      const items = schema.items
      const hasNestedProperties = items.properties || items.$ref

      // 如果有 prefix，渲染 array 行；否则直接渲染子元素
      // 这样避免当 array 是嵌套属性时重复渲染
      if (!prefix) {
        // 没有 prefix，说明是从父级递归进来的，直接渲染子元素
        return hasNestedProperties ? renderSchemaProperties(items, '', level) : null
      }

      return (
        <React.Fragment key={`${prefix}-array`}>
          <div className="param-row" style={{ paddingLeft: `${level * 16}px` }}>
            <div className="param-col-left">
              <span className="param-name">{prefix}</span>
              <span className="param-type">array</span>
            </div>
            <div className="param-col-right">
              <span className="param-desc">{schema.description || ''}</span>
            </div>
          </div>
          {hasNestedProperties && renderSchemaProperties(items, '', level + 1)}
        </React.Fragment>
      )
    }

    if (schema.type === 'object' && schema.properties) {
      const elements = []

      if (prefix) {
        elements.push(
          <div key={`${prefix}-obj-header`} className="param-row" style={{ paddingLeft: `${level * 16}px` }}>
            <div className="param-col-left">
              <span className="param-name">{prefix}</span>
              <span className="param-type">object</span>
            </div>
            <div className="param-col-right">
              <span className="param-desc">{schema.description || ''}</span>
            </div>
          </div>
        )
      }

      // 子属性应该始终比父级缩进一级
      // 无论 prefix 是否存在，子属性都在 level + 1 级
      const childLevel = level + 1

      Object.entries(schema.properties).forEach(([key, prop]) => {
        // 显示名称：如果有 prefix 就显示 prefix.key，否则只显示 key
        const displayName = prefix ? `${prefix}.${key}` : key
        const required = schema.required?.includes(key)

        const hasNestedContent = (prop.type === 'object' && prop.properties) ||
                                 (prop.type === 'array' && prop.items) ||
                                 prop.$ref

        if (hasNestedContent) {
          // 对于嵌套的 object/array 类型，渲染当前属性行，然后递归渲染子属性
          // 递归时传入空 prefix，让子属性直接显示 key
          elements.push(
            <React.Fragment key={displayName}>
              <div className="param-row" style={{ paddingLeft: `${childLevel * 16}px` }}>
                <div className="param-col-left">
                  <span className="param-name">
                    {displayName}
                    {required && <span className="required">*</span>}
                  </span>
                  <span className="param-type">
                    {prop.$ref ? prop.$ref.replace('#/components/schemas/', '') : prop.type || 'string'}
                    {prop.format && ` (${prop.format})`}
                  </span>
                </div>
                <div className="param-col-right">
                  <span className="param-desc">{prop.description || ''}</span>
                  {required && <span className="param-meta">required</span>}
                </div>
              </div>
              {/* 递归渲染子属性，传入空 prefix 和 childLevel */}
              {renderSchemaProperties(prop, '', childLevel)}
            </React.Fragment>
          )
        } else {
          elements.push(
            <div key={displayName} className="param-row" style={{ paddingLeft: `${childLevel * 16}px` }}>
              <div className="param-col-left">
                <span className="param-name">
                  {displayName}
                  {required && <span className="required">*</span>}
                </span>
                <span className="param-type">
                  {prop.type || 'string'}
                  {prop.format && ` (${prop.format})`}
                </span>
              </div>
              <div className="param-col-right">
                <span className="param-desc">{prop.description || ''}</span>
                {required && <span className="param-meta">required</span>}
              </div>
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
        <div className="content-toolbar">
          <button className="toolbar-btn theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? (
              <svg className="toolbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <svg className="toolbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
          <button className="toolbar-btn settings-btn" onClick={onOpenSettings} aria-label="Settings">
            <svg className="toolbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0-1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
        <div className="content-header">
          <p className="endpoint-desc">Select an endpoint from the sidebar</p>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content">
      <div className="content-toolbar">
        <button className="toolbar-btn theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? (
            <svg className="toolbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <svg className="toolbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
        <button className="toolbar-btn settings-btn" onClick={onOpenSettings} aria-label="Settings">
          <svg className="toolbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0-1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
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

      <div className="content-body-split">
        {/* Left: Documentation */}
        <div className="doc-panel">
          {Object.keys(groupedParams).length > 0 && (
            <div className="params-section">
              <div className="params-header" onClick={() => handleToggleSection('parameters')} style={{ cursor: 'pointer' }}>
                <span className="params-title">parameters</span>
                <svg className={`toggle-icon ${collapsedSections.parameters ? 'collapsed' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {!collapsedSections.parameters && (
                <div className="params-table">
                  {Object.entries(groupedParams).map(([paramType, params]) => (
                    <React.Fragment key={paramType}>
                      <div className="param-type-header">{paramType}</div>
                      {params.map((param, idx) => (
                        <div key={idx} className="param-row">
                          <div className="param-col-left">
                            <span className="param-name">
                              {param.name}
                              {param.required && <span className="required">*</span>}
                            </span>
                            <span className="param-type">{param.schema?.type || 'string'}</span>
                          </div>
                          <div className="param-col-right">
                            <span className="param-desc">{param.description || ''}</span>
                            {param.required && <span className="param-meta">required</span>}
                          </div>
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          )}

          {requestBodySchema && (
            <div className="params-section">
              <div className="params-header" onClick={() => handleToggleSection('requestBody')} style={{ cursor: 'pointer' }}>
                <span className="params-title">request body</span>
                <svg className={`toggle-icon ${collapsedSections.requestBody ? 'collapsed' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {!collapsedSections.requestBody && (
                <>
                  {op.requestBody?.description && (
                    <p className="section-desc">{op.requestBody.description}</p>
                  )}
                  <div className="params-table">
                    {renderSchemaProperties(requestBodySchema)}
                  </div>
                </>
              )}
            </div>
          )}

          {responses.length > 0 && (
            <div className="params-section">
              {responses.map((response) => (
                <div key={response.statusCode}>
                  <div className="params-header" onClick={() => handleToggleSection(`response_${response.statusCode}`)} style={{ cursor: 'pointer' }}>
                    <span className="params-title">responses</span>
                    <span className={`status-code ${response.statusCode.startsWith('2') ? 'success' : ''}`}>
                      {response.statusCode}
                    </span>
                    <span className="response-desc">{response.description}</span>
                    <svg className={`toggle-icon ${collapsedSections[`response_${response.statusCode}`] ? 'collapsed' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  {response.schema && !collapsedSections[`response_${response.statusCode}`] && (
                    <div className="params-table">
                      {renderSchemaProperties(response.schema)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Try It Out & Code Examples */}
        <div className="try-panel">
          {/* Language Tabs */}
          <div className="lang-tabs">
            {['curl', 'nodejs', 'python', 'java'].map(lang => (
              <button
                key={lang}
                className={`lang-tab ${activeLang === lang ? 'active' : ''}`}
                onClick={() => setActiveLang(lang)}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Code Example */}
          <div className="code-section">
            <div className="code-header">
              <span className="code-label">&gt; {activeLang}</span>
              <button className="copy-btn" onClick={handleCopyCode}>{copySuccess ? 'copied!' : 'copy'}</button>
            </div>
            <div className="code-box">
              <pre className="code-block">
                <code 
                  ref={codeRef}
                  className={`language-${activeLang === 'curl' ? 'bash' : activeLang === 'nodejs' ? 'javascript' : activeLang}`}
                >
                  {codeExamples[activeLang]}
                </code>
              </pre>
            </div>
          </div>

          {/* Parameters Input */}
          {Object.keys(groupedParams).length > 0 && (
            <div className="params-input-section">
              <div className="section-header">
                <span className="section-title">parameters</span>
              </div>
              <div className="params-input-list">
                {Object.entries(groupedParams).map(([paramType, params]) => (
                  <React.Fragment key={paramType}>
                    <div className="param-input-type-header">{paramType}</div>
                    {params.map((param, idx) => (
                      <div key={idx} className="param-input-row">
                        <label className="param-input-label">
                          {param.name}
                          {param.required && <span className="required">*</span>}
                        </label>
                        <input
                          type="text"
                          className="param-input"
                          placeholder={param.description || ''}
                          value={paramValues[`${paramType}_${param.name}`] || ''}
                          onChange={(e) => handleParamChange(paramType, param.name, e.target.value)}
                        />
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Request Body Input */}
          {requestBodySchema && (
            <div className="body-input-section">
              <div className="section-header">
                <span className="section-title">request body</span>
              </div>
              <textarea
                className="body-input"
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
              />
            </div>
          )}

          {/* Send Button */}
          <button className="send-btn" onClick={handleSendRequest} disabled={loading}>
            <svg className="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            {loading ? 'sending...' : 'send request'}
          </button>

          {/* Response */}
          {responseData && (
            <div className="response-display">
              <div className="response-display-header">
                <span className="response-label">&gt; response</span>
                {responseData.error ? (
                  <span className="status-badge error">Error</span>
                ) : (
                  <span className={`status-badge ${responseData.status >= 200 && responseData.status < 300 ? 'success' : ''}`}>
                    {responseData.status} {responseData.statusText}
                  </span>
                )}
              </div>
              <div className="response-display-box">
                <pre className="code-block">
                  {responseData.error
                    ? responseData.message
                    : formatJson(responseData.data)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default MainContent
