<template>
  <section class="school-child-list">
    <div class="school-child-toolbar">
      <a-button type="primary" icon="plus" class="child-add-btn" :disabled="!hasParent" @click="handleAdd">
        新增活动
      </a-button>
    </div>
    <a-alert v-if="!hasParent" type="warning" showIcon message="未获取到高校 ID，无法加载活动记录" />
    <a-table
      v-else
      ref="table"
      size="middle"
      bordered
      rowKey="id"
      :scroll="{ x: 1050 }"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="ipagination"
      :loading="loading"
      class="j-table-force-nowrap school-child-table"
      @change="handleTableChange"
    >
      <span slot="rowIndex" slot-scope="text, record, index">{{ getRowIndex(index) }}</span>
      <span slot="emptyText" slot-scope="text">{{ text === null || text === undefined || text === '' ? '-' : text }}</span>
      <span slot="photos" slot-scope="text, record" class="activity-photo-list">

        <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
        <a-button v-else :ghost="true" type="primary" size="small" @click="lookPdf(text)">查看</a-button>
 
        <!-- <template v-if="getPhotoList(text).length">
          <img
            v-for="(photo, index) in getPhotoList(text).slice(0, 2)"
            :key="`${record.id}-${index}`"
            :src="getImgView(photo)"
            :preview="record.id"
            class="activity-photo"
            alt="活动照片"
          />
          <span v-if="getPhotoList(text).length > 2" class="activity-photo-count">
            +{{ getPhotoList(text).length - 2 }}
          </span>
        </template>
        <span v-else>-</span> -->
      </span>
      <span slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a-popconfirm title="确定删除该活动记录吗？" @confirm="() => handleDelete(record.id)">
          <a class="delete-action">删除</a>
        </a-popconfirm>
      </span>
    </a-table>
    <hrm-gxmd-hdjl-modal
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
import HrmGxmdHdjlModal from './modules/HrmGxmdHdjlModal.vue'

export default {
  name: 'HrmGxmdHdjlList',
  mixins: [JeecgListMixin, mixinDevice],
  components: { HrmGxmdHdjlModal },
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
        { title: '活动类型', dataIndex: 'hdlx', width: 120, align: 'center' },
        { title: '活动时间', dataIndex: 'hdsj', width: 140, align: 'center' },
        { title: '参与人数', dataIndex: 'cyry', width: 110, align: 'center', scopedSlots: { customRender: 'emptyText' } },
        { title: '负责人', dataIndex: 'fzr', width: 120, align: 'center', scopedSlots: { customRender: 'emptyText' } },
        { title: '备注', dataIndex: 'bz', width: 220, align: 'center', ellipsis: true,
            customRender: (text) => {
              return <a-tooltip style='width: 210px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
                <template slot="title">{text}</template>
                <span >{text}</span>
              </a-tooltip>
            } },
        { title: '活动照片', dataIndex: 'hdzp', width: 130, align: 'center', scopedSlots: { customRender: 'photos' } },
        { title: '操作', dataIndex: 'action', width: 130, align: 'center', scopedSlots: { customRender: 'action' } }
      ],
      url: {
        list: '/zpManage/hrmGxmdHdjl/list',
        delete: '/zpManage/hrmGxmdHdjl/delete'
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
    getPhotoList(value) {
      return value ? String(value).split(',').filter(Boolean) : []
    },
    getQueryParams() {
      return {
        pageNo: this.ipagination.current,
        pageSize: this.ipagination.pageSize,
        column: this.isorter.column,
        order: this.isorter.order,
        field: 'id,hdlx,hdsj,cyry,fzr,hdzp,bz',
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
          this.$message.warning(res.message || '活动记录加载失败')
        }
      }).catch(() => {
        if (requestParentId !== this.normalizedParentId) return
        this.clearTable()
        this.$message.error('活动记录加载失败，请稍后重试')
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
