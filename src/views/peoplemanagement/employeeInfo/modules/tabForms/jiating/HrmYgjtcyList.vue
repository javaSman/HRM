<template>
  <section class="detail-section detail-subtab-section">
    <div class="detail-section-header detail-subtab-header">
      <div class="section-title-text">
        <a-icon type="team" />
        家庭成员
      </div>
      <div class="detail-edit-actions">
        <a-button
          class="detail-subtab-add-btn"
          size="small"
          v-if="!formDisabled"
          :disabled="!hasGhId"
          @click="handleAdd"
        >
          <a-icon type="plus" />
          新增家庭成员
        </a-button>
      </div>
    </div>

    <div v-if="!hasGhId" class="detail-subtab-empty-state">
      缺少员工工号，无法加载家庭成员
    </div>

    <div v-else class="detail-subtab-table-wrap">
      <a-table
        ref="table"
        size="middle"
        rowKey="id"
        :scroll="{ x: 780 }"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        class="detail-subtab-table"
        @change="handleTableChange"
      >
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

    <hrm-ygjtcy-modal ref="modalForm" :ghId="normalizedGhId" @ok="modalFormOk"></hrm-ygjtcy-modal>
  </section>
</template>

<script>
  import '@/assets/less/TableExpand.less'
  import { getAction } from '@/api/manage'
  import { mixinDevice } from '@/utils/mixin'
  import { filterObj } from '@/utils/util'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import HrmYgjtcyModal from './modules/HrmYgjtcyModal'

  export default {
    name: 'HrmYgjtcyList',
    mixins: [JeecgListMixin, mixinDevice],
    components: {
      HrmYgjtcyModal
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
        description: '员工家庭成员管理页面',
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
            title: '姓名',
            align: 'center',
            dataIndex: 'xm',
            width: 120,
            customRender: text => text || '-'
          },
          {
            title: '关系',
            align: 'center',
            dataIndex: 'gx',
            width: 120,
            customRender: text => text || '-'
          },
          {
            title: '职务',
            align: 'center',
            dataIndex: 'zw',
            width: 140,
            customRender: text => text || '-'
          },
          {
            title: '工作单位',
            align: 'center',
            dataIndex: 'gzdw',
            width: 180,
            customRender: text => text || '-'
          },
          {
            title: '联系电话',
            align: 'center',
            dataIndex: 'lxdh',
            width: 150,
            customRender: text => text || '-'
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
          list: '/yginfo/hrmYgjtcy/list',
          delete: '/yginfo/hrmYgjtcy/delete',
          deleteBatch: '/yginfo/hrmYgjtcy/deleteBatch',
          exportXlsUrl: '/yginfo/hrmYgjtcy/exportXls',
          importExcelUrl: 'yginfo/hrmYgjtcy/importExcel',
          importExcelUrlNewName: 'HrmYgjtcy'
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
            this.$message.warning(res.message || '家庭成员加载失败')
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
        return 'id,ghId,xm,gx,zw,gzdw,lxdh'
      },
      handleAdd () {
        if (!this.hasGhId) {
          this.$message.warning('缺少员工工号，无法新增家庭成员')
          return
        }
        this.$refs.modalForm.add({ ghId: this.normalizedGhId })
        this.$refs.modalForm.title = '新增家庭成员'
        this.$refs.modalForm.disableSubmit = false
      },
      handleEdit (record) {
        this.$refs.modalForm.edit(this.withGhId(record))
        this.$refs.modalForm.title = '编辑家庭成员'
        this.$refs.modalForm.disableSubmit = false
      },
      handleDetail (record) {
        this.$refs.modalForm.edit(this.withGhId(record))
        this.$refs.modalForm.title = '家庭成员详情'
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
      getSuperFieldList () {
        const fieldList = []
        fieldList.push({ type: 'string', value: 'ghId', text: '关联员工工号', dictCode: '' })
        fieldList.push({ type: 'string', value: 'xm', text: '姓名', dictCode: '' })
        fieldList.push({ type: 'string', value: 'gx', text: '关系', dictCode: '' })
        fieldList.push({ type: 'string', value: 'zw', text: '职务', dictCode: '' })
        fieldList.push({ type: 'string', value: 'gzdw', text: '工作单位', dictCode: '' })
        fieldList.push({ type: 'string', value: 'lxdh', text: '联系电话', dictCode: '' })
        this.superFieldList = fieldList
      }
    }
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
