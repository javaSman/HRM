<template>
  <a-modal
    title="修改接待人"
    :width="420"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="取消"
  >
    <a-form :form="form">
      <a-form-item label="请选择新接待人">
        <j-select-employee
          v-decorator="['jdr', { rules: [{ required: true, message: '请选择新的接待人' }] }]"
          placeholder="请选择接待人"
          value-field="name"
          :multiple="false"
          :buttonShow="false"
          @change="handleReceiverChange"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { putAction } from '@/api/manage'

export default {
  name: 'VisitorChangeReceiver',
  data() {
    return {
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      model: {},
    }
  },
  methods: {
    show(record) {
      this.visible = true
      this.model = { ...record }
      this.$nextTick(() => {
        this.form.resetFields()
        this.form.setFieldsValue({
          jdr: record.jdr || '',
        })
      })
    },
    // 接待人选择变化
    handleReceiverChange(value, rows) {
      if (rows && rows.length > 0) {
        var selected = rows[0]
        this.model.jdrlxfs = selected.phoneNumber || ''
      } else {
        this.model.jdrlxfs = ''
      }
    },
    handleOk() {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          this.confirmLoading = true
          var params = {
            ...this.model,
            jdr: values.jdr,
            jdrlxfs: this.model.jdrlxfs || '',
          }
          putAction('/fkzx/hrmFkzxSq/edit', params)
            .then((res) => {
              if (res.success) {
                this.$message.success('修改接待人成功')
                this.visible = false
                this.$emit('ok')
              } else {
                this.$message.warning(res.message || '修改接待人失败')
              }
            })
            .catch(() => {
              this.$message.error('修改接待人失败')
            })
            .finally(() => {
              this.confirmLoading = false
            })
        }
      })
    },
    handleCancel() {
      this.visible = false
      this.form.resetFields()
    },
  },
}
</script>

