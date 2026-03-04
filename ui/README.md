# Swagger UI Frontend

基于 React 19 + Vite 7 构建的现代化 Swagger UI 界面。

## 技术栈

- **React 19** - UI 框架
- **Vite 7** - 构建工具
- **SCSS** - 样式预处理
- **highlight.js** - 代码高亮

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本（用于 Java 项目）
npm run build:java

# 构建标准版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

## 目录结构

```
src/
├── App.jsx                    # 主应用组件
├── main.jsx                   # 入口文件
├── index.css                  # 全局样式
├── components/                # React 组件
│   ├── App.scss
│   ├── Sidebar.jsx           # 侧边栏（API 列表、分组选择）
│   ├── Sidebar.scss
│   ├── MainContent.jsx       # 主内容区
│   ├── MainContent.scss
│   ├── SettingsModal.jsx     # 设置弹窗（Token、API 路径配置）
│   ├── SettingsModal.scss
│   ├── icons/                # 图标组件
│   │   ├── ChevronDownIcon.jsx
│   │   ├── MoonIcon.jsx
│   │   ├── SendIcon.jsx
│   │   ├── SettingsIcon.jsx
│   │   └── SunIcon.jsx
│   └── main-content/         # 主内容子组件
│       ├── CodeExample.jsx   # 代码示例展示
│       ├── CodeExample.scss
│       ├── DocPanel.jsx      # 文档面板
│       ├── DocPanel.scss
│       └── ...
├── hooks/                    # 自定义 Hooks
│   ├── index.js
│   ├── useApiRequest.js      # API 请求 Hook
│   ├── useEndpointParams.js  # 端点参数处理
│   └── useSchemaResolver.js  # Schema 解析
└── styles/                   # 样式文件
    ├── _base.scss
    ├── _content.scss
    ├── _params.scss
    ├── _sidebar.scss
    ├── _themes.scss         # 主题样式
    ├── _try.scss
    ├── _variables.scss
    └── index.scss
```

## 主要功能

### 主题切换

支持亮色/暗色主题切换，偏好设置自动保存到 localStorage。

### 分组支持

支持 SpringDoc 的 API 分组功能，可以在侧边栏切换不同的 API 分组。

### 可调整侧边栏

支持拖拽调整侧边栏宽度（200px - 600px），宽度设置自动保存。

### 认证支持

支持配置 Bearer Token，用于访问需要认证的 API。

### API 测试

内置 API 测试功能，支持：
- GET、POST、PUT、DELETE、PATCH 等 HTTP 方法
- Path 参数、Query 参数、Header 参数
- Request Body（JSON 格式）
- 文件上传
- 响应预览和代码高亮

### 状态持久化

以下设置会自动保存到 localStorage：
- 主题偏好
- 选中的分组
- 侧边栏宽度
- 认证 Token
- 自定义 API 路径

## 配置

### 开发代理

开发环境下，Vite 会自动代理以下路径到后端服务（`vite.config.js`）：

```javascript
server: {
  proxy: {
    '/v3': {
      target: 'http://127.0.0.1:8080/admin',
      changeOrigin: true,
    },
    '/api': {
      target: 'http://127.0.0.1:8080/admin',
      changeOrigin: true,
    },
    '/swagger-new-ui': {
      target: 'http://127.0.0.1:8080/admin',
      changeOrigin: true,
    },
  },
}
```

### 构建配置

- `npm run build` - 标准构建，使用绝对路径
- `npm run build:java` - 用于 Java 项目的构建，使用相对路径（`--base=./`）

### 动态配置

页面会从 `window.SWAGGER_UI_CONFIG` 读取后端注入的配置：

```javascript
const swaggerConfig = window.SWAGGER_UI_CONFIG || {}
const baseUrl = swaggerConfig.baseUrl
const apiPath = swaggerConfig.apiPath
const groupsPath = swaggerConfig.groupsPath
```

## 与后端集成

构建产物会被复制到 `yudao-swagger-new-ui-boot-starter/src/main/resources/static/` 目录，随 Starter 一起打包发布。

使用 `build.sh` 脚本可以自动完成前端构建和后端打包的完整流程。
