import React from 'react'
import './ParamsInput.scss'

/**
 * 获取 schema 的所有属性（展开引用类型）
 */
function getSchemaProperties(schema) {
  if (!schema) return []

  // 如果有 properties，直接返回
  if (schema.properties) {
    return Object.entries(schema.properties).map(([key, prop]) => ({
      name: key,
      schema: prop,
      required: schema.required?.includes(key) || false,
      description: prop.description || '',
    }))
  }

  return []
}

/**
 * 判断参数是否为文件类型
 * OpenAPI 3.0: type: string, format: binary
 * OpenAPI 2.0: type: file
 */
function isFileParam(param) {
  const schema = param.schema || param.resolvedSchema || {}
  // OpenAPI 3.0
  if (schema.type === 'string' && schema.format === 'binary') {
    return true
  }
  // OpenAPI 2.0 兼容
  if (schema.type === 'file') {
    return true
  }
  // 检查 param 本身的 type（某些情况下）
  if (param.type === 'file') {
    return true
  }
  return false
}

/**
 * 获取输入类型
 */
function getInputType(schema) {
  if (!schema) return 'text'

  const { type, format } = schema

  // 文件类型
  if (type === 'string' && format === 'binary') {
    return 'file'
  }
  if (type === 'file') {
    return 'file'
  }

  // 日期类型
  if (type === 'string' && format === 'date') {
    return 'date'
  }
  if (type === 'string' && format === 'date-time') {
    return 'datetime-local'
  }

  // 数字类型
  if (type === 'integer' || type === 'number') {
    return 'number'
  }

  // 布尔类型
  if (type === 'boolean') {
    return 'checkbox'
  }

  return 'text'
}

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
            {params.map((param, idx) => {
              // 检查参数是否有复杂 schema（需要展开）
              const resolvedSchema = param.resolvedSchema || param.schema
              const hasComplexSchema = resolvedSchema && resolvedSchema.properties && !isFileParam(param)

              if (hasComplexSchema) {
                // 展开复杂 schema 的属性
                const properties = getSchemaProperties(resolvedSchema)
                return (
                  <React.Fragment key={idx}>
                    {/* 显示参数名作为分组标题 */}
                    <div className="param-input-group-label">
                      {param.name}
                      {param.required && <span className="required">*</span>}
                      <span className="param-input-group-type">
                        {resolvedSchema.$ref?.replace('#/components/schemas/', '') || 'object'}
                      </span>
                    </div>
                    {/* 展开显示每个属性 */}
                    {properties.map((prop) => {
                      const inputType = getInputType(prop.schema)
                      const isFile = inputType === 'file'
                      const isCheckbox = inputType === 'checkbox'

                      return (
                        <div key={prop.name} className="param-input-row param-input-nested">
                          <label className="param-input-label">
                            {prop.name}
                            {prop.required && <span className="required">*</span>}
                          </label>
                          {isCheckbox ? (
                            <input
                              type="checkbox"
                              className="param-checkbox"
                              checked={paramValues[`${paramType}_${param.name}.${prop.name}`] === 'true'}
                              onChange={(e) => onParamChange(paramType, `${param.name}.${prop.name}`, e.target.checked.toString())}
                            />
                          ) : isFile ? (
                            <input
                              type="file"
                              className="param-file"
                              onChange={(e) => onParamChange(paramType, `${param.name}.${prop.name}`, e.target.files[0])}
                            />
                          ) : (
                            <input
                              type={inputType}
                              className="param-input"
                              placeholder={prop.description || ''}
                              value={paramValues[`${paramType}_${param.name}.${prop.name}`] || ''}
                              onChange={(e) => onParamChange(paramType, `${param.name}.${prop.name}`, e.target.value)}
                            />
                          )}
                        </div>
                      )
                    })}
                  </React.Fragment>
                )
              }

              // 检查是否为文件类型
              const isFile = isFileParam(param)
              const inputType = getInputType(resolvedSchema)
              const isCheckbox = inputType === 'checkbox'

              // 简单类型参数，直接显示输入框
              return (
                <div key={idx} className="param-input-row">
                  <label className="param-input-label">
                    {param.name}
                    {param.required && <span className="required">*</span>}
                  </label>
                  {isCheckbox ? (
                    <input
                      type="checkbox"
                      className="param-checkbox"
                      checked={paramValues[`${paramType}_${param.name}`] === 'true'}
                      onChange={(e) => onParamChange(paramType, param.name, e.target.checked.toString())}
                    />
                  ) : isFile ? (
                    <input
                      type="file"
                      className="param-file"
                      onChange={(e) => onParamChange(paramType, param.name, e.target.files[0])}
                    />
                  ) : (
                    <input
                      type={inputType}
                      className="param-input"
                      placeholder={param.description || ''}
                      value={paramValues[`${paramType}_${param.name}`] || ''}
                      onChange={(e) => onParamChange(paramType, param.name, e.target.value)}
                    />
                  )}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default ParamsInput
