import { useMemo } from 'react'

/**
 * 解析 OpenAPI Schema 的 Hook
 * @param {Object} apiData - OpenAPI 文档数据
 * @returns {Object} - 包含 resolveRef, resolveSchema, getSchemaExample 方法
 */
export function useSchemaResolver(apiData) {
  const schemas = apiData?.components?.schemas || {}

  const resolveRef = useMemo(() => {
    return (ref) => {
      if (!ref) return null
      if (!ref.startsWith('#/components/schemas/')) return null
      const schemaName = ref.replace('#/components/schemas/', '')
      return schemas[schemaName] || null
    }
  }, [schemas])

  const resolveSchema = useMemo(() => {
    return (schema, visited = new Set()) => {
      if (!schema) return null

      if (schema.$ref) {
        const refSchema = resolveRef(schema.$ref)
        if (refSchema && !visited.has(schema.$ref)) {
          const newVisited = new Set(visited)
          newVisited.add(schema.$ref)
          return resolveSchema(refSchema, newVisited)
        }
        return { ...schema, _refResolved: true }
      }

      if (schema.type === 'array' && schema.items) {
        return {
          ...schema,
          items: resolveSchema(schema.items, visited),
        }
      }

      if (schema.properties) {
        const resolvedProperties = {}
        Object.entries(schema.properties).forEach(([key, prop]) => {
          resolvedProperties[key] = resolveSchema(prop, visited)
        })
        return {
          ...schema,
          properties: resolvedProperties,
        }
      }

      return schema
    }
  }, [resolveRef])

  const getSchemaExample = useMemo(() => {
    return (schema) => {
      if (!schema) return null
      if (schema.example) return schema.example
      if (schema.type === 'object') {
        const example = {}
        if (schema.properties) {
          Object.entries(schema.properties).forEach(([key, prop]) => {
            example[key] = getSchemaExample(prop) || ''
          })
        }
        return example
      }
      if (schema.type === 'array') {
        return [getSchemaExample(schema.items) || {}]
      }
      if (schema.type === 'string') return 'string'
      if (schema.type === 'number' || schema.type === 'integer') return 0
      if (schema.type === 'boolean') return true
      return null
    }
  }, [])

  return {
    resolveRef,
    resolveSchema,
    getSchemaExample,
  }
}

export default useSchemaResolver
