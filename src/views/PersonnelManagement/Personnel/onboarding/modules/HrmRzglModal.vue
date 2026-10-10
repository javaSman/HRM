<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    switchFullscreen
    :dialogStyle="{
      top:'15px'
}"
    :bodyStyle="bodyStyle"
    @ok="handleOk"
    :okText="canSwitchToEdit ? '编辑' : '确定'"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit && !canSwitchToEdit } }"
    @cancel="handleCancel"
    cancelText="关闭">
    <hrm-rzgl-form ref="realForm" :disabled="disableSubmit" @ok="submitCallback" />
  </j-modal>
</template>

<script>

  import HrmRzglForm from './HrmRzglForm.vue'
  export default {
    name: 'HrmRzglModal',
    components: {
      HrmRzglForm
    },
    data () {
      return {
        title: '',
        width: 1000,
        visible: false,
        disableSubmit: false,
        recordStatus: '',
        bodyStyle: { maxHeight: 'calc(100vh - 170px)', overflowY: 'auto', padding: '18px 24px 8px' }
      }
    },
    computed: {
      canSwitchToEdit () {
        return this.disableSubmit && this.recordStatus === '待入职'
      }
    },
    methods: {
      add () {
        this.title = '入职办理'
        this.disableSubmit = false
        this.recordStatus = ''
        this.visible = true
        this.$nextTick(() => {
          this.$refs.realForm.add()
        })
      },
      edit (record) {
        this.recordStatus = record && record.rzzt ? record.rzzt : ''
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
        if (this.canSwitchToEdit) {
          this.disableSubmit = false
          this.title = '编辑'
          return
        }
        if (this.disableSubmit) return
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
