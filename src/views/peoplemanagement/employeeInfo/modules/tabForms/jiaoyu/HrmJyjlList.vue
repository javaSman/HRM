<template>
  <section class="detail-section education-history-section">
    <div class="detail-section-header education-history-header">
      <div class="section-title-text">
        <a-icon type="read" />
        教育经历
      </div>
      <div class="detail-edit-actions">
        <a-button
          class="education-add-btn"
          size="small"
          v-if="!formDisabled"
          :disabled="!hasGhId"
          @click="handleAdd"
        >
          <a-icon type="plus" />
          新增教育经历
        </a-button>
      </div>
    </div>

    <div v-if="!hasGhId" class="education-empty-state">
      缺少员工工号，无法加载教育经历
    </div>

    <div v-else class="education-table-wrap">
      <a-table
        ref="table"
        size="middle"
        rowKey="id"
        :scroll="{ x: 1380 }"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        class="education-history-table"
        @change="handleTableChange"
      >
       <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button v-else :ghost="true" type="primary" size="small" @click="lookPdf(text)"> 查看 </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <div v-if="!formDisabled" class="row-actions">
            <a-tooltip title="编辑">
              <a-button
                class="row-action-btn"
                size="small"
                icon="edit"
                @click="handleEdit(record)"
              />
            </a-tooltip>
            <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
              <a-button
                class="row-action-btn danger"
                size="small"
                icon="delete"
                title="删除"
              />
            </a-popconfirm>
          </div>
        </span>
      </a-table>
    </div>

    <hrm-jyjl-modal ref="modalForm" :ghId="normalizedGhId" @ok="modalFormOk"></hrm-jyjl-modal>
  </section>
</template>

<script>
  import '@/assets/less/TableExpand.less'
  import { getAction } from '@/api/manage'
  import { mixinDevice } from '@/utils/mixin'
  import { filterObj } from '@/utils/util'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import HrmJyjlModal from './modules/HrmJyjlModal'

  export default {
    name: 'HrmJyjlList',
    mixins: [JeecgListMixin, mixinDevice],
    components: {
      HrmJyjlModal
    },
    props: {
      ghId: {
        type: [String, Number],
        default: ''
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        disableMixinCreated: true,
        description: '员工教育经历管理页面',
        columns: [
          {
            title: '序号',
            dataIndex: '',
            key: 'rowIndex',
            width: 70,
            align: 'center',
            customRender: (text, record, index) => {
              return parseInt(index)+1;
              // return (this.ipagination.current - 1) * this.ipagination.pageSize + index + 1
            }
          },
          {
            title: '学历层次',
            align: 'center',
            dataIndex: 'xlcc',
            width: 120,
            customRender: text => text || '-'
          },
          {
            title: '学位',
            align: 'center',
            dataIndex: 'xw',
            width: 120,
            customRender: text => text || '-'
          },
          {
            title: '是否全日制',
            align: 'center',
            dataIndex: 'sfqrz',
            width: 120,
            customRender: text => text || '-'
          },
          {
            title: '毕业院校/机构',
            align: 'center',
            dataIndex: 'byyxjg',
            width: 180,
            customRender: text => text || '-'
          },
          {
            title: '专业',
            align: 'center',
            dataIndex: 'zy',
            width: 150,
            customRender: text => text || '-'
          },
          {
            title: '入学时间',
            align: 'center',
            dataIndex: 'rxsj',
            width: 120,
            customRender: text => this.formatDateText(text)
          },
          {
            title: '毕业时间',
            align: 'center',
            dataIndex: 'bysj',
            width: 120,
            customRender: text => this.formatDateText(text)
          },
          {
            title: '证书编号',
            align: 'center',
            dataIndex: 'zsbh',
            width: 170,
            customRender: text => text || '-'
          },
          {
            title: '专业/培训内容',
            align: 'center',
            dataIndex: 'zypxnr',
            width: 170,
            ellipsis: true,
            customRender: (text) => {
              if (!text) {
                return '-'
              }
              return <a-tooltip style='width: 160px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
                <template slot="title">{text}</template>
                <span >{text}</span>
              </a-tooltip>
            }
          },
          {
            title: '证书附件',
            align: 'center',
            dataIndex: 'zsfj',
            width: 160,
            scopedSlots: { customRender: 'fileSlot' }
          },
          {
            title: '学信网报告',
            align: 'center',
            dataIndex: 'xxwbg',
            width: 160,
            scopedSlots: { customRender: 'fileSlot' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            fixed: 'right',
            width: 100,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: '/yginfo/hrmJyjl/list',
          delete: '/yginfo/hrmJyjl/delete',
          deleteBatch: '/yginfo/hrmJyjl/deleteBatch',
          exportXlsUrl: '/yginfo/hrmJyjl/exportXls',
          importExcelUrl: 'yginfo/hrmJyjl/importExcel',
          importExcelUrlNewName: 'HrmJyjl'
        },
        dictOptions: {},
        superFieldList: []
      }
    },
    computed: {
      normalizedGhId () {
        if (this.ghId === undefined || this.ghId === null) {
          return ''
        }
        return String(this.ghId).trim()
      },
      hasGhId () {
        return this.normalizedGhId !== ''
      },
      formDisabled () {
        return this.disabled
      }
    },
    watch: {
      ghId: {
        immediate: true,
        handler () {
          this.handleGhIdChange()
        }
      }
    },
    created () {
      this.getSuperFieldList()
    },
    methods: {
      initDictConfig () {
      },
      handleGhIdChange () {
        this.onClearSelected()
        if (!this.hasGhId) {
          this.clearTable()
          return
        }
        this.loadData(1)
      },
      clearTable () {
        this.dataSource = []
        this.ipagination.total = 0
        this.ipagination.current = 1
      },
      loadData (arg) {
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
        return getAction(this.url.list, this.getQueryParams()).then(res => {
          if (res.success) {
            const result = res.result || {}
            const records = Array.isArray(result) ? result : (result.records || [])
            this.dataSource = records
            this.ipagination.total = result.total || records.length || 0
          } else {
            this.dataSource = []
            this.ipagination.total = 0
            this.$message.warning(res.message || '教育经历加载失败')
          }
          if (res.code === 510) {
            this.$message.warning(res.message)
          }
        }).finally(() => {
          this.loading = false
        })
      },
      getQueryParams () {
        const sqp = {}
        if (this.superQueryParams) {
          sqp.superQueryParams = encodeURI(this.superQueryParams)
          sqp.superQueryMatchType = this.superQueryMatchType
        }
        const param = Object.assign(sqp, this.queryParam, this.isorter, this.filters, {
          ghId: this.normalizedGhId
        })
        param.field = this.getQueryField()
        param.pageNo = this.ipagination.current
        param.pageSize = this.ipagination.pageSize
        return filterObj(param)
      },
      getQueryField () {
        return 'id,ghId,xlcc,byyxjg,zy,rxsj,bysj,xw,zsbh,zsfj'
      },
      handleAdd () {
        if (!this.hasGhId) {
          this.$message.warning('缺少员工工号，无法新增教育经历')
          return
        }
        this.$refs.modalForm.add({ ghId: this.normalizedGhId })
        this.$refs.modalForm.title = '新增教育经历'
        this.$refs.modalForm.disableSubmit = false
      },
      handleEdit (record) {
        this.$refs.modalForm.edit(this.withGhId(record))
        this.$refs.modalForm.title = '编辑教育经历'
        this.$refs.modalForm.disableSubmit = false
      },
      handleDetail (record) {
        this.$refs.modalForm.edit(this.withGhId(record))
        this.$refs.modalForm.title = '教育经历详情'
        this.$refs.modalForm.disableSubmit = true
      },
      withGhId (record) {
        return Object.assign({}, record || {}, {
          ghId: this.normalizedGhId
        })
      },
      modalFormOk () {
        this.loadData()
        this.onClearSelected()
      },
      formatDateText (text) {
        if (!text) {
          return '-'
        }
        const value = String(text)
        return value.length > 10 ? value.substr(0, 10) : value
      },
      getSuperFieldList () {
        const fieldList = []
        fieldList.push({ type: 'string', value: 'ghId', text: '关联员工工号', dictCode: '' })
        fieldList.push({ type: 'string', value: 'xlcc', text: '学历层次', dictCode: '' })
        fieldList.push({ type: 'string', value: 'byyxjg', text: '毕业院校/机构', dictCode: '' })
        fieldList.push({ type: 'string', value: 'zy', text: '专业', dictCode: '' })
        fieldList.push({ type: 'date', value: 'rxsj', text: '入学时间' })
        fieldList.push({ type: 'date', value: 'bysj', text: '毕业时间' })
        fieldList.push({ type: 'string', value: 'xw', text: '学位', dictCode: '' })
        fieldList.push({ type: 'string', value: 'zsbh', text: '证书编号', dictCode: '' })
        fieldList.push({ type: 'string', value: 'zsfj', text: '证书附件', dictCode: '' })
        this.superFieldList = fieldList
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '~@assets/less/common.less';
  @import '../detailSection.less';

  .education-history-section {
    min-height: 260px;
  }

  .education-add-btn {
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

  .education-empty-state {
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

  .education-table-wrap {
    border: 1px solid var(--employee-border, #e2e8f0);
    border-radius: 8px;
    background: var(--employee-card, #ffffff);
    overflow: hidden;
  }

  .education-history-table {
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
