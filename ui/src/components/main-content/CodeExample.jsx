import React, { useEffect, useRef, useMemo } from 'react'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)

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

  const langMap = {
    curl: 'bash',
    nodejs: 'javascript',
    python: 'python',
    java: 'java',
  }

  // Apply syntax highlighting when code changes
  useEffect(() => {
    if (codeRef.current && codeExamples[activeLang]) {
      codeRef.current.textContent = codeExamples[activeLang]
      codeRef.current.removeAttribute('data-highlighted')
      codeRef.current.className = `language-${langMap[activeLang]}`
      hljs.highlightElement(codeRef.current)
    }
  }, [activeLang, codeExamples])

  return (
    <div className="code-section">
      {/* Language Tabs */}
      <div className="lang-tabs">
        {['curl', 'nodejs', 'python', 'java'].map(lang => (
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
          ></code>
        </pre>
      </div>
    </div>
  )
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
      return { curl: '', java: '', nodejs: '', python: '' }
    }

    const getBaseUrl = () => {
      const servers = apiData?.servers || []
      if (servers.length > 0) {
        return servers[0].url
      }
      return ''
    }

    const baseUrl = getBaseUrl()
    const fullPath = path.replace(/\{(\w+)\}/g, (_, key) => {
      const val = paramValues[`path_${key}`] || `{${key}}`
      return val
    })
    const url = `${baseUrl}${fullPath}`

    // Build headers
    const requestHeaders = {
      'Content-Type': 'application/json',
    }
    if (authToken) {
      requestHeaders['Authorization'] = `Bearer ${authToken}`
    } else if (op?.security) {
      requestHeaders['Authorization'] = 'Bearer <your_token>'
    }

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

    const curlHeaders = Object.entries(requestHeaders)
      .map(([k, v]) => `  -H "${k}: ${v}"`)
      .join(' \\\n')

    const curl = `curl -X ${method.toUpperCase()} \\
  "${url}${queryString}" \\
${curlHeaders}${requestBodySchema ? ` \\
  -d '${requestBody.replace(/'/g, "\\'")}'` : ''}`

    const java = `import java.net.URI;
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

    const nodejs = `const fetch = require('node-fetch');

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

    const python = `import requests

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

    return { curl, java, nodejs, python }
  }, [method, path, requestBody, paramValues, groupedParams, apiData, requestBodySchema, op, authToken])
}

export default CodeExample
