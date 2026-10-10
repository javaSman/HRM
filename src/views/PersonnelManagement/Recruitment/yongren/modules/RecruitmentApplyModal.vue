<template>
  <j-modal
    class="recruitment-flow-modal"
    :title="title"
    :width="1400"
    :visible="visible"
    switchFullscreen
    :bodyStyle="modalBodyStyle"

    :dialogStyle="{ top: '40px' }"
    @cancel="handleCancel">
    <recruitment-apply-form ref="realForm" @ok="submitCallback"></recruitment-apply-form>
    <template slot="footer">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleOk">{{ submitText }}</a-button>

    </template>
  </j-modal>
</template>

<script>
import RecruitmentApplyForm from './RecruitmentApplyForm.vue'

export default {
  name: 'RecruitmentApplyModal',
  components: {
    RecruitmentApplyForm
  },
  data() {
    return {
      title: '发起用人申请',
      width: 1100,
      visible: false,
      submitText: '提交申请',
      modalBodyStyle: {
        maxHeight: 'calc(100vh - 168px)',
        overflowY: 'auto',
        padding: '20px 24px 16px',
        background: '#f0f3f8'
      }
    }
  },
  methods: {
    add() {
      this.title = '新增'
      this.submitText = '提交'
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.add()
      })
    },
    edit(record) {
      this.title = '编辑'
      this.submitText = '提交'
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.edit(record)
      })
    },
    again(record) {
      this.title = '再次发起用人申请'
      this.submitText = '重新提交申请'
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.reapply(record)
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
    handleOk() {
      this.$refs.realForm.submitForm()
    },
    submitCallback(record) {
      this.$emit('ok', record)
      this.visible = false
    },
    handleCancel() {
      this.close()
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
  .ant-modal-close {
    color: rgba(255, 255, 255, 0.78);
  }

  .j-modal-title-row .right .ant-modal-close:hover,
  .ant-modal-close:hover {
    color: #fff;
  }

  .ant-modal-body {
    border-bottom: 1px solid #f0f0f0;
  }

  .ant-modal-footer {
    padding: 16px 18px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
