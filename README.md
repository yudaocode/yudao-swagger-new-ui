# Yudao Swagger new UI

<p align="center">
  <img src="ui/public/favicon-green.svg" alt="Yudao Swagger UI Logo" width="120" height="120">
</p>
<h3 align="center">一个现代化、美观的 Swagger new UI 界面</h3>

<p align="center">
兼容 Spring Boot 2.x、3.x
</p>


<p align="center">
  <a href="#特性">特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#配置说明">配置说明</a> •
  <a href="#本地开发">本地开发</a> •
  <a href="#技术栈">技术栈</a>
</p>

![home](/docs/img/swagger-home-dark.png)


## 特性

- 🎨 **现代化 UI** - 基于 React 19 构建，界面美观易用，支持亮色/暗色主题
- 🔧 **高度可配置** - 支持自定义路径、API 地址等配置
- 📦 **双版本支持** - 同时支持 Spring Boot 2.x 和 3.x，使用统一的 Starter
- 🚀 **零侵入** - 无需修改现有代码，引入依赖即可使用
- 🌐 **分组支持** - 完整支持 SpringDoc 分组功能
- ⚡ **动态注入** - 支持向页面注入动态配置
- 🌙 **主题切换** - 内置亮色/暗色主题，自动保存偏好
- 📱 **可调整侧边栏** - 支持拖拽调整侧边栏宽度
- 🔐 **认证支持** - 支持 Bearer Token 认证
- 💾 **状态持久化** - 自动保存主题、分组、侧边栏宽度等偏好设置

## 界面预览

![home](docs/img/swagger-home-dark.png)
![home](docs/img/swagger-home-light.png)

## 快速开始

### 环境要求

| 组件 | 版本要求 |
|------|----------|
| Java | 8+ (Spring Boot 2.x) / 17+ (Spring Boot 3.x) |
| Spring Boot | 2.7.x 或 3.x |
| SpringDoc | 1.7.0+ (Boot 2) / 2.3.0+ (Boot 3) |

### 1. 引入依赖

#### Maven

```xml
<dependency>
    <groupId>cn.coget</groupId>
    <artifactId>yudao-swagger-new-ui-boot-starter</artifactId>
    <version>1.0.1-RELEASE</version>
</dependency>
```

#### Gradle

```groovy
implementation 'cn.coget:yudao-swagger-new-ui-boot-starter:1.0.1-RELEASE'
```

### 2. 添加 SpringDoc 依赖

根据你的 Spring Boot 版本，添加对应的 SpringDoc 依赖：

#### Spring Boot 2.x

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-webmvc-core</artifactId>
    <version>1.7.0</version>
</dependency>
```

#### Spring Boot 3.x

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-api</artifactId>
    <version>2.8.4</version>
</dependency>
```

### 3. 启动应用

启动 Spring Boot 应用后，访问以下地址：

```
http://localhost:8080/swagger-new-ui.html
```

## 配置说明

### 完整配置示例

在 `application.yml` 中添加以下配置：

```yaml
swagger-new-ui:
  # Swagger UI 访问路径，支持多个路径（逗号分割）
  paths: /swagger-new-ui.html,/swagger-ui.html,/doc.html
  # 基础 URL 路径，适用于有 context-path 的场景
  base-url: /
  # OpenAPI 文档的 API 路径
  api-path: /v3/api-docs
  # 自定义注入配置（可通过 window.SWAGGER_UI_CONFIG 访问）
  inject-config:
    custom-key: custom-value
```

### 配置项说明

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `paths` | Swagger UI 访问路径，支持多个路径（逗号分割） | `/swagger-new-ui.html` |
| `groups-api-path` | 分组 API 的访问路径 | `/swagger-new-ui/groups` |
| `base-url` | 应用的基础 URL 路径，适用于有 context-path 的场景 | `/` |
| `api-path` | OpenAPI 文档的 API 路径 | `/v3/api-docs` |
| `inject-config` | 自定义注入到页面的配置，可通过 `window.SWAGGER_UI_CONFIG` 访问 | `{}` |

### 配合 context-path 使用

如果应用配置了 `context-path`，需要同步配置 `base-url`：

```yaml
server:
  servlet:
    context-path: /admin

swagger-new-ui:
  base-url: ${server.servlet.context-path}
  paths: swagger-new-ui.html,swagger-ui.html,doc.html
```

此时访问地址为：`http://localhost:8080/admin/swagger-new-ui.html`

## 使用示例

### 基础 Controller 示例

```java
@RestController
@RequestMapping("/api/users")
@Tag(name = "用户管理", description = "用户相关接口")
public class UserController {
    
    @GetMapping("/{id}")
    @Operation(summary = "获取用户信息", description = "根据用户ID获取用户详细信息")
    public Result<UserVO> getUser(
            @Parameter(description = "用户ID", required = true) 
            @PathVariable Long id) {
        // ...
    }
    
    @PostMapping
    @Operation(summary = "创建用户")
    public Result<UserVO> createUser(@RequestBody UserCreateDTO dto) {
        // ...
    }
}
```

### 配置分组

通过 `GroupedOpenApi` 配置 API 分组：

```java
@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API 文档")
                        .version("1.0"));
    }
    
    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group("用户API")
                .pathsToMatch("/api/users/**")
                .build();
    }
    
    @Bean
    public GroupedOpenApi orderApi() {
        return GroupedOpenApi.builder()
                .group("订单API")
                .pathsToMatch("/api/orders/**")
                .build();
    }
}
```

## 项目结构

```
yudao-swagger-ui/
├── yudao-swagger-new-ui-boot-starter/    # Spring Boot Starter 模块
│   ├── pom.xml
│   └── src/main/
│       ├── java/cn/coget/swagger/autoconfigure/
│       │   ├── SwaggerUiAutoConfiguration.java   # 自动配置类
│       │   └── SwaggerUiProperties.java          # 配置属性类
│       └── resources/
│           ├── META-INF/
│           │   ├── spring.factories              # Spring Boot 2.x 自动配置
│           │   └── spring/
│           │       └── org.springframework.boot.autoconfigure.AutoConfiguration.imports  # Spring Boot 3.x
│           └── static/                           # Swagger UI 静态资源
│               ├── index.html
│               └── assets/
├── examples/                                    # 示例项目
│   ├── yudao-swagger-ui-spring-boot2-example/  # Spring Boot 2.x 示例
│   │   └── src/main/
│   │       ├── java/cn/coget/examples/
│   │       │   ├── config/
│   │       │   ├── controller/
│   │       │   ├── dto/
│   │       │   └── vo/
│   │       └── resources/application.yml
│   └── yudao-swagger-ui-spring-boot3-example/  # Spring Boot 3.x 示例
│       └── src/main/
│           ├── java/cn/coget/examples/
│           └── resources/application.yml
├── ui/                                          # 前端源码
│   ├── src/
│   │   ├── App.jsx                              # 主应用组件
│   │   ├── components/                          # React 组件
│   │   │   ├── Sidebar.jsx                      # 侧边栏
│   │   │   ├── MainContent.jsx                  # 主内容区
│   │   │   ├── SettingsModal.jsx               # 设置弹窗
│   │   │   ├── icons/                          # 图标组件
│   │   │   └── main-content/                   # 主内容子组件
│   │   ├── hooks/                              # 自定义 Hooks
│   │   └── styles/                             # 样式文件
│   ├── package.json
│   └── vite.config.js
└── build.sh                                    # 构建脚本
```

## 本地开发

### 构建完整项目

使用提供的构建脚本，自动完成前端构建和后端打包：

```bash
./build.sh
```

该脚本会：
1. 构建前端 React 项目（`npm run build:java`）
2. 将构建产物复制到 Starter 的 static 目录
3. 使用 JDK 8 编译并安装 Starter 到本地 Maven 仓库

### 前端开发

```bash
cd ui

# 安装依赖
npm install

# 开发模式（带代理）
npm run dev

# 构建生产版本（用于 Java 项目）
npm run build:java

# 构建标准版本
npm run build
```

开发模式下，Vite 会自动代理以下路径到后端：
- `/v3/*` → `http://127.0.0.1:8080`
- `/api/*` → `http://127.0.0.1:8080`
- `/swagger-new-ui/*` → `http://127.0.0.1:8080`

### 运行示例项目

```bash
# Spring Boot 2.x 示例
cd examples/yudao-swagger-ui-spring-boot2-example
mvn spring-boot:run

# Spring Boot 3.x 示例
cd examples/yudao-swagger-ui-spring-boot3-example
mvn spring-boot:run
```

访问：`http://localhost:8080/admin/swagger-new-ui.html`

### 仅构建后端模块

```bash
cd yudao-swagger-new-ui-boot-starter
mvn clean install -DskipTests
```

### 发布到 Maven 仓库

```bash
mvn clean deploy
```

> 注意：需要在 `~/.m2/settings.xml` 中配置仓库认证信息。

## 技术栈

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 19.x | UI 框架 |
| Vite | 7.x | 构建工具 |
| SCSS | - | 样式预处理 |
| highlight.js | 11.x | 代码高亮 |

### 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 2.7.x / 3.x | 应用框架 |
| SpringDoc OpenAPI | 1.7.x / 2.x | API 文档生成 |
| Java | 8+ / 17+ | 运行环境 |

## 兼容性

| Spring Boot | Java | SpringDoc | Starter |
|-------------|------|-----------|---------|
| 2.7.x | 8+ | 1.7.x | ✅ 支持 |
| 3.x | 17+ | 2.x | ✅ 支持 |

Starter 使用 JDK 8 编译，确保与所有版本兼容。

## 常见问题

### Q: 如何修改默认访问路径？

A: 在 `application.yml` 中配置 `swagger-new-ui.paths`：

```yaml
swagger-new-ui:
  paths: /doc.html
```

### Q: 如何配置认证 Token？

A: 在界面右上角点击设置图标，输入 Bearer Token。

### Q: 如何自定义注入配置？

A: 使用 `inject-config` 配置项：

```yaml
swagger-new-ui:
  inject-config:
    app-name: MyApp
    app-version: 1.0.0
```

在前端可通过 `window.SWAGGER_UI_CONFIG` 访问。

### Q: 为什么 Spring Boot 2 和 3 使用同一个 Starter？

A: Starter 使用 JDK 8 编译，同时兼容 Spring Boot 2.x 和 3.x。代码通过反射动态检测 SpringDoc 版本，自动适配不同的 API。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## License

[MIT License](LICENSE)

## 致谢

- [SpringDoc OpenAPI](https://springdoc.org/) - OpenAPI 3 文档生成
- [React](https://react.dev/) - UI 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
