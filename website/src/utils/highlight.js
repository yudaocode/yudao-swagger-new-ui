/**
 * 轻量级代码语法高亮工具
 * 支持 xml / yaml / java / bash / groovy
 *
 * 暗色主题配色：
 *   .hl-tag      → 绿色   标签名 / YAML 键
 *   .hl-attr     → 紫色   属性名
 *   .hl-val      → 琥珀色  文本内容 / 属性值
 *   .hl-comment  → 灰色   注释
 *   .hl-keyword  → 粉色   关键字 (public, class, return …)
 *   .hl-string   → 绿色   字符串字面量
 *   .hl-annotation → 黄色  注解 (@Override …)
 *   .hl-number   → 橙色   数字字面量
 */

/**
 * HTML 转义
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// ──────────────────────────────────────
//  XML
// ──────────────────────────────────────
function highlightXml(code) {
  let result = escapeHtml(code)

  // 1. 注释 <!-- ... -->
  result = result.replace(
    /(&lt;!--[\s\S]*?--&gt;)/g,
    '<span class="hl-comment">$1</span>'
  )

  // 2. 标签 <tag ...> 或 </tag>
  result = result.replace(
    /(&lt;\/?)([\w:.-]+)((?:\s+[\s\S]*?)?)(\/?&gt;)/g,
    (match, open, tag, attrs, close) => {
      let attrStr = attrs
      // 属性名="属性值"
      attrStr = attrStr.replace(
        /([\w:.-]+)(=)(&quot;|")(.*?)\3/g,
        '<span class="hl-attr">$1</span>$2<span class="hl-val">$3$4$3</span>'
      )
      return `${open}<span class="hl-tag">${tag}</span>${attrStr}${close}`
    }
  )

  // 3. 标签之间的文本内容
  result = result.replace(
    /^(\s*)([^&<\n][^<\n]*?)(&lt;)/gm,
    '$1<span class="hl-val">$2</span>$3'
  )

  return result
}

// ──────────────────────────────────────
//  YAML
// ──────────────────────────────────────
function highlightYaml(code) {
  let result = escapeHtml(code)

  // 1. 注释 # ...
  result = result.replace(
    /(#.*)/gm,
    '<span class="hl-comment">$1</span>'
  )

  // 2. 键: 值（键在行首或缩进后，到冒号为止）
  result = result.replace(
    /^(\s*)([\w.-]+)(:)/gm,
    '$1<span class="hl-tag">$2</span>$3'
  )

  // 3. 字符串值（含引号的）
  result = result.replace(
    /:\s+(&quot;|"|')(.*?)\1/g,
    ': <span class="hl-val">$1$2$1</span>'
  )

  // 4. ${...} 变量引用
  result = result.replace(
    /(\$\{[^}]*\})/g,
    '<span class="hl-attr">$1</span>'
  )

  return result
}

// ──────────────────────────────────────
//  Java
// ──────────────────────────────────────
const JAVA_KEYWORDS = [
  'public', 'private', 'protected', 'static', 'final', 'abstract',
  'class', 'interface', 'extends', 'implements', 'enum',
  'void', 'return', 'new', 'import', 'package',
  'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue',
  'try', 'catch', 'finally', 'throw', 'throws',
  'this', 'super', 'null', 'true', 'false',
  'int', 'long', 'double', 'float', 'boolean', 'char', 'byte', 'short',
].join('|')

function highlightJava(code) {
  let result = escapeHtml(code)

  // 1. 单行注释 // ...
  result = result.replace(
    /(\/\/.*)/gm,
    '<span class="hl-comment">$1</span>'
  )

  // 2. 多行注释 /* ... */
  result = result.replace(
    /(\/\*[\s\S]*?\*\/)/g,
    '<span class="hl-comment">$1</span>'
  )

  // 3. 注解 @Override, @Bean ...
  result = result.replace(
    /(@[\w]+)/g,
    '<span class="hl-annotation">$1</span>'
  )

  // 4. 字符串 "..."
  result = result.replace(
    /(&quot;)(.*?)\1/g,
    '<span class="hl-string">$1$2$1</span>'
  )

  // 5. 关键字
  const kwRe = new RegExp(`\\b(${JAVA_KEYWORDS})\\b`, 'g')
  result = result.replace(kwRe, '<span class="hl-keyword">$1</span>')

  // 6. 数字
  result = result.replace(
    /\b(\d+\.?\d*[fdlFDL]?)\b/g,
    '<span class="hl-number">$1</span>'
  )

  return result
}

// ──────────────────────────────────────
//  Bash
// ──────────────────────────────────────
function highlightBash(code) {
  let result = escapeHtml(code)

  // 1. 注释 # ...
  result = result.replace(
    /(#.*)/gm,
    '<span class="hl-comment">$1</span>'
  )

  // 2. 字符串 "..." 和 '...'
  result = result.replace(
    /(&quot;|"|')(.*?)\1/g,
    '<span class="hl-string">$1$2$1</span>'
  )

  // 3. 常用命令
  const cmds = ['cd', 'npm', 'mvn', 'git', 'docker', 'curl', 'wget', 'chmod', 'mkdir', 'rm', 'cp', 'ls', 'cat', 'echo', 'export', 'source', 'sh', 'bash', 'java', 'javac', 'gradle', 'python', 'node', 'yarn', 'pnpm']
  const cmdRe = new RegExp(`^\\s*(${cmds.join('|')})\\b`, 'gm')
  result = result.replace(cmdRe, '<span class="hl-keyword">$1</span>')

  return result
}

// ──────────────────────────────────────
//  Groovy（简化版，与 Java 类似）
// ──────────────────────────────────────
function highlightGroovy(code) {
  return highlightJava(code)
}

// ──────────────────────────────────────
//  统一入口
// ──────────────────────────────────────
export function highlightCode(code, lang = 'xml') {
  switch (lang) {
    case 'xml':
      return highlightXml(code)
    case 'yaml':
    case 'yml':
      return highlightYaml(code)
    case 'java':
      return highlightJava(code)
    case 'bash':
    case 'sh':
    case 'shell':
    case 'zsh':
      return highlightBash(code)
    case 'groovy':
    case 'gradle':
      return highlightGroovy(code)
    default:
      return escapeHtml(code)
  }
}
