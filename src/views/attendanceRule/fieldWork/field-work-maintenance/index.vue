<template>
  <div class="page-container field-page">
    <div class="page-header">
      <div class="page-header-left">
        <h1>外勤出差管理</h1>
        <span class="header-badge blue">今日外勤 {{ statsCards[0].value }}人</span>
      </div>
      <div class="header-actions">
        <a-button class="primary-action-btn" icon="plus" @click="openApplyModal">申请外勤</a-button>
        <a-button class="icon-button" icon="bell" @click="handleNotice" />
      </div>
    </div>

    <div class="stats-grid">
      <div v-for="item in statsCards" :key="item.key" class="stats-card">
        <div>
          <div class="stats-label">{{ item.label }}</div>
          <div :class="['stats-value', item.theme]">{{ item.value }} <span v-if="item.unit">{{ item.unit }}</span></div>
          <div v-if="item.desc" class="stats-desc">{{ item.desc }}</div>
        </div>
        <div :class="['stats-icon', item.theme]"><a-icon :type="item.icon" /></div>
      </div>
    </div>

    <div class="panel-card">
      <a-form-model layout="inline" :model="filterForm" class="filter-bar">
        <a-form-model-item>
          <a-select v-model="filterForm.type" allowClear placeholder="全部类型" style="width: 140px">
            <a-select-option value="外勤">外勤</a-select-option>
            <a-select-option value="出差">出差</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item class="filter-item-grow">
          <a-input v-model="filterForm.keyword" allowClear placeholder="搜索..." />
        </a-form-model-item>
      </a-form-model>

      <a-table rowKey="id" :columns="columns" :dataSource="pagedRecords" :pagination="false">
        <template slot="type" slot-scope="text, record">
          <a-tag :color="record.type === '外勤' ? 'blue' : 'purple'">{{ record.type }}</a-tag>
        </template>
        <template slot="status" slot-scope="text, record">
          <a-tag :color="getStatusTagColor(record.status)">{{ record.status }}</a-tag>
        </template>
        <template slot="action" slot-scope="text, record">
          <a @click="openTrackModal(record)">轨迹</a>
        </template>
      </a-table>

      <div class="table-footer between">
        <span>共 {{ filteredRecords.length }} 条外勤记录</span>
        <a-pagination
          size="small"
          :current="pagination.current"
          :pageSize="pagination.pageSize"
          :total="filteredRecords.length"
          @change="handlePageChange"
        />
      </div>
    </div>

    <div class="panel-card">
      <div class="panel-header">
        <div>
          <div class="panel-title">外勤点管理</div>
          <div class="panel-subtitle">维护常用外勤地点和实时在场人数</div>
        </div>
        <a-button class="primary-action-btn" icon="plus" @click="openLocationModal">新增外勤点</a-button>
      </div>

      <div class="location-grid">
        <div v-for="item in locations" :key="item.id" class="location-card">
          <div class="location-head">
            <div :class="['location-icon', item.theme]"><a-icon :type="item.icon" /></div>
            <strong>{{ item.name }}</strong>
          </div>
          <div class="location-address">{{ item.address }}</div>
          <div class="location-count">{{ item.statusText }}</div>
        </div>
      </div>
    </div>

    <prototype-modal
      v-model="modal.visible"
      :title="modalTitle"
      :loading="modal.confirmLoading"
      :showOk="modal.type !== 'track'"
      :okText="modal.type === 'location' ? '保存' : '提交'"
      :cancelText="modal.type === 'track' ? '关闭' : '取消'"
      :showCancel="modal.type !== 'track'"
      wrapClassName="field-modal"
      @confirm="handleModalOk"
      @cancel="closeModal"
    >
      <a-form-model v-if="modal.type === 'apply'" :model="applyForm" layout="vertical">
        <a-form-model-item label="外勤类型">
          <a-select v-model="applyForm.type">
            <a-select-option value="外勤">外勤</a-select-option>
            <a-select-option value="出差">出差</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="目的地">
          <a-input v-model="applyForm.destination" placeholder="请输入目的地" />
        </a-form-model-item>
        <a-form-model-item label="开始时间">
          <a-date-picker v-model="applyForm.startTime" showTime style="width: 100%" />
        </a-form-model-item>
        <a-form-model-item label="结束时间">
          <a-date-picker v-model="applyForm.endTime" showTime style="width: 100%" />
        </a-form-model-item>
        <a-form-model-item label="外勤事由">
          <a-textarea v-model="applyForm.reason" :rows="4" placeholder="请填写外勤原因" />
        </a-form-model-item>
      </a-form-model>

      <a-form-model v-else-if="modal.type === 'location'" :model="locationForm" layout="vertical">
        <a-form-model-item label="外勤点名称">
          <a-input v-model="locationForm.name" />
        </a-form-model-item>
        <a-form-model-item label="详细地址">
          <a-input v-model="locationForm.address" />
        </a-form-model-item>
        <a-form-model-item label="定位坐标">
          <a-input v-model="locationForm.coordinate" placeholder="纬度 / 经度" />
        </a-form-model-item>
      </a-form-model>

      <div v-else-if="modal.record" class="track-panel">
        <div class="track-profile">
          <span class="track-avatar">{{ modal.record.name.slice(0, 1) }}</span>
          <div>
            <div class="track-name">{{ modal.record.name }}</div>
            <div class="track-role">外勤人员</div>
          </div>
        </div>
        <div class="timeline">
          <div v-for="item in modal.record.timeline" :key="item.time" class="timeline-item">
            <div class="timeline-dot"></div>
            <div>
              <div class="timeline-time">{{ item.time }}</div>
              <div class="timeline-text">{{ item.text }}</div>
            </div>
          </div>
        </div>
      </div>

      <template slot="footer">
        <div class="modal-footer-actions" :class="{ single: modal.type === 'track' }">
          <a-button v-if="modal.type !== 'track'" @click="closeModal">取消</a-button>
          <a-button v-if="modal.type === 'apply'" class="primary-action-btn" :loading="modal.confirmLoading" @click="handleModalOk">提交</a-button>
          <a-button v-else-if="modal.type === 'location'" class="primary-action-btn" :loading="modal.confirmLoading" @click="handleModalOk">保存</a-button>
          <a-button v-else @click="closeModal">关闭</a-button>
        </div>
      </template>
    </prototype-modal>
  </div>
</template>

<script>
import moment from 'moment'
import PrototypeModal from '@/components/prototype/PrototypeModal.vue'

const records = [
  { id: 1, name: '张三', employeeNo: 'EMP001', type: '外勤', destination: '北京总部', startTimeText: '08:30', endTimeText: '17:30', status: '已签到', timeline: [{ time: '08:30', text: '到达北京总部 - 朝阳区建国路88号' }, { time: '10:15', text: '拜访客户 - 海淀区中关村大街1号' }, { time: '14:00', text: '返回北京总部' }, { time: '17:30', text: '签退 - 北京总部' }] },
  { id: 2, name: '李四', employeeNo: 'EMP002', type: '出差', destination: '上海', startTimeText: '2026-05-18', endTimeText: '2026-05-20', status: '进行中', timeline: [{ time: '08:00', text: '抵达上海客户现场' }, { time: '13:00', text: '项目现场巡检' }] },
  { id: 3, name: '王五', employeeNo: 'EMP003', type: '外勤', destination: '广州办事处', startTimeText: '09:00', endTimeText: '—', status: '待签到', timeline: [{ time: '09:00', text: '等待签到确认' }] },
  { id: 4, name: '赵六', employeeNo: 'EMP004', type: '外勤', destination: '深圳仓库', startTimeText: '10:00', endTimeText: '18:00', status: '已签到', timeline: [{ time: '10:02', text: '到达深圳仓库' }, { time: '18:05', text: '签退 - 深圳仓库' }] }
]

export default {
  name: 'FieldWorkMaintenance',
  components: {
    PrototypeModal
  },
  data() {
    return {
      modal: {
        visible: false,
        type: 'apply',
        record: null,
        confirmLoading: false
      },
      filterForm: {
        type: undefined,
        keyword: ''
      },
      pagination: {
        current: 1,
        pageSize: 4
      },
      applyForm: {
        type: '外勤',
        destination: '',
        startTime: moment('2026-05-19 09:00', 'YYYY-MM-DD HH:mm'),
        endTime: moment('2026-05-19 17:00', 'YYYY-MM-DD HH:mm'),
        reason: ''
      },
      locationForm: {
        name: '',
        address: '',
        coordinate: ''
      },
      statsCards: [
        { key: 'today', label: '今日外勤', value: '20', unit: '人', desc: '', icon: 'environment', theme: 'blue' },
        { key: 'trip', label: '出差中', value: '8', unit: '人', desc: '跨城市 5 人', icon: 'car', theme: 'purple' },
        { key: 'pending', label: '待审批', value: '4', unit: '', desc: '', icon: 'file-done', theme: 'gold' },
        { key: 'month', label: '本月外勤次数', value: '86', unit: '次', desc: '', icon: 'rise', theme: 'green' }
      ],
      columns: [
        { title: '姓名', dataIndex: 'name', key: 'name' },
        { title: '工号', dataIndex: 'employeeNo', key: 'employeeNo' },
        { title: '类型', dataIndex: 'type', key: 'type', scopedSlots: { customRender: 'type' } },
        { title: '目的地', dataIndex: 'destination', key: 'destination' },
        { title: '开始时间', dataIndex: 'startTimeText', key: 'startTimeText' },
        { title: '结束时间', dataIndex: 'endTimeText', key: 'endTimeText' },
        { title: '状态', dataIndex: 'status', key: 'status', scopedSlots: { customRender: 'status' } },
        { title: '操作', key: 'action', scopedSlots: { customRender: 'action' } }
      ],
      records,
      locations: [
        { id: 1, name: '北京总部', address: '朝阳区建国路88号', statusText: '今日外勤 12 人', theme: 'blue', icon: 'bank' },
        { id: 2, name: '上海仓库', address: '浦东新区张江路200号', statusText: '今日外勤 8 人', theme: 'purple', icon: 'shop' },
        { id: 3, name: '广州办事处', address: '天河区天河路385号', statusText: '今日外勤 0 人', theme: 'gold', icon: 'build' }
      ]
    }
  },
  computed: {
    filteredRecords() {
      return this.records.filter(item => {
        if (this.filterForm.type && item.type !== this.filterForm.type) {
          return false
        }
        if (this.filterForm.keyword && item.name.indexOf(this.filterForm.keyword.trim()) === -1 && item.destination.indexOf(this.filterForm.keyword.trim()) === -1) {
          return false
        }
        return true
      })
    },
    pagedRecords() {
      const start = (this.pagination.current - 1) * this.pagination.pageSize
      return this.filteredRecords.slice(start, start + this.pagination.pageSize)
    },
    modalTitle() {
      if (this.modal.type === 'apply') {
        return '申请外勤'
      }
      if (this.modal.type === 'location') {
        return '新增外勤点'
      }
      return this.modal.record ? this.modal.record.name + ' - 外勤轨迹' : '外勤轨迹'
    }
  },
  methods: {
    handleNotice() {
      this.$message.info('暂无新的外勤提醒')
    },
    handlePageChange(page) {
      this.pagination.current = page
    },
    openApplyModal() {
      this.modal.visible = true
      this.modal.type = 'apply'
      this.modal.record = null
    },
    openLocationModal() {
      this.modal.visible = true
      this.modal.type = 'location'
      this.modal.record = null
      this.locationForm = {
        name: '',
        address: '',
        coordinate: ''
      }
    },
    openTrackModal(record) {
      this.modal.visible = true
      this.modal.type = 'track'
      this.modal.record = record
    },
    closeModal() {
      this.modal.visible = false
      this.modal.confirmLoading = false
    },
    handleModalOk() {
      this.modal.confirmLoading = true
      setTimeout(() => {
        if (this.modal.type === 'apply') {
          this.$message.success('外勤申请已提交')
        } else if (this.modal.type === 'location') {
          this.locations.push({
            id: Date.now(),
            name: this.locationForm.name || '新外勤点',
            address: this.locationForm.address || '待补充地址',
            statusText: '今日外勤 0 人',
            theme: 'blue',
            icon: 'environment'
          })
          this.$message.success('外勤点已添加')
        }
        this.modal.confirmLoading = false
        this.modal.visible = false
      }, 300)
    },
    getStatusTagColor(status) {
      return {
        已签到: 'green',
        进行中: 'blue',
        待签到: 'orange'
      }[status] || 'default'
    }
  }
}
</script>

<style scoped lang="less">
.field-page {
  height: calc(100vh - 120px - 24px);
  padding: 24px;
  background: #f3f7fc;
  overflow: auto;
  color: #1f2937;
}

.page-header,
.page-header-left,
.header-actions,
.stats-card,
.panel-header,
.table-footer.between,
.location-head,
.track-profile,
.timeline-item {
  display: flex;
  align-items: center;
}

.page-header,
.panel-header,
.table-footer.between {
  justify-content: space-between;
}

.page-header {
  height: 64px;
  margin-bottom: 24px;
  margin: -24px -24px 24px;
  padding: 0 32px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.page-header-left {
  gap: 14px;
}

.page-header-left h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.panel-subtitle,
.table-footer,
.location-address,
.track-role,
.timeline-text {
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
  font-size: 12px;
  line-height: 18px;
}

.header-badge.blue {
  background: #dbeafe;
  color: #4f46e5;
}

.icon-button {
  width: 36px;
  height: 36px;
  padding: 0;
  border-color: #d6deea;
  color: #64748b;
  background: #ffffff;
}

.primary-action-btn {
  color: #ffffff;
  background: #4f46e5;
  border-color: #4f46e5;
}

.primary-action-btn:hover,
.primary-action-btn:focus {
  color: #ffffff;
  background: #4338ca;
  border-color: #4338ca;
}

.stats-grid,
.location-grid {
  display: grid;
  gap: 16px;
}

.stats-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 24px;
}

.stats-card,
.panel-card,
.location-card {
  background: #ffffff;
  border: 1px solid #dbe6f3;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.stats-card {
  justify-content: space-between;
  padding: 24px;
}

.stats-label {
  font-size: 14px;
  color: #94a3b8;
}

.stats-value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 700;
}

.stats-value span {
  font-size: 14px;
  font-weight: 400;
  color: #94a3b8;
}

.stats-value.blue { color: #4f46e5; }
.stats-value.purple { color: #7c3aed; }
.stats-value.gold { color: #d97706; }
.stats-value.green { color: #16a34a; }

.stats-desc {
  margin-top: 8px;
  font-size: 12px;
}

.stats-icon,
.location-icon,
.track-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.stats-icon {
  width: 52px;
  height: 52px;
  font-size: 22px;
}

.stats-icon.blue { background: #eef2ff; color: #4f46e5; }
.stats-icon.purple { background: #f3e8ff; color: #7c3aed; }
.stats-icon.gold { background: #fef3c7; color: #d97706; }
.stats-icon.green { background: #dcfce7; color: #16a34a; }

.panel-card {
  padding: 24px;
  margin-bottom: 24px;
}

.filter-bar {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-item-grow {
  flex: 1;
  min-width: 220px;
}

.table-footer {
  margin-top: 16px;
  font-size: 13px;
}

.location-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.location-card {
  padding: 18px;
}

.location-head {
  gap: 10px;
  margin-bottom: 10px;
}

.location-icon {
  width: 36px;
  height: 36px;
  font-size: 16px;
}

.location-icon.blue { background: #eef2ff; color: #4f46e5; }
.location-icon.purple { background: #f3e8ff; color: #7c3aed; }
.location-icon.gold { background: #fef3c7; color: #d97706; }

.location-count {
  margin-top: 12px;
  color: #16a34a;
  font-size: 13px;
  font-weight: 600;
}

.field-page /deep/ .ant-table-thead > tr > th,
.field-page /deep/ .ant-table-tbody > tr > td {
  text-align: center;
}

.field-page /deep/ .ant-table-thead > tr > th {
  font-size: 13px;
  color: #64748b;
}

.field-page /deep/ .ant-table-tbody > tr > td {
  font-size: 14px;
}

.field-page /deep/ .ant-tag {
  margin-right: 0;
  border-radius: 6px;
  font-size: 12px;
}

.track-panel {
  display: grid;
  gap: 16px;
}

.modal-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-footer-actions.single {
  justify-content: flex-end;
}

.track-profile {
  gap: 12px;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 16px;
}

.track-avatar {
  width: 44px;
  height: 44px;
  background: #dbeafe;
  color: #2563eb;
  font-size: 18px;
  font-weight: 700;
}

.track-name {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.timeline {
  display: grid;
  gap: 14px;
}

.timeline-item {
  gap: 12px;
  align-items: flex-start;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #22c55e;
  margin-top: 5px;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.12);
}

.timeline-time {
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.field-page /deep/ .ant-btn-primary,
.field-modal /deep/ .ant-btn-primary {
  background: #4f46e5;
  border-color: #4f46e5;
}

.field-page /deep/ .ant-btn-primary:hover,
.field-page /deep/ .ant-btn-primary:focus,
.field-modal /deep/ .ant-btn-primary:hover,
.field-modal /deep/ .ant-btn-primary:focus {
  background: #4338ca;
  border-color: #4338ca;
}

.field-modal /deep/ .ant-modal-content {
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
}

.field-modal /deep/ .ant-modal-header {
  padding: 24px 24px 0;
  border-bottom: 0;
}

.field-modal /deep/ .ant-modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.field-modal /deep/ .ant-modal-close-x {
  width: 48px;
  height: 48px;
  line-height: 48px;
  color: #94a3b8;
}

.field-modal /deep/ .ant-modal-body {
  padding: 24px;
}

.field-modal /deep/ .ant-modal-footer {
  border-top: 0;
  padding: 0 24px 24px;
}

.field-modal /deep/ .ant-modal-footer .ant-btn {
  height: 38px;
  padding: 0 18px;
  border-radius: 10px;
  margin-left: 0;
}

@media (max-width: 1100px) {
  .stats-grid,
  .location-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    height: auto;
    padding: 16px 24px;
  }

  .stats-grid,
  .location-grid {
    grid-template-columns: 1fr;
  }

  .table-footer.between {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
