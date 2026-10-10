<template>
  <div class="textWrap" :class="[inversion ? 'self' : 'chatgpt']" ref="textRef">
    <div v-if="!inversion">
      <div class="markdown-body" :class="{ 'markdown-body-generate': loading }" v-html="processedText" />
    </div>
    <div v-else class="msg" v-text="text" />
  </div>
</template>

<script>
import MarkdownIt from 'markdown-it';
import mdKatex from '@traptitech/markdown-it-katex';
import mila from 'markdown-it-link-attributes';
import hljs from 'highlight.js';

export default {
  name: 'ChatText',
  props: {
    text: {
      type: String,
      default: ''
    },
    inversion: {
      type: Boolean,
      default: false
    },
    error: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      mdi: new MarkdownIt({
        html: false,
        linkify: true,
        highlight: (code, language) => {
          const validLang = !!(language && hljs.getLanguage(language));
          if (validLang) {
            const lang = language || '';
            return this.highlightBlock(hljs.highlight(code, { language: lang }).value, lang);
          }
          return this.highlightBlock(hljs.highlightAuto(code).value, '');
        }
      })
    };
  },
  computed: {
    processedText() {
      const value = this.text || '';
      if (!this.inversion) return this.mdi.render(value);
      return value;
    }
  },
  mounted() {
    this.initializeMarkdown();
    this.addCopyEvents();
  },
  updated() {
    this.addCopyEvents();
  },
  beforeDestroy() {
    this.removeCopyEvents();
  },
  methods: {
    initializeMarkdown() {
      this.mdi.use(mila, { attrs: { target: '_blank', rel: 'noopener' } });
      this.mdi.use(mdKatex, {
        blockClass: 'katexmath-block rounded-md p-[10px]',
        errorColor: ' #cc0000'
      });
    },
    highlightBlock(str, lang) {
      return `<pre class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-block-header__lang">${lang}</span>
          <span class="code-block-header__copy">复制代码</span>
        </div>
        <code class="hljs code-block-body ${lang}">${str}</code>
      </pre>`;
    },
    addCopyEvents() {
      if (this.$refs.textRef) {
        const copyBtns = this.$refs.textRef.querySelectorAll('.code-block-header__copy');
        copyBtns.forEach(btn => {
          btn.addEventListener('click', this.handleCopyClick);
        });
      }
    },
    removeCopyEvents() {
      if (this.$refs.textRef) {
        const copyBtns = this.$refs.textRef.querySelectorAll('.code-block-header__copy');
        copyBtns.forEach(btn => {
          btn.removeEventListener('click', this.handleCopyClick);
        });
      }
    },
    handleCopyClick(event) {
      const parent = event.currentTarget.parentElement;
      var code = parent && parent.nextElementSibling && parent.nextElementSibling.textContent;
      if (code) {
        this.copyToClip(code).then(() => {
          event.currentTarget.textContent = '复制成功';
          setTimeout(() => {
            event.currentTarget.textContent = '复制代码';
          }, 1000);
        });
      }
    },
    copyToClip(text) {
      return new Promise((resolve, reject) => {
        try {
          const input = document.createElement('textarea');
          input.setAttribute('readonly', 'readonly');
          input.value = text;
          document.body.appendChild(input);
          input.select();
          if (document.execCommand('copy')) {
            document.execCommand('copy');
          }
          document.body.removeChild(input);
          resolve(text);
        } catch (error) {
          reject(error);
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>

.textWrap {
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;

  --ds-font-size-l: 16px;  // 声明设计系统字体大小变量
  --ds-line-height-l: 28px; // 同时声明对应的行高变量（根据你的设计系统需要）

  &.self {
    font-size: var(--ds-font-size-l);
    line-height: var(--ds-line-height-l);
    color: #262626;
    padding: calc((44px - var(--ds-line-height-l)) / 2) 20px;
    box-sizing: border-box;
    white-space: pre-wrap;
    word-break: break-word;
    background-color: #eff6ff;
    border-radius: 14px;
    max-width: calc(100% - 48px);
    position: relative
  }

  &.chatgpt {
    background-color: #f4f6f8;
    font-size: var(--ds-font-size-l);
    line-height: var(--ds-line-height-l);
  }
}

.markdown-body {
  :deep(pre) {
    margin: 0.5em 0;
    padding: 0.5em;
  }

  :deep(code) {
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }

  :deep(.code-block-wrapper) {
    position: relative;
    margin: 1em 0;
    border-radius: 4px;
    overflow: hidden;
  }

  :deep(.code-block-header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5em 1em;
    background-color: rgba(0,0,0,0.05);
  }

  :deep(.code-block-header__copy) {
    cursor: pointer;
    color: #666;
    &:hover {
      color: @primary-color;
    }
  }

  :deep(.code-block-body) {
    padding: 1em;
    overflow-x: auto;
  }
}
</style>