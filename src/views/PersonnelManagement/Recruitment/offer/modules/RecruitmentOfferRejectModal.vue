<template>
  <j-modal
    title="拒绝Offer"
    :width="520"
    :visible="visible"
    :bodyStyle="{ padding: '18px 24px 8px' }"
    @cancel="handleCancel">
    <div class="candidate-info">
      候选人：<strong>{{ record.xm || '-' }}</strong>
    </div>
    <a-alert
      type="warning"
      showIcon
      message="拒绝后该Offer将标记为“已拒绝”状态"
      class="reject-alert" />
    <a-form-model layout="vertical">
      <a-form-model-item label="拒绝原因" required>
        <a-textarea
          v-model="reason"
          :autoSize="{ minRows: 4, maxRows: 6 }"
          placeholder="请输入拒绝原因" />
      </a-form-model-item>
    </a-form-model>
    <template slot="footer">
      <a-button type="danger" :loading="submitting" @click="handleSubmit">确认拒绝</a-button>
      <a-button :disabled="submitting" @click="handleCancel">取消</a-button>
    </template>
  </j-modal>
</template>

<script>
export default {
  name: 'RecruitmentOfferRejectModal',
  props: {
    submitting: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,
      record: {},
      reason: ''
    }
  },
  methods: {
    open(record) {
      this.record = record || {}
      this.reason = ''
      this.visible = true
    },
    close() {
      this.visible = false
      this.record = {}
      this.reason = ''
    },
    handleCancel() {
      if (this.submitting) {
        return
      }
      this.close()
    },
    handleSubmit() {
      if (this.submitting) {
        return
      }
      const reason = this.reason.trim()
      if (!reason) {
        this.$message.warning('请填写拒绝原因')
        return
      }
      this.$emit('ok', { record: this.record, reason })
    }
  }
}
</script>

<style scoped>
.candidate-info {
  margin-bottom: 16px;
  color: #262626;
  font-size: 14px;
}

.reject-alert {
  margin-bottom: 16px;
}
</style>
