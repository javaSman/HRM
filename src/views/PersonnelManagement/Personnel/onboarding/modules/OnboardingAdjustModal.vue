<template>
  <j-modal
    title="调整入职时间"
    :width="560"
    :visible="visible"
    okText="确认调整"
    cancelText="取消"
    :confirmLoading="confirmLoading"
    :bodyStyle="{ padding: '18px 24px 8px' }"
    @ok="handleOk"
    @cancel="close">
    <div class="adjust-summary">
      <div><strong>候选人：</strong>{{ record.xm || '-' }}（{{ record.gh || '-' }}）</div>
      <div><strong>当前预计入职时间：</strong>{{ record.yjrzsj || '-' }}</div>
    </div>
    <a-form-model ref="form" layout="vertical" :model="model" :rules="validatorRules">
      <a-form-model-item label="新的预计入职时间" prop="xyjrzsj">
        <a-date-picker
          v-model="model.xyjrzsj"
          valueFormat="YYYY-MM-DD"
          format="YYYY-MM-DD"
          placeholder="请选择新的入职时间"
          style="width: 100%"
          :getCalendarContainer="getPopupContainer"
        />
      </a-form-model-item>
      <a-form-model-item label="调整原因">
        <a-textarea v-model.trim="model.tzyy" :autoSize="{ minRows: 3, maxRows: 5 }" placeholder="请输入调整原因" />
      </a-form-model-item>
    </a-form-model>
  </j-modal>
</template>

<script>
export default {
  name: 'OnboardingAdjustModal',
  data() {
    return {
      visible: false,
      confirmLoading: false,
      record: {},
      model: {
        xyjrzsj: '',
        tzyy: '',
        hrmRzglId: ''
      },
      validatorRules: {
        xyjrzsj: [{ required: true, message: '请选择新的入职时间', trigger: 'change' }]
      }
    }
  },
  methods: {
    getPopupContainer(node) {
      return node.parentNode
    },
    open(record) {
      this.record = record || {}
      this.model = {
        xyjrzsj: this.record.yjrzsj || '',
        tzyy: '',
        hrmRzglId: this.record.id
      }
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
      this.$refs.form.validate((valid) => {
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
.adjust-summary {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 4px;
  background: #f5f8ff;
  color: #555;
  line-height: 1.8;
}
</style>
