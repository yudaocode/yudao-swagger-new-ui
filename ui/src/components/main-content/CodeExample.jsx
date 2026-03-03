import React, { useEffect, useRef, useMemo } from 'react'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import go from 'highlight.js/lib/languages/go'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('go', go)

const LANGUAGES = ['curl', 'java', 'go', 'python', 'nodejs']

const langMap = {
  curl: 'bash',
  java: 'java',
  go: 'go',
  python: 'python',
  nodejs: 'javascript',
}

/**
 * 代码示例组件
 * 支持多语言切换、语法高亮和复制功能
 */
function CodeExample({
  codeExamples,
  activeLang,
  onLangChange,
  onCopy,
  copySuccess,
}) {
  const codeRef = useRef(null)

  // Get current code
  const currentCode = codeExamples[activeLang] || ''

  // Apply syntax highlighting after render
  useEffect(() => {
    if (codeRef.current && currentCode) {
      codeRef.current.removeAttribute('data-highlighted')
      codeRef.current.className = `language-${langMap[activeLang]}`
      hljs.highlightElement(codeRef.current)
    }
  }, [activeLang, currentCode])

  return (
    <div className="code-section">
      {/* Language Tabs */}
      <div className="lang-tabs">
        {LANGUAGES.map(lang => (
          <button
            key={lang}
            className={`lang-tab ${activeLang === lang ? 'active' : ''}`}
            onClick={() => onLangChange(lang)}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Code Block */}
      <div className="code-box">
        <div className="code-header">
          <span className="code-label">&gt; {activeLang}</span>
          <button className="copy-btn" onClick={onCopy}>
            {copySuccess ? 'copied!' : 'copy'}
          </button>
        </div>
        <pre className="code-block">
          <code
            ref={codeRef}
            className={`language-${langMap[activeLang]}`}
          >
            {currentCode}
          </code>
        </pre>
      </div>
    </div>
  )
}

/**
 * Build query params from paramValues (handles nested params)
 */
function buildQueryParams(groupedParams, paramValues) {
  const queryParams = []

  if (groupedParams.query) {
    groupedParams.query.forEach(param => {
      const resolvedSchema = param.resolvedSchema

      if (resolvedSchema?.properties) {
        // Complex type - expand nested properties
        Object.keys(resolvedSchema.properties).forEach(propName => {
          const key = `query_${param.name}.${propName}`
          const val = paramValues[key]
          if (val !== undefined && val !== '') {
            queryParams.push(`${propName}=${encodeURIComponent(val)}`)
          }
        })
      } else {
        // Simple type
        const key = `query_${param.name}`
        const val = paramValues[key]
        if (val !== undefined && val !== '') {
          queryParams.push(`${param.name}=${encodeURIComponent(val)}`)
        }
      }
    })
  }

  return queryParams
}

/**
 * Build multipart form data entries from schema and paramValues
 */
function buildMultipartFormData(multipartSchema, paramValues) {
  const formData = []

  if (multipartSchema?.properties) {
    Object.keys(multipartSchema.properties).forEach(key => {
      const prop = multipartSchema.properties[key]
      const value = paramValues[`body_${key}`]

      if (value !== undefined && value !== null && value !== '') {
        const isFile = prop.type === 'string' && prop.format === 'binary'
        formData.push({
          key,
          value,
          isFile,
          type: prop.type,
          format: prop.format,
        })
      }
    })
  }

  return formData
}

/**
 * 生成代码示例的 Hook
 */
export function useCodeExamples({
  method,
  path,
  requestBody,
  paramValues,
  groupedParams,
  apiData,
  requestBodySchema,
  op,
  authToken,
}) {
  return useMemo(() => {
    if (!path || !method) {
      return { curl: '', java: '', go: '', nodejs: '', python: '' }
    }

    const getBaseUrl = () => {
      const servers = apiData?.servers || []
      if (servers.length > 0) {
        return servers[0].url
      }
      return ''
    }

    // Check if this is a multipart request
    const isMultipartRequest = !!op?.requestBody?.content?.['multipart/form-data']
    const multipartSchema = op?.requestBody?.content?.['multipart/form-data']?.schema

    const baseUrl = getBaseUrl()
    const fullPath = path.replace(/\{(\w+)\}/g, (_, key) => {
      const val = paramValues[`path_${key}`] || `{${key}}`
      return val
    })
    const url = `${baseUrl}${fullPath}`

    // Build headers
    const requestHeaders = {}
    if (!isMultipartRequest) {
      requestHeaders['Content-Type'] = 'application/json'
    }
    if (authToken) {
      requestHeaders['Authorization'] = `Bearer ${authToken}`
    } else if (op?.security) {
      requestHeaders['Authorization'] = 'Bearer <your_token>'
    }

    // Build query params (handles nested params)
    const queryParams = buildQueryParams(groupedParams, paramValues)
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''

    // Build multipart form data if applicable
    const multipartData = isMultipartRequest ? buildMultipartFormData(multipartSchema, paramValues) : []

    // Generate curl command
    let curl
    if (isMultipartRequest && multipartData.length > 0) {
      const curlHeaders = Object.entries(requestHeaders)
        .map(([k, v]) => `  -H "${k}: ${v}"`)
        .join(' \\\n')

      const curlForm = multipartData.map(item => {
        if (item.isFile) {
          return `  -F "${item.key}=@/path/to/file"`
        }
        return `  -F "${item.key}=${item.value}"`
      }).join(' \\\n')

      curl = `curl -X ${method.toUpperCase()} \\
  "${url}${queryString}" \\
${curlHeaders}${curlForm ? ` \\\n${curlForm}` : ''}`
    } else {
      const curlHeaders = Object.entries(requestHeaders)
        .map(([k, v]) => `  -H "${k}: ${v}"`)
        .join(' \\\n')

      curl = `curl -X ${method.toUpperCase()} \\
  "${url}${queryString}" \\
${curlHeaders}${requestBodySchema ? ` \\\n  -d '${requestBody.replace(/'/g, "\\'")}'` : ''}`
    }

    // Generate Java code
    let java
    if (isMultipartRequest && multipartData.length > 0) {
      java = `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

public class ApiRequest {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String url = "${url}${queryString}";

        HttpRequest.BodyPublisher body = HttpRequest.BodyPublishers.ofString("");
${multipartData.map(item => {
  if (item.isFile) {
    return `        // File: ${item.key}`
  }
  return `        // Field: ${item.key} = ${item.value}`
}).join('\n')}
        // Note: For multipart/form-data in Java, consider using
        // Apache HttpClient or Spring RestTemplate for better support

        HttpRequest.Builder builder = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .${method.toLowerCase()}(body);

${Object.entries(requestHeaders).map(([k, v]) => `        builder.header("${k}", "${v}");`).join('\n')}

        HttpResponse<String> response = client.send(
            builder.build(),
            HttpResponse.BodyHandlers.ofString()
        );

        System.out.println(response.body());
    }
}`
    } else {
      java = `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

public class ApiRequest {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String url = "${url}${queryString}";

        Map<String, String> headers = new HashMap<>();
        ${Object.entries(requestHeaders).map(([k, v]) => `headers.put("${k}", "${v}");`).join('\n        ')}

        HttpRequest.Builder builder = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .${method.toLowerCase()}(HttpRequest.BodyPublishers${requestBodySchema ? `.ofString(${JSON.stringify(requestBody)})` : '.noBody()'});

        headers.forEach(builder::header);

        HttpResponse<String> response = client.send(
            builder.build(),
            HttpResponse.BodyHandlers.ofString()
        );

        System.out.println(response.body());
    }
}`
    }

    // Generate Go code
    let goCode
    if (isMultipartRequest && multipartData.length > 0) {
      goCode = `package main

import (
    "bytes"
    "fmt"
    "io"
    "mime/multipart"
    "net/http"
    "os"
)

func main() {
    url := "${url}${queryString}"

    // Create multipart form
    body := &bytes.Buffer{}
    writer := multipart.NewWriter(body)

${multipartData.map(item => {
  if (item.isFile) {
    return `    // Add file: ${item.key}
    file, _ := os.Open("/path/to/${item.key}")
    defer file.Close()
    part, _ := writer.CreateFormFile("${item.key}", "filename")
    io.Copy(part, file)`
  }
  return `    writer.WriteField("${item.key}", "${item.value || 'value'}")`
}).join('\n')}

    writer.Close()

    client := &http.Client{}
    req, err := http.NewRequest("${method.toUpperCase()}", url, body)
    if err != nil {
        panic(err)
    }

${Object.entries(requestHeaders).map(([k, v]) => `    req.Header.Set("${k}", "${v}")`).join('\n')}
    req.Header.Set("Content-Type", writer.FormDataContentType())

    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    respBody, _ := io.ReadAll(resp.Body)
    fmt.Println(string(respBody))
}`
    } else {
      goCode = `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

func main() {
    url := "${url}${queryString}"
${requestBodySchema ? `    payload := []byte(\`${requestBody}\`)` : ''}

    client := &http.Client{}
    ${requestBodySchema ? `req, err := http.NewRequest("${method.toUpperCase()}", url, bytes.NewBuffer(payload))` : `req, err := http.NewRequest("${method.toUpperCase()}", url, nil)`}
    if err != nil {
        panic(err)
    }

${Object.entries(requestHeaders).map(([k, v]) => `    req.Header.Set("${k}", "${v}")`).join('\n')}

    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    var result map[string]interface{}
    json.Unmarshal(body, &result)
    fmt.Println(result)
}`
    }

    // Generate Python code
    let python
    if (isMultipartRequest && multipartData.length > 0) {
      python = `import requests

url = "${url}${queryString}"

headers = {
${Object.entries(requestHeaders).map(([k, v]) => `    "${k}": "${v}"`).join(',\n')}
}

files = {
${multipartData.filter(item => item.isFile).map(item => `    "${item.key}": open("/path/to/file", "rb")`).join(',\n')}
}
data = {
${multipartData.filter(item => !item.isFile).map(item => `    "${item.key}": "${item.value || ''}"`).join(',\n')}
}

response = requests.${method.toLowerCase()}(
    url,
    headers=headers,
    files=files,
    data=data
)

print(response.status_code)
print(response.json())`
    } else {
      python = `import requests

url = "${url}${queryString}"

headers = {
${Object.entries(requestHeaders).map(([k, v]) => `    "${k}": "${v}"`).join(',\n')}
}
${requestBodySchema ? `
payload = ${requestBody}
` : ''}
response = requests.${method.toLowerCase()}(
    url,
    headers=headers${requestBodySchema ? ',\n    json=payload' : ''}
)

print(response.status_code)
print(response.json())`
    }

    // Generate Node.js code
    let nodejs
    if (isMultipartRequest && multipartData.length > 0) {
      nodejs = `const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

const url = "${url}${queryString}";

const formData = new FormData();
${multipartData.map(item => {
  if (item.isFile) {
    return `formData.append('${item.key}', fs.createReadStream('/path/to/file'));`
  }
  return `formData.append('${item.key}', '${item.value || ''}');`
}).join('\n')}

const options = {
  method: '${method.toUpperCase()}',
  headers: {
${Object.entries(requestHeaders).map(([k, v]) => `    '${k}': '${v}'`).join(',\n')}
  },
  body: formData
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));`
    } else {
      nodejs = `const fetch = require('node-fetch');

const url = "${url}${queryString}";
const options = {
  method: '${method.toUpperCase()}',
  headers: {
${Object.entries(requestHeaders).map(([k, v]) => `    '${k}': '${v}'`).join(',\n')}
  }${requestBodySchema ? `,
  body: ${JSON.stringify(requestBody)}` : ''}
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));`
    }

    return { curl, java, go: goCode, nodejs, python }
  }, [method, path, requestBody, paramValues, groupedParams, apiData, requestBodySchema, op, authToken])
}

export default CodeExample
