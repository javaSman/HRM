<template>
  <a-modal
    :width="1200"
    :visible="visible"
    :dialogStyle="{
      top:'15px'
    }"
    :maskClosable="false"
    :destroyOnClose="false"
    :title="title"
    @cancel="handleCancel"
  >
    <template slot="footer">
      <a-button @click="handleCancel">关闭</a-button>
    </template>

    <a-alert class="recycle-bin-alert" type="info" showIcon>
      <template slot="message">
        <span>已选择</span>
        <a style="font-weight: 600; padding: 0 4px">{{ selectedRowKeys.length }}</a>
        <span>项</span>
        <template v-if="selectedRowKeys.length > 0">
          <a-divider type="vertical" />
          <a @click="handleClearSelection">清空选择</a>
          <a-divider type="vertical" />
          <a @click="handleRestoreBatch">
            <a-icon type="redo" />
            批量移出
          </a>
        </template>
      </template>
    </a-alert>

    <a-table
      ref="table"
      rowKey="id"
      size="middle"
      bordered
      :columns="columns"
      :loading="loading"
      :dataSource="dataSource"
      :pagination="ipagination"
      :rowSelection="{ selectedRowKeys, onChange: handleTableSelectChange }"
      @change="handleTableChange"
    >
      <span slot="action" slot-scope="text, record">
        <a @click="openRestoreConfirm([record.id])">
          <a-icon type="redo" />
          移出
        </a>
        <a @click="handleDelete(record)">
          <a-icon type="delete" />
          删除
        </a>
      </span>
    </a-table>
  </a-modal>
</template>

<script>
import { filterObj } from '@/utils/util'
import { deleteAction, getAction } from '@/api/manage'

// 回收站默认只查询已删除的人员。
function getDefaultQueryParam() {
  return {
    deleteFlag: '是',
    type:'maintain'
  }
}

export default {
  name: 'PersonnelRecycleBinModal',
  props: {
    restoreHandler: {
      type: Function,
      default: null,
    },
  },
  // 初始化弹窗状态、表格列和分页配置。
  data() {
    return {
      title: '人员回收站',
      visible: false,
      loading: false,
      currentOrgId: '',
      queryParam: getDefaultQueryParam(),
      filters: {},
      isorter: {
        column: 'createTime',
        order: 'desc',
      },
      selectedRowKeys: [],
      dataSource: [],
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 70,
          align: 'center',
          // 按当前页顺序显示行号。
          customRender: (text, record, index) => index + 1,
        },
        {
          title: '工牌号',
          align: 'center',
          dataIndex: 'no',
          width: 140,
        },
        {
          title: '姓名',
          align: 'center',
          dataIndex: 'name',
          width: 140,
        },
        {
          title: '部门',
          align: 'center',
          dataIndex: 'dept_dictText',
          width: 180,
        },
        {
          title: '岗位',
          align: 'center',
          dataIndex: 'postId_dictText',
          width: 160,
        },
        {
          title: '联系电话',
          align: 'center',
          dataIndex: 'phoneNumber',
          width: 150,
        },
        {
          title: '操作',
          align: 'center',
          dataIndex: 'action',
          width: 120,
          scopedSlots: { customRender: 'action' },
        },
      ],
      ipagination: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30'],
        total: 0,
        showQuickJumper: true,
        showSizeChanger: true,
        // 统一显示分页区间和总条数。
        showTotal: (total, range) => `${range[0]}-${range[1]} 共 ${total} 条`,
      },
      url: {
        list: '/hrm/hrEmployeeInformation/list',
      },
    }
  },
  methods: {
    handleDelete(record) {
      this.$confirm({
        title: '确认删除',
        content: '是否删除选中数据?',
        onOk: () => {
          deleteAction('/hrm/hrEmployeeInformation/deleteBatch', {
            ids: record.id,
            deleteFlag: '否',
          }).then((res) => {
            if (res.success) {
              this.$message.success(res.message)
              this.loadData()
            } else {
              this.$message.warning(res.message)
            }
          })
        },
      })
    },
    // 打开弹窗并按当前组织加载回收站数据。
    show(orgId) {
      this.currentOrgId = orgId || ''
      this.queryParam = getDefaultQueryParam()
      this.filters = {}
      this.selectedRowKeys = []
      this.ipagination.current = 1
      this.visible = true
      this.loadData(1)
    },

    // 关闭弹窗并清空当前勾选项。
    handleCancel() {
      this.visible = false
      this.handleClearSelection()
    },

    // 返回列表查询时需要的字段集合。
    getQueryField() {
      return 'id,no,name,mainDept,postName,phoneNumber,createTime,deleteFlag'
    },

    // 组装接口查询参数并过滤空值。
    getQueryParams() {
      const param = Object.assign({}, this.queryParam, this.isorter, this.filters)
      param.field = this.getQueryField()
      param.pageNo = this.ipagination.current
      param.pageSize = this.ipagination.pageSize
      if (this.currentOrgId) {
        // param.orgId = this.currentOrgId
      }
      return filterObj(param)
    },

    // 加载回收站列表数据，并同步分页状态。
    loadData(arg) {
      if (!this.currentOrgId) {
        this.dataSource = []
        this.ipagination.total = 0
        return
      }
      if (arg === 1) {
        this.ipagination.current = 1
      }
      this.loading = true
      getAction(this.url.list, this.getQueryParams())
        // 成功后回填表格数据，失败时给出提示。
        .then((res) => {
          if (res.success) {
            const result = res.result || {}
            this.dataSource = result.records || []
            this.ipagination.total = result.total || 0
            this.ipagination.current = result.current || this.ipagination.current
            this.ipagination.pageSize = result.size || this.ipagination.pageSize
          } else {
            this.dataSource = []
            this.ipagination.total = 0
            this.$message.warning(res.message || '回收站列表加载失败')
          }
        })
        // 请求结束后统一关闭加载态。
        .finally(() => {
          this.loading = false
        })
    },

    // 处理表格分页、筛选和排序变化后重新查询。
    handleTableChange(pagination, filters, sorter) {
      if (Object.keys(sorter || {}).length > 0) {
        this.isorter.column = sorter.field
        this.isorter.order = sorter.order === 'ascend' ? 'asc' : 'desc'
      }
      this.filters = filters || {}
      this.ipagination = Object.assign({}, this.ipagination, pagination)
      this.loadData()
    },

    // 同步表格多选框的选中结果。
    handleTableSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },

    // 清空当前表格勾选状态。
    handleClearSelection() {
      this.selectedRowKeys = []
    },

    // 对当前选中人员执行批量移出。
    handleRestoreBatch() {
      this.openRestoreConfirm(this.selectedRowKeys)
    },

    // 打开移出确认弹窗，并校验是否有可操作的数据。
    openRestoreConfirm(ids) {
      const restoreIds = (ids || []).filter(Boolean)
      if (!restoreIds.length) {
        this.$message.warning('请选择需要移出的人员')
        return
      }
      this.$confirm({
        title: '确认移出',
        content: '是否将选中人员移出回收站？',
        // 确认后执行实际的移出逻辑。
        onOk: () => this.handleRestore(restoreIds),
      })
    },

    // 调用父组件传入的恢复方法，把人员从回收站移出。
    handleRestore(ids) {
      const restoreIds = (ids || []).filter(Boolean).join(',')
      if (!restoreIds) {
        return Promise.resolve()
      }
      if (typeof this.restoreHandler !== 'function') {
        this.$message.warning('未配置移出操作')
        return Promise.resolve()
      }
      return (
        Promise.resolve(this.restoreHandler(restoreIds))
          // 成功后刷新列表并通知父组件同步状态。
          .then((res) => {
            if (res && res.success) {
              this.$message.success('移出成功')
              this.handleClearSelection()
              this.loadData()
              this.$emit('ok')
            } else if (res) {
              this.$message.warning('移出失败')
            }
          })
          // 捕获移出过程中的异常并提示用户。
          .catch((error) => {
            this.$message.warning((error && error.message) || '移出失败')
          })
      )
    },

    // 统一格式化日期显示。
    formatDate(value) {
      if (!value) {
        return '-'
      }
      return String(value).replace('T', ' ').slice(0, 19)
    },
  },
}
</script>

<style scoped lang="less">
.recycle-bin-alert {
  margin-bottom: 16px;
}
</style>
