<template>
  <div class="visitor-list-module">
    <!-- 筛选区 -->
    <div class="v-filter-bar">
      <div class="v-filter-row">
        <div class="v-filter-item">
          <span class="v-filter-item-label">访客姓名</span>
          <j-input v-model="queryParam.xm" allowClear placeholder="请输入访客姓名" @pressEnter="searchQuery" />
        </div>
        <div class="v-filter-item" v-if="type === 'temp'">
          <span class="v-filter-item-label">派遣公司</span>
          <j-dict-select-tag
            type="list"
            v-model="queryParam.pqgs"
            dictCode="hrm_fkzx_sq_pqgs"
            placeholder="请选择派遣公司"
          />
        </div>
        <div class="v-filter-item" v-if="type !== 'temp'">
          <span class="v-filter-item-label">来访区域</span>
          <j-dict-select-tag
            type="list"
            v-model="queryParam.lfqy"
            dictCode="hrm_fkzx_sq_lfqy"
            placeholder="请选择来访区域"
          />
        </div>
        <div class="v-filter-item" v-if="type !== 'temp'">
          <span class="v-filter-item-label">来访事由</span>
          <j-dict-select-tag
            type="list"
            v-model="queryParam.lfsy"
            dictCode="hrm_fkzx_sq_lfsy"
            placeholder="请选择来访事由"
          />
        </div>
        <div class="v-filter-item">
          <span class="v-filter-item-label">预计来访时间</span>
          <div class="v-date-range">
            <a-range-picker
              v-model="expectDateRange"
              format="YYYY-MM-DD"
              :placeholder="['开始日期', '结束日期']"
              style="width: 200px"
              @change="
                (value, dates) => handleRangeChange('expectDateRange', 'yjlfsj_begin', 'yjlfsj_end', value, dates)
              "
            />
          </div>
        </div>
        <div class="v-filter-item" style="flex-direction: row">
          <a-button type="primary" class="v-btn" @click="searchQuery"><a-icon type="search" />查询</a-button>
          <a-button class="v-btn v-btn-secondary" @click="searchReset"> <a-icon type="undo" />重置 </a-button>
          <!-- 劳动派遣审批：将勾选记录批量添加进入临时工（暂时注释）
          <a-button
            type="primary"
            v-if="type === 'temp' && state === 'approval'"
            class="v-btn v-btn-primary"
            icon="solution"
            @click="handleBatchAddTempWorker"
            >添加进入临时工</a-button
          >
          -->
        </div>
      </div>
      <div class="v-filter-bar-actions">
        <!-- 员工访客-申请页：申请按钮 -->
        <a-button
          v-if="type === 'employee' && state === 'apply'"
          class="v-btn v-btn-primary"
          icon="plus"
          @click="handleAdd"
          >申请访客</a-button
        >
        <!-- 访客自主登记-二维码按钮 -->
        <a-button
          v-if="type === 'selfRegister' && state === 'apply'"
          class="v-btn v-btn-primary"
          icon="qrcode"
          @click="openQrModal('visitor')"
          >自助登记二维码</a-button
        >
        <!-- 劳动派遣登记-二维码按钮 -->
        <a-button
          v-if="type === 'temp' && state === 'apply'"
          class="v-btn v-btn-primary"
          icon="qrcode"
          @click="openQrModal('temp')"
          >劳动派遣二维码</a-button
        >
        <a-button
          v-if="state === 'approval' && queryParam.zt === '0'"
          class="v-btn v-btn-primary"
          @click="handleBatchApprove"
          >批量通过</a-button
        >
        <a-button
          v-if="state === 'approval' && queryParam.zt === '0'"
          class="v-btn v-btn-secondary"
          @click="handleBatchReject"
          >批量驳回</a-button
        >
        <a-button
          v-if="state === 'receive' && queryParam.zt === '1'"
          class="v-btn v-btn-primary"
          @click="handleBatchConfirmVisit"
          >批量确认来访</a-button
        >
      </div>
    </div>

    <!-- 状态筛选 - 胶囊样式 -->
    <div class="v-status-tabs">
      <div
        v-for="status in statusList"
        :key="status.key"
        :class="['v-status-tab', isStatusActive(status.key) ? 'active' : '']"
        @click="changeStatus(status.key)"
      >
        {{ status.label }}
        <span class="tab-count">{{ status.count }}</span>
      </div>
    </div>

    <!-- 表格卡片 -->
    <div class="v-content">
      <div class="v-data-card">
        <div class="v-scroll-lfqy">
          <a-table
            ref="table"
            size="middle"
            :bordered="false"
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :pagination="false"
            :loading="loading"
            :scroll="{ x: true, y: 400 }"
            @change="handleTableChange"
          >
            <!-- 状态列 -->
            <template slot="zt" slot-scope="text, record">
              <span :class="['v-status-tag', getDisplayStatusClass(record)]">
                <span class="dot"></span>
                {{ getDisplayStatusText(record) }}
              </span>
            </template>

            <!-- 操作列 -->
            <template slot="action" slot-scope="text, record">
              <div class="v-action-cell">
                <template v-if="state === 'apply'">
                  <button class="v-btn-icon info" @click="handleDetail(record)">详情</button>
                  <template v-if="record.zt === '0'">
                    <button class="v-btn-icon warn" @click="handleCancel(record)">撤回</button>
                  </template>
                </template>
                <template v-if="state === 'approval'">
                  <template v-if="record.zt === '0' && showAuditButton(record)">
                    <button class="v-btn-icon success" @click="handleReview(record)">审核</button>
                  </template>
                  <button class="v-btn-icon info" @click="handleDetail(record)">详情</button>
                </template>
                <template v-if="state === 'receive'">
                  <template v-if="record.zt === '1' && record.lfzt !== '1'">
                    <button class="v-btn-icon warn" @click="handleChangeReceiver(record)">修改接待人</button>
                    <button class="v-btn-icon success" @click="handleConfirmVisit(record)">确认来访</button>
                  </template>
                  <button class="v-btn-icon info" @click="handleDetail(record)">详情</button>
                </template>
              </div>
            </template>
          </a-table>
        </div>
        <!-- 分页 -->
        <div class="v-pagination" v-if="ipagination.total > 0">
          <a-pagination
            size="small"
            :current="ipagination.current"
            :pageSize="ipagination.pageSize"
            :total="ipagination.total"
            showSizeChanger
            showQuickJumper
            :pageSizeOptions="['10', '20', '30', '50']"
            @change="handlePageChange"
            @showSizeChange="handleSizeChange"
          />
        </div>
      </div>
    </div>

    <!-- 弹窗组件 -->
    <component :is="modalComponent" ref="modalForm" @ok="modalFormOk"></component>
    <employee-visitor-detail ref="detailModal"></employee-visitor-detail>
    <visitor-approval ref="approvalModal" :bus-type="approvalBusType" @ok="modalFormOk"></visitor-approval>
    <visitor-confirm-visit v-if="state === 'receive'" ref="confirmVisitModal" @ok="modalFormOk"></visitor-confirm-visit>
    <visitor-change-receiver
      v-if="state === 'receive'"
      ref="changeReceiverModal"
      @ok="modalFormOk"
    ></visitor-change-receiver>
    <add-temp-worker-modal
      v-if="type === 'temp' && state === 'approval'"
      ref="addTempWorkerModal"
      @ok="handleAddTempWorkerOk"
    ></add-temp-worker-modal>
    <self-register-qr-modal ref="qrModal" />
  </div>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { mixinDevice } from '@/utils/mixin'
import EmployeeVisitorModal from './EmployeeVisitorModal.vue'
import InviteVisitorModal from './InviteVisitorModal.vue'
import SelfRegisterModal from './SelfRegisterModal.vue'
import SelfRegisterQrModal from './SelfRegisterQrModal.vue'
import EmployeeVisitorDetail from './EmployeeVisitorDetail.vue'
import VisitorApproval from './VisitorApproval.vue'
import VisitorConfirmVisit from './VisitorConfirmVisit.vue'
import VisitorChangeReceiver from './VisitorChangeReceiver.vue'
import AddTempWorkerModal from './AddTempWorkerModal.vue'

// 各类型配置
var typeConfig = {
  employee: {
    description: '员工访客',
    lflx: '0',
    detailTitle: '员工访客详情',
    showCompanions: true,
    modalName: 'EmployeeVisitorModal',
  },
  selfRegister: {
    description: '访客自主登记',
    lflx: '1',
    detailTitle: '自助登记详情',
    showCompanions: true,
    modalName: 'SelfRegisterModal',
  },
  invite: {
    description: '邀约访客',
    lflx: '2,3',
    detailTitle: '邀约访客详情',
    showCompanions: false,
    modalName: 'InviteVisitorModal',
  },
  temp: {
    description: '劳动派遣登记',
    lflx: '4',
    detailTitle: '劳动派遣详情',
    showCompanions: false,
    modalName: 'SelfRegisterModal',
  },
}

var baseColumns = [
  {
    title: '序号',
    dataIndex: '',
    key: 'rowIndex',
    width: 80,
    align: 'center',
    customRender: function (t, r, index) {
      return parseInt(index) + 1
    },
  },
  {
    title: '状态',
    dataIndex: 'zt',
    key: 'zt',
    width: 100,
    align: 'center',
    scopedSlots: { customRender: 'zt' },
  },
  { title: '姓名', dataIndex: 'xm', key: 'xm', width: 120, align: 'center' },
  { title: '联系方式', dataIndex: 'lxfs', key: 'lxfs', width: 120, align: 'center' },
]

// 邀约访客没有车牌号列
var cphColumn = { title: '车牌号', dataIndex: 'cph', key: 'cph', width: 120, align: 'center' }
// 劳动派遣有身份证列
var sfzhColumn = { title: '身份证', dataIndex: 'sfzh', key: 'sfzh', width: 180, align: 'center' }
// 劳动派遣有派遣公司列
var pqgsColumn = { title: '派遣公司', dataIndex: 'pqgs_dictText', key: 'pqgs_dictText', width: 120, align: 'center' }

var commonColumns = [
  { title: '来访区域', dataIndex: 'lfqy_dictText', key: 'lfqy_dictText', width: 120, align: 'center' },
  {
    title: '来访事由',
    dataIndex: 'lfsy_dictText',
    key: 'lfsy_dictText',
    align: 'center',
    width: 160,
    ellipsis: true,
  },
  { title: '来访类型', dataIndex: 'lflx_dictText', key: 'lflx_dictText', width: 120, align: 'center' },
  { title: '预计来访时间', dataIndex: 'yjlfsj', key: 'yjlfsj', width: 150, align: 'center' },
  { title: '接待人', dataIndex: 'jdr', key: 'jdr', width: 120, align: 'center' },
]

// 劳动派遣专用列（无来访事由，有派遣公司）
var tempCommonColumns = [
  { title: '来访类型', dataIndex: 'lflx_dictText', key: 'lflx_dictText', width: 120, align: 'center' },
  { title: '派遣公司', dataIndex: 'pqgs_dictText', key: 'pqgs_dictText', width: 120, align: 'center' },
  { title: '预计来访时间', dataIndex: 'yjlfsj', key: 'yjlfsj', width: 150, align: 'center' },
  { title: '接待人', dataIndex: 'jdr', key: 'jdr', width: 120, align: 'center' },
]

// 邀约访客没有接待人联系方式列
var jdrLxfsColumn = { title: '接待人联系方式', dataIndex: 'jdrlxfs', key: 'jdrlxfs', width: 120, align: 'center' }

var actionColumn = {
  title: '操作',
  dataIndex: 'action',
  key: 'action',
  width: 168,
  align: 'center',
  fixed: 'right',
  scopedSlots: { customRender: 'action' },
}

// 接待页额外列
var confirmTimeColumn = { title: '来访确认时间', dataIndex: 'lfqrsj', key: 'lfqrsj', width: 150, align: 'center' }
var confirmerColumn = { title: '确认人', dataIndex: 'qrr', key: 'qrr', width: 100, align: 'center' }

function getColumns(type, state) {
  var cols = baseColumns.slice()
  if (type === 'temp') {
    // 劳动派遣：身份证 + 派遣公司专用列，无车牌号、无来访事由
    cols.push(sfzhColumn)
    cols = cols.concat(tempCommonColumns.slice())
    cols.push(jdrLxfsColumn)
  } else {
    if (type !== 'invite') {
      cols.push(cphColumn)
    }
    cols = cols.concat(commonColumns.slice())
    if (type !== 'invite') {
      cols.push(jdrLxfsColumn)
    }
  }
  cols.push({ title: '来访人数', dataIndex: 'lfrs', key: 'lfrs', align: 'center' })
  if (state === 'receive') {
    cols[cols.length - 1].width = 120
    cols.push(confirmTimeColumn)
    cols.push(confirmerColumn)
  }
  // 接待页操作列更宽
  var actionCol = Object.assign({}, actionColumn)
  if (state === 'receive') {
    actionCol.width = 220
  }
  cols.push(actionCol)
  return cols
}

export default {
  name: 'VisitorList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    EmployeeVisitorModal,
    InviteVisitorModal,
    SelfRegisterModal,
    SelfRegisterQrModal,
    EmployeeVisitorDetail,
    VisitorApproval,
    VisitorConfirmVisit,
    VisitorChangeReceiver,
    AddTempWorkerModal,
  },
  props: {
    // 类型: employee-员工访客, selfRegister-访客自主登记, invite-邀约访客
    type: {
      type: String,
      required: true,
      validator: function (value) {
        return ['employee', 'selfRegister', 'invite', 'temp'].includes(value)
      },
    },
    // 页面状态: apply-申请页, approval-审批页, receive-接待页
    state: {
      type: String,
      default: 'apply',
      validator: function (value) {
        return ['apply', 'approval', 'receive'].includes(value)
      },
    },
  },
  data: function () {
    var config = typeConfig[this.type]
    return {
      description: config.description,

      statusList: [],

      queryParam: {
        xm: '',
        lfqy: '',
        lfsy: '',
        yjlfsj_begin: '',
        yjlfsj_end: '',
        lflx: config.lflx,
        zt: '',
        lfzt: '',
        isMyReception: this.state === 'receive',
        pqgs: '',
      },
      expectDateRange: [],
      columns: getColumns(this.type, this.state),
      dataSource: [],

      url: {
        list: '/fkzx/hrmFkzxSq/list',
        delete: '/fkzx/hrmFkzxSq/delete',
        submit: '/fkzx/hrmFkzxSq/submit',
        cancel: '/fkzx/hrmFkzxSq/cancel',
        approve: '/fkzx/hrmFkzxSq/approve',
        reject: '/fkzx/hrmFkzxSq/reject',
        confirm: '/fkzx/hrmFkzxSq/confirm',
      },
      userName: this.$store.state.user.info.realname,
    }
  },
  computed: {
    config: function () {
      return typeConfig[this.type]
    },
    // 劳动派遣接待：表格勾选列，已通过未同步的记录可勾选，用于批量添加进入临时工（暂时注释，不显示勾选框）
    // rowSelection: function () {
    //   // 仅“劳动派遣（temp）+ 审批页（approval）”显示勾选列；
    //   // 其他类型（员工访客/自主登记/邀约访客）或申请页、审批页返回 null，表格不渲染复选框列
    //   if (this.type !== 'temp' || this.state !== 'approval') {
    //     return null
    //   }
    //   return {
    //     selectedRowKeys: this.selectedRowKeys, // 当前勾选行的 id 数组
    //     onChange: this.onSelectChange, // 勾选变化回调，更新 selectedRowKeys / selectionRows
    //     // 逐行控制复选框是否可勾选
    //     getCheckboxProps: function (record) {
    //       return {
    //         props: {
    //           // 仅“已通过”并且“未同步”的记录可勾选，其余禁用
    //           disabled: !(record.zt === '1' && record.isLsgda != '1'),
    //         },
    //       }
    //     },
    //   }
    // },
    modalComponent: function () {
      return this.config.modalName
    },
    // 当前访客类型对应的审批业务类型 busType
    // 枚举：YG(0员工访客) FK(1访客自主登记) YY(2邀约访客) FXT(3放行条) LDPQ(4劳动派遣登记)
    approvalBusType: function () {
      const map = {
        employee: '0', // 员工访客 -> YG
        selfRegister: '1', // 访客自主登记 -> FK
        invite: '2', // 邀约访客 -> YY
        temp: '4', // 劳动派遣登记 -> LDPQ
      }
      return map[this.type] || '0'
    },
  },
  created: function () {
    this.initStatusList()
    this.getZTjListByCodes()
  },
  methods: {
    searchQuery() {
      this.loadData(1)
      this.selectedRowKeys = []
      this.selectionRows = []
      this.getZTjListByCodes()
    },
    handleRangeChange: function (rangeName, beginKey, endKey, value, dateStrings) {
      this[rangeName] = value || []
      this.queryParam[beginKey] = dateStrings && dateStrings[0] ? dateStrings[0] : ''
      this.queryParam[endKey] = dateStrings && dateStrings[1] ? dateStrings[1] : ''
    },
    searchReset: function () {
      this.queryParam = {
        xm: '',
        lfqy: '',
        lfsy: '',
        yjlfsj_begin: '',
        yjlfsj_end: '',
        lflx: this.config.lflx,
        zt: '',
        lfzt: '',
        isMyReception: this.state === 'receive',
        pqgs: '',
      }
      this.expectDateRange = []
      this.searchQuery()
    },

    // 获取状态统计
    getZTjListByCodes: function () {
      var that = this
      var lflx = that.queryParam.lflx
      const isReceive = that.state === 'receive'

      // 根据 isReceive 选择调用不同的接口
      var promise = isReceive
        ? that.$http.get('/fkzx/hrmFkzxSq/countByTypeAndLfzt')
        : that.$http.get('online/cgreport/api/getColumnsAndData/2082354260488523777?pageSize=100')

      promise.then(function (response) {
        // 接待页：新接口返回 {lfztList: [...], ztList: [...]}
        if (isReceive) {
          var lfztList = response.result.lfztList || []
          var ztList = response.result.ztList || []

          // 过滤出当前类型的数据
          lfztList = lfztList.filter(function (t) {
            return lflx.indexOf(t.type) > -1
          })
          ztList = ztList.filter(function (t) {
            return lflx.indexOf(t.type) > -1
          })

          // 分别统计 lfzt 和 zt
          var lfztCountMap = new Map()
          lfztList.forEach(function (t) {
            var key = t.lfzt
            var prev = lfztCountMap.get(key) || 0
            lfztCountMap.set(key, prev + parseInt(t.cnt))
          })

          var ztCountMap = new Map()
          ztList.forEach(function (t) {
            var key = t.zt
            var prev = ztCountMap.get(key) || 0
            ztCountMap.set(key, prev + parseInt(t.cnt))
          })

          // 设置各Tab的count
          that.statusList.forEach(function (item) {
            // 空值项（全部Tab）不参与统计计算
            if (item.value === '' || item.value === null || item.value === undefined) return

            var countMap = item.fields === 'lfzt' ? lfztCountMap : ztCountMap
            item.count = item.value.split(',').reduce(function (acc, v) {
              return acc + (countMap.get(v) || 0)
            }, 0)
          })

          // 计算全部Tab的总计（所有状态之和）
          var totalCount = 0
          that.statusList.forEach(function (item) {
            if (item.value !== '' && item.value !== null && item.value !== undefined) {
              totalCount += item.count
            }
          })
          var firstItem = that.statusList[0]
          if (firstItem && firstItem.value === '') {
            firstItem.count = totalCount
          }
        } else {
          // 非接待页：原逻辑保持不变
          var records = response.result.data.records.filter(function (t) {
            return lflx.indexOf(t.type) > -1
          })

          // 按 zt 统计
          var countMap = new Map()
          records.forEach(function (t) {
            var key = t.zt
            var prev = countMap.get(key) || 0
            countMap.set(key, prev + parseInt(t.cnt))
          })

          var totalCount = 0
          that.statusList.forEach(function (item) {
            // 空值项（全部Tab）不参与统计计算
            if (item.value === '' || item.value === null || item.value === undefined) return
            item.count = item.value.split(',').reduce(function (acc, v) {
              return acc + (countMap.get(v) || 0)
            }, 0)
            totalCount += item.count
          })

          // 全部Tab显示总计
          var firstItem = that.statusList[0]
          if (firstItem && firstItem.value === '') {
            firstItem.count = totalCount
          }
        }
      })
    },

    // 初始化状态列表
    initStatusList: function () {
      if (['apply', 'approval'].includes(this.state)) {
        this.statusList = [
          { key: 'zt_', label: '全部', count: 0, fields: 'zt', value: '' },
          { key: 'zt_0', label: '审批中', count: 0, fields: 'zt', value: '0' },
          { key: 'zt_1', label: '已通过', count: 0, fields: 'zt', value: '1' },
          { key: 'zt_2', label: '不通过', count: 0, fields: 'zt', value: '2' },
          { key: 'zt_3', label: '已撤回', count: 0, fields: 'zt', value: '3' },
        ]
      }
      if (this.state === 'receive') {
        this.statusList = [
          { key: 'zt_', label: '全部', count: 0, fields: 'zt', value: '' },
          { key: 'zt_0', label: '审批中', count: 0, fields: 'zt', value: '0' },
          { key: 'lfzt_0', label: '待来访', count: 0, fields: 'lfzt', value: '0' },
          { key: 'lfzt_1', label: '已来访', count: 0, fields: 'lfzt', value: '1' },
          { key: 'zt_2', label: '不通过', count: 0, fields: 'zt', value: '2' },
          { key: 'zt_3', label: '已撤回', count: 0, fields: 'zt', value: '3' },
        ]
      }
    },

    changeStatus: function (key) {
      var item = this.statusList.find(function (s) {
        return s.key === key
      })
      if (item) {
        // 设置对应字段值，清空另一个字段
        if (item.fields === 'zt') {
          this.queryParam.zt = item.value
          this.queryParam.lfzt = ''
        } else if (item.fields === 'lfzt') {
          this.queryParam.lfzt = item.value
          this.queryParam.zt = ''
        }
      }
      this.onClearSelected()
      this.loadData(1)
    },

    isStatusActive: function (key) {
      var that = this
      var item = this.statusList.find(function (s) {
        return s.key === key
      })
      if (!item) return false
      // 全部Tab：zt和lfzt都为空时激活
      if (item.value === '' && item.fields === 'zt') {
        return !that.queryParam.zt && !that.queryParam.lfzt
      }
      var val = this.queryParam[item.fields] || ''
      if (val !== item.value) return false
      // 确保另一个字段为空，避免交叉匹配
      return item.fields === 'zt' ? !this.queryParam.lfzt : !this.queryParam.zt
    },

    getStatusClass: function (status) {
      var classMap = { 0: 'pending', 1: 'approved', 2: 'rejected', 3: 'cancelled', 4: 'visited' }
      return classMap[status] || ''
    },
    getStatusText: function (status) {
      var textMap = { 0: '审批中', 1: '已通过', 2: '不通过', 3: '已撤回', 4: '已来访' }
      return textMap[status] || status
    },
    // 接待页：zt=1时显示lfzt来访状态
    getDisplayStatusClass: function (record) {
      if (this.state === 'receive' && record.zt === '1') {
        return record.lfzt === '1' ? 'visited' : 'waiting'
      }
      return this.getStatusClass(record.zt)
    },
    getDisplayStatusText: function (record) {
      if (this.state === 'receive' && record.zt === '1') {
        return record.lfzt === '1' ? '已来访' : '待来访'
      }
      return this.getStatusText(record.zt)
    },

    // 打开二维码弹窗
    openQrModal: function (type) {
      this.$refs.qrModal.open(type)
    },

    // 新增
    handleAdd: function () {
      this.$refs.modalForm.add()
      this.$refs.modalForm.title = '新增' + this.config.description + '申请'
    },

    // 编辑
    handleEdit: function (record) {
      this.$refs.modalForm.edit(record)
      this.$refs.modalForm.title = '编辑' + this.config.description + '申请'
    },

    // 详情
    handleDetail: function (record) {
      this.$refs.detailModal.show(record, this.config.detailTitle, this.config.showCompanions, this.type)
    },

    // 撤回
    handleCancel: function (record) {
      var that = this
      that.$confirm({
        title: '撤回确认',
        content: '确定要撤回该申请吗？撤回后将无法恢复。',
        okText: '确认撤回',
        onOk: function () {
          that.$http
            .post('/fkzx/hrmFkzxSq/edit ', Object.assign({}, record, { zt: '3' }))
            .then(function (res) {
              if (res.success) {
                that.$message.success('撤回成功')
                that.modalFormOk()
              } else {
                that.$message.warning(res.message || '撤回失败')
              }
            })
            .catch(function () {
              that.$message.error('撤回失败')
            })
        },
      })
    },

    // 审核按钮是否显示：自主登记、劳动派遣、邀约访客需判断当前用户是否为接待人，且 brSpStatus 为 1
    showAuditButton: function (record) {
      // brSpStatus 不为 1 时不显示审核按钮
      if (record.brSpStatus != 1) {
        return false
      }
      // 员工访客不做接待人限制
      if (this.type === 'employee') {
        return true
      }
      // 其他类型：当前用户姓名与接待人一致才显示审核按钮
      return this.userName === record.jdr
    },

    // 审核
    handleReview: function (record) {
      this.$refs.approvalModal.show(record)
    },

    // 确认来访
    handleConfirmVisit: function (record) {
      this.$refs.confirmVisitModal.show(record)
    },

    // 修改接待人
    handleChangeReceiver: function (record) {
      this.$refs.changeReceiverModal.show(record)
    },

    // 批量通过
    handleBatchApprove: function () {
      if (this.selectedRowKeys.length === 0) {
        this.$message.warning('请选择要审批的记录')
        return
      }
      var that = this
      that.$confirm({
        title: '确认批量通过',
        content: '确定要通过选中的 ' + that.selectedRowKeys.length + ' 条记录吗？',
        onOk: function () {
          that.$message.success('批量通过成功')
          that.loadData()
        },
      })
    },

    // 批量驳回
    handleBatchReject: function () {
      if (this.selectedRowKeys.length === 0) {
        this.$message.warning('请选择要驳回的记录')
        return
      }
      this.$refs.approvalModal.batchReject(this.selectedRowKeys)
    },

    // 批量确认来访
    handleBatchConfirmVisit: function () {
      if (this.selectedRowKeys.length === 0) {
        this.$message.warning('请选择要确认来访的记录')
        return
      }
      var that = this
      that.$confirm({
        title: '确认批量确认来访',
        content: '确定要确认选中的 ' + that.selectedRowKeys.length + ' 条记录来访吗？',
        onOk: function () {
          that.$http
            .post('/fkzx/hrmFkzxSq/batchConfirmVisit', that.selectedRowKeys)
            .then(function (res) {
              if (res.success) {
                that.$message.success('批量确认来访成功')
                that.onClearSelected()
                that.modalFormOk()
              } else {
                that.$message.warning(res.message || '批量确认来访失败')
              }
            })
            .catch(function () {
              that.$message.error('批量确认来访失败')
            })
        },
      })
    },

    // 批量添加进入临时工
    handleBatchAddTempWorker: function () {
      if (this.selectedRowKeys.length === 0) {
        this.$message.warning('请选择要添加进入临时工的记录')
        return
      }
      this.$refs.addTempWorkerModal.show(this.selectedRowKeys)
    },

    // 添加进入临时工成功：清空勾选并刷新列表
    handleAddTempWorkerOk: function () {
      this.onClearSelected()
      this.modalFormOk()
    },

    handlePageChange: function (page, pageSize) {
      this.ipagination.current = page
      this.ipagination.pageSize = pageSize
      this.onClearSelected()
      this.loadData()
    },
    handleSizeChange: function (current, size) {
      this.ipagination.current = 1
      this.ipagination.pageSize = size
      this.onClearSelected()
      this.loadData()
    },

    modalFormOk: function () {
      this.loadData()
      this.getZTjListByCodes()
    },
  },
}
</script>

<style lang="less" scoped>
@import '../visitor-theme.less';

.visitor-list-module {
  background: @v-background;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 分页区域 */
.v-pagination {
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: rgba(@v-primary-rgb, 0.015);
  border-top: 1px solid @v-border;

  /deep/ .ant-pagination {
    margin: 0;
  }
}

/* 筛选区日期控件 */
.v-filter-bar .v-date-range {
  display: flex;
  align-items: center;
  gap: 5px;

  .v-date-sep {
    color: @v-muted-foreground;
    font-size: 12px;
    flex-shrink: 0;
  }

  /deep/ .ant-calendar-picker {
    width: 128px;

    .ant-calendar-picker-input {
      height: 34px;
      border-radius: 8px;
      border-color: @v-border;
      font-size: 12.5px;

      &:hover,
      &:focus {
        border-color: @v-primary;
        box-shadow: 0 0 0 3px rgba(@v-primary-rgb, 0.12);
      }
    }
  }
}
</style>
