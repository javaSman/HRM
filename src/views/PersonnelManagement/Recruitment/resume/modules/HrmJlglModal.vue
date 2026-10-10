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
    <hrm-jlgl-form ref="realForm" :mainData="mainData" :disabled="disableSubmit" @ok="submitCallback"></hrm-jlgl-form>
    <template slot="footer">
      <a-button @click="handleCancel">{{ disableSubmit ? '关闭' : '取消' }}</a-button>

      <a-button v-if="!disableSubmit" type="primary" @click="handleOk">{{ submitText }}</a-button>
    </template>
  </j-modal>
</template>

<script>
import HrmJlglForm from './HrmJlglForm.vue'

export default {
  name: 'HrmJlglModal',
  components: {
    HrmJlglForm
  },
  props: {
    mainData: { type: Object, default: () => {} }
  },
  data() {
    return {
      title: '新增简历',
      width: 1100,
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
    add(context) {
      this.openForm('新增简历', '提交', false, 'add', context)
    },
    edit(record) {
      this.openForm('编辑简历', '提交', false, 'edit', record)
    },
    openForm(title, submitText, disabled, action, payload) {
      this.title = title
      this.submitText = submitText
      this.disableSubmit = disabled
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm[action](payload)
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
