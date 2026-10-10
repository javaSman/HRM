<template>
  <j-modal
    :title="title"
    :width="960"
    :visible="visible"
    switchFullscreen
    centered
    wrapClassName="attendance-rule-modal"
    :bodyStyle="modalBodyStyle"
    @ok="handleOk"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <HrFieldWorkSiteForm
      ref="realForm"
      @ok="submitCallback"
      @submit="(loading) => confirmLoading = loading"
      :disabled="disableSubmit"
      :title="title"
    />

    <template slot="footer">
      <a-button key="back" class="modal-cancel-btn" @click="handleCancel">取消</a-button>
      <a-button
        v-if="!disableSubmit"
        key="submit"
        type="primary"
        :loading="confirmLoading"
        @click="handleOk"
      >
        {{ title === '编辑' ? '修改' : '确认' }}
      </a-button>
    </template>
  </j-modal>
</template>

<script>
import HrFieldWorkSiteForm from './HrFieldWorkSiteForm.vue'

export default {
  name: 'HrFieldWorkSiteModal',
  components: {
    HrFieldWorkSiteForm
  },
  data() {
    return {
      title: '',
      visible: false,
      disableSubmit: false,
      confirmLoading: false,
      modalBodyStyle: {
        maxHeight: 'calc(100vh - 168px)',
        overflowY: 'auto',
        padding: '20px 24px 12px'
      }
    }
  },
  methods: {
    add() {
      this.visible = true
      this.disableSubmit = false
      this.title = '新增外勤点'
      this.$nextTick(() => {
        this.$refs.realForm && this.$refs.realForm.add()
      })
    },
    edit(record) {
      this.visible = true
      this.disableSubmit = false
      this.title = '编辑外勤点'
      this.$nextTick(() => {
        this.$refs.realForm && this.$refs.realForm.edit(record)
      })
    },
    detail(record) {
      this.visible = true
      this.disableSubmit = true
      this.title = '外勤点详情'
      this.$nextTick(() => {
        this.$refs.realForm && this.$refs.realForm.edit(record)
      })
    },
    handleOk() {
      this.$refs.realForm && this.$refs.realForm.submitForm()
    },
    handleCancel() {
      this.visible = false
    },
    submitCallback() {
      this.visible = false
      this.$emit('ok')
    }
  }
}
</script>

<style lang="less" scoped>
/* 统一的 Modal 样式（与 card 目录保持一致） */
::v-deep .attendance-rule-modal .ant-modal-content {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(45, 120, 255, 0.12), 0 0 40px rgba(45, 120, 255, 0.04);
}

::v-deep .attendance-rule-modal .ant-modal-header {
  padding: 16px 24px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  border-bottom: 0;
}

::v-deep .attendance-rule-modal .ant-modal-title,
::v-deep .attendance-rule-modal .j-modal-title-row .left {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

::v-deep .attendance-rule-modal .ant-modal-close {
  top: 10px;
  right: 14px;
  width: 32px;
  height: 32px;
  color: #fff;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

::v-deep .attendance-rule-modal .ant-modal-close:hover {
  background: rgba(255, 255, 255, 0.35);
}

::v-deep .attendance-rule-modal .ant-modal-close-x {
  width: 32px;
  height: 32px;
  line-height: 32px;
}

::v-deep .attendance-rule-modal .ant-modal-body {
  padding: 20px 24px;
  max-height: calc(85vh - 116px);
  overflow-y: auto;
  background: #ffffff;
}

::v-deep .attendance-rule-modal .ant-modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn {
  height: 34px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary {
  border: 0;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary:hover,
::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary:focus {
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  opacity: 0.92;
}
</style>
