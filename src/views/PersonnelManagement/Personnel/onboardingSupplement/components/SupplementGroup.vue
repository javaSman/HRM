<template>
  <div class="supplement-group">
    <div v-if="repeatable && !records.length" class="supplement-empty">暂无记录，可点击下方按钮新增</div>
    <section v-for="(record, index) in recordList" :key="record.id || index" class="supplement-record">
      <div v-if="repeatable" class="supplement-record-head">
        <span>记录 {{ index + 1 }}</span>
        <a-popconfirm title="确定删除这条记录吗？" @confirm="$emit('remove', index)">
          <a-button type="link" size="small" icon="delete">删除</a-button>
        </a-popconfirm>
      </div>
      <div class="supplement-field-grid">
        <template v-for="item in fields">
          <a-form-model-item
            v-if="isFieldVisible(item, record)"
            :key="item.key"
            :label="item.label"
            :prop="getFieldProp(item, index)"
            :rules="getFieldRules(item, record)"
            :required="isFieldRequired(item, record)"
          >
          <a-input-number
            v-if="item.type === 'number'"
            v-model="record[item.key]"
            :min="item.min"
            :precision="item.precision"
            :placeholder="`请输入${item.label}`"
            :disabled="item.disabled"
            style="width: 100%"
          />
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
          <j-dict-select-tag
            v-else-if="item.type === 'dict'"
            v-model="record[item.key]"
            type="list"
            :dict-code="item.dictCode"
            :placeholder="`请选择${item.label}`"
            :disabled="item.disabled"
            @change="handleFieldChange(item, record)"
          />
          <j-date
            v-else-if="item.type === 'date' || item.type === 'datetime'"
            v-model="record[item.key]"
            :show-time="item.type === 'datetime'"
            :date-format="item.type === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'"
            :placeholder="`请选择${item.label}`"
            :disabled="item.disabled"
            style="width: 100%"
          />
          <j-image-upload
            v-else-if="item.key === 'photo'"
            v-model="record[item.key]"
            biz-path="hrmRzglSupplement"
            text="点击上传照片"
            accept=".png,.jpg,.jpeg"
            :disabled="item.disabled"
          />
          <j-upload
            v-else-if="item.type === 'upload'"
            v-model="record[item.key]"
            biz-path="hrmRzglSupplement"
            :disabled="item.disabled"
          />
          <a-input v-else v-model="record[item.key]" :placeholder="`请输入${item.label}`" :disabled="item.disabled" />
          </a-form-model-item>
        </template>
      </div>
    </section>
    <a-button v-if="repeatable" type="dashed" block icon="plus" @click="$emit('add')">新增{{ title }}记录</a-button>
  </div>
</template>

<script>
import { isFieldVisible, isFieldRequired, getFieldValidationRules } from '../fieldUtils'

export default {
  name: 'SupplementGroup',
  props: {
    title: { type: String, required: true },
    fields: { type: Array, required: true },
    fieldOptions: { type: Object, default: () => ({}) },
    fieldRules: { type: Object, default: () => ({}) },
    fieldPath: { type: String, default: '' },
    records: { type: [Array, Object], required: true },
    repeatable: { type: Boolean, default: true }
  },
  computed: {
    recordList() {
      return this.repeatable ? this.records : [this.records]
    }
  },
  methods: {
    // 导入的工具函数
    isFieldVisible,
    isFieldRequired,
    getFieldOptions(item) {
      const dynamicOptions = this.fieldOptions[item.optionsKey || item.key]
      return Array.isArray(dynamicOptions) ? dynamicOptions : (item.options || [])
    },
    getFieldProp(item, index) {
      if (!this.fieldPath) return item.key
      return this.repeatable ? `${this.fieldPath}.${index}.${item.key}` : `${this.fieldPath}.${item.key}`
    },
    getFieldRules(field, record) {
      return getFieldValidationRules(field, record, this.fieldRules[field.key] || [])
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
