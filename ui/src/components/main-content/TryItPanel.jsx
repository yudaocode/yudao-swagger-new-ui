import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import CodeExample, { useCodeExamples } from './CodeExample'
import ParamsInput from './ParamsInput'
import MultipartInput from './MultipartInput'
import ResponseDisplay from './ResponseDisplay'
import SendIcon from '../icons/SendIcon'
import './TryItPanel.scss'

hljs.registerLanguage('json', json)

/**
 * 右侧测试面板
 * 包含代码示例、参数输入和发送请求功能
 */
function TryItPanel({
  method,
  path,
  op,
  apiData,
  requestBodySchema,
  multipartSchema,
  isMultipartRequest,
  requestBody,
  onRequestBodyChange,
  groupedParams,
  paramValues,
  onParamChange,
  authToken,
  loading,
  responseData,
  onSendRequest,
  onCopyResponse,
  responseCopySuccess,
  validationError,
  onClearValidationError,
}) {
  const [activeLang, setActiveLang] = useState('curl')
  const [copySuccess, setCopySuccess] = useState(false)
  const [isEditingBody, setIsEditingBody] = useState(false)
  const textareaRef = useRef(null)
  const highlightRef = useRef(null)
  const highlightPreRef = useRef(null)

  // 判断 request body 是否为空
  // 支持对象 {} 和数组 [] 类型的空值判断
  const isRequestBodyEmpty = useMemo(() => {
    if (!requestBody) return true
    const trimmed = requestBody.trim()
    if (trimmed === '{}' || trimmed === '[]') return true
    // 尝试解析 JSON，检查是否为空对象或空数组
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed) && parsed.length === 0) return true
      if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length === 0) return true
    } catch (e) {
      // 解析失败，认为有内容
    }
    return false
  }, [requestBody])

  // JSON 语法高亮
  useEffect(() => {
    if (highlightRef.current && requestBody) {
      highlightRef.current.textContent = requestBody
      highlightRef.current.removeAttribute('data-highlighted')
      highlightRef.current.className = 'language-json'
      hljs.highlightElement(highlightRef.current)
    }
  }, [requestBody])

  // 同步滚动 - 同步 pre 元素的滚动
  const handleScroll = useCallback((e) => {
    if (highlightPreRef.current) {
      highlightPreRef.current.scrollTop = e.target.scrollTop
      highlightPreRef.current.scrollLeft = e.target.scrollLeft
    }
  }, [])

  // 当开始编辑时，聚焦 textarea
  useEffect(() => {
    if (isEditingBody && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditingBody])

  // 当切换接口时，退出编辑模式
  useEffect(() => {
    setIsEditingBody(false)
  }, [path, method])

  // Generate code examples
  const codeExamples = useCodeExamples({
    method,
    path,
    requestBody,
    paramValues,
    groupedParams,
    apiData,
    requestBodySchema,
    op,
    authToken,
  })

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeExamples[activeLang])
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="try-panel">
      {/* Code Example */}
      <CodeExample
        codeExamples={codeExamples}
        activeLang={activeLang}
        onLangChange={setActiveLang}
        onCopy={handleCopyCode}
        copySuccess={copySuccess}
      />

      {/* Parameters Input */}
      <ParamsInput
        groupedParams={groupedParams}
        paramValues={paramValues}
        onParamChange={onParamChange}
      />

      {/* Multipart Form Data Input */}
      {isMultipartRequest && (
        <MultipartInput
          schema={multipartSchema}
          paramValues={paramValues}
          onParamChange={onParamChange}
        />
      )}

      {/* Request Body Input (JSON) */}
      {requestBodySchema && !isMultipartRequest && (
        <div className="body-input-section">
          <div className="section-header">
            <span className="section-title">request body</span>
          </div>
          {isRequestBodyEmpty && !isEditingBody ? (
            <div
              className="body-empty"
              onClick={() => setIsEditingBody(true)}
            >
              <span className="body-empty-text">No content</span>
            </div>
          ) : (
            <div className="body-input-wrapper">
              <pre ref={highlightPreRef} className="body-highlight">
                <code ref={highlightRef} className="language-json" />
              </pre>
              <textarea
                ref={textareaRef}
                className="body-input"
                value={requestBody}
                onChange={(e) => onRequestBodyChange(e.target.value)}
                onScroll={handleScroll}
                onBlur={() => {
                  if (isRequestBodyEmpty) {
                    setIsEditingBody(false)
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className="validation-error">
          <div className="validation-error-header">
            <span className="validation-error-title">参数校验失败</span>
            <button
              className="validation-error-close"
              onClick={onClearValidationError}
            >
              ×
            </button>
          </div>
          <pre className="validation-error-message">{validationError}</pre>
        </div>
      )}

      {/* Send Button */}
      <button
        className="send-btn"
        onClick={onSendRequest}
        disabled={loading}
      >
        <SendIcon className="send-icon" />
        {loading ? 'sending...' : 'send request'}
      </button>

      {/* Response Display */}
      <ResponseDisplay
        responseData={responseData}
        onCopy={onCopyResponse}
        copySuccess={responseCopySuccess}
      />
    </div>
  )
}

export default TryItPanel
