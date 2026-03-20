/**
 * Word 导出功能
 * 生成专业、简洁、大气的 Word 文档
 */

import { getSelectedOperations } from './exportUtils'

/**
 * 解析 Schema 获取属性列表
 */
const resolveSchemaProperties = (schema, allSchemas, visited = new Set()) => {
  if (!schema) return []

  // 处理引用类型
  if (schema.$ref) {
    const schemaName = schema.$ref.split('/').pop()
    if (visited.has(schemaName)) return []
    visited.add(schemaName)

    const resolvedSchema = allSchemas[schemaName]
    return resolveSchemaProperties(resolvedSchema, allSchemas, visited)
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
        propType = `${itemType}[]`
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
 * 转义 HTML 特殊字符
 */
const escapeHtml = (text) => {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * 生成参数表格
 */
const generateParamTable = (params, title) => {
  if (!params || params.length === 0) return ''

  let html = `
    <div style="margin: 12pt 0;">
      <h4 style="color: #171717; font-size: 11pt; margin: 0 0 8pt 0; font-weight: 600;">${title}</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 9pt;">
        <thead>
          <tr style="background-color: #F5F5F5; border-bottom: 2pt solid #E5E5E5;">
            <th style="padding: 8pt; text-align: left; font-weight: 600; width: 20%; color: #171717;">参数名</th>
            <th style="padding: 8pt; text-align: center; font-weight: 600; width: 10%; color: #171717;">必填</th>
            <th style="padding: 8pt; text-align: left; font-weight: 600; width: 15%; color: #171717;">类型</th>
            <th style="padding: 8pt; text-align: left; font-weight: 600; width: 20%; color: #171717;">示例值</th>
            <th style="padding: 8pt; text-align: left; font-weight: 600; width: 35%; color: #171717;">说明</th>
          </tr>
        </thead>
        <tbody>`

  params.forEach((param, index) => {
    const bgColor = index % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
    const isRequired = param.required ? '是' : '否'
    const requiredColor = param.required ? '#DC2626' : '#A3A3A3'
    const type = param.schema?.type || param.type || ''
    const desc = escapeHtml(param.description || '')
    const example = escapeHtml(param.example || param.schema?.example || '')

    html += `
          <tr style="background-color: ${bgColor}; border-bottom: 1pt solid #E5E5E5;">
            <td style="padding: 8pt; font-weight: 500; font-family: 'Consolas', monospace; color: #171717;">${escapeHtml(param.name)}</td>
            <td style="padding: 8pt; text-align: center; color: ${requiredColor}; font-weight: 600;">${isRequired}</td>
            <td style="padding: 8pt; font-family: 'Consolas', monospace; color: #525252;">${escapeHtml(type)}</td>
            <td style="padding: 8pt; color: #525252;">${example}</td>
            <td style="padding: 8pt; color: #525252;">${desc}</td>
          </tr>`
  })

  html += `
        </tbody>
      </table>
    </div>`

  return html
}

/**
 * 生成属性表格
 */
const generatePropertyTable = (properties, title, level = 0) => {
  if (!properties || properties.length === 0) return ''

  let html = `
    <div style="margin: 12pt 0;">
      ${title ? `<h4 style="color: #171717; font-size: 11pt; margin: 0 0 8pt 0; font-weight: 600;">${title}</h4>` : ''}
      <table style="width: 100%; border-collapse: collapse; font-size: 9pt;">
        <thead>
          <tr style="background-color: #F5F5F5; border-bottom: 2pt solid #E5E5E5;">
            <th style="padding: 8pt; text-align: left; font-weight: 600; width: 20%; color: #171717;">字段名</th>
            <th style="padding: 8pt; text-align: center; font-weight: 600; width: 10%; color: #171717;">必填</th>
            <th style="padding: 8pt; text-align: left; font-weight: 600; width: 15%; color: #171717;">类型</th>
            <th style="padding: 8pt; text-align: left; font-weight: 600; width: 20%; color: #171717;">示例值</th>
            <th style="padding: 8pt; text-align: left; font-weight: 600; width: 35%; color: #171717;">说明</th>
          </tr>
        </thead>
        <tbody>`

    properties.forEach((prop, index) => {
      const bgColor = index % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
      const isRequired = prop.required ? '是' : '否'
      const requiredColor = prop.required ? '#DC2626' : '#A3A3A3'
      const example = escapeHtml(prop.example || '')

      // 根据层级添加缩进
      const indent = level > 0 ? `padding-left: ${level * 16}pt;` : ''

      html += `
          <tr style="background-color: ${bgColor}; border-bottom: 1pt solid #E5E5E5;">
            <td style="padding: 8pt; ${indent} font-weight: 500; font-family: 'Consolas', monospace; color: #171717;">${escapeHtml(prop.name)}</td>
            <td style="padding: 8pt; text-align: center; color: ${requiredColor}; font-weight: 600;">${isRequired}</td>
            <td style="padding: 8pt; font-family: 'Consolas', monospace; color: #525252;">${escapeHtml(prop.type)}</td>
            <td style="padding: 8pt; color: #525252;">${example}</td>
            <td style="padding: 8pt; color: #525252;">${escapeHtml(prop.description)}</td>
          </tr>`
    })

  html += `
        </tbody>
      </table>
    </div>`

  return html
}

/**
 * 递归生成 Schema 及其嵌套对象的属性表格
 */
const generateSchemaWithNested = (schema, allSchemas, level = 0) => {
  if (!schema) return ''

  const properties = resolveSchemaProperties(schema, allSchemas)
  if (properties.length === 0) return ''

  let html = generatePropertyTable(properties, null, level)

  // 遍历属性，找出引用类型的字段并递归展示
  properties.forEach(prop => {
    // 如果类型是一个引用（如 UserVO），递归展示其属性
    if (prop.type && !prop.type.includes('[]') && prop.type !== 'object' && 
        prop.type !== 'string' && prop.type !== 'integer' && prop.type !== 'number' && 
        prop.type !== 'boolean' && prop.type !== 'array') {
      // 这是一个引用类型，查找其 Schema
      const refSchema = allSchemas[prop.type]
      if (refSchema) {
        html += `
    <h5 style="color: #525252; font-size: 10pt; margin: 12pt 0 6pt 0; font-weight: 600;">
      ${escapeHtml(prop.type)} ${prop.description ? `(${escapeHtml(prop.description)})` : ''}
    </h5>`
        html += generateSchemaWithNested(refSchema, allSchemas, level + 1)
      }
    }
    
    // 如果类型是数组，且数组元素是引用类型
    if (prop.type && prop.type.includes('[]')) {
      const itemType = prop.type.replace('[]', '').trim()
      const refSchema = allSchemas[itemType]
      if (refSchema) {
        html += `
    <h5 style="color: #525252; font-size: 10pt; margin: 12pt 0 6pt 0; font-weight: 600;">
      ${escapeHtml(itemType)} (数组元素类型) ${prop.description ? `- ${escapeHtml(prop.description)}` : ''}
    </h5>`
        html += generateSchemaWithNested(refSchema, allSchemas, level + 1)
      }
    }
  })

  return html
}

/**
 * 生成响应表格
 */
const generateResponseTable = (responses) => {
  if (!responses || Object.keys(responses).length === 0) return ''

  let html = `
    <div style="margin: 12pt 0;">
      <h4 style="color: #171717; font-size: 11pt; margin: 0 0 8pt 0; font-weight: 600;">响应状态码</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 9pt;">
        <thead>
          <tr style="background-color: #F5F5F5; border-bottom: 2pt solid #E5E5E5;">
            <th style="padding: 8pt; text-align: center; font-weight: 600; width: 15%; color: #171717;">状态码</th>
            <th style="padding: 8pt; text-align: left; font-weight: 600; width: 85%; color: #171717;">说明</th>
          </tr>
        </thead>
        <tbody>`

  Object.entries(responses).forEach(([code, response], index) => {
    const bgColor = index % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
    const codeNum = parseInt(code)
    let codeColor = '#A3A3A3'

    if (codeNum >= 200 && codeNum < 300) codeColor = '#16A34A'
    else if (codeNum >= 300 && codeNum < 400) codeColor = '#2563EB'
    else if (codeNum >= 400 && codeNum < 500) codeColor = '#D97706'
    else if (codeNum >= 500) codeColor = '#DC2626'

    html += `
          <tr style="background-color: ${bgColor}; border-bottom: 1pt solid #E5E5E5;">
            <td style="padding: 8pt; text-align: center; font-weight: 600; color: ${codeColor}; font-size: 10pt;">${code}</td>
            <td style="padding: 8pt; color: #525252;">${escapeHtml(response.description || '')}</td>
          </tr>`
  })

  html += `
        </tbody>
      </table>
    </div>`

  return html
}

/**
 * 生成方法徽章颜色（使用亮色主题配色）
 */
const getMethodColor = (method) => {
  const colors = {
    GET: '#16A34A',
    POST: '#2563EB',
    PUT: '#D97706',
    PATCH: '#D97706',
    DELETE: '#DC2626'
  }
  return colors[method] || '#A3A3A3'
}

/**
 * 生成 Word 文档内容
 */
export const generateWordDocument = (selectedEndpoints, apiData) => {
  const operations = getSelectedOperations(selectedEndpoints, apiData)
  const allSchemas = apiData.components?.schemas || {}

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

  // 生成 HTML 内容
  let html = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <title>${escapeHtml(apiData.info?.title || 'API Documentation')}</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm;
      mso-page-orientation: portrait;
    }
    body {
      font-family: "Microsoft YaHei", "Segoe UI", Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.6;
      color: #171717;
      background-color: #FFFFFF;
    }
    h1 {
      color: #171717;
      font-size: 24pt;
      font-weight: 700;
      margin: 0 0 12pt 0;
      border-bottom: 2pt solid #E5E5E5;
      padding-bottom: 8pt;
    }
    h2 {
      color: #171717;
      font-size: 16pt;
      font-weight: 700;
      margin: 20pt 0 12pt 0;
      border-bottom: 1pt solid #E5E5E5;
      padding-bottom: 6pt;
    }
    h3 {
      color: #171717;
      font-size: 13pt;
      font-weight: 600;
      margin: 16pt 0 8pt 0;
      padding: 8pt 12pt;
      background-color: #FAFAFA;
      border-left: 4pt solid #2563EB;
      border-radius: 4pt;
    }
    h4 {
      color: #171717;
      font-size: 11pt;
      font-weight: 600;
      margin: 12pt 0 6pt 0;
    }
    h5 {
      color: #525252;
      font-size: 10pt;
      font-weight: 600;
      margin: 12pt 0 6pt 0;
    }
    p {
      margin: 6pt 0;
    }
    .cover-page {
      text-align: center;
      page-break-after: always;
      padding-top: 100pt;
      background-color: #FFFFFF;
    }
    .cover-title {
      font-size: 32pt;
      font-weight: 700;
      color: #171717;
      margin-bottom: 20pt;
    }
    .cover-subtitle {
      font-size: 14pt;
      color: #525252;
      margin-bottom: 60pt;
    }
    .cover-meta {
      font-size: 11pt;
      color: #737373;
      margin: 4pt 0;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>
  <!-- 封面 -->
  <div class="cover-page">
    <div class="cover-title">${escapeHtml(apiData.info?.title || 'API Documentation')}</div>
    <div class="cover-subtitle">API 接口文档</div>
    ${apiData.info?.version ? `<div class="cover-meta">版本：${escapeHtml(apiData.info.version)}</div>` : ''}
    ${apiData.info?.description ? `<div class="cover-meta" style="max-width: 400pt; margin: 20pt auto; line-height: 1.8;">${escapeHtml(apiData.info.description)}</div>` : ''}
    <div class="cover-meta">生成日期：${new Date().toLocaleDateString('zh-CN')}</div>
  </div>

  <!-- 接口详情 -->
  <h1>接口详情</h1>`

  // 生成每个接口的详细内容
  Object.entries(groupedOps).forEach(([tag, ops]) => {
    html += `
  <h2>${escapeHtml(tag)}</h2>`

    ops.forEach(({ method, path, operation }) => {
      const methodColor = getMethodColor(method)
      const summary = operation.summary || ''

      // 使用 h3 作为 API 标题
      html += `
    <h3 style="display: flex; align-items: center; gap: 8pt;">
      <span style="display: inline-block; padding: 3pt 8pt; border-radius: 3pt; font-size: 9pt; font-weight: 700; font-family: Consolas, monospace; background-color: ${methodColor}; color: white;">${method}</span>
      <span style="font-family: Consolas, monospace; font-size: 11pt; font-weight: 600;">${escapeHtml(path)}</span>
      ${summary ? `<span style="font-size: 10pt; font-weight: normal; color: #737373; margin-left: 8pt;">— ${escapeHtml(summary)}</span>` : ''}
    </h3>`

      // 接口描述
      if (operation.description) {
        html += `
    <p style="margin: 8pt 0; color: #525252; font-size: 10pt;">${escapeHtml(operation.description)}</p>`
      }

      // 参数 - 按 in 分类
      if (operation.parameters && operation.parameters.length > 0) {
        const paramsByIn = {}
        operation.parameters.forEach(param => {
          const in_ = param.in || 'query'
          if (!paramsByIn[in_]) {
            paramsByIn[in_] = []
          }
          paramsByIn[in_].push(param)
        })

        const inNames = {
          path: 'Path 参数',
          query: 'Query 参数',
          header: 'Header 参数',
          cookie: 'Cookie 参数'
        }

        const orderedIn = ['path', 'query', 'header', 'cookie']
        orderedIn.forEach(in_ => {
          const params = paramsByIn[in_]
          if (params && params.length > 0) {
            html += generateParamTable(params, inNames[in_] || `参数 (${in_})`)
          }
        })
      }

      // Request Body
      if (operation.requestBody) {
        const content = operation.requestBody.content || {}
        Object.entries(content).forEach(([contentType, mediaType]) => {
          html += `
    <h4>请求体</h4>
    <p style="color: #737373; font-size: 9pt; margin: 4pt 0;">Content-Type: <code style="background-color: #F5F5F5; padding: 2pt 6pt; border-radius: 2pt; color: #2563EB;">${escapeHtml(contentType)}</code></p>`

          if (mediaType.schema) {
            html += generateSchemaWithNested(mediaType.schema, allSchemas)
          }
        })
      }

      // Responses
      if (operation.responses) {
        html += generateResponseTable(operation.responses)

        // Response Body
        Object.entries(operation.responses).forEach(([code, response]) => {
          if (response.content) {
            Object.entries(response.content).forEach(([contentType, mediaType]) => {
              html += `
    <h4>响应体 (${code})</h4>
    <p style="color: #737373; font-size: 9pt; margin: 4pt 0;">Content-Type: <code style="background-color: #F5F5F5; padding: 2pt 6pt; border-radius: 2pt; color: #2563EB;">${escapeHtml(contentType)}</code></p>`

              if (mediaType.schema) {
                html += generateSchemaWithNested(mediaType.schema, allSchemas)
              }
            })
          }
        })
      }

      html += `
    <div style="border-top: 1pt solid #E5E5E5; margin: 16pt 0;"></div>`
    })
  })

  html += `
</body>
</html>`

  return html
}

/**
 * 导出 Word 文件
 */
export const exportWord = (selectedEndpoints, apiData) => {
  try {
    console.log('Exporting Word document...', { selectedEndpoints, apiData })
    
    const html = generateWordDocument(selectedEndpoints, apiData)
    const fileName = apiData.info?.title
      ? `${apiData.info.title.replace(/\s+/g, '-')}.doc`
      : 'api-documentation.doc'

    const blob = new Blob(['\ufeff' + html], {
      type: 'application/msword'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log('Word export completed successfully')
  } catch (error) {
    console.error('Error exporting Word document:', error)
    throw error
  }
}
