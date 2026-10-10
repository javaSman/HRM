<template>
  <div class="jbxx-category-section">
    <!-- 分类标题区 -->
    <div class="category-header">
      <div class="category-title">
        <span class="title-bar"></span>
        {{ title }}
      </div>
      <div v-if="description" class="category-description">{{ description }}</div>
    </div>

    <!-- 字段网格区 -->
    <div class="supplement-field-grid">
      <template v-for="item in fields">
        <a-form-model-item
          v-if="isFieldVisible(item, record)"
          :key="item.key"
          :label="item.label"
          :prop="getFieldProp(item)"
          :rules="getFieldRules(item)"
          :required="isFieldRequired(item, record)"
        >
          <!-- 数字输入框 -->
          <a-input-number
            v-if="item.type === 'number'"
            v-model="record[item.key]"
            :min="item.min"
            :precision="item.precision"
            :placeholder="`请输入${item.label}`"
            :disabled="item.disabled"
            style="width: 100%"
          />
          <!-- 下拉选择框 -->
          <a-select
            v-else-if="item.type === 'select'"
            v-model="record[item.key]"
            allow-clear
            :placeholder="`请选择${item.label}`"
            :disabled="item.disabled"
            @change="handleFieldChange(item, record)"
          >
            <a-select-option v-for="option in getFieldOptions(item)" :key="option.value" :value="option.value">
              {{ option.label }}
            </a-select-option>
          </a-select>
          <!-- 字典选择框 -->
          <j-dict-select-tag
            v-else-if="item.type === 'dict'"
            v-model="record[item.key]"
            type="list"
            :dict-code="item.dictCode"
            :placeholder="`请选择${item.label}`"
            :disabled="item.disabled"
            @change="handleFieldChange(item, record)"
          />
          <!-- 日期/日期时间选择器 -->
          <j-date
            v-else-if="item.type === 'date' || item.type === 'datetime'"
            v-model="record[item.key]"
            :show-time="item.type === 'datetime'"
            :date-format="item.type === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'"
            :placeholder="`请选择${item.label}`"
            :disabled="item.disabled"
            style="width: 100%"
          />
          <!-- 员工照片上传（特殊处理） -->
          <j-image-upload
            v-else-if="item.key === 'photo'"
            v-model="record[item.key]"
            biz-path="hrmRzglSupplement"
            text="点击上传照片"
            accept=".png,.jpg,.jpeg"
            :disabled="item.disabled"
          />
          <!-- 文件上传 -->
          <j-upload
            v-else-if="item.type === 'upload'"
            v-model="record[item.key]"
            biz-path="hrmRzglSupplement"
            :disabled="item.disabled"
          />
          <!-- 默认文本输入框 -->
          <a-input v-else v-model="record[item.key]" :placeholder="`请输入${item.label}`" :disabled="item.disabled" />
        </a-form-model-item>
      </template>
    </div>
  </div>
</template>

<script>
import { isFieldVisible, isFieldRequired, getFieldValidationRules } from '../fieldUtils'

export default {
  name: 'JbxxCategorySection',
  props: {
    // 分类标题
    title: {
      type: String,
      required: true
    },
    // 分类说明
    description: {
      type: String,
      default: ''
    },
    // 字段配置数组
    fields: {
      type: Array,
      required: true
    },
    // 动态选项
    fieldOptions: {
      type: Object,
      default: () => ({})
    },
    // 字段验证规则
    fieldRules: {
      type: Object,
      default: () => ({})
    },
    // 数据记录对象（基本信息 jbxx）
    record: {
      type: Object,
      required: true
    }
  },
  methods: {
    // 导入的工具函数
    isFieldVisible,
    isFieldRequired,
    // 获取字段选项
    getFieldOptions(item) {
      const dynamicOptions = this.fieldOptions[item.optionsKey || item.key]
      return Array.isArray(dynamicOptions) ? dynamicOptions : (item.options || [])
    },
    // 获取字段属性路径
    getFieldProp(item) {
      return `jbxx.${item.key}`
    },
    // 获取字段验证规则
    getFieldRules(field) {
      return getFieldValidationRules(field, this.record, this.fieldRules[field.key] || [])
    },
    /**
     * 处理字段值变化
     * 当字段值变化时，清空依赖该字段的其他字段的值（如果它们应该隐藏）
     */
    handleFieldChange(changedField, record) {
      // 遍历所有字段，找出依赖当前字段的字段
      this.fields.forEach(field => {
        if (field.dependsOn && field.dependsOn.field === changedField.key) {
          // 检查该字段是否应该隐藏
          if (!this.isFieldVisible(field, record)) {
            // 清空该字段的值
            this.$set(record, field.key, undefined)
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.jbxx-category-section {
  background: #fff;
  border-radius: 12px;
  padding: 12px 12px 4px;
  margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  .category-header {
    margin-bottom: 10px;

    .category-title {
      font-size: 12px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;

      .title-bar {
        width: 3px;
        height: 12px;
        background: #4A7BF7;
        border-radius: 2px;
        display: inline-block;
      }
    }

    .category-description {
      font-size: 11px;
      color: #999;
    }
  }

  // 复用父级的字段网格样式
  .supplement-field-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 8px;
  }
}
</style>
