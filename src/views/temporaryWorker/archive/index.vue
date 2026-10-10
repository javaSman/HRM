<!--
  @description 临时工入档页面
  @date 2026-09-29
  @functionality 劳动派遣人员入档管理，支持按访客姓名/接待人/派遣公司/预计来访时间筛选，未入档记录可勾选添加进入临时工或删除
-->
<template>
  <div class="temporary-worker-archive">
    <!-- 统计卡片：劳动派遣总数 / 未入档 / 已入档 -->
    <div class="v-stat-bar">
      <div class="v-stat-card">
        <div class="v-stat-icon total">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div>
          <div class="v-stat-num">{{ counts.all }}</div>
          <div class="v-stat-label">入档总数</div>
        </div>
      </div>
      <div class="v-stat-card">
        <div class="v-stat-icon pending">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div>
          <div class="v-stat-num">{{ counts.pending }}</div>
          <div class="v-stat-label">未入档</div>
        </div>
      </div>
      <div class="v-stat-card">
        <div class="v-stat-icon done">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="9 12 11 14 15 10"></polyline>
          </svg>
        </div>
        <div>
          <div class="v-stat-num">{{ counts.done }}</div>
          <div class="v-stat-label">已入档</div>
        </div>
      </div>
    </div>

    <!-- 筛选区：访客姓名、接待人、派遣公司、预计来访时间 -->
    <div class="v-filter-bar">
      <div class="v-filter-row">
        <div class="v-filter-item">
          <span class="v-filter-item-label">访客姓名</span>
          <a-input v-model="queryParam.xm" style="width: 180px" placeholder="输入访客姓名" @pressEnter="searchQuery" />
        </div>
        <div class="v-filter-item">
          <span class="v-filter-item-label">接待人</span>
          <a-input
            v-model="queryParam.jdr"
            style="width: 160px"
            placeholder="输入接待人姓名"
            @pressEnter="searchQuery"
          />
        </div>
        <div class="v-filter-item">
          <span class="v-filter-item-label">派遣公司</span>
          <j-dict-select-tag
            type="list"
            v-model="queryParam.pqgs"
            dictCode="hrm_fkzx_sq_pqgs"
            placeholder="全部"
            style="width: 160px"
          />
        </div>
        <div class="v-filter-item">
          <span class="v-filter-item-label">预计来访时间</span>
          <div class="date-range">
            <j-date v-model="queryParam.yjlfsj_begin" placeholder="开始日期" style="width: 150px" />
            <span class="range-sep">-</span>
            <j-date v-model="queryParam.yjlfsj_end" placeholder="结束日期" style="width: 150px" />
          </div>
        </div>
      </div>
      <div class="v-filter-bar-actions">
        <a-button type="primary" class="v-btn" @click="searchQuery"><a-icon type="search" />查询</a-button>
        <a-button class="v-btn v-btn-secondary" @click="searchReset"><a-icon type="undo" />重置</a-button>
        <a-button type="primary" class="v-btn" @click="handleAdd"> <a-icon type="user-add" />添加进入临时工 </a-button>
        <a-button v-if="selectedRowKeys.length" class="v-btn v-btn-danger-light" @click="handleDelete">
          <a-icon type="delete" />删除
        </a-button>
      </div>
    </div>

    <!-- 状态筛选 - 胶囊样式：未入档 / 已入档 -->
    <div class="v-status-tabs archive-tab-bar">
      <div
        v-for="tab in archiveTabs"
        :key="tab.key"
        :class="['v-status-tab', activeTab === tab.key ? 'active' : '']"
        @click="changeTab(tab.key)"
      >
        {{ tab.label }} <span class="tab-count">{{ counts[tab.key] }}</span>
      </div>
      <div class="tab-hint"><a-icon type="info-circle" />仅【未入档】记录可勾选，已入档记录勾选按钮置灰</div>
    </div>

    <!-- 表格区：展示劳动派遣记录 -->
    <div class="v-content">
      <div class="v-data-card">
        <div class="v-scroll-area">
          <a-table
            size="middle"
            :bordered="false"
            rowKey="id"
            :columns="columns"
            :data-source="dataSource"
            :row-selection="rowSelection"
            :pagination="ipagination"
            :loading="loading"
            :scroll="tableScroll"
            :locale="{ emptyText: '暂无符合条件的劳动派遣记录' }"
            @change="handleTableChange"
          >
            <!-- 状态列：未入档/已入档 -->
            <template slot="status" slot-scope="text, record">
              <span :class="['v-status-tag', isArchived(record) ? 'handled' : 'pending']">
                <span class="dot"></span>
                {{ isArchived(record) ? '已入档' : '未入档' }}
              </span>
            </template>
            <!-- 姓名列：头像 + 姓名 -->
            <template slot="name" slot-scope="text, record">
              <div class="name-cell">
                <div :class="['avatar-s', isArchived(record) ? 'lock' : '']">
                  {{ (record.xm || '').slice(0, 1) }}
                </div>
                <span class="name-txt">{{ record.xm }}</span>
              </div>
            </template>
            <!-- 来访类型列 -->
            <template slot="type" slot-scope="text, record">
              <span class="tag-soft">{{ record.lflx_dictText || '—' }}</span>
            </template>
            <!-- 操作列：详情 -->
            <template slot="action" slot-scope="text, record">
              <div class="v-action-cell">
                <button class="v-btn-icon" @click="handleDetail(record)"><a-icon type="eye" />详情</button>
              </div>
            </template>
          </a-table>
        </div>
      </div>
    </div>

    <!-- 删除二次确认弹窗 -->
    <delete-modal :visible.sync="delModalVisible" :count="selectedRowKeys.length" @ok="confirmDelete" />

    <!-- 详情弹窗（直接复用访客详情组件，detailType=temp） -->
    <employee-visitor-detail ref="detailModal" />

    <!-- 添加进入临时工弹窗（参考原型 addModal） -->
    <add-worker-modal ref="addWorkerModal" @ok="handleAddWorkerOk" />
  </div>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction, postAction, deleteAction } from '@/api/manage'
import JDate from '@/components/jeecg/JDate'
import DeleteModal from './modules/DeleteModal'
import AddWorkerModal from './modules/AddWorkerModal'
import EmployeeVisitorDetail from '@/views/visitor/modules/EmployeeVisitorDetail.vue'

/**
 * 临时工入档组件
 * 劳动派遣人员的未入档/已入档管理
 */
export default {
  name: 'TemporaryWorkerArchive',
  mixins: [JeecgListMixin],
  components: { JDate, DeleteModal, AddWorkerModal, EmployeeVisitorDetail },
  data() {
    return {
      /** 禁用混入的自动加载，由本页面 created 主动加载 */
      disableMixinCreated: true,
      /** 当前状态 Tab：pending-未入档，done-已入档 */
      activeTab: 'pending',
      /** 状态 Tab 配置 */
      archiveTabs: [
        { key: 'pending', label: '未入档' },
        { key: 'done', label: '已入档' },
      ],
      /** 接口地址配置（劳动派遣登记审批-已通过列表） */
      url: {
        list: '/fkzx/hrmFkzxSq/list',
        delete: '/fkzx/hrmFkzxSq/delete',
        deleteBatch: '/fkzx/hrmFkzxSq/deleteBatch',
      },
      /** 查询参数 */
      queryParam: {
        column: 'createTime', // 默认排序字段：创建时间
        order: 'desc', // 默认排序方式：倒序
        xm: '', // 访客姓名
        jdr: '', // 接待人
        pqgs: '', // 派遣公司
        yjlfsj_begin: '', // 预计来访时间-开始
        yjlfsj_end: '', // 预计来访时间-结束
        lflx: '4', // 来访类型：4-劳动派遣
        zt: '1', // 已通过
        isLsgda: '0', // 入档状态标记：未入档（请求时传空串）/ 已入档 '1'
        isMyReception: false, // 是否仅查本人接待
        mszt: '1', // 默认参数
      },
      /** 顶部统计数量 */
      statCounts: {
        all: 0,
        pending: 0,
        done: 0,
      },
      /** 删除确认弹窗显示状态 */
      delModalVisible: false,
      /** 表格列定义 */
      columns: [
        {
          title: '序号',
          dataIndex: 'idx',
          width: 70,
          align: 'center',
          customRender: (text, record, index) => (this.ipagination.current - 1) * this.ipagination.pageSize + index + 1,
        },
        { title: '状态', dataIndex: 'isLsgda', width: 100, align: 'center', scopedSlots: { customRender: 'status' } },
        { title: '姓名', dataIndex: 'xm', width: 130, scopedSlots: { customRender: 'name' } },
        { title: '联系方式', dataIndex: 'lxfs', width: 130 },
        { title: '身份证', dataIndex: 'sfzh', width: 180 },
        { title: '来访类型', dataIndex: 'lflx', width: 100, align: 'center', scopedSlots: { customRender: 'type' } },
        { title: '派遣公司', dataIndex: 'pqgs_dictText', width: 110 },
        { title: '预计来访时间', dataIndex: 'yjlfsj', width: 160 },
        { title: '接待人', dataIndex: 'jdr', width: 100 },
        { title: '接待人联系方式', dataIndex: 'jdrlxfs', width: 140 },
        { title: '来访人数', dataIndex: 'lfrs', width: 90, align: 'center' },
        {
          title: '操作',
          dataIndex: 'action',
          width: 100,
          align: 'center',
          fixed: 'right',
          scopedSlots: { customRender: 'action' },
        },
      ],
    }
  },
  computed: {
    /** 统计数量（由 loadStatCounts 写入） */
    counts() {
      return this.statCounts
    },
    /** 表格选择项配置：已入档记录置灰不可勾选 */
    rowSelection() {
      return {
        columnWidth: 50,
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange,
        getCheckboxProps: this.getRowCheckboxProps,
      }
    },
  },
  created() {
    // 加载列表与顶部统计
    this.loadData(1)
    this.loadStatCounts()
  },
  methods: {
    /** 判断记录是否已入档 */
    isArchived(record) {
      return record.isLsgda === '1' || record.isLsgda === 1
    },
    /**
     * 加载列表数据：调用劳动派遣登记已通过列表接口（参数同 VisitorApproval 劳动派遣-已通过）
     * @param {number} arg - 传入 1 时回到第一页
     */
    loadData(arg) {
      if (arg === 1) {
        this.ipagination.current = 1
      }
      this.loading = true
      const params = Object.assign({}, this.queryParam)
      // 姓名、接待人按 JEECG * 通配规则模糊查询
      if (params.xm) {
        params.xm = `*${params.xm.trim()}*`
      }
      if (params.jdr) {
        params.jdr = `*${params.jdr.trim()}*`
      }
      params.pageNo = this.ipagination.current
      params.pageSize = this.ipagination.pageSize
      getAction(this.url.list, params)
        .then((res) => {
          if (res.success) {
            this.dataSource = res.result.records || []
            this.ipagination.total = res.result.total || 0
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    /** 顶部统计：调用状态统计接口（编码 lsgrd），按 is_lsgda 取未入档/已入档数量 */
    loadStatCounts() {
      postAction('/commonTj/ztTjInfo/getTjListByCodes', { lsgrd: {} }).then((res) => {
        if (res.success && res.result && res.result.lsgrd && res.result.lsgrd.ldpq) {
          let pending = 0
          let done = 0
          res.result.lsgrd.ldpq.forEach((item) => {
            if (item.is_lsgda === '1') {
              done += item.count
            } else {
              pending += item.count
            }
          })
          this.statCounts = { all: pending + done, pending, done }
        }
      })
    },
    /** 已入档记录的勾选框置灰 */
    getRowCheckboxProps(record) {
      return { props: { disabled: this.isArchived(record) } } // this.isArchived(record)
    },
    /** 重置查询条件（覆盖 mixin：保留完整 queryParam 字段结构） */
    searchReset() {
      this.queryParam = {
        column: 'createTime',
        order: 'desc',
        xm: '',
        jdr: '',
        pqgs: '',
        yjlfsj_begin: '',
        yjlfsj_end: '',
        lflx: '4',
        zt: '1',
        isLsgda: '0',
        isMyReception: false,
        mszt: '1',
      }
      this.activeTab = 'pending'
      this.loadData(1)
    },
    /** 切换未入档/已入档 Tab */
    changeTab(key) {
      this.activeTab = key
      this.queryParam.isLsgda = key === 'done' ? '1' : '0'
      this.loadData(1)
    },
    /** 添加进入临时工：打开弹窗，传入勾选记录 */
    handleAdd() {
      if (!this.selectedRowKeys.length) {
        this.$message.warning('请先勾选需要添加进入临时工的【未入档】记录')
        return
      }
      this.$refs.addWorkerModal.show(this.selectionRows)
    },
    /** 添加进入临时工成功：清空勾选并刷新列表与统计 */
    handleAddWorkerOk() {
      this.selectedRowKeys = []
      this.selectionRows = []
      this.loadData()
      this.loadStatCounts()
    },
    /** 打开删除确认弹窗（覆盖 mixin 的单条删除） */
    handleDelete() {
      if (!this.selectedRowKeys.length) return
      this.delModalVisible = true
    },
    /** 确认删除勾选记录：批量删除接口一次调用后刷新 */
    confirmDelete() {
      const keys = this.selectedRowKeys.slice()
      deleteAction(this.url.deleteBatch, { ids: keys.join(',') }).then((res) => {
        if (res.success) {
          this.selectedRowKeys = []
          this.selectionRows = []
          this.delModalVisible = false
          this.loadData()
          this.loadStatCounts()
          this.$message.success(`已删除选中的 ${keys.length} 条劳动派遣记录`)
        } else {
          this.$message.warning(res.message || '删除失败')
        }
      })
    },
    /** 查看详情：直接复用访客详情弹窗，传接口原始记录 */
    handleDetail(record) {
      this.$refs.detailModal.show(record, '劳动派遣详情', false, 'temp')
    },
  },
}
</script>

<style lang="less" scoped>
@import '../temporary-worker-theme.less';

.temporary-worker-archive {
  padding: 0;
  background: var(--background);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  /* 整页滚动：取消表格区域的内部滚动限制 */
  .v-content {
    flex: none;
    overflow: visible;
  }

  .v-scroll-area {
    overflow: visible;
  }
}

/* 统计卡片：横向排列（参考原型 stat-bar / file 页面，scoped 样式不跨页，需在本页定义） */
.v-stat-bar {
  padding: 14px 24px 0;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.v-stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border: 1px solid @v-border;
  border-radius: 12px;
  background: #fff;
  box-shadow: @v-shadow-card;
  flex: 1;
  min-width: 210px;
  position: relative;
  overflow: hidden;

  /* 左侧渐变装饰条 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: @v-gradient-blue;
  }
}

.v-stat-num {
  font-size: 25px;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  color: @v-foreground;
}

.v-stat-label {
  font-size: 12.5px;
  color: @v-muted-foreground;
  font-weight: 500;
  margin-top: 3px;
}

/* 统计卡片图标：总数蓝 / 未入档橙 / 已入档绿 */
.v-stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }

  &.total {
    background: linear-gradient(135deg, #2d78ff, #00b4d8);
  }

  &.pending {
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
  }

  &.done {
    background: linear-gradient(135deg, #10b981, #34d399);
  }
}

/* 日期范围 */
.date-range {
  display: flex;
  align-items: center;
  gap: 6px;
}

.range-sep {
  color: var(--muted-foreground);
}

/* Tab 栏右侧提示 */
.archive-tab-bar {
  align-items: center;
}

.tab-hint {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--muted-foreground);
  background: #fff;
  border: 1px dashed rgba(37, 99, 235, 0.25);
  border-radius: 8px;
  padding: 7px 12px;
}

/* 姓名单元格 */
.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-s {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: linear-gradient(135deg, #2d78ff, #00b4d8);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(45, 120, 255, 0.2);

  &.lock {
    background: linear-gradient(135deg, #94a3b8, #cbd5e1);
    box-shadow: none;
  }
}

.name-txt {
  font-weight: 500;
}

/* 来访类型标签 */
.tag-soft {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
}

/* 等宽数字列 */
/deep/ .col-mono {
  font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 12.5px;
}

/* 删除按钮（浅色描边样式） */
.v-btn-danger-light {
  background: rgba(239, 68, 68, 0.06);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.3);
  font-weight: 600;

  &:hover,
  &:focus {
    background: rgba(239, 68, 68, 0.12);
    border-color: #ef4444;
    color: #b91c1c;
  }
}
</style>
