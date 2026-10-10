<template>
  <a-card :bordered="false" class="recruitment-list-page" style="padding: 0">
    <!-- 顶部统计卡 -->
    <!-- <div class="stage-stat-row">
      <div
        v-for="item in statCards"
        :key="item.value"
        class="stage-stat-card"
        :class="{ active: currentStatus == item.value }"
        :style="{ '--c': item.color, '--soft': item.soft, '--bg': item.bg }"
        @click="handleCardStatusChange(item.value)"
      >
        <div class="stat-icon"><a-icon :type="item.icon" /></div>
        <div class="stat-main">
          <div class="stat-num">{{ item.count }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </div>
    </div> -->

    <!-- 状态 tabs（暂不过滤，仅切换高亮） -->
    <a-tabs v-model="currentStatus" class="state-tabs" @change="handleCardStatusChange">
      <a-tab-pane v-for="item in statCards" :key="item.value">
        <span slot="tab">{{ item.label }}</span>
      </a-tab-pane>
    </a-tabs>

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="5" :sm="12">
            <a-form-item label="姓名">
              <a-input v-model.trim="queryParam.xm" placeholder="请输入姓名" allowClear />
            </a-form-item>
          </a-col>
          <a-col :md="5" :sm="12">
            <a-form-item label="学历">
              <j-dict-select-tag type="list" v-model="queryParam.xl" dictCode="xl" placeholder="请选择学历" />
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="12">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" class="pm-btn-primary" icon="search" @click="searchQuery">查询</a-button>
              <a-button class="pm-btn-reset" icon="reload" style="margin-left: 8px" @click="searchReset">重置</a-button>
              <a-button
                type="primary"
                class="pm-btn-primary"
                icon="download"
                style="margin-left: 8px"
                @click="handleExportXlsNew(stageText + '面试管理')"
                >导出</a-button
              >
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 批量评审栏 -->
    <div class="batch-bar">
      <div class="bar-left">
        <span
          >已选择 <a class="sel-count">{{ selectedRowKeys.length }}</a> 项</span
        >
        <a class="bar-clear" @click="onClearSelected">清空</a>
      </div>
      <div
        style="display: flex; align-items: center; gap: 8px; flex: 1; justify-content: flex-end; padding-right: 10px"
      >
        <a-button
          v-if="currentStatus == pendingText"
          class="pm-btn-primary"
          :disabled="selectedRowKeys.length == 0"
          @click="handleBatchReview"
        >
          {{ selectedRowKeys.length > 1 ? '批量' : '' }}评审
        </a-button>
      </div>

      <span class="bar-tip">仅待面试状态候选人支持批量评审</span>
    </div>

    <!-- 表格 -->
    <a-table
      ref="table"
      size="middle"
      :scroll="{ x: true, y: 300 }"
      bordered
      rowKey="id"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="ipagination"
      :loading="loading"
      :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      class="j-table-force-nowrap"
      @change="handleTableChange"
    >
      <span slot="zt" slot-scope="text, record">
        <a-tag :color="getZtColor(text, record)" style="margin-right: 0">{{ getZtText(text, record) }}</a-tag>
      </span>
      <span slot="mssj" slot-scope="text" class="mssj-cell">{{ formatValue(text) }}</span>
      <span slot="jlFujian" slot-scope="text">
        <a v-if="text" class="resume-link" @click="lookPdf(text)">查看</a>
        <span v-else>-</span>
      </span>
      <span slot="action" slot-scope="text, record">
        <a @click="handleDetail(record)">详情</a>
      </span>
    </a-table>

    <interview-process-modal ref="processModal" @ok="handleProcessOk" />
    <column-config-sidebar
      :visible="columnConfigVisible"
      :allColumns="columnConfigNew"
      :fieldTitleMap="fieldTitleMap"
      @close="columnConfigVisible = false"
      @confirm="handleColumnConfigConfirm"
    />
  </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { httpAction, getAction, getFileAccessHttpUrl } from '@/api/manage'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { columnConfigMixin } from '@/mixins/columnConfigMixin'
import InterviewProcessModal from './modules/InterviewProcessModal.vue'
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'
import { recruitmentOrgFilterMixin } from '../common/recruitmentOrgFilterMixin.js'

const STAGE_TEXT_MAP = { 1: '初试', 2: '复试', 3: '终试' }

export default {
  name: 'HrmMsglStageList',
  orgTreeUrl: '/zpManage/hrmMsgl/loadTreeRoot',
  mixins: [JeecgListMixin, mixinDevice, columnConfigMixin, recruitmentOrgFilterMixin],
  components: {
    InterviewProcessModal,
    ColumnConfigSidebar,
  },
  props: {
    // 阶段：1 初审 / 2 复审 / 3 终审
    stage: {
      type: [Number, String],
      default: 1,
    },
    mainData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      columnCode: 'HrmMsgl',
      disableMixinCreated: true,
      description: '面试审核列表',
      queryParam: this.getDefaultQueryParam(),
      currentStatus: 'all',
      baseColumns: [
        { title: '状态', dataIndex: 'ztField', align: 'center', width: 100, scopedSlots: { customRender: 'zt' } },
        { title: '面试形式', dataIndex: 'xsField', align: 'center', width: 120 },
        { title: '面试时间', dataIndex: 'sjField', align: 'center', width: 150 },

        { title: '姓名', dataIndex: 'xm', align: 'center', width: 100, customRender: this.formatValue },
        { title: '性别', dataIndex: 'xb', align: 'center', width: 80, customRender: this.formatValue },
        { title: '年龄', dataIndex: 'nl', align: 'center', width: 80, customRender: this.formatValue },
        { title: '学历', dataIndex: 'xl', align: 'center', width: 100, customRender: this.formatValue },
        { title: '简历', dataIndex: 'jlFujian', align: 'center', width: 90, scopedSlots: { customRender: 'jlFujian' } },
      ],
      url: {
        // TODO: 后端将分别提供三个阶段的列表/统计接口，确认后按 stage 切换
        // /zpManage/hrmMsgl/listSecond
        // /zpManage/hrmMsgl/listFirst
        // /zpManage/hrmMsgl/listFinal
        list: '',
        exportXlsUrl: '/zpManage/hrmMsgl/exportXls',
        getTotal: '/zpManage/hrmMsgl/getTotal',
      },
      superFieldList: [],
    }
  },
  computed: {
    stageNum() {
      return Number(this.stage) || 1
    },
    stageText() {
      return STAGE_TEXT_MAP[this.stageNum] || '初试'
    },
    pendingText() {
      return '待' + this.stageText
    },
    stageFields() {
      const map = {
        1: { zt: 'csmsZt', xs: 'msxs', sj: 'mssj' },
        2: { zt: 'fsmsZt', xs: 'fsmsxs', sj: 'fsmsSj' },
        3: { zt: 'zsmsZt', xs: 'zsmsxs', sj: 'zsmsSj' },
      }
      return map[this.stageNum] || map[1]
    },
    originalColumns() {
      const fields = this.stageFields
      return this.baseColumns.map((col) => {
        const newCol = { ...col }
        if (col.dataIndex === 'ztField') newCol.dataIndex = fields.zt
        if (col.dataIndex === 'xsField') newCol.dataIndex = fields.xs
        if (col.dataIndex === 'sjField') newCol.dataIndex = fields.sj
        return newCol
      })
    },
    statCards() {
      return [
        {
          label: '全部',
          value: 'all',
          count: 0,
          icon: 'team',
          color: '#1890ff',
          soft: 'rgba(24,144,255,0.16)',
          bg: '#e6f7ff',
        },
        {
          label: this.pendingText,
          value: this.pendingText,
          count: 0,
          icon: 'clock-circle',
          color: '#fa8c16',
          soft: 'rgba(250,140,22,0.16)',
          bg: '#fff7e6',
        },
        {
          label: this.stageText + '通过',
          value: this.stageText + '通过',
          count: 0,
          icon: 'check-circle',
          color: '#52c41a',
          soft: 'rgba(82,196,26,0.16)',
          bg: '#f6ffed',
        },
        {
          label: this.stageText + '不通过',
          value: this.stageText + '不通过',
          count: 0,
          icon: 'close-circle',
          color: '#f5222d',
          soft: 'rgba(245,34,45,0.16)',
          bg: '#fff1f0',
        },
      ]
    },
    fieldTitleMap() {
      const map = {}
      this.originalColumns.forEach((col) => {
        if (col.dataIndex && col.title) {
          map[col.dataIndex] = col.title
        }
      })
      return map
    },
    columns() {
      const fixedColumns = [
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          // fixed: 'right',
          width: 100,
          scopedSlots: { customRender: 'action' },
        },
      ]
      return this.applyColumnConfig(this.originalColumns, { fixedColumns })
    },
    columnConfigNew() {
      return this.getColumnConfigData()
    },
  },
  created() {
    if (this.stageNum == 1) {
      this.url.list = '/zpManage/hrmMsgl/listFirst'
    } else if (this.stageNum == 2) {
      this.url.list = '/zpManage/hrmMsgl/listSecond'
    } else if (this.stageNum == 3) {
      this.url.list = '/zpManage/hrmMsgl/listFinal'
    }

    this.loadData(1)
  },
  watch: {
    dataSource: {
      handler(newVal, oldVal) {
        this.getStatusTotal()
      },
      immediate: true,
    },
  },
  methods: {
    renderTooltip(text, width) {
      const value = String(this.formatValue(text))
      return this.$createElement(
        'a-tooltip',
        {
          style: {
            width: width + 'px',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            display: 'block',
          },
          props: {
            title: value,
          },
        },
        [this.$createElement('span', value)]
      )
    },
    formatCompanyName(value) {
      return value ? String(value).split('/')[0] : '-'
    },
    getDefaultQueryParam() {
      return { zpjhid: this.mainData.zpjhid, gljlId: this.mainData.id, xm: '', xl: '', stage: this.stageNum }
    },
    getStatusTotal() {
      const typeMap = { 1: 'csmsZt', 2: 'fsmsZt', 3: 'zsmsZt' }
      const params = { type: typeMap[this.stageNum] || '' }
      getAction(this.url.getTotal, params).then((res) => {
        if (res && res.success && Array.isArray(res.result)) {
          const totalMap = {}
          res.result.forEach((item) => {
            totalMap[item.statusText] = Number(item.statustotal) || 0
          })
          this.statCards.forEach((item) => {
            if (item.value == 'all') {
              item.count = totalMap['全部'] || 0
            } else {
              item.count = totalMap[item.value] || 0
            }
          })
        }
      })
    },

    handleCardStatusChange(value) {
      this.currentStatus = value
      const ztField = this.stageFields.zt
      this.queryParam[ztField] = value == 'all' ? '' : value
      this.searchQuery()
    },
    searchReset() {
      this.queryParam.xm = ''
      this.queryParam.xl = ''
      this.loadData(1)
      this.onClearSelected()
    },
    handleBatchReview() {
      if (!this.selectionRows.length) {
        this.$message.warning('请先勾选候选人')
        return
      }
      this.$refs.processModal.batchReview(this.selectionRows, this.stageNum)
    },
    handleDetail(record) {
      this.$refs.processModal.detail(record, this.stageNum)
    },
    handleProcessOk() {
      this.onClearSelected()
      this.loadData()
    },
    getZtText(text, r) {
      return this.formatValue(r[this.stageFields.zt])
    },
    getZtColor(text, r) {
      const txt = this.formatValue(r[this.stageFields.zt])
      const map = {
        [this.pendingText]: 'orange',
        [this.stageText + '通过']: 'green',
        [this.stageText + '不通过']: 'red',
      }
      return map[txt] || ''
    },

    formatValue(value) {
      return value == undefined || value == null || (typeof value == 'string' && value.trim() == '') ? '-' : value
    },
  },
}
</script>

<style scoped lang="less">
@import '~@assets/less/common.less';
/deep/ .ant-card-body {
  padding: 0;
  padding-left: 12px;
  padding-right: 12px;
}
.recruitment-list-page {
  position: relative;
  height: calc(100vh - 120px - 24px);
  overflow: hidden;
  overflow-y: auto;
}

/* 顶部统计卡 */
.stage-stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 12px 0;
}

.stage-stat-card {
  --c: #1890ff;
  --soft: rgba(24, 144, 255, 0.16);
  --bg: #e6f7ff;
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 0 10px rgba(184, 218, 255, 0.5);
  cursor: pointer;
  transition: all 0.22s ease;

  &:hover {
    border-color: var(--c);
    background: var(--bg);
    transform: translateY(-2px);
    box-shadow: 0 4px 14px var(--soft);
  }

  &.active {
    border-color: var(--c);
    background: var(--bg);
    box-shadow: 0 4px 14px var(--soft);

    .stat-num,
    .stat-icon {
      color: var(--c);
    }
  }
}

.stat-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--c);
  background: var(--soft);
}

.stat-main {
  min-width: 0;
}

.stat-num {
  font-size: 22px;
  font-weight: 700;
  color: #262626;
  line-height: 1.1;
}

.stat-label {
  margin-top: 2px;
  font-size: 12px;
  color: #8c8c8c;
  white-space: nowrap;
}

/* 批量评审栏 */
.batch-bar {
  display: flex;
  align-items: center;
  margin: 6px 0;
  padding: 8px 12px;
  border: 1px solid #d6e8ff;
  border-radius: 6px;
  background: #f0f7ff;
  justify-content: space-between;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #262626;
  font-size: 13px;

  .sel-count {
    color: #2d78ff;
    font-weight: 700;
  }

  .bar-clear {
    color: #2d78ff;
    cursor: pointer;
  }
}

.batch-btn {
  border-color: #2d78ff;
  color: #2d78ff;
  border-radius: 6px;
}

.bar-tip {
  color: #5a6472;
  font-size: 13px;
}

.mssj-cell {
  color: #fa541c;
}

.resume-link {
  color: #2d78ff;
}

/* ==== 按钮 ==== */
.pm-btn-primary {
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
  color: #ffffff;

  &:hover,
  &:focus {
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    opacity: 0.92;
  }
}
.pm-btn-primary[disabled] {
  background: linear-gradient(135deg, #e8e8e8 0%, #ccc 100%);
  box-shadow: none;
}

.pm-btn-reset {
  height: 34px;
  border-radius: 8px;
  color: #64748b;
  border-color: #e2e8f0;
  background: #ffffff;

  &:hover {
    color: #1a2a3d;
    border-color: rgba(37, 99, 235, 0.35);
  }
}
</style>
