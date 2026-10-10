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
    <hrm-hmdlb-form ref="realForm" @ok="submitCallback" />
    <template slot="footer">
      <a-button type="primary" @click="handleOk">{{ submitText }}</a-button>
      <a-button @click="close">取消</a-button>
    </template>
  </j-modal>
</template>

<script>
import HrmHmdlbForm from './HrmHmdlbForm.vue'

export default {
  name: 'HrmHmdlbModal',
  components: { HrmHmdlbForm },
  data() {
    return {
      title: '加入黑名单',
      submitText: '确认加入',
      visible: false
    }
  },
  methods: {
    add() {
      this.title = '加入黑名单'
      this.submitText = '确认加入'
      this.visible = true
      this.$nextTick(() => this.$refs.realForm.add())
    },
    edit(record) {
      this.title = '编辑黑名单'
      this.submitText = '保存'
      this.visible = true
      this.$nextTick(() => this.$refs.realForm.edit(record))
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
.recruitment-flow-modal {
  .ant-modal-content {
    overflow: hidden;
    border-radius: 10px;
  }

  .ant-modal-header {
    padding: 0 24px;
    border-bottom: 0;
    background: #4a7bf7;
  }

  .j-modal-title-row {
    min-height: 55px;
    align-items: center;
  }

  .j-modal-title-row .left {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
  }

  .j-modal-title-row .right .ant-modal-close,
  .ant-modal-close { color: rgba(255, 255, 255, 0.78); }

  .j-modal-title-row .right .ant-modal-close:hover,
  .ant-modal-close:hover { color: #fff; }

  .ant-modal-body { border-bottom: 1px solid #f0f0f0; }

  .ant-modal-footer {
    padding: 16px 18px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
