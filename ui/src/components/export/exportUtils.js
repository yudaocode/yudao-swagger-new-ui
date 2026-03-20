/**
 * 导出工具函数
 */

/**
 * 转义 HTML 特殊字符
 */
export const escapeHtml = (text) => {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * 收集操作中的所有 Schema 引用
 */
export const collectSchemaRefs = (obj, refSet) => {
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

/**
 * 递归收集所有相关的 Schema
 */
export const collectAllRelatedSchemas = (schemaName, allSchemas, collectedSet) => {
  if (collectedSet.has(schemaName)) return
  collectedSet.add(schemaName)
  
  const schema = allSchemas[schemaName]
  if (!schema) return
  
  const refs = new Set()
  collectSchemaRefs(schema, refs)
  refs.forEach(ref => collectAllRelatedSchemas(ref, allSchemas, collectedSet))
}

/**
 * 获取选中的操作列表
 */
export const getSelectedOperations = (selectedEndpoints, apiData) => {
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

/**
 * 构建过滤后的导出数据
 */
export const buildFilteredExportData = (operations, apiData) => {
  const filteredPaths = {}
  operations.forEach(({ method, path, operation }) => {
    if (!filteredPaths[path]) {
      filteredPaths[path] = {}
    }
    filteredPaths[path][method.toLowerCase()] = operation
  })
  
  const schemaRefs = new Set()
  operations.forEach(({ operation }) => {
    collectSchemaRefs(operation, schemaRefs)
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
  
  return {
    ...apiData,
    paths: filteredPaths,
    components: {
      ...apiData.components,
      schemas: filteredSchemas
    }
  }
}

/**
 * 下载文件
 */
export const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
