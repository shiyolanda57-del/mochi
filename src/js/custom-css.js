/*
 * =========================================================
 * YOLANDA MOCHI — GLOBAL CSS SYSTEM
 * =========================================================
 *
 * 作用：
 * 1. 用一个“全局美化 CSS”编辑器替代原 Mochi 的各种美化设置
 * 2. 移除桌面美化的颜色 / 尺寸 / 背景 / 图标 / 方案 UI
 * 3. 移除单独的深色模式入口
 * 4. 移除聊天设置里的“美化”Tab
 * 5. 移除发送按钮颜色 / 发送文字颜色
 * 6. 保留真正的功能设置和数据设置
 * 7. CSS 自动保存，刷新后继续生效
 *
 * 原 Mochi：
 * 小红书 @言序（1842523578）
 * =========================================================
 */

(function () {
  'use strict';


  /* =======================================================
     STORAGE
     ======================================================= */

  const STORE_KEY = 'user-global-css';
  const FALLBACK_KEY = 'xy-home-v2:user-global-css';

  let store = null;


  function initStore() {
    try {
      if (typeof window.xyStore === 'function') {
        store = window.xyStore('xy-home-v2');
      }
    } catch (err) {
      store = null;
    }
  }


  function readCss() {
    try {
      if (store && typeof store.get === 'function') {
        const value = store.get(STORE_KEY);

        if (typeof value === 'string') {
          return value;
        }
      }
    } catch (err) {
      /* fallback below */
    }

    try {
      return localStorage.getItem(FALLBACK_KEY) || '';
    } catch (err) {
      return '';
    }
  }


  function writeCss(css) {
    let stored = false;

    try {
      if (store && typeof store.set === 'function') {
        store.set(STORE_KEY, css);
        stored = true;
      }
    } catch (err) {
      stored = false;
    }

    try {
      localStorage.setItem(FALLBACK_KEY, css);
      stored = true;
    } catch (err) {
      /* ignore */
    }

    return stored;
  }


  function eraseCss() {
    try {
      if (store) {
        if (typeof store.remove === 'function') {
          store.remove(STORE_KEY);
        } else if (typeof store.set === 'function') {
          store.set(STORE_KEY, '');
        }
      }
    } catch (err) {
      /* ignore */
    }

    try {
      localStorage.removeItem(FALLBACK_KEY);
    } catch (err) {
      /* ignore */
    }
  }


  /* =======================================================
     USER CSS
     ======================================================= */

  function ensureUserStyle() {
    let style = document.getElementById('yolanda-global-css');

    if (!style) {
      style = document.createElement('style');
      style.id = 'yolanda-global-css';

      document.head.appendChild(style);
    }

    return style;
  }


  function applyCss(css) {
    const style = ensureUserStyle();

    style.textContent = css || '';
  }


  /* =======================================================
     REMOVE LEGACY BEAUTIFY UI
     ======================================================= */

  function removeById(id) {
    const el = document.getElementById(id);

    if (el) {
      el.remove();
    }
  }


  function removeAll(selector) {
    document
      .querySelectorAll(selector)
      .forEach(function (el) {
        el.remove();
      });
  }


  function cleanSettingsPage() {

    /*
     * 单独深色模式。
     * 以后深色主题也直接通过 CSS 控制。
     */

    removeById('row-theme-mode');


    /*
     * 保留原 row-appearance，
     * 因为 Mochi 已经给它绑定了打开 page-theme 的逻辑。
     * 只把它重新命名。
     */

    const appearanceRow =
      document.getElementById('row-appearance');

    if (appearanceRow) {

      const text =
        appearanceRow.querySelector('.txt');

      if (text) {

        text.textContent = '全局美化 CSS';

        const sub =
          document.createElement('span');

        sub.className = 'sub';

        sub.textContent =
          '粘贴 CSS，一次修改整个界面';

        text.appendChild(sub);
      }
    }
  }


  /* =======================================================
     REMOVE CHAT BEAUTIFY
     ======================================================= */

  function cleanChatSettings() {

    /*
     * 删除“美化”Tab
     */

    removeAll(
      '#cs-tabs .them-tab[data-tab="beautify"]'
    );


    /*
     * 删除整个聊天美化区域
     *
     * 包括：
     * - 聊天美化方案
     * - 聊天壁纸
     * - 气泡大小
     * - 气泡圆角
     * - 头像形状
     * - 时间轴
     * - 气泡颜色
     * - 文字颜色
     * - 气泡 CSS
     * - 全局字体
     */

    removeAll(
      '.them-sec[data-sec="beautify"]'
    );


    /*
     * 功能页成为默认 Tab
     */

    const tabs =
      document.querySelectorAll(
        '#cs-tabs .them-tab'
      );

    tabs.forEach(function (tab) {

      tab.classList.remove('active');

      if (
        tab.getAttribute('data-tab') ===
        'function'
      ) {
        tab.classList.add('active');
      }
    });


    /*
     * 显示功能设置
     */

    const functionSection =
      document.querySelector(
        '.them-sec[data-sec="function"]'
      );

    if (functionSection) {
      functionSection.hidden = false;
      functionSection.removeAttribute('hidden');
    }


    /*
     * 数据页保持隐藏，
     * 用户点“数据”再显示。
     */

    const dataSection =
      document.querySelector(
        '.them-sec[data-sec="data"]'
      );

    if (dataSection) {
      dataSection.hidden = true;
      dataSection.setAttribute('hidden', '');
    }


    /*
     * 功能页里仍然混着两个纯外观设置。
     */

    removeById('cs-send-bg');
    removeById('cs-send-ink');
  }


  /* =======================================================
     FIXED EDITOR STYLE
     ======================================================= */

  function installEditorStyle() {

    let style =
      document.getElementById(
        'yolanda-css-editor-style'
      );

    if (style) {
      return;
    }

    style = document.createElement('style');

    style.id =
      'yolanda-css-editor-style';

    style.textContent = `

      /* ================================================
         永久隐藏已经废弃的旧美化入口
         ================================================ */

      #row-theme-mode,
      #cs-send-bg,
      #cs-send-ink,
      #cs-tabs .them-tab[data-tab="beautify"],
      .them-sec[data-sec="beautify"] {
        display: none !important;
      }


      /* ================================================
         全局 CSS 页面
         ================================================ */

      #page-theme {
        background: #f6f6f7;
      }

      #page-theme > .chat-head {
        position: relative;
        z-index: 20;

        min-height: 58px;

        background: rgba(255,255,255,.96);

        border-bottom:
          1px solid rgba(0,0,0,.08);

        box-shadow: none;

        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
      }


      #yolanda-css-shell {
        width: 100%;

        height:
          calc(
            100% -
            58px
          );

        padding:
          14px
          14px
          calc(
            14px +
            env(
              safe-area-inset-bottom,
              0px
            )
          );

        display: flex;

        flex-direction: column;

        gap: 10px;

        overflow: hidden;

        background: #f6f6f7;
      }


      #yolanda-css-shell * {
        box-sizing: border-box;
      }


      /* 说明 */

      #yolanda-css-info {
        flex: 0 0 auto;

        padding:
          11px
          13px;

        border:
          1px solid
          rgba(0,0,0,.08);

        border-radius: 13px;

        background: #ffffff;

        color: #6b6b70;

        font-size: 12px;

        line-height: 1.55;
      }


      /* 输入框 */

      #yolanda-css-input {
        width: 100%;

        flex:
          1
          1
          auto;

        min-height: 260px;

        margin: 0;

        padding: 14px;

        resize: none;

        overflow:
          auto;

        border:
          1px solid
          #d7d7dc;

        border-radius: 14px;

        outline: none;

        background: #ffffff;

        color: #111111;

        font-family:
          "SFMono-Regular",
          "SF Mono",
          Menlo,
          Monaco,
          Consolas,
          "Liberation Mono",
          monospace;

        font-size: 12px;

        line-height: 1.6;

        tab-size: 2;

        white-space: pre;

        box-shadow: none;
      }


      #yolanda-css-input:focus {
        border-color: #111111;
      }


      /* 状态栏 */

      #yolanda-css-status {
        min-height: 17px;

        flex: 0 0 auto;

        padding-left: 4px;

        color: #8e8e93;

        font-size: 11px;

        line-height: 17px;
      }


      /* 按钮区域 */

      #yolanda-css-actions {
        width: 100%;

        flex: 0 0 auto;

        display: flex;

        align-items: center;

        gap: 8px;
      }


      .yolanda-css-btn {
        height: 42px;

        padding:
          0
          17px;

        border: none;

        border-radius: 999px;

        font-size: 14px;

        font-weight: 650;

        cursor: pointer;

        transition:
          transform .12s ease,
          opacity .12s ease;
      }


      .yolanda-css-btn:active {
        transform: scale(.97);
      }


      #yolanda-css-clear {
        flex: 0 0 auto;

        background: #e9e9eb;

        color: #111111;
      }


      #yolanda-css-apply {
        flex: 1 1 auto;

        background: #111111;

        color: #ffffff;
      }


      /* ================================================
         防止用户自己的 CSS
         意外把编辑器弄坏
         ================================================ */

      #yolanda-css-shell {
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
      }

      #yolanda-css-input {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }

    `;

    document.head.appendChild(style);
  }


  /* =======================================================
     BUILD GLOBAL CSS PAGE
     ======================================================= */

  function buildGlobalCssPage() {

    const page =
      document.getElementById('page-theme');

    if (!page) {
      return;
    }


    /*
     * 保留 page-theme 的顶栏。
     * 其他旧美化 DOM 全部删掉。
     */

    let header =
      page.querySelector(':scope > .chat-head');


    /*
     * 个别浏览器如果不支持 :scope，
     * 再兜底找一次。
     */

    if (!header) {
      header =
        page.querySelector('.chat-head');
    }


    /*
     * 如果原页面连顶栏都没有，
     * 自己建立一个。
     */

    if (!header) {

      header =
        document.createElement('div');

      header.className =
        'chat-head';

      header.innerHTML = `
        <span
          class="ch-back"
          id="theme-back"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </span>

        <span class="ch-name">
          全局美化 CSS
        </span>
      `;

      page.prepend(header);
    }


    /*
     * 删除 header 之外所有旧内容。
     */

    Array
      .from(page.children)
      .forEach(function (child) {

        if (child !== header) {
          child.remove();
        }
      });


    /*
     * 修改页面标题
     */

    const title =
      header.querySelector('.ch-name');

    if (title) {
      title.textContent =
        '全局美化 CSS';
    }


    /*
     * 如果编辑器已经存在，
     * 不重复生成。
     */

    if (
      document.getElementById(
        'yolanda-css-shell'
      )
    ) {
      return;
    }


    /*
     * 编辑器本体
     */

    const shell =
      document.createElement('div');

    shell.id =
      'yolanda-css-shell';


    shell.innerHTML = `

      <div id="yolanda-css-info">
        这里的 CSS 会作用于整个 Mochi。<br>
        聊天、朋友圈、桌面、设置等外观全部从这里统一修改。
      </div>


      <textarea
        id="yolanda-css-input"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
        placeholder="把 CSS 粘贴到这里……"
      ></textarea>


      <div id="yolanda-css-status"></div>


      <div id="yolanda-css-actions">

        <button
          type="button"
          class="yolanda-css-btn"
          id="yolanda-css-clear"
        >
          清空
        </button>


        <button
          type="button"
          class="yolanda-css-btn"
          id="yolanda-css-apply"
        >
          保存并应用
        </button>

      </div>
    `;


    page.appendChild(shell);


    const input =
      document.getElementById(
        'yolanda-css-input'
      );

    const applyButton =
      document.getElementById(
        'yolanda-css-apply'
      );

    const clearButton =
      document.getElementById(
        'yolanda-css-clear'
      );

    const status =
      document.getElementById(
        'yolanda-css-status'
      );


    /*
     * 加载已经保存的主题
     */

    if (input) {
      input.value =
        readCss();
    }


    function showStatus(message) {

      if (!status) {
        return;
      }

      status.textContent =
        message;

      window.clearTimeout(
        showStatus.timer
      );

      showStatus.timer =
        window.setTimeout(
          function () {
            status.textContent = '';
          },
          2200
        );
    }


    /*
     * 保存
     */

    if (applyButton && input) {

      applyButton.addEventListener(
        'click',
        function () {

          const css =
            input.value || '';

          writeCss(css);

          applyCss(css);

          showStatus(
            '已保存并应用'
          );
        }
      );
    }


    /*
     * 清空
     */

    if (clearButton && input) {

      clearButton.addEventListener(
        'click',
        function () {

          eraseCss();

          input.value = '';

          applyCss('');

          showStatus(
            '已清空，恢复原始样式'
          );
        }
      );
    }


    /*
     * Cmd/Ctrl + S
     * 也可以直接保存
     */

    if (input) {

      input.addEventListener(
        'keydown',
        function (event) {

          if (
            (event.metaKey ||
             event.ctrlKey) &&
            event.key.toLowerCase() === 's'
          ) {

            event.preventDefault();

            const css =
              input.value || '';

            writeCss(css);

            applyCss(css);

            showStatus(
              '已保存并应用'
            );
          }
        }
      );
    }
  }


  /* =======================================================
     REPAIR CHAT SETTINGS TAB
     ======================================================= */

  function repairChatTabBehaviour() {

    const tabsContainer =
      document.getElementById('cs-tabs');

    if (!tabsContainer) {
      return;
    }


    /*
     * 用事件委托保证删除“美化”后
     * 功能 / 数据仍然正常切换。
     */

    if (
      tabsContainer.dataset
        .yolandaTabsBound === '1'
    ) {
      return;
    }


    tabsContainer.dataset
      .yolandaTabsBound = '1';


    tabsContainer.addEventListener(
      'click',
      function (event) {

        const tab =
          event.target.closest(
            '.them-tab'
          );

        if (!tab) {
          return;
        }


        const name =
          tab.getAttribute(
            'data-tab'
          );

        if (!name) {
          return;
        }


        tabsContainer
          .querySelectorAll(
            '.them-tab'
          )
          .forEach(
            function (item) {
              item.classList.remove(
                'active'
              );
            }
          );


        tab.classList.add(
          'active'
        );


        document
          .querySelectorAll(
            '.them-sec[data-sec]'
          )
          .forEach(
            function (section) {

              const current =
                section.getAttribute(
                  'data-sec'
                );

              section.hidden =
                current !== name;
            }
          );
      }
    );
  }


  /* =======================================================
     FULL CLEANUP
     ======================================================= */

  function cleanup() {

    cleanSettingsPage();

    cleanChatSettings();

    installEditorStyle();

    buildGlobalCssPage();

    repairChatTabBehaviour();
  }


  /* =======================================================
     INIT
     ======================================================= */

  function init() {

    initStore();

    /*
     * 先应用主题，
     * 避免页面闪一下原样式。
     */

    applyCss(
      readCss()
    );


    cleanup();


    /*
     * Mochi 有部分页面初始化稍晚。
     * 多跑几次 cleanup，
     * 防止旧 UI 后插入回来。
     */

    window.setTimeout(
      cleanup,
      0
    );

    window.setTimeout(
      cleanup,
      250
    );

    window.setTimeout(
      cleanup,
      800
    );

    window.setTimeout(
      cleanup,
      1800
    );
  }


  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      init,
      {
        once: true
      }
    );

  } else {

    init();
  }


  /* =======================================================
     WHEN OPENING APPEARANCE PAGE
     ======================================================= */

  document.addEventListener(
    'click',
    function (event) {

      const appearance =
        event.target.closest(
          '#row-appearance'
        );

      if (appearance) {

        window.setTimeout(
          function () {

            cleanup();

            const input =
              document.getElementById(
                'yolanda-css-input'
              );

            if (input) {
              input.value =
                readCss();
            }

          },
          30
        );
      }
    }
  );

})();
