<template>
  <div class="sqgl-inpsect-page">
    <!-- 顶部 TAB -->
    <div class="sqgl-top-tabs">
      <div
        v-for="tab in tabList"
        :key="tab.key"
        :class="['sqgl-top-tab', activeTab === tab.key ? 'active' : '']"
        @click="onTabChange(tab.key)"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="sqgl-filter-bar">
      <div class="sqgl-filter-row">
        <div class="sqgl-filter-item" v-for="item in filterItems" :key="item.key">
          <span class="sqgl-filter-label">{{ item.label }}</span>
          <div class="sqgl-filter-ctl">
            <a-input
              v-if="item.type === 'search' || item.type === 'input'"
              v-model.trim="queryParam[item.key]"
              :placeholder="item.placeholder || '请输入'"
              allowClear
              @pressEnter="searchQuery"
            >
              <a-icon v-if="item.type === 'search'" slot="prefix" type="search" />
            </a-input>
            <a-select
              v-else-if="item.type === 'select'"
              v-model="queryParam[item.key]"
              :loading="item.key === 'company' ? orgLoading : false"
              showSearch
              optionFilterProp="children"
              placeholder="全部"
              allowClear
              @change="item.key === 'company' ? handleQueryCompanyChange($event) : searchQuery()"
            >
              <a-select-option v-for="o in item.options" :key="o.id" :value="o.name">{{ o.name }}</a-select-option>
            </a-select>
            <a-cascader
              v-else-if="item.type === 'cascader'"
              v-model="queryDeptPath"
              :options="item.options"
              :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
              changeOnSelect
              allowClear
              placeholder="全部"
              @change="handleQueryDeptChange"
            />
            <j-dict-select-tag
              v-else-if="item.type === 'dict'"
              type="list"
              v-model="queryParam[item.key]"
              :dictCode="item.dictCode"
              placeholder="全部"
              @change="searchQuery"
            />
            <a-range-picker
              v-else-if="item.type === 'dateRange'"
              v-model="dateRanges[item.key]"
              valueFormat="YYYY-MM-DD"
              @change="searchQuery"
            />
          </div>
        </div>
      </div>
      <div class="sqgl-filter-actions">
        <a-button type="primary" @click="searchQuery"><a-icon type="search" />搜索</a-button>
        <a-button @click="searchReset"><a-icon type="undo" />重置</a-button>
        <a-button v-if="activeTab === 'special'" type="primary" @click="handleResidentAdd">
          <a-icon type="plus" />办理客房入住
        </a-button>
        <a-button v-if="activeTab === 'special'" @click="openFieldConfig"> <a-icon type="setting" />字段配置 </a-button>
      </div>
    </div>

    <!-- 状态 TAB 切 -->
    <div class="sqgl-status-pills">
      <div
        v-for="p in statusPills"
        :key="p.key"
        :class="['sqgl-status-pill', activeStatus === p.key ? 'active' : '']"
        @click="onStatusChange(p.key)"
      >
        {{ p.label }}
        <span class="sqgl-pill-count">{{ statusCount[p.key] || 0 }}</span>
      </div>
    </div>

    <!-- 列表 -->
    <div class="sqgl-table-card">
      <a-table
        ref="table"
        size="middle"
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :loading="loading"
        :pagination="ipagination"
        :scroll="{ x: true }"
        @change="handleTableChange"
      >
        <template slot="status" slot-scope="text, record">
          <span :class="['sqgl-status-tag', statusCls(text)]">
            <span class="dot"></span>{{ statusLabel(text, record) }}
          </span>
        </template>
        <template slot="rzStatus" slot-scope="text, record">
          <span class="sqgl-status-tag" :class="`${text === '1' ? 'handled' : 'cancelled'}`">
            <span class="dot"></span>{{ record.rzStatus_dictText }}
          </span>
        </template>
        <template slot="action" slot-scope="text, record">
          <div class="sqgl-action-cell">
            <button v-if="canAudit(record)" class="sqgl-btn-icon primary" @click="handleAudit(record)">审核</button>
            <button v-if="canHandleCheckin(record)" class="sqgl-btn-icon primary" @click="handleCheckin(record)">
              办理入住
            </button>
            <button v-if="canHandleChangeRoom(record)" class="sqgl-btn-icon primary" @click="handleChangeRoom(record)">
              办理调宿
            </button>
            <button v-if="canHandleCheckout(record)" class="sqgl-btn-icon primary" @click="handleCheckout(record)">
              办理退宿
            </button>
            <button
              v-if="canResidentChangeRoom(record)"
              class="sqgl-btn-icon primary"
              @click="handleResidentChangeRoom(record)"
            >
              调宿
            </button>
            <button
              v-if="canResidentCheckout(record)"
              class="sqgl-btn-icon danger"
              @click="handleResidentCheckout(record)"
            >
              退宿
            </button>
            <button v-if="canResidentEdit(record)" class="sqgl-btn-icon ghost" @click="handleResidentEdit(record)">
              编辑
            </button>
            <button class="sqgl-btn-icon ghost" @click="handleDetail(record)">详情</button>
          </div>
        </template>
      </a-table>
    </div>

    <!-- 审核弹窗 -->
    <dorm-audit-modal ref="auditModal" @ok="onActionOk" />
    <!-- 办理入住弹窗（含特办入住/编辑） -->
    <dorm-handle-checkin-modal ref="checkinModal" @ok="onActionOk" />
    <!-- 办理调宿弹窗（含特办调宿） -->
    <dorm-handle-change-room-modal ref="changeRoomModal" @ok="onActionOk" />
    <!-- 办理退宿弹窗 -->
    <dorm-handle-checkout-modal ref="checkoutModal" @ok="onActionOk" />
    <!-- 特办退宿弹窗 -->
    <dorm-resident-checkout-modal ref="residentCheckoutModal" @ok="onActionOk" />
    <!-- 详情弹窗 -->
    <dorm-allot-detail-modal ref="detailModal" />

    <!-- 字段配置弹窗 -->
    <a-modal
      title="字段配置"
      :visible="fieldConfigVisible"
      :width="420"
      :destroyOnClose="true"
      :maskClosable="false"
      centered
      @cancel="cancelFieldConfig"
    >
      <div style="padding: 4px 0 8px; color: #64748b; font-size: 12.5px">
        勾选需要在住宿列表中展示的列（状态和操作列始终显示）：
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; max-height: 360px; overflow-y: auto">
        <div
          v-for="col in allSpecialColumnDefs"
          :key="col.key"
          style="display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 6px; cursor: pointer"
          @click="onFieldCheckChange(col.title, !tempVisibleColumns.includes(col.title))"
        >
          <a-checkbox
            :checked="tempVisibleColumns.includes(col.title)"
            @click.stop
            @change="(e) => onFieldCheckChange(col.title, e.target.checked)"
          />
          <span style="font-size: 13px; user-select: none">{{ col.title }}</span>
        </div>
      </div>
      <template slot="footer">
        <a-button @click="cancelFieldConfig">取消</a-button>
        <a-button type="primary" @click="saveFieldConfig">应用</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
import moment from 'moment'
import { getAction } from '@/api/manage'
import { initDictOptions, filterDictText } from '@/components/dict/JDictSelectUtil'
import DormAuditModal from './modules/DormAuditModal'
import DormHandleCheckinModal from './modules/DormHandleCheckinModal'
import DormHandleChangeRoomModal from './modules/DormHandleChangeRoomModal'
import DormHandleCheckoutModal from './modules/DormHandleCheckoutModal'
import DormResidentCheckoutModal from './modules/DormResidentCheckoutModal'
import DormAllotDetailModal from './modules/DormAllotDetailModal'

const defQuery = {
  column: 'createTime',
  order: 'desc',
}

const TAB_LIST = [
  { key: '0', label: '入住审核' },
  { key: '1', label: '调宿审核' },
  { key: '2', label: '退宿审核' },
  { key: 'special', label: '住宿特办' },
]

const STATUS_PILLS = [
  { key: 'all', label: '全部' },
  { key: '0', label: '审批中' },
  { key: '1', label: '已通过' },
  { key: '2', label: '已办理' },
  { key: '4', label: '不通过' },
  { key: '3', label: '已撤回' },
]

const SPECIAL_STATUS_PILLS = [
  { key: 'all', label: '全部' },
  { key: '1', label: '已入住' },
  { key: '2', label: '已调出' },
  { key: '0', label: '已退宿' },
]

const STATUS_LABEL = { 0: '审批中', 1: '已通过', 2: '已办理', 3: '已撤回', 4: '不通过', 5: '已退宿' }
const STATUS_CLS = { 0: 'pending', 1: 'approved', 2: 'handled', 3: 'cancelled', 4: 'rejected', 5: 'checkout' }
const YES_NO_MAP = { 1: '是', 0: '否' }

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

export default {
  name: 'DormInpsectList',
  components: {
    DormAuditModal,
    DormHandleCheckinModal,
    DormHandleChangeRoomModal,
    DormHandleCheckoutModal,
    DormResidentCheckoutModal,
    DormAllotDetailModal,
  },
  data() {
    return {
      tabList: TAB_LIST,
      activeTab: '0',
      activeStatus: 'all',
      queryParam: { ...defQuery },
      dateRanges: {},
      dataSource: [],
      loading: false,
      statusCount: {},
      areaOptions: [],
      companyList: [],
      dormTypeDict: [],
      personTypeDict: [],
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
      // 字段配置
      fieldConfigVisible: false,
      specialVisibleColumns: [],
      tempVisibleColumns: [],
      allSpecialColumnDefs: [
        { title: '宿舍号', key: 'roomName' },
        { title: '工号', key: 'empNo' },
        { title: '姓名', key: 'empName' },
        { title: '性别', key: 'sex' },
        { title: '所属公司', key: 'company' },
        { title: '部门', key: 'deptPath' },
        { title: '宿舍类型', key: 'dormType' },
        { title: '内部员工', key: 'internalEmployee' },
        { title: '人员类型', key: 'personType' },
        { title: '身份证', key: 'idCard' },
        { title: '手机号码', key: 'phone' },
        { title: '办理网格', key: 'gridInfo' },
        { title: '入住日期', key: 'checkinDate' },
        { title: '调宿入住日期', key: 'tsDate' },
        { title: '预计离开', key: 'expectedLeaveDate' },
        { title: '退宿日期', key: 'checkoutDate' },
        { title: '退宿原因', key: 'checkoutReason' },
        { title: '备注', key: 'remark' },
      ],
    }
  },
  computed: {
    statusPills() {
      return this.activeTab === 'special' ? SPECIAL_STATUS_PILLS : STATUS_PILLS
    },
    filterItems() {
      const items = [{ key: 'searchKeyword', label: '工号/姓名', type: 'search', placeholder: '工号 / 姓名' }]
      if (this.activeTab === '0') {
        items.push(
          { key: 'areaName', label: '入住区域', type: 'select', options: this.areaOptions },
          { key: 'company', label: '公司', type: 'select', options: this.companyList },
          { key: 'dept', label: '部门', type: 'cascader', options: this.queryDeptOptions },
          { key: 'dormType', label: '宿舍类型', type: 'dict', dictCode: 'hrm_sqgl_apply_dorm_type' },
          { key: 'personType', label: '人员类型', type: 'dict', dictCode: 'hrm_sqgl_apply_person_type' },
          // { key: 'applyTime', label: '申请日期', type: 'dateRange' },
          { key: 'checkinDate', label: '入住日期', type: 'dateRange' }
        )
      } else if (this.activeTab === '1') {
        items.push(
          { key: 'areaName', label: '入住区域', type: 'select', options: this.areaOptions },
          { key: 'company', label: '公司', type: 'select', options: this.companyList },
          { key: 'dept', label: '部门', type: 'cascader', options: this.queryDeptOptions },
          { key: 'personType', label: '人员类型', type: 'dict', dictCode: 'hrm_sqgl_apply_person_type' },
          // { key: 'oldDorm', label: '原宿舍', type: 'input' },
          // { key: 'newDorm', label: '调宿后宿舍', type: 'input' },
          { key: 'tsDate', label: '调宿入住日期', type: 'dateRange' },
          // { key: 'applyTime', label: '申请日期', type: 'dateRange' }
        )
      } else if (this.activeTab === '2') {
        items.push(
          { key: 'areaName', label: '入住区域', type: 'select', options: this.areaOptions },
          { key: 'company', label: '公司', type: 'select', options: this.companyList },
          { key: 'dept', label: '部门', type: 'cascader', options: this.queryDeptOptions },
          { key: 'personType', label: '人员类型', type: 'dict', dictCode: 'hrm_sqgl_apply_person_type' },
          { key: 'roomName', label: '宿舍', type: 'input' },
          // { key: 'newDorm', label: '调宿后宿舍', type: 'input' },
          // { key: 'checkinDate', label: '入住日期', type: 'dateRange' },
          { key: 'expectedLeaveDate', label: '预计退宿日期', type: 'dateRange' },
          // { key: 'applyTime', label: '申请日期', type: 'dateRange' }
        )
      } else {
        items.unshift({ key: 'ssh', label: '宿舍号', type: 'input' })
        // 住宿特办
        items.push(
          { key: 'areaName', label: '入住区域', type: 'select', options: this.areaOptions },
          { key: 'company', label: '公司', type: 'select', options: this.companyList },
          { key: 'deptPath', label: '部门', type: 'cascader', options: this.queryDeptOptions },
          { key: 'personType', label: '人员类型', type: 'dict', dictCode: 'hrm_sqgl_apply_person_type' },
          { key: 'checkinDate', label: '入住日期', type: 'dateRange' }
          // { key: 'checkoutDate', label: '预计退宿日期', type: 'dateRange' }
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
        // fixed: 'left',
        scopedSlots: { customRender: 'status' },
      }
      const actionCol = {
        title: '操作',
        dataIndex: 'action',
        width: this.activeTab === 'special' ? 240 : 160,
        align: 'center',
        fixed: 'right',
        scopedSlots: { customRender: 'action' },
      }
      if (this.activeTab === '0') {
        return [
          statusCol,
          { title: '入住区域', dataIndex: 'areaName', width: 130, align: 'center', ellipsis: true },
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
      } else if (this.activeTab === '1') {
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
      } else if (this.activeTab === '2') {
        return [
          statusCol,
          { title: '区域', dataIndex: 'areaName', width: 130, align: 'center', ellipsis: true },
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
            width: 110,
            align: 'center',
            customRender: (t) => fmtDate(t),
          },
          { title: '申请时间', dataIndex: 'applyTime', width: 150, align: 'center', customRender: (t) => fmtTime(t) },
          {
            title: '退宿日期',
            dataIndex: 'checkoutDate',
            width: 110,
            align: 'center',
            customRender: (t) => fmtDate(t),
          },
          { title: '退宿原因', dataIndex: 'checkoutReason', width: 110, align: 'center', ellipsis: true },
          actionCol,
        ]
      } else {
        statusCol.dataIndex = 'rzStatus'
        statusCol.scopedSlots.customRender = 'rzStatus'
      }
      // 住宿特办
      const allSpecialCols = [
        {
          title: '宿舍号',
          dataIndex: 'roomName',
          align: 'center',
          customRender: (t, r) => this.joinDorm(r.areaName, r.buildingName, r.roomName),
        },
        { title: '工号', dataIndex: 'empNo', width: 80, align: 'center' },
        { title: '姓名', dataIndex: 'empName', width: 80, align: 'center' },
        { title: '性别', dataIndex: 'sex', width: 60, align: 'center' },
        { title: '所属公司', dataIndex: 'company', width: 130, align: 'center', ellipsis: true },
        { title: '部门', dataIndex: 'deptPath', width: 110, align: 'center', ellipsis: true },
        {
          title: '宿舍类型',
          dataIndex: 'dormType',
          width: 100,
          align: 'center',
          customRender: (t, r) => r.dormType_dictText || filterDictText(this.dormTypeDict, t) || '—',
        },
        {
          title: '内部员工',
          dataIndex: 'internalEmployee',
          width: 90,
          align: 'center',
          customRender: (t) => (t == 1 ? '是' : '否'),
        },
        {
          title: '人员类型',
          dataIndex: 'personType',
          width: 100,
          align: 'center',
          customRender: (t, r) => r.personType_dictText || filterDictText(this.personTypeDict, t) || '—',
        },
        { title: '身份证', dataIndex: 'idCard', width: 160, align: 'center', ellipsis: true },
        { title: '手机号码', dataIndex: 'phone', width: 130, align: 'center' },
        {
          title: '办理网格',
          dataIndex: 'gridInfo',
          width: 90,
          align: 'center',
          customRender: (t) => (t == 1 ? '是' : '否'),
        },
        { title: '入住日期', dataIndex: 'checkinDate', width: 110, align: 'center', customRender: (t) => fmtDate(t) },
        { title: '调宿入住日期', dataIndex: 'tsDate', width: 120, align: 'center', customRender: (t) => fmtDate(t) },
        {
          title: '预计离开',
          dataIndex: 'expectedLeaveDate',
          width: 120,
          align: 'center',
          customRender: (t) => fmtDate(t),
        },
        { title: '退宿日期', dataIndex: 'checkoutDate', width: 150, align: 'center', customRender: (t) => fmtDate(t) },
        { title: '退宿原因', dataIndex: 'checkoutReason', width: 110, align: 'center', ellipsis: true },
        { title: '备注', dataIndex: 'remark', width: 120, align: 'center', ellipsis: true },
      ]
      const visible = this.specialVisibleColumns.length
        ? this.specialVisibleColumns
        : allSpecialCols.map((c) => c.title)
      const filtered = allSpecialCols.filter((c) => visible.includes(c.title))
      return [statusCol, ...filtered, actionCol]
    },
  },
  created() {
    this.loadFieldConfig()
    this.loadAreas()
    this.loadOrgTree()
    this.loadData(1)
    this.loadStatusCount()
    this.loadDicts()
  },
  methods: {
    // ============ 数据加载 ============
    async loadDicts() {
      const [dormRes, personRes] = await Promise.all([
        initDictOptions('hrm_sqgl_apply_dorm_type'),
        initDictOptions('hrm_sqgl_apply_person_type'),
      ])
      this.dormTypeDict = dormRes.success ? dormRes.result || [] : []
      this.personTypeDict = personRes.success ? personRes.result || [] : []
    },
    loadData(arg) {
      if (arg === 1) this.ipagination.current = 1
      const params = this.buildParams()
      this.loading = true
      const url = this.activeTab === 'special' ? '/sqgl/approval/resident/list' : '/sqgl/hrmSqglApply/list'
      getAction(url, params)
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
      if (this.activeTab === 'special') {
        getAction('/sqgl/approval/resident/statusCount').then((res) => {
          if (res.success) {
            const count = res.result || {}
            this.statusCount.all = count.all || 0
            this.statusCount['1'] = count.yrz || 0
            this.statusCount['0'] = count.checkedOut || 0
            this.statusCount['2'] = count.ytc || 0
          }
        })
        return
      }
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
      if (this.activeTab !== 'special') p.applyType = this.activeTab
      else {
        // 特办接口不支持 column/order 排序参数
        delete p.column
        delete p.order
      }
      if (this.activeStatus && this.activeStatus !== 'all') {
        p[this.activeTab === 'special' ? 'rzStatus' : 'status'] = this.activeStatus
      }
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
      this.activeStatus = key === 'special' ? '1' : 'all'
      this.queryParam = { ...defQuery }
      this.dateRanges = {}
      this.queryDeptPath = []
      this.queryDeptOptions = []
      this.loadData(1)
      this.loadStatusCount()
    },
    onStatusChange(key) {
      this.activeStatus = key
      this.loadData(1)
    },
    handleTableChange(pagination) {
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
    statusLabel(code, record) {
      if (record && record.statusLabel) return record.statusLabel
      if (this.activeTab === 'special') {
        return code === '2' ? '已入住' : code === '5' ? '已退宿' : STATUS_LABEL[code] || code || '—'
      }
      return STATUS_LABEL[code] || code || '—'
    },
    statusCls(code) {
      if (this.activeTab === 'special' && code === '5') return 'cancelled'
      return STATUS_CLS[code] || ''
    },
    joinDorm(area, bld, room) {
      const parts = [area, bld, room].filter(Boolean)
      return parts.length ? parts.join(' / ') : '—'
    },
    // ============ 操作按钮可见性 ============
    canAudit(record) {
      return this.activeTab !== 'special' && record.status === '0' && record.brSpStatus == 1
    },
    canHandleCheckin(record) {
      return this.activeTab === '0' && record.status === '1'
    },
    canHandleChangeRoom(record) {
      return this.activeTab === '1' && record.status === '1'
    },
    canHandleCheckout(record) {
      return this.activeTab === '2' && record.status === '1'
    },
    canResidentChangeRoom(record) {
      return this.activeTab === 'special' && record.rzStatus === '1'
    },
    canResidentCheckout(record) {
      return this.activeTab === 'special' && record.rzStatus === '1'
    },
    canResidentEdit(record) {
      return this.activeTab === 'special' && record.rzStatus === '1'
    },
    // ============ 操作行为 ============
    onActionOk() {
      this.loadData()
      this.loadStatusCount()
    },
    handleDetail(record) {
      this.$refs.detailModal.open(record.id, this.activeTab === 'special' ? 'special' : this.activeTab)
    },
    handleAudit(record) {
      this.$refs.auditModal.open(record.id, this.activeTab)
    },
    handleCheckin(record) {
      this.$refs.checkinModal.open('handleCheckin', record)
    },
    handleChangeRoom(record) {
      this.$refs.changeRoomModal.open('handleChangeRoom', record)
    },
    handleCheckout(record) {
      this.$refs.checkoutModal.open(record)
    },
    handleResidentAdd() {
      this.$refs.checkinModal.open('residentAdd', null)
    },
    handleResidentEdit(record) {
      this.$refs.checkinModal.open('residentEdit', record)
    },
    handleResidentChangeRoom(record) {
      this.$refs.changeRoomModal.open('residentChangeRoom', record)
    },
    handleResidentCheckout(record) {
      this.$refs.residentCheckoutModal.open(record)
    },
    // ============ 字段配置 ============
    loadFieldConfig() {
      try {
        const saved = localStorage.getItem('dorm_special_columns_config')
        if (saved) {
          const arr = JSON.parse(saved)
          if (Array.isArray(arr) && arr.length) {
            this.specialVisibleColumns = arr
            return
          }
        }
      } catch (e) {
        // ignore
      }
      this.specialVisibleColumns = this.allSpecialColumnDefs.map((c) => c.title)
    },
    openFieldConfig() {
      this.tempVisibleColumns = [...this.specialVisibleColumns]
      this.fieldConfigVisible = true
    },
    cancelFieldConfig() {
      this.fieldConfigVisible = false
    },
    onFieldCheckChange(title, checked) {
      if (checked) {
        if (!this.tempVisibleColumns.includes(title)) {
          this.tempVisibleColumns.push(title)
        }
      } else {
        this.tempVisibleColumns = this.tempVisibleColumns.filter((t) => t !== title)
      }
    },
    saveFieldConfig() {
      this.specialVisibleColumns = [...this.tempVisibleColumns]
      localStorage.setItem('dorm_special_columns_config', JSON.stringify(this.specialVisibleColumns))
      this.fieldConfigVisible = false
      this.$message.success('字段配置已更新')
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

.sqgl-inpsect-page {
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
    width: 194px;
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
  /deep/ .ant-table-thead > tr > th {
    background: #eef4ff;
    color: @sqgl-primary;
    font-weight: 600;
    font-size: 12px;
  }
  /deep/ .ant-table-tbody > tr > td {
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
  &.cancelled {
    background: rgba(100, 116, 139, 0.1);
    color: @sqgl-muted-foreground;
  }
  &.rejected {
    background: rgba(239, 68, 68, 0.08);
    color: #dc2626;
  }
  &.checkout {
    background: rgba(100, 116, 139, 0.12);
    color: #475569;
  }
}

/* ===== 操作按钮 ===== */
.sqgl-action-cell {
  display: flex;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  flex-wrap: wrap;
}
.sqgl-btn-icon {
  height: 28px;
  line-height: 26px;
  padding: 0 10px;
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
  &.primary {
    color: #fff;
    border-color: transparent;
    background: @sqgl-gradient-blue;
    &:hover {
      color: #fff;
      background: linear-gradient(135deg, #1f6dff 0%, #3a8eff 100%);
      box-shadow: 0 4px 12px rgba(45, 120, 255, 0.3);
    }
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
