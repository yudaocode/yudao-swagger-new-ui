import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useSchemaResolver, useApiRequest } from '../hooks'
import { DocPanel, TryItPanel } from './main-content'
import SunIcon from './icons/SunIcon'
import MoonIcon from './icons/MoonIcon'
import SettingsIcon from './icons/SettingsIcon'

/**
 * 主内容组件
 * 展示 API 端点的详细信息和测试功能
 */
function MainContent({ endpoint, operation, apiData, theme, onToggleTheme, authToken, onOpenSettings }) {
  const [requestBody, setRequestBody] = useState('')
  const [paramValues, setParamValues] = useState({})
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

  // Track previous operation to reset values only when operation changes
  const prevOperationRef = useRef(null)

  // Initialize request body and params when operation changes
  useEffect(() => {
    if (prevOperationRef.current !== operation) {
      prevOperationRef.current = operation
      setRequestBody(requestBodyExample)
      const initialValues = {}
      const params = op?.parameters || []
      params.forEach(param => {
        initialValues[`${param.in}_${param.name}`] = ''
      })
      setParamValues(initialValues)
      // Clear response data when switching endpoint
      clearResponse()
    }
  }, [operation, requestBodyExample, op, clearResponse])

  // Handlers
  const handleToggleSection = (sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  const handleParamChange = (paramType, paramName, value) => {
    setParamValues(prev => ({
      ...prev,
      [`${paramType}_${paramName}`]: value
    }))
  }

  const handleSendRequest = () => {
    sendRequest({
      method,
      path,
      paramValues,
      groupedParams,
      requestBodySchema,
      requestBody,
      op,
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

  // Render empty state
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
