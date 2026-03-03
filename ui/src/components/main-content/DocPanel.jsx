import React from 'react'
import SchemaViewer from './SchemaViewer'
import ChevronDownIcon from '../icons/ChevronDownIcon'

/**
 * 根据状态码获取对应的样式类名
 */
function getStatusCodeClass(statusCode) {
  const code = parseInt(statusCode, 10)
  if (code >= 200 && code < 300) return 'success'
  if (code >= 300 && code < 400) return 'redirect'
  if (code >= 400 && code < 500) return 'client-error'
  if (code >= 500) return 'server-error'
  return ''
}

/**
 * 左侧文档面板
 * 展示 API 的参数、请求体和响应结构
 */
function DocPanel({
  op,
  groupedParams,
  requestBodySchema,
  multipartSchema,
  isMultipartRequest,
  responses,
  collapsedSections,
  onToggleSection,
}) {
  return (
    <div className="doc-panel">
      {/* Parameters Section */}
      {Object.keys(groupedParams).length > 0 && (
        <div className="params-section">
          <div
            className="params-header"
            onClick={() => onToggleSection('parameters')}
            style={{ cursor: 'pointer' }}
          >
            <span className="params-title">parameters</span>
            <ChevronDownIcon
              className={`toggle-icon ${collapsedSections.parameters ? 'collapsed' : ''}`}
            />
          </div>
          {!collapsedSections.parameters && (
            <div className="params-table">
              {Object.entries(groupedParams).map(([paramType, params], index) => (
                <React.Fragment key={paramType}>
                  <div className={`param-type-header${index === 0 ? ' first-param-type-header' : ''}`}>{paramType}</div>
                  {params.map((param, idx) => (
                    <React.Fragment key={idx}>
                      {/* Parameter header row */}
                      <div className="param-row">
                        <div className="param-col-left">
                          <span className="param-name">
                            {param.name}
                            {param.required && <span className="required">*</span>}
                          </span>
                          <span className="param-type">
                            {param.resolvedSchema?.$ref
                              ? param.resolvedSchema.$ref.replace('#/components/schemas/', '')
                              : param.resolvedSchema?.type || 'string'}
                          </span>
                        </div>
                        <div className="param-col-right">
                          <span className="param-desc">{param.description || ''}</span>
                          {param.required && <span className="param-meta">required</span>}
                        </div>
                      </div>
                      {/* If parameter has a complex schema, show its properties */}
                      {param.resolvedSchema && (param.resolvedSchema.properties || param.resolvedSchema.$ref) && (
                        <div className="param-schema-nested">
                          <SchemaViewer schema={param.resolvedSchema} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Request Body Section (JSON) */}
      {requestBodySchema && !isMultipartRequest && (
        <div className="params-section">
          <div
            className="params-header"
            onClick={() => onToggleSection('requestBody')}
            style={{ cursor: 'pointer' }}
          >
            <span className="params-title">request body</span>
            <ChevronDownIcon
              className={`toggle-icon ${collapsedSections.requestBody ? 'collapsed' : ''}`}
            />
          </div>
          {!collapsedSections.requestBody && (
            <>
              {op.requestBody?.description && (
                <p className="section-desc">{op.requestBody.description}</p>
              )}
              <div className="params-table">
                <SchemaViewer schema={requestBodySchema} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Multipart Form Data Section */}
      {isMultipartRequest && multipartSchema && (
        <div className="params-section">
          <div
            className="params-header"
            onClick={() => onToggleSection('requestBody')}
            style={{ cursor: 'pointer' }}
          >
            <span className="params-title">request body</span>
            <span className="content-type-badge">multipart/form-data</span>
            <ChevronDownIcon
              className={`toggle-icon ${collapsedSections.requestBody ? 'collapsed' : ''}`}
            />
          </div>
          {!collapsedSections.requestBody && (
            <>
              {op.requestBody?.description && (
                <p className="section-desc">{op.requestBody.description}</p>
              )}
              <div className="params-table">
                <div className="param-type-header">form data</div>
                {multipartSchema.properties && Object.entries(multipartSchema.properties).map(([fieldName, fieldSchema]) => (
                  <div key={fieldName} className="param-row">
                    <div className="param-col-left">
                      <span className="param-name">
                        {fieldName}
                        {multipartSchema.required?.includes(fieldName) && <span className="required">*</span>}
                      </span>
                      <span className="param-type">
                        {fieldSchema.format || fieldSchema.type}
                      </span>
                    </div>
                    <div className="param-col-right">
                      <span className="param-desc">{fieldSchema.description || ''}</span>
                      {multipartSchema.required?.includes(fieldName) && (
                        <span className="param-meta">required</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Responses Section */}
      {responses.length > 0 && (
        <div className="params-section">
          {responses.map((response) => (
            <div key={response.statusCode}>
              <div
                className="params-header"
                onClick={() => onToggleSection(`response_${response.statusCode}`)}
                style={{ cursor: 'pointer' }}
              >
                <span className="params-title">responses</span>
                <span className={`status-code ${getStatusCodeClass(response.statusCode)}`}>
                  {response.statusCode}
                </span>
                <span className="response-desc">{response.description}</span>
                <ChevronDownIcon
                  className={`toggle-icon ${collapsedSections[`response_${response.statusCode}`] ? 'collapsed' : ''}`}
                />
              </div>
              {!collapsedSections[`response_${response.statusCode}`] && (
                <div className="params-table">
                  {response.schema ? (
                    <SchemaViewer schema={response.schema} />
                  ) : (
                    <div className="response-empty">
                      <span className="response-empty-text">No content</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DocPanel
