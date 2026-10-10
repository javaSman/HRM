<!--
  @description 临时工面试页面
  @date 2026-10-09
  @functionality 劳动派遣人员面试管理，支持按访客姓名/接待人/派遣公司/预计来访时间筛选，勾选记录批量登记面试结果（未面试/已通过/不通过）
-->
<template>
  <div class="temporary-worker-interview">
    <!-- 统计卡片：劳动派遣总数 / 未面试 / 已通过 / 不通过 -->
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
          <div class="v-stat-label">劳动派遣总数</div>
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
          <div class="v-stat-num">{{ counts.none }}</div>
          <div class="v-stat-label">未面试</div>
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
          <div class="v-stat-num">{{ counts.pass }}</div>
          <div class="v-stat-label">已通过</div>
        </div>
      </div>
      <div class="v-stat-card">
        <div class="v-stat-icon fail">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <div>
          <div class="v-stat-num">{{ counts.fail }}</div>
          <div class="v-stat-label">不通过</div>
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
        <a-button type="primary" class="v-btn" @click="handleInterview"> <a-icon type="solution" />面试 </a-button>
      </div>
    </div>

    <!-- 状态筛选 - 胶囊样式：未面试 / 已通过 / 不通过 -->
    <div class="v-status-tabs interview-tab-bar">
      <div
        v-for="tab in interviewTabs"
        :key="tab.key"
        :class="['v-status-tab', activeTab === tab.key ? 'active' : '']"
        @click="changeTab(tab.key)"
      >
        {{ tab.label }} <span class="tab-count">{{ counts[tab.countKey] }}</span>
      </div>
      <div class="tab-hint"><a-icon type="info-circle" />面试结果【已通过】的数据将自动进入临时工入档</div>
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
            <!-- 面试状态列：未面试/已通过/不通过 -->
            <template slot="mszt" slot-scope="text, record">
              <span :class="['v-status-tag', interviewStatusClass(record.mszt)]">
                <span class="dot"></span>
                {{ interviewStatusText(record.mszt) }}
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

    <!-- 详情弹窗（直接复用访客详情组件，detailType=temp） -->
    <employee-visitor-detail ref="detailModal" />

    <!-- 面试结果登记弹窗（参考原型 ivModal） -->
    <interview-modal ref="interviewModal" @ok="handleInterviewOk" />
  </div>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction, postAction } from '@/api/manage'
import JDate from '@/components/jeecg/JDate'
import InterviewModal from './modules/InterviewModal'
import EmployeeVisitorDetail from '@/views/visitor/modules/EmployeeVisitorDetail.vue'

/**
 * 临时工面试组件
 * 劳动派遣人员的未面试/已通过/不通过面试结果管理
 */
export default {
  name: 'TemporaryWorkerInterview',
  mixins: [JeecgListMixin],
  components: { JDate, InterviewModal, EmployeeVisitorDetail },
  data() {
    return {
      /** 禁用混入的自动加载，由本页面 created 主动加载 */
      disableMixinCreated: true,
      /** 当前状态 Tab：'0'-未面试，'1'-已通过，'2'-不通过 */
      activeTab: '0',
      /** 状态 Tab 配置 */
      interviewTabs: [
        { key: '0', countKey: 'none', label: '未面试' },
        { key: '1', countKey: 'pass', label: '已通过' },
        { key: '2', countKey: 'fail', label: '不通过' },
      ],
      /** 接口地址配置（劳动派遣登记审批列表） */
      url: {
        list: '/fkzx/hrmFkzxSq/list',
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
        mszt: '0', // 面试状态：0-未面试，1-已通过，2-不通过
        isMyReception: false, // 是否仅查本人接待
      },
      /** 顶部统计数量 */
      statCounts: {
        all: 0,
        none: 0,
        pass: 0,
        fail: 0,
      },
      /** 表格列定义 */
      columns: [
        {
          title: '序号',
          dataIndex: 'idx',
          width: 50,
          align: 'center',
          customRender: (text, record, index) => (this.ipagination.current - 1) * this.ipagination.pageSize + index + 1,
        },
        { title: '面试状态', dataIndex: 'mszt', width: 100, align: 'center', scopedSlots: { customRender: 'mszt' } },
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
    /** 表格选择项配置 */
    rowSelection() {
      return {
        columnWidth: 50,
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange,
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
    /** 面试状态样式：0-未面试蓝，1-已通过绿，2-不通过红 */
    interviewStatusClass(value) {
      const v = String(value)
      if (v === '1') return 'handled'
      if (v === '2') return 'notpass'
      return 'audit'
    },
    /** 面试状态文案 */
    interviewStatusText(value) {
      const v = String(value)
      if (v === '1') return '已通过'
      if (v === '2') return '不通过'
      return '未面试'
    },
    /**
     * 加载列表数据：调用劳动派遣登记列表接口
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
    /** 顶部统计：调用状态统计接口（编码 hrm_fkzx_sq），按 mszt 取未面试/已通过/不通过数量 */
    loadStatCounts() {
      postAction('/commonTj/ztTjInfo/getTjListByCodes', { hrm_fkzx_sq: {} }).then((res) => {
        if (res.success && res.result && res.result.hrm_fkzx_sq && res.result.hrm_fkzx_sq.mszt_tj) {
          let none = 0
          let pass = 0
          let fail = 0
          res.result.hrm_fkzx_sq.mszt_tj.forEach((item) => {
            // 接口返回字典文案：已通过/未面试/不通过
            if (item.mszt === '已通过') {
              pass += item.count
            } else if (item.mszt === '不通过') {
              fail += item.count
            } else {
              none += item.count
            }
          })
          this.statCounts = { all: none + pass + fail, none, pass, fail }
        }
      })
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
        mszt: '0',
        isMyReception: false,
      }
      this.activeTab = '0'
      this.loadData(1)
    },
    /** 切换未面试/已通过/不通过 Tab */
    changeTab(key) {
      this.activeTab = key
      this.queryParam.mszt = key
      this.loadData(1)
    },
    /** 面试：打开弹窗，传入勾选记录 */
    handleInterview() {
      if (!this.selectedRowKeys.length) {
        this.$message.warning('请先勾选需要登记面试结果的临时工记录')
        return
      }
      this.$refs.interviewModal.show(this.selectionRows)
    },
    /** 面试结果登记成功：清空勾选并刷新列表与统计 */
    handleInterviewOk() {
      this.selectedRowKeys = []
      this.selectionRows = []
      this.loadData()
      this.loadStatCounts()
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

.temporary-worker-interview {
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

/* 统计卡片：横向排列（参考原型 stat-bar，scoped 样式不跨页，需在本页定义） */
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

/* 统计卡片图标：总数蓝 / 未面试橙 / 已通过绿 / 不通过红 */
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

  &.fail {
    background: linear-gradient(135deg, #ef4444, #f87171);
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
.interview-tab-bar {
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
</style>

