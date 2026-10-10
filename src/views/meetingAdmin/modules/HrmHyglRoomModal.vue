<template>
  <a-modal
    :title="title"
    :width="560"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    :destroyOnClose="true"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="取消"
    okText="保存"
  >
    <hrm-hygl-room-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit" />
  </a-modal>
</template>

<script>
import HrmHyglRoomForm from './HrmHyglRoomForm'

export default {
  name: 'HrmHyglRoomModal',
  components: { HrmHyglRoomForm },
  data() {
    return {
      title: '',
      visible: false,
      confirmLoading: false,
      disableSubmit: false,
    }
  },
  methods: {
    add() {
      this.title = '新增会议室'
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.add()
      })
    },
    edit(record) {
      this.title = '编辑会议室'
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
