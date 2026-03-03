import React, { useState } from 'react'
import CodeExample, { useCodeExamples } from './CodeExample'
import ParamsInput from './ParamsInput'
import MultipartInput from './MultipartInput'
import ResponseDisplay from './ResponseDisplay'
import SendIcon from '../icons/SendIcon'

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
}) {
  const [activeLang, setActiveLang] = useState('curl')
  const [copySuccess, setCopySuccess] = useState(false)

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
          <textarea
            className="body-input"
            value={requestBody}
            onChange={(e) => onRequestBodyChange(e.target.value)}
          />
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
