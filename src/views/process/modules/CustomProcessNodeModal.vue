<template>
  <j-modal
    :title="title"
    :width="760"
    :visible="visible"
    :confirmLoading="confirmLoading"
    switchFullscreen
    :dialogStyle="{ top: '20px' }"
    wrapClassName="custom-process-node-modal"
    @ok="handleOk"
    @cancel="handleCancel">
    <custom-process-node-form ref="nodeForm" :bmid="bmid" />
  </j-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
import CustomProcessNodeForm from './CustomProcessNodeForm.vue'

export default {
  name: 'CustomProcessNodeModal',
  components: {
    CustomProcessNodeForm
  },
  props: {
    bmid: {
      type: String,
      required: false,
      default: ''
    }
  },
  data() {
    return {
      title: '新增流程节点',
      visible: false,
      confirmLoading: false,
      url: {
        add: '/process/customProcessConfiguration/add',
        edit: '/process/customProcessConfiguration/edit'
      }
    }
  },
  methods: {
    add(defaults = {}) {
      this.title = '新增流程节点'
      this.visible = true
      this.$nextTick(() => {
        this.$refs.nodeForm.add(defaults)
      })
    },
    edit(record) {
      this.title = '编辑流程节点'
      this.visible = true
      this.$nextTick(() => {
        this.$refs.nodeForm.edit(record)
      })
    },
    handleCancel() {
      this.visible = false
    },
    handleOk() {
      this.$refs.nodeForm.validateAndBuild((valid, payload) => {
        if (!valid) {
          return
        }
        const isEdit = !!payload.id
        const requestUrl = isEdit ? this.url.edit : this.url.add
        const requestMethod = isEdit ? 'put' : 'post'

        this.confirmLoading = true
        httpAction(requestUrl, payload, requestMethod)
          .then((res) => {
            if (!res.success) {
              this.$message.warning(res.message)
              return
            }
            this.$message.success(res.message || (isEdit ? '编辑成功' : '新增成功'))
            this.visible = false
            this.$emit('ok')
          })
          .catch(() => {
            this.$message.error('节点保存失败，请稍后重试')
          })
          .finally(() => {
            this.confirmLoading = false
          })
      })
    }
  }
}
</script>
