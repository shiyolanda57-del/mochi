// ===== Yolanda 版：全局 CSS 编辑器 =====
// 保留 Mochi 原功能代码，只把“手机桌面美化”界面替换为一个全局 CSS 输入框。
// CSS 全局通用、自动保存，刷新后继续生效。

(function () {
  const STORE_KEY = 'user-global-css';
  const FALLBACK_KEY = 'xy-home-v2:user-global-css';

  let gStore = null;

  try {
    if (window.xyStore) {
      gStore = window.xyStore('xy-home-v2');
    }
  } catch (e) {}

  function getCss() {
    try {
      if (gStore) return gStore.get(STORE_KEY) || '';
    } catch (e) {}

    try {
      return localStorage.getItem(FALLBACK_KEY) || '';
    } catch (e) {}

    return '';
  }

  function saveCss(css) {
    try {
      if (gStore) {
        gStore.set(STORE_KEY, css);
        return;
      }
    } catch (e) {}

    try {
      localStorage.setItem(FALLBACK_KEY, css);
    } catch (e) {}
  }

  function clearCss() {
    try {
      if (gStore) gStore.remove(STORE_KEY);
    } catch (e) {}

    try {
      localStorage.removeItem(FALLBACK_KEY);
    } catch (e) {}
  }

  function toast(msg) {
    try {
      if (window.toast) {
        window.toast(msg);
        return;
      }
    } catch (e) {}

    console.log(msg);
  }

  function ensureStyle() {
    let style = document.getElementById('user-global-css-style');

    if (!style) {
      style = document.createElement('style');
      style.id = 'user-global-css-style';
      document.head.appendChild(style);
    }

    return style;
  }

  function applyCss(css) {
    const style = ensureStyle();
    style.textContent = css || '';
  }

  // 一打开网站就应用之前保存的 CSS
  applyCss(getCss());

  function mountEditor() {
    const page = document.getElementById('page-theme');

    if (!page) return;

    /*
     * 保留原来的返回栏。
     * 颜色 / 尺寸 / 背景 / 图标 / 方案等原 UI 全部从 DOM 移除。
     * personalize.js 本身仍保留，避免误伤别的功能。
     */
    const head = page.querySelector('.chat-head');

    Array.from(page.children).forEach(function (child) {
      if (child !== head) child.remove();
    });

    // 改标题
    const title = head && head.querySelector('.ch-name');
    if (title) title.textContent = '自定义 CSS';

    // 设置页入口改名
    const appearanceRow = document.getElementById('row-appearance');

    if (appearanceRow) {
      const txt = appearanceRow.querySelector('.txt');

      if (txt) {
        txt.innerHTML =
          '自定义 CSS' +
          '<span class="sub">粘贴代码，一键修改整个界面</span>';
      }
    }

    // CSS 编辑器自己的固定样式
    const editorStyle = document.createElement('style');
    editorStyle.id = 'custom-css-editor-style';

    editorStyle.textContent = `
      #custom-css-shell {
        box-sizing: border-box;
        width: 100%;
        height: calc(100% - 58px);
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: #f7f7f8;
      }

      #custom-css-shell * {
        box-sizing: border-box;
      }

      #custom-css-help {
        flex: 0 0 auto;
        padding: 12px 14px;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        background: #fff;
        color: #6b7280;
        font-size: 12px;
        line-height: 1.6;
      }

      #global-css-input {
        width: 100%;
        flex: 1 1 auto;
        min-height: 320px;
        resize: none;
        padding: 14px;
        border: 1px solid #dfe3e8;
        border-radius: 14px;
        outline: none;
        background: #fff;
        color: #111;
        font-family:
          "SFMono-Regular",
          Consolas,
          "Liberation Mono",
          monospace;
        font-size: 12px;
        line-height: 1.65;
        white-space: pre;
        overflow: auto;
      }

      #global-css-input:focus {
        border-color: #111;
      }

      .custom-css-actions {
        flex: 0 0 auto;
        display: flex;
        gap: 8px;
      }

      .custom-css-btn {
        min-height: 42px;
        border: none;
        border-radius: 999px;
        padding: 0 18px;
        font-size: 14px;
        font-weight: 650;
        cursor: pointer;
      }

      #global-css-apply {
        flex: 1;
        background: #111;
        color: #fff;
      }

      #global-css-clear {
        background: #e9e9eb;
        color: #111;
      }
    `;

    document.head.appendChild(editorStyle);

    const shell = document.createElement('div');
    shell.id = 'custom-css-shell';

    shell.innerHTML = `
      <div id="custom-css-help">
        这里的 CSS 会作用于整个 Mochi。<br>
        聊天气泡、朋友圈、桌面、设置页都可以一起修改。
        保存后刷新仍然生效。
      </div>

      <textarea
        id="global-css-input"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        placeholder="把 CSS 粘贴到这里…"
      ></textarea>

      <div class="custom-css-actions">
        <button
          type="button"
          class="custom-css-btn"
          id="global-css-clear"
        >清空</button>

        <button
          type="button"
          class="custom-css-btn"
          id="global-css-apply"
        >保存并应用</button>
      </div>
    `;

    page.appendChild(shell);

    const input = document.getElementById('global-css-input');
    const applyBtn = document.getElementById('global-css-apply');
    const clearBtn = document.getElementById('global-css-clear');

    input.value = getCss();

    applyBtn.addEventListener('click', function () {
      const css = input.value || '';

      saveCss(css);
      applyCss(css);

      toast('CSS 已保存并应用');
    });

    clearBtn.addEventListener('click', function () {
      clearCss();
      input.value = '';
      applyCss('');

      toast('已恢复原始样式');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountEditor);
  } else {
    mountEditor();
  }
})();
