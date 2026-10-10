<template>
  <j-modal
    title="放弃入职"
    :width="560"
    :visible="visible"
    okText="确认放弃"
    cancelText="返回"
    :confirmLoading="confirmLoading"
    :bodyStyle="{ padding: '18px 24px 8px' }"
    @ok="handleOk"
    @cancel="close">
    <div class="cancel-summary">
      确认将 <strong>{{ record.xm || '-' }}（{{ record.gh || '-' }}）</strong> 同步为放弃入职状态。
    </div>
    <a-form-model ref="form" layout="vertical" :model="model" :rules="validatorRules">
      <a-form-model-item label="放弃原因" prop="fqyy">
        <a-textarea v-model.trim="model.fqyy" :autoSize="{ minRows: 4, maxRows: 6 }" placeholder="请输入放弃入职原因" />
      </a-form-model-item>
    </a-form-model>
  </j-modal>
</template>

<script>
export default {
  name: 'OnboardingCancelModal',
  data() {
    return {
      visible: false,
      confirmLoading: false,
      record: {},
      model: {
        fqyy: ''
      },
      validatorRules: {
        fqyy: [{ required: true, message: '请填写放弃原因', trigger: 'blur' }]
      }
    }
  },
  methods: {
    open(record) {
      this.record = record || {}
      this.model = { fqyy: '' }
      this.visible = true
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    close() {
      this.visible = false
      this.confirmLoading = false
    },
    handleOk() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.confirmLoading = true
        this.$emit('ok', { record: this.record, model: Object.assign({}, this.model) })
        this.close()
      })
    }
  }
}
</script>

<style scoped>
.cancel-summary {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 4px;
  background: #fff7e6;
  color: #8c5a00;
  line-height: 1.7;
}
</style>
