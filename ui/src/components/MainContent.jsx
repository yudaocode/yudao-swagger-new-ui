import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useSchemaResolver, useApiRequest, useEndpointParams } from '../hooks'
import { DocPanel, TryItPanel } from './main-content'
import SunIcon from './icons/SunIcon'
import MoonIcon from './icons/MoonIcon'
import SettingsIcon from './icons/SettingsIcon'
import './MainContent.scss'

/**
 * 获取参数的所有字段名（包括嵌套参数）
 */
function getParamFields(params, resolveSchema) {
  const fields = {}
  params.forEach(param => {
    const type = param.in || 'query'
    const resolvedSchema = resolveSchema(param.schema)

    if (resolvedSchema?.properties) {
      // 复杂类型，展开属性
      Object.keys(resolvedSchema.properties).forEach(propName => {
        fields[`${type}_${param.name}.${propName}`] = ''
      })
    } else {
      // 简单类型
      fields[`${type}_${param.name}`] = ''
    }
  })
  return fields
}

/**
 * 将嵌套参数值转换为请求参数对象
 */
function buildRequestParams(paramValues, params, resolveSchema) {
  const result = {}

  params.forEach(param => {
    const type = param.in || 'query'
    const resolvedSchema = resolveSchema(param.schema)

    if (resolvedSchema?.properties) {
      // 复杂类型，收集嵌套属性值
      const nestedObj = {}
      Object.keys(resolvedSchema.properties).forEach(propName => {
        const key = `${type}_${param.name}.${propName}`
        if (paramValues[key] !== undefined && paramValues[key] !== '') {
          nestedObj[propName] = paramValues[key]
        }
      })
      if (Object.keys(nestedObj).length > 0) {
        result[param.name] = nestedObj
      }
    } else {
      // 简单类型
      const key = `${type}_${param.name}`
      if (paramValues[key] !== undefined && paramValues[key] !== '') {
        result[param.name] = paramValues[key]
      }
    }
  })

  return result
}

/**
 * 主内容组件
 * 展示 API 端点的详细信息和测试功能
 */
function MainContent({ endpoint, operation, apiData, theme, onToggleTheme, authToken, onOpenSettings, hasApiData, error, onRetry }) {
  const [collapsedSections, setCollapsedSections] = useState({
    parameters: false,
    requestBody: false,
  })
  const [responseCopySuccess, setResponseCopySuccess] = useState(false)

  // Use custom hooks
  const { resolveSchema, getSchemaExample } = useSchemaResolver(apiData)
  const { loading, responseData, sendRequest, clearResponse } = useApiRequest({ authToken })

  const { method, path, operation: op } = operation || {}

  // Compute derived data
  const requestBodySchema = useMemo(() => {
    if (!op) return null
    const schema = op.requestBody?.content?.['application/json']?.schema
    return resolveSchema(schema)
  }, [op, resolveSchema])

  // Multipart form data schema (for file uploads)
  const multipartSchema = useMemo(() => {
    if (!op) return null
    const schema = op.requestBody?.content?.['multipart/form-data']?.schema
    return resolveSchema(schema)
  }, [op, resolveSchema])

  // Check if this is a multipart/form-data request
  const isMultipartRequest = useMemo(() => {
    return !!op?.requestBody?.content?.['multipart/form-data']
  }, [op])

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

  const requestBodyExample = useMemo(() => {
    return requestBodySchema
      ? formatJson(getSchemaExample(requestBodySchema) || {})
      : formatJson({})
  }, [requestBodySchema, getSchemaExample])

  const parameters = op?.parameters || []

  // Resolve parameter schemas
  const resolvedParameters = useMemo(() => {
    return parameters.map(param => ({
      ...param,
      resolvedSchema: resolveSchema(param.schema),
    }))
  }, [parameters, resolveSchema])

  const groupedParams = useMemo(() => {
    return resolvedParameters.reduce((acc, param) => {
      const type = param.in || 'query'
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(param)
      return acc
    }, {})
  }, [resolvedParameters])

  // Track previous operation to reset values only when operation changes
  const prevOperationRef = useRef(null)

  // Use endpoint params hook for persistence
  const {
    paramValues,
    requestBody,
    setParamValues,
    setRequestBody,
    updateParamValue,
  } = useEndpointParams(method, path, requestBodyExample)

  // Initialize default param values when operation changes
  useEffect(() => {
    if (prevOperationRef.current !== operation) {
      prevOperationRef.current = operation
      // Set default empty values for all param fields (including nested)
      const defaultValues = getParamFields(parameters, resolveSchema)
      // Merge with existing paramValues to keep stored values
      setParamValues(prev => ({ ...defaultValues, ...prev }))
      // Clear response data when switching endpoint
      clearResponse()
    }
  }, [operation, parameters, resolveSchema, clearResponse, setParamValues])

  // Handlers
  const handleToggleSection = (sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  const handleParamChange = (paramType, paramName, value) => {
    updateParamValue(paramType, paramName, value)
  }

  const handleSendRequest = () => {
    // Build request params from nested param values
    const requestParams = buildRequestParams(paramValues, parameters, resolveSchema)

    sendRequest({
      method,
      path,
      paramValues,
      requestParams,
      groupedParams,
      requestBodySchema,
      requestBody,
      op,
      isMultipartRequest,
      multipartSchema,
    })
  }

  const handleCopyResponse = async () => {
    try {
      const responseText = responseData.error
        ? responseData.message
        : formatJson(responseData.data)
      await navigator.clipboard.writeText(responseText)
      setResponseCopySuccess(true)
      setTimeout(() => setResponseCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy response:', err)
    }
  }

  // Render empty state when no API data
  if (!hasApiData) {
    return (
      <main className="main-content">
        <ToolBar theme={theme} onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />
        <div className="content-empty-state">
          <svg className="empty-icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 className="empty-title">No API Documentation</h2>
          <p className="empty-description">
            {error ? `Failed to load API docs: ${error}` : 'No API documentation available.'}
          </p>
          <div className="empty-hints">
            <div className="hint-item">
              <svg className="hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
              <span className="hint-text">Check Base URL and API Path settings</span>
            </div>
            <div className="hint-item">
              <svg className="hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span className="hint-text">Check if your API requires authentication</span>
            </div>
            <div className="hint-item">
              <svg className="hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              <button className="hint-link" onClick={onOpenSettings}>
                Open settings to configure →
              </button>
            </div>
          </div>
          {onRetry && (
            <button className="retry-button-large" onClick={onRetry}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              Retry
            </button>
          )}
        </div>
      </main>
    )
  }

  // Render empty state when no endpoint selected
  if (!operation) {
    return (
      <main className="main-content">
        <ToolBar theme={theme} onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />
        <div className="content-header">
          <p className="endpoint-desc">Select an endpoint from the sidebar</p>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content">
      <ToolBar theme={theme} onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />

      {/* Endpoint Header */}
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

      {/* Main Content Split */}
      <div className="content-body-split">
        {/* Left: Documentation */}
        <DocPanel
          op={op}
          groupedParams={groupedParams}
          requestBodySchema={requestBodySchema}
          multipartSchema={multipartSchema}
          isMultipartRequest={isMultipartRequest}
          responses={responses}
          collapsedSections={collapsedSections}
          onToggleSection={handleToggleSection}
        />

        {/* Right: Try It Out */}
        <TryItPanel
          method={method}
          path={path}
          op={op}
          apiData={apiData}
          requestBodySchema={requestBodySchema}
          multipartSchema={multipartSchema}
          isMultipartRequest={isMultipartRequest}
          requestBody={requestBody}
          onRequestBodyChange={setRequestBody}
          groupedParams={groupedParams}
          paramValues={paramValues}
          onParamChange={handleParamChange}
          authToken={authToken}
          loading={loading}
          responseData={responseData}
          onSendRequest={handleSendRequest}
          onCopyResponse={handleCopyResponse}
          responseCopySuccess={responseCopySuccess}
        />
      </div>
    </main>
  )
}

/**
 * 工具栏组件
 */
function ToolBar({ theme, onToggleTheme, onOpenSettings }) {
  return (
    <div className="content-toolbar">
      <button className="toolbar-btn theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? (
          <SunIcon className="toolbar-icon" />
        ) : (
          <MoonIcon className="toolbar-icon" />
        )}
      </button>
      <button className="toolbar-btn settings-btn" onClick={onOpenSettings} aria-label="Settings">
        <SettingsIcon className="toolbar-icon" />
      </button>
    </div>
  )
}

export default MainContent
