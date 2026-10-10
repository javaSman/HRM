<template>
  <div class="approval-card">
    <div class="approval-flow">
      <a-form-model-item prop="approveCode" class="approver-form-item">
        <div class="approver-row">
          <label class="approver-label"><a-icon type="user" /> 审批人</label>
          <div class="approver-tags">
            <a-tag
              v-for="item in sprTags"
              :key="item.value"
              class="employee-tag-item"
              closable
              @close.prevent="handleTagClose('spr', item.value)"
            >{{ item.text }}</a-tag>
          </div>
          <div class="approver-action">
            <j-select-employee
              v-model="form.approveCode"
              placeholder="请选择审批人"
              value-field="no"
              button-only
              button-text="添加审批人"
              button-icon="plus"
              button-type="default"
              :multiple="true"
              @change="(val, rows) => handleEmployeeChange('spr', val, rows)"
            />
          </div>
        </div>
      </a-form-model-item>
      <a-form-model-item prop="ccCode" class="approver-form-item">
        <div class="approver-row">
          <label class="approver-label"><a-icon type="user" /> 抄送人</label>
          <div class="approver-tags">
            <a-tag
              v-for="item in csrTags"
              :key="item.value"
              class="employee-tag-item"
              closable
              @close.prevent="handleTagClose('csr', item.value)"
            >{{ item.text }}</a-tag>
          </div>
          <div class="approver-action">
            <j-select-employee
              v-model="form.ccCode"
              placeholder="请选择抄送人"
              value-field="no"
              button-only
              button-text="添加抄送人"
              button-icon="plus"
              button-type="default"
              :multiple="true"
              @change="(val, rows) => handleEmployeeChange('csr', val, rows)"
            />
          </div>
        </div>
      </a-form-model-item>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApprovalCcFields',
  props: {
    form: { type: Object, required: true }
  },
  computed: {
    sprTags() {
      return this.buildTags(this.form.approveCode, this.form.approveName)
    },
    csrTags() {
      return this.buildTags(this.form.ccCode, this.form.ccName)
    }
  },
  methods: {
    buildTags(codeStr, nameStr) {
      const codes = this.splitList(codeStr)
      const names = this.splitList(nameStr)
      return codes.map((code, i) => {
        const name = names[i] || ''
        const text = name ? (name + '（' + code + '）') : code
        return { value: code, text }
      })
    },
    splitList(val) {
      if (val === undefined || val === null || val === '') return []
      return String(val).split(',').map(s => s.trim()).filter(Boolean)
    },
    handleEmployeeChange(field, value, rows) {
      const codes = this.splitList(value)
      const names = (rows || []).map(r => r.name || r.realname || '').filter(Boolean)
      if (field === 'spr') {
        this.form.approveCode = codes.join(',')
        this.form.approveName = names.join(',')
      } else {
        this.form.ccCode = codes.join(',')
        this.form.ccName = names.join(',')
      }
      this.$emit('change')
    },
    handleTagClose(field, tagValue) {
      if (field === 'spr') {
        this.removeTag('approveCode', 'approveName', tagValue)
      } else {
        this.removeTag('ccCode', 'ccName', tagValue)
      }
      this.$emit('change')
    },
    removeTag(codeField, nameField, tagValue) {
      const codes = this.splitList(this.form[codeField])
      const names = this.splitList(this.form[nameField])
      const idx = codes.indexOf(tagValue)
      if (idx > -1) {
        codes.splice(idx, 1)
        if (idx < names.length) names.splice(idx, 1)
      }
      this.form[codeField] = codes.join(',')
      this.form[nameField] = names.join(',')
    }
  }
}
</script>

<style lang="less" scoped>
@sqgl-primary: #2563eb;
@sqgl-primary-rgb: 37, 99, 235;
@sqgl-border: #e2e8f0;
@sqgl-foreground: #1a2a3d;

.approval-card {
  margin-top: 14px;
  border: 1px solid @sqgl-border;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  border-left: 3px solid @sqgl-primary;
}
.approval-flow {
  padding: 0 16px;
}
// 审批/抄送行紧贴排列，错误提示在行下方显示
.approver-form-item {
  margin-bottom: 0 !important;
}
.approver-form-item:last-child .approver-row {
  border-bottom: none;
}
.approver-row {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid @sqgl-border;
  font-size: 13px;
  color: @sqgl-foreground;
}
.approver-label {
  display: flex;
  flex-shrink: 0;
  font-weight: 600;
  gap: 2px;
  height: 32px;
  color: @sqgl-foreground;
  white-space: nowrap;
  align-items: center;
  margin-right: 10px;
}
.approver-tags {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 32px;
  align-content: center;
}
.employee-tag-item {
  margin: 0;
  border-radius: 4px;
  background: rgba(@sqgl-primary-rgb, 0.08);
  border-color: rgba(@sqgl-primary-rgb, 0.25);
  color: @sqgl-primary;
}
.approver-action {
  flex-shrink: 0;
  margin-left: 12px;
}
/deep/ .j-select-employee-button-only .ant-btn {
  border-radius: 6px;
  font-size: 13px;
  color: @sqgl-foreground;
  border: 1px solid @sqgl-border;
  background: #fff;
  height: 32px;
}
/deep/ .j-select-employee-button-only .ant-btn:hover {
  background: rgba(@sqgl-primary-rgb, 0.04);
  color: @sqgl-primary;
  border-color: rgba(@sqgl-primary-rgb, 0.25);
}
</style>
