<template>
  <div class="blacklist-page">
    <div class="recruitment-status-filter">
      <a-tabs v-model="currentStatus" type="card" @change="handleTabChange">
        <a-tab-pane v-for="item in statusOptions" :key="item.value">
          <span slot="tab" :data-status="item.code">{{ item.label }}({{ item.count }})</span>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div v-if="isActive" class="table-operator blacklist-operator">
      <a-button type="primary" class="pm-btn-primary" @click="batchRemove">批量移出</a-button>
      <a-button type="primary" class="pm-btn-primary" icon="download" @click="handleExportXls('黑名单列表')">
        导出
      </a-button>
      <a-button type="primary" class="pm-btn-primary" icon="plus" @click="handleAdd">加入黑名单</a-button>
    </div>

    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="姓名">
              <a-input v-model.trim="queryParam.xm" allowClear placeholder="请输入姓名" />
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="手机号">
              <a-input v-model.trim="queryParam.sjh" allowClear placeholder="请输入手机号" />
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="5" :md="6" :sm="12" :xs="24">
            <a-form-item label="身份证号">
              <a-input v-model.trim="queryParam.sfzh" allowClear placeholder="请输入身份证号" />
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="黑名单等级">
              <a-select v-model="queryParam.hmddj" allowClear placeholder="全部">
                <a-select-option v-for="item in levelOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="5" :lg="7" :md="8" :sm="12" :xs="24">
            <a-form-item label="加入时间">
              <a-range-picker
                v-model="joinTimeRange"
                format="YYYY-MM-DD"
                :placeholder="['开始日期', '结束日期']"
                style="width: 100%"
                @change="handleJoinTimeChange"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="来源渠道">
              <a-select v-model="queryParam.lyqd" allowClear placeholder="全部">
                <a-select-option v-for="item in sourceOptions" :key="item.value" :value="item.value">
                  {{ item.shortLabel }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="5" :md="8" :sm="12" :xs="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" class="pm-btn-primary" icon="search" @click="searchQuery">查询</a-button>
              <a-button class="pm-btn-reset" icon="reload" @click="searchReset">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <blacklist-stat-cards :summary="summary" />

    <div>
      <!-- <a-alert v-if="isActive" type="info" showIcon class="selection-alert">
        <span slot="message">
          已选择 <a class="selected-count">{{ selectedRowKeys.length }}</a> 项
          <a class="clear-selection" @click="onClearSelected">清空</a>
        </span>
      </a-alert> -->
      <a-table
        ref="table"
        size="middle"
        :scroll="{ x: 1400, y: 460 }"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading || operationLoading"
        :rowSelection="rowSelection"
        class="j-table-force-nowrap blacklist-table"
        @change="handleTableChange"
      >
        <span slot="rowIndex" slot-scope="text, record, index">{{ getRowIndex(index) }}</span>
        <span slot="hmddj" slot-scope="text" :class="['black-level-tag', getLevelClass(text)]">
          <span class="dot"></span>{{ getLevelText(text) }}
        </span>
        <span slot="lyqd" slot-scope="text">{{ getSourceText(text) }}</span>
        <span slot="action" slot-scope="text, record">
          <a @click="handleDetail(record)">详情</a>
          <template v-if="isActive">
            <a-divider type="vertical" />
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a class="remove-action" @click="handleRemove(record)">移出</a>
          </template>
          <template v-else>
            <a-divider type="vertical" />
            <a @click="handleRejoin(record)">重新加入</a>
          </template>
        </span>
      </a-table>
    </div>

    <hrm-hmdlb-modal ref="modalForm" @ok="handleFormSaved" />
    <hrm-hmdlb-remove-modal ref="removeModal" @ok="handleRemoveConfirm" @batch-ok="handleBatchRemoveConfirm" />
    <hrm-hmdlb-detail-modal ref="detailModal" @edit="handleEdit" @remove="handleRemove" @rejoin="handleRejoin" />
  </div>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { getAction, httpAction } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { mixinDevice } from '@/utils/mixin'
import {
  LEVEL_OPTIONS,
  SOURCE_OPTIONS,
  STATUS_ACTIVE,
  STATUS_REMOVED,
  fetchBlacklistSummary,
  getBlacklistColumns,
  getCurrentOperator,
  getLevelClass,
  getLevelText,
  getNowText,
  getRemovalRestriction,
  getSourceText
} from './blackListConfig'
import BlacklistStatCards from './modules/BlacklistStatCards.vue'
import HrmHmdlbModal from './modules/HrmHmdlbModal.vue'
import HrmHmdlbRemoveModal from './modules/HrmHmdlbRemoveModal.vue'
import HrmHmdlbDetailModal from './modules/HrmHmdlbDetailModal.vue'

function getDefaultQuery(status) {
  return {
    xm: '',
    sjh: '',
    sfzh: '',
    hmddj: undefined,
    jrsj_begin: '',
    jrsj_end: '',
    lyqd: undefined,
    status,
  }
}

const SUMMARY_FIELD_MAP = {
  黑名单总数: 'total',
  在榜: 'total',
  已移出: 'removed',
  '1年': 'oneYear',
  '3年': 'threeYear',
  '5年': 'fiveYear',
  永久: 'permanent',
}

export default {
  name: 'HrmHmdlbList',
  mixins: [JeecgListMixin, mixinDevice],
  components: { BlacklistStatCards, HrmHmdlbModal, HrmHmdlbRemoveModal, HrmHmdlbDetailModal },
  data() {
    return {
      disableMixinCreated: true,
      currentStatus: STATUS_ACTIVE,
      statusOptions: [
        { label: '在榜列表', value: STATUS_ACTIVE, code: 'blue', count: 0 },
        { label: '已移出', value: STATUS_REMOVED, code: 'green', count: 0 },
      ],
      joinTimeRange: [],
      levelOptions: LEVEL_OPTIONS,
      sourceOptions: SOURCE_OPTIONS,
      queryParam: getDefaultQuery(STATUS_ACTIVE),
      columns: getBlacklistColumns(STATUS_ACTIVE),
      summary: { total: 0, oneYear: 0, threeYear: 0, fiveYear: 0, permanent: 0, removed: 0 },
      operationLoading: false,
      url: {
        list: '/zpManage/hrmHmdlb/list',
        edit: '/zpManage/hrmHmdlb/edit',
        batchMove: '/zpManage/hrmHmdlb/batchMove',
        queryById: '/zpManage/hrmHmdlb/queryById',
        exportXlsUrl: '/zpManage/hrmHmdlb/exportXls',
      },
    }
  },
  computed: {
    isActive() {
      return this.currentStatus === STATUS_ACTIVE
    },
    rowSelection() {
      return this.isActive ? { selectedRowKeys: this.selectedRowKeys, onChange: this.onSelectChange } : null
    },
  },
  created() {
    this.ipagination.pageSize = 10
    this.ipagination.pageSizeOptions = ['10', '20', '50']
    this.loadSummary()
    this.loadData(1)
  },
  methods: {
    initDictConfig() {},
    loadData(arg) {
      JeecgListMixin.methods.loadData.call(this, arg)
      this.getStatusTotal()
    },
    getStatusTotal() {
      const getTotalUrl = this.url.list.replace(/\/list$/, '/getTotal')
      httpAction(getTotalUrl, '', 'get')
        .then((res) => {
          if (res && res.success && Array.isArray(res.result)) {
            const nextSummary = Object.assign({}, this.summary)
            res.result.forEach((item) => {
              const summaryField = SUMMARY_FIELD_MAP[item.statusText]
              if (summaryField) {
                nextSummary[summaryField] = Number(item.statustotal) || 0
              }
            })
            this.summary = nextSummary
            this.syncStatusCounts()
          }
        })
        .catch(() => this.$message.warning('黑名单状态统计加载失败'))
    },
    syncStatusCounts() {
      this.statusOptions.forEach((item) => {
        item.count = item.value === STATUS_ACTIVE ? Number(this.summary.total) || 0 : Number(this.summary.removed) || 0
      })
    },
    loadSummary() {
      fetchBlacklistSummary()
        .then((summary) => {
          this.summary = summary
          this.syncStatusCounts()
        })
        .catch(() => this.$message.warning('黑名单统计加载失败'))
    },
    handleJoinTimeChange(value, dateString) {
      this.joinTimeRange = value || []
      this.queryParam.jrsj_begin = dateString && dateString[0] ? dateString[0] : ''
      this.queryParam.jrsj_end = dateString && dateString[1] ? dateString[1] : ''
    },
    searchQuery() {
      this.loadData(1)
      this.onClearSelected()
    },
    searchReset() {
      this.queryParam = getDefaultQuery(this.currentStatus)
      this.joinTimeRange = []
      this.loadData(1)
      this.onClearSelected()
    },
    handleTabChange(status) {
      this.currentStatus = status
      this.columns = getBlacklistColumns(status)
      this.queryParam = getDefaultQuery(status)
      this.joinTimeRange = []
      this.loadData(1)
      this.onClearSelected()
    },
    getRowIndex(index) {
      return (this.ipagination.current - 1) * this.ipagination.pageSize + index + 1
    },
    getLevelText,
    getSourceText,
    getLevelClass,
    handleAdd() {
      this.$refs.modalForm.add()
    },
    fetchRecord(record) {
      if (!record || !record.id) {
        return Promise.resolve(record || {})
      }
      return getAction(this.url.queryById, { id: record.id })
        .then((res) => {
          return res && res.success && res.result ? res.result : record
        })
        .catch(() => record)
    },
    handleEdit(record) {
      this.closeDetail()
      this.fetchRecord(record).then((detail) => this.$refs.modalForm.edit(detail))
    },
    handleDetail(record) {
      this.fetchRecord(record).then((detail) => this.$refs.detailModal.open(detail))
    },
    handleRemove(record) {
      this.closeDetail()
      this.fetchRecord(record).then((detail) => {
        // const restriction = getRemovalRestriction(detail)
        // if (restriction) {
        //   this.$message.warning(restriction)
        //   return
        // }
        this.$refs.removeModal.open(detail)
      })
    },
    handleRemoveConfirm({ record, reason }) {
      const payload = Object.assign({}, record, {
        status: STATUS_REMOVED,
        ycsj: getNowText(),
        ycczr: getCurrentOperator(this),
        ycyy: reason,
      })
      this.$refs.removeModal.setLoading(true)
      httpAction(this.url.edit, payload, 'put')
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || '已移出黑名单')
            this.$refs.removeModal.setLoading(false)
            this.$refs.removeModal.close()
            this.reloadAfterMutation()
          } else {
            this.$message.warning(res.message || '移出失败')
          }
        })
        .catch(() => this.$message.error('移出失败，请稍后重试'))
        .finally(() => this.$refs.removeModal.setLoading(false))
    },
    batchRemove() {
      if (!this.selectionRows.length) {
        this.$message.warning('请先选择要移出的记录')
        return
      }
      for (const item of this.selectionRows) {
        const restriction = getRemovalRestriction(item)
        if (restriction) {
          this.$message.warning(`${item.xm || '所选记录'}：${restriction}`)
          return
        }
      }
      this.$refs.removeModal.openBatch(this.selectionRows.length)
    },
    handleBatchRemoveConfirm({ reason }) {
      this.executeBatchRemove(reason)
    },
    executeBatchRemove(reason) {
      const ids = this.selectedRowKeys.join(',')
      this.operationLoading = true
      this.$refs.removeModal.setLoading(true)
      return httpAction(this.url.batchMove, { ids, reson: reason }, 'post')
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || `成功移出 ${this.selectedRowKeys.length} 条记录`)
            this.$refs.removeModal.close()
            this.reloadAfterMutation()
          } else {
            this.$message.warning(res.message || '批量移出失败')
          }
        })
        .catch(() => this.$message.error('批量移出失败，请稍后重试'))
        .finally(() => {
          this.operationLoading = false
          this.$refs.removeModal.setLoading(false)
        })
    },
    handleRejoin(record) {
      this.$confirm({
        title: '重新加入黑名单',
        content: `确定将 ${record.xm || '该候选人'} 重新加入黑名单吗？`,
        onOk: () => this.fetchRecord(record).then((detail) => this.executeRejoin(detail)),
      })
    },
    executeRejoin(record) {
      const payload = Object.assign({}, record, {
        status: STATUS_ACTIVE,
        jrsj: getNowText(),
        czr: getCurrentOperator(this),
        ycsj: '',
        ycczr: '',
        ycyy: '',
      })
      this.operationLoading = true
      return httpAction(this.url.edit, payload, 'put')
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || '已重新加入黑名单')
            this.closeDetail()
            this.loadData()
            // this.handleTabChange(STATUS_ACTIVE)
          } else {
            this.$message.warning(res.message || '重新加入失败')
          }
        })
        .catch(() => this.$message.error('重新加入失败，请稍后重试'))
        .finally(() => {
          this.operationLoading = false
        })
    },
    closeDetail() {
      if (this.$refs.detailModal) {
        this.$refs.detailModal.close()
      }
    },
    reloadAfterMutation() {
      this.loadData()
      this.onClearSelected()
    },
    handleFormSaved() {
      this.reloadAfterMutation()
    },
  },
}
</script>

<style scoped lang="less">
@import '~@assets/less/common.less';

.blacklist-page {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 87vh;
  padding: 0 10px;
  background: #fff;
}
.recruitment-status-filter {
  position: relative;
  margin-bottom: 10px;
}
.recruitment-status-filter /deep/ .ant-tabs-card > .ant-tabs-bar {
  margin: 0;
}
.recruitment-status-filter /deep/ .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab {
  border-radius: 10px 10px 0 0;
  background: #0082fc;
  color: #e6f7ff;
}
.recruitment-status-filter /deep/ .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='green']) {
  background: #55c42a;
}
.recruitment-status-filter /deep/ .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active {
  background: #0082fc;
}
.recruitment-status-filter /deep/ .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active:has([data-status='green']) {
  background: #55c42a;
}
.blacklist-operator {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 1;
}
.blacklist-operator > * + * {
  margin-left: 8px;
}
.pm-btn-primary {
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
}
.pm-btn-primary:hover,
.pm-btn-primary:focus {
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  opacity: 0.92;
}
.pm-btn-reset {
  height: 34px;
  margin-left: 8px;
  border-color: #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
}
.pm-btn-reset:hover {
  border-color: rgba(37, 99, 235, 0.35);
  color: #1a2a3d;
}

.selection-alert {
  margin-bottom: 16px;
}
.blacklist-table,
.blacklist-table /deep/ .ant-table,
.blacklist-table /deep/ .ant-table-body,
.blacklist-table /deep/ .ant-table-fixed-right .ant-table-body-inner {
  background: #fff;
}
.blacklist-table /deep/ .ant-table-tbody > tr > td {
  background: #fff;
}
.blacklist-table /deep/ .ant-table-tbody > tr:hover > td {
  background: #e6f7ff;
}
.selected-count {
  font-weight: 600;
}
.clear-selection {
  margin-left: 24px;
}
.black-level-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  white-space: nowrap;
}
.black-level-tag .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.level-1year {
  background: #e6f7ff;
  color: #1890ff;
}
.level-1year .dot {
  background: #1890ff;
}
.level-3year {
  background: #fff7e6;
  color: #fa8c16;
}
.level-3year .dot {
  background: #fa8c16;
}
.level-5year {
  background: #fff1f0;
  color: #ff4d4f;
}
.level-5year .dot {
  background: #ff4d4f;
}
.level-permanent {
  background: #2c2c2c;
  color: #fff;
}
.level-permanent .dot {
  background: #fff;
}
.level-unknown {
  background: #f5f5f5;
  color: #666;
}
.level-unknown .dot {
  background: #999;
}
.remove-action {
  color: #52c41a;
}

@media (max-width: 768px) {
  .blacklist-operator {
    position: static;
    display: flex;
    flex-wrap: wrap;
  }
  .recruitment-status-filter {
    margin-bottom: 10px;
  }
}
</style>
