#!/usr/bin/env node

/**
 * 同步 UI 构建产物到官网
 *
 * 使用方式：
 *   1. 先构建 UI：cd ui && npm run build:java
 *   2. 运行此脚本：node scripts/sync-ui-to-website.js
 *
 * 脚本会：
 *   - 清空 website/public/new-ui/assets/
 *   - 复制 ui/dist/assets/* → website/public/new-ui/assets/
 *   - 复制 ui/dist/favicon-green.svg → website/public/new-ui/
 *   - 读取 ui/dist/index.html 获取新的资源文件名
 *   - 重新生成 embed.html（包含 Mock API 数据）
 */

const fs = require('fs')
const path = require('path')

// ============================================================
//  配置
// ============================================================
const ROOT = path.resolve(__dirname, '..')
const UI_DIST = path.join(ROOT, 'ui', 'dist')
const WEBSITE_NEW_UI = path.join(ROOT, 'website', 'public', 'new-ui')
const WEBSITE_ASSETS = path.join(WEBSITE_NEW_UI, 'assets')
const MOCK_DATA_FILE = path.join(ROOT, 'website', 'public', 'new-ui', 'mock-api-data.json')

// ============================================================
//  工具函数
// ============================================================
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function copyDir(src, dest) {
  ensureDir(dest)
  const entries = fs.readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function clearDir(dir) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true })
    } else {
      fs.unlinkSync(fullPath)
    }
  }
}

// ============================================================
//  主流程
// ============================================================
console.log('🔄 开始同步 UI 构建产物到官网...\n')

// 1. 检查 ui/dist 是否存在
if (!fs.existsSync(UI_DIST)) {
  console.error('❌ ui/dist 目录不存在！请先运行: cd ui && npm run build:java')
  process.exit(1)
}

// 2. 解析 index.html 获取资源文件名
const indexHtml = fs.readFileSync(path.join(UI_DIST, 'index.html'), 'utf8')
const cssMatch = indexHtml.match(/href="\.\/assets\/([^"]+\.css)"/)
const jsMatch = indexHtml.match(/src="\.\/assets\/([^"]+\.js)"/)

if (!cssMatch || !jsMatch) {
  console.error('❌ 无法从 ui/dist/index.html 解析资源文件名')
  process.exit(1)
}

const cssFile = cssMatch[1]
const jsFile = jsMatch[1]
console.log(`📦 检测到资源文件:`)
console.log(`   CSS: ${cssFile}`)
console.log(`   JS:  ${jsFile}\n`)

// 3. 清空并复制 assets
console.log('📁 同步 assets 目录...')
clearDir(WEBSITE_ASSETS)
copyDir(path.join(UI_DIST, 'assets'), WEBSITE_ASSETS)
console.log('   ✅ assets 已同步\n')

// 4. 复制 favicon
const faviconSrc = path.join(UI_DIST, 'favicon-green.svg')
if (fs.existsSync(faviconSrc)) {
  fs.copyFileSync(faviconSrc, path.join(WEBSITE_NEW_UI, 'favicon-green.svg'))
  console.log('✅ favicon-green.svg 已复制\n')
}

// 5. 生成 embed.html
console.log('📝 生成 embed.html...')

// 读取 Mock 数据（如果 mock-api-data.json 存在就用它，否则用默认的 Pet Store 示例）
let mockDataJson
if (fs.existsSync(MOCK_DATA_FILE)) {
  mockDataJson = fs.readFileSync(MOCK_DATA_FILE, 'utf8')
  console.log('   📄 使用 mock-api-data.json 作为 Mock 数据')
} else {
  // 内置默认 Mock 数据
  mockDataJson = JSON.stringify({
    openapi: "3.0.1",
    info: { title: "Swagger UI 示例 API", description: "Spring Boot 3.x SpringDoc OpenAPI 示例", version: "1.0" },
    paths: {},
    components: { schemas: {} }
  }, null, 2)
  console.log('   ⚠️  未找到 mock-api-data.json，使用默认空数据')
}

const embedHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New UI — Live Demo</title>
  <script>
    // ============================================================
    //  Mock API Data — 拦截 fetch，返回模拟的 OpenAPI 文档
    // ============================================================
    const MOCK_API_DATA = ${mockDataJson};

    // 拦截 fetch，Mock API 响应
    const _origFetch = window.fetch;
    window.fetch = function(input, init) {
      const url = typeof input === 'string' ? input : input.url;

      // 拦截 api-docs 请求
      if (url.includes('/v3/api-docs') || url.endsWith('api-docs')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve(MOCK_API_DATA),
          text: () => Promise.resolve(JSON.stringify(MOCK_API_DATA)),
        });
      }

      // 拦截 groups 请求 — 返回默认分组
      if (url.includes('/swagger-new-ui/groups')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve([{ name: "default", displayName: "默认分组", url: "/v3/api-docs" }]),
        });
      }

      // 其他请求走原始 fetch
      return _origFetch.apply(this, arguments);
    };
  </script>
  <link rel="stylesheet" crossorigin href="./assets/${cssFile}">
</head>
<body>
  <div id="root"></div>
  <script type="module" crossorigin src="./assets/${jsFile}"></script>
</body>
</html>`

fs.writeFileSync(path.join(WEBSITE_NEW_UI, 'embed.html'), embedHtml)
console.log('   ✅ embed.html 已生成\n')

// 6. 也复制一份 index.html（供全屏预览使用）
fs.copyFileSync(path.join(UI_DIST, 'index.html'), path.join(WEBSITE_NEW_UI, 'index.html'))
console.log('   ✅ index.html 已复制\n')

console.log('🎉 同步完成！')
console.log('\n💡 后续步骤:')
console.log('   1. cd website && npm run dev  — 预览效果')
console.log('   2. git add website/public/new-ui/ && git commit  — 提交更新')
