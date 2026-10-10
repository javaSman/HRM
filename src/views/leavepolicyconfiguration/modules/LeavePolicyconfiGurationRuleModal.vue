<template>
  <j-modal :title="title" :width="width" :visible="visible" switchFullscreen
    wrapClassName="leave-policy-configuration-modal" :bodyStyle="modalBodyStyle" @ok="handleOk"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }" @cancel="handleCancel" cancelText="关闭">
    <leave-policyconfi-guration-rule-form ref="realForm" @ok="submitCallback"
      :disabled="disableSubmit"></leave-policyconfi-guration-rule-form>
  </j-modal>
</template>

<script>
import LeavePolicyconfiGurationRuleForm from './LeavePolicyconfiGurationRuleForm'
export default {
  name: 'LeavePolicyconfiGurationRuleModal',
  components: {
    LeavePolicyconfiGurationRuleForm,
  },
  data() {
    return {
      title: '',
      width: 1100,
      visible: false,
      disableSubmit: false,
      modalBodyStyle: {
        maxHeight: 'calc(100vh - 168px)',
        overflowY: 'auto',
        padding: '16px 24px 12px',
      },
    }
  },
  methods: {
    add() {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.add()
      })
    },
    edit(record) {
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

<style lang="less" scoped>
/* 统一的 Modal 样式 */
::v-deep .leave-policy-configuration-modal .ant-modal-content {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(45, 120, 255, 0.12), 0 0 40px rgba(45, 120, 255, 0.04);
}

::v-deep .leave-policy-configuration-modal .ant-modal-header {
  padding: 16px 24px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  border-bottom: 0;
}

::v-deep .leave-policy-configuration-modal .ant-modal-title,
::v-deep .leave-policy-configuration-modal .j-modal-title-row .left {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

::v-deep .leave-policy-configuration-modal .ant-modal-close {
  top: 10px;
  right: 14px;
  width: 32px;
  height: 32px;
  color: #fff;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

::v-deep .leave-policy-configuration-modal .ant-modal-close:hover {
  background: rgba(255, 255, 255, 0.35);
}

::v-deep .leave-policy-configuration-modal .ant-modal-close-x {
  width: 32px;
  height: 32px;
  line-height: 32px;
}

::v-deep .leave-policy-configuration-modal .ant-modal-body {
  padding: 20px 24px;
  max-height: calc(85vh - 116px);
  overflow-y: auto;
  background: #f8fafc;
}

::v-deep .leave-policy-configuration-modal .ant-modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}

::v-deep .leave-policy-configuration-modal .ant-modal-footer .ant-btn {
  height: 34px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

::v-deep .leave-policy-configuration-modal .ant-modal-footer .ant-btn-danger {
  border: 0;
  color: #fff;
  background: linear-gradient(135deg, #fc211a 0%, #ff9362 100%) !important;
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
}

::v-deep .leave-policy-configuration-modal .ant-modal-footer .ant-btn-danger:hover,
::v-deep .leave-policy-configuration-modal .ant-modal-footer .ant-btn-danger:focus {
  color: #fff;
  background: linear-gradient(135deg, #fc211a 0%, #ff9362 100%) !important;
  opacity: 0.92;
}

::v-deep .leave-policy-configuration-modal .ant-modal-footer .ant-btn-primary {
  border: 0;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
}

::v-deep .leave-policy-configuration-modal .ant-modal-footer .ant-btn-primary:hover,
::v-deep .leave-policy-configuration-modal .ant-modal-footer .ant-btn-primary:focus {
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  opacity: 0.92;
}

/* 审批按钮样式 */
::v-deep .leave-policy-configuration-modal .ant-modal-footer .ant-btn-danger {
  border-radius: 8px;
  font-weight: 600;
}

/* 弹窗垂直居中：遮罩层 flex 居中，去掉 ant-modal 默认的 top / 底部留白 */
::v-deep .leave-policy-configuration-modal {
  display: flex;
  align-items: center;
}

::v-deep .leave-policy-configuration-modal .ant-modal {
  top: 0;
  margin: 0 auto;
  padding-bottom: 0;
}
</style>
