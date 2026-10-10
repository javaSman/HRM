<template>
  <section class="detail-section detail-subtab-section">
    <div class="detail-section-header detail-subtab-header">
      <div class="section-title-text">
        <a-icon type="profile" />
        个人附件
      </div>
      <div class="detail-edit-actions">
        <a-button v-if="!formDisabled" class="detail-subtab-add-btn" size="small" :disabled="!hasGhId" @click="handleAdd">
          <a-icon type="plus" />
          新增个人附件
        </a-button>
      </div>
    </div>

    <div v-if="!hasGhId" class="detail-subtab-empty-state">缺少员工工号，无法加载个人附件</div>

    <div v-else class="detail-subtab-table-wrap">
      <a-table
        ref="table"
        size="middle"
        rowKey="id"
        :scroll="{ x: 760 }"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        class="detail-subtab-table"
        @change="handleTableChange"
      >
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px; font-style: italic">无文件</span>
          <a-button v-else :ghost="true" type="primary" size="small" @click="lookPdf(text)"> 查看 </a-button>
        </template>
        <span slot="action" slot-scope="text, record">
          <div v-if="!formDisabled" class="row-actions">
            <a-tooltip title="编辑">
              <a-button class="row-action-btn" size="small" icon="edit" @click="handleEdit(record)" />
            </a-tooltip>
            <a-popconfirm title="确定删除吗?" @confirm="deleteHandler(record.id)">
              <a-button class="row-action-btn danger" size="small" icon="delete" title="删除" />
            </a-popconfirm>
          </div>
        </span>
      </a-table>
    </div>

    <hrm-ygzzzs-modal ref="modalForm" :ghId="normalizedGhId" @ok="modalFormOk"></hrm-ygzzzs-modal>
  </section>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { getAction } from '@/api/manage'
import { mixinDevice } from '@/utils/mixin'
import { filterObj } from '@/utils/util'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import HrmYgzzzsModal from './modules/HrmYgzzzsModal'

export default {
  name: 'HrmYgzzzsList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    HrmYgzzzsModal,
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
      description: '员工个人附件管理页面',
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
          title: '证件类型',
          align: 'center',
          dataIndex: 'fjlx',
          width: 140,
          customRender: (text) => text || '-',
        },
        {
          title: '取得日期',
          align: 'center',
          dataIndex: 'qdrq',
          width: 130,
          customRender: (text) => this.formatDateText(text),
        },
        {
          title: '有效期截止日',
          align: 'center',
          dataIndex: 'yxqjzr',
          width: 140,
          customRender: (text) => this.formatDateText(text),
        },
        {
          title: '证书编号',
          align: 'center',
          dataIndex: 'zsbm',
          width: 160,
          customRender: (text) => text || '-',
        },
        {
          title: '证书附件',
          align: 'center',
          dataIndex: 'zsfj',
          width: 130,
          scopedSlots: { customRender: 'fileSlot' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 100,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/yginfo/hrmYgzzzs/list',
        delete: '/yginfo/hrmYgzzzs/delete',
        deleteBatch: '/yginfo/hrmYgzzzs/deleteBatch',
        exportXlsUrl: '/yginfo/hrmYgzzzs/exportXls',
        importExcelUrl: 'yginfo/hrmYgzzzs/importExcel',
        importExcelUrlNewName: 'HrmYgzzzs',
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
    deleteHandler(id) {
      this.handleDelete(id)
      this.$emit('update:archive')
    },
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
            this.$message.warning(res.message || '个人附件加载失败')
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
        ghId: this.normalizedGhId,
      })
      param.field = this.getQueryField()
      param.pageNo = this.ipagination.current
      param.pageSize = this.ipagination.pageSize
      return filterObj(param)
    },
    getQueryField() {
      return 'id,ghId,fjlx,qdrq,yxqjzr,zsbm,zsfj'
    },
    handleAdd() {
      if (!this.hasGhId) {
        this.$message.warning('缺少员工工号，无法新增个人附件')
        return
      }
      this.$refs.modalForm.add({ ghId: this.normalizedGhId })
      this.$refs.modalForm.title = '新增个人附件'
      this.$refs.modalForm.disableSubmit = false
    },
    handleEdit(record) {
      this.$refs.modalForm.edit(this.withGhId(record))
      this.$refs.modalForm.title = '编辑个人附件'
      this.$refs.modalForm.disableSubmit = false
    },
    handleDetail(record) {
      this.$refs.modalForm.edit(this.withGhId(record))
      this.$refs.modalForm.title = '个人附件详情'
      this.$refs.modalForm.disableSubmit = true
    },
    withGhId(record) {
      return Object.assign({}, record || {}, {
        ghId: this.normalizedGhId,
      })
    },
    modalFormOk() {
      this.loadData()
      this.onClearSelected()
      this.$emit('update:archive')
    },
    formatDateText(text) {
      if (!text) {
        return '-'
      }
      const value = String(text)
      return value.length > 10 ? value.substr(0, 10) : value
    },
    getSuperFieldList() {
      const fieldList = []
      fieldList.push({ type: 'string', value: 'ghId', text: '关联员工工号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'fjlx', text: '证件类型', dictCode: '' })
      fieldList.push({ type: 'date', value: 'qdrq', text: '取得日期' })
      fieldList.push({ type: 'date', value: 'yxqjzr', text: '有效期截止日' })
      fieldList.push({ type: 'string', value: 'zsbm', text: '证书编号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'zsfj', text: '证书附件', dictCode: '' })
      this.superFieldList = fieldList
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@assets/less/common.less';
@import '../detailSection.less';

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
