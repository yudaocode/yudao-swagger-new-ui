import { useState, useCallback } from 'react'

// Minimum loading time in milliseconds for better UX
const MIN_LOADING_TIME = 300

/**
 * API 请求 Hook
 * @param {Object} options - 配置选项
 * @param {string} options.authToken - 认证 token
 * @returns {Object} - 请求状态和方法
 */
export function useApiRequest({ authToken } = {}) {
  const [loading, setLoading] = useState(false)
  const [responseData, setResponseData] = useState(null)

  const getConfigBaseUrl = useCallback(() => {
    const swaggerConfig = window.SWAGGER_UI_CONFIG || {}
    return swaggerConfig.baseUrl || ''
  }, [])

  /**
   * 检查 paramValues 中是否有文件类型
   */
  const hasFileInParams = useCallback((paramValues) => {
    return Object.values(paramValues).some(value => 
      value instanceof File || (Array.isArray(value) && value.some(v => v instanceof File))
    )
  }, [])

  /**
   * 构建 FormData
   */
  const buildFormData = useCallback((paramValues, multipartSchema) => {
    const formData = new FormData()

    // 遍历 multipart schema 的属性
    if (multipartSchema?.properties) {
      Object.keys(multipartSchema.properties).forEach(key => {
        const value = paramValues[`body_${key}`]
        if (value !== undefined && value !== null && value !== '') {
          // 处理文件数组（多文件上传）
          if (Array.isArray(value) && value.some(v => v instanceof File)) {
            value.forEach(file => {
              if (file instanceof File) {
                formData.append(key, file)
              }
            })
          } else if (value instanceof File) {
            // 单文件上传
            formData.append(key, value)
          } else {
            // 其他类型
            formData.append(key, value)
          }
        }
      })
    }

    return formData
  }, [])

  const sendRequest = useCallback(async ({
    method,
    path,
    paramValues,
    requestParams,
    groupedParams,
    requestBodySchema,
    requestBody,
    op,
    isMultipartRequest,
    multipartSchema,
  }) => {
    setLoading(true)
    setResponseData(null)

    const startTime = Date.now()

    try {
      let fullPath = path.replace(/\{(\w+)\}/g, (_, key) => {
        return paramValues[`path_${key}`] || `{${key}}`
      })

      // Build query params from requestParams (handles nested params)
      const queryParams = []
      if (groupedParams.query) {
        groupedParams.query.forEach(param => {
          const paramValue = requestParams?.[param.name]
          if (paramValue !== undefined && paramValue !== null) {
            if (typeof paramValue === 'object') {
              // Nested object - expand to individual query params
              Object.entries(paramValue).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                  queryParams.push(`${key}=${encodeURIComponent(value)}`)
                }
              })
            } else if (paramValue !== '') {
              queryParams.push(`${param.name}=${encodeURIComponent(paramValue)}`)
            }
          }
        })
      }
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''

      // Build headers
      const headers = {}

      // For multipart/form-data, don't set Content-Type, let browser set it with boundary
      if (!isMultipartRequest) {
        headers['Content-Type'] = 'application/json'
      }

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const options = {
        method: method.toUpperCase(),
        headers,
      }

      // Handle request body
      if (isMultipartRequest && multipartSchema) {
        // Build FormData for multipart requests
        const formData = buildFormData(paramValues, multipartSchema)
        options.body = formData
      } else if (requestBodySchema && requestBody) {
        options.body = requestBody
      }

      // Build the full URL with baseUrl prefix
      const configBaseUrl = getConfigBaseUrl()
      let requestUrl
      if (configBaseUrl) {
        if (configBaseUrl.startsWith('http')) {
          requestUrl = new URL(fullPath, configBaseUrl).href
        } else if (configBaseUrl.startsWith('/')) {
          requestUrl = configBaseUrl.replace(/\/$/, '') + fullPath
        } else {
          requestUrl = fullPath
        }
      } else {
        requestUrl = fullPath
      }

      const response = await fetch(requestUrl + queryString, options)

      // Try to parse JSON response, fallback to text if not JSON
      let data
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      const result = {
        success: true,
        status: response.status,
        statusText: response.statusText,
        data,
      }

      setResponseData({
        status: response.status,
        statusText: response.statusText,
        data,
      })

      return result
    } catch (error) {
      const errorResult = {
        error: true,
        message: error.message,
      }
      setResponseData(errorResult)
      return errorResult
    } finally {
      // Ensure minimum loading time for better UX
      const elapsed = Date.now() - startTime
      const remainingTime = MIN_LOADING_TIME - elapsed

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      }

      setLoading(false)
    }
  }, [authToken, getConfigBaseUrl, buildFormData])

  const clearResponse = useCallback(() => {
    setResponseData(null)
  }, [])

  return {
    loading,
    responseData,
    sendRequest,
    clearResponse,
  }
}

export default useApiRequest
