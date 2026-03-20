/**
 * HTML 导出功能
 * 生成离线可访问的 HTML 文档
 */

import { escapeHtml, buildFilteredExportData, getSelectedOperations } from './exportUtils'
import { cssStyles } from './exportHtmlCss'
import { generateJsScript } from './exportHtmlJs'

/**
 * 生成离线 HTML 文档
 */
export const generateHtml = (selectedEndpoints, apiData) => {
  const operations = getSelectedOperations(selectedEndpoints, apiData)
  const exportData = buildFilteredExportData(operations, apiData)
  const sidebarWidth = 320
  const jsScript = generateJsScript(exportData)

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(exportData.info?.title || 'API Documentation')}</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>${cssStyles}</style>
</head>
<body>
<div id="root">
<div class="app">
<aside class="sidebar" style="width: ${sidebarWidth}px;">
<div class="sidebar-header">
<div class="logo-row">
<div class="logo-left">
<svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<polyline points="4 17 10 11 4 5"></polyline>
<line x1="12" y1="19" x2="20" y2="19"></line>
</svg>
<span class="logo-text">${escapeHtml(exportData.info?.title || 'swagger')}</span>
</div>
</div>
<span class="subtitle">// ${escapeHtml(exportData.info?.description || 'api documentation')}</span>
${exportData.info?.version ? '<span class="api-version">v' + escapeHtml(exportData.info.version) + '</span>' : ''}
</div>
<div class="search-section">
<span class="search-label">search_endpoints</span>
<div class="search-box">
<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<circle cx="11" cy="11" r="8"></circle>
<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
</svg>
<input type="text" class="search-input" placeholder="Search API ...">
</div>
</div>
<nav class="nav-section">
<div class="nav-section-inner"></div>
</nav>
</aside>
<div class="resize-handle"></div>
<main class="main-content"></main>
</div>
</div>
<script>${jsScript}</script>
</body>
</html>`
}

/**
 * 导出 HTML 文件
 */
export const exportHtml = (selectedEndpoints, apiData) => {
  const html = generateHtml(selectedEndpoints, apiData)
  const fileName = apiData.info?.title 
    ? `${apiData.info.title.replace(/\s+/g, '-')}.html` 
    : 'api-documentation.html'
  
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
