<template>
  <div class="page-container abnormal-page">
    <div class="page-header">
      <div class="page-header-left">
        <h1>异常考勤处理</h1>
        <span class="header-badge red">未处理 {{ pendingCount }}</span>
      </div>
      <div class="header-actions">
        <div class="header-search">
          <a-icon type="search" class="header-search-icon" />
          <input v-model="keyword" class="header-search-input" placeholder="搜索员工..." />
        </div>
        <a-button class="icon-button" icon="bell" @click="handleNotice" />
      </div>
    </div>

    <div class="stats-grid">
      <div v-for="item in statsCards" :key="item.key" class="stats-card">
        <div>
          <div class="stats-label">{{ item.label }}</div>
          <div :class="['stats-value', item.theme]">{{ item.value }}</div>
          <div class="stats-desc">{{ item.desc }}</div>
        </div>
        <div :class="['stats-icon', item.theme]"><a-icon :type="item.icon" /></div>
      </div>
    </div>

    <div class="threshold-panel">
      <a-icon type="info-circle" class="threshold-icon" />
      <div>
        <div class="threshold-title">异常判定阈值</div>
        <div class="threshold-list">
          <span>🕐 迟到阈值：超过上班时间 <strong>{{ thresholdForm.lateMinutes }}</strong> 分钟计为迟到</span>
          <span>🕐 早退阈值：早于下班时间 <strong>{{ thresholdForm.earlyMinutes }}</strong> 分钟计为早退</span>
          <span>🕐 缺卡判定：{{ thresholdForm.missingClockEnabled ? '上下班任一打卡缺失' : '关闭' }}</span>
          <span>🕐 旷工判定：全天无打卡记录或未出勤</span>
        </div>
      </div>
      <a-button class="threshold-btn" @click="openThresholdModal">配置阈值</a-button>
    </div>

    <div class="panel-card">
      <a-tabs :activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="all" tab="全部异常" />
        <a-tab-pane key="迟到" tab="迟到" />
        <a-tab-pane key="早退" tab="早退" />
        <a-tab-pane key="缺卡" tab="缺卡" />
        <a-tab-pane key="旷工" tab="旷工" />
      </a-tabs>

      <a-table rowKey="id" :columns="columns" :dataSource="pagedRecords" :pagination="false">
        <template slot="type" slot-scope="text, record">
          <a-tag :color="getTypeTagColor(record.type)">{{ record.type }}</a-tag>
        </template>
        <template slot="status" slot-scope="text, record">
          <a-tag :color="record.status === '未处理' ? 'red' : 'green'">{{ record.status }}</a-tag>
        </template>
        <template slot="action" slot-scope="text, record">
          <a-button v-if="record.status === '未处理'" class="process-btn" size="small" @click="openProcessModal(record)">处理</a-button>
          <a v-else @click="openProcessModal(record)">查看</a>
        </template>
      </a-table>

      <div class="table-footer between">
        <span>共 {{ filteredRecords.length }} 条异常记录</span>
        <a-pagination
          size="small"
          :current="pagination.current"
          :pageSize="pagination.pageSize"
          :total="filteredRecords.length"
          @change="handlePageChange"
        />
      </div>
    </div>

    <prototype-modal
      v-model="modal.visible"
      :title="modal.type === 'process' ? (modal.record ? '异常处理 - ' + modal.record.name : '异常处理') : '异常判定阈值配置'"
      :loading="modal.confirmLoading"
      :width="modal.type === 'process' ? 460 : 420"
      wrapClassName="abnormal-modal"
      @confirm="handleModalOk"
      @cancel="closeModal"
    >
      <a-form-model v-if="modal.type === 'process' && modal.record" :model="processForm" layout="vertical">
        <div class="record-card">
          <div class="record-grid">
            <div class="record-item"><span>异常类型</span><a-tag :color="getTypeTagColor(modal.record.type)">{{ modal.record.type }}</a-tag></div>
            <div class="record-item"><span>发生时间</span><strong>{{ modal.record.time }}</strong></div>
          </div>
          <div class="record-note">{{ modal.record.description }}</div>
        </div>
        <a-form-model-item label="处理方式">
          <a-select v-model="processForm.action">
            <a-select-option value="标记为正常">标记为正常 (人工豁免)</a-select-option>
            <a-select-option value="提交补卡申请">提交补卡申请</a-select-option>
            <a-select-option value="转为请假">转为请假</a-select-option>
            <a-select-option value="记为旷工">记为旷工</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="处理备注">
          <a-textarea v-model="processForm.note" :rows="3" placeholder="请填写处理说明..." />
        </a-form-model-item>
      </a-form-model>

      <a-form-model v-else :model="thresholdForm" layout="vertical">
        <a-form-model-item label="迟到阈值（分钟）">
          <a-input-number v-model="thresholdForm.lateMinutes" :min="1" style="width: 100%" />
        </a-form-model-item>
        <a-form-model-item label="早退阈值（分钟）">
          <a-input-number v-model="thresholdForm.earlyMinutes" :min="1" style="width: 100%" />
        </a-form-model-item>
        <a-form-model-item label="缺卡判定">
          <div class="switch-row">
            <span>上下班任一打卡缺失</span>
            <a-switch v-model="thresholdForm.missingClockEnabled" />
          </div>
        </a-form-model-item>
        <a-form-model-item label="旷工判定（连续缺卡天数）">
          <a-input-number v-model="thresholdForm.absentDays" :min="1" style="width: 100%" />
        </a-form-model-item>
      </a-form-model>

      <template slot="footer">
        <div class="modal-footer-actions">
          <a-button @click="closeModal">取消</a-button>
          <a-button
            :class="modal.type === 'process' ? 'process-btn' : 'threshold-save-btn'"
            :loading="modal.confirmLoading"
            @click="handleModalOk"
          >
            {{ modal.type === 'process' ? '处理完成' : '保存配置' }}
          </a-button>
        </div>
      </template>
    </prototype-modal>
  </div>
</template>

<script>
import PrototypeModal from '@/components/prototype/PrototypeModal.vue'

const records = [
  { id: 1, name: '张三', employeeNo: 'EMP001', department: '技术部', type: '迟到', time: '2026-05-19 08:35', description: '超过上班时间5分钟', status: '未处理' },
  { id: 2, name: '李四', employeeNo: 'EMP002', department: '产品部', type: '迟到', time: '2026-05-19 08:42', description: '超过上班时间12分钟', status: '未处理' },
  { id: 3, name: '王五', employeeNo: 'EMP003', department: '市场部', type: '迟到', time: '2026-05-19 08:35', description: '超过上班时间5分钟', status: '未处理' },
  { id: 4, name: '赵六', employeeNo: 'EMP004', department: '行政部', type: '早退', time: '2026-05-19 16:45', description: '早于下班时间15分钟', status: '未处理' },
  { id: 5, name: '钱七', employeeNo: 'EMP008', department: '技术部', type: '缺卡', time: '2026-05-19', description: '下班打卡缺失', status: '未处理' },
  { id: 6, name: '孙八', employeeNo: 'EMP009', department: '仓储部', type: '旷工', time: '2026-05-19', description: '全天无打卡记录', status: '未处理' },
  { id: 7, name: '周九', employeeNo: 'EMP010', department: '财务部', type: '早退', time: '2026-05-18 16:20', description: '早于下班时间20分钟', status: '已处理' }
]

export default {
  name: 'AbnormalAttendanceRecord',
  components: {
    PrototypeModal
  },
  data() {
    return {
      activeTab: 'all',
      keyword: '',
      pagination: {
        current: 1,
        pageSize: 6
      },
      modal: {
        visible: false,
        type: 'process',
        record: null,
        confirmLoading: false
      },
      processForm: {
        action: '标记为正常',
        note: ''
      },
      thresholdForm: {
        lateMinutes: 5,
        earlyMinutes: 15,
        missingClockEnabled: true,
        absentDays: 1
      },
      statsCards: [
        { key: 'pending', label: '待处理异常', value: '6', desc: '较昨日 +2', icon: 'warning', theme: 'red' },
        { key: 'late', label: '今日迟到', value: '4', desc: '占比 2.6%', icon: 'clock-circle', theme: 'gold' },
        { key: 'early', label: '今日早退', value: '1', desc: '占比 0.6%', icon: 'logout', theme: 'orange' },
        { key: 'miss', label: '今日缺卡', value: '1', desc: '占比 0.6%', icon: 'stop', theme: 'slate' }
      ],
      columns: [
        { title: '姓名', dataIndex: 'name', key: 'name' },
        { title: '工号', dataIndex: 'employeeNo', key: 'employeeNo' },
        { title: '部门', dataIndex: 'department', key: 'department' },
        { title: '异常类型', dataIndex: 'type', key: 'type', scopedSlots: { customRender: 'type' } },
        { title: '发生时间', dataIndex: 'time', key: 'time' },
        { title: '异常说明', dataIndex: 'description', key: 'description' },
        { title: '状态', dataIndex: 'status', key: 'status', scopedSlots: { customRender: 'status' } },
        { title: '操作', key: 'action', scopedSlots: { customRender: 'action' } }
      ],
      records
    }
  },
  computed: {
    filteredRecords() {
      return this.records.filter(item => {
        if (this.activeTab !== 'all' && item.type !== this.activeTab) {
          return false
        }
        if (this.keyword.trim()) {
          const keyword = this.keyword.trim()
          if (item.name.indexOf(keyword) === -1 && item.employeeNo.indexOf(keyword) === -1) {
            return false
          }
        }
        return true
      })
    },
    pagedRecords() {
      const start = (this.pagination.current - 1) * this.pagination.pageSize
      return this.filteredRecords.slice(start, start + this.pagination.pageSize)
    },
    pendingCount() {
      return this.records.filter(item => item.status === '未处理').length
    }
  },
  methods: {
    handleNotice() {
      this.$message.info('暂无新的异常告警')
    },
    handleTabChange(key) {
      this.activeTab = key
      this.pagination.current = 1
    },
    handlePageChange(page) {
      this.pagination.current = page
    },
    openProcessModal(record) {
      this.modal.visible = true
      this.modal.type = 'process'
      this.modal.record = record
      this.processForm = {
        action: '标记为正常',
        note: ''
      }
    },
    openThresholdModal() {
      this.modal.visible = true
      this.modal.type = 'threshold'
      this.modal.record = null
    },
    closeModal() {
      this.modal.visible = false
      this.modal.confirmLoading = false
    },
    handleModalOk() {
      this.modal.confirmLoading = true
      setTimeout(() => {
        if (this.modal.type === 'process' && this.modal.record) {
          this.modal.record.status = '已处理'
          this.$message.success('异常已处理')
        } else {
          this.$message.success('异常阈值已保存')
        }
        this.modal.confirmLoading = false
        this.modal.visible = false
      }, 300)
    },
    getTypeTagColor(type) {
      return {
        迟到: 'orange',
        早退: 'gold',
        缺卡: 'red',
        旷工: 'default'
      }[type] || 'default'
    }
  }
}
</script>

<style scoped lang="less">
.abnormal-page {
  height: calc(100vh - 120px - 24px);
  padding: 24px 28px 28px;
  background: #f3f7fc;
  overflow: auto;
  color: #1f2937;
}

.page-header,
.page-header-left,
.header-actions,
.stats-card,
.threshold-panel,
.table-footer.between,
.record-grid,
.switch-row {
  display: flex;
  align-items: center;
}

.page-header,
.threshold-panel,
.table-footer.between,
.switch-row {
  justify-content: space-between;
}

.page-header {
  min-height: 72px;
  margin: -24px -28px 28px;
  padding: 0 36px;
  background: #ffffff;
  border-bottom: 1px solid #e7edf5;
}

.page-header-left {
  gap: 14px;
}

.page-header-left h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.stats-desc,
.table-footer,
.threshold-list,
.record-item span,
.record-note {
  color: #64748b;
}

.header-actions {
  gap: 12px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10px;
  line-height: 16px;
}

.header-badge.red {
  background: #fee2e2;
  color: #dc2626;
}

.header-search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 214px;
  padding: 7px 12px;
  background: #f8fafc;
  border: 1px solid #d6deea;
  border-radius: 10px;
}

.header-search-icon {
  color: #94a3b8;
  font-size: 14px;
}

.header-search-input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: #334155;
}

.icon-button {
  width: 38px;
  height: 38px;
  padding: 0;
  border-color: #d6deea;
  color: #64748b;
  background: #ffffff;
}

.threshold-btn {
  border-color: #f4c955;
  color: #b45309;
  background: #ffffff;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
}

.threshold-save-btn {
  color: #ffffff;
  background: #d97706;
  border-color: #d97706;
}

.threshold-save-btn:hover,
.threshold-save-btn:focus {
  color: #ffffff;
  background: #c26103;
  border-color: #c26103;
}

.process-btn {
  color: #ffffff;
  background: #2563eb;
  border-color: #2563eb;
  border-radius: 8px;
  font-size: 10px;
  height: 28px;
  padding: 0 12px;
}

.process-btn:hover,
.process-btn:focus {
  color: #ffffff;
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stats-card,
.threshold-panel,
.panel-card,
.record-card {
  background: #ffffff;
  border: 1px solid #d9e4f2;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.stats-card {
  justify-content: space-between;
  padding: 20px;
}

.stats-label {
  font-size: 12px;
  color: #7c90b0;
}

.stats-value {
  margin-top: 10px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.stats-desc {
  font-size: 10px;
  line-height: 1.4;
}

.stats-value.red { color: #dc2626; }
.stats-value.gold { color: #d97706; }
.stats-value.orange { color: #ea580c; }
.stats-value.slate { color: #334155; }

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stats-icon.red { background: #fee2e2; color: #dc2626; }
.stats-icon.gold { background: #fef3c7; color: #d97706; }
.stats-icon.orange { background: #ffedd5; color: #ea580c; }
.stats-icon.slate { background: #e2e8f0; color: #475569; }

.threshold-panel {
  margin-bottom: 24px;
  padding: 18px 20px;
  gap: 16px;
  background: #fff9eb;
  border-color: #fde68a;
  align-items: flex-start;
}

.threshold-icon {
  margin-top: 3px;
  color: #d97706;
  font-size: 16px;
}

.threshold-title {
  font-size: 15px;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 10px;
}

.threshold-list {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #a16207;
  line-height: 1.9;
}

.panel-card {
  padding: 0;
}

.table-footer {
  margin-top: 0;
  padding: 16px 24px 18px;
  font-size: 13px;
}

.record-card {
  padding: 16px;
  background: #f8fafc;
  box-shadow: none;
}

.record-grid {
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.record-item {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.record-note {
  line-height: 1.7;
}

.modal-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.abnormal-page /deep/ .ant-tag {
  margin-right: 0;
  border-radius: 6px;
  font-size: 10px;
  line-height: 18px;
  padding: 0 8px;
}

.abnormal-page /deep/ .ant-tabs-bar {
  margin: 0;
  padding: 0 20px;
  border-bottom: 1px solid #e8eef6;
}

.abnormal-page /deep/ .ant-tabs-tab {
  padding: 14px 0;
  margin-right: 44px;
  font-size: 14px;
  color: #475569;
}

.abnormal-page /deep/ .ant-tabs-tab-active {
  color: #2563eb;
}

.abnormal-page /deep/ .ant-tabs-ink-bar {
  background: #2563eb;
  height: 2px;
}

.abnormal-page /deep/ .ant-tabs-content {
  padding: 16px 0 0;
}

.abnormal-page /deep/ .ant-table-thead > tr > th {
  padding: 18px 22px;
  background: #f8fafc;
  border-bottom: 1px solid #dbe5f1;
  color: #475569;
  font-weight: 600;
  font-size: 13px;
}

.abnormal-page /deep/ .ant-table-tbody > tr > td {
  padding: 18px 22px;
  border-bottom: 1px solid #edf2f7;
  font-size: 13px;
}

.abnormal-page /deep/ .ant-table-tbody > tr:hover > td {
  background: #fafcff;
}

.abnormal-page /deep/ .ant-btn {
  border-radius: 8px;
}

.abnormal-modal /deep/ .ant-btn-primary {
  background: #2563eb;
  border-color: #2563eb;
}

.abnormal-modal /deep/ .ant-btn-primary:hover,
.abnormal-modal /deep/ .ant-btn-primary:focus {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.abnormal-modal /deep/ .ant-modal-content {
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
}

.abnormal-modal /deep/ .ant-modal-header {
  padding: 24px 24px 0;
  border-bottom: 0;
}

.abnormal-modal /deep/ .ant-modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.abnormal-modal /deep/ .ant-modal-close-x {
  width: 48px;
  height: 48px;
  line-height: 48px;
  color: #94a3b8;
}

.abnormal-modal /deep/ .ant-modal-body {
  padding: 24px;
}

.abnormal-modal /deep/ .ant-modal-footer {
  border-top: 0;
  padding: 0 24px 24px;
}

.abnormal-modal /deep/ .ant-modal-footer .ant-btn {
  height: 38px;
  padding: 0 18px;
  border-radius: 10px;
  margin-left: 0;
}

.abnormal-page /deep/ .ant-pagination-item,
.abnormal-page /deep/ .ant-pagination-prev,
.abnormal-page /deep/ .ant-pagination-next {
  border-radius: 8px;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
  }

  .header-search {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .threshold-panel,
  .table-footer.between {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
