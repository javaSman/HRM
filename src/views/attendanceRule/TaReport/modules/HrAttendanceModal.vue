<template>
  <a-modal
    :visible="visible"
    :title="modalTitle"
    wrapClassName="attendance-rule-modal"
    :width="800"
    :footer="null"
    :destroyOnClose="true"
    :bodyStyle="{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '72vh' }"
    :dialogStyle="{ borderRadius: '12px', overflow: 'hidden' }"
    @cancel="handleCancel"
    class="attendance-modal"
  >
    <!-- Tab 栏 -->
    <div class="modal-tabs">
      <div
        v-for="tab in tabList"
        :key="tab.key"
        :class="['modal-tab', { active: activeTab === tab.key }]"
        @click="handleTabChange(tab.key)"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- Tab 内容区 -->
    <div class="modal-content">
      <hr-attendance-calendar v-if="activeTab === 'calendar'" :mainDATA="mainDATA" :employeeNo="employeeNo" :yearMonth="yearMonth" />
      <hr-punch-record v-else-if="activeTab === 'punch'" :employeeNo="employeeNo" :yearMonth="yearMonth" />
      <hr-leave-record v-else-if="activeTab === 'leave'" :employeeNo="employeeNo" :yearMonth="yearMonth" />
      <hr-makeup-record v-else-if="activeTab === 'makeup'" :employeeNo="employeeNo" :yearMonth="yearMonth" />
      <hr-overtime-record v-else-if="activeTab === 'overtime'" :employeeNo="employeeNo" :yearMonth="yearMonth" />
      <hr-out-record v-else-if="activeTab === 'out'" :employeeNo="employeeNo" :yearMonth="yearMonth" />
      <hr-mobile-record v-else-if="activeTab === 'mobile'" :employeeNo="employeeNo" :yearMonth="yearMonth" />
    </div>

    <!-- 底部关闭按钮 -->
    <div class="modal-footer">
      <button class="btn-close-modal" @click="handleCancel">关闭</button>
    </div>
  </a-modal>
</template>

<script>
import HrAttendanceCalendar from './HrAttendanceCalendar'
import HrPunchRecord from './HrPunchRecord'
import HrLeaveRecord from './HrLeaveRecord'
import HrMakeupRecord from './HrMakeupRecord'
import HrOvertimeRecord from './HrOvertimeRecord'
import HrOutRecord from './HrOutRecord'
import HrMobileRecord from './HrMobileRecord'

export default {
  name: 'HrAttendanceModal',
  components: {
    HrAttendanceCalendar,
    HrPunchRecord,
    HrLeaveRecord,
    HrMakeupRecord,
    HrOvertimeRecord,
    HrOutRecord,
    HrMobileRecord
  },
  data() {
    return {
      visible: false,
      activeTab: 'calendar',
      employeeName: '',
      employeeNo: '',
      yearMonth: '',
      mainDATA: {},
      tabList: [
        { key: 'calendar', label: '出勤日历' },
        { key: 'punch', label: '打卡记录' },
        { key: 'leave', label: '请假记录' },
        { key: 'makeup', label: '补卡申请' },
        { key: 'overtime', label: '加班申请' },
        { key: 'out', label: '外出申请' },
        { key: 'mobile', label: '移动打卡申请' }
      ]
    }
  },
  computed: {
    modalTitle() {
      const tabNames = {
        calendar: '出勤日历',
        punch: '打卡记录',
        leave: '请假记录',
        makeup: '补卡申请',
        overtime: '加班申请',
        out: '外出申请',
        mobile: '移动打卡申请'
      }
      let title = tabNames[this.activeTab] || '出勤记录'
      if (this.employeeName) {
        title += ` - ${this.employeeName}${this.employeeNo ? ` (${this.employeeNo})` : ''}`
      }
      return title
    }
  },
  methods: {
    show(record) {
      this.mainDATA = record
      this.employeeName = record.name || ''
      this.employeeNo = record.no || ''
      this.yearMonth = record.ssny || ''
      this.activeTab = 'calendar'
      this.visible = true
    },
    handleCancel() {
      this.visible = false
    },
    handleTabChange(key) {
      this.activeTab = key
    }
  }
}
</script>

<style lang="less" scoped>


.modal-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
  flex-shrink: 0;
  background: #fff;
}

.modal-tab {
  padding: 12px 16px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
  outline: none;
  white-space: nowrap;

  &:hover {
    color: #1677ff;
  }

  &.active {
    color: #1677ff;
    border-bottom-color: #1677ff;
    font-weight: 500;
  }
}

.modal-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px 24px;
  background: #fff;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 24px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
  flex-shrink: 0;
}

.btn-close-modal {
  padding: 6px 22px;
  font-size: 13px;
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #555;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;

  &:hover {
    color: #1677ff;
    border-color: #1677ff;
  }
}


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