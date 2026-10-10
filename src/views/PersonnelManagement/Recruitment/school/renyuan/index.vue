<template>
  <section class="school-child-list">
    <div class="school-child-toolbar">
      <a-button type="primary" icon="plus" class="child-add-btn" :disabled="!hasParent" @click="handleAdd">
        新增人员
      </a-button>
    </div>
    <a-alert v-if="!hasParent" type="warning" showIcon message="未获取到高校 ID，无法加载学校人员" />
    <a-table
      v-else
      ref="table"
      size="middle"
      bordered
      rowKey="id"
      :scroll="{ x: 850 }"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="ipagination"
      :loading="loading"
      class="j-table-force-nowrap school-child-table"
      @change="handleTableChange"
    >
      <span slot="rowIndex" slot-scope="text, record, index">{{ getRowIndex(index) }}</span>
      <span slot="emptyText" slot-scope="text">{{ text || '-' }}</span>
      <span slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a-popconfirm title="确定删除该人员吗？" @confirm="() => handleDelete(record.id)">
          <a class="delete-action">删除</a>
        </a-popconfirm>
      </span>
    </a-table>
    <hrm-gxmd-xxry-modal
      ref="modalForm"
      :hrmGxmdId="normalizedParentId"
      @ok="modalFormOk"
    />
  </section>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { getAction } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { mixinDevice } from '@/utils/mixin'
import HrmGxmdXxryModal from './modules/HrmGxmdXxryModal.vue'

export default {
  name: 'HrmGxmdXxryList',
  mixins: [JeecgListMixin, mixinDevice],
  components: { HrmGxmdXxryModal },
  props: {
    hrmGxmdId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      disableMixinCreated: true,
      columns: [
        { title: '序号', dataIndex: 'rowIndex', width: 70, align: 'center', scopedSlots: { customRender: 'rowIndex' } },
        { title: '姓名', dataIndex: 'xm', width: 120, align: 'center' },
        { title: '性别', dataIndex: 'xb', width: 90, align: 'center', scopedSlots: { customRender: 'emptyText' } },
        { title: '职务', dataIndex: 'zw', width: 140, align: 'center', scopedSlots: { customRender: 'emptyText' } },
        { title: '手机号', dataIndex: 'sjh', width: 150, align: 'center' },
        { title: '邮箱', dataIndex: 'yx', width: 190, align: 'center', scopedSlots: { customRender: 'emptyText' } },
        { title: '操作', dataIndex: 'action', width: 130, align: 'center', scopedSlots: { customRender: 'action' } }
      ],
      url: {
        list: '/zpManage/hrmGxmdXxry/list',
        delete: '/zpManage/hrmGxmdXxry/delete'
      }
    }
  },
  computed: {
    normalizedParentId() {
      return this.hrmGxmdId === null || this.hrmGxmdId === undefined ? '' : this.hrmGxmdId
    },
    hasParent() {
      return this.normalizedParentId !== ''
    }
  },
  watch: {
    normalizedParentId: {
      immediate: true,
      handler() {
        if (this.hasParent) {
          this.loadData(1)
        } else {
          this.clearTable()
        }
      }
    }
  },
  created() {
    this.ipagination.pageSize = 10
  },
  methods: {
    initDictConfig() {},
    clearTable() {
      this.dataSource = []
      this.ipagination.current = 1
      this.ipagination.total = 0
      this.loading = false
    },
    getRowIndex(index) {
      return (this.ipagination.current - 1) * this.ipagination.pageSize + index + 1
    },
    getQueryParams() {
      return {
        pageNo: this.ipagination.current,
        pageSize: this.ipagination.pageSize,
        column: this.isorter.column,
        order: this.isorter.order,
        field: 'id,xm,xb,zw,sjh,yx',
        hrmGxmdId: this.normalizedParentId
      }
    },
    loadData(arg) {
      if (!this.hasParent) {
        this.clearTable()
        return
      }
      if (arg === 1) this.ipagination.current = 1
      const requestParentId = this.normalizedParentId
      this.loading = true
      getAction(this.url.list, this.getQueryParams()).then(res => {
        if (requestParentId !== this.normalizedParentId) return
        if (res.success && res.result && Array.isArray(res.result.records)) {
          this.dataSource = res.result.records
          this.ipagination.total = Number(res.result.total) || 0
        } else {
          this.clearTable()
          this.$message.warning(res.message || '学校人员数据加载失败')
        }
      }).catch(() => {
        if (requestParentId !== this.normalizedParentId) return
        this.clearTable()
        this.$message.error('学校人员数据加载失败，请稍后重试')
      }).finally(() => {
        if (requestParentId === this.normalizedParentId) this.loading = false
      })
    },
    handleAdd() {
      if (!this.hasParent) return
      this.$refs.modalForm.add()
    },
    handleEdit(record) {
      this.$refs.modalForm.edit(Object.assign({}, record, { hrmGxmdId: this.normalizedParentId }))
    }
  }
}
</script>

<style scoped lang="less">
@import '../schoolChildList.less';
</style>
