<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    switchFullscreen
    cancelText="关闭"
    :bodyStyle="{ padding: '14px 24px 12px' }"
    :okText="canSwitchToEdit ? '编辑' : '确定'"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit && !canSwitchToEdit } }"
    @ok="handleOk"
    :dialogStyle="{
      top: '15px',
    }"
    @cancel="handleCancel"
  >
    <hr-employee-information-form
      :type="type"
      :constractBelongOptions="constractBelongOptions"
      :disabled="disableSubmit"
      ref="realForm"
      @ok="submitCallback"
    />
  </j-modal>
</template>

<script>
import HrEmployeeInformationForm from './HrEmployeeInformationForm.vue'
import { getAction } from '@/api/manage'

export default {
  name: 'EmployeeFormModal',
  components: {
    HrEmployeeInformationForm,
  },
  props: {
    constractBelongOptions: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      title: '新增员工',
      width: 1200,
      visible: false,
      disableSubmit: false,
      allowSwitchToEdit: true,
    }
  },
  computed: {
    canSwitchToEdit() {
      return this.disableSubmit && this.allowSwitchToEdit
    },
  },
  methods: {
    add(record) {
      this.title = '新增员工'
      this.disableSubmit = false
      this.allowSwitchToEdit = true
      this.visible = true
      const companyId = (record && record.companyId) || ''
      // 获取下一个工号
      getAction('/hr_no_config/hrNoConfig/generateNo', { companyId })
        .then((res) => {
          if (res && res.success) {
            const nextNo = res.result || ''
            this.$nextTick(() => {
              this.$refs.realForm.edit(Object.assign({ no: nextNo }, record || {}))
            })
          } else {
            this.$message.warning(res.message || '获取工号失败')
            this.$nextTick(() => {
              this.$refs.realForm.edit(record || {})
            })
          }
        })
        .catch((err) => {
          this.$message.warning((err && err.message) || '获取工号失败，请稍后重试')
          this.$nextTick(() => {
            this.$refs.realForm.edit(record || {})
          })
        })
    },
    edit(record) {
      this.title = '编辑员工'
      this.allowSwitchToEdit = true
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.edit(record || {})
      })
    },
    detail(record) {
      this.title = '员工详情'
      this.disableSubmit = true
      this.allowSwitchToEdit = false
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.edit(record || {})
      })
    },
    handleOk() {
      if (this.canSwitchToEdit) {
        this.disableSubmit = false
        this.title = '编辑员工'
        return
      }
      if (this.disableSubmit) return
      this.$refs.realForm.submitForm()
    },
    submitCallback() {
      this.$emit('ok')
      this.visible = false
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>