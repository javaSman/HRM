<template>
  <section class="detail-section detail-subtab-section">
    <div class="detail-section-header detail-subtab-header">
      <div class="section-title-text">
        <a-icon type="message" />
        访谈经历
      </div>
      <div class="detail-edit-actions">
        <a-button v-if="!formDisabled" class="detail-subtab-add-btn" size="small" :disabled="!hasGhId" @click="handleAdd">
          <a-icon type="plus" />
          新增访谈经历
        </a-button>
      </div>
    </div>

    <div v-if="!hasGhId" class="detail-subtab-empty-state">缺少员工工号，无法加载访谈经历</div>

    <div v-else class="detail-subtab-table-wrap">
      <a-table
        ref="table"
        size="middle"
        rowKey="id"
        :scroll="{ x: 620 }"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        class="detail-subtab-table"
        @change="handleTableChange"
      >
        <template slot="action" slot-scope="text, record">
          <!-- <div class="row-actions"> -->
          <!-- <a-tooltip title="编辑">
              <a-button class="row-action-btn" size="small" icon="edit" @click="handleEdit(record)" />
            </a-tooltip>
            <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
              <a-button class="row-action-btn danger" size="small" icon="delete" title="删除" />
            </a-popconfirm> -->
          <a-button type="link" size="small" @click="handleDetail(record)">详情</a-button>
          <!-- </div> -->
        </template>
      </a-table>
    </div>

    <probation-interview-modal ref="modalForm" mode="daily" @ok="modalFormOk"></probation-interview-modal>

    <!-- 访谈详情弹窗 -->
    <j-modal
      title="访谈详情"
      :width="1000"
      :visible="detailVisible"
      :bodyStyle="{ padding: '14px 24px 12px' }"
      @cancel="closeDetailModal"
    >
      <div class="probation-interview-detail">
        <section class="probation-detail-section">
          <div class="probation-detail-section-header">
            <div class="probation-detail-section-title">
              <a-icon type="message" />
              <span>访谈信息</span>
            </div>
          </div>
          <div class="probation-detail-info-grid probation-interview-info-grid">
            <div class="probation-detail-info-item">
              <div class="probation-detail-info-label">访谈日期</div>
              <div class="probation-detail-info-value">{{ formatDetailValue(currentDetail.ftrq) }}</div>
            </div>
            <div class="probation-detail-info-item">
              <div class="probation-detail-info-label">访谈类型</div>
              <div class="probation-detail-info-value">{{ formatDetailValue(currentDetail.ftlx) }}</div>
            </div>
            <div class="probation-detail-info-item">
              <div class="probation-detail-info-label">创建人</div>
              <div class="probation-detail-info-value">{{ formatDetailValue(currentDetail.createBy) }}</div>
            </div>
          </div>
        </section>

        <section class="probation-detail-section">
          <div class="probation-detail-section-header">
            <div class="probation-detail-section-title">
              <a-icon type="profile" />
              <span>问题回答</span>
            </div>
          </div>
          <div class="probation-detail-table-wrap">
            <a-table
              size="middle"
              rowKey="id"
              :columns="detailColumns"
              :dataSource="currentDetailQuestions"
              :pagination="false"
              :locale="{ emptyText: '暂无数据' }"
              :scroll="{ x: 900 }"
              class="probation-detail-table"
            />
          </div>
        </section>
      </div>

      <template slot="footer">
        <a-button @click="closeDetailModal">关闭</a-button>
      </template>
    </j-modal>
  </section>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { getAction } from '@/api/manage'
import { mixinDevice } from '@/utils/mixin'
import { filterObj } from '@/utils/util'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import ProbationInterviewModal from '@/views/PersonnelManagement/Personnel/probationPeriod/modules/ProbationInterviewModal'

export default {
  name: 'HrmYgfljlList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    ProbationInterviewModal,
  },
  props: {
    ghId: {
      type: [String, Number],
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      disableMixinCreated: true,
      description: '员工访谈经历管理页面',
      // 详情弹窗相关
      detailVisible: false,
      currentDetail: {},
      detailColumns: [
        { title: '序号', width: 70, align: 'center', customRender: (text, record, index) => index + 1 },
        { title: '问题内容', dataIndex: 'wtnr', width: 260, align: 'center', customRender: text => text || '-' },
        { title: '访谈情况', dataIndex: 'ftqk', width: 280, align: 'center', customRender: text => text || '-' },
        { title: '是否有问题', dataIndex: 'sfywt', width: 120, align: 'center', customRender: text => text || '-' },
        { title: '跟进人', dataIndex: 'gjr', width: 170, align: 'center', customRender: text => text || '-' },
      ],
      columns: [
        {
          title: '序号',
          dataIndex: '',
          key: 'rowIndex',
          width: 70,
          align: 'center',
          customRender: (text, record, index) => {
            return parseInt(index) + 1
            // return (this.ipagination.current - 1) * this.ipagination.pageSize + index + 1
          },
        },
        {
          title: '所属种类',
          align: 'center',
          dataIndex: 'type',
          width: 130,
          customRender: text => text || '-',
        },
        {
          title: '访谈人',
          align: 'center',
          dataIndex: 'createBy',
          width: 130,
          customRender: text => text || '-',
        },
        {
          title: '访谈类型',
          align: 'center',
          dataIndex: 'ftlx',
          width: 150,
          customRender: text => text || '-',
        },
        {
          title: '访谈时间',
          align: 'center',
          dataIndex: 'ftrq',
          width: 180,
          customRender: text => text || '-',
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 120,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/yginfo/hrmYgfljl/allTypePageList',
        delete: '/yginfo/hrmYgfljl/delete',
        deleteBatch: '/yginfo/hrmYgfljl/deleteBatch',
        exportXlsUrl: '/yginfo/hrmYgfljl/exportXls',
        importExcelUrl: 'yginfo/hrmYgfljl/importExcel',
        importExcelUrlNewName: 'HrmYgfljl',
      },
      dictOptions: {},
      superFieldList: [],
    }
  },
  computed: {
    normalizedGhId() {
      if (this.ghId === undefined || this.ghId === null) {
        return ''
      }
      return String(this.ghId).trim()
    },
    hasGhId() {
      return this.normalizedGhId !== ''
    },
    formDisabled() {
      return this.disabled
    },
    currentDetailQuestions() {
      return Array.isArray(this.currentDetail.ftList) ? this.currentDetail.ftList : []
    },
  },
  watch: {
    ghId: {
      immediate: true,
      handler() {
        this.handleGhIdChange()
      },
    },
  },
  created() {
    this.getSuperFieldList()
  },
  methods: {
    initDictConfig() {},
    handleGhIdChange() {
      this.onClearSelected()
      if (!this.hasGhId) {
        this.clearTable()
        return
      }
      this.loadData(1)
    },
    clearTable() {
      this.dataSource = []
      this.ipagination.total = 0
      this.ipagination.current = 1
    },
    loadData(arg) {
      if (!this.hasGhId) {
        this.clearTable()
        this.onClearSelected()
        return Promise.resolve()
      }
      if (!this.url.list) {
        this.$message.error('请设置url.list属性!')
        return Promise.resolve()
      }
      if (arg === 1) {
        this.ipagination.current = 1
      }
      this.loading = true
      return getAction(this.url.list, this.getQueryParams())
        .then((res) => {
          if (res.success) {
            const result = res.result || {}
            const records = Array.isArray(result) ? result : result.records || []
            this.dataSource = records
            this.ipagination.total = result.total || records.length || 0
          } else {
            this.dataSource = []
            this.ipagination.total = 0
            this.$message.warning(res.message || '访谈经历加载失败')
          }
          if (res.code === 510) {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    getQueryParams() {
      const sqp = {}
      if (this.superQueryParams) {
        sqp.superQueryParams = encodeURI(this.superQueryParams)
        sqp.superQueryMatchType = this.superQueryMatchType
      }
      const param = Object.assign(sqp, this.queryParam, this.isorter, this.filters, {
        no: this.normalizedGhId,
      })
      param.field = this.getQueryField()
      param.pageNo = this.ipagination.current
      param.pageSize = this.ipagination.pageSize
      return filterObj(param)
    },
    getQueryField() {
      return 'id,ghId,ftr,rtlx,ftsj'
    },
    handleAdd() {
      if (!this.hasGhId) {
        this.$message.warning('缺少员工工号，无法新增访谈经历')
        return
      }
      this.$refs.modalForm.open({ ghId: this.normalizedGhId })
    },
    handleEdit(record) {
      this.$refs.modalForm.edit(this.withGhId(record))
      this.$refs.modalForm.title = '编辑访谈经历'
      this.$refs.modalForm.disableSubmit = false
    },
    handleDetail(record) {
      // 直接使用行数据，无需调用接口
      this.currentDetail = record || {}
      this.detailVisible = true
    },
    withGhId(record) {
      return Object.assign({}, record || {}, {
        ghId: this.normalizedGhId,
      })
    },
    modalFormOk() {
      this.loadData()
      this.onClearSelected()
    },
    closeDetailModal() {
      this.detailVisible = false
      this.currentDetail = {}
    },
    formatDetailValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
    getSuperFieldList() {
      const fieldList = []
      fieldList.push({ type: 'string', value: 'ghId', text: '关联员工工号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ftr', text: '访谈人', dictCode: '' })
      fieldList.push({ type: 'string', value: 'rtlx', text: '访谈类型', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'ftsj', text: '访谈时间' })
      this.superFieldList = fieldList
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@assets/less/common.less';
@import '../detailSection.less';
@import '~@views/PersonnelManagement/Personnel/probationPeriod/modules/probation-detail.less';

.detail-subtab-section {
  min-height: 260px;
}

.detail-subtab-header {
  margin-bottom: 14px;
}

.detail-subtab-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 14px;
  border: 1px dashed rgba(var(--employee-primary-rgb, 37, 99, 235), 0.32);
  border-radius: 8px;
  background: transparent;
  color: var(--employee-primary, #2563eb);
  font-size: 12px;
  font-weight: 700;

  &:hover,
  &:focus {
    border-color: var(--employee-primary, #2563eb);
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.04);
    color: var(--employee-primary, #2563eb);
  }

  &[disabled] {
    border-color: #d9d9d9;
    color: #bfbfbf;
    background: transparent;
  }
}

.detail-subtab-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.detail-subtab-table-wrap {
  border: 1px solid var(--employee-border, #e2e8f0);
  border-radius: 8px;
  background: var(--employee-card, #ffffff);
  overflow: hidden;
}

.detail-subtab-table {
  /deep/ .ant-table {
    color: var(--employee-foreground, #1a2a3d);
    font-size: 12px;
  }

  /deep/ .ant-table-thead > tr > th {
    padding: 8px 12px;
    border-bottom: 1px solid var(--employee-border, #e2e8f0);
    background: #f8fafc;
    color: var(--employee-muted-foreground, #64748b);
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
  }

  /deep/ .ant-table-tbody > tr > td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--employee-border, #e2e8f0);
    color: #334155;
  }

  /deep/ .ant-table-tbody > tr:hover > td {
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.02);
  }

  /deep/ .ant-table-pagination.ant-pagination {
    margin: 12px 12px;
  }
}

.row-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.row-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: var(--employee-muted-foreground, #64748b);

  &:hover,
  &:focus {
    border-color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.3);
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.06);
    color: var(--employee-primary, #2563eb);
  }

  &.danger:hover,
  &.danger:focus {
    border-color: rgba(239, 68, 68, 0.3);
    background: rgba(239, 68, 68, 0.06);
    color: #ef4444;
  }
}
</style>
