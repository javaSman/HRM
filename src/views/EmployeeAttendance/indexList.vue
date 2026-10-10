<template>
  <div class="attendance-list-panel">
    <div style="display: flex; justify-content: space-between; line-height: 50px; align-items: center">
      <h3 style="margin: 0; padding-left: 10px; font-weight: 700; font-size: 18px">考勤管理</h3>

      <div class="attendance-filter-actions">
        <a-button type="primary" class="attendance-btn-primary" icon="calendar" @click="todayDrawerVisible = true"
          >今日考勤</a-button
        >
        <a-button type="primary" class="attendance-btn-primary" icon="download" @click="handleExportXls('员工考勤表')"
          >导出数据</a-button
        >
        <a-button type="primary" class="attendance-btn-primary" icon="upload" @click="handleImportAttendance"
          >导入考勤数据</a-button
        >
        <a-button
          v-if="username === 'kfadmin'"
          type="primary"
          class="attendance-btn-primary"
          @click="regenerateVisible = true"
        >
          <a-icon type="retweet" />重新生成
        </a-button>
        <a-button class="attendance-btn-primary" type="primary" @click="toggleColumnConfig">
          <a-icon type="setting" /> 字段配置
        </a-button>
      </div>
    </div>

    <!-- 公司卡片区 -->
    <div v-if="companyStatsArr && companyStatsArr.length" class="company-cards-bar">
      <div
        :class="!companyCardsCollapsed ? 'company-cards-header company-cards-header-active' : 'company-cards-header'"
        @click="companyCardsCollapsed = !companyCardsCollapsed"
      >
        <span class="company-cards-title">公司列表</span>
        <a-icon :type="companyCardsCollapsed ? 'down' : 'up'" class="company-cards-toggle-icon" />
      </div>
      <transition name="company-cards-collapse">
        <div v-show="!companyCardsCollapsed" class="company-cards-grid">
          <div
            v-for="item in companyStatsArr"
            :key="item.id"
            class="company-card"
            :class="{ 'company-card--active': selectedCompanyIds(item.deptBelong) }"
            @click="onCompanyCardClick(item)"
          >
            <div class="company-card-head">
              <div class="company-card-title" :title="item.name">{{ item.name }}</div>
              <div class="company-card-radio">
                <span class="company-card-radio-dot"></span>
              </div>
            </div>

            <div class="company-card-body">
              <div class="company-card-stat">
                <span class="company-card-stat-num">{{ item.employeeInformationTotal || 0 }}</span>
                <span class="company-card-stat-label">人</span>
              </div>
              <div class="company-card-stats-row">
                <div style="font-size: 11px">出勤状态:</div>
                <div class="company-card-stats-item">
                  <span class="company-card-stats-dot company-card-stats-dot--normal"></span>
                  <span class="company-card-stats-text">正常</span>
                  <span class="company-card-stats-val">{{ item.ok || 0 }}</span>
                </div>
                <div class="company-card-stats-divider"></div>
                <div class="company-card-stats-item">
                  <span class="company-card-stats-dot company-card-stats-dot--abnormal"></span>
                  <span class="company-card-stats-text">异常</span>
                  <span class="company-card-stats-val">{{ item.yc || 0 }}</span>
                </div>
              </div>
            </div>

            <div class="company-card-progress">
              <div
                :class="'progress' + value.attendanceStatus"
                v-for="value in item.totalVoList"
                :style="getCompanyProgress(value.attendanceTotal, item.ok, item.yc, value.attendanceStatus)"
              ></div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <a-tabs v-model="activeKey" type="card">
      <a-tab-pane v-for="item in tabsList" :key="item.value">
        <span slot="tab" :data-status="item.value"> {{ item.title }}({{ item.count }}) </span>
      </a-tab-pane>
    </a-tabs>

    <!-- <div class="attendance-stat-bar">
      <div v-for="item in mockStatCards" :key="item.key" class="attendance-stat-card" :class="'attendance-stat-card--' + item.theme">
        <div class="attendance-stat-icon" :class="'attendance-stat-icon--' + item.theme">
          <a-icon :type="item.icon" />
        </div>
        <div class="attendance-stat-info">
          <div class="attendance-stat-value">{{ item.value }}</div>
          <div class="attendance-stat-label">{{ item.label }}</div>
          <div class="attendance-stat-desc">{{ item.desc }}</div>
        </div>
      </div>
    </div> -->

    <div></div>

    <!-- 筛选条件展示栏 -->
    <div v-if="filterConditions.length" class="filter-conditions-bar">
      <span class="filter-conditions-label">FILTER</span>
      <div class="filter-conditions-list">
        <a-tag
          v-for="item in filterConditions"
          :color="item.color"
          :key="item.key"
          :closable="item.closable"
          @close="item.onClose"
        >
          {{ item.label }}
        </a-tag>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="attendance-filter-bar">
      <div class="attendance-filter-item attendance-search-wrap">
        <span class="attendance-filter-label">姓名</span>
        <a-input
          v-model.trim="queryParam.name"
          class="attendance-filter-input"
          allowClear
          placeholder="搜索员工姓名"
          @pressEnter="searchQuery(1)"
        >
        </a-input>
      </div>

      <div class="attendance-filter-item">
        <span class="attendance-filter-label">工号</span>
        <a-input
          v-model="queryParam.no"
          class="attendance-filter-input"
          allowClear
          placeholder="请输入工号"
          @pressEnter="searchQuery(1)"
        />
      </div>

      <div class="attendance-filter-item">
        <span class="attendance-filter-label">月份</span>
        <a-month-picker
          v-model="skrqMonth"
          format="YYYY-MM"
          :allowClear="false"
          placeholder="选择月份"
          class="attendance-filter-month-picker"
          @change="onSkrqMonthChange"
        />
      </div>

      <div class="attendance-filter-item">
        <span class="attendance-filter-label">刷卡日期</span>
        <a-range-picker
          v-model="skrqRange"
          class="attendance-filter-range-picker"
          format="YYYY-MM-DD"
          :placeholder="['开始日期', '结束日期']"
          @change="onSkrqDateChange"
        />
      </div>

      <!-- <div class="attendance-filter-item" v-if="!deptBelongKey">
        <span class="attendance-filter-label">公司</span>
        <a-select v-model="queryParam.deptBelong" allowClear placeholder="请选择公司" class="attendance-filter-select"
          @change="onCompanyChange">
          <a-select-option v-for="item in companyList" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div> -->

      <div class="attendance-filter-item">
        <span class="attendance-filter-label">部门</span>
        <a-cascader
          :options="deptList"
          v-model="deptArr"
          placeholder="请选择部门"
          class="attendance-filter-cascader"
          changeOnSelect
          :show-search="{ filter }"
          :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
          @change="onCascaderChange"
        />
      </div>

      <div class="attendance-filter-item">
        <span class="attendance-filter-label">员工类型</span>
        <j-dict-select-tag
          v-model="queryParam.employeeType"
          dictCode="yglx"
          placeholder="请选择"
          class="attendance-filter-dict-select"
          style="width: 160px"
        />
      </div>

      <div class="attendance-filter-actions">
        <a-button type="primary" class="attendance-btn-primary" @click="searchQuery(1)">查询</a-button>
        <a-button class="attendance-btn-reset" @click="searchReset()">重置</a-button>
      </div>
    </div>

    <div class="attendance-table-wrap">
      <a-table
        ref="table"
        :key="tableKey"
        size="middle"
        :scroll="{ x: true, y: companyCardsCollapsed ? 440 : 210 }"
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        bordered
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        class="j-table-force-nowrap"
        @change="handleTableChange"
      >
        <template slot="ruleName" slot-scope="text, record">
          <a-tag
            style="margin: 0"
            :color="dictColor[record.ruleId_dictText] ? dictColor[record.ruleId_dictText].color : null"
            @click.stop="openRuleDetail(record)"
          >
            {{ record.ruleId_dictText }}
          </a-tag>
        </template>

        <span slot="attendanceStatus" slot-scope="text, record">
          <a-tag
            style="margin: 0"
            v-if="text.indexOf('+') == -1"
            :color="getAttendanceStatusClass(record.attendanceStatus)"
          >
            {{ record.attendanceStatus_dictText }}
          </a-tag>
          <template v-else>
            <a-tag v-for="item in text.split('+')" :key="item" :color="getAttendanceStatusClassObj(item).color">
              {{ getAttendanceStatusClassObj(item).text }}
            </a-tag>
          </template>
        </span>

        <template slot="postId" slot-scope="text, record">
          <a-tooltip
            style="
              width: 120px;
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;
              display: block;
              cursor: pointer;
            "
          >
            <template slot="title">{{ record.postId_dictText }}</template>
            <span style="color: #0d5fab" @click="openRuleDetail(record)">{{ record.postId_dictText }}</span>
          </a-tooltip>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="handleClockRecord(record)">出勤记录</a>
        </span>
      </a-table>
    </div>

    <hr-kq-yg-modal ref="modalForm" @ok="modalFormOk"></hr-kq-yg-modal>
    <hr-kq-yg-clock-record-modal ref="clockRecordModal"></hr-kq-yg-clock-record-modal>
    <hr-kq-rule-detail-modal ref="ruleDetailModal"></hr-kq-rule-detail-modal>
    <attendance-import-modal ref="attendanceImportModal" @ok="loadData(1)"></attendance-import-modal>

    <a-modal
      title="重新生成考勤数据"
      :visible="regenerateVisible"
      @ok="handleRegenerate"
      wrapClassName="attendance-regenerate-modal"
      @cancel=";(regenerateVisible = false), (regenerateDate = [])"
    >
      <template slot="footer">
        <a-button key="back" class="attendance-btn-reset" @click=";(regenerateVisible = false), (regenerateDate = [])">
          取消
        </a-button>
        <a-button
          key="submit"
          type="primary"
          class="attendance-btn-primary"
          :loading="handleRegenerateLoading"
          @click="handleRegenerate"
        >
          确认生成
        </a-button>
      </template>

      <a-form-model layout="vertical">
        <a-form-model-item label="选择日期">
          <j-range-picker
            v-model="regenerateDate"
            format="YYYY-MM-DD"
            :disabledDate="disabledDate"
            changeOnSelect
            style="width: 300px"
          />
        </a-form-model-item>
        <div style="color: #94a3b8; font-size: 12px; margin-top: 8px">
          提示：选择日期后将提交实时重算任务，由 Worker 异步生成考勤数据；可在“考勤实时计算监控”查看进度
        </div>
      </a-form-model>
    </a-modal>

    <!-- 字段配置侧边栏 -->
    <ColumnConfigSidebar
      :visible="columnConfigVisible"
      :allColumns="columnConfigNew"
      :fieldTitleMap="fieldTitleMap"
      @close="columnConfigVisible = false"
      @confirm="handleColumnConfigConfirm"
    />

    <!-- 今日考勤顶部抽屉 -->
    <TodayAttendanceDrawer
      :visible="todayDrawerVisible"
      :apiUrl="url.getTotal"
      :tabsList="tabsList"
      :companyList="companyList"
      :deptBelongKey="deptBelongKey"
      @close="todayDrawerVisible = false"
      @card-click="handleTodayCardClick"
    />
  </div>
</template>

<script>
import { SuperQuery } from '@/utils/superQueryUtil'

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import moment from 'moment'
import HrKqYgModal from './modules/HrKqYgModal'
import HrKqYgClockRecordModal from './modules/HrKqYgClockRecordModal.vue'
import HrKqRuleDetailModal from './modules/HrKqRuleDetailModal.vue'
import AttendanceImportModal from './modules/AttendanceImportModal.vue'
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'
import TodayAttendanceDrawer from './modules/TodayAttendanceDrawer.vue'
import { getAction, httpAction, postAction } from '@/api/manage'

const attendanceStatusMap = {
  NORMAL: { text: '正常', color: '#36d985', code: 'NORMAL' },
  BE_LATE: { text: '迟到', color: '#ff814b', code: 'BE_LATE' },
  LEAVE_EARLY: { text: '早退', color: '#ffa200', code: 'LEAVE_EARLY' },
  MISSING: { text: '缺卡', color: '#ff5900', code: 'MISSING' },
  ABSENT: { text: '旷工', color: '#e93030', code: 'ABSENT' },
  OTHER: { text: '其他', color: '', code: 'OTHER' },
  SickLeave: { text: '病假', color: '', code: 'SickLeave' },
  CasualLeave: { text: '事假', color: '', code: 'CasualLeave' },
  Weekend: { text: '休息日', color: '#00cb9e', code: 'Weekend' },
  Holiday: { text: '节假日', color: '#03cc00', code: 'Holiday' },
  BK: { text: '补卡', color: '#096dd9', code: 'BK' },
  WC: { text: '外出', color: '#e7b625', code: 'WC' },
  XJ: { text: '休假', color: '#00cce3', code: 'XJ' },
}

const clockTimeCellProps = {
  style: {
    backgroundColor: '#f7fbff',
  },
}

const clockTimeHeaderCellProps = {
  style: {
    backgroundColor: '#eef7ff',
  },
}

function renderEmptyText(text) {
  return text === undefined || text === null || text === '' ? '' : text
}

function getClockTimeCellProps() {
  return clockTimeCellProps
}

function getClockTimeHeaderCellProps() {
  return clockTimeHeaderCellProps
}

export default {
  name: 'HrKqYgList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    HrKqYgModal,
    HrKqYgClockRecordModal,
    HrKqRuleDetailModal,
    AttendanceImportModal,
    ColumnConfigSidebar,
    TodayAttendanceDrawer,
  },
  props: {
    deptBelongKey: {
      type: String,
      default: '',
    },
    companyList: {
      type: Array,
      default: () => {
        return [{ id: '2059089110892486657' }]
      },
    },
  },
  data() {
    const currentMonth = moment()
    return {
      tabsList: [
        {
          title: '全部',
          value: '',
          count: 0,
        },
      ],
      activeKey: '',
      companyCardsCollapsed: true, // 公司卡片折叠状态，默认合着

      handleRegenerateLoading: false,
      todayDrawerVisible: false,
      attendanceStatusArr: '',
      isorter: {
        // column: 'no,skrq',
        // order: 'asc,desc',
        column: 'skrq',
        order: 'desc',
      },

      ipagination: {
        pageSize: 20,
      },

      // disableMixinCreated: false,
      // dataSource: [],
      description: '员工考勤表管理页面',
      total: {
        infoCount: 0,
      },
      deptArr: [],
      tableKey: 0,
      skrqRange: [],
      skrqMonth: currentMonth,
      queryParam: {
        dateTime: currentMonth.format('YYYY-MM'),
      },

      url: {
        getTotal: '/hr_kq_yg/hrKqYg/getTotal',

        list: '/hr_kq_yg/hrKqYg/list',
        delete: '/hr_kq_yg/hrKqYg/delete',
        deleteBatch: '/hr_kq_yg/hrKqYg/deleteBatch',
        exportXlsUrl: '/hr_kq_yg/hrKqYg/exportXls',
        importExcelUrl: 'hr_kq_yg/hrKqYg/importExcel',
        importExcelUrlNewName: 'HrKqYg',
        realtimeEnqueueRange: '/attendance/realtime/task/enqueueRange',
      },
      dictOptions: {},
      superFieldList: [],
      regenerateVisible: false,
      regenerateDate: [],
      dictColor: {},

      //自定义标题参数
      columnConfigVisible: false,
      columnTakeEffect: false, //自定义标题生效
      columnConfig: [],
      columnCode: 'HrKqYg',

      // 公司卡片 - 各公司考勤统计
      companyStatsArr: [],
      deptBelongArr: [],

      disableMixinCreated: true,
    }
  },
  created() {
    this.getDictColor()

    setTimeout(() => {
      this.getColumnConfig()
    }, 500)
    this.getSuperFieldList()
  },

  computed: {
    columnConfigNew() {
      return this.columnConfig.map((item) => item)
    },
    // 当前激活的筛选条件列表
    filterConditions() {
      const list = []
      // 月份
      if (this.skrqMonth) {
        list.push({
          key: 'dateTime',
          label: this.skrqMonth.format('YYYY-MM'),
          closable: false,
          color: 'blue',
          onClose: () => {},
        })
      }
      // 刷卡日期范围
      if (this.skrqRange && this.skrqRange.length === 2) {
        const start = this.skrqRange[0].format('YYYY-MM-DD')
        const end = this.skrqRange[1].format('YYYY-MM-DD')
        list.push({
          key: 'skrqRange',
          label: `${start} ~ ${end}`,
          closable: true,
          color: 'cyan',
          onClose: () => {
            this.skrqRange = []
            this.queryParam.skrq_begin = ''
            this.queryParam.skrq_end = ''
            this.queryParam.dateTime = this.skrqMonth ? this.skrqMonth.format('YYYY-MM') : ''
            this.searchQuery(1)
          },
        })
      }
      // 公司（多选）
      if (this.queryParam.deptBelong) {
        const ids = this.queryParam.deptBelong.split(',')
        console.log('ids', ids)
        if (ids.length == 9) {
          list.push({
            key: 'deptBelongAll',
            label: '全部公司',
            closable: false,
            color: '#108ee9',
            onClose: () => {},
          })
        } else {
          ids.forEach((id) => {
            const company = this.companyList.find((c) => String(c.id) === String(id))
            if (company) {
              list.push({
                key: 'company_' + id,
                label: company.name,
                closable: false,
                color: '#108ee9',
                onClose: () => {},
              })
            }
          })
        }
      }
      // 部门
      if (this.deptArr && this.deptArr.length) {
        const deptNames = this.getDeptNamePath(this.deptArr)
        list.push({
          key: 'dept',
          label: deptNames,
          color: '#2db7f5',
          closable: true,
          onClose: () => {
            this.deptArr = []
            this.queryParam.dept = ''
            this.searchQuery(1)
          },
        })
      } else {
        list.push({
          key: 'dept',
          label: '全部',
          closable: false,
          color: '#2db7f5',
          onClose: () => {},
        })
      }
      // 姓名
      if (this.queryParam.name) {
        list.push({
          key: 'name',
          label: `姓名:*${this.queryParam.name}*`,
          closable: true,
          color: '#2db7f5',
          onClose: () => {
            this.queryParam.name = ''
            this.searchQuery(1)
          },
        })
      }
      // 工号
      if (this.queryParam.no) {
        list.push({
          key: 'no',
          label: `工号:${this.queryParam.no}`,
          closable: true,
          color: '#2db7f5',
          onClose: () => {
            this.queryParam.no = ''
            this.searchQuery(1)
          },
        })
      }
      // 员工类型
      if (this.queryParam.employeeType) {
        const text = this.$filterDictTextByCache('yglx', this.queryParam.employeeType) || this.queryParam.employeeType
        list.push({
          key: 'employeeType',
          label: `员工类型:${text}`,
          closable: true,
          color: '#2db7f5',
          onClose: () => {
            this.queryParam.employeeType = ''
            this.searchQuery(1)
          },
        })
      }
      return list
    },
    fieldTitleMap() {
      // 基于 allColumnDefs（全量列定义）构建标题映射；不能用 columns，它被列配置过滤过，会漏掉隐藏字段
      const { arr, arrA, arrAA, arrB } = this.allColumnDefs
      let all = [...arr, ...arrA, ...arrAA, ...arrB]
      const map = {}
      all.forEach((item) => {
        map[item.dataIndex] = item.title
      })
      return map
    },
    // 全量列定义（未经过列配置过滤）
    allColumnDefs() {
      const customRenderFun = (t, record) => {
        let box = t || ''
        switch (true) {
          case box.indexOf('加班调休') != -1:
            box = <span style="color:#722ed1;">{'加班调休'}</span>
            break
          case box.indexOf('迟') != -1:
            box = <span style="color: #ff814b;">{box.replace('迟', '')}</span>
            break
          case box.indexOf('早') != -1:
            box = <span style="color: #ffa200;">{box.replace('早', '')}</span>
            break
          case box.indexOf('缺') != -1:
            box = <span style="color: #ff5900;">{'缺卡'}</span>
            break
          case box.indexOf('旷') != -1:
            box = <span style="color: #e93030;">{'旷工'}</span>
            break
          case box.indexOf('休假') != -1:
            box = <span style="color: #00cce3;">{'休假'}</span>
            break
          case box.indexOf('休') != -1:
            box = <span style="color: #00cb9e;">{'休息日'}</span>
            break
          case box.indexOf('节') != -1:
            box = <span style="color: #03cc00;">{'节假日'}</span>
            break
        }
        return box
      }
      let arr = [
        {
          title: '出勤状态',
          dataIndex: 'attendanceStatus',
          scopedSlots: { customRender: 'attendanceStatus' },
          type: 'string',
          width: 180,
          align: 'center',
        },
        { title: '刷卡日期', dataIndex: 'skrq', type: 'date', sorter: true, width: 100, align: 'center' },
        { title: '星期', dataIndex: 'weekday', type: 'string', width: 80, align: 'center' },
        { title: '工号', dataIndex: 'no', type: 'string', sorter: true, width: 110, align: 'center' },
        {
          title: '公司',
          dataIndex: 'deptBelong',
          type: 'string',
          width: 140,
          align: 'center',
          ellipsis: true,
          customRender: (text, record) => {
            return (
              <a-tooltip style="width: 120px;text-align:center;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block">
                <template slot="title">{record.deptBelong_dictText}</template>
                <a-tag style="margin: 0;" color="blue">
                  {record.deptBelong_dictText}
                </a-tag>
              </a-tooltip>
            )
          },
        },
        {
          title: '所属部门',
          dataIndex: 'dept',
          type: 'string',
          width: 140,
          align: 'center',
          ellipsis: true,
          customRender: (t, record) => {
            let text = record.dept_dictText
            return (
              <a-tooltip style="width: 120px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block">
                <template slot="title">{text}</template>
                <span style="color: #1890FF;">{text}</span>
              </a-tooltip>
            )
          },
        },
        {
          title: '岗位',
          dataIndex: 'postId',
          type: 'string',
          width: 140,
          align: 'center',
          ellipsis: true,
          scopedSlots: { customRender: 'postId' },
        },
        {
          title: '姓名',
          dataIndex: 'name',
          type: 'string',
          width: 100,
          align: 'center',
          ellipsis: true,
          customRender: (text) => {
            return (
              <a-tooltip style="width: 80px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block">
                <template slot="title">{text}</template>
                <span>{text}</span>
              </a-tooltip>
            )
          },
        },
        {
          title: '员工类型',
          dataIndex: 'employeeType',
          type: 'string',
          width: 100,
          align: 'center',
          customRender: (text, record) => {
            return record.employeeType_dictText || text
          },
        },
      ]
      let arrA = [
        {
          title: '打卡时间1',
          dataIndex: 'one',
          type: 'string',
          width: 100,
          align: 'center',
          sorter: true,
          customCell: getClockTimeCellProps,
          customHeaderCell: getClockTimeHeaderCellProps,
          customRender: customRenderFun,
        },
        {
          title: '打卡时间2',
          dataIndex: 'two',
          type: 'string',
          width: 100,
          align: 'center',
          sorter: true,
          customCell: getClockTimeCellProps,
          customHeaderCell: getClockTimeHeaderCellProps,
          customRender: customRenderFun,
        },
        {
          title: '打卡时间3',
          dataIndex: 'three',
          type: 'string',
          width: 100,
          align: 'center',
          sorter: true,
          customCell: getClockTimeCellProps,
          customHeaderCell: getClockTimeHeaderCellProps,
          customRender: customRenderFun,
        },
        {
          title: '打卡时间4',
          dataIndex: 'four',
          type: 'string',
          width: 100,
          align: 'center',
          sorter: true,
          customCell: getClockTimeCellProps,
          customHeaderCell: getClockTimeHeaderCellProps,
          customRender: customRenderFun,
        },
        {
          title: '打卡时间5',
          dataIndex: 'five',
          type: 'string',
          width: 100,
          align: 'center',
          sorter: true,
          customCell: getClockTimeCellProps,
          customHeaderCell: getClockTimeHeaderCellProps,
          customRender: customRenderFun,
        },
        {
          title: '打卡时间6',
          dataIndex: 'six',
          type: 'string',
          width: 100,
          align: 'center',
          sorter: true,
          customCell: getClockTimeCellProps,
          customHeaderCell: getClockTimeHeaderCellProps,
          customRender: customRenderFun,
        },
        {
          title: '打卡时间7',
          dataIndex: 'seven',
          type: 'string',
          width: 100,
          align: 'center',
          sorter: true,
          customCell: getClockTimeCellProps,
          customHeaderCell: getClockTimeHeaderCellProps,
          customRender: customRenderFun,
        },
        {
          title: '打卡时间8',
          dataIndex: 'eight',
          type: 'string',
          width: 100,
          align: 'center',
          sorter: true,
          customCell: getClockTimeCellProps,
          customHeaderCell: getClockTimeHeaderCellProps,
          customRender: customRenderFun,
        },
      ]
      let arrAA = [
        {
          title: '打卡时间9',
          dataIndex: 'nine',
          type: 'string',
          width: 100,
          align: 'center',
          sorter: true,
          customCell: getClockTimeCellProps,
          customHeaderCell: getClockTimeHeaderCellProps,
          customRender: customRenderFun,
        },
        {
          title: '打卡时间10',
          dataIndex: 'ten',
          type: 'string',
          width: 100,
          align: 'center',
          sorter: true,
          customCell: getClockTimeCellProps,
          customHeaderCell: getClockTimeHeaderCellProps,
          customRender: customRenderFun,
        },
      ]

      let arrB = [
        { title: '底薪时间', dataIndex: 'dxsj', type: 'double', width: 100, align: 'center' },
        { title: '1.5倍', dataIndex: 'bs15', type: 'double', width: 100, align: 'center' },
        { title: '2倍', dataIndex: 'bs2', type: 'double', width: 100, align: 'center' },
        { title: '3倍', dataIndex: 'bs3', type: 'double', width: 100, align: 'center' },

        { title: '总工时（时）', dataIndex: 'zsj', type: 'double', width: 120, align: 'center' },
        { title: '迟到时间（分）', dataIndex: 'cdsj', type: 'double', width: 120, align: 'center' },
        {
          title: '当日请假',
          dataIndex: 'drqj',
          type: 'double',
          width: 100,
          align: 'center',
          customRender: (text, record) => {
            return record.drqj_dictText || text
          },
        },
        {
          title: '当日请假类型',
          dataIndex: 'drqjType',
          type: 'string',
          width: 120,
          align: 'center',
          customRender: (text, record) => {
            return record.drqjType_dictText || text
          },
        },
        {
          title: '备注',
          dataIndex: 'bz',
          type: 'string',
          width: 360,
          align: 'center',
          ellipsis: true,
          customRender: (text) => {
            return (
              <a-tooltip style="width: 340px;text-align: center;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block">
                <template slot="title">{text}</template>
                <span>{text}</span>
              </a-tooltip>
            )
          },
        },
        {
          title: '考勤规则',
          dataIndex: 'ruleId',
          width: 80,
          align: 'center',
          fieldSort: 9999,
          fixed: 'right',
          scopedSlots: { customRender: 'ruleName' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 80,
          fieldSort: 9999,
          scopedSlots: { customRender: 'action' },
        },
      ]
      return { arr, arrA, arrAA, arrB }
    },
    // 表头
    columns() {
      let { arr, arrA, arrAA, arrB } = this.allColumnDefs

      // 列配置
      if (this.columnTakeEffect) {
        let newArr = []
        let newArrA = []
        let newArrB = []

        this.columnConfig.forEach((item) => {
          arr.forEach((items) => {
            if (item.fieldName == items.dataIndex) {
              item['checkboxShow'] = true
              if (item.fieldVisible) {
                newArr.push({
                  ...items,
                  fieldSort: item.fieldSort || '',
                })
              }
            }
          })

          arrA.forEach((itemA) => {
            if (item.fieldName == itemA.dataIndex) {
              item['checkboxShow'] = true
              if (item.fieldVisible) {
                newArrA.push({
                  ...itemA,
                  fieldSort: item.fieldSort || '',
                })
              }
            }
          })
          if (!this.deptBelongKey) {
            arrAA.forEach((itemA) => {
              if (item.fieldName == itemA.dataIndex) {
                item['checkboxShow'] = true
                if (item.fieldVisible) {
                  newArrA.push({
                    ...itemA,
                    fieldSort: item.fieldSort || '',
                  })
                }
              }
            })
          }

          arrB.forEach((itemB) => {
            if (itemB.dataIndex != 'ruleId' && item.fieldName == itemB.dataIndex) {
              item['checkboxShow'] = true
              if (item.fieldVisible) {
                newArrB.push({
                  ...itemB,
                  fieldSort: item.fieldSort || '',
                })
              }
            }
          })
        })
        newArrB.push({
          title: '考勤规则',
          dataIndex: 'ruleId',
          width: 80,
          align: 'center',
          fieldSort: 9999,
          fixed: 'right',
          scopedSlots: { customRender: 'ruleName' },
        })
        newArrB.push({
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 80,
          fieldSort: 9999,
          scopedSlots: { customRender: 'action' },
        })
        arr = newArr.map((item) => item)
        arrA = newArrA.map((item) => item)
        arrB = newArrB.map((item) => item)
      }
      let all = [...arr, ...arrA, ...arrB]
      all.sort((a, b) => {
        return (a.fieldSort || 0) - (b.fieldSort || 0)
      })
      return all
    },

    username() {
      return this.$store.state.user.info.username
    },

    mockStatCards() {
      return [
        {
          key: 'total',
          label: '在职总人数',
          value: this.total.infoCount || 0,
          desc: '当前部门总人员',
          icon: 'team',
          theme: 'total',
        },
        {
          key: 'normal',
          label: '正常出勤',
          value: this.total.NORMAL || 0,
          desc: '今日正常打卡',
          icon: 'check-circle',
          theme: 'normal',
        },
        {
          key: 'late',
          label: '迟到',
          value: this.total.BE_LATE || 0,
          desc: '今日迟到人员',
          icon: 'clock-circle',
          theme: 'late',
        },
        {
          key: 'early',
          label: '早退',
          value: this.total.LEAVE_EARLY || 0,
          desc: '今日提前离岗',
          icon: 'hourglass',
          theme: 'early',
        },
        {
          key: 'lack',
          label: '缺卡',
          value: this.total.MISSING || 0,
          desc: '今日未打卡',
          icon: 'idcard',
          theme: 'lack',
        },
        {
          key: 'absent',
          label: '旷工',
          value: this.total.ABSENT || 0,
          desc: '今日缺勤旷工',
          icon: 'user-delete',
          theme: 'absent',
        },
      ]
    },
    currentDateText() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}/${month}/${day}`
    },
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
    // 部门选择器
    deptList() {
      let arr = []

      if (this.queryParam.deptBelong) {
        let arx = this.queryParam.deptBelong.split(',')
        this.companyList.forEach((item) => {
          arx.forEach((id) => {
            if (item.id == id && item.children && item.children != 'null' && item.children.length > 0) {
              arr.push(...item.children)
            }
          })
        })
      }
      // else {
      //   this.companyList.forEach(item => {
      //     if (item.children) {
      //       item.children.forEach(child => {
      //         if (child.children) {
      //           arr.push(child)
      //         }
      //       })
      //     }
      //   })
      // }
      return arr
    },
  },
  watch: {
    activeKey(newVal, oldVal) {
      this.searchQuery(1)
    },
    companyList(newVal, oldVal) {
      this.companyStatsArr = []
      this.deptBelongArr = [newVal[0].id]
      this.searchReset(1)
    },
  },
  methods: {
    getDictOptions() {
      let str = ''
      // if (this.deptBelongKey) {
      //   str = 'deptBelong=' + this.deptBelongKey
      // }
      if (this.queryParam.skrq_begin) {
        str = `skrq_begin=${this.queryParam.skrq_begin}&skrq_end=${this.queryParam.skrq_end}`
      }
      if (this.queryParam.dept) {
        str = `${str}&dept=${this.queryParam.dept}`
      }
      httpAction(`${this.url.getTotal}?dateTime=${this.queryParam.dateTime}&${str}`, '', 'get').then((res) => {
        if (res.success) {
          this.companyList.forEach((i, index) => {
            res.result.forEach((item) => {
              if (i.id == item.deptBelong) {
                item['name'] = i.name
                item['sort'] = index
              }
            })
          })
          res.result.sort((a, b) => {
            return a.sort - b.sort
          })
          let arr = res.result.map((item) => {
            item['ok'] = 0
            item['yc'] = 0

            // 排序：label 为"全部"的排在最前面
            const sortedList = [...item.totalVoList].sort((a, b) => {
              if (a.attendanceStatusText === '全部') return -1
              if (b.attendanceStatusText === '全部') return 1
              return 0
            })

            sortedList.forEach((itemA) => {
              if (itemA.attendanceStatus == 'NORMAL') {
                item['ok'] = itemA.attendanceTotal
              } else if (
                itemA.attendanceStatus == 'BE_LATE' ||
                itemA.attendanceStatus == 'LEAVE_EARLY' ||
                itemA.attendanceStatus == 'MISSING' ||
                itemA.attendanceStatus == 'ABSENT' ||
                itemA.attendanceStatus == 'OTHER'
              ) {
                item['yc'] += itemA.attendanceTotal
              }
            })
            return item
          })
          this.$nextTick(() => {
            this.companyStatsArr = arr
            this.setTabsList()
          })
        }
      })
    },
    setTabsList() {
      let arr = this.tabsList.map((item) => {
        return {
          value: item.title == '全部' ? 'ALL' : item.value,
          count: 0,
        }
      })
      this.companyStatsArr.forEach((item) => {
        if (this.selectedCompanyIds(item.deptBelong)) {
          item.totalVoList.forEach((itemA) => {
            arr.forEach((i) => {
              if (i.value == itemA.attendanceStatus) {
                i.count += itemA.attendanceTotal
              }
            })
          })
        }
      })
      this.tabsList.forEach((i) => {
        arr.forEach((item) => {
          if (i.title == '全部' && item.value == 'ALL') {
            i.count = item.count
          }
          if (i.value == item.value) {
            i.count = item.count
          }
        })
      })
    },
    selectedCompanyIds(id) {
      return this.queryParam.deptBelong ? this.queryParam.deptBelong.indexOf(id) > -1 : false
    },
    handleTodayCardClick(card) {
      // this.todayDrawerVisible = false
      // this.activeKey = card.statusValue
    },
    // ---------- 字段配置 ----------
    toggleColumnConfig() {
      this.columnConfigVisible = true
    },
    handleColumnConfigConfirm(updatedColumns) {
      httpAction(`/hr_field_config/hrFieldConfig/editBatch`, updatedColumns, 'POST').then((res) => {
        if (res.success) {
          this.$message.success('保存成功')
          this.columnConfigVisible = false
          this.getColumnConfig()
        }
      })
    },
    //获取自定义标题参数
    getColumnConfig() {
      if (!this.columnCode) {
        return
      }
      httpAction(
        `/hr_field_config/hrFieldConfig/queryBySysUserId?sysUserId=${this.$store.state.user.info.id}&fieldCompent=${this.columnCode}`,
        '',
        'get'
      ).then((res) => {
        if (res.success) {
          this.columnConfig = res.result
          this.columnTakeEffect = true
        }
      })
    },
    onCompanyChange() {
      this.$nextTick(() => {
        if (!this.queryParam.deptBelong) {
          this.queryParam.dept = ''
          this.deptArr = []
        }
      })
    },
    // 公司卡片点击 - 多选公司筛选，逗号拼接
    onCompanyCardClick(item) {
      const arr = this.queryParam.deptBelong ? this.queryParam.deptBelong.split(',') : []
      const idx = arr.indexOf(item.deptBelong)
      if (idx > -1) {
        // 取消选择时，检查是否至少保留一个公司
        if (arr.length <= 1) {
          this.$message.warning('至少需要保留一个公司')
          return
        }
        arr.splice(idx, 1)
      } else {
        arr.push(item.deptBelong)
      }
      this.deptBelongArr = arr
      this.queryParam['deptBelong'] = arr.join(',')

      this.deptArr = []
      this.setTabsList()
      this.searchQuery(1)
    },
    // 获取公司正常出勤进度百分比
    getCompanyProgress(val, ok, yc, status) {
      let allNum = ok + yc
      let vals = val
      if (allNum == 0) return 0
      if (status == 'ALL') {
        vals = 0
      }
      return {
        width: Math.round(((vals || 0) / allNum) * 100) + '%',
      }
      // const data = this.companyStats[companyId]
      // if (!data || !data.total) return 0
      // return Math.round(((data.NORMAL || 0) / data.total) * 100)
    },

    filter(inputValue, path) {
      return path.some((option) => option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
    },
    onCascaderChange() {
      this.queryParam.dept = this.deptArr[this.deptArr.length - 1]
    },
    // 根据部门 id 数组获取部门名称路径
    getDeptNamePath(idArr) {
      if (!idArr || !idArr.length) return ''
      const result = []
      let list = this.deptList
      for (const id of idArr) {
        const found = list && list.find((item) => String(item.id) === String(id))
        if (found) {
          result.push(found.name)
          list = found.children
        } else {
          break
        }
      }
      return result.join(' / ')
    },
    // 清除全部筛选条件
    clearAllFilters() {
      const currentMonth = moment()
      this.skrqRange = []
      this.skrqMonth = currentMonth
      this.deptArr = []
      this.queryParam = {
        deptBelong: this.deptBelongArr.join(','),
        dateTime: currentMonth.format('YYYY-MM'),
      }
      this.searchQuery(1)
    },
    disabledDate(current) {
      // 只能选择过去包含今天，禁用明天及之后的日期
      return current && current > moment().endOf('day')
    },
    getDictColor() {
      httpAction('sys/dictItem/list?dictId=2072281509479194625&pageSize=100', '', 'get').then((res) => {
        if (res.success) {
          let { records } = res.result
          records.forEach((item) => {
            if (item.dataJson) {
              item.dataJson = JSON.parse(item.dataJson)
            }
            this.dictColor[item.itemText] = {
              color: item.dataJson ? item.dataJson.color : '',
            }
          })
        }
      })
      httpAction('sys/dictItem/list?dictId=2074660583220690945&pageSize=100', '', 'get').then((res) => {
        if (res.success) {
          let { records } = res.result
          records.forEach((item) => {
            if (item.dataJson) {
              item.dataJson = JSON.parse(item.dataJson)
            }
            this.tabsList.push({
              ...item,
              title: item.itemText,
              value: item.itemValue,
              count: 0,
            })
          })
        }
      })
    },
    loadData(arg) {
      if (!this.url.list) {
        this.$message.error('请设置url.list属性!')
        return
      }
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1
      }

      let str = ''
      // 公司查询
      if (this.activeKey) {
        str = SuperQuery.getSuperQuery(
          SuperQuery.QueryType.and, //  查询类型 下发所有都满足and  下发任何一条满足 OR
          SuperQuery.queryItem(
            'attendanceStatus',
            this.activeKey,
            SuperQuery.FieldType.String,
            SuperQuery.FieldRule.包含
          )
        )
      }
      console.log(this.queryParam)
      var params = this.getQueryParams() //查询条件
      // 姓名模糊查询：传后端时前后加*，页面显示保持原值
      if (params.name) {
        params.name = `*${params.name}*`
      }
      this.loading = true

      getAction(this.url.list + '?' + str, params).then((res) => {
        if (res.success) {
          this.dataSource = res.result.data
          this.ipagination.total = res.result.total || 0
          this.total = res.result.count || {}
          this.total['infoCount'] = res.result.infoCount
        }
        if (res.code === 510) {
          this.$message.warning(res.message)
        }
        this.loading = false
      })
    },
    searchQuery(num) {
      this.getDictOptions()
      this.loadData(num)
      // 点击查询清空列表选中行
      this.selectedRowKeys = []
      this.selectionRows = []
    },
    searchReset(num) {
      const currentMonth = moment()

      this.skrqRange = []
      this.skrqMonth = currentMonth
      this.queryParam = {
        deptBelong: this.deptBelongArr.join(','),
        dateTime: currentMonth.format('YYYY-MM'),
        employeeType: '',
      }
      this.deptArr = []
      this.attendanceStatusArr = ''
      this.searchQuery(1)
    },
    onSkrqDateChange(value, dateString) {
      this.queryParam.skrq_begin = dateString[0]
      this.queryParam.skrq_end = dateString[1]
      this.queryParam.dateTime =
        dateString[0] || dateString[1] ? '' : this.skrqMonth ? this.skrqMonth.format('YYYY-MM') : ''
      this.searchQuery(1)
    },
    onSkrqMonthChange(value, dateString) {
      this.queryParam.dateTime = this.queryParam.skrq_begin || this.queryParam.skrq_end ? '' : dateString
      this.searchQuery(1)
    },
    handleRegenerate() {
      if (!this.regenerateDate.length) {
        this.$message.warning('请选择日期')
        return
      }
      const startDate = this.regenerateDate[0]
      const endDate = this.regenerateDate[1] || startDate
      if (!startDate || !endDate) {
        this.$message.warning('请选择完整的日期范围')
        return
      }
      this.handleRegenerateLoading = true
      const hide = this.$message.loading('正在提交实时重算任务...', 0)
      postAction(this.url.realtimeEnqueueRange, {
        startDate,
        endDate,
      })
        .then((res) => {
          if (res.success) {
            this.$message.success(`已提交 ${res.result || 0} 个实时重算任务，Worker 将异步处理`)
            this.regenerateVisible = false
            this.regenerateDate = []
            this.loadData()
          } else {
            this.$message.error(res.message || '实时重算任务提交失败')
          }
        })
        .catch((error) => {
          this.$message.error((error && error.message) || '实时重算任务提交失败')
        })
        .finally(() => {
          this.handleRegenerateLoading = false
          hide()
        })
    },

    initDictConfig() {},
    getAttendanceStatusClass(status) {
      const statusMeta = attendanceStatusMap[status]
      return statusMeta ? statusMeta.color : ''
    },
    getAttendanceStatusClassObj(status) {
      const statusMeta = attendanceStatusMap[status]
      return statusMeta || { color: '', text: '' }
    },
    handleClockRecord(record) {
      this.$refs.clockRecordModal.show(record)
    },
    // 导入考勤数据
    handleImportAttendance() {
      this.$refs.attendanceImportModal.show()
    },
    openRuleDetail(record) {
      const ruleId = record.ruleId
      if (!ruleId) {
        this.$message.warning('未找到考勤规则ID')
        return
      }
      this.$refs.ruleDetailModal.show(ruleId)
    },
    getSuperFieldList() {
      this.superFieldList = this.columns
        .filter((item) => item.type)
        .map((item) => ({
          type: item.type,
          value: item.dataIndex,
          text: item.title,
          dictCode: '',
        }))
    },
  },
}
</script>
<style scoped lang="less">
.attendance-list-panel {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--attendance-background, #f8fafd);
  overflow: hidden;
  animation: attendance-slide-in-right 0.3s ease-out both;
  padding: 0 10px;
}

// ---------- 标题栏 ----------
.attendance-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 12px;
  border-bottom: 1px solid var(--attendance-border, #e2e8f0);
  flex-shrink: 0;
}

.attendance-main-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--attendance-foreground, #1a2a3d);
}

.attendance-date-display {
  font-size: 13px;
  color: var(--attendance-muted-foreground, #64748b);
}

// ---------- 统计卡片栏 ----------
.attendance-stat-bar {
  padding: 12px 24px 0;
  display: flex;
  align-items: stretch;
  gap: 12px;
  flex-shrink: 0;
}

.attendance-stat-card {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--attendance-border, #e2e8f0);
  border-radius: 10px;
  background: var(--attendance-card, #ffffff);
  box-shadow: var(--attendance-shadow-card, 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03));
  transition: all 0.4s ease;
  animation: attendance-border-breathe 4s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--attendance-gradient-blue, linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%));
  }

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(45, 120, 255, 0.35);
    box-shadow: var(--attendance-shadow-glow, 0 4px 24px rgba(45, 120, 255, 0.15), 0 0 40px rgba(45, 120, 255, 0.04));
  }
}

// 统计卡片主题色
.attendance-stat-card--total::before {
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
}

.attendance-stat-card--normal::before {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.attendance-stat-card--late::before {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.attendance-stat-card--early::before {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.attendance-stat-card--lack::before {
  background: linear-gradient(135deg, #00a0d4 0%, #38bdf8 100%);
}

.attendance-stat-card--absent::before {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
}

.attendance-stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 17px;
}

.attendance-stat-icon--total {
  color: #2d78ff;
  background: rgba(45, 120, 255, 0.1);
}

.attendance-stat-icon--normal {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.attendance-stat-icon--late {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.attendance-stat-icon--early {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
}

.attendance-stat-icon--lack {
  color: #00a0d4;
  background: rgba(0, 160, 212, 0.1);
}

.attendance-stat-icon--absent {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.attendance-stat-info {
  flex: 1;
  min-width: 0;
}

.attendance-stat-value {
  color: var(--attendance-foreground, #1a2a3d);
  font-size: 20px;
  font-weight: 900;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.attendance-stat-label {
  margin-top: 1px;
  color: var(--attendance-muted-foreground, #64748b);
  font-size: 11px;
}

.attendance-stat-desc {
  margin-top: 1px;
  overflow: hidden;
  color: rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.4);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ---------- 筛选栏 ----------
.attendance-filter-bar {
  padding: 10px 0 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

// ---------- 筛选条件展示栏 ----------
.filter-conditions-bar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  width: 99%;
  margin: 8px auto 0;
  background: linear-gradient(135deg, #eef5ff 0%, #e0ecff 100%);
  border: 1px solid #d6e4ff;
  border-radius: 6px;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-conditions-label {
  font-size: 13px;
  font-weight: 700;
  color: #1890ff;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.filter-conditions-list {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}

.filter-conditions-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  background: #ffffff;
  border: 1px solid #d6e4ff;
  border-radius: 4px;
  font-size: 12px;
  color: #1890ff;
  transition: all 0.2s ease;

  &:hover {
    border-color: #1890ff;
    box-shadow: 0 2px 6px rgba(24, 144, 255, 0.15);
  }
}

.filter-conditions-tag-text {
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filter-conditions-tag-close {
  margin-left: 6px;
  font-size: 10px;
  color: #8c8c8c;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #ff4d4f;
  }
}

.filter-conditions-clear {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: #ffffff;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  font-size: 12px;
  color: #ff4d4f;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #fff1f0;
    border-color: #ff4d4f;
  }
}

.attendance-search-wrap {
  flex-shrink: 0;
}

.attendance-filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.attendance-filter-label {
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.attendance-search {
  width: 160px;

  /deep/ .ant-input {
    height: 32px;
    padding-left: 36px;
    border-color: var(--attendance-border, #e2e8f0);
    border-radius: 6px;
    background: var(--attendance-card, #ffffff);
    color: var(--attendance-foreground, #1a2a3d);
    box-shadow: none;
    font-size: 12px;
    transition: all 0.3s ease;
  }

  /deep/ .ant-input:focus {
    border-color: rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.4);
    box-shadow: 0 0 0 3px rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.08);
  }

  /deep/ .ant-input-prefix {
    color: rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.3);
  }
}

.attendance-filter-input {
  width: 160px;

  /deep/ .ant-input {
    height: 32px;
    border-color: var(--attendance-border, #e2e8f0);
    border-radius: 6px;
    background: var(--attendance-card, #ffffff);
    box-shadow: none;
    font-size: 12px;

    &:focus {
      border-color: rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.4);
      box-shadow: 0 0 0 3px rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.08);
    }
  }
}

.attendance-filter-month-picker {
  width: 160px;

  /deep/ .ant-calendar-picker {
    width: 100%;
  }

  /deep/ .ant-calendar-picker-input,
  /deep/ .ant-input {
    height: 32px;
    border-color: var(--attendance-border, #e2e8f0);
    border-radius: 6px;
    background: var(--attendance-card, #ffffff);
    box-shadow: none;
    font-size: 12px;
  }

  /deep/ .ant-calendar-picker-input:focus,
  /deep/ .ant-input:focus {
    border-color: rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.4);
    box-shadow: 0 0 0 3px rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.08);
  }
}

.attendance-filter-range-picker {
  /deep/ .ant-calendar-picker {
    width: 100%;
  }

  /deep/ .ant-calendar-picker-input,
  /deep/ .ant-input {
    height: 32px;
    border-color: var(--attendance-border, #e2e8f0);
    border-radius: 6px;
    background: var(--attendance-card, #ffffff);
    box-shadow: none;
    font-size: 12px;
  }

  /deep/ .ant-calendar-picker-input:focus,
  /deep/ .ant-input:focus {
    border-color: rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.4);
    box-shadow: 0 0 0 3px rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.08);
  }
}

.attendance-filter-select {
  width: 150px;

  /deep/ .ant-select-selection {
    height: 32px;
    border-color: var(--attendance-border, #e2e8f0);
    border-radius: 6px;
    background: var(--attendance-card, #ffffff);
    box-shadow: none;
    font-size: 12px;
  }

  /deep/ .ant-select-selection__rendered {
    line-height: 30px;
  }

  /deep/ .ant-select-selection:hover,
  /deep/ .ant-select-focused .ant-select-selection {
    border-color: rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.35);
  }
}

.attendance-filter-cascader {
  width: 160px;

  /deep/ .ant-cascader-picker {
    width: 100%;
  }

  /deep/ .ant-input {
    height: 32px;
    border-color: var(--attendance-border, #e2e8f0);
    border-radius: 6px;
    background: var(--attendance-card, #ffffff);
    box-shadow: none;
    font-size: 12px;
  }

  /deep/ .ant-input:focus {
    border-color: rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.4);
    box-shadow: 0 0 0 3px rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.08);
  }
}

.attendance-filter-dict-select {
  /deep/ .ant-select-selection {
    height: 32px;
    border-color: var(--attendance-border, #e2e8f0);
    border-radius: 6px;
    background: var(--attendance-card, #ffffff);
    box-shadow: none;
  }

  /deep/ .ant-select-selection__rendered {
    line-height: 30px;
  }

  /deep/ .ant-select-selection-selected-value,
  /deep/ .ant-select-selection__placeholder {
    font-size: 12px;
  }

  /deep/ .ant-select-selection:hover,
  /deep/ .ant-select-focused .ant-select-selection {
    border-color: rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.35);
  }
}

.attendance-filter-search-tag {
  width: 180px !important;

  /deep/ .ant-select-selection {
    min-height: 32px;
    border-color: var(--attendance-border, #e2e8f0);
    border-radius: 6px;
    background: var(--attendance-card, #ffffff);
    box-shadow: none;
    font-size: 12px;
  }

  /deep/ .ant-select-selection__rendered {
    min-height: 30px;
    line-height: 30px;
  }

  /deep/ .ant-select-selection:hover,
  /deep/ .ant-select-focused .ant-select-selection {
    border-color: rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.4);
    box-shadow: 0 0 0 3px rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.08);
  }
}

// ---------- 操作按钮 ----------
.attendance-filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.attendance-btn-primary {
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: var(--attendance-gradient-blue, linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%));
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
  font-size: 12px;
  font-weight: 600;

  &:hover,
  &:focus {
    background: var(--attendance-gradient-blue, linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%));
    opacity: 0.92;
  }
}

.attendance-btn-reset {
  height: 34px;
  border-radius: 8px;
  color: var(--attendance-muted-foreground, #64748b);
  border-color: var(--attendance-border, #e2e8f0);
  background: var(--attendance-card, #ffffff);
  font-size: 12px;
  font-weight: 600;

  &:hover {
    color: var(--attendance-foreground, #1a2a3d);
    border-color: rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.35);
  }
}

.attendance-btn-config {
  height: 34px;
  border-radius: 8px;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  background: #fafbfc;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    color: #2563eb;
    border-color: #93c5fd;
    background: #eff6ff;
  }

  .anticon {
    font-size: 13px;
  }
}

// ---------- 表格容器 ----------
.attendance-table-wrap {
  flex: 1;
  min-height: 0;
  padding: 10px 0;
  overflow-y: auto;

  /deep/ .ant-spin-nested-loading,
  /deep/ .ant-spin-container {
    min-height: 100%;
  }

  /deep/ .ant-table {
    border-radius: var(--attendance-radius, 8px);
    overflow: hidden;
    border: 1px solid var(--attendance-border, #e2e8f0);
  }

  /deep/ .ant-table-thead > tr > th {
    background: rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.03);
    color: var(--attendance-foreground, #1a2a3d);
    font-weight: 600;
    font-size: 12px;
    border-bottom: 2px solid rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.08);
  }

  /deep/ .ant-table-tbody > tr:hover > td {
    background: rgba(var(--attendance-primary-rgb, 37, 99, 235), 0.02);
  }

  /deep/ .ant-table-pagination.ant-pagination {
    margin: 16px 0 0;
  }
}

// ---------- 动画 ----------
@keyframes attendance-slide-in-right {
  from {
    opacity: 0;
    transform: translateX(12px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes attendance-border-breathe {
  0%,
  100% {
    border-color: rgba(45, 120, 255, 0.1);
    box-shadow: var(--attendance-shadow-card, 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03));
  }

  50% {
    border-color: rgba(45, 120, 255, 0.25);
    box-shadow: 0 2px 12px rgba(45, 120, 255, 0.1);
  }
}

// ---------- 响应式 ----------
@media (max-width: 900px) {
  .attendance-stat-bar {
    flex-wrap: wrap;
  }

  .attendance-stat-card {
    min-width: 140px;
  }

  .attendance-title-bar {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .attendance-search-wrap {
    max-width: 100%;
    flex-basis: 100%;
  }

  .attendance-filter-bar {
    align-items: stretch;
  }

  .attendance-filter-input,
  .attendance-filter-month-picker,
  .attendance-filter-select,
  .attendance-filter-cascader,
  .attendance-filter-search-tag {
    width: 100%;
  }

  .attendance-filter-actions {
    flex-wrap: wrap;
  }
}

::v-deep .ant-tabs-card > .ant-tabs-bar {
  margin: 0;
}

::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab {
  color: #e6f7ff;
  border-radius: 10px 10px 0 0;
  background: #0082fc;
}

/* 未激活状态 - 底部色条 */
.progressNORMAL,
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='NORMAL']) {
  background: #36d985;
}
.progressBE_LATE,
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='BE_LATE']) {
  background: #ff814b;
}
.progressLEAVE_EARLY,
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='LEAVE_EARLY']) {
  background: #ffa200;
}
.progressMISSING,
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='MISSING']) {
  background: #ff5900;
}
.progressHoliday,
.progressABSENT,
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='ABSENT']) {
  background: #e93030;
}
.progressOTHER,
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='OTHER']) {
  background: #0f7797;
}

.progressWeekend,
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='Weekend']) {
  background: #00cb9e;
}
.progressHoliday,
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='Holiday']) {
  background: #03cc00;
}

.progressBK,
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='BK']) {
  background: #096dd9;
}
.progressWC,
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='WC']) {
  background: #e7b625;
}
.progressXJ,
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='XJ']) {
  background: #00cce3;
}

// ---------- 公司卡片 ----------

.company-cards-bar {
  margin-bottom: 5px;
}

.company-cards-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin: 0 5px 8px;
  background: linear-gradient(135deg, #fff 100%);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #eaf3ff 0%, #f0f9ff 100%);
    border-color: rgba(45, 120, 255, 0.45);
    box-shadow: 0 4px 16px rgba(45, 120, 255, 0.18), 0 0 0 1px rgba(45, 120, 255, 0.08);
  }
}
.company-cards-header-active {
  background: linear-gradient(135deg, #eaf3ff 0%, #f0f9ff 100%);
  border-color: rgba(45, 120, 255, 0.45);
  box-shadow: 0 4px 16px rgba(45, 120, 255, 0.18), 0 0 0 1px rgba(45, 120, 255, 0.08);
}
.company-cards-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.company-cards-toggle-icon {
  font-size: 14px;
  color: #64748b;
  transition: transform 0.3s ease;
}

// 折叠过渡动画
.company-cards-collapse-enter-active,
.company-cards-collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.company-cards-collapse-enter,
.company-cards-collapse-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.company-cards-collapse-enter-to,
.company-cards-collapse-leave {
  opacity: 1;
  max-height: 1000px;
  transform: translateY(0);
}

.company-cards-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  padding: 0 5px;
}

.company-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 12px 14px 10px;
  cursor: pointer;
  background: var(--attendance-card, #ffffff);
  border: 1px solid var(--attendance-border, #e2e8f0);
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.company-card::before {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 0;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: transparent;
  transition: all 0.3s ease;
}

.company-card:hover {
  transform: translateY(-2px);
  border-color: rgba(45, 120, 255, 0.35);
  box-shadow: 0 6px 20px rgba(45, 120, 255, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04);
}

.company-card--active {
  background: linear-gradient(135deg, #eaf3ff 0%, #f0f9ff 100%);
  border-color: rgba(45, 120, 255, 0.45);
  box-shadow: 0 4px 16px rgba(45, 120, 255, 0.18), 0 0 0 1px rgba(45, 120, 255, 0.08);
}

.company-card--active .company-card-title {
  color: #1d4ed8;
  font-weight: 700;
}

.company-card--active .company-card-stat-num {
  color: #1d4ed8;
}

.company-card--active .company-card-radio {
  border-color: #2d78ff;
  background: #2d78ff;
}

.company-card--active .company-card-radio-dot {
  background: #ffffff;
  transform: scale(0.6);
}

.company-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.company-card-title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--attendance-foreground, #1a2a3d);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.company-card-radio {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  border: 1.5px solid #cbd5e1;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.company-card-radio-dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: transparent;
  transition: all 0.2s ease;
}

.company-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.company-card-stat {
  display: flex;
  align-items: baseline;
  gap: 3px;
  line-height: 1;
}

.company-card-stat-num {
  font-size: 22px;
  font-weight: 800;
  color: var(--attendance-foreground, #1a2a3d);
  font-variant-numeric: tabular-nums;
  transition: color 0.3s ease;
}

.company-card-stat-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

.company-card-stats-row {
  display: flex;
  align-items: center;
  gap: 3px;
  min-width: 0;
}

.company-card-stats-item {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  font-size: 11px;
  color: #64748b;
}

.company-card-stats-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.company-card-stats-dot--normal {
  background: #10b981;
  box-shadow: 0 0 4px rgba(16, 185, 129, 0.4);
}

.company-card-stats-dot--abnormal {
  background: #ef4444;
  box-shadow: 0 0 4px rgba(239, 68, 68, 0.4);
}

.company-card-stats-text {
  white-space: nowrap;
}

.company-card-stats-val {
  font-weight: 700;
  color: var(--attendance-foreground, #1a2a3d);
  font-variant-numeric: tabular-nums;
}

.company-card-stats-divider {
  width: 1px;
  height: 10px;
  background: #e2e8f0;
  flex-shrink: 0;
}

.company-card-progress {
  height: 3px;
  margin-top: 10px;
  background: #e8e8e8;
  border-radius: 2px;
  overflow: hidden;
  display: flex;
}

@media (max-width: 1400px) {
  .company-cards-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (max-width: 1200px) {
  .company-cards-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .company-cards-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .company-card-stat-num {
    font-size: 18px;
  }
}

@media (max-width: 600px) {
  .company-cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

<style>
.attendance-regenerate-modal .ant-modal-content {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(45, 120, 255, 0.12), 0 0 40px rgba(45, 120, 255, 0.04);
}

.attendance-regenerate-modal .ant-modal-header {
  padding: 16px 24px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  border-bottom: 0;
}

.attendance-regenerate-modal .ant-modal-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.attendance-regenerate-modal .ant-modal-close {
  top: 10px;
  right: 14px;
  width: 32px;
  height: 32px;
  color: #fff;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.attendance-regenerate-modal .ant-modal-close:hover {
  background: rgba(255, 255, 255, 0.35);
}

.attendance-regenerate-modal .ant-modal-close-x {
  width: 32px;
  height: 32px;
  line-height: 32px;
}

.attendance-regenerate-modal .ant-modal-body {
  padding: 20px 24px;
}

.attendance-regenerate-modal .ant-modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #e2e8f0;
}
</style>
