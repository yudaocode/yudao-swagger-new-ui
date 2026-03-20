/**
 * Markdown 导出功能
 */

import { getSelectedOperations, buildFilteredExportData } from './exportUtils'

/**
 * 解析 Schema 获取属性列表（不递归嵌套）
 */
const resolveSchemaProperties = (schema, allSchemas) => {
  if (!schema) return []
  
  // 如果是引用，解析引用
  if (schema.$ref) {
    const schemaName = schema.$ref.split('/').pop()
    const resolvedSchema = allSchemas[schemaName]
    return resolveSchemaProperties(resolvedSchema, allSchemas)
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

/**
 * 格式化示例值用于显示
 */
const formatExample = (example) => {
  if (!example) return ''
  // 转义管道符
  return example.replace(/\|/g, '\\|')
}

/**
 * 生成属性表格
 */
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

/**
 * 收集所有需要单独展示的嵌套 Schema（排除根 Schema）
 */
const collectNestedSchemas = (schema, allSchemas, collected = new Set(), isRoot = true) => {
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
      collectNestedSchemas(resolvedSchema, allSchemas, collected, false)
    }
    return
  }
  
  if (schema.type === 'object' && schema.properties) {
    Object.values(schema.properties).forEach(prop => {
      if (prop.$ref) {
        collectNestedSchemas(prop, allSchemas, collected, false)
      } else if (prop.type === 'array' && prop.items) {
        collectNestedSchemas(prop.items, allSchemas, collected, false)
      } else if (prop.type === 'object' && prop.properties) {
        collectNestedSchemas(prop, allSchemas, collected, false)
      }
    })
  }
}

/**
 * 获取 Schema 的属性
 */
const getSchemaByName = (schemaName, allSchemas) => {
  const schema = allSchemas[schemaName]
  if (!schema) return null
  return {
    name: schemaName,
    description: schema.description || '',
    properties: resolveSchemaProperties(schema, allSchemas)
  }
}

/**
 * 生成锚点 ID（Markdown 标题转锚点的规则）
 */
const generateAnchorId = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * 生成目录
 */
const generateToc = (groupedOps) => {
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

/**
 * 生成 Markdown 内容
 */
export const generateMarkdown = (selectedEndpoints, apiData) => {
  const operations = getSelectedOperations(selectedEndpoints, apiData)
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
  
  // 生成目录
  md += generateToc(groupedOps)
  
  // 参数位置的中文名称映射
  const inNames = {
    path: 'Path Parameters',
    query: 'Query Parameters',
    header: 'Header Parameters',
    cookie: 'Cookie Parameters'
  }
  
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
            const properties = resolveSchemaProperties(mediaType.schema, allSchemas)
            if (properties.length > 0) {
              md += generatePropertyTable(properties)
              md += '\n'
            }
            
            // 收集嵌套的 Schema 并单独展示
            const nestedSchemaNames = new Set()
            collectNestedSchemas(mediaType.schema, allSchemas, nestedSchemaNames, true)
            
            if (nestedSchemaNames.size > 0) {
              nestedSchemaNames.forEach(schemaName => {
                const schemaInfo = getSchemaByName(schemaName, allSchemas)
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
                const properties = resolveSchemaProperties(mediaType.schema, allSchemas)
                if (properties.length > 0) {
                  md += generatePropertyTable(properties)
                  md += '\n'
                }
                
                // 收集嵌套的 Schema 并单独展示
                const nestedSchemaNames = new Set()
                collectNestedSchemas(mediaType.schema, allSchemas, nestedSchemaNames, true)
                
                if (nestedSchemaNames.size > 0) {
                  nestedSchemaNames.forEach(schemaName => {
                    const schemaInfo = getSchemaByName(schemaName, allSchemas)
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

/**
 * 导出 Markdown 文件
 */
export const exportMarkdown = (selectedEndpoints, apiData) => {
  const md = generateMarkdown(selectedEndpoints, apiData)
  const fileName = apiData.info?.title 
    ? `${apiData.info.title.replace(/\s+/g, '-')}.md` 
    : 'api-documentation.md'
  
  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
