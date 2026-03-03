import React from 'react'
import './SchemaViewer.scss'

/**
 * Schema 树形渲染组件
 * 用于渲染 OpenAPI Schema 的属性结构
 */
function SchemaViewer({ schema, prefix = '', level = 0 }) {
  if (!schema) return null

  if (schema.$ref && !schema.properties) {
    const refName = schema.$ref?.replace('#/components/schemas/', '')
    return (
      <div key={`${prefix}-ref`} className="param-row" style={{ paddingLeft: `${level * 16}px` }}>
        <div className="param-col-left">
          <span className="param-name">{prefix || refName}</span>
          <span className="param-type ref-type">{refName}</span>
        </div>
        <div className="param-col-right">
          <span className="param-desc"></span>
        </div>
      </div>
    )
  }

  if (schema.type === 'array' && schema.items) {
    const items = schema.items
    const hasNestedProperties = items.properties || items.$ref

    // 如果没有 prefix，这是顶层 array
    if (!prefix) {
      return (
        <React.Fragment>
          {/* 显示数组类型信息 */}
          <div className="param-row" style={{ paddingLeft: `${level * 16}px` }}>
            <div className="param-col-left">
              <span className="param-name">items</span>
              <span className="param-type">
                array of {items.type || 'any'}
                {items.format && ` (${items.format})`}
              </span>
            </div>
            <div className="param-col-right">
              <span className="param-desc">{schema.description || ''}</span>
            </div>
          </div>
          {/* 如果有嵌套属性，继续渲染 */}
          {hasNestedProperties && <SchemaViewer schema={items} prefix="" level={level} />}
        </React.Fragment>
      )
    }

    return (
      <React.Fragment key={`${prefix}-array`}>
        <div className="param-row" style={{ paddingLeft: `${level * 16}px` }}>
          <div className="param-col-left">
            <span className="param-name">{prefix}</span>
            <span className="param-type">array</span>
          </div>
          <div className="param-col-right">
            <span className="param-desc">{schema.description || ''}</span>
          </div>
        </div>
        {hasNestedProperties && <SchemaViewer schema={items} prefix="" level={level + 1} />}
      </React.Fragment>
    )
  }

  if (schema.type === 'object' && schema.properties) {
    const elements = []

    if (prefix) {
      elements.push(
        <div key={`${prefix}-obj-header`} className="param-row" style={{ paddingLeft: `${level * 16}px` }}>
          <div className="param-col-left">
            <span className="param-name">{prefix}</span>
            <span className="param-type">object</span>
          </div>
          <div className="param-col-right">
            <span className="param-desc">{schema.description || ''}</span>
          </div>
        </div>
      )
    }

    const childLevel = level + 1

    Object.entries(schema.properties).forEach(([key, prop]) => {
      const displayName = prefix ? `${prefix}.${key}` : key
      const required = schema.required?.includes(key)

      const hasNestedContent = (prop.type === 'object' && prop.properties) ||
                               (prop.type === 'array' && prop.items) ||
                               prop.$ref

      if (hasNestedContent) {
        elements.push(
          <React.Fragment key={displayName}>
            <div className="param-row" style={{ paddingLeft: `${childLevel * 16}px` }}>
              <div className="param-col-left">
                <span className="param-name">
                  {displayName}
                  {required && <span className="required">*</span>}
                </span>
                <span className="param-type">
                  {prop.$ref ? prop.$ref.replace('#/components/schemas/', '') : prop.type || 'string'}
                  {prop.format && ` (${prop.format})`}
                </span>
              </div>
              <div className="param-col-right">
                <span className="param-desc">{prop.description || ''}</span>
                {required && <span className="param-meta">required</span>}
              </div>
            </div>
            <SchemaViewer schema={prop} prefix="" level={childLevel} />
          </React.Fragment>
        )
      } else {
        elements.push(
          <div key={displayName} className="param-row" style={{ paddingLeft: `${childLevel * 16}px` }}>
            <div className="param-col-left">
              <span className="param-name">
                {displayName}
                {required && <span className="required">*</span>}
              </span>
              <span className="param-type">
                {prop.type || 'string'}
                {prop.format && ` (${prop.format})`}
              </span>
            </div>
            <div className="param-col-right">
              <span className="param-desc">{prop.description || ''}</span>
              {required && <span className="param-meta">required</span>}
            </div>
          </div>
        )
      }
    })

    return elements
  }

  return null
}

export default SchemaViewer
