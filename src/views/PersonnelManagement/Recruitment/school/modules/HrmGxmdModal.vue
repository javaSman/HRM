<template>
  <j-modal
    class="recruitment-flow-modal"
    :title="title"
    :width="760"
    :visible="visible"
    switchFullscreen
    :bodyStyle="{ maxHeight: 'calc(100vh - 168px)', overflowY: 'auto', padding: '16px 24px 12px' }"
    :dialogStyle="{ top: '16px' }"
    @cancel="close"
  >
    <hrm-gxmd-form ref="realForm" :disabled="disableSubmit" @ok="submitCallback" />
    <template slot="footer">
      <a-button v-if="!disableSubmit" type="primary" @click="handleOk">{{ submitText }}</a-button>
      <a-button @click="close">{{ disableSubmit ? '关闭' : '取消' }}</a-button>
    </template>
  </j-modal>
</template>

<script>
import HrmGxmdForm from './HrmGxmdForm.vue'

export default {
  name: 'HrmGxmdModal',
  components: { HrmGxmdForm },
  data() {
    return {
      title: '新增高校',
      submitText: '确定',
      visible: false,
      disableSubmit: false
    }
  },
  methods: {
    add() {
      this.open('新增高校', '确定', false, () => this.$refs.realForm.add())
    },
    edit(record) {
      this.open('编辑高校', '保存', false, () => this.$refs.realForm.edit(record))
    },
    open(title, submitText, disabled, initialize) {
      this.title = title
      this.submitText = submitText
      this.disableSubmit = disabled
      this.visible = true
      this.$nextTick(initialize)
    },
    handleOk() {
      this.$refs.realForm.submitForm()
    },
    submitCallback(payload) {
      this.$emit('ok', payload)
      this.close()
    },
    close() {
      this.visible = false
    }
  }
}
</script>

<style lang="less">
@import '../../common/recruitmentModal.less';
</style>
