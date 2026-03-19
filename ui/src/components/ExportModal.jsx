import React, { useState, useEffect, useMemo } from 'react'
import './ExportModal.scss'

const EXPORT_FORMATS = [
  { id: 'json', label: 'JSON', description: 'OpenAPI JSON format', enabled: true },
  { id: 'html', label: 'HTML', description: 'HTML documentation', enabled: false },
  { id: 'word', label: 'Word', description: 'Microsoft Word document', enabled: false },
  { id: 'markdown', label: 'Markdown', description: 'Markdown documentation', enabled: true },
]

function ExportModal({ isOpen, onClose, apiData }) {
  const [selectedEndpoints, setSelectedEndpoints] = useState(new Set())
  const [selectAll, setSelectAll] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedGroups, setCollapsedGroups] = useState(new Set())
  const [selectedFormat, setSelectedFormat] = useState('json')

  const endpoints = useMemo(() => {
    if (!apiData || !apiData.paths) return []
    const result = []
    Object.entries(apiData.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        const key = `${method.toUpperCase()} ${path}`
        result.push({
          key,
          method: method.toUpperCase(),
          path,
          summary: operation.summary || '',
          tags: operation.tags || ['default']
        })
      })
    })
    return result
  }, [apiData])

  const filteredEndpoints = useMemo(() => {
    if (!searchQuery) return endpoints
    const query = searchQuery.toLowerCase()
    return endpoints.filter(ep => 
      ep.path.toLowerCase().includes(query) ||
      ep.method.toLowerCase().includes(query) ||
      ep.summary.toLowerCase().includes(query) ||
      ep.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }, [endpoints, searchQuery])

  const groupedEndpoints = useMemo(() => {
    const groups = {}
    filteredEndpoints.forEach(ep => {
      ep.tags.forEach(tag => {
        if (!groups[tag]) {
          groups[tag] = []
        }
        groups[tag].push(ep)
      })
    })
    return groups
  }, [filteredEndpoints])

  const selectedEndpointList = useMemo(() => {
    return endpoints.filter(ep => selectedEndpoints.has(ep.key))
  }, [endpoints, selectedEndpoints])

  useEffect(() => {
    if (isOpen) {
      const allKeys = new Set(endpoints.map(ep => ep.key))
      setSelectedEndpoints(allKeys)
      setSelectAll(true)
      setSearchQuery('')
      setCollapsedGroups(new Set())
      setSelectedFormat('json')
    }
  }, [isOpen, endpoints])

  const handleToggleAll = () => {
    if (selectAll) {
      setSelectedEndpoints(new Set())
    } else {
      setSelectedEndpoints(new Set(endpoints.map(ep => ep.key)))
    }
    setSelectAll(!selectAll)
  }

  const handleToggleEndpoint = (key) => {
    setSelectedEndpoints(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      setSelectAll(newSet.size === endpoints.length)
      return newSet
    })
  }

  const handleToggleTag = (tag) => {
    const tagEndpoints = groupedEndpoints[tag] || []
    const tagKeys = tagEndpoints.map(ep => ep.key)
    const allTagSelected = tagKeys.every(key => selectedEndpoints.has(key))
    
    setSelectedEndpoints(prev => {
      const newSet = new Set(prev)
      tagKeys.forEach(key => {
        if (allTagSelected) {
          newSet.delete(key)
        } else {
          newSet.add(key)
        }
      })
      setSelectAll(newSet.size === endpoints.length)
      return newSet
    })
  }

  const handleToggleGroupCollapse = (tag, e) => {
    e.stopPropagation()
    setCollapsedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tag)) {
        newSet.delete(tag)
      } else {
        newSet.add(tag)
      }
      return newSet
    })
  }

  const handleExpandAll = () => {
    setCollapsedGroups(new Set())
  }

  const handleCollapseAll = () => {
    setCollapsedGroups(new Set(Object.keys(groupedEndpoints)))
  }

  const handleRemoveEndpoint = (key, e) => {
    e.stopPropagation()
    handleToggleEndpoint(key)
  }

  const collectSchemaRefs = (obj, refSet) => {
    if (!obj || typeof obj !== 'object') return
    
    if (Array.isArray(obj)) {
      obj.forEach(item => collectSchemaRefs(item, refSet))
      return
    }
    
    Object.entries(obj).forEach(([key, value]) => {
      if (key === '$ref' && typeof value === 'string') {
        const match = value.match(/^#\/components\/schemas\/(.+)$/)
        if (match) {
          refSet.add(match[1])
        }
      } else {
        collectSchemaRefs(value, refSet)
      }
    })
  }

  const collectAllRelatedSchemas = (schemaName, allSchemas, collectedSet) => {
    if (collectedSet.has(schemaName)) return
    collectedSet.add(schemaName)
    
    const schema = allSchemas[schemaName]
    if (!schema) return
    
    const refs = new Set()
    collectSchemaRefs(schema, refs)
    refs.forEach(ref => collectAllRelatedSchemas(ref, allSchemas, collectedSet))
  }

  const getSelectedOperations = () => {
    const operations = []
    selectedEndpoints.forEach(key => {
      const [method, ...pathParts] = key.split(' ')
      const path = pathParts.join(' ')
      const methodLower = method.toLowerCase()
      
      if (apiData.paths[path] && apiData.paths[path][methodLower]) {
        operations.push({
          method: method.toUpperCase(),
          path,
          operation: apiData.paths[path][methodLower]
        })
      }
    })
    return operations
  }

  const generateMarkdown = () => {
    const operations = getSelectedOperations()
    const allSchemas = apiData.components?.schemas || {}
    
    let md = ''
    
    // 标题和描述
    md += `# ${apiData.info?.title || 'API Documentation'}\n\n`
    if (apiData.info?.description) {
      md += `${apiData.info.description}\n\n`
    }
    if (apiData.info?.version) {
      md += `**Version:** ${apiData.info.version}\n\n`
    }
    md += '---\n\n'
    
    // 按 tag 分组
    const groupedOps = {}
    operations.forEach(({ method, path, operation }) => {
      const tags = operation.tags || ['default']
      tags.forEach(tag => {
        if (!groupedOps[tag]) {
          groupedOps[tag] = []
        }
        groupedOps[tag].push({ method, path, operation })
      })
    })
    
    // 解析 schema 获取属性列表（不递归嵌套）
    const resolveSchemaProperties = (schema) => {
      if (!schema) return []
      
      // 如果是引用，解析引用
      if (schema.$ref) {
        const schemaName = schema.$ref.split('/').pop()
        const resolvedSchema = allSchemas[schemaName]
        return resolveSchemaProperties(resolvedSchema)
      }
      
      const properties = []
      
      if (schema.type === 'object' && schema.properties) {
        const required = schema.required || []
        Object.entries(schema.properties).forEach(([propName, prop]) => {
          let propType = prop.type || ''
          
          // 处理引用类型
          if (prop.$ref) {
            propType = prop.$ref.split('/').pop()
          } else if (prop.type === 'array' && prop.items) {
            const itemType = prop.items.$ref 
              ? prop.items.$ref.split('/').pop()
              : prop.items.type || 'any'
            propType = `array<${itemType}>`
          } else if (prop.type === 'object' && prop.properties) {
            propType = 'object'
          }
          
          // 获取示例值
          let example = ''
          if (prop.example !== undefined) {
            example = typeof prop.example === 'object' ? JSON.stringify(prop.example) : String(prop.example)
          }
          
          properties.push({
            name: propName,
            type: propType,
            required: required.includes(propName),
            description: prop.description || '',
            example
          })
        })
      }
      
      return properties
    }
    
    // 生成属性表格
    const generatePropertyTable = (properties) => {
      if (!properties || properties.length === 0) return ''
      
      let table = '| Name | Required | Type | Example | Description |\n'
      table += '|------|----------|------|---------|-------------|\n'
      properties.forEach(prop => {
        const isRequired = prop.required ? 'Yes' : 'No'
        const desc = (prop.description || '').replace(/\|/g, '\\|')
        const example = formatExample(prop.example)
        table += `| ${prop.name} | ${isRequired} | ${prop.type} | ${example} | ${desc} |\n`
      })
      return table
    }
    
    // 收集所有需要单独展示的嵌套 Schema（排除根 Schema）
    const collectNestedSchemas = (schema, collected = new Set(), isRoot = true) => {
      if (!schema) return
      
      if (schema.$ref) {
        const schemaName = schema.$ref.split('/').pop()
        if (collected.has(schemaName)) return
        
        const resolvedSchema = allSchemas[schemaName]
        if (resolvedSchema) {
          // 根 Schema 不加入收集，直接递归处理其属性
          if (!isRoot) {
            collected.add(schemaName)
          }
          // 递归处理属性的嵌套 Schema
          collectNestedSchemas(resolvedSchema, collected, false)
        }
        return
      }
      
      if (schema.type === 'object' && schema.properties) {
        Object.values(schema.properties).forEach(prop => {
          if (prop.$ref) {
            collectNestedSchemas(prop, collected, false)
          } else if (prop.type === 'array' && prop.items) {
            collectNestedSchemas(prop.items, collected, false)
          } else if (prop.type === 'object' && prop.properties) {
            collectNestedSchemas(prop, collected, false)
          }
        })
      }
    }
    
    // 获取 Schema 的属性
    const getSchemaByName = (schemaName) => {
      const schema = allSchemas[schemaName]
      if (!schema) return null
      return {
        name: schemaName,
        description: schema.description || '',
        properties: resolveSchemaProperties(schema)
      }
    }
    
    // 格式化示例值用于显示
    const formatExample = (example) => {
      if (!example) return ''
      // 转义管道符
      return example.replace(/\|/g, '\\|')
    }
    
    // 生成锚点 ID（Markdown 标题转锚点的规则）
    const generateAnchorId = (text) => {
      return text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    }
    
    // 生成目录
    const generateToc = () => {
      let toc = '## 接口列表\n\n'
      
      Object.entries(groupedOps).forEach(([tag, ops]) => {
        const tagAnchor = generateAnchorId(tag)
        toc += `- [${tag}](#${tagAnchor})\n`
        ops.forEach(({ method, path, operation }) => {
          const title = `${method} ${path}`
          const anchor = generateAnchorId(title)
          const summary = operation.summary ? ` - ${operation.summary}` : ''
          toc += `  - [${title}${summary}](#${anchor})\n`
        })
      })
      
      return toc + '\n---\n\n'
    }
    
    // 生成目录
    md += generateToc()
    
    // 生成每个 tag 的内容
    Object.entries(groupedOps).forEach(([tag, ops]) => {
      md += `## ${tag}\n\n`
      
      ops.forEach(({ method, path, operation }) => {
        const summary = operation.summary ? ` ${operation.summary}` : ''
        md += `### ${method} ${path}${summary}\n\n`
        
        if (operation.description) {
          md += `${operation.description}\n\n`
        }
        
        // Parameters - 按 in 分类展示
        if (operation.parameters && operation.parameters.length > 0) {
          // 按 in 字段分组
          const paramsByIn = {}
          operation.parameters.forEach(param => {
            const in_ = param.in || 'query'
            if (!paramsByIn[in_]) {
              paramsByIn[in_] = []
            }
            paramsByIn[in_].push(param)
          })
          
          // 参数位置的中文名称映射
          const inNames = {
            path: 'Path Parameters',
            query: 'Query Parameters',
            header: 'Header Parameters',
            cookie: 'Cookie Parameters'
          }
          
          // 按顺序展示各类型参数
          const orderedIn = ['path', 'query', 'header', 'cookie']
          orderedIn.forEach(in_ => {
            const params = paramsByIn[in_]
            if (!params || params.length === 0) return
            
            const sectionName = inNames[in_] || `Parameters (${in_})`
            md += `**${sectionName}:**\n\n`
            md += '| Name | Required | Type | Example | Description |\n'
            md += '|------|----------|------|---------|-------------|\n'
            params.forEach(param => {
              const name = param.name || ''
              const required = param.required ? 'Yes' : 'No'
              const type = param.schema?.type || param.type || ''
              const desc = (param.description || '').replace(/\|/g, '\\|')
              // 获取示例值
              let example = ''
              if (param.example !== undefined) {
                example = typeof param.example === 'object' ? JSON.stringify(param.example) : String(param.example)
              } else if (param.schema?.example !== undefined) {
                example = typeof param.schema.example === 'object' ? JSON.stringify(param.schema.example) : String(param.schema.example)
              } else if (param.examples && Object.keys(param.examples).length > 0) {
                const firstExample = Object.values(param.examples)[0]
                if (firstExample.value !== undefined) {
                  example = typeof firstExample.value === 'object' ? JSON.stringify(firstExample.value) : String(firstExample.value)
                }
              }
              example = formatExample(example)
              md += `| ${name} | ${required} | ${type} | ${example} | ${desc} |\n`
            })
            md += '\n'
          })
        }
        
        // Request Body
        if (operation.requestBody) {
          md += `**Request Body:**\n\n`
          const content = operation.requestBody.content || {}
          Object.entries(content).forEach(([contentType, mediaType]) => {
            md += `Content-Type: \`${contentType}\`\n\n`
            
            if (mediaType.schema) {
              const properties = resolveSchemaProperties(mediaType.schema)
              if (properties.length > 0) {
                md += generatePropertyTable(properties)
                md += '\n'
              }
              
              // 收集嵌套的 Schema 并单独展示
              const nestedSchemaNames = new Set()
              collectNestedSchemas(mediaType.schema, nestedSchemaNames, true)
              
              if (nestedSchemaNames.size > 0) {
                nestedSchemaNames.forEach(schemaName => {
                  const schemaInfo = getSchemaByName(schemaName)
                  if (schemaInfo && schemaInfo.properties.length > 0) {
                    md += `**${schemaName}**`
                    if (schemaInfo.description) {
                      md += ` - ${schemaInfo.description}`
                    }
                    md += '\n\n'
                    md += generatePropertyTable(schemaInfo.properties)
                    md += '\n'
                  }
                })
              }
            }
          })
        }
        
        // Responses
        if (operation.responses) {
          md += `**Responses:**\n\n`
          md += '| Code | Description |\n'
          md += '|------|-------------|\n'
          Object.entries(operation.responses).forEach(([code, response]) => {
            const desc = (response.description || '').replace(/\|/g, '\\|')
            md += `| ${code} | ${desc} |\n`
          })
          md += '\n'
          
          // 展示 Response Body 的结构
          Object.entries(operation.responses).forEach(([code, response]) => {
            if (response.content) {
              Object.entries(response.content).forEach(([contentType, mediaType]) => {
                md += `**Response Body (${code}):**\n\n`
                md += `Content-Type: \`${contentType}\`\n\n`
                
                if (mediaType.schema) {
                  const properties = resolveSchemaProperties(mediaType.schema)
                  if (properties.length > 0) {
                    md += generatePropertyTable(properties)
                    md += '\n'
                  }
                  
                  // 收集嵌套的 Schema 并单独展示
                  const nestedSchemaNames = new Set()
                  collectNestedSchemas(mediaType.schema, nestedSchemaNames, true)
                  
                  if (nestedSchemaNames.size > 0) {
                    nestedSchemaNames.forEach(schemaName => {
                      const schemaInfo = getSchemaByName(schemaName)
                      if (schemaInfo && schemaInfo.properties.length > 0) {
                        md += `**${schemaName}**`
                        if (schemaInfo.description) {
                          md += ` - ${schemaInfo.description}`
                        }
                        md += '\n\n'
                        md += generatePropertyTable(schemaInfo.properties)
                        md += '\n'
                      }
                    })
                  }
                }
              })
            }
          })
        }
        
        md += '---\n\n'
      })
    })
    
    return md
  }

  const handleExportJson = () => {
    const filteredPaths = {}
    const schemaRefs = new Set()
    
    selectedEndpoints.forEach(key => {
      const [method, ...pathParts] = key.split(' ')
      const path = pathParts.join(' ')
      const methodLower = method.toLowerCase()
      
      if (apiData.paths[path] && apiData.paths[path][methodLower]) {
        if (!filteredPaths[path]) {
          filteredPaths[path] = {}
        }
        const operation = apiData.paths[path][methodLower]
        filteredPaths[path][methodLower] = operation
        
        collectSchemaRefs(operation, schemaRefs)
      }
    })

    const allSchemas = apiData.components?.schemas || {}
    const collectedSchemaNames = new Set()
    schemaRefs.forEach(schemaName => {
      collectAllRelatedSchemas(schemaName, allSchemas, collectedSchemaNames)
    })

    const filteredSchemas = {}
    collectedSchemaNames.forEach(name => {
      if (allSchemas[name]) {
        filteredSchemas[name] = allSchemas[name]
      }
    })

    const exportData = {
      ...apiData,
      paths: filteredPaths,
      components: {
        ...apiData.components,
        schemas: filteredSchemas
      }
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    const fileName = apiData.info?.title ? `${apiData.info.title.replace(/\s+/g, '-')}.json` : 'openapi.json'
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportMarkdown = () => {
    const md = generateMarkdown()
    const dataBlob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    const fileName = apiData.info?.title ? `${apiData.info.title.replace(/\s+/g, '-')}.md` : 'api-documentation.md'
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    if (!apiData) return
    
    if (selectedFormat === 'json') {
      handleExportJson()
    } else if (selectedFormat === 'markdown') {
      handleExportMarkdown()
    }

    onClose()
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay export-modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content export-modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Export API</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="modal-body export-modal-body">
          <div className="export-column export-column-formats">
            <div className="export-column-header">
              <span className="export-column-title">Format</span>
            </div>
            <div className="export-formats-list">
              {EXPORT_FORMATS.map(format => (
                <div
                  key={format.id}
                  className={`export-format-item ${selectedFormat === format.id ? 'selected' : ''} ${!format.enabled ? 'disabled' : ''}`}
                  onClick={() => format.enabled && setSelectedFormat(format.id)}
                >
                  <div className="export-format-icon">
                    {format.id === 'json' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                      </svg>
                    )}
                    {format.id === 'html' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                        <line x1="14" y1="4" x2="14" y2="20"></line>
                        <line x1="10" y1="4" x2="10" y2="20"></line>
                      </svg>
                    )}
                    {format.id === 'word' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                    )}
                    {format.id === 'markdown' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    )}
                  </div>
                  <div className="export-format-info">
                    <span className="export-format-label">{format.label}</span>
                    <span className="export-format-desc">{format.description}</span>
                  </div>
                  {!format.enabled && <span className="export-format-soon">Soon</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="export-column export-column-tree">
            <div className="export-column-header">
              <span className="export-column-title">Select APIs</span>
              <div className="export-header-actions">
                <button className="export-text-btn" onClick={handleExpandAll}>
                  Expand all
                </button>
                <button className="export-text-btn" onClick={handleCollapseAll}>
                  Collapse all
                </button>
                <button className="export-text-btn" onClick={handleToggleAll}>
                  {selectAll ? 'Deselect all' : 'Select all'}
                </button>
              </div>
            </div>
            <div className="export-search-box">
              <svg className="export-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="export-search-input"
                placeholder="Search APIs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <nav className="export-nav-section">
              <div className="export-nav-section-inner">
                {Object.keys(groupedEndpoints).length === 0 ? (
                  <div className="export-no-results">
                    {searchQuery ? 'No matching endpoints' : 'No endpoints available'}
                  </div>
                ) : (
                  Object.entries(groupedEndpoints).map(([tag, tagEndpoints]) => {
                    const allTagSelected = tagEndpoints.every(ep => selectedEndpoints.has(ep.key))
                    const someTagSelected = tagEndpoints.some(ep => selectedEndpoints.has(ep.key))
                    const isCollapsed = collapsedGroups.has(tag)
                    return (
                      <div key={tag} className="export-nav-group">
                        <div className="export-group-header">
                          <button 
                            className="export-group-collapse-btn"
                            onClick={(e) => handleToggleGroupCollapse(tag, e)}
                          >
                            <svg 
                              className={`export-group-collapse-icon ${isCollapsed ? 'collapsed' : ''}`} 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2"
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                          <label className="export-checkbox-label">
                            <input
                              type="checkbox"
                              checked={allTagSelected}
                              indeterminate={someTagSelected && !allTagSelected}
                              onChange={() => handleToggleTag(tag)}
                            />
                            <span className="export-group-label">{tag}</span>
                            <span className="export-group-count">({tagEndpoints.length})</span>
                          </label>
                        </div>
                        {!isCollapsed && (
                          <div className="export-group-endpoints">
                            {tagEndpoints.map(ep => (
                              <label
                                key={ep.key}
                                className={`export-nav-item ${selectedEndpoints.has(ep.key) ? 'selected' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedEndpoints.has(ep.key)}
                                  onChange={() => handleToggleEndpoint(ep.key)}
                                />
                                <div className="export-nav-item-left">
                                  <span className={`export-method ${ep.method.toLowerCase()}`}>{ep.method}</span>
                                  <span className="export-path">{ep.path}</span>
                                </div>
                                {ep.summary && (
                                  <span className="export-nav-summary">{ep.summary}</span>
                                )}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </nav>
          </div>

          <div className="export-column export-column-selected">
            <div className="export-column-header">
              <span className="export-column-title">Selected</span>
              <span className="export-selected-count">{selectedEndpointList.length}</span>
            </div>
            <div className="export-stats">
              <div className="export-stat-item">
                <span className="export-stat-label">Total APIs</span>
                <span className="export-stat-value">{endpoints.length}</span>
              </div>
              <div className="export-stat-item">
                <span className="export-stat-label">Selected</span>
                <span className="export-stat-value">{selectedEndpointList.length}</span>
              </div>
              <div className="export-stat-item">
                <span className="export-stat-label">Tags</span>
                <span className="export-stat-value">{new Set(selectedEndpointList.flatMap(ep => ep.tags)).size}</span>
              </div>
            </div>
            <div className="export-selected-list">
              {selectedEndpointList.length === 0 ? (
                <div className="export-no-selection">No APIs selected</div>
              ) : (
                selectedEndpointList.map(ep => (
                  <div key={ep.key} className="export-selected-item">
                    <div className="export-selected-item-left">
                      <span className={`export-method ${ep.method.toLowerCase()}`}>{ep.method}</span>
                      <span className="export-path">{ep.path}</span>
                    </div>
                    <button 
                      className="export-remove-btn"
                      onClick={(e) => handleRemoveEndpoint(ep.key, e)}
                      aria-label="Remove"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="modal-btn modal-btn-save" 
            onClick={handleExport}
            disabled={selectedEndpoints.size === 0 || (selectedFormat !== 'json' && selectedFormat !== 'markdown')}
          >
            Export {selectedFormat.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportModal
