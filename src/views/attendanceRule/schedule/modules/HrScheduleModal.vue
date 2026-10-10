<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    switchFullscreen
    wrapClassName="attendance-rule-modal"
    :bodyStyle="modalBodyStyle"
    :dialogStyle="{ top: '16px' }"
    @ok="handleOk"
    :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
    @cancel="handleCancel"
    cancelText="关闭">
    <hr-schedule-form
      ref="realForm"
      @ok="submitCallback"
      :disabled="disableSubmit"
      :record="currentRecord"
      :scheduleMonth="scheduleMonth"
      @shiftsChange="handleShiftsChange"
    />
  </j-modal>
</template>

<script>
import HrScheduleForm from './HrScheduleForm'

export default {
  name: 'HrScheduleModal',
  components: {
    HrScheduleForm
  },
  data() {
    return {
      title: '',
      width: '70%',
      visible: false,
      disableSubmit: false,
      modalBodyStyle: {
        maxHeight: 'calc(100vh - 168px)',
        overflowY: 'auto',
        padding: '16px 24px 12px'
      },
      currentRecord: null,
      // 列表页传入的年月（YYYY-MM）
      scheduleMonth: ''
    }
  },
  methods: {
    add() {
      this.visible = true
      this.currentRecord = null
      this.scheduleMonth = ''
      this.$nextTick(() => {
        this.$refs.realForm.add()
      })
    },
    edit(record, scheduleMonth) {
      this.visible = true
      this.currentRecord = record
      this.scheduleMonth = scheduleMonth || ''
      this.$nextTick(() => {
        this.$refs.realForm.edit(record)
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
      this.currentRecord = null
    },
    handleOk() {
      this.$refs.realForm.submitForm()
    },
    submitCallback() {
      this.$emit('ok')
      this.visible = false
      this.currentRecord = null
    },
    handleCancel() {
      // 取消时重置表单数据
      this.$refs.realForm.resetForm()
      this.close()
    },
    handleShiftsChange(shifts) {
      // 时段变化事件，用于日历实时联动
      this.$emit('shiftsChange', shifts)
    }
  }
}
</script>

<style lang="less" scoped>
/* 统一的 Modal 样式 */
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
  background: #f8fafc;
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

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-danger{
  border: 0;
  color: #fff;
  background: linear-gradient(135deg, #fc211a 0%, #ff9362 100%) !important;
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
}
::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-danger:hover,
::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-danger:focus {
  color: #fff;
  background: linear-gradient(135deg, #fc211a 0%, #ff9362 100%)!important;
  opacity: 0.92;
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

/* 审批按钮样式 */
::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-danger {
  border-radius: 8px;
  font-weight: 600;
}
</style>
