<template>
  <j-modal
    :title="title"
    :width="650"
    :visible="visible"
    switchFullscreen
    @ok="handleOk"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <hrm-txsq-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></hrm-txsq-form>
  </j-modal>
</template>

<script>
import HrmTxsqForm from './HrmTxsqForm'
export default {
  name: 'HrmTxsqModal',
  components: {
    HrmTxsqForm,
  },
  data() {
    return {
      title: '',
      width: 650,
      visible: false,
      disableSubmit: false,
    }
  },
  methods: {
    add() {
      this.title = '发起调薪'
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.add()
      })
    },
    edit(record) {
      this.title = '编辑调薪'
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.edit(record)
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
    handleOk() {
      this.$refs.realForm.submitForm()
    },
    submitCallback() {
      this.$emit('ok')
      this.visible = false
    },
    handleCancel() {
      this.close()
    },
  },
}
</script>

