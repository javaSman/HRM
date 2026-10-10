<template>
  <j-modal
    class="recruitment-flow-modal"
    :title="title"
    :width="620"
    :visible="visible"
    switchFullscreen
    :bodyStyle="{ maxHeight: 'calc(100vh - 168px)', overflowY: 'auto', padding: '16px 24px 12px' }"
    :dialogStyle="{ top: '16px' }"
    @cancel="close"
  >
    <hrm-gxmd-xxry-form ref="realForm" :hrmGxmdId="hrmGxmdId" @ok="submitCallback" />
    <template slot="footer">
      <a-button type="primary" @click="handleOk">{{ submitText }}</a-button>
      <a-button @click="close">取消</a-button>
    </template>
  </j-modal>
</template>

<script>
import HrmGxmdXxryForm from './HrmGxmdXxryForm.vue'

export default {
  name: 'HrmGxmdXxryModal',
  components: { HrmGxmdXxryForm },
  props: {
    hrmGxmdId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      title: '新增学校人员',
      submitText: '确定',
      visible: false
    }
  },
  methods: {
    add() {
      this.open('新增学校人员', '确定', () => this.$refs.realForm.add())
    },
    edit(record) {
      this.open('编辑学校人员', '保存', () => this.$refs.realForm.edit(record))
    },
    open(title, submitText, initialize) {
      this.title = title
      this.submitText = submitText
      this.visible = true
      this.$nextTick(initialize)
    },
    handleOk() {
      this.$refs.realForm.submitForm()
    },
    submitCallback() {
      this.$emit('ok')
      this.close()
    },
    close() {
      this.visible = false
    }
  }
}
</script>

<style lang="less">
@import '../../../common/recruitmentModal.less';
</style>
