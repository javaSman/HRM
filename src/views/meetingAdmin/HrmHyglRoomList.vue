<template>
  <div class="hygl-module">
    <!-- 页头 -->
    <div class="h-page-header">
      <h1 class="h-page-title">会议室管理</h1>
    </div>

    <!-- 筛选区 -->
    <div class="h-filter-bar">
      <div class="h-filter-item">
        <j-input
          v-model="queryParam.name"
          allowClear
          placeholder="搜索会议室名称…"
          style="width: 220px"
          @pressEnter="searchQuery"
        >
          <a-icon slot="prefix" type="search" />
        </j-input>
      </div>
      <div class="h-filter-actions">
        <a-button class="h-btn h-btn-primary" @click="searchQuery"><a-icon type="search" />查询</a-button>
        <a-button class="h-btn h-btn-secondary" @click="searchReset"><a-icon type="undo" />重置</a-button>
        <a-button class="h-btn h-btn-primary" @click="handleAdd"><a-icon type="plus" />新增会议室</a-button>
      </div>
    </div>

    <!-- 表格卡片 -->
    <div class="h-content">
      <div class="h-data-card">
        <div class="h-scroll-area">
          <a-table
            ref="table"
            size="middle"
            :bordered="false"
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :pagination="false"
            :loading="loading"
            :scroll="{ y: 400 }"
          >
            <!-- 会议状态 -->
            <template slot="status" slot-scope="text">
              <span :class="['h-usage-tag', text === 'in-use' ? 'in-use' : 'idle']">
                <span class="dot"></span>
                {{ text === 'in-use' ? '使用中' : '空闲' }}
              </span>
            </template>
            <!-- 编号 -->
            <template slot="code" slot-scope="text">
              <span class="h-code">{{ text }}</span>
            </template>
            <!-- 容纳人数 -->
            <template slot="capacity" slot-scope="text">
              <div class="h-capacity-cell"><a-icon type="team" style="color: #2965ed;" />{{ text }} 人</div>
            </template>
            <!-- 操作 -->
            <template slot="action" slot-scope="text, record">
              <div class="h-action-cell">
                <button class="h-btn-icon" @click="handleEdit(record)"><a-icon type="edit" />编辑</button>
                <a-popconfirm title="确定删除该会议室吗?" @confirm="handleDelete(record.id)">
                  <button class="h-btn-icon danger"><a-icon type="delete" />删除</button>
                </a-popconfirm>
              </div>
            </template>
          </a-table>
        </div>
        <div class="h-pagination" v-if="ipagination.total > 0">
          <a-pagination
            size="small"
            :current="ipagination.current"
            :pageSize="ipagination.pageSize"
            :total="ipagination.total"
            showSizeChanger
            showQuickJumper
            :pageSizeOptions="['10', '20', '50']"
            @change="handlePageChange"
            @showSizeChange="handleSizeChange"
          />
        </div>
      </div>
    </div>

    <hrm-hygl-room-modal ref="modalForm" @ok="modalFormOk"></hrm-hygl-room-modal>
  </div>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { mixinDevice } from '@/utils/mixin'
import { deleteAction } from '@/api/manage'
import HrmHyglRoomModal from './modules/HrmHyglRoomModal'

export default {
  name: 'HrmHyglRoomList',
  mixins: [JeecgListMixin, mixinDevice],
  components: { HrmHyglRoomModal },
  data() {
    return {
      description: '会议室管理',
      columns: [
        {
          title: '序号',
          dataIndex: 'seq',
          width: 100,
          align: 'center',
          customRender: (t, r, index) => (this.ipagination.current - 1) * this.ipagination.pageSize + index + 1,
        },
        {
          title: '会议状态',
          dataIndex: 'status',
          width: 150,
          align: 'center',
          scopedSlots: { customRender: 'status' },
        },
        { title: '会议室名称', dataIndex: 'name', align: 'center', scopedSlots: { customRender: 'name' } },
        { title: '编号', dataIndex: 'code', width: 150, align: 'center', scopedSlots: { customRender: 'code' } },
        { title: '位置', dataIndex: 'location', align: 'center' },
        {
          title: '最大容纳人数',
          dataIndex: 'capacity',
          width: 150,
          align: 'center',
          scopedSlots: { customRender: 'capacity' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 180,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/hygl/hrmHyglRoom/list',
        delete: '/hygl/hrmHyglRoom/delete',
      },
    }
  },
  methods: {
    handleAdd() {
      this.$refs.modalForm.add()
    },
    handleEdit(record) {
      this.$refs.modalForm.edit(record)
    },
    handleDelete(id) {
      if (!this.url.delete) {
        this.$message.error('请设置url.delete属性!')
        return
      }
      var that = this
      that.loading = true
      deleteAction(that.url.delete, { id: id })
        .then((res) => {
          if (res.success) {
            that.$message.success(res.message)
            that.loadData()
          } else {
            that.$message.warning(res.message)
          }
        })
        .finally(() => {
          that.loading = false
        })
    },
    handlePageChange(page, pageSize) {
      this.ipagination.current = page
      this.ipagination.pageSize = pageSize
      this.loadData()
    },
    handleSizeChange(current, size) {
      this.ipagination.current = 1
      this.ipagination.pageSize = size
      this.loadData()
    },
  },
}
</script>

<style lang="less" scoped>
@import './hygl-theme.less';
</style>

