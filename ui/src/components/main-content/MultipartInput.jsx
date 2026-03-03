import React from 'react'
import './MultipartInput.scss'

/**
 * 判断 schema 属性是否为文件类型
 */
function isFileProperty(schema) {
  if (!schema) return false
  return schema.type === 'string' && schema.format === 'binary'
}

/**
 * 判断 schema 属性是否为多文件类型（数组形式的文件）
 */
function isMultipleFileProperty(schema) {
  if (!schema) return false
  return schema.type === 'array' && schema.items?.type === 'string' && schema.items?.format === 'binary'
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
          const isMultipleFile = isMultipleFileProperty(prop.schema)
          const isFileField = isFile || isMultipleFile

          // 显示类型标签
          const typeLabel = isMultipleFile
            ? `array of ${prop.schema.items?.format || prop.schema.items?.type}`
            : (prop.schema.format || prop.schema.type)

          return (
            <div key={prop.name} className="param-input-row">
              <label className="param-input-label">
                {prop.name}
                {prop.required && <span className="required">*</span>}
                <span className="param-type-badge">{typeLabel}</span>
              </label>
              {isCheckbox ? (
                <input
                  type="checkbox"
                  className="param-checkbox"
                  checked={paramValues[`body_${prop.name}`] === 'true'}
                  onChange={(e) => onParamChange('body', prop.name, e.target.checked.toString())}
                />
              ) : isFileField ? (
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    className="param-file"
                    multiple={isMultipleFile}
                    onChange={(e) => {
                      if (isMultipleFile) {
                        // 多文件：传递 FileList 或 File 数组
                        onParamChange('body', prop.name, Array.from(e.target.files))
                      } else {
                        // 单文件
                        onParamChange('body', prop.name, e.target.files[0])
                      }
                    }}
                  />
                  {isMultipleFile && paramValues[`body_${prop.name}`] && Array.isArray(paramValues[`body_${prop.name}`]) && (
                    <span className="file-count">{paramValues[`body_${prop.name}`].length} file(s) selected</span>
                  )}
                </div>
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
