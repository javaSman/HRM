<template>
  <div class="json-formatter">
    <!-- 错误/空值展示普通文本 -->
    <pre v-if="isError" class="json-error">
      {{ '请输入合法的JSON字符串' }}
    </pre>
    <!-- 仅当有合法JSON且组件挂载完成后才渲染编辑器 -->
    <j-code-editor
      v-model="innerValue"
      :fullScreen="true"
      language="json"
      :languageChange="false"
      placeholder="请输入JSON格式代码"
      @change="handleEditorChange"
    ></j-code-editor>
  </div>
</template>

<script>
import JCodeEditor from '@/components/jeecg/JCodeEditor'

export default {
  name: 'JsonFormatter',
  components: {JCodeEditor},
  // 父组件传递的属性：json字符串、缩进空格数
  props: {
    // 待格式化的JSON字符串（必传）
    value: {
      type: String,
      required: true,
      default: ''
    },
    // 缩进空格数，默认2，支持数字/制表符\t
    indent: {
      type: [Number, String],
      default: 2
    }
  },
  data() {
    return {
      formattedJson: '', // 格式化后的结果（用于错误/空值展示）
      innerValue: '',    // 编辑器内部绑定的值（解决v-model覆盖问题）
      isError: true      // 是否是JSON格式错误
    }
  },
  watch: {
    // 监听父组件传值变化，重新格式化
    value: {
      immediate: true,
      handler(newVal) {
        const str = String(newVal || '')
        this.formatJson(str)
      }
    },
    // 监听缩进变化，重新格式化
    indent(newVal) {
      this.formatJson(this.value)
    }
  },
  methods: {
    /**
     * 核心格式化方法：处理异常+原生格式化
     * @param {string} str 待格式化的JSON字符串
     */
    formatJson(str) {
      // 空值处理
      if (!str.trim()) {
        this.formattedJson = ''
        this.innerValue = ''
        this.isError = true
        return
      }
      try {
        // 解析为对象，再转回格式化的字符串
        const jsonObj = JSON.parse(str)
        const formatted = JSON.stringify(jsonObj, null, this.indent)
        this.formattedJson = formatted
        this.innerValue = formatted // 同步到编辑器
        this.isError = false
      } catch (error) {
        // 捕获错误，展示错误信息
        // this.formattedJson = `JSON格式错误：${error.message}\n\n原字符串：${str}`
        this.innerValue = str // 保留原始输入，方便用户修改
        this.isError = true
      }
    },
    /**
     * 编辑器内容变化处理（核心双向绑定逻辑）
     */
    handleEditorChange() {

      // 移除所有空白字符（空格、制表符、换行符、回车等）
      const value = this.compressJsonString(this.innerValue);

      // 2. 触发input事件，实现v-model双向绑定
      this.$emit('input', value)
      // 1. 触发自定义change事件
      this.$emit('change', value)
      // 3. 对修改后的值重新格式化（可选，保持格式规范）
      this.formatJson(this.innerValue)

      // this.$message.success(this.innerValue)
    },

    compressJsonString(formattedJsonStr) {
      try {
        // 第一步：解析格式化的 JSON 字符串为 JS 对象
        const jsonObj = JSON.parse(formattedJsonStr);
        // 第二步：将对象序列化为紧凑的 JSON 字符串（无缩进、无换行）
        return  JSON.stringify(jsonObj);
      } catch (error) {
        console.error('JSON 解析失败，返回原字符串：', error.message);
        // 解析失败时返回原字符串，避免程序崩溃
        return formattedJsonStr;
      }
    }
  }
}
</script>

<style scoped>
/* 基础样式，适配代码展示 */
.json-formatter {
  width: 100%;
  box-sizing: border-box;
}
pre {
  padding: 16px;
  margin: 0;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: Consolas, Monaco, 'Courier New', monospace;
}
/* 错误样式：红底浅红，突出提示 */
.json-error {
  background: #fff5f5;
  color: #f5222d;
  border: 1px solid #ffccc7;
}
</style>