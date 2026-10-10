<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    :confirmLoading="confirmLoading"
    switchFullscreen
    @ok="handleOk"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }"
    @cancel="handleCancel">
    <custom-process-form :treeData="treeData" ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></custom-process-form>
  </j-modal>
</template>

<script>
import { getAction } from '@/api/manage'
import CustomProcessForm from './CustomProcessForm.vue'

export default {
  name: 'ProcessModal',
  components: {
    CustomProcessForm,
  },
  props:{
    treeData:{
      type:Array,
      default:()=>[]
    }
  },
  data() {
    return {
      title: '',
      width: 800,
      visible: false,
      confirmLoading: false,
      disableSubmit: false,
    }
  },
  methods: {
    add(id) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.add(id)
      })
    },
    edit(record) {
      this.visible = true
      this.$nextTick(() => {
        if (!record || !record.id) {
          this.$refs.realForm.edit(record || {})
          return
        }
        this.confirmLoading = true
        getAction(this.$refs.realForm.url.queryById, { id: record.id })
          .then((res) => {
            if (res.success && res.result) {
              this.$refs.realForm.edit(res.result)
            } else {
              this.$refs.realForm.edit(record)
              this.$message.warning(res.message)
            }
          })
          .finally(() => {
            this.confirmLoading = false
          })
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
