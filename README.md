# Yudao Swagger UI

一个基于 Vue 3 + Vite 构建的现代化 Swagger UI 界面，支持 Spring Boot 2 和 Spring Boot 3。

## 特性

- 🎨 **现代化 UI** - 基于 Vue 3 构建，界面美观易用
- 🔧 **高度可配置** - 支持自定义路径、API 地址等配置
- 📦 **双版本支持** - 同时支持 Spring Boot 2 和 Spring Boot 3
- 🚀 **零侵入** - 无需修改现有代码，引入依赖即可使用
- 🌐 **分组支持** - 支持 SpringDoc 分组功能
- ⚡ **动态注入** - 支持向页面注入动态配置

## 快速开始

### 环境要求

| 模块 | Java 版本 | Spring Boot 版本 |
|------|-----------|------------------|
| swagger-ui-spring-boot2 | Java 8+ | 2.7.x |
| swagger-ui-spring-boot3 | Java 17+ | 3.x |

### 引入依赖

#### Spring Boot 2

```xml
<dependency>
    <groupId>coget.cn</groupId>
    <artifactId>swagger-ui-spring-boot2</artifactId>
    <version>1.0-RELEASE</version>
</dependency>
```

#### Spring Boot 3

```xml
<dependency>
    <groupId>coget.cn</groupId>
    <artifactId>swagger-ui-spring-boot3</artifactId>
    <version>1.0-RELEASE</version>
</dependency>
```

### 添加 SpringDoc 依赖

确保项目中已添加 SpringDoc 依赖：

#### Spring Boot 2

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-webmvc-core</artifactId>
    <version>1.7.0</version>
</dependency>
```

#### Spring Boot 3

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

### 访问页面

启动应用后，访问以下地址：

- Spring Boot 2: `http://localhost:8080/swagger-new-ui.html`
- Spring Boot 3: `http://localhost:8080/swagger-ui.html`

## 配置说明

### Spring Boot 2 配置项

在 `application.yml` 中添加以下配置：

```yaml
swagger-new-ui:
  # Swagger UI 访问路径，默认: /swagger-new-ui.html
  # 支持多个路径，使用逗号分割
  paths: /swagger-new-ui.html
  # 分组 API 路径，默认: /swagger-new-ui/groups
  groups-api-path: /swagger-new-ui/groups
  # 基础 URL 路径，默认: /
  base-url: /
  # API 文档路径，默认: /v3/api-docs
  api-path: /v3/api-docs
  # 自定义注入配置
  inject-config:
    custom-key: custom-value
```

### Spring Boot 3 配置项

```yaml
swagger-ui:
  # Swagger UI 访问路径，默认: /swagger-ui.html
  # 支持多个路径，使用逗号分割
  paths: /swagger-ui.html
  # 分组 API 路径，默认: /swagger-ui/groups
  groups-api-path: /swagger-ui/groups
  # 基础 URL 路径，默认: /
  base-url: /
  # API 文档路径，默认: /v3/api-docs
  api-path: /v3/api-docs
  # 自定义注入配置
  inject-config:
    custom-key: custom-value
```

### 配置项说明

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `paths` | Swagger UI 访问路径，支持多个路径（逗号分割） | `/swagger-new-ui.html` (Boot2) / `/swagger-ui.html` (Boot3) |
| `groups-api-path` | 分组 API 的访问路径 | `/swagger-new-ui/groups` (Boot2) / `/swagger-ui/groups` (Boot3) |
| `base-url` | 应用的基础 URL 路径，适用于有 context-path 的场景 | `/` |
| `api-path` | OpenAPI 文档的 API 路径 | `/v3/api-docs` |
| `inject-config` | 自定义注入到页面的配置，可通过 `window.SWAGGER_UI_CONFIG` 访问 | `{}` |

## 使用示例

### 基础使用

```java
@RestController
@RequestMapping("/user")
@Tag(name = "用户管理", description = "用户相关接口")
public class UserController {
    
    @GetMapping("/{id}")
    @Operation(summary = "获取用户信息", description = "根据用户ID获取用户详细信息")
    public UserVO getUser(@PathVariable Long id) {
        // ...
    }
}
```

### 配合 context-path 使用

如果应用配置了 `context-path`：

```yaml
server:
  servlet:
    context-path: /api

swagger-new-ui:
  base-url: /api
```

### 配置多个访问路径

`paths` 支持配置多个路径，使用逗号分割：

```yaml
swagger-new-ui:
  # 配置多个访问路径
  paths: /swagger-new-ui.html, /swagger-ui.html, /doc.html
```

配置后，以下地址都可以访问 Swagger UI：
- `http://localhost:8080/swagger-new-ui.html`
- `http://localhost:8080/swagger-ui.html`
- `http://localhost:8080/doc.html`

## 项目结构

```
yudao-swagger-ui/
├── swagger-ui-spring-boot2/     # Spring Boot 2 自动配置模块
│   └── src/main/
│       ├── java/cn/coget/swagger/autoconfigure/
│       │   ├── SwaggerUiAutoConfiguration.java
│       │   └── SwaggerUiProperties.java
│       └── resources/
│           ├── META-INF/spring.factories
│           └── static/           # Swagger UI 静态资源
├── swagger-ui-spring-boot3/     # Spring Boot 3 自动配置模块
│   └── src/main/
│       ├── java/cn/coget/swagger/autoconfigure/
│       └── resources/
│           ├── META-INF/spring/
│           └── static/
├── examples/                    # 示例项目
│   └── yudao-swagger-ui-spring-boot2-example/
└── ui/                          # 前端源码（Vue 3 + Vite）
```

## 本地开发

### 构建项目

```bash
# 构建所有模块
mvn clean install

# 仅构建 Spring Boot 2 模块
mvn clean install -pl swagger-ui-spring-boot2

# 仅构建 Spring Boot 3 模块（需要 Java 17+）
mvn clean install -pl swagger-ui-spring-boot3
```

### 发布到仓库

```bash
mvn clean deploy
```

> 注意：需要在 `~/.m2/settings.xml` 中配置仓库认证信息。

### 前端开发

```bash
cd ui

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

## 技术栈

- **前端**: Vue 3 + Vite + SCSS
- **后端**: Spring Boot 2.7.x / 3.x
- **文档**: SpringDoc OpenAPI

## License

MIT License
