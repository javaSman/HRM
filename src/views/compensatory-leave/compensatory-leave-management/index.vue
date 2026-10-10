<template>
  <div class="page-container comp-page">
    <div class="stats-grid">
      <div v-for="item in statsCards" :key="item.key" class="stats-card">
        <div class="stats-label">{{ item.label }}</div>
        <div :class="['stats-value', item.theme]">{{ item.value }} <span>{{ item.unit }}</span></div>
      </div>
    </div>

    <div class="panel-card">
      <a-form-model layout="inline" :model="filterForm" class="filter-bar">
        <a-form-model-item>
          <a-select v-model="filterForm.department" allowClear placeholder="全部部门" style="width: 140px">
            <a-select-option value="技术部">技术部</a-select-option>
            <a-select-option value="产品部">产品部</a-select-option>
            <a-select-option value="人事部">人事部</a-select-option>
            <a-select-option value="财务部">财务部</a-select-option>
            <a-select-option value="市场部">市场部</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item>
          <a-select v-model="filterForm.status" allowClear placeholder="全部状态" style="width: 140px">
            <a-select-option value="正常">正常</a-select-option>
            <a-select-option value="即将过期">即将过期</a-select-option>
            <a-select-option value="已过期">已过期</a-select-option>
            <a-select-option value="已用完">已用完</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item class="filter-item-grow">
          <a-input v-model="filterForm.keyword" allowClear placeholder="搜索姓名/工号" />
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="primary" @click="handleQuery">查询</a-button>
        </a-form-model-item>
        <a-form-model-item>
          <a-button icon="download" @click="handleExport">导出</a-button>
        </a-form-model-item>
      </a-form-model>

      <a-table rowKey="id" :columns="columns" :dataSource="pagedRecords" :pagination="false">
        <template slot="remaining" slot-scope="text, record">
          <span :class="['remaining-text', getRemainingTheme(record.status)]">{{ record.remaining }}</span>
        </template>
        <template slot="remainingDays" slot-scope="text, record">
          <span :class="['remaining-days', getRemainingTheme(record.status)]">{{ record.remainingDays }}</span>
        </template>
        <template slot="status" slot-scope="text, record">
          <a-tag :color="getStatusTagColor(record.status)">{{ record.status }}</a-tag>
        </template>
      </a-table>

      <div class="table-footer between">
        <span>显示 {{ pagedRecords.length }} 条，共 {{ filteredRecords.length }} 条记录</span>
        <a-pagination
          size="small"
          :current="pagination.current"
          :pageSize="pagination.pageSize"
          :total="filteredRecords.length"
          @change="handlePageChange"
        />
      </div>
    </div>

    <div class="info-grid">
      <div class="info-card info-blue">
        <div class="info-title">调休策略说明</div>
        <ul>
          <li>调休有效期为 3 个月，从加班发生日起算。</li>
          <li>过期前 7 天系统自动发送提醒通知员工。</li>
          <li>过期未使用的调休自动作废，无法恢复。</li>
          <li>调休时长以小时为单位，大于等于 1 天按天计算。</li>
          <li>系统自动校验调休余额，余额不足无法提交调休申请。</li>
        </ul>
      </div>
      <div class="info-card info-gold">
        <div class="info-title">提醒设置</div>
        <ul>
          <li>到期前 7 天自动提醒员工（系统通知 + 消息）。</li>
          <li>部门主管可查看下属调休即将过期名单。</li>
          <li>过期自动作废，系统保留完整操作日志。</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
const records = [
  { id: 1, employeeNo: 'EMP001', name: '张三', department: '技术部', total: '32h', used: '8h', remaining: '24h', remainingDays: '58 天', expireDate: '2026-08-15', status: '正常' },
  { id: 2, employeeNo: 'EMP005', name: '钱七', department: '人事部', total: '16h', used: '4h', remaining: '12h', remainingDays: '8 天', expireDate: '2026-06-02', status: '即将过期' },
  { id: 3, employeeNo: 'EMP010', name: '陈二', department: '产品部', total: '40h', used: '28h', remaining: '12h', remainingDays: '1 天', expireDate: '2026-05-25', status: '即将过期' },
  { id: 4, employeeNo: 'EMP012', name: '黄四', department: '财务部', total: '24h', used: '24h', remaining: '0h', remainingDays: '-', expireDate: '2026-05-10', status: '已用完' },
  { id: 5, employeeNo: 'EMP007', name: '周九', department: '市场部', total: '20h', used: '0h', remaining: '20h', remainingDays: '已过期', expireDate: '2026-05-18', status: '已过期' },
  { id: 6, employeeNo: 'EMP021', name: '刘一', department: '技术部', total: '12h', used: '2h', remaining: '10h', remainingDays: '35 天', expireDate: '2026-07-20', status: '正常' }
]

export default {
  name: 'CompensatoryLeaveManagement',
  data() {
    return {
      filterForm: {
        department: undefined,
        status: undefined,
        keyword: ''
      },
      pagination: {
        current: 1,
        pageSize: 5
      },
      statsCards: [
        { key: 'accounts', label: '账户总数', value: '1,286', unit: '个', theme: 'slate' },
        { key: 'add', label: '本月新增调休', value: '96', unit: 'h', theme: 'green' },
        { key: 'used', label: '本月已使用', value: '42', unit: 'h', theme: 'gold' },
        { key: 'expire', label: '即将过期 (<15天)', value: '68', unit: 'h', theme: 'red' }
      ],
      columns: [
        { title: '工号', dataIndex: 'employeeNo', key: 'employeeNo' },
        { title: '姓名', dataIndex: 'name', key: 'name' },
        { title: '部门', dataIndex: 'department', key: 'department' },
        { title: '累计调休', dataIndex: 'total', key: 'total' },
        { title: '已使用', dataIndex: 'used', key: 'used' },
        { title: '剩余', dataIndex: 'remaining', key: 'remaining', scopedSlots: { customRender: 'remaining' } },
        { title: '剩余天数', dataIndex: 'remainingDays', key: 'remainingDays', scopedSlots: { customRender: 'remainingDays' } },
        { title: '有效期至', dataIndex: 'expireDate', key: 'expireDate' },
        { title: '状态', dataIndex: 'status', key: 'status', scopedSlots: { customRender: 'status' } }
      ],
      records
    }
  },
  computed: {
    filteredRecords() {
      return this.records.filter(item => {
        if (this.filterForm.department && item.department !== this.filterForm.department) {
          return false
        }
        if (this.filterForm.status && item.status !== this.filterForm.status) {
          return false
        }
        if (this.filterForm.keyword) {
          const keyword = this.filterForm.keyword.trim()
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
    }
  },
  methods: {
    handleQuery() {
      this.pagination.current = 1
      this.$message.success('筛选条件已更新')
    },
    handleExport() {
      this.$message.success('调休数据导出中')
    },
    handlePageChange(page) {
      this.pagination.current = page
    },
    getStatusTagColor(status) {
      return {
        正常: 'green',
        即将过期: 'orange',
        已过期: 'red',
        已用完: 'default'
      }[status] || 'default'
    },
    getRemainingTheme(status) {
      return {
        正常: 'green',
        即将过期: 'orange',
        已过期: 'red',
        已用完: 'muted'
      }[status] || 'green'
    }
  }
}
</script>

<style scoped lang="less">
.comp-page {
  height: calc(100vh - 120px - 24px);
  padding: 24px;
  background: #f3f7fc;
  overflow: auto;
  color: #1f2937;
}

.page-header,
.page-title-row,
.table-footer.between {
  display: flex;
  align-items: center;
}

.page-header,
.table-footer.between {
  justify-content: space-between;
}

.page-header {
  margin-bottom: 24px;
}

.page-title-row {
  gap: 12px;
  margin-bottom: 6px;
}

.page-title-row h1 {
  margin: 0;
  font-size: 28px;
}

.page-subtitle,
.table-footer,
.stats-label {
  color: #64748b;
}

.stats-grid,
.info-grid {
  display: grid;
  gap: 16px;
}

.stats-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 24px;
}

.stats-card,
.panel-card,
.info-card {
  background: #ffffff;
  border: 1px solid #dbe6f3;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.stats-card {
  padding: 24px;
}

.stats-value {
  margin-top: 10px;
  font-size: 24px;
  font-weight: 700;
}

.stats-value span {
  font-size: 14px;
  font-weight: 400;
  color: #94a3b8;
}

.stats-value.slate { color: #111827; }
.stats-value.green { color: #16a34a; }
.stats-value.gold { color: #d97706; }
.stats-value.red { color: #dc2626; }

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

.comp-page /deep/ .ant-btn-primary {
  background: #4f46e5;
  border-color: #4f46e5;
}

.comp-page /deep/ .ant-btn-primary:hover,
.comp-page /deep/ .ant-btn-primary:focus {
  background: #4338ca;
  border-color: #4338ca;
}

.table-footer {
  margin-top: 16px;
  font-size: 13px;
  color: #64748b;
}

.remaining-text.green,
.remaining-days.green { color: #16a34a; font-weight: 700; }
.remaining-text.orange,
.remaining-days.orange { color: #d97706; font-weight: 700; }
.remaining-text.red,
.remaining-days.red { color: #dc2626; font-weight: 700; }
.remaining-text.muted,
.remaining-days.muted { color: #94a3b8; font-weight: 700; }

.info-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.info-card {
  padding: 20px;
}

.info-blue {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.info-gold {
  background: #fffbeb;
  border-color: #fde68a;
}

.info-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
}

.info-blue .info-title,
.info-blue ul {
  color: #1d4ed8;
}

.info-gold .info-title,
.info-gold ul {
  color: #b45309;
}

.info-card ul {
  margin: 0;
  padding-left: 18px;
  line-height: 1.7;
  font-size: 14px;
}

.comp-page /deep/ .ant-table-thead > tr > th {
  font-size: 13px;
  color: #64748b;
}

.comp-page /deep/ .ant-table-tbody > tr > td {
  font-size: 14px;
}

@media (max-width: 1100px) {
  .stats-grid,
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .stats-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .table-footer.between {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
