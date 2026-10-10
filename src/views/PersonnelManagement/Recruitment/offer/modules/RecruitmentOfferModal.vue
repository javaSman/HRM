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
    <recruitment-offer-form ref="realForm" @ok="submitCallback"></recruitment-offer-form>
    <template slot="footer">
      <a-button v-if="currentStep > 0" @click="handlePrevStep">上一步</a-button>
      <a-button v-if="currentStep < maxStep" type="primary" @click="handleNextStep">下一步</a-button>
      <a-button v-else type="primary" @click="handleOk">提交审批</a-button>
      <a-button @click="handleCancel">取消</a-button>
    </template>
  </j-modal>
</template>

<script>
import RecruitmentOfferForm from './RecruitmentOfferForm.vue'

export default {
  name: 'RecruitmentOfferModal',
  components: {
    RecruitmentOfferForm
  },
  data() {
    return {
      title: '发起Offer',
      width: 900,
      visible: false,
      currentStep: 0,
      maxStep: 1,
      modalBodyStyle: {
        maxHeight: 'calc(100vh - 168px)',
        overflowY: 'auto',
        padding: '16px 24px 12px'
      }
    }
  },
  methods: {
    add() {
      this.title = '发起Offer'
      this.visible = true
      this.currentStep = 0
      this.$nextTick(() => {
        this.$refs.realForm.add()
        this.syncStep()
      })
    },
    edit(record) {
      this.title = '编辑Offer'
      this.visible = true
      this.currentStep = 0
      this.$nextTick(() => {
        this.$refs.realForm.edit(record)
        this.syncStep()
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
      this.currentStep = 0
    },
    handleOk() {
      this.$refs.realForm.submitForm()
    },
    handleNextStep() {
      this.$refs.realForm.nextStep()
      this.syncStep()
    },
    handlePrevStep() {
      this.$refs.realForm.prevStep()
      this.syncStep()
    },
    syncStep() {
      this.currentStep = this.$refs.realForm ? this.$refs.realForm.currentStep : 0
    },
    submitCallback() {
      this.$emit('ok')
      this.visible = false
      this.currentStep = 0
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
