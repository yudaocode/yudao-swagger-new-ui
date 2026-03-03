import React from 'react'

/**
 * 参数输入表单组件
 * 用于输入 API 请求的各种参数（query、path、header 等）
 */
function ParamsInput({ groupedParams, paramValues, onParamChange }) {
  if (Object.keys(groupedParams).length === 0) return null

  return (
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
                  onChange={(e) => onParamChange(paramType, param.name, e.target.value)}
                />
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default ParamsInput
