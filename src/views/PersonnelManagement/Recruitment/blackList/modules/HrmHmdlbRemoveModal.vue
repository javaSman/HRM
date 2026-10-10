<template>
  <j-modal
    :title="isBatch ? '批量移出黑名单' : '移出黑名单'"
    :width="480"
    :visible="visible"
    :confirmLoading="confirmLoading"
    okText="确认移出"
    cancelText="取消"
    :bodyStyle="{ padding: '18px 24px 8px' }"
    @ok="handleOk"
    @cancel="close"
  >
    <div v-if="isBatch" class="candidate-summary">
      <strong>已选择：</strong>{{ selectedCount }} 条黑名单记录
    </div>
    <div v-else class="candidate-summary">
      <div><strong>候选人：</strong>{{ record.xm || '-' }}</div>
      <div class="summary-reason">加入原因：{{ record.jryy || '-' }}（{{ record.jrsj || '-' }} 加入）</div>
    </div>
    <a-form-model ref="form" layout="vertical" :model="form" :rules="rules">
      <a-form-model-item label="移出原因" prop="reason">
        <a-select v-model="form.reason" placeholder="请选择移出原因">
          <a-select-option v-for="item in reasonOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>
  </j-modal>
</template>

<script>
import { REMOVE_REASON_OPTIONS } from '../blackListConfig'

export default {
  name: 'HrmHmdlbRemoveModal',
  data() {
    return {
      visible: false,
      confirmLoading: false,
      isBatch: false,
      selectedCount: 0,
      record: {},
      form: { reason: undefined },
      reasonOptions: REMOVE_REASON_OPTIONS,
      rules: { reason: [{ required: true, message: '请选择移出原因', trigger: 'change' }] }
    }
  },
  methods: {
    open(record) {
      this.isBatch = false
      this.selectedCount = 0
      this.record = record || {}
      this.form = { reason: undefined }
      this.visible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    openBatch(selectedCount) {
      this.isBatch = true
      this.selectedCount = selectedCount
      this.record = {}
      this.form = { reason: undefined }
      this.visible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    handleOk() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const eventName = this.isBatch ? 'batch-ok' : 'ok'
          this.$emit(eventName, { record: this.record, reason: this.form.reason })
        }
      })
    },
    setLoading(value) {
      this.confirmLoading = value
    },
    close() {
      this.visible = false
    }
  }
}
</script>

<style scoped lang="less">
.candidate-summary { margin-bottom: 16px; padding: 14px 16px; border-radius: 6px; background: #f5f8ff; color: #333; font-size: 14px; }
.summary-reason { margin-top: 6px; color: #666; font-size: 13px; }
</style>
