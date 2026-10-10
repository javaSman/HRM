<template>
  <div class="sqgl-allot-page">
    <!-- 顶部 TAB -->
    <div class="sqgl-top-tabs">
      <div v-for="tab in tabList" :key="tab.key" :class="['sqgl-top-tab', activeTab === tab.key ? 'active' : '']"
        @click="onTabChange(tab.key)">
        {{ tab.label }}
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="sqgl-filter-bar">
      <div class="sqgl-filter-row">
        <div class="sqgl-filter-item" v-for="item in filterItems" :key="item.key">
          <span class="sqgl-filter-label">{{ item.label }}</span>
          <div class="sqgl-filter-ctl">
            <a-input v-if="item.type === 'search'" v-model.trim="queryParam[item.key]"
              :placeholder="item.placeholder || '请输入'" allowClear @pressEnter="searchQuery">
            </a-input>
            <j-input v-if="item.type === 'input'" v-model.trim="queryParam[item.key]"
              :placeholder="item.placeholder || '请输入'" allowClear @pressEnter="searchQuery">
            </j-input>
            <a-select v-else-if="item.type === 'select'" v-model="queryParam[item.key]"
              :loading="item.key === 'company' ? orgLoading : false" showSearch optionFilterProp="children"
              placeholder="全部" allowClear
              @change="item.key === 'company' ? handleQueryCompanyChange($event) : searchQuery()">
              <a-select-option v-for="o in item.options" :key="o.id" :value="o.name">{{ o.name }}</a-select-option>
            </a-select>
            <a-cascader v-else-if="item.type === 'cascader'" v-model="queryDeptPath" :options="item.options"
              :fieldNames="{ label: 'name', value: 'id', children: 'children' }" changeOnSelect allowClear
              placeholder="全部" @change="handleQueryDeptChange" />
            <j-dict-select-tag v-else-if="item.type === 'dict'" type="list" v-model="queryParam[item.key]"
              :dictCode="item.dictCode" placeholder="全部" style="width: 120px" @change="searchQuery" />
            <a-range-picker v-else-if="item.type === 'dateRange'" v-model="dateRanges[item.key]"
              valueFormat="YYYY-MM-DD" @change="searchQuery" />
          </div>
        </div>
      </div>
      <div class="sqgl-filter-actions">
        <a-button type="primary" @click="searchQuery"><a-icon type="search" />搜索</a-button>
        <a-button @click="searchReset"><a-icon type="undo" />重置</a-button>
        <a-button type="primary" @click="handleApply"><a-icon type="plus" />{{ applyBtnText }}</a-button>
      </div>
    </div>

    <!-- 状态 TAB 切 -->
    <div class="sqgl-status-pills">
      <div v-for="p in statusPills" :key="p.key" :class="['sqgl-status-pill', activeStatus === p.key ? 'active' : '']"
        @click="onStatusChange(p.key)">
        {{ p.label }}
        <span class="sqgl-pill-count">{{ statusCount[p.key] || 0 }}</span>
      </div>
    </div>

    <!-- 列表 -->
    <div class="sqgl-table-card">
      <a-table ref="table" size="middle" rowKey="id" :columns="columns" :dataSource="dataSource" :loading="loading"
        :pagination="ipagination" :scroll="{ x: 'auto' }" @change="handleTableChange">
        <template slot="status" slot-scope="text, record">
          <span :class="['sqgl-status-tag', statusCls(text)]">
            <span class="dot"></span>{{ record.status_dictText }}
          </span>
        </template>
        <template slot="action" slot-scope="text, record">
          <div class="sqgl-action-cell">
            <button class="sqgl-btn-icon ghost" @click="handleDetail(record)">详情</button>
            <button v-if="canCancel(record)" class="sqgl-btn-icon danger" @click="handleCancel(record)">
              撤回
            </button>
          </div>
        </template>
      </a-table>
    </div>

    <!-- 申请表单弹窗 -->
    <dorm-allot-apply-modal ref="applyModal" @ok="onApplyOk" />
    <!-- 详情弹窗 -->
    <dorm-allot-detail-modal ref="detailModal" />
  </div>
</template>

<script>
import moment from 'moment'
import Vue from 'vue'
import { getAction, putAction } from '@/api/manage'
import { initDictOptions, filterDictText } from '@/components/dict/JDictSelectUtil'
import DormAllotApplyModal from './modules/DormAllotApplyModal'
import DormAllotDetailModal from './modules/DormAllotDetailModal'

const TAB_LIST = [
  { key: '0', label: '入住申请', applyBtnText: '入住申请' },
  { key: '1', label: '调宿申请', applyBtnText: '调宿申请' },
  { key: '2', label: '退宿申请', applyBtnText: '退宿申请' },
]

const STATUS_PILLS = [
  { key: 'all', label: '全部' },
  { key: '0', label: '审批中' },
  { key: '1', label: '已通过' },
  { key: '2', label: '已办理' },
  { key: '4', label: '不通过' },
  { key: '3', label: '已撤回' },
]
const STATUS_CLS = { 0: 'pending', 1: 'approved', 2: 'handled', 3: 'cancelled', 4: 'rejected', 5: 'retire' }

function fmtTime(v) {
  if (!v) return '—'
  const m = moment(v)
  return m.isValid() ? m.format('YYYY-MM-DD HH:mm') : v
}
function fmtDate(v) {
  if (!v) return '—'
  const m = moment(v)
  return m.isValid() ? m.format('YYYY-MM-DD') : v
}
const defQuery = {
  column: 'createTime',
  order: 'desc',
}
export default {
  name: 'DormAllotList',
  components: { DormAllotApplyModal, DormAllotDetailModal },
  data() {
    return {
      tabList: TAB_LIST,
      statusPills: STATUS_PILLS,
      activeTab: '0',
      activeStatus: 'all',
      /** 当前登录用户姓名（撤回按钮仅对本人发起的申请显示） */
      currentUserName: (Vue.ls.get('perInfo') || {}).name || '',
      queryParam: { ...defQuery },
      dateRanges: {},
      dataSource: [],
      loading: false,
      statusCount: {},
      areaOptions: [],
      companyList: [],
      dormTypeDict: [],
      queryDeptOptions: [],
      queryDeptPath: [],
      orgLoading: false,
      ipagination: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30'],
        showTotal: (total, range) => range[0] + '-' + range[1] + ' 共' + total + '条',
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0,
      },
    }
  },
  computed: {
    applyBtnText() {
      const t = TAB_LIST.find((t) => t.key === this.activeTab)
      return t ? t.applyBtnText : '申请'
    },
    filterItems() {
      const items = [{ key: 'searchKeyword', label: '工号/姓名', type: 'search', placeholder: '工号 / 姓名' }]
      if (this.activeTab === '0') {
        items.push(
          { key: 'areaName', label: '区域', type: 'select', options: this.areaOptions },
          { key: 'company', label: '公司', type: 'select', options: this.companyList },
          { key: 'dept', label: '部门', type: 'cascader', options: this.queryDeptOptions },
          { key: 'dormType', label: '宿舍类型', type: 'dict', dictCode: 'hrm_sqgl_apply_dorm_type' },
          { key: 'personType', label: '人员类型', type: 'dict', dictCode: 'hrm_sqgl_apply_person_type' },
          { key: 'checkinDate', label: '入住日期', type: 'dateRange' },
          // { key: 'applyTime', label: '申请时间', type: 'dateRange' }
        )
      } else if (this.activeTab === '1') {
        items.push(
          { key: 'company', label: '公司', type: 'select', options: this.companyList },
          { key: 'dept', label: '部门', type: 'cascader', options: this.queryDeptOptions },
          { key: 'personType', label: '人员类型', type: 'dict', dictCode: 'hrm_sqgl_apply_person_type' },
          // { key: 'oldDorm', label: '原宿舍', type: 'input' },
          // { key: 'newDorm', label: '调宿后宿舍', type: 'input' },
          { key: 'tsDate', label: '调宿入住日期', type: 'dateRange' },
          // { key: 'applyTime', label: '申请时间', type: 'dateRange' }
        )
      } else {
        items.push(
          { key: 'areaName', label: '区域', type: 'select', options: this.areaOptions },
          { key: 'buildingName', label: '楼栋', type: 'input' },
          { key: 'roomName', label: '宿舍', type: 'input' },
          { key: 'company', label: '公司', type: 'select', options: this.companyList },
          { key: 'dept', label: '部门', type: 'cascader', options: this.queryDeptOptions },
          { key: 'personType', label: '人员类型', type: 'dict', dictCode: 'hrm_sqgl_apply_person_type' },
          // { key: 'checkinDate', label: '入住日期', type: 'dateRange' },
          { key: 'expectedLeaveDate', label: '预计退宿日期', type: 'dateRange' }
          // { key: 'applyTime', label: '申请时间', type: 'dateRange' }
        )
      }
      return items
    },
    columns() {
      const statusCol = {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        align: 'center',
        fixed: 'left',
        scopedSlots: { customRender: 'status' },
      }
      const actionCol = {
        title: '操作',
        dataIndex: 'action',
        width: 150,
        align: 'center',
        fixed: 'right',
        scopedSlots: { customRender: 'action' },
      }
      if (this.activeTab === '0') {
        return [
          statusCol,
          { title: '区域', dataIndex: 'areaName', align: 'center', ellipsis: true },
          { title: '公司', dataIndex: 'company', width: 130, align: 'center', ellipsis: true },
          { title: '部门', dataIndex: 'deptPath', width: 110, align: 'center', ellipsis: true },
          { title: '工号', dataIndex: 'empNo', width: 80, align: 'center' },
          { title: '姓名', dataIndex: 'empName', width: 80, align: 'center' },
          { title: '性别', dataIndex: 'sex', width: 60, align: 'center' },
          { title: '身份证', dataIndex: 'idCard', width: 160, align: 'center', ellipsis: true },
          { title: '手机号码', dataIndex: 'phone', width: 130, align: 'center' },
          {
            title: '人员类型',
            dataIndex: 'personType_dictText',
            width: 100,
            align: 'center',
          },
          {
            title: '宿舍类型',
            dataIndex: 'dormType',
            width: 100,
            align: 'center',
            customRender: (t, r) => r.dormType_dictText || filterDictText(this.dormTypeDict, t) || '—',
          },
          { title: '入住日期', dataIndex: 'checkinDate', width: 110, align: 'center', customRender: (t) => fmtDate(t) },
          { title: '申请时间', dataIndex: 'applyTime', width: 150, align: 'center', customRender: (t) => fmtTime(t) },
          { title: '入住原因', dataIndex: 'reason', width: 120, align: 'center', ellipsis: true },
          actionCol,
        ]
      }
      if (this.activeTab === '1') {
        return [
          statusCol,
          { title: '公司', dataIndex: 'company', width: 130, align: 'center', ellipsis: true },
          { title: '部门', dataIndex: 'deptPath', width: 110, align: 'center', ellipsis: true },
          { title: '工号', dataIndex: 'empNo', width: 80, align: 'center' },
          { title: '调宿人姓名', dataIndex: 'empName', width: 100, align: 'center' },
          { title: '性别', dataIndex: 'sex', width: 60, align: 'center' },
          {
            title: '人员类型',
            dataIndex: 'personType_dictText',
            width: 100,
            align: 'center',
          },
          {
            title: '原宿舍',
            dataIndex: 'oldDorm',
            width: 180,
            align: 'center',
            ellipsis: true,
            customRender: (t, r) => this.joinDorm(r.oldAreaName, r.oldBuildingName, r.oldRoomName),
          },
          {
            title: '调宿后宿舍',
            dataIndex: 'newDorm',
            width: 180,
            align: 'center',
            ellipsis: true,
            customRender: (t, r) => this.joinDorm(r.areaName, r.buildingName, r.roomName),
          },
          { title: '调宿原因', dataIndex: 'transferReason', width: 110, align: 'center', ellipsis: true },
          {
            title: '调宿入住日期',
            dataIndex: 'tsDate',
            width: 120,
            align: 'center',
            customRender: (t) => fmtDate(t),
          },
          { title: '申请时间', dataIndex: 'applyTime', width: 150, align: 'center', customRender: (t) => fmtTime(t) },
          actionCol,
        ]
      }
      return [
        statusCol,
        { title: '区域', dataIndex: 'areaName', align: 'center', ellipsis: true },
        { title: '楼栋', dataIndex: 'buildingName', width: 80, align: 'center' },
        { title: '宿舍', dataIndex: 'roomName', width: 100, align: 'center' },
        { title: '公司', dataIndex: 'company', width: 130, align: 'center', ellipsis: true },
        { title: '部门', dataIndex: 'deptPath', width: 110, align: 'center', ellipsis: true },
        { title: '工号', dataIndex: 'empNo', width: 80, align: 'center' },
        { title: '姓名', dataIndex: 'empName', width: 80, align: 'center' },
        { title: '性别', dataIndex: 'sex', width: 60, align: 'center' },
        { title: '身份证', dataIndex: 'idCard', width: 160, align: 'center', ellipsis: true },
        { title: '手机号码', dataIndex: 'phone', width: 130, align: 'center' },
        {
          title: '人员类型',
          dataIndex: 'personType_dictText',
          width: 100,
          align: 'center',
        },
        { title: '入住日期', dataIndex: 'checkinDate', width: 110, align: 'center', customRender: (t) => fmtDate(t) },

        {
          title: '预计退宿日期',
          dataIndex: 'expectedLeaveDate',
          width: 120,
          align: 'center',
          customRender: (t) => fmtDate(t),
        },
        { title: '申请时间', dataIndex: 'applyTime', width: 150, align: 'center', customRender: (t) => fmtTime(t) },
        { title: '退宿原因', dataIndex: 'checkoutReason', width: 110, align: 'center', ellipsis: true },
        actionCol,
      ]
    },
    tableScrollX() {
      return this.columns.reduce((sum, c) => sum + (Number(c.width) || 120), 0)
    },
  },
  created() {
    // 从 sessionStorage 读取工作台跳转传入的 tab（避免带 query 导致重复 tab）
    const wbTab = sessionStorage.getItem('wb_target_tab_' + this.$route.path)
    if (wbTab) {
      const validTab = TAB_LIST.find(t => t.key === String(wbTab))
      if (validTab) {
        this.activeTab = String(wbTab)
      }
      sessionStorage.removeItem('wb_target_tab_' + this.$route.path)
    }
    this.loadAreas()
    this.loadOrgTree()
    this.loadData(1)
    this.loadStatusCount()
    this.loadDicts()
  },
  watch: {
    '$route.query.tab'(newVal) {
      if (newVal !== undefined && newVal !== null) {
        const validTab = TAB_LIST.find(t => t.key === String(newVal))
        if (validTab && this.activeTab !== String(newVal)) {
          this.activeTab = String(newVal)
          this.activeStatus = 'all'
          this.queryParam = { ...defQuery }
          this.dateRanges = {}
          this.loadData(1)
          this.loadStatusCount()
        }
      }
    }
  },
  activated() {
    // 从工作台跳转时，sessionStorage 中可能有待切换的 tab（页面被 keep-alive 缓存时 created 不会再次触发）
    const wbTab = sessionStorage.getItem('wb_target_tab_' + this.$route.path)
    if (wbTab) {
      const validTab = TAB_LIST.find(t => t.key === String(wbTab))
      if (validTab && this.activeTab !== String(wbTab)) {
        this.activeTab = String(wbTab)
        this.activeStatus = 'all'
        this.queryParam = { ...defQuery }
        this.dateRanges = {}
        this.loadData(1)
        this.loadStatusCount()
      }
      sessionStorage.removeItem('wb_target_tab_' + this.$route.path)
    }
  },
  methods: {
    // ============ 数据加载 ============
    async loadDicts() {
      const res = await initDictOptions('hrm_sqgl_apply_dorm_type')
      this.dormTypeDict = res.success ? res.result || [] : []
    },
    loadData(arg) {
      if (arg === 1) this.ipagination.current = 1
      const params = this.buildParams()
      this.loading = true
      getAction('/sqgl/hrmSqglApply/list', params)
        .then((res) => {
          if (res.success) {
            const result = res.result || {}
            this.dataSource = result.records || result || []
            this.ipagination.total = result.total || 0
          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    loadStatusCount() {
      getAction('/sqgl/hrmSqglApply/statusCount', { applyType: this.activeTab }).then((res) => {
        if (res.success) {
          this.statusCount = res.result || {}
        }
      })
    },
    loadAreas() {
      getAction('/sqgl/hrmSqglArea/listWithStats').then((res) => {
        if (res.success) this.areaOptions = res.result || []
      })
    },
    loadOrgTree() {
      this.orgLoading = true
      getAction('/org/hrmOrg/loadTreeRoot', { pid: 0 })
        .then((res) => {
          const roots = res && res.success && Array.isArray(res.result) ? res.result : []
          this.companyList = roots.length && Array.isArray(roots[0].children) ? roots[0].children : []
        })
        .catch(() => {
          this.companyList = []
          this.$message.error('组织架构加载失败，请稍后重试')
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
      this.searchQuery()
    },
    handleQueryDeptChange(value) {
      const path = Array.isArray(value) ? value.map((item) => String(item)) : []
      this.queryDeptPath = path
      this.queryParam.dept = path[path.length - 1] || ''
      this.searchQuery()
    },
    buildParams() {
      const p = Object.assign({}, this.queryParam)
      p.applyType = this.activeTab
      if (this.activeStatus && this.activeStatus !== 'all') p.status = this.activeStatus
      p.pageNo = this.ipagination.current
      p.pageSize = this.ipagination.pageSize
      const dr = this.dateRanges || {}
      if (dr.applyTime && dr.applyTime.length === 2) {
        p.applyTime_begin = dr.applyTime[0]
        p.applyTime_end = dr.applyTime[1]
      }
      if (dr.checkinDate && dr.checkinDate.length === 2) {
        p.checkinDate_begin = dr.checkinDate[0]
        p.checkinDate_end = dr.checkinDate[1]
      }
      if (dr.tsDate && dr.tsDate.length === 2) {
        p.tsDate_begin = dr.tsDate[0]
        p.tsDate_end = dr.tsDate[1]
      }
      if (dr.expectedLeaveDate && dr.expectedLeaveDate.length === 2) {
        p.expectedLeaveDate_begin = dr.expectedLeaveDate[0]
        p.expectedLeaveDate_end = dr.expectedLeaveDate[1]
      }
      Object.keys(p).forEach((k) => {
        if (p[k] === undefined || p[k] === null || p[k] === '') delete p[k]
      })
      return p
    },
    // ============ 切换 ============
    onTabChange(key) {
      this.activeTab = key
      this.activeStatus = 'all'
      this.queryParam = { ...defQuery }
      this.dateRanges = {}
      this.loadData(1)
      this.loadStatusCount()
      const url = new URL(window.location.href)
      url.searchParams.set('tab', key)
      window.history.replaceState({}, '', url.toString())
    },
    onStatusChange(key) {
      this.activeStatus = key
      this.loadData(1)
    },
    handleTableChange(pagination, filters, sorter) {
      if (sorter && Object.keys(sorter).length > 0) {
        // 暂不支持排序
      }
      this.ipagination = pagination
      this.loadData()
    },
    searchQuery() {
      this.loadData(1)
      this.loadStatusCount()
    },
    searchReset() {
      this.queryParam = { ...defQuery }
      this.dateRanges = {}
      this.queryDeptPath = []
      this.queryDeptOptions = []
      this.activeStatus = 'all'
      this.loadData(1)
      this.loadStatusCount()
    },
    // ============ 状态显示 ============
    statusCls(code) {
      return STATUS_CLS[code] || ''
    },
    joinDorm(area, bld, room) {
      const parts = [area, bld, room].filter(Boolean)
      return parts.length ? parts.join(' / ') : '—'
    },
    // ============ 申请 ============
    handleApply() {
      this.$refs.applyModal.open(this.activeTab)
    },
    onApplyOk() {
      this.loadData(1)
      this.loadStatusCount()
    },
    // ============ 详情 ============
    handleDetail(record) {
      this.$refs.detailModal.open(record.id, this.activeTab)
    },
    // ============ 撤回 ============
    /** 仅审批中且由当前登录人本人发起的申请可撤回 */
    canCancel(record) {
      return record.status === '0' && !!this.currentUserName && record.empName === this.currentUserName
    },
    handleCancel(record) {
      const that = this
      this.$confirm({
        title: '撤回确认',
        content: '是否确认撤回该申请？',
        okText: '确认撤回',
        cancelText: '再想想',
        onOk() {
          return putAction('/sqgl/hrmSqglApply/cancel?id=' + encodeURIComponent(record.id), {}).then((res) => {
            if (res.success) {
              that.$message.success(res.message || '撤回成功！')
              that.loadData()
              that.loadStatusCount()
            } else {
              that.$message.warning(res.message || '撤回失败')
            }
          })
        },
      })
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
@sqgl-red: #ef4444;
@sqgl-gradient-blue: linear-gradient(135deg, #2d78ff 0%, #4a9eff 100%);
@sqgl-shadow-card: 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);

.sqgl-allot-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 14px 20px;
  gap: 12px;
  background: @sqgl-background;
  overflow-y: auto;
}

/* ===== 顶部 TAB ===== */
.sqgl-top-tabs {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.sqgl-top-tab {
  flex: 1;
  padding: 14px 10px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: @sqgl-muted-foreground;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid @sqgl-border;
  background: #fff;
  text-align: center;
  box-shadow: @sqgl-shadow-card;

  &:hover {
    color: @sqgl-foreground;
    border-color: rgba(@sqgl-primary-rgb, 0.35);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(45, 120, 255, 0.1);
  }

  &.active {
    color: #fff;
    background: @sqgl-gradient-blue;
    border-color: transparent;
    font-weight: 600;
    box-shadow: 0 6px 18px rgba(45, 120, 255, 0.28);
  }
}

/* ===== 筛选栏 ===== */
.sqgl-filter-bar {
  background: #fff;
  border: 1px solid @sqgl-border;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  box-shadow: @sqgl-shadow-card;
  flex-shrink: 0;
  overflow-x: auto;
}

.sqgl-filter-row {
  // flex: 1;
  display: flex;
  align-items: center;
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

  /deep/ .ant-input,
  /deep/ .ant-select {
    width: 150px;
    height: 32px;
  }

  /deep/ .ant-calendar-picker {
    width: 200px;
    height: 32px;

    .ant-calendar-picker-input {
      width: 100%;
    }
  }

  /deep/ .ant-input {
    height: 32px;
  }
}

.sqgl-filter-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* ===== 状态 TAB 切 ===== */
.sqgl-status-pills {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.sqgl-status-pill {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  color: @sqgl-muted-foreground;
  transition: all 0.2s;
  border: 1px solid @sqgl-border;
  background: #fff;
  display: inline-flex;
  align-items: center;
  gap: 6px;

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

    .sqgl-pill-count {
      background: rgba(255, 255, 255, 0.25);
      color: #fff;
    }
  }
}

.sqgl-pill-count {
  font-size: 11px;
  background: rgba(@sqgl-primary-rgb, 0.1);
  color: @sqgl-primary;
  padding: 1px 7px;
  border-radius: 999px;
  font-weight: 600;
}

/* ===== 表格卡 ===== */
.sqgl-table-card {
  flex: 1;
  min-height: 0;
  background: #fff;
  border: 1px solid @sqgl-border;
  border-radius: 10px;
  box-shadow: @sqgl-shadow-card;
  position: relative;
  display: flex;
  flex-direction: column;

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

  /deep/ .ant-spin-nested-loading,
  /deep/ .ant-spin-container {
    height: 100%;
  }

  /deep/ .ant-table {
    border-radius: 0;
    background: #fff;
  }

  /deep/ .ant-table-thead>tr>th {
    background: #eef4ff;
    color: @sqgl-primary;
    font-weight: 600;
    font-size: 12px;
  }

  /deep/ .ant-table-tbody>tr>td {
    font-size: 13px;
  }
}

/* ===== 状态标签 ===== */
.sqgl-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: currentColor;
  }

  &.pending {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
  }

  &.approved,
  &.handled {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  }

  &.cancelled,
  &.retire {
    background: rgba(100, 116, 139, 0.1);
    color: @sqgl-muted-foreground;
  }

  &.rejected {
    background: rgba(239, 68, 68, 0.08);
    color: #dc2626;
  }
}

/* ===== 操作按钮 ===== */
.sqgl-action-cell {
  display: flex;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
}

.sqgl-btn-icon {
  height: 28px;
  line-height: 26px;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid @sqgl-border;
  background: #fff;
  color: @sqgl-muted-foreground;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(@sqgl-primary-rgb, 0.35);
    color: @sqgl-primary;
    background: rgba(@sqgl-primary-rgb, 0.05);
    box-shadow: 0 4px 10px rgba(45, 120, 255, 0.12);
  }

  &.ghost {
    color: @sqgl-primary;
    border-color: rgba(@sqgl-primary-rgb, 0.28);
    background: rgba(@sqgl-primary-rgb, 0.06);
  }

  &.danger {
    color: @sqgl-red;
    border-color: rgba(239, 68, 68, 0.28);
    background: rgba(239, 68, 68, 0.05);

    &:hover {
      border-color: rgba(239, 68, 68, 0.5);
      color: #dc2626;
      background: rgba(239, 68, 68, 0.08);
      box-shadow: 0 4px 10px rgba(239, 68, 68, 0.12);
    }
  }
}
</style>
