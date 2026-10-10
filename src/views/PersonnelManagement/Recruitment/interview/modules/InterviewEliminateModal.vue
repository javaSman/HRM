<template>
  <j-modal
    class="recruitment-flow-modal"
    :title="title"
    :width="450"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :bodyStyle="{ padding: '20px 24px 8px' }"
    @cancel="handleCancel"
  >
    <div class="candidate-line">候选人：<strong>{{ formatValue(record.xm) }}</strong></div>
    <a-form-model ref="form" layout="vertical" :model="form" :rules="rules">
      <a-form-model-item label="淘汰原因" prop="ttyy">
        <a-textarea
          v-model.trim="form.ttyy"
          :autoSize="{ minRows: 3, maxRows: 6 }"
          placeholder="请输入淘汰原因"
        />
      </a-form-model-item>
    </a-form-model>
    <template slot="footer">
      <a-button type="danger" :loading="confirmLoading" @click="handleOk">确认淘汰</a-button>
      <a-button :disabled="confirmLoading" @click="handleCancel">取消</a-button>
    </template>
  </j-modal>
</template>

<script>
export default {
  name: 'InterviewEliminateModal',
  props: {
    visible: { type: Boolean, default: false },
    record: { type: Object, default: () => ({}) },
    confirmLoading: { type: Boolean, default: false }
  },
  data() {
    return {
      form: { ttyy: '' },
      rules: {
        ttyy: [{ required: true, message: '请填写淘汰原因', trigger: 'blur' }]
      }
    }
  },
  computed: {
    title() {
      return this.record.xm ? `淘汰候选人 - ${this.record.xm}` : '淘汰候选人'
    }
  },
  watch: {
    visible(value) {
      if (!value) return
      this.form = { ttyy: '' }
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    }
  },
  methods: {
    handleOk() {
      if (this.confirmLoading) return
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.$emit('confirm', Object.assign({}, this.form))
      })
    },
    handleCancel() {
      if (this.confirmLoading) return
      this.$emit('cancel')
    },
    formatValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    }
  }
}
</script>

<style scoped lang="less">
.candidate-line {
  margin-bottom: 16px;
  color: #595959;
  font-size: 14px;
}
</style>

<style lang="less">
@import '../../common/recruitmentModal.less';
</style>
