<template>
  <a-modal
    title="确认来访"
    :width="440"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-form :form="form" layout="vertical">
      <a-form-item label="确认人">
        <j-select-employee
          v-decorator="['qrr', { rules: [{ required: true, message: '请选择确认人' }] }]"
          placeholder="请选择确认人"
          value-field="name"
          :multiple="false"
          :buttonShow="false"
        />
      </a-form-item>
      <a-form-item label="来访确认时间">
        <a-date-picker
          v-decorator="['lfqrsj', { rules: [{ required: true, message: '请选择来访确认时间' }] }]"
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择来访确认时间"
          style="width: 100%"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { formatDate } from '@/utils/util.js'
export default {
  name: 'VisitorConfirmVisit',
  data() {
    return {
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      record: {},
    }
  },
  methods: {
    show(record) {
      this.record = record || {}
      this.visible = true
      this.form.resetFields()
      this.$nextTick(() => {
        // 默认确认人为当前用户
        var currentUser = this.$store.getters.userInfo
        var realname = currentUser.realname || ''
        console.log(realname)
        // 默认来访确认时间为当前时间
        this.form.setFieldsValue({
          qrr: realname,
          lfqrsj: formatDate(Date.now(), 'yyyy-MM-dd hh:mm'),
        })
      })
    },
    handleOk() {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.confirmLoading = true
          this.$http
            .post('/fkzx/hrmFkzxSq/edit', {
              ...this.record,
              qrr: values.qrr,
              lfqrsj: values.lfqrsj,
              lfzt: 1,
            })
            .then((res) => {
              if (res.success) {
                this.$message.success('确认来访成功')
                this.visible = false
                this.$emit('ok')
              } else {
                this.$message.warning(res.message || '确认来访失败')
              }
            })
            .catch(() => {
              this.$message.error('确认来访失败')
            })
            .finally(() => {
              this.confirmLoading = false
            })
        }
      })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

