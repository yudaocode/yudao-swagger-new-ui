import { useState, useEffect } from 'react'
import DocsSidebar from '../components/DocsSidebar'
import { highlightCode } from '../utils/highlight'
import './DocsPage.scss'

const sections = [
  {
    id: 'introduction',
    title: '介绍',
    content: (
      <div className="doc-section">
        <h2>介绍</h2>
        <p>
          <strong>Yudao Swagger New UI</strong> 是一个为 SpringDoc 打造的全新 Swagger UI 界面。
          基于 React 19 构建，提供现代化、美观且易用的 API 文档浏览体验。
        </p>
        <p>
          与传统 Swagger UI 不同，New UI 采用全新设计语言，支持亮色/暗色主题，
          更直观的 API 浏览和测试。完全兼容 Spring Boot 2.x / 3.x，一行依赖即可使用。
        </p>
        <div className="doc-callout">
          <div className="doc-callout-bar" />
          <div className="doc-callout-body">
            <strong>零侵入</strong> — 不修改现有代码和配置，仅替换 Swagger UI 前端界面，后端仍使用 SpringDoc 生成 API 文档。
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'quick-start',
    title: '快速开始',
    content: (
      <div className="doc-section">
        <h2>快速开始</h2>

        <h3 id="requirements">环境要求</h3>
        <div className="doc-table-wrap">
          <table className="doc-table">
            <thead><tr><th>组件</th><th>版本</th></tr></thead>
            <tbody>
              <tr><td>Java</td><td>8+ (Boot 2) / 17+ (Boot 3)</td></tr>
              <tr><td>Spring Boot</td><td>2.7.x 或 3.x</td></tr>
              <tr><td>SpringDoc</td><td>1.7.0+ (Boot 2) / 2.3.0+ (Boot 3)</td></tr>
            </tbody>
          </table>
        </div>

        <h3 id="add-dep">1. 添加依赖</h3>
        <DocCode title="pom.xml" lang="xml" code={`<dependency>
    <groupId>cn.coget</groupId>
    <artifactId>yudao-swagger-new-ui-boot-starter</artifactId>
    <version>1.0.5-RELEASE</version>
    <type>pom</type>
</dependency>`} />
        <DocCode title="build.gradle" lang="groovy" code={`implementation 'cn.coget:yudao-swagger-new-ui-boot-starter:1.0.4-RELEASE'`} />

        <h3 id="add-springdoc">2. 添加 SpringDoc 依赖</h3>
        <DocCode title="Spring Boot 2.x" lang="xml" code={`<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-webmvc-core</artifactId>
    <version>1.7.0</version>
</dependency>`} />
        <DocCode title="Spring Boot 3.x" lang="xml" code={`<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-api</artifactId>
    <version>2.8.4</version>
</dependency>`} />

        <h3 id="start">3. 启动应用</h3>
        <div className="doc-url-block">
          <span className="doc-url-method">GET</span>
          <span className="doc-url-path">http://localhost:8080/swagger-new-ui.html</span>
        </div>
      </div>
    )
  },
  {
    id: 'configuration',
    title: '配置说明',
    content: (
      <div className="doc-section">
        <h2>配置说明</h2>

        <h3 id="full-config">完整配置</h3>
        <DocCode title="application.yml" lang="yaml" code={`swagger-new-ui:
  # Swagger UI 访问路径，支持多个路径（逗号分割）
  paths: /swagger-new-ui.html,/swagger-ui.html,/doc.html
  # 基础 URL 路径，适用于有 context-path 的场景
  base-url: /
  # OpenAPI 文档的 API 路径
  api-path: /v3/api-docs`} />

        <h3 id="config-props">配置项</h3>
        <div className="doc-table-wrap">
          <table className="doc-table">
            <thead><tr><th>配置项</th><th>说明</th><th>默认值</th></tr></thead>
            <tbody>
              <tr><td><code>paths</code></td><td>访问路径，逗号分割</td><td><code>/swagger-new-ui.html</code></td></tr>
              <tr><td><code>groups-api-path</code></td><td>分组 API 路径</td><td><code>/swagger-new-ui/groups</code></td></tr>
              <tr><td><code>base-url</code></td><td>基础 URL（context-path 场景）</td><td><code>/</code></td></tr>
              <tr><td><code>api-path</code></td><td>OpenAPI 文档路径</td><td><code>/v3/api-docs</code></td></tr>
              <tr><td><code>inject-config</code></td><td>注入配置，前端 <code>window.SWAGGER_UI_CONFIG</code> 可读</td><td><code>{'{}'}</code></td></tr>
            </tbody>
          </table>
        </div>

        <h3 id="context-path">context-path 场景</h3>
        <DocCode title="application.yml" lang="yaml" code={`server:
  servlet:
    context-path: /admin

swagger-new-ui:
  base-url: \${server.servlet.context-path}
  paths: swagger-new-ui.html,swagger-ui.html,doc.html`} />
        <p>访问：<code>http://localhost:8080/admin/swagger-new-ui.html</code></p>

        <h3 id="inject">自定义注入</h3>
        <DocCode title="application.yml" lang="yaml" code={`swagger-new-ui:
  inject-config:
    app-name: MyApp
    app-version: 1.0.0`} />
        <p>前端通过 <code>window.SWAGGER_UI_CONFIG</code> 访问。</p>
      </div>
    )
  },
  {
    id: 'examples',
    title: '使用示例',
    content: (
      <div className="doc-section">
        <h2>使用示例</h2>

        <h3 id="ctrl">Controller</h3>
        <DocCode title="UserController.java" lang="java" code={`@RestController
@RequestMapping("/api/users")
@Tag(name = "用户管理", description = "用户相关接口")
public class UserController {

    @GetMapping("/{id}")
    @Operation(summary = "获取用户信息")
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
}`} />

        <h3 id="groups">分组配置</h3>
        <DocCode title="SwaggerConfig.java" lang="java" code={`@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("API 文档").version("1.0"));
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
}`} />
      </div>
    )
  },
  {
    id: 'development',
    title: '本地开发',
    content: (
      <div className="doc-section">
        <h2>本地开发</h2>

        <h3 id="build">构建完整项目</h3>
        <DocCode title="bash" lang="bash" code={`./build.sh`} />
        <p>脚本会：① 构建前端 → ② 复制到 Starter static → ③ JDK 8 编译安装</p>

        <h3 id="frontend">前端开发</h3>
        <DocCode title="bash" lang="bash" code={`cd ui
npm install
npm run dev          # 开发模式（带代理）
npm run build:java   # 构建 Java 版本
npm run build        # 标准构建`} />
        <p>开发代理：<code>/v3/*</code> <code>/api/*</code> <code>/swagger-new-ui/*</code> → <code>127.0.0.1:8080</code></p>

        <h3 id="examples-run">运行示例</h3>
        <DocCode title="bash" lang="bash" code={`# Spring Boot 2.x
cd examples/yudao-swagger-ui-spring-boot2-example
mvn spring-boot:run

# Spring Boot 3.x
cd examples/yudao-swagger-ui-spring-boot3-example
mvn spring-boot:run`} />
        <p>访问 <code>http://localhost:8080/admin/swagger-new-ui.html</code></p>
      </div>
    )
  },
  {
    id: 'how-it-works',
    title: '工作原理',
    content: (
      <div className="doc-section">
        <h2>工作原理</h2>

        <h3 id="auto">自动配置</h3>
        <ul>
          <li><strong>Spring Boot 2.x</strong>：<code>META-INF/spring.factories</code></li>
          <li><strong>Spring Boot 3.x</strong>：<code>META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports</code></li>
        </ul>

        <h3 id="html-inject">动态 HTML 注入</h3>
        <p><code>SwaggerUiAutoConfiguration</code> 读取 <code>index.html</code> 模板，注入 <code>window.SWAGGER_UI_CONFIG</code> 的 <code>&lt;script&gt;</code> 标签。</p>

        <h3 id="springdoc-reflection">SpringDoc 兼容</h3>
        <p>通过反射检测 SpringDoc 版本：</p>
        <ul>
          <li>SpringDoc 2.x：<code>org.springdoc.core.models.GroupedOpenApi</code></li>
          <li>SpringDoc 1.x：<code>org.springdoc.core.GroupedOpenApi</code></li>
        </ul>
      </div>
    )
  },
  {
    id: 'faq',
    title: 'FAQ',
    content: (
      <div className="doc-section">
        <h2>FAQ</h2>

        <div className="faq-item">
          <h3>修改默认访问路径？</h3>
          <DocCode lang="yaml" code={`swagger-new-ui:
  paths: /doc.html`} />
        </div>

        <div className="faq-item">
          <h3>配置认证 Token？</h3>
          <p>界面右上角设置图标 → 输入 Bearer Token。</p>
        </div>

        <div className="faq-item">
          <h3>为什么 Boot 2 和 3 用同一个 Starter？</h3>
          <p>JDK 8 编译，反射动态检测 SpringDoc 版本自动适配。</p>
        </div>
      </div>
    )
  }
]

function DocCode({ title, lang, code }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(code) } catch {
      const ta = document.createElement('textarea'); ta.value = code
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="doc-code">
      {title && (
        <div className="doc-code-bar">
          <span>{title}</span>
          <button className="doc-copy" onClick={handleCopy}>{copied ? '✓ copied' : 'copy'}</button>
        </div>
      )}
      <pre><code dangerouslySetInnerHTML={{ __html: highlightCode(code, lang) }} /></pre>
    </div>
  )
}

function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction')

  useEffect(() => {
    const handleScroll = () => {
      const els = sections.map(s => ({ id: s.id, el: document.getElementById(s.id) })).filter(s => s.el)
      for (let i = els.length - 1; i >= 0; i--) {
        if (els[i].el.getBoundingClientRect().top <= 120) {
          setActiveSection(els[i].id); break
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="docs-page">
      <DocsSidebar sections={sections} activeSection={activeSection} onSelect={id => {
        setActiveSection(id)
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }} />
      <div className="docs-content">
        <div className="docs-content-inner">
          {sections.map(s => (
            <div key={s.id} id={s.id} className="doc-section-wrap">{s.content}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DocsPage
