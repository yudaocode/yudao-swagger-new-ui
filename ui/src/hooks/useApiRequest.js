import { useState, useCallback } from 'react'

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

  const sendRequest = useCallback(async ({
    method,
    path,
    paramValues,
    groupedParams,
    requestBodySchema,
    requestBody,
    op,
  }) => {
    setLoading(true)
    setResponseData(null)

    try {
      let fullPath = path.replace(/\{(\w+)\}/g, (_, key) => {
        return paramValues[`path_${key}`] || `{${key}}`
      })

      // Build query params
      const queryParams = []
      if (groupedParams.query) {
        groupedParams.query.forEach(param => {
          const val = paramValues[`query_${param.name}`]
          if (val) {
            queryParams.push(`${param.name}=${encodeURIComponent(val)}`)
          }
        })
      }
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''

      // Build headers
      const headers = {
        'Content-Type': 'application/json',
      }
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const options = {
        method: method.toUpperCase(),
        headers,
      }

      if (requestBodySchema && requestBody) {
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
      const data = await response.json()

      setResponseData({
        status: response.status,
        statusText: response.statusText,
        data,
      })

      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        data,
      }
    } catch (error) {
      const errorResult = {
        error: true,
        message: error.message,
      }
      setResponseData(errorResult)
      return errorResult
    } finally {
      setLoading(false)
    }
  }, [authToken, getConfigBaseUrl])

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
