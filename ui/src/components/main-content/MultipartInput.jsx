import React from 'react'

/**
 * 判断 schema 属性是否为文件类型
 */
function isFileProperty(schema) {
  if (!schema) return false
  return schema.type === 'string' && schema.format === 'binary'
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
 * Multipart 表单输入组件
 * 用于处理 multipart/form-data 类型的请求体
 */
function MultipartInput({ schema, paramValues, onParamChange }) {
  if (!schema || !schema.properties) return null

  const properties = Object.entries(schema.properties).map(([key, prop]) => ({
    name: key,
    schema: prop,
    required: schema.required?.includes(key) || false,
    description: prop.description || '',
  }))

  return (
    <div className="params-input-section">
      <div className="section-header">
        <span className="section-title">request body (multipart/form-data)</span>
      </div>
      <div className="params-input-list">
        <div className="param-input-type-header">form data</div>
        {properties.map((prop) => {
          const inputType = getInputType(prop.schema)
          const isFile = inputType === 'file'
          const isCheckbox = inputType === 'checkbox'

          return (
            <div key={prop.name} className="param-input-row">
              <label className="param-input-label">
                {prop.name}
                {prop.required && <span className="required">*</span>}
                <span className="param-type-badge">{prop.schema.format || prop.schema.type}</span>
              </label>
              {isCheckbox ? (
                <input
                  type="checkbox"
                  className="param-checkbox"
                  checked={paramValues[`body_${prop.name}`] === 'true'}
                  onChange={(e) => onParamChange('body', prop.name, e.target.checked.toString())}
                />
              ) : isFile ? (
                <input
                  type="file"
                  className="param-file"
                  onChange={(e) => onParamChange('body', prop.name, e.target.files[0])}
                />
              ) : (
                <input
                  type={inputType}
                  className="param-input"
                  placeholder={prop.description || ''}
                  value={paramValues[`body_${prop.name}`] || ''}
                  onChange={(e) => onParamChange('body', prop.name, e.target.value)}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MultipartInput
