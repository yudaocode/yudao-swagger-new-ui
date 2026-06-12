import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import './HomePage.scss'

function HomePage() {
  const iframeRef = useRef(null)

  const syncThemeToIframe = () => {
    setTimeout(() => {
      if (!iframeRef.current) return
      const doc = iframeRef.current.contentDocument
      if (!doc) return
      const theme = document.documentElement.getAttribute('data-theme')
      if (theme === 'light') {
        doc.documentElement.setAttribute('data-theme', 'light')
      } else {
        doc.documentElement.removeAttribute('data-theme')
      }
    }, 500)
  }

  return (
    <div className="home-page">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="hero-inner">
          <div className="hero-head">
            <div className="hero-tag">
              <span className="hero-tag-dot" />
              open source · spring boot 2.x & 3.x
            </div>

            <h1 className="hero-title">
              <span className="hero-title-line">Beautiful</span>
              <span className="hero-title-line hero-title-accent">Swagger UI</span>
              <span className="hero-title-line hero-title-thin">for Spring Boot</span>
            </h1>

            <p className="hero-sub">
              零侵入 · 一行依赖 · 现代暗色主题
            </p>

            <div className="hero-actions">
              <Link to="/docs" className="hero-btn hero-btn-primary">
                <span className="hero-btn-prefix">$</span>
                quick_start
              </Link>
              <a
                href="https://github.com/yudaocode/yudao-swagger-new-ui"
                className="hero-btn hero-btn-ghost"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                GitHub
              </a>
            </div>
          </div>

          {/* ===== LIVE DEMO ===== */}
          <div className="hero-demo">
            <div className="hero-demo-bar">
              <div className="hero-demo-dots">
                <span className="bar-dot red" />
                <span className="bar-dot yellow" />
                <span className="bar-dot green" />
              </div>
              <span className="hero-demo-url">localhost:8080/swagger-new-ui.html</span>
              <a
                href="/new-ui/embed.html"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-demo-fullscreen"
                title="全屏预览"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </svg>
              </a>
            </div>
            <div className="hero-demo-body">
              <iframe
                ref={iframeRef}
                src="/new-ui/embed.html"
                className="demo-iframe"
                title="New UI Live Demo"
                onLoad={syncThemeToIframe}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="features">
        <div className="features-inner">
          <div className="section-tag">
            <span className="section-tag-bracket">{"//"}</span> features
          </div>

          <div className="features-grid">
            <div className="feat-card">
              <div className="feat-method feat-get">GET</div>
              <h3 className="feat-title">现代化 UI</h3>
              <p className="feat-desc">React 19 驱动，暗色/亮色双主题，JetBrains Mono 等宽字体，代码级美学</p>
            </div>
            <div className="feat-card">
              <div className="feat-method feat-post">POST</div>
              <h3 className="feat-title">零侵入接入</h3>
              <p className="feat-desc">无需改动任何现有代码，一行 Maven 依赖即可替换传统 Swagger UI</p>
            </div>
            <div className="feat-card">
              <div className="feat-method feat-put">PUT</div>
              <h3 className="feat-title">双版本兼容</h3>
              <p className="feat-desc">统一 Starter 同时适配 Spring Boot 2.x / 3.x，JDK 8 编译确保兼容</p>
            </div>
            <div className="feat-card">
              <div className="feat-method feat-get">GET</div>
              <h3 className="feat-title">分组支持</h3>
              <p className="feat-desc">完整支持 SpringDoc GroupedOpenApi，多分组无缝切换</p>
            </div>
            <div className="feat-card">
              <div className="feat-method feat-post">POST</div>
              <h3 className="feat-title">动态注入</h3>
              <p className="feat-desc">通过 inject-config 注入自定义配置，前端 window.SWAGGER_UI_CONFIG 可读</p>
            </div>
            <div className="feat-card">
              <div className="feat-method feat-delete">DEL</div>
              <h3 className="feat-title">认证 & 持久化</h3>
              <p className="feat-desc">Bearer Token 认证，主题/分组/侧边栏宽度自动保存至 localStorage</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== QUICK START ===== */}
      <section className="quickstart">
        <div className="quickstart-inner">
          <div className="section-tag">
            <span className="section-tag-bracket">{"//"}</span> quick_start
          </div>

          <div className="qs-steps">
            <div className="qs-step">
              <div className="qs-num">01</div>
              <div className="qs-body">
                <h3 className="qs-title">添加依赖</h3>
                <div className="qs-code">
                  <div className="qs-code-bar">
                    <span>pom.xml</span>
                    <CopyButton text={`<dependency>
    <groupId>cn.coget</groupId>
    <artifactId>yudao-swagger-new-ui-boot-starter</artifactId>
    <version>1.0.5-RELEASE</version>
    <type>pom</type>
</dependency>`} />
                  </div>
                  <pre><code dangerouslySetInnerHTML={{ __html: highlightXml(`<dependency>
    <groupId>cn.coget</groupId>
    <artifactId>yudao-swagger-new-ui-boot-starter</artifactId>
    <version>1.0.5-RELEASE</version>
    <type>pom</type>
</dependency>`) }} /></pre>
                </div>
              </div>
            </div>

            <div className="qs-step">
              <div className="qs-num">02</div>
              <div className="qs-body">
                <h3 className="qs-title">添加 SpringDoc 依赖</h3>
                <div className="qs-code">
                  <div className="qs-code-bar">
                    <span>pom.xml</span>
                    <CopyButton text={`<!-- Spring Boot 3.x -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-api</artifactId>
    <version>2.8.4</version>
</dependency>`} />
                  </div>
                  <pre><code dangerouslySetInnerHTML={{ __html: highlightXml(`<!-- Spring Boot 3.x -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-api</artifactId>
    <version>2.8.4</version>
</dependency>`) }} /></pre>
                </div>
              </div>
            </div>

            <div className="qs-step">
              <div className="qs-num">03</div>
              <div className="qs-body">
                <h3 className="qs-title">启动应用，打开浏览器</h3>
                <div className="qs-url">
                  <span className="qs-url-label">GET</span>
                  <span className="qs-url-path">http://localhost:8080/swagger-new-ui.html</span>
                </div>
              </div>
            </div>
          </div>

          <div className="qs-footer">
            <Link to="/docs" className="hero-btn hero-btn-primary">
              <span className="hero-btn-prefix">$</span>
              read_the_docs →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== COMPAT ===== */}
      <section className="compat">
        <div className="compat-inner">
          <div className="section-tag">
            <span className="section-tag-bracket">{"//"}</span> compatibility
          </div>

          <div className="compat-table-wrap">
            <table className="compat-table">
              <thead>
                <tr>
                  <th>Spring Boot</th>
                  <th>Java</th>
                  <th>SpringDoc</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>2.7.x</code></td>
                  <td><code>8+</code></td>
                  <td><code>1.7.x</code></td>
                  <td className="compat-ok">✓ supported</td>
                </tr>
                <tr>
                  <td><code>3.x</code></td>
                  <td><code>17+</code></td>
                  <td><code>2.x</code></td>
                  <td className="compat-ok">✓ supported</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta">
        <div className="cta-glow" />
        <div className="cta-inner">
          <h2 className="cta-title">Ready to go?</h2>
          <p className="cta-desc">一行依赖，告别丑陋的 Swagger UI</p>
          <div className="cta-actions">
            <Link to="/docs" className="hero-btn hero-btn-primary hero-btn-lg">
              <span className="hero-btn-prefix">$</span>
              get_started
            </Link>
            <a
              href="https://github.com/yudaocode/yudao-swagger-new-ui"
              className="hero-btn hero-btn-ghost hero-btn-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              ⭐ Star on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

/**
 * 简易 XML 语法高亮
 * - 注释 (<!-- ... -->)  → 灰色斜体
 * - 标签名 (<dependency>, </dependency>) → 绿色
 * - 属性名 → 紫色
 * - 文本内容 / 属性值 → 琥珀色
 */
function highlightXml(xml) {
  // 先转义 HTML 实体
  const escaped = xml
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 1. 注释
  let result = escaped.replace(
    /(&lt;!--[\s\S]*?--&gt;)/g,
    '<span class="hl-comment">$1</span>'
  )

  // 2. 自闭合标签 & 普通标签
  //    匹配 <tag attr="val"> 或 </tag>
  result = result.replace(
    /(&lt;\/?)([\w:-]+)((?:\s+[\s\S]*?)?)(\/?&gt;)/g,
    (match, open, tag, attrs, close) => {
      let attrStr = attrs
      // 高亮属性名="属性值"
      attrStr = attrStr.replace(
        /([\w:-]+)(=)(&quot;|"|')(.*?)\3/g,
        '<span class="hl-attr">$1</span>$2<span class="hl-val">$3$4$3</span>'
      )
      return `${open}<span class="hl-tag">${tag}</span>${attrStr}${close}`
    }
  )

  // 3. 标签之间的文本内容（简单处理：每行缩进后到 &lt; 之前的内容）
  result = result.replace(
    /^(\s*)([^&<\n][^<\n]*?)(&lt;)/gm,
    '$1<span class="hl-val">$2</span>$3'
  )

  return result
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button className="copy-btn" onClick={handleCopy}>
      {copied ? '✓ copied' : 'copy'}
    </button>
  )
}

export default HomePage
