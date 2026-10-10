<template>
  <div class="sqgl-module">
    <!-- 统计栏 -->
    <div class="sqgl-stats-row">
      <div class="sqgl-stat-card" :class="{ active: activeTab === 'all' }">
        <div class="stat-icon blue"><a-icon type="team" /></div>
        <div class="stat-body">
          <div class="st-title">总人数</div>
          <div class="st-num">
            <strong>{{ stats.total }}</strong
            ><span>人</span>
          </div>
          <div class="st-sub">
            <span class="in"
              ><span class="dot"></span>已入住 <b>{{ stats.totalIn }}</b></span
            >
            <span class="moved"
              ><span class="dot"></span>已调出 <b>{{ stats.totalMoved }}</b></span
            >
            <span class="out"
              ><span class="dot"></span>已退宿 <b>{{ stats.totalOut }}</b></span
            >
          </div>
        </div>
      </div>
      <div class="sqgl-stat-card">
        <div class="stat-icon green"><a-icon type="solution" /></div>
        <div class="stat-body">
          <div class="st-title">正式员工</div>
          <div class="st-num">
            <strong>{{ stats.formalTotal }}</strong
            ><span>人</span>
          </div>
          <div class="st-sub">
            <span class="in"
              ><span class="dot"></span>已入住 <b>{{ stats.formalIn }}</b></span
            >
            <span class="moved"
              ><span class="dot"></span>已调出 <b>{{ stats.formalMoved }}</b></span
            >
            <span class="out"
              ><span class="dot"></span>已退宿 <b>{{ stats.formalOut }}</b></span
            >
          </div>
        </div>
      </div>
      <div class="sqgl-stat-card">
        <div class="stat-icon purple"><a-icon type="user-add" /></div>
        <div class="stat-body">
          <div class="st-title">外部人员</div>
          <div class="st-num">
            <strong>{{ stats.externalTotal }}</strong
            ><span>人</span>
          </div>
          <div class="st-sub">
            <span class="in"
              ><span class="dot"></span>已入住 <b>{{ stats.externalIn }}</b></span
            >
            <span class="moved"
              ><span class="dot"></span>已调出 <b>{{ stats.externalMoved }}</b></span
            >
            <span class="out"
              ><span class="dot"></span>已退宿 <b>{{ stats.externalOut }}</b></span
            >
          </div>
        </div>
      </div>
      <div class="sqgl-stat-card">
        <div class="stat-icon amber"><a-icon type="tool" /></div>
        <div class="stat-body">
          <div class="st-title">临时工</div>
          <div class="st-num">
            <strong>{{ stats.tempTotal }}</strong
            ><span>人</span>
          </div>
          <div class="st-sub">
            <span class="in"
              ><span class="dot"></span>已入住 <b>{{ stats.tempIn }}</b></span
            >
            <span class="moved"
              ><span class="dot"></span>已调出 <b>{{ stats.tempMoved }}</b></span
            >
            <span class="out"
              ><span class="dot"></span>已退宿 <b>{{ stats.tempOut }}</b></span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="sqgl-filter-bar">
      <div class="sqgl-filter-row">
        <div class="sqgl-filter-item">
          <span class="sqgl-filter-label">宿舍号</span>
          <div class="sqgl-filter-ctl" style="width: 130px">
            <a-input v-model="queryParam.dormNo" placeholder="宿舍号" allowClear />
          </div>
        </div>
        <div class="sqgl-filter-item">
          <span class="sqgl-filter-label">公司</span>
          <div class="sqgl-filter-ctl">
            <a-select
              v-model="queryParam.company"
              :loading="orgLoading"
              showSearch
              optionFilterProp="children"
              placeholder="全部"
              allowClear
              style="width: 150px"
              @change="handleQueryCompanyChange"
            >
              <a-select-option v-for="o in companyList" :key="o.id" :value="o.name">{{ o.name }}</a-select-option>
            </a-select>
          </div>
        </div>
        <div class="sqgl-filter-item">
          <span class="sqgl-filter-label">部门</span>
          <div class="sqgl-filter-ctl">
            <a-cascader
              v-model="queryDeptPath"
              :options="queryDeptOptions"
              :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
              changeOnSelect
              allowClear
              placeholder="全部"
              style="width: 150px"
              @change="handleQueryDeptChange"
            />
          </div>
        </div>
        <div class="sqgl-filter-item">
          <span class="sqgl-filter-label">工号/姓名</span>
          <div class="sqgl-filter-ctl" style="width: 140px">
            <a-input v-model="queryParam.keyword" placeholder="工号/姓名" allowClear>
              <!-- <a-icon slot="prefix" type="search" /> -->
            </a-input>
          </div>
        </div>
        <div class="sqgl-filter-item">
          <span class="sqgl-filter-label">宿舍类型</span>
          <div class="sqgl-filter-ctl">
            <j-dict-select-tag
              type="list"
              v-model="queryParam.dormType"
              dictCode="hrm_sqgl_apply_dorm_type"
              placeholder="全部"
              style="width: 120px"
            />
          </div>
        </div>
        <div class="sqgl-filter-item">
          <span class="sqgl-filter-label">人员类型</span>
          <div class="sqgl-filter-ctl">
            <j-dict-select-tag
              type="list"
              v-model="queryParam.personType"
              dictCode="hrm_sqgl_apply_person_type"
              placeholder="全部"
              style="width: 120px"
            />
          </div>
        </div>
        <!-- 已入住：入住日期 -->
        <div class="sqgl-filter-item" v-if="activeTab === '1'">
          <span class="sqgl-filter-label">入住日期</span>
          <div class="sqgl-filter-ctl" style="width: 220px">
            <a-range-picker v-model="checkinDateRange" valueFormat="YYYY-MM-DD" @change="onCheckinDateChange" />
          </div>
        </div>
        <!-- 已调出：调宿入住日期 -->
        <div class="sqgl-filter-item" v-if="activeTab === '2'">
          <span class="sqgl-filter-label">调宿入住日期</span>
          <div class="sqgl-filter-ctl" style="width: 220px">
            <a-range-picker v-model="tsDateRange" valueFormat="YYYY-MM-DD" @change="onTsDateChange" />
          </div>
        </div>
        <!-- 已退宿：退宿日期 -->
        <div class="sqgl-filter-item" v-if="activeTab === '0'">
          <span class="sqgl-filter-label">退宿日期</span>
          <div class="sqgl-filter-ctl" style="width: 220px">
            <a-range-picker v-model="checkoutDateRange" valueFormat="YYYY-MM-DD" @change="onCheckoutDateChange" />
          </div>
        </div>
        <!-- 搜索按钮跟在日期后面 -->
        <a-button type="primary" style="margin-bottom: 0" @click="loadData(1)"><a-icon type="search" />搜索</a-button>
        <a-button style="margin-bottom: 0" @click="handleReset"><a-icon type="redo" />重置</a-button>
      </div>
      <div class="sqgl-filter-actions">
        <a-button type="primary" @click="handleExportXls(`人员基本信息-${activeTabName}`)"
          ><a-icon type="download" />导出</a-button
        >
      </div>
    </div>

    <!-- Tab切换 -->
    <div class="sqgl-tab-bar">
      <div
        v-for="tab in tabList"
        :key="tab.key"
        :class="['sqgl-tab-item', activeTab === tab.key ? 'active' : '']"
        @click="onTabChange(tab.key)"
      >
        {{ tab.label }}<span class="tab-count">{{ tab.count }}</span>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="sqgl-table-wrap">
      <a-table
        ref="table"
        size="middle"
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange"
        :scroll="{ x: 'auto' }"
      >
        <template slot="empInfo" slot-scope="text, record">
          <div class="emp-info">
            <div class="emp-avatar">{{ (record.empName || '').charAt(0) }}</div>
            <div class="emp-detail">
              <div class="emp-name">{{ record.empName }}</div>
              <div class="emp-no">{{ record.empNo }}</div>
            </div>
          </div>
        </template>
        <template slot="rzStatus" slot-scope="text">
          <span :class="['status-tag', statusClass(text)]"> <span class="dot"></span>{{ statusText(text) }} </span>
        </template>
        <template slot="dormNo" slot-scope="text, record">
          <span class="dorm-no">{{ record.areaName }}{{ record.buildingName }}{{ record.roomName }}</span>
        </template>
        <template slot="oldDormNo" slot-scope="text, record">
          <span class="dorm-no old">{{ record.oldAreaName }}{{ record.oldBuildingName }}{{ record.oldRoomName }}</span>
        </template>
        <template slot="handleDormNo" slot-scope="text, record">
          <span class="dorm-no"
            >{{ record.handleAreaName }}{{ record.handleBuildingName }}{{ record.handleRoomName }}</span
          >
        </template>

        <template slot="internalEmployee" slot-scope="text">
          <span :class="['yes-no-tag', text === '1' ? 'yes' : 'no']">{{ text === '1' ? '是' : '否' }}</span>
        </template>
        <template slot="gridInfo" slot-scope="text">
          <span :class="['yes-no-tag', text === '1' ? 'yes' : 'no']">{{ text === '1' ? '是' : '否' }}</span>
        </template>
        <template slot="action" slot-scope="text, record">
          <a-button type="link" size="small" @click="handleDetail(record)"> <a-icon type="eye" />详情 </a-button>
        </template>
      </a-table>
    </div>

    <!-- 详情弹窗 -->
    <person-detail-modal ref="detailModal" />
  </div>
</template>

<script>
import { getAction } from '@/api/manage'
import PersonDetailModal from './modules/PersonDetailModal'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

export default {
  name: 'DormMateList',
  components: { PersonDetailModal },
  mixins: [JeecgListMixin],
  data() {
    // 禁用 mixin 自动加载，在 mounted 中手动控制
    this.disableMixinCreated = true
    return {
      description: '人员基本信息',
      activeTab: '1',
      stats: {
        total: 0,
        totalIn: 0,
        totalMoved: 0,
        totalOut: 0,
        formalTotal: 0,
        formalIn: 0,
        formalMoved: 0,
        formalOut: 0,
        externalTotal: 0,
        externalIn: 0,
        externalMoved: 0,
        externalOut: 0,
        tempTotal: 0,
        tempIn: 0,
        tempMoved: 0,
        tempOut: 0,
      },
      queryParam: {
        rzStatus: '1',
        dormNo: '',
        company: '',
        dept: '',
        keyword: '',
        dormType: '',
        personType: '',
        checkinStart: '',
        checkinEnd: '',
        tsStart: '',
        tsEnd: '',
        checkoutStart: '',
        checkoutEnd: '',
      },
      checkinDateRange: [],
      tsDateRange: [],
      checkoutDateRange: [],
      // 组织架构
      companyList: [],
      queryDeptOptions: [],
      queryDeptPath: [],
      orgLoading: false,
      url: {
        list: '/sqgl/hrmSqglPersonInfo/list',
        statusCount: '/sqgl/hrmSqglPersonInfo/statusCount',
        exportXlsUrl: '/sqgl/hrmSqglPersonInfo/export',
      },
      // 已入住列
      columnsIn: [
        {
          title: '状态',
          dataIndex: 'rzStatus',
          key: 'rzStatus',
          width: 90,
          align: 'center',
          scopedSlots: { customRender: 'rzStatus' },
        },
        {
          title: '宿舍号',
          dataIndex: 'dormNo',
          key: 'dormNo',
          // width: 180,
          align: 'center',
          scopedSlots: { customRender: 'dormNo' },
        },
        { title: '工号', dataIndex: 'empNo', key: 'empNo', width: 100, align: 'center' },
        { title: '姓名', dataIndex: 'empName', key: 'empName', width: 100, align: 'center' },
        { title: '性别', dataIndex: 'sex', key: 'sex', width: 100, align: 'center' },
        { title: '所属公司', dataIndex: 'company', key: 'company', width: 120, align: 'center', ellipsis: true },
        { title: '部门', dataIndex: 'deptPath', key: 'deptPath', width: 150, align: 'center', ellipsis: true },
        {
          title: '宿舍类型',
          dataIndex: 'dormType_dictText',
          key: 'dormType_dictText',
          width: 100,
          align: 'center',
        },
        {
          title: '内部员工',
          dataIndex: 'internalEmployee',
          key: 'internalEmployee',
          width: 90,
          align: 'center',
          scopedSlots: { customRender: 'internalEmployee' },
        },
        {
          title: '人员类型',
          dataIndex: 'personType_dictText',
          key: 'personType_dictText',
          width: 100,
          align: 'center',
        },
        { title: '身份证', dataIndex: 'idCard', key: 'idCard', width: 180, align: 'center' },
        { title: '手机号码', dataIndex: 'phone', key: 'phone', width: 120, align: 'center' },
        {
          title: '办理网格',
          dataIndex: 'gridInfo',
          key: 'gridInfo',
          width: 90,
          align: 'center',
          scopedSlots: { customRender: 'gridInfo' },
        },
        { title: '入住日期', dataIndex: 'checkinDate', key: 'checkinDate', width: 110, align: 'center' },
        { title: '调宿入住日期', dataIndex: 'tsDate', key: 'tsDate', width: 110, align: 'center' },
        { title: '预计离开', dataIndex: 'expectedLeaveDate', key: 'expectedLeaveDate', width: 110, align: 'center' },
        { title: '备注', dataIndex: 'remark', key: 'remark', width: 150, align: 'center', ellipsis: true },
        {
          title: '操作',
          dataIndex: 'action',
          key: 'action',
          width: 80,
          align: 'center',
          fixed: 'right',
          scopedSlots: { customRender: 'action' },
        },
      ],
      // 已调出列
      columnsMoved: [
        {
          title: '状态',
          dataIndex: 'rzStatus',
          key: 'rzStatus',
          width: 90,
          align: 'center',
          scopedSlots: { customRender: 'rzStatus' },
        },
        {
          title: '宿舍号',
          dataIndex: 'oldDormNo',
          key: 'oldDormNo',
          width: 180,
          align: 'center',
          scopedSlots: { customRender: 'oldDormNo' },
        },
        // {
        //   title: '调宿后宿舍',
        //   dataIndex: 'handleDormNo',
        //   key: 'handleDormNo',
        //   width: 180,
        //   align: 'center',
        //   scopedSlots: { customRender: 'handleDormNo' },
        // },
        { title: '工号', dataIndex: 'empNo', key: 'empNo', width: 100, align: 'center' },
        { title: '姓名', dataIndex: 'empName', key: 'empName', width: 100, align: 'center' },
        { title: '性别', dataIndex: 'sex', key: 'sex', width: 100, align: 'center' },
        { title: '所属公司', dataIndex: 'company', key: 'company', width: 120, align: 'center', ellipsis: true },
        { title: '部门', dataIndex: 'deptPath', key: 'deptPath', width: 150, align: 'center', ellipsis: true },
        {
          title: '宿舍类型',
          dataIndex: 'dormType_dictText',
          key: 'dormType_dictText',
          width: 100,
          align: 'center',
        },
        {
          title: '内部员工',
          dataIndex: 'internalEmployee',
          key: 'internalEmployee',
          width: 90,
          align: 'center',
          scopedSlots: { customRender: 'internalEmployee' },
        },
        {
          title: '人员类型',
          dataIndex: 'personType_dictText',
          key: 'personType_dictText',
          width: 100,
          align: 'center',
        },
        { title: '身份证', dataIndex: 'idCard', key: 'idCard', width: 180, align: 'center' },
        { title: '手机号码', dataIndex: 'phone', key: 'phone', width: 120, align: 'center' },
        {
          title: '办理网格',
          dataIndex: 'gridInfo',
          key: 'gridInfo',
          width: 90,
          align: 'center',
          scopedSlots: { customRender: 'gridInfo' },
        },
        { title: '入住日期', dataIndex: 'checkinDate', key: 'checkinDate', width: 120, align: 'center' },
        { title: '调宿入住日期', dataIndex: 'tsDate', key: 'tsDate', width: 120, align: 'center' },
        { title: '预计离开', dataIndex: 'expectedLeaveDate', key: 'expectedLeaveDate', width: 120, align: 'center' },
        { title: '备注', dataIndex: 'remark', key: 'remark', width: 150, align: 'center', ellipsis: true },
        {
          title: '操作',
          dataIndex: 'action',
          key: 'action',
          width: 80,
          align: 'center',
          fixed: 'right',
          scopedSlots: { customRender: 'action' },
        },
      ],
      // 已退宿列
      columnsOut: [
        {
          title: '状态',
          dataIndex: 'rzStatus',
          key: 'rzStatus',
          width: 90,
          align: 'center',
          scopedSlots: { customRender: 'rzStatus' },
        },
        {
          title: '宿舍号',
          dataIndex: 'dormNo',
          key: 'dormNo',
          // width: 180,
          align: 'center',
          scopedSlots: { customRender: 'dormNo' },
        },
        { title: '工号', dataIndex: 'empNo', key: 'empNo', width: 100, align: 'center' },
        { title: '姓名', dataIndex: 'empName', key: 'empName', width: 100, align: 'center' },
        { title: '性别', dataIndex: 'sex', key: 'sex', width: 100, align: 'center' },
        { title: '所属公司', dataIndex: 'company', key: 'company', width: 120, align: 'center', ellipsis: true },
        { title: '部门', dataIndex: 'deptPath', key: 'deptPath', width: 150, align: 'center', ellipsis: true },
        {
          title: '宿舍类型',
          dataIndex: 'dormType_dictText',
          key: 'dormType_dictText',
          width: 100,
          align: 'center',
        },
        {
          title: '内部员工',
          dataIndex: 'internalEmployee',
          key: 'internalEmployee',
          width: 90,
          align: 'center',
          scopedSlots: { customRender: 'internalEmployee' },
        },
        {
          title: '人员类型',
          dataIndex: 'personType_dictText',
          key: 'personType_dictText',
          width: 100,
          align: 'center',
        },
        { title: '身份证', dataIndex: 'idCard', key: 'idCard', width: 180, align: 'center' },
        { title: '手机号码', dataIndex: 'phone', key: 'phone', width: 120, align: 'center' },
        {
          title: '办理网格',
          dataIndex: 'gridInfo',
          key: 'gridInfo',
          width: 90,
          align: 'center',
          scopedSlots: { customRender: 'gridInfo' },
        },
        { title: '入住日期', dataIndex: 'checkinDate', key: 'checkinDate', width: 110, align: 'center' },
        { title: '调宿入住日期', dataIndex: 'tsDate', key: 'tsDate', width: 110, align: 'center' },
        { title: '预计离开', dataIndex: 'expectedLeaveDate', key: 'expectedLeaveDate', width: 110, align: 'center' },
        { title: '退宿日期', dataIndex: 'checkoutDate', key: 'checkoutDate', width: 110, align: 'center' },
        { title: '退宿原因', dataIndex: 'reason', key: 'reason', width: 120, align: 'center', ellipsis: true },
        { title: '备注', dataIndex: 'remark', key: 'remark', width: 150, align: 'center', ellipsis: true },

        {
          title: '操作',
          dataIndex: 'action',
          key: 'action',
          width: 80,
          align: 'center',
          fixed: 'right',
          scopedSlots: { customRender: 'action' },
        },
      ],
    }
  },
  computed: {
    columns() {
      if (this.activeTab === '2') return this.columnsMoved
      if (this.activeTab === '0') return this.columnsOut
      return this.columnsIn
    },
    scrollX() {
      return this.columns.reduce((sum, col) => sum + (col.width || 120), 0)
    },
    tabList() {
      return [
        { key: '1', label: '已入住', count: this.stats.totalIn },
        { key: '2', label: '已调出', count: this.stats.totalMoved },
        { key: '0', label: '已退宿', count: this.stats.totalOut },
      ]
    },
    activeTabName() {
      const tab = this.tabList.find((t) => t.key === this.activeTab)
      return tab ? tab.label : ''
    },
  },
  mounted() {
    this.loadStats()
    this.loadOrgTree()
    this.loadData(1)
  },
  methods: {
    loadOrgTree() {
      this.orgLoading = true
      getAction('/org/hrmOrg/loadTreeRoot', { pid: 0 })
        .then((res) => {
          const roots = res && res.success && Array.isArray(res.result) ? res.result : []
          this.companyList = roots.length && Array.isArray(roots[0].children) ? roots[0].children : []
        })
        .catch(() => {
          this.companyList = []
        })
        .finally(() => {
          this.orgLoading = false
        })
    },
    handleQueryCompanyChange(companyName) {
      const company = this.companyList.find((item) => item.name === companyName)
      this.queryDeptOptions = company ? [company] : []
      this.queryDeptPath = []
      this.queryParam.dept = ''
    },
    handleQueryDeptChange(value) {
      const path = Array.isArray(value) ? value.map((item) => String(item)) : []
      this.queryDeptPath = path
      this.queryParam.dept = path[path.length - 1] || ''
    },
    loadStats() {
      getAction(this.url.statusCount).then((res) => {
        if (res.success && res.result) {
          this.stats = { ...this.stats, ...res.result }
        }
      })
    },
    statusClass(status) {
      const map = { 1: 'in', 2: 'moved', 0: 'out' }
      return map[status] || 'out'
    },
    statusText(status) {
      const map = { 1: '已入住', 2: '已调出', 0: '已退宿' }
      return map[status] || '未知'
    },
    onTabChange(tab) {
      this.activeTab = tab
      this.queryParam.rzStatus = tab
      // 清空日期筛选
      this.checkinDateRange = []
      this.tsDateRange = []
      this.checkoutDateRange = []
      this.queryParam.checkinStart = ''
      this.queryParam.checkinEnd = ''
      this.queryParam.tsStart = ''
      this.queryParam.tsEnd = ''
      this.queryParam.checkoutStart = ''
      this.queryParam.checkoutEnd = ''
      // 清空部门和公司
      this.queryDeptOptions = []
      this.queryDeptPath = []
      this.queryParam.company = ''
      this.queryParam.dept = ''
      this.loadData(1)
    },
    onCheckinDateChange(dates) {
      if (dates && dates.length === 2) {
        this.queryParam.checkinDate_begin = dates[0]
        this.queryParam.checkinDate_end = dates[1]
      } else {
        this.queryParam.checkinDate_begin = ''
        this.queryParam.checkinDate_end = ''
      }
    },
    onTsDateChange(dates) {
      if (dates && dates.length === 2) {
        this.queryParam.tsDate_begin = dates[0]
        this.queryParam.tsDate_end = dates[1]
      } else {
        this.queryParam.tsDate_begin = ''
        this.queryParam.tsDate_end = ''
      }
    },
    onCheckoutDateChange(dates) {
      if (dates && dates.length === 2) {
        this.queryParam.checkoutDate_begin = dates[0]
        this.queryParam.checkoutDate_end = dates[1]
      } else {
        this.queryParam.checkoutDate_begin = ''
        this.queryParam.checkoutDate_end = ''
      }
    },
    handleReset() {
      this.queryParam = {
        rzStatus: this.activeTab,
        dormNo: '',
        company: '',
        dept: '',
        keyword: '',
        dormType: '',
        personType: '',
        checkinStart: '',
        checkinEnd: '',
        tsStart: '',
        tsEnd: '',
        checkoutStart: '',
        checkoutEnd: '',
      }
      this.checkinDateRange = []
      this.tsDateRange = []
      this.checkoutDateRange = []
      this.queryDeptOptions = []
      this.queryDeptPath = []
      this.loadData(1)
    },
    handleExport() {
      const params = { ...this.queryParam }
      const queryString = Object.keys(params)
        .filter((key) => params[key])
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join('&')
      const url = `${window._CONFIG['domianURL']}${this.url.export}?${queryString}`
      window.open(url, '_blank')
    },
    handleDetail(record) {
      this.$refs.detailModal.open(record.id, this.activeTab)
    },
  },
}
</script>

<style lang="less" scoped>
@sqgl-primary: #2563eb;
@sqgl-primary-rgb: 37, 99, 235;
@sqgl-border: #e2e8f0;
@sqgl-muted: #f1f5f9;
@sqgl-muted-foreground: #64748b;
@sqgl-foreground: #1a2a3d;
@sqgl-background: #f8fafd;
@sqgl-green: #10b981;
@sqgl-amber: #f59e0b;
@sqgl-purple: #8b5cf6;
@sqgl-red: #ef4444;
@sqgl-gradient-blue: linear-gradient(135deg, #2d78ff 0%, #4a9eff 100%);
@sqgl-shadow-card: 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);

.sqgl-module {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 14px 20px;
  gap: 10px;
  background: @sqgl-background;
  overflow-y: auto;
}

/* ===== 统计栏 ===== */
.sqgl-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  flex-shrink: 0;
}
.sqgl-stat-card {
  background: #fff;
  border: 1px solid @sqgl-border;
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: @sqgl-shadow-card;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: @sqgl-gradient-blue;
    box-shadow: 0 0 8px rgba(45, 120, 255, 0.25);
  }
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(45, 120, 255, 0.12);
  }
  &.active {
    background: @sqgl-gradient-blue;
    border-color: transparent;
    box-shadow: 0 6px 22px rgba(45, 120, 255, 0.35);
    &::before {
      display: none;
    }
    .stat-icon {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }
    .st-title,
    .st-num strong,
    .st-num span,
    .st-sub,
    .st-sub b {
      color: #fff;
    }
    .st-sub .in b {
      color: #a5f3fc;
    }
    .st-sub .moved b {
      color: #c4b5fd;
    }
    .st-sub .out b {
      color: #fecaca;
    }
  }
  .stat-icon {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 16px;
    &.blue {
      background: rgba(45, 120, 255, 0.1);
      color: #2d78ff;
    }
    &.green {
      background: rgba(16, 185, 129, 0.1);
      color: @sqgl-green;
    }
    &.purple {
      background: rgba(139, 92, 246, 0.1);
      color: @sqgl-purple;
    }
    &.amber {
      background: rgba(245, 158, 11, 0.1);
      color: @sqgl-amber;
    }
  }
  .stat-body {
    flex: 1;
    min-width: 0;
  }
  .st-title {
    font-size: 11.5px;
    color: @sqgl-muted-foreground;
    font-weight: 500;
  }
  .st-num {
    display: flex;
    align-items: baseline;
    gap: 4px;
    line-height: 1.2;
    margin-top: 1px;
    strong {
      font-size: 22px;
      font-weight: 700;
      color: @sqgl-foreground;
    }
    span {
      font-size: 11px;
      color: @sqgl-muted-foreground;
      font-weight: 500;
    }
  }
  .st-sub {
    margin-top: 6px;
    font-size: 11px;
    color: @sqgl-muted-foreground;
    line-height: 1.5;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    b {
      color: @sqgl-foreground;
      font-weight: bold;
    }
    .dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-right: 3px;
      vertical-align: middle;
    }
    .in .dot {
      background: @sqgl-green;
    }
    .moved .dot {
      background: @sqgl-purple;
    }
    .out .dot {
      background: @sqgl-red;
    }
    .in b {
      color: @sqgl-green;
    }
    .moved b {
      color: @sqgl-purple;
    }
    .out b {
      color: @sqgl-red;
    }
  }
}

/* ===== 筛选栏 ===== */
.sqgl-filter-bar {
  background: #fff;
  border: 1px solid @sqgl-border;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  box-shadow: @sqgl-shadow-card;
  flex-shrink: 0;
  flex-wrap: nowrap;
  overflow-x: auto;
}
.sqgl-filter-row {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: nowrap;
  min-width: 0;
}
.sqgl-filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
  white-space: nowrap;
}
.sqgl-filter-label {
  font-size: 12px;
  font-weight: 600;
  color: @sqgl-muted-foreground;
}
.sqgl-filter-ctl {
  /deep/ .ant-input {
    height: 32px;
  }
  /deep/ .ant-select {
    height: 32px;
    .ant-select-selection--single {
      height: 32px;
    }
  }
  /deep/ .ant-calendar-picker {
    height: 32px;
    .ant-calendar-picker-input {
      height: 32px;
    }
  }
  /deep/ .ant-cascader-picker {
    height: 32px;
    input {
      height: 32px;
    }
  }
}
.sqgl-filter-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-bottom: 0;
}

/* ===== Tab切换 ===== */
.sqgl-tab-bar {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.sqgl-tab-item {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: @sqgl-muted-foreground;
  transition: all 0.2s;
  border: 1px solid @sqgl-border;
  background: #fff;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  .tab-count {
    font-size: 11px;
    background: rgba(@sqgl-primary-rgb, 0.1);
    color: @sqgl-primary;
    padding: 1px 7px;
    border-radius: 10px;
    font-weight: 600;
  }
  &:hover {
    background: rgba(@sqgl-primary-rgb, 0.04);
    color: @sqgl-foreground;
    border-color: rgba(@sqgl-primary-rgb, 0.2);
  }
  &.active {
    background: @sqgl-gradient-blue;
    color: #fff;
    border-color: transparent;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(45, 120, 255, 0.25);
    .tab-count {
      background: rgba(255, 255, 255, 0.25);
      color: #fff;
    }
  }
}

/* ===== 表格区域 ===== */
.sqgl-table-wrap {
  flex: 1;
  min-height: 0;
  background: #fff;
  border: 1px solid @sqgl-border;
  border-radius: 8px;
  box-shadow: @sqgl-shadow-card;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: @sqgl-gradient-blue;
    box-shadow: 0 0 8px rgba(45, 120, 255, 0.25);
    z-index: 1;
  }

  /deep/ .ant-table-thead > tr > th {
    background: #eef4ff;
    color: @sqgl-primary;
    font-weight: 600;
    font-size: 12px;
    border-bottom: 1px solid @sqgl-border;
  }
  /deep/ .ant-table-tbody > tr > td {
    font-size: 13px;
    color: @sqgl-foreground;
    border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  }
  /deep/ .ant-table-tbody > tr:hover > td {
    background: rgba(@sqgl-primary-rgb, 0.025);
  }
}

/* ===== 人员信息 ===== */
.emp-info {
  display: flex;
  align-items: center;
  gap: 8px;
  .emp-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: @sqgl-gradient-blue;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .emp-detail {
    display: flex;
    flex-direction: column;
    line-height: 1.3;
    .emp-name {
      font-size: 13px;
      font-weight: 500;
      color: @sqgl-foreground;
    }
    .emp-no {
      font-size: 11px;
      color: #94a3b8;
    }
  }
}

/* ===== 状态标签 ===== */
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  &.in {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  }
  &.moved {
    background: rgba(139, 92, 246, 0.1);
    color: #7c3aed;
  }
  &.out {
    background: rgba(239, 68, 68, 0.08);
    color: #dc2626;
  }
}

/* ===== 是/否标签 ===== */
.yes-no-tag {
  font-weight: 500;
  &.yes {
    color: @sqgl-green;
  }
  &.no {
    color: #94a3b8;
  }
}

/* ===== 宿舍号 ===== */
.dorm-no {
  white-space: nowrap;
  font-weight: 500;
  color: @sqgl-primary;
  &.old {
    color: @sqgl-muted-foreground;
  }
}

@media (max-width: 1200px) {
  .sqgl-stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .sqgl-filter-row {
    flex-wrap: wrap;
  }
}
</style>

