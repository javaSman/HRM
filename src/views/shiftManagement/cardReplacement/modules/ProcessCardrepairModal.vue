<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    switchFullscreen
    @ok="handleOk"
    :dialogStyle="{
      top:'30px'
    }"
    :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
    @cancel="handleCancel"
    cancelText="关闭">
    <process-cardrepair-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></process-cardrepair-form>
  </j-modal>
</template>

<script>

  import ProcessCardrepairForm from './ProcessCardrepairForm'
  export default {
    name: 'ProcessCardrepairModal',
    components: {
      ProcessCardrepairForm
    },
    data () {
      return {
        title: '',
        width: 1180,
        visible: false,
        disableSubmit: false
      }
    },
    methods: {
      add () {
        this.visible = true
        this.$nextTick(() => {
          this.$refs.realForm.add()
        })
      },
      edit (record) {
        this.visible = true
        this.$nextTick(() => {
          this.$refs.realForm.edit(record)
        })
      },
      close () {
        this.$emit('close')
        this.visible = false
      },
      handleOk () {
        this.$refs.realForm.submitForm()
      },
      submitCallback() {
        this.$emit('ok')
        this.visible = false
      },
      handleCancel () {
        this.close()
      }
    }
  }
</script>
