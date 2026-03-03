import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY_PREFIX = 'swagger_endpoint_params_'

/**
 * 获取存储的 key
 * @param {string} method - HTTP 方法
 * @param {string} path - API 路径
 * @returns {string} - 存储的 key
 */
function getStorageKey(method, path) {
  return `${STORAGE_KEY_PREFIX}${method}_${path}`
}

/**
 * 从 LocalStorage 加载参数
 * @param {string} method - HTTP 方法
 * @param {string} path - API 路径
 * @returns {Object|null} - 存储的参数或 null
 */
function loadFromStorage(method, path) {
  try {
    const key = getStorageKey(method, path)
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (err) {
    console.error('Failed to load params from localStorage:', err)
  }
  return null
}

/**
 * 保存参数到 LocalStorage
 * @param {string} method - HTTP 方法
 * @param {string} path - API 路径
 * @param {Object} params - 参数对象 { paramValues, requestBody }
 */
function saveToStorage(method, path, params) {
  try {
    const key = getStorageKey(method, path)
    localStorage.setItem(key, JSON.stringify(params))
  } catch (err) {
    console.error('Failed to save params to localStorage:', err)
  }
}

/**
 * 管理接口参数持久化的 Hook
 * @param {string} method - HTTP 方法
 * @param {string} path - API 路径
 * @param {string} defaultRequestBody - 默认请求体
 * @returns {Object} - 参数状态和操作方法
 */
export function useEndpointParams(method, path, defaultRequestBody = '') {
  const [paramValues, setParamValues] = useState({})
  const [requestBody, setRequestBody] = useState(defaultRequestBody)

  // 当接口变化时，从 LocalStorage 加载参数
  useEffect(() => {
    if (!method || !path) {
      setParamValues({})
      setRequestBody(defaultRequestBody)
      return
    }

    const stored = loadFromStorage(method, path)
    if (stored) {
      setParamValues(stored.paramValues || {})
      setRequestBody(stored.requestBody ?? defaultRequestBody)
    } else {
      setParamValues({})
      setRequestBody(defaultRequestBody)
    }
  }, [method, path, defaultRequestBody])

  // 当参数变化时，保存到 LocalStorage
  useEffect(() => {
    if (!method || !path) return
    // 只在有值时保存，避免保存空值覆盖已有数据
    if (Object.keys(paramValues).length > 0 || requestBody) {
      saveToStorage(method, path, { paramValues, requestBody })
    }
  }, [method, path, paramValues, requestBody])

  // 更新单个参数值
  const updateParamValue = useCallback((paramType, paramName, value) => {
    setParamValues(prev => ({
      ...prev,
      [`${paramType}_${paramName}`]: value
    }))
  }, [])

  // 批量设置参数值
  const setParams = useCallback((newParams) => {
    setParamValues(newParams)
  }, [])

  // 更新请求体
  const updateRequestBody = useCallback((body) => {
    setRequestBody(body)
  }, [])

  // 清除当前接口的存储参数
  const clearParams = useCallback(() => {
    if (method && path) {
      const key = getStorageKey(method, path)
      localStorage.removeItem(key)
    }
    setParamValues({})
    setRequestBody(defaultRequestBody)
  }, [method, path, defaultRequestBody])

  return {
    paramValues,
    requestBody,
    setParamValues: setParams,
    setRequestBody,
    updateParamValue,
    updateRequestBody,
    clearParams,
  }
}

export default useEndpointParams
