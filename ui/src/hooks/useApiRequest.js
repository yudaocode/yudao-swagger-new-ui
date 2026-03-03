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

    const startTime = Date.now()

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
