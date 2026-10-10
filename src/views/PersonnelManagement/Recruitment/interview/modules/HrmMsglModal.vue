<template>
  <j-modal
    class="recruitment-flow-modal"
    :title="title"
    :width="width"
    :visible="visible"
    switchFullscreen
    :bodyStyle="modalBodyStyle"
    :dialogStyle="{ top: '16px' }"
    @cancel="handleCancel">
    <hrm-msgl-form ref="realForm" :disabled="disableSubmit" @ok="submitCallback"></hrm-msgl-form>
    <template slot="footer">
      <a-button v-if="!disableSubmit" type="primary" @click="handleOk">{{ submitText }}</a-button>
      <a-button @click="handleCancel">{{ disableSubmit ? '关闭' : '取消' }}</a-button>
    </template>
  </j-modal>
</template>

<script>
import HrmMsglForm from './HrmMsglForm'

export default {
  name: 'HrmMsglModal',
  components: {
    HrmMsglForm
  },
  data() {
    return {
      title: '新增面试',
      width: 920,
      visible: false,
      disableSubmit: false,
      submitText: '保存',
      modalBodyStyle: {
        maxHeight: 'calc(100vh - 168px)',
        overflowY: 'auto',
        padding: '16px 24px 12px'
      }
    }
  },
  methods: {
    add() {
      this.openForm('新增面试', '保存', false, 'add')
    },
    edit(record) {
      this.openForm('编辑面试', '保存', false, 'edit', record)
    },
    detail(record) {
      this.openForm('面试详情', '保存', true, 'edit', record)
    },
    openForm(title, submitText, disabled, action, record) {
      this.title = title
      this.submitText = submitText
      this.disableSubmit = disabled
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm[action](record)
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
    }
  }
}
</script>

<style lang="less">
@import '../../common/recruitmentModal.less';
</style>
