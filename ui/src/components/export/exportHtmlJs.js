/**
 * HTML 导出 JavaScript 逻辑
 * 生成离线 HTML 文档的交互脚本
 */

import { escapeHtml } from './exportUtils'

/**
 * 生成 JavaScript 脚本
 */
export const generateJsScript = (exportData) => `
// API 数据
const apiData = ${JSON.stringify(exportData)};

// 状态管理
let selectedEndpoint = null;
let sidebarWidth = 320;
let collapsedSections = { parameters: false, requestBody: false };

// 解析 endpoints
function parseEndpoints(data) {
  if (!data || !data.paths) return [];
  const endpoints = [];
  Object.entries(data.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      const tags = operation.tags || ['default'];
      endpoints.push({
        method: method.toUpperCase(),
        path,
        group: tags[0],
        operation,
      });
    });
  });
  return endpoints;
}

const endpoints = parseEndpoints(apiData);
const groupedEndpoints = endpoints.reduce((acc, ep) => {
  if (!acc[ep.group]) acc[ep.group] = [];
  acc[ep.group].push(ep);
  return acc;
}, {});

// Schema 解析（递归解析所有嵌套属性）
function resolveSchema(schema, visited) {
  if (!schema) return null;
  visited = visited || new Set();

  // 解析引用
  if (schema.$ref) {
    var schemaName = schema.$ref.split('/').pop();
    var refSchema = apiData.components?.schemas?.[schemaName];
    if (refSchema && !visited.has(schema.$ref)) {
      var newVisited = new Set(visited);
      newVisited.add(schema.$ref);
      return resolveSchema(refSchema, newVisited);
    }
    return schema;
  }

  // 解析数组 items
  if (schema.type === 'array' && schema.items) {
    return {
      ...schema,
      items: resolveSchema(schema.items, visited)
    };
  }

  // 递归解析对象属性
  if (schema.properties) {
    var resolvedProperties = {};
    Object.entries(schema.properties).forEach(function(entry) {
      var key = entry[0];
      var prop = entry[1];
      resolvedProperties[key] = resolveSchema(prop, visited);
    });
    return {
      ...schema,
      properties: resolvedProperties
    };
  }

  return schema;
}

// 递归渲染 Schema（完全模拟 SchemaViewer 组件）
function renderSchema(schema, prefix, level) {
  if (!schema) return '';
  prefix = prefix || '';
  level = level || 0;

  // 处理纯引用类型（$ref 且没有 properties）- 只显示引用名称行，不展开
  // 原版 SchemaViewer 第 11 行: if (schema.$ref && !schema.properties)
  if (schema.$ref && !schema.properties) {
    var refName = schema.$ref.replace('#/components/schemas/', '');
    var html = '<div class="param-row" style="padding-left: ' + (level * 16) + 'px;">';
    html += '<div class="param-col-left">';
    html += '<span class="param-name">' + escapeHtml(prefix || refName) + '</span>';
    html += '<span class="param-type ref-type">' + escapeHtml(refName) + '</span>';
    html += '</div>';
    html += '<div class="param-col-right">';
    html += '<span class="param-desc"></span>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  // 处理数组类型
  if (schema.type === 'array' && schema.items) {
    var items = schema.items;
    var hasNestedProperties = items.properties || items.$ref;
    var isSimpleArray = !hasNestedProperties && items.type;
    var isObjectArray = hasNestedProperties && (items.type === 'object' || items.properties);

    // 如果没有 prefix，这是顶层 array
    if (!prefix) {
      // 如果是简单类型的数组，不渲染任何内容
      if (isSimpleArray) {
        return '';
      }
      
      // 如果是对象数组，直接渲染对象的属性，不渲染额外的 "items" 行
      if (isObjectArray) {
        return renderSchema(items, '', level);
      }
      
      // 显示数组类型信息
      var html = '<div class="param-row" style="padding-left: ' + (level * 16) + 'px;">';
      html += '<div class="param-col-left">';
      html += '<span class="param-name">items</span>';
      html += '<span class="param-type">array of ' + escapeHtml(items.type || 'any');
      if (items.format) {
        html += ' (' + escapeHtml(items.format) + ')';
      }
      html += '</span>';
      html += '</div>';
      html += '<div class="param-col-right">';
      html += '<span class="param-desc">' + escapeHtml(schema.description || '') + '</span>';
      html += '</div>';
      html += '</div>';
      // 如果有嵌套属性，继续渲染
      if (hasNestedProperties) {
        html += renderSchema(items, '', level);
      }
      return html;
    }

    // 有 prefix 的情况（对象的属性是数组）
    // 对于简单类型的数组，直接在一行内显示类型信息
    if (isSimpleArray) {
      var html = '<div class="param-row" style="padding-left: ' + (level * 16) + 'px;">';
      html += '<div class="param-col-left">';
      html += '<span class="param-name">' + escapeHtml(prefix) + '</span>';
      html += '<span class="param-type">array of ' + escapeHtml(items.type || 'any');
      if (items.format) {
        html += ' (' + escapeHtml(items.format) + ')';
      }
      html += '</span>';
      html += '</div>';
      html += '<div class="param-col-right">';
      html += '<span class="param-desc">' + escapeHtml(schema.description || '') + '</span>';
      html += '</div>';
      html += '</div>';
      return html;
    }

    // 对于对象数组，渲染数组类型行，然后渲染对象属性（不渲染额外的 "items" 行）
    var html = '<div class="param-row" style="padding-left: ' + (level * 16) + 'px;">';
    html += '<div class="param-col-left">';
    html += '<span class="param-name">' + escapeHtml(prefix) + '</span>';
    html += '<span class="param-type">array of object';
    if (items.$ref) {
      html += ' (' + escapeHtml(items.$ref.replace('#/components/schemas/', '')) + ')';
    }
    html += '</span>';
    html += '</div>';
    html += '<div class="param-col-right">';
    html += '<span class="param-desc">' + escapeHtml(schema.description || '') + '</span>';
    html += '</div>';
    html += '</div>';
    // 直接渲染对象属性，不渲染额外的 "items" 行
    html += renderSchema(items, '', level + 1);
    return html;
  }

  // 处理对象类型
  if (schema.type === 'object' && schema.properties) {
    var html = '';

    // 如果有 prefix，先渲染对象头
    if (prefix) {
      html += '<div class="param-row" style="padding-left: ' + (level * 16) + 'px;">';
      html += '<div class="param-col-left">';
      html += '<span class="param-name">' + escapeHtml(prefix) + '</span>';
      html += '<span class="param-type">object</span>';
      html += '</div>';
      html += '<div class="param-col-right">';
      html += '<span class="param-desc">' + escapeHtml(schema.description || '') + '</span>';
      html += '</div>';
      html += '</div>';
    }

    var childLevel = level + 1;

    // 遍历属性
    Object.entries(schema.properties).forEach(function(entry) {
      var key = entry[0];
      var prop = entry[1];
      var displayName = prefix ? prefix + '.' + key : key;
      var required = schema.required && schema.required.includes(key);

      var hasNestedContent = (prop.type === 'object' && prop.properties) ||
                             (prop.type === 'array' && prop.items) ||
                             prop.$ref;

      if (hasNestedContent) {
        var hasExample = prop.example !== undefined && prop.example !== null && prop.example !== '';
        html += '<div class="param-row" style="padding-left: ' + (childLevel * 16) + 'px;">';
        html += '<div class="param-col-left">';
        html += '<span class="param-name">' + escapeHtml(displayName);
        if (required) {
          html += '<span class="required">*</span>';
        }
        html += '</span>';
        var typeStr = prop.$ref ? prop.$ref.replace('#/components/schemas/', '') : (prop.type || 'string');
        html += '<span class="param-type">' + escapeHtml(typeStr);
        if (prop.format) {
          html += ' (' + escapeHtml(prop.format) + ')';
        }
        html += '</span>';
        html += '</div>';
        html += '<div class="param-col-right">';
        html += '<span class="param-desc">' + escapeHtml(prop.description || '') + '</span>';
        if (hasExample) {
          html += '<span class="param-example">示例：' + escapeHtml(String(prop.example)) + '</span>';
        }
        html += '</div>';
        html += '</div>';
        // 递归渲染嵌套内容，prefix 为空，level 为 childLevel
        html += renderSchema(prop, '', childLevel);
      } else {
        var hasExample = prop.example !== undefined && prop.example !== null && prop.example !== '';
        html += '<div class="param-row" style="padding-left: ' + (childLevel * 16) + 'px;">';
        html += '<div class="param-col-left">';
        html += '<span class="param-name">' + escapeHtml(displayName);
        if (required) {
          html += '<span class="required">*</span>';
        }
        html += '</span>';
        html += '<span class="param-type">' + escapeHtml(prop.type || 'string');
        if (prop.format) {
          html += ' (' + escapeHtml(prop.format) + ')';
        }
        html += '</span>';
        html += '</div>';
        html += '<div class="param-col-right">';
        html += '<span class="param-desc">' + escapeHtml(prop.description || '') + '</span>';
        if (hasExample) {
          html += '<span class="param-example">示例：' + escapeHtml(String(prop.example)) + '</span>';
        }
        html += '</div>';
        html += '</div>';
      }
    });

    return html;
  }

  return '';
}

// 渲染侧边栏
function renderSidebar() {
  var navInner = document.querySelector('.nav-section-inner');
  var html = '<span class="nav-label">endpoints</span>';
  
  Object.entries(groupedEndpoints).forEach(function(entry) {
    var group = entry[0];
    var eps = entry[1];
    html += '<div class="nav-group"><span class="group-label">' + escapeHtml(group) + '</span>';
    eps.forEach(function(ep) {
      var key = ep.method + ' ' + ep.path;
      var isActive = selectedEndpoint === key ? 'active' : '';
      html += '<div class="nav-item ' + isActive + '" data-key="' + escapeHtml(key) + '" onclick="selectEndpoint(\\'' + escapeHtml(key.replace(/'/g, "\\\\'")) + '\\')">';
      html += '<div class="nav-item-left"><span class="method ' + ep.method.toLowerCase() + '">' + ep.method + '</span><span class="path">' + escapeHtml(ep.path) + '</span></div>';
      if (ep.operation.summary) {
        html += '<span class="nav-summary">' + escapeHtml(ep.operation.summary) + '</span>';
      }
      html += '</div>';
    });
    html += '</div>';
  });
  
  navInner.innerHTML = html;
}

// 渲染主内容
function renderContent() {
  var mainContent = document.querySelector('.main-content');
  
  if (!selectedEndpoint) {
    mainContent.innerHTML = '<div class="content-empty-state"><svg class="empty-icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><h2 class="empty-title">Select an endpoint</h2><p class="empty-description">Choose an endpoint from the sidebar to view documentation</p></div>';
    return;
  }
  
  var parts = selectedEndpoint.split(' ');
  var method = parts[0];
  var path = parts.slice(1).join(' ');
  var endpoint = endpoints.find(function(ep) { return ep.method === method && ep.path === path; });
  
  if (!endpoint) return;
  
  var op = endpoint.operation;
  
  var html = '<button class="theme-toggle-btn" onclick="toggleTheme()" title="Toggle theme">';
  html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
  html += '</button>';
  
  // Header
  html += '<div class="content-header"><div class="endpoint-header">';
  html += '<div class="method-badge ' + method.toLowerCase() + '">' + method + '</div>';
  html += '<h1 class="endpoint-path">' + escapeHtml(path) + '</h1>';
  if (op.summary) html += '<span class="endpoint-summary">' + escapeHtml(op.summary) + '</span>';
  html += '</div>';
  if (op.description) html += '<p class="endpoint-desc">// ' + escapeHtml(op.description) + '</p>';
  if (op.security) {
    html += '<div class="endpoint-meta"><div class="meta-item"><span class="meta-label">auth:</span><span class="meta-value auth">bearer_token</span></div></div>';
  }
  html += '</div>';
  
  // Content split
  html += '<div class="content-body-split">';
  
  // Doc Panel
  html += '<div class="doc-panel">';
  
  // Parameters
  if (op.parameters && op.parameters.length > 0) {
    var paramsByIn = {};
    op.parameters.forEach(function(p) {
      var in_ = p.in || 'query';
      if (!paramsByIn[in_]) paramsByIn[in_] = [];
      paramsByIn[in_].push(p);
    });
    
    var inNames = { path: 'Path Parameters', query: 'Query Parameters', header: 'Header Parameters', cookie: 'Cookie Parameters' };
    
    ['path', 'query', 'header', 'cookie'].forEach(function(in_) {
      var params = paramsByIn[in_];
      if (!params || params.length === 0) return;
      
      html += '<div class="params-section">';
      html += '<div class="params-header"><span class="params-title">' + inNames[in_] + '</span></div>';
      html += '<div class="params-table">';
      
      params.forEach(function(p) {
        var type = p.schema?.type || p.type || '';
        var example = p.example !== undefined ? p.example : p.schema?.example;
        html += '<div class="param-row">';
        html += '<div class="param-col-left"><span class="param-name">' + escapeHtml(p.name) + (p.required ? '<span class="required">*</span>' : '') + '</span><span class="param-type">' + escapeHtml(type) + '</span></div>';
        html += '<div class="param-col-right"><span class="param-desc">' + escapeHtml(p.description || '') + '</span>' + (example !== undefined ? '<span class="param-example">Example: ' + escapeHtml(String(example)) + '</span>' : '') + '</div>';
        html += '</div>';
      });
      
      html += '</div></div>';
    });
  }
  
  // Request Body
  if (op.requestBody?.content) {
    Object.entries(op.requestBody.content).forEach(function(entry) {
      var ct = entry[0];
      var mt = entry[1];
      html += '<div class="params-section">';
      html += '<div class="params-header"><span class="params-title">Request Body</span><span class="content-type-badge">' + escapeHtml(ct) + '</span></div>';
      
      if (mt.schema) {
        var resolvedSchema = resolveSchema(mt.schema);
        var schemaHtml = renderSchema(resolvedSchema, '', 0);
        if (schemaHtml) {
          html += '<div class="params-table">' + schemaHtml + '</div>';
        }
      }
      html += '</div>';
    });
  }
  
  // Responses
  if (op.responses) {
    html += '<div class="params-section">';
    Object.entries(op.responses).forEach(function(entry) {
      var code = entry[0];
      var resp = entry[1];
      var codeClass = code.startsWith('2') ? 'success' : code.startsWith('3') ? 'redirect' : code.startsWith('4') ? 'client-error' : 'server-error';
      var responseId = 'response-' + code.replace(/[^a-zA-Z0-9]/g, '-');
      
      html += '<div>';
      html += '<div class="params-header" style="cursor:pointer;" onclick="toggleResponse(&quot;' + responseId + '&quot;)">';
      html += '<span class="params-title">responses</span>';
      html += '<span class="status-code ' + codeClass + '">' + code + '</span>';
      html += '<span class="response-desc">' + escapeHtml(resp.description || '') + '</span>';
      html += '<svg class="toggle-icon" id="icon-' + responseId + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>';
      html += '</div>';
      
      html += '<div class="params-table" id="' + responseId + '">';
      if (resp.content) {
        var contentTypes = Object.keys(resp.content);
        if (contentTypes.length > 0) {
          var mt = resp.content[contentTypes[0]];
          if (mt.schema) {
            var resolvedSchema = resolveSchema(mt.schema);
            var schemaHtml = renderSchema(resolvedSchema, '', 0);
            if (schemaHtml) {
              html += schemaHtml;
            }
          }
        }
      } else {
        html += '<div class="response-empty"><span class="response-empty-text">No content</span></div>';
      }
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
  }
  
  html += '</div>';
  html += '</div>';
  
  mainContent.innerHTML = html;
}

// 选择 endpoint
function selectEndpoint(key) {
  selectedEndpoint = key;
  renderSidebar();
  renderContent();
}

// 搜索
function handleSearch(query) {
  var q = query.toLowerCase();
  document.querySelectorAll('.nav-item').forEach(function(item) {
    var key = item.dataset.key.toLowerCase();
    item.style.display = key.includes(q) ? '' : 'none';
  });
}

// 主题切换
function toggleTheme() {
  var html = document.documentElement;
  if (html.getAttribute('data-theme') === 'light') {
    html.removeAttribute('data-theme');
    localStorage.setItem('theme', 'dark');
  } else {
    html.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }
}

// 折叠/展开 Response
function toggleResponse(responseId) {
  var content = document.getElementById(responseId);
  var icon = document.getElementById('icon-' + responseId);
  
  if (content && icon) {
    if (content.style.display === 'none') {
      content.style.display = '';
      icon.classList.remove('collapsed');
    } else {
      content.style.display = 'none';
      icon.classList.add('collapsed');
    }
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 拖拽调整侧边栏宽度
var isDragging = false;
var dragStartX = 0;
var dragStartWidth = 0;

function initResizeHandle() {
  var resizeHandle = document.querySelector('.resize-handle');
  var sidebar = document.querySelector('.sidebar');
  
  if (!resizeHandle || !sidebar) return;
  
  resizeHandle.addEventListener('mousedown', function(e) {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartWidth = sidebar.offsetWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    var deltaX = e.clientX - dragStartX;
    var newWidth = Math.max(200, Math.min(600, dragStartWidth + deltaX));
    sidebar.style.width = newWidth + 'px';
    sidebarWidth = newWidth;
  });
  
  document.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem('sidebarWidth', sidebarWidth);
    }
  });
}

// 初始化
(function() {
  var savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');
  
  var savedWidth = localStorage.getItem('sidebarWidth');
  if (savedWidth) {
    sidebarWidth = parseInt(savedWidth, 10);
    var sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.style.width = sidebarWidth + 'px';
  }
  
  renderSidebar();
  
  if (endpoints.length > 0) {
    selectEndpoint(endpoints[0].method + ' ' + endpoints[0].path);
  } else {
    renderContent();
  }
  
  var searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) { handleSearch(e.target.value); });
  }
  
  initResizeHandle();
})();
`
