/**
 * HTML 导出样式
 */
export const cssStyles = `
* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --page-bg: #0C0C0C;
  --surface-bg: #171717;
  --input-bg: #1A1A1A;
  --text-primary: #E5E5E5;
  --text-secondary: #A3A3A3;
  --text-tertiary: #737373;
  --text-muted: #525252;
  --border-primary: #1F1F1F;
  --border-secondary: #252525;
  --accent-green: #22C55E;
  --accent-info: #3B82F6;
  --accent-warning: #F59E0B;
  --accent-error: #EF4444;
  --radius-sm: 4px;
  --scrollbar-thumb: #3A3A3A;
  --scrollbar-thumb-hover: #4A4A4A;
  --hljs-keyword: #C678DD;
  --hljs-string: #98C379;
  --hljs-number: #D19A66;
  --hljs-comment: #5C6370;
  --hljs-function: #61AFEF;
}

[data-theme="light"] {
  --page-bg: #FAFAFA;
  --surface-bg: #FFFFFF;
  --input-bg: #F5F5F5;
  --text-primary: #171717;
  --text-secondary: #525252;
  --text-tertiary: #737373;
  --text-muted: #A3A3A3;
  --border-primary: #E5E5E5;
  --border-secondary: #D4D4D4;
  --accent-green: #16A34A;
  --accent-info: #2563EB;
  --accent-warning: #D97706;
  --accent-error: #DC2626;
  --scrollbar-thumb: #C4C4C4;
  --scrollbar-thumb-hover: #A8A8A8;
  --hljs-keyword: #D73A49;
  --hljs-string: #032F62;
  --hljs-number: #005CC5;
  --hljs-comment: #6A737D;
  --hljs-function: #6F42C1;
}

body {
  font-family: 'JetBrains Mono', -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace;
  background-color: var(--page-bg);
  color: var(--text-primary);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

#root { min-height: 100vh; }

/* Global Scrollbar Styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

/* Firefox scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) transparent;
}

.app { display: flex; height: 100vh; background-color: var(--page-bg); }
.resize-handle { width: 4px; background-color: transparent; cursor: col-resize; flex-shrink: 0; }
.resize-handle:hover { background-color: var(--accent-info); }

/* Sidebar */
.sidebar {
  background-color: var(--page-bg);
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border-right: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.sidebar-header { display: flex; flex-direction: column; gap: 8px; padding: 0 20px; }
.logo-row { display: flex; align-items: center; gap: 8px; justify-content: space-between; width: 100%; }
.logo-left { display: flex; align-items: center; gap: 8px; }
.logo-icon { width: 24px; height: 24px; color: var(--accent-green); }
.logo-text { font-size: 18px; font-weight: 600; color: var(--text-primary); }
.subtitle { font-size: 12px; color: var(--text-tertiary); }
.api-version { font-size: 11px; color: var(--accent-info); }

.search-section { display: flex; flex-direction: column; gap: 12px; padding: 0 20px; }
.search-label { font-size: 11px; font-weight: 500; color: var(--text-muted); }
.search-box { display: flex; align-items: center; gap: 8px; padding: 0 12px; height: 36px; background-color: var(--surface-bg); border-radius: var(--radius-sm); }
.search-icon { width: 16px; height: 16px; color: var(--text-muted); }
.search-input { font-size: 13px; color: var(--text-tertiary); background: transparent; border: none; outline: none; flex: 1; font-family: 'JetBrains Mono', monospace; min-width: 0; }
.search-clear { display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: transparent; border: none; cursor: pointer; padding: 0; color: var(--text-muted); }
.search-clear:hover { color: var(--text-secondary); }
.search-clear svg { width: 16px; height: 16px; }

.nav-section { display: flex; flex-direction: column; flex: 1; overflow-y: auto; min-height: 0; }
.nav-section-inner { display: flex; flex-direction: column; gap: 8px; padding: 0 20px; }
.nav-label { font-size: 11px; font-weight: 500; color: var(--text-muted); display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.search-count { color: var(--accent-info); }
.no-results { font-size: 12px; color: var(--text-muted); padding: 16px 0; }
.api-empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 24px 0; text-align: center; }
.empty-icon-small { width: 40px; height: 40px; color: var(--text-muted); }
.empty-text { font-size: 12px; color: var(--text-tertiary); line-height: 1.4; word-break: break-word; }

.nav-group { display: flex; flex-direction: column; gap: 2px; }
.nav-group + .nav-group { padding-top: 12px; }
.group-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); padding: 4px 0; }

.nav-item { display: flex; align-items: center; justify-content: space-between; padding: 0 10px; height: 32px; background-color: var(--input-bg); border-radius: var(--radius-sm); cursor: pointer; transition: background-color 0.15s; }
.nav-item:hover { background-color: var(--border-primary); }
.nav-item.active { background-color: var(--input-bg); }
.nav-item-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
.nav-item .method { font-size: 11px; font-weight: 600; flex-shrink: 0; }
.nav-item .method.get { color: var(--accent-green); }
.nav-item .method.post { color: var(--accent-info); }
.nav-item .method.put { color: var(--accent-warning); }
.nav-item .method.delete { color: var(--accent-error); }
.nav-item .path { font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nav-item.active .path { color: var(--text-primary); }
.nav-summary { font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 50%; text-align: right; }

/* Main Content */
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }

.content-toolbar { position: absolute; top: 16px; right: 32px; display: flex; justify-content: flex-end; align-items: center; gap: 8px; z-index: 10; }
.toolbar-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: transparent; border: none; border-radius: var(--radius-sm); cursor: pointer; padding: 0; transition: background-color 0.15s; }
.toolbar-btn:hover { background-color: var(--input-bg); }
.toolbar-icon { width: 18px; height: 18px; color: var(--text-secondary); }

.content-header { padding: 24px 32px; padding-right: 100px; display: flex; flex-direction: column; gap: 16px; }
.endpoint-header { display: flex; align-items: center; gap: 12px; }
.method-badge { display: flex; align-items: center; justify-content: center; padding: 0 10px; height: 28px; background-color: var(--accent-green); border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; color: #0C0C0C; }
[data-theme="light"] .method-badge { color: #FFFFFF; }
.method-badge.get { background-color: var(--accent-green); }
.method-badge.post { background-color: var(--accent-info); }
.method-badge.put { background-color: var(--accent-warning); }
.method-badge.patch { background-color: var(--accent-warning); }
.method-badge.delete { background-color: var(--accent-error); }
.endpoint-path { font-size: 20px; font-weight: 600; color: var(--text-primary); }
.endpoint-summary { font-size: 14px; font-weight: 400; color: var(--text-secondary); }
.endpoint-desc { font-size: 13px; color: var(--text-tertiary); line-height: 1.6; }
.endpoint-meta { display: flex; align-items: center; gap: 16px; }
.meta-item { display: flex; align-items: center; gap: 6px; }
.meta-label { font-size: 12px; color: var(--text-muted); }
.meta-value { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
.meta-value.auth { color: var(--accent-warning); }

.content-body-split { flex: 1; display: flex; overflow: hidden; }
.doc-panel { flex: 1; min-width: 0; padding: 0 32px 32px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; border-right: 1px solid var(--border-primary); }
.try-panel { width: 500px; flex-shrink: 0; padding: 0 32px 32px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }

.content-empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; text-align: center; padding: 40px; }
.empty-icon-large { width: 72px; height: 72px; color: var(--text-muted); margin-bottom: 8px; }
.content-empty-state .empty-title { font-size: 22px; font-weight: 600; color: var(--text-primary); margin: 0; }
.content-empty-state .empty-description { font-size: 14px; color: var(--text-tertiary); margin: 0; max-width: 450px; line-height: 1.5; }

/* Doc Panel */
.params-section { background-color: var(--surface-bg); border-radius: var(--radius-sm); padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.params-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.params-header .status-code { margin-left: auto; text-align: right; }
.params-title { font-size: 13px; font-weight: 500; color: var(--text-primary); }
.content-type-badge { font-size: 10px; font-weight: 500; color: var(--accent-info); background-color: rgba(59, 130, 246, 0.1); padding: 2px 8px; border-radius: var(--radius-sm); margin-left: 8px; font-family: 'JetBrains Mono', monospace; }
.toggle-icon { width: 16px; height: 16px; color: var(--text-muted); transition: transform 0.2s ease; cursor: pointer; }
.toggle-icon.collapsed { transform: rotate(-90deg); }
.params-table { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.param-type-header { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; padding: 8px 0 4px; }
.param-type-header.first-param-type-header { padding: 4px 0 4px; }
.param-row { display: flex; gap: 12px; padding: 4px 0; }
.param-col-left { display: flex; flex-direction: column; gap: 4px; width: 200px; min-width: 200px; flex-shrink: 0; min-height: 0; }
.param-col-right { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; padding-top: 0; min-height: 0; }
.param-name { font-size: 12px; font-weight: 500; color: var(--text-primary); line-height: 1.5; }
.param-type { font-size: 11px; font-weight: normal; color: var(--text-muted); line-height: 1.5; }
.param-type.ref-type { color: var(--accent-info); font-style: italic; }
.param-desc { font-size: 12px; font-weight: normal; color: var(--text-secondary); line-height: 1.5; }
.param-example { font-size: 11px; font-weight: normal; color: var(--text-tertiary); line-height: 1.5; }
.param-meta { font-size: 11px; font-weight: normal; color: var(--text-tertiary); line-height: 1.5; }
.param-schema-nested { margin-left: 8px; padding-left: 6px; border-left: 2px solid var(--border-primary); }
.section-desc { font-size: 12px; color: var(--text-tertiary); margin-top: -4px; }
.required { color: var(--accent-error); margin-left: 2px; }
.status-code { font-size: 12px; font-weight: 600; color: var(--text-secondary); min-width: 50px; }
.status-code.success { color: var(--accent-green); }
.status-code.redirect { color: var(--accent-info); }
.status-code.client-error { color: var(--accent-warning); }
.status-code.server-error { color: var(--accent-error); }
.response-empty { padding: 12px 0; }
.response-empty-text { font-size: 12px; color: var(--text-muted); font-style: italic; }
.response-desc { font-size: 12px; color: var(--text-tertiary); }
.response-schema { padding-left: 62px; }
.response-schema .param-row { padding: 6px 0; }

/* Try Panel */
.try-section { background-color: var(--surface-bg); border-radius: var(--radius-sm); padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.try-section-title { font-size: 13px; font-weight: 500; color: var(--text-primary); }
.try-url-display { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background-color: var(--input-bg); border-radius: var(--radius-sm); font-family: 'JetBrains Mono', monospace; font-size: 12px; }
.try-method { font-weight: 600; }
.try-method.get { color: var(--accent-green); }
.try-method.post { color: var(--accent-info); }
.try-method.put { color: var(--accent-warning); }
.try-method.delete { color: var(--accent-error); }
.try-path { color: var(--text-secondary); flex: 1; }
.param-input-row { display: flex; align-items: center; gap: 12px; }
.param-input-label { display: flex; flex-direction: column; gap: 2px; min-width: 200px; }
.param-input-name { font-size: 12px; font-weight: 500; color: var(--text-primary); }
.param-input-type { font-size: 10px; color: var(--text-muted); }
.param-input { flex: 1; padding: 6px 10px; background-color: var(--input-bg); border: 1px solid var(--border-primary); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 12px; font-family: 'JetBrains Mono', monospace; outline: none; }
.param-input:focus { border-color: var(--accent-info); }
.param-input::placeholder { color: var(--text-muted); }
.param-input-row.readonly { opacity: 0.6; }
.param-input:disabled { opacity: 0.5; cursor: not-allowed; }
.request-body-editor { width: 100%; min-height: 200px; padding: 12px; background-color: var(--input-bg); border: 1px solid var(--border-primary); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 12px; font-family: 'JetBrains Mono', monospace; outline: none; resize: vertical; }
.request-body-editor:focus { border-color: var(--accent-info); }
.send-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px; background-color: var(--accent-info); border: none; border-radius: var(--radius-sm); color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; transition: opacity 0.15s; }
.send-btn:hover { opacity: 0.9; }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.send-btn svg { width: 16px; height: 16px; }
.response-section { background-color: var(--surface-bg); border-radius: var(--radius-sm); padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.response-header { display: flex; align-items: center; justify-content: space-between; }
.response-status { font-size: 12px; font-weight: 600; }
.response-status.success { color: var(--accent-green); }
.response-status.error { color: var(--accent-error); }
.copy-btn { display: flex; align-items: center; gap: 4px; padding: 4px 8px; background-color: var(--input-bg); border: none; border-radius: var(--radius-sm); color: var(--text-secondary); font-size: 11px; cursor: pointer; }
.copy-btn:hover { background-color: var(--border-primary); }
.response-body { padding: 12px; background-color: var(--input-bg); border-radius: var(--radius-sm); font-family: 'JetBrains Mono', monospace; font-size: 12px; white-space: pre-wrap; word-break: break-all; max-height: 400px; overflow-y: auto; color: var(--text-secondary); }
.validation-error { padding: 12px; background-color: rgba(239, 68, 68, 0.1); border: 1px solid var(--accent-error); border-radius: var(--radius-sm); font-size: 12px; color: var(--accent-error); white-space: pre-wrap; }

/* Code Highlighting */
.code-keyword { color: var(--hljs-keyword); }
.code-string { color: var(--hljs-string); }
.code-number { color: var(--hljs-number); }
.code-comment { color: var(--hljs-comment); }
.code-function { color: var(--hljs-function); }

/* Theme Toggle */
.theme-toggle-btn { position: absolute; top: 16px; right: 32px; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: transparent; border: none; border-radius: var(--radius-sm); cursor: pointer; padding: 0; z-index: 10; transition: background-color 0.15s; }
.theme-toggle-btn:hover { background-color: var(--input-bg); }
.theme-toggle-btn svg { width: 18px; height: 18px; color: var(--text-secondary); }

/* Responsive */
@media (max-width: 1024px) {
  .content-body-split { flex-direction: column; }
  .doc-panel { border-right: none; border-bottom: 1px solid var(--border-primary); }
  .try-panel { width: 100%; }
}
@media (max-width: 768px) {
  .app { flex-direction: column; }
  .sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--border-primary); }
}
`
