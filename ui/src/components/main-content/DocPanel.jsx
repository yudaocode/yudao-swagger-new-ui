import React from 'react'
import SchemaViewer from './SchemaViewer'
import ChevronDownIcon from '../icons/ChevronDownIcon'

/**
 * 左侧文档面板
 * 展示 API 的参数、请求体和响应结构
 */
function DocPanel({
  op,
  groupedParams,
  requestBodySchema,
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
              {Object.entries(groupedParams).map(([paramType, params]) => (
                <React.Fragment key={paramType}>
                  <div className="param-type-header">{paramType}</div>
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

      {/* Request Body Section */}
      {requestBodySchema && (
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
                <span className={`status-code ${response.statusCode.startsWith('2') ? 'success' : ''}`}>
                  {response.statusCode}
                </span>
                <span className="response-desc">{response.description}</span>
                <ChevronDownIcon
                  className={`toggle-icon ${collapsedSections[`response_${response.statusCode}`] ? 'collapsed' : ''}`}
                />
              </div>
              {response.schema && !collapsedSections[`response_${response.statusCode}`] && (
                <div className="params-table">
                  <SchemaViewer schema={response.schema} />
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
