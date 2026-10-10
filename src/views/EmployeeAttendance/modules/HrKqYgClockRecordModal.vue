<template>
  <a-modal
    :visible="visible"
    :title="modalTitle"
    wrapClassName="attendance-clock-detail-modal"
    :width="800"
    :footer="null"
    :destroyOnClose="true"
    :bodyStyle="{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '72vh' }"
    :dialogStyle="{ borderRadius: '12px', overflow: 'hidden' }"
    @cancel="handleCancel"
  >
    <!-- 员工信息 -->
    <div class="staff-summary flex flex-col">
      <div class="summary-row">
        <div class="summary-item">
          <span class="summary-label">姓名：</span>
          <span class="summary-value">{{ formatText(model.name) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">工号：</span>
          <span class="summary-value">{{ formatText(model.no) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">考勤卡号：</span>
          <span class="summary-value">{{ formatText(model.kh) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">部门：</span>
          <span class="summary-value">{{ model.dept_dictText }}</span>
        </div>
      </div>

      <div class="summary-row">
        <div class="summary-item">
          <span class="summary-label">日期：</span>
          <span class="summary-value">{{ formatText(model.skrq) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">出勤状态：</span>
          <a-tag
            v-if="model.attendanceStatus && model.attendanceStatus.indexOf('+') == -1"
            :color="getAttendanceStatusClass(model.attendanceStatus)"
          >
            {{ model.attendanceStatus_dictText }}
          </a-tag>
          <template v-else>
            <a-tag
              v-for="item in model.attendanceStatus.split('+')"
              :key="item"
              :color="getAttendanceStatusClassObj(item).color"
            >
              {{ getAttendanceStatusClassObj(item).text }}
            </a-tag>
          </template>
        </div>
      </div>
    </div>

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
      <hr-punch-record v-if="activeTab === 'punch'" :employeeNo="employeeNo" :yearMonth="queryDate" />
      <hr-leave-record v-else-if="activeTab === 'leave'" :employeeNo="employeeNo" :yearMonth="queryDate" />
      <hr-makeup-record v-else-if="activeTab === 'makeup'" :employeeNo="employeeNo" :yearMonth="queryDate" />
      <hr-overtime-record v-else-if="activeTab === 'overtime'" :employeeNo="employeeNo" :yearMonth="queryDate" />
      <hr-out-record v-else-if="activeTab === 'out'" :employeeNo="employeeNo" :yearMonth="queryDate" />
      <hr-mobile-record v-else-if="activeTab === 'mobile'" :employeeNo="employeeNo" :yearMonth="queryDate" />
    </div>

    <!-- 底部关闭按钮 -->
    <div class="modal-footer">
      <button class="btn-close-modal" @click="handleCancel">关闭</button>
    </div>
  </a-modal>
</template>

<script>
import HrPunchRecord from '@/views/attendanceRule/TaReport/modules/HrPunchRecord.vue'
import HrLeaveRecord from '@/views/attendanceRule/TaReport/modules/HrLeaveRecord.vue'
import HrMakeupRecord from '@/views/attendanceRule/TaReport/modules/HrMakeupRecord.vue'
import HrOvertimeRecord from '@/views/attendanceRule/TaReport/modules/HrOvertimeRecord.vue'
import HrOutRecord from '@/views/attendanceRule/TaReport/modules/HrOutRecord.vue'
import HrMobileRecord from '@/views/attendanceRule/TaReport/modules/HrMobileRecord.vue'

export default {
  name: 'HrKqYgClockRecordModal',
  components: {
    HrPunchRecord,
    HrLeaveRecord,
    HrMakeupRecord,
    HrOvertimeRecord,
    HrOutRecord,
    HrMobileRecord,
  },
  data() {
    return {
      visible: false,
      activeTab: 'punch',
      model: {
        attendanceStatus: '',
      },
      employeeName: '',
      employeeNo: '',
      queryDate: '',
      attendanceStatusMap: {
        NORMAL: { text: '正常', color: '#36d985', code: 'NORMAL' },
        BE_LATE: { text: '迟到', color: '#ff814b', code: 'BE_LATE' },
        LEAVE_EARLY: { text: '早退', color: '#ffa200', code: 'LEAVE_EARLY' },
        MISSING: { text: '缺卡', color: '#ff5900', code: 'MISSING' },
        ABSENT: { text: '旷工', color: '#e93030', code: 'ABSENT' },
        OTHER: { text: '其他', color: '', code: 'OTHER' },
        SickLeave: { text: '病假', color: '', code: 'SickLeave' },
        CasualLeave: { text: '事假', color: '', code: 'CasualLeave' },
        Weekend: { text: '休息日', color: '#00cb9e', code: 'Weekend' },
        Holiday: { text: '节假日', color: '#03cc00', code: 'Holiday' },
        BK: { text: '补卡', color: '#096dd9', code: 'BK' },
        WC: { text: '外出', color: '#e7b625', code: 'WC' },
        XJ: { text: '休假', color: '#00cce3', code: 'XJ' },
      },
      tabList: [
        { key: 'punch', label: '打卡记录' },
        { key: 'leave', label: '请假记录' },
        { key: 'makeup', label: '补卡申请' },
        { key: 'overtime', label: '加班申请' },
        { key: 'out', label: '外出申请' },
        { key: 'mobile', label: '移动打卡申请' },
      ],
    }
  },
  computed: {
    modalTitle() {
      const tabNames = {
        punch: '打卡记录',
        leave: '请假记录',
        makeup: '补卡申请',
        overtime: '加班申请',
        out: '外出申请',
        mobile: '移动打卡申请',
      }
      let title = tabNames[this.activeTab] || '打卡记录'
      if (this.employeeName) {
        title += ` - ${this.employeeName}${this.employeeNo ? ` (${this.employeeNo})` : ''}`
      }
      return title
    },
  },
  methods: {
    getAttendanceStatusClass(status) {
      const statusMeta = this.attendanceStatusMap[status]
      return statusMeta ? statusMeta.color : ''
    },
    getAttendanceStatusClassObj(status) {
      const statusMeta = this.attendanceStatusMap[status]
      return statusMeta || { color: '', text: '' }
    },
    show(record = {}) {
      this.model = Object.assign({}, record)
      this.employeeName = record.name || ''
      this.employeeNo = record.no || ''
      this.queryDate = record.skrq || ''
      this.activeTab = 'punch'
      this.visible = true
    },
    handleCancel() {
      this.visible = false
    },
    handleTabChange(key) {
      this.activeTab = key
    },
    formatText(text) {
      return text === undefined || text === null || text === '' ? '-' : text
    },
  },
}
</script>

<style scoped>
.staff-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 20px;
  margin: 16px 24px 0;
  padding: 14px 16px;
  background: rgba(37, 99, 235, 0.02);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  flex-shrink: 0;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.summary-label {
  color: #64748b;
  font-weight: 500;
}

.summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 20px;
}

.summary-value {
  color: #1a2a3d;
  font-weight: 600;
}

.modal-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
  margin-top: 16px;
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
}

.modal-tab:hover {
  color: #1677ff;
}

.modal-tab.active {
  color: #1677ff;
  border-bottom-color: #1677ff;
  font-weight: 500;
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
}

.btn-close-modal:hover {
  color: #1677ff;
  border-color: #1677ff;
}
</style>

<style>
.attendance-clock-detail-modal .ant-modal-content {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(45, 120, 255, 0.12), 0 0 40px rgba(45, 120, 255, 0.04);
}

.attendance-clock-detail-modal .ant-modal-header {
  padding: 16px 24px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  border-bottom: 0;
}

.attendance-clock-detail-modal .ant-modal-title,
.attendance-clock-detail-modal .j-modal-title-row .left {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.attendance-clock-detail-modal .ant-modal-close {
  top: 10px;
  right: 14px;
  width: 32px;
  height: 32px;
  color: #fff;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.attendance-clock-detail-modal .ant-modal-close:hover {
  background: rgba(255, 255, 255, 0.35);
}

.attendance-clock-detail-modal .ant-modal-close-x {
  width: 32px;
  height: 32px;
  line-height: 32px;
}

.attendance-clock-detail-modal .ant-modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #e2e8f0;
}

.attendance-clock-detail-modal .ant-modal-footer .ant-btn {
  height: 34px;
  padding: 0 20px;
  color: #64748b;
  background: #ffffff;
  border-color: #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.attendance-clock-detail-modal .ant-modal-footer .ant-btn:hover {
  color: #1a2a3d;
  border-color: rgba(45, 120, 255, 0.35);
}
</style>

