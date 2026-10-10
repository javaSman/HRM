<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    switchFullscreen
    wrapClassName="attendance-edit-modal"
    @ok="handleOk"
    :dialogStyle="{
      top:'30px'
    }"
    :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
    @cancel="handleCancel"
    cancelText="关闭">
    <hr-kq-yg-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></hr-kq-yg-form>
  </j-modal>
</template>

<script>

  import HrKqYgForm from './HrKqYgForm'
  export default {
    name: 'HrKqYgModal',
    components: {
      HrKqYgForm
    },
    data () {
      return {
        title: '',
        width: 1100,
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

<style>
  .attendance-edit-modal .ant-modal-content {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(45, 120, 255, 0.12), 0 0 40px rgba(45, 120, 255, 0.04);
  }

  .attendance-edit-modal .ant-modal-header {
    padding: 16px 24px;
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    border-bottom: 0;
  }

  .attendance-edit-modal .ant-modal-title,
  .attendance-edit-modal .j-modal-title-row .left {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
  }

  .attendance-edit-modal .ant-modal-close {
    top: 10px;
    right: 14px;
    width: 32px;
    height: 32px;
    color: #fff;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
  }

  .attendance-edit-modal .ant-modal-close:hover {
    background: rgba(255, 255, 255, 0.35);
  }

  .attendance-edit-modal .ant-modal-close-x {
    width: 32px;
    height: 32px;
    line-height: 32px;
  }

  .attendance-edit-modal .ant-modal-body {
    padding: 20px 24px;
    max-height: calc(85vh - 116px);
    overflow-y: auto;
  }

  .attendance-edit-modal .ant-modal-footer {
    padding: 14px 24px;
    border-top: 1px solid #e2e8f0;
  }

  .attendance-edit-modal .ant-modal-footer .ant-btn:not(.ant-btn-primary) {
    height: 34px;
    padding: 0 20px;
    color: #64748b;
    background: #ffffff;
    border-color: #e2e8f0;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
  }

  .attendance-edit-modal .ant-modal-footer .ant-btn:not(.ant-btn-primary):hover {
    color: #1a2a3d;
    border-color: rgba(45, 120, 255, 0.35);
  }

  .attendance-edit-modal .ant-modal-footer .ant-btn-primary {
    height: 34px;
    border: 0;
    border-radius: 8px;
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
    font-size: 12px;
    font-weight: 600;
  }

  .attendance-edit-modal .ant-modal-footer .ant-btn-primary:hover,
  .attendance-edit-modal .ant-modal-footer .ant-btn-primary:focus {
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    opacity: 0.92;
  }
</style>
