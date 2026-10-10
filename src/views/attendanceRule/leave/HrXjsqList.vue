<template>
  <!--
    HrXjsqList.vue
    请假申请列表主页面
    功能：申请人端 + 审批人端 双模式
      - boxState=0（默认）：申请页 Tab（审批中/已通过/已撤回/已退回）
      - boxState=1：审批页 Tab（待审批/已审批/抄送我的）
  -->
  <div class="otapply-list-panel">
    <!-- Tab + 操作按钮 同一行 -->
    <div class="rule-tab-bar">
      <!-- Tab 标签页 -->
      <a-tabs v-model="activeKey" type="card" @change="callback">
        <a-tab-pane v-for="item in currentTabsList" :key="item.value">
          <span slot="tab" :data-status="item.value"> {{ item.title }}({{ item.count }}) </span>
        </a-tab-pane>
      </a-tabs>

      <!-- ==== 操作按钮区域 ==== -->
      <div class="rule-toolbar">
        <!-- 申请页-已撤回时显示「新增」按钮 -->
        <a-button v-if="boxState !== 1" type="primary" class="rule-btn-primary" icon="plus" @click="handleAdd">
          {{ isDeduct ? '发起事假抵扣' : '发起请假' }}
        </a-button>
        <!-- 导出按钮（预留） -->
        <a-button
          class="rule-btn-primary"
          type="primary"
          icon="download"
          @click="handleExportXls(isDeduct ? '事假抵扣申请表' : '请假申请表')"
          >导出</a-button
        >
        <a-button type="primary" class="rule-btn-primary" icon="setting" @click="toggleColumnConfig">字段配置</a-button>
      </div>
    </div>

    <!-- ==== 搜索栏 ==== -->
    <div class="rule-filter-bar">
      <div class="rule-filter-item">
        <span class="rule-filter-label">姓名</span>
        <a-input
          v-model="queryParam.name"
          allowClear
          placeholder="请输入姓名"
          class="rule-filter-input"
          @pressEnter="searchQuery"
        />
      </div>
      <div class="rule-filter-item">
        <span class="rule-filter-label">工号</span>
        <a-input
          v-model="queryParam.no"
          allowClear
          placeholder="请输入工号"
          class="rule-filter-input"
          @pressEnter="searchQuery"
        />
      </div>

      <div class="rule-filter-item">
        <span class="rule-filter-label">公司</span>
        <a-select
          v-model="queryParam.companyId"
          allowClear
          placeholder="请选择公司"
          class="rule-filter-select"
          @change="onCompanyChange"
        >
          <a-select-option v-for="item in companyList" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>
      <div class="rule-filter-item">
        <span class="rule-filter-label">部门</span>
        <a-cascader
          :options="deptList"
          v-model="deptArr"
          placeholder="请选择部门"
          class="rule-filter-cascader"
          changeOnSelect
          :show-search="{ filter }"
          :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
          @change="onCascaderChange"
        />
      </div>

      <div class="rule-filter-item">
        <span class="rule-filter-label">请假开始时间</span>
        <j-range-picker
          style="width: 200px"
          v-model="skrqRange"
          format="YYYY-MM-DD"
          :placeholder="['开始日期', '结束日期']"
          class="rule-filter-date"
          @change="onSkrqDateChange"
        />
      </div>

      <div class="rule-filter-actions">
        <a-button type="primary" class="rule-btn-primary" @click="searchQuery">查询</a-button>
        <a-button class="rule-btn-reset" @click="searchReset">重置</a-button>
      </div>
    </div>

    <!-- ==== Table 区域 ==== -->
    <div class="rule-table-wrap">
      <a-table
        ref="table"
        size="middle"
        :scroll="tableScroll"
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
        <!-- ==== 自定义列模板 ==== -->

        <!-- 审批状态 a-tag -->
        <template slot="stateTag" slot-scope="text, record">
          <a-tag :color="stateTagColor(text, record)" style="margin: 0">
            {{ stateTagText(text, record) }}
          </a-tag>
        </template>

        <!-- 附件查看 -->
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px; font-style: italic">无附件</span>
          <a-button v-else :ghost="true" type="primary" size="small" @click="lookPdf(text)"> 查看 </a-button>
        </template>

        <!-- ==== 操作列 ==== -->
        <span slot="action" slot-scope="text, record">
          <!-- 申请页 - 已撤回/已退回: 编辑 / 提交审批 -->
          <template v-if="(activeKey == 4 || activeKey == 3) && boxState != 1">
            <!-- 修改重申：仅申请提交人本人可见（行工号与当前登录人一致） -->
            <a v-if="isApplyOwner(record)" @click="handleEdit(record)">修改重申</a>
            <a-divider v-if="isApplyOwner(record)" type="vertical" />
            <a-popconfirm
              v-if="activeKey == 3 && isApplyOwner(record)"
              title="确定删除吗?"
              @confirm="handleDelete(record.id)"
            >
              <a style="color: red">删除</a>
            </a-popconfirm>
            <a-divider v-if="activeKey == 3 && isApplyOwner(record)" type="vertical" />
            <!-- <a-popconfirm title="确定提交审批吗?" @confirm="handleSubmit(record)">
              <a style="color: #00aa7f;">重新审批</a>
            </a-popconfirm>
            <a-divider type="vertical" /> -->
            <a @click="handleDetail(record)">详情</a>
          </template>

          <!-- 申请页 - 审批中: 详情 / 撤回（仅申请人本人，即行工号与当前登录人一致时可撤回） -->
          <template v-if="activeKey == 1 && boxState != 1">
            <span v-if="isApplyOwner(record)">
              <a style="color: #ff5500" @click="handleRevoke(record)">撤回</a>
              <a-divider type="vertical" />
            </span>
            <a @click="handleDetail(record)">详情</a>
          </template>

          <!-- 申请页 - 已通过: 详情 -->
          <template v-if="activeKey == 2 && boxState != 1">
            <a @click="handleDetail(record)">详情</a>
          </template>

          <!-- 审批页 - 待审批: 审批 / 详情（是否需要本人审批由最新轮次的一人一条记录判断，见 isCurrentApprover） -->
          <template v-if="activeKey == 1 && boxState == 1">
            <a v-if="isCurrentApprover(record)" style="color: #ff5500" @click="handleApprove(record)">审批</a>
            <a-divider v-if="isCurrentApprover(record)" type="vertical" />
            <a @click="handleDetail(record)">详情</a>
          </template>

          <!-- 审批页 - 已审批: 撤回（仅已通过、未到请假开始时间；按钮权限编码 HrXjsqList_Revoke；事假抵扣不允许撤回） / 详情 -->
          <template v-if="activeKey == 2 && boxState == 1">
            <!-- 用 v-if + JS 权限判断替代 v-has 指令：v-has 会直接 removeChild 删除真实 DOM，
                 表格行随 Tab 切换重新 patch 时会 insertBefore 报错、页面卡死；
                 已审批 Tab 同时包含 已通过(2) 和 已退回(4)，仅已通过可撤回 -->
            <span
              v-if="
                record.spStatus == 2 &&
                !isDeduct &&
                checkUserHavePermission('HrXjsqList_Revoke') &&
                isBeforeLeaveTime(record)
              "
            >
              <a style="color: #ff5500" @click="handleRevoke(record)">撤回</a>
              <a-divider type="vertical" />
            </span>
            <a @click="handleDetail(record)">详情</a>
          </template>

          <!-- 审批页 - 抄送我的: 详情 -->
          <template v-if="activeKey == 99 && boxState == 1">
            <a @click="handleDetail(record)">详情</a>
          </template>

          <!-- 日志（通用） -->
          <a-divider type="vertical" />
          <a style="color: orange" @click="getLct(record)">日志</a>
        </span>
      </a-table>
    </div>

    <!-- ==== 弹窗 / 抽屉 ==== -->

    <!-- 新增/编辑/审批/详情弹窗 -->
    <hr-xjsq-modal :isDeduct="isDeduct" ref="modalForm" @ok="modalFormOk"></hr-xjsq-modal>

    <!-- 审批日志时间轴 -->
    <hr-xjsq-apply-log :LCid="LCid" :LCdata="LCdata" :LCshow="LCshow" @out="LCshow = false"></hr-xjsq-apply-log>

    <!-- 退回弹窗 -->
    <hr-reject-modal :LCstate="boxState" :ZFAll="ZFAll" :ShowZF="ShowZF" @goBack="goBack"></hr-reject-modal>

    <!-- 撤回弹窗（撤回原因 spOpinion 非必填） -->
    <hr-revoke-modal
      :visible="revokeVisible"
      :record="revokeRecord"
      @ok="handleRevokeOk"
      @cancel="revokeVisible = false"
      :isDeduct="isDeduct"
    ></hr-revoke-modal>

    <column-config-sidebar
      :visible="columnConfigVisible"
      :allColumns="columnConfigNew"
      :fieldTitleMap="fieldTitleMap"
      @close="columnConfigVisible = false"
      @confirm="handleColumnConfigConfirm"
    />
  </div>
</template>

<script>
/**
 * 请假申请列表主页面
 *
 * 双模式：
 *   - boxState=0（默认）：申请人视角，Tab = 审批中/已通过/已撤回/已退回
 *   - boxState=1：审批人视角，Tab = 待审批/已审批/抄送我的
 *
 * 状态定义：
 *   spStatus: 1=审批中 2=已通过 3=已撤回 4=已退回
 *   spFlow: 1=部门经理 2=HR 3=抄送人
 */
import Vue from 'vue'
import moment from 'moment'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { mixinDevice } from '@/utils/mixin'
import { httpAction, getAction, getFileAccessHttpUrl, postAction } from '@/api/manage'
import { checkUserHavePermission } from '@/utils/util'
import HrXjsqModal from './modules/HrXjsqModal'
import HrXjsqApplyLog from './modules/HrXjsqApplyLog'
import HrRejectModal from './modules/HrRejectModal'
import HrRevokeModal from './modules/HrRevokeModal'

import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'
import { columnConfigMixin } from '@/mixins/columnConfigMixin'
import { tableAdaptiveMixin } from '@/mixins/tableAdaptiveMixin'

import '@/assets/less/TableExpand.less'

export default {
  name: 'HrXjsqList',
  mixins: [JeecgListMixin, mixinDevice, columnConfigMixin, tableAdaptiveMixin],
  components: {
    HrXjsqModal,
    HrXjsqApplyLog,
    ColumnConfigSidebar,
    HrRejectModal,
    HrRevokeModal,
  },
  props: {
    /**
     * 页面模式
     * 0 = 申请页（默认）
     * 1 = 审批页
     */
    boxState: {
      type: Number,
      default: 0,
      required: false,
    },
    isDeduct: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      description: '请假申请列表页面',

      skrqRange: [],

      // 当前选中的 Tab key（双向绑定）
      activeKey: '1',

      // 申请页 Tab 列表
      applyTabsList: [
        { title: '审批中', value: '1', count: 0 },
        { title: '已通过', value: '2', count: 0 },
        { title: '已撤回', value: '3', count: 0 },
        { title: '不通过', value: '4', count: 0 },
      ],

      // 审批页 Tab 列表
      approveTabsList: [
        { title: '待审批', value: '1', count: 0 },
        { title: '已审批', value: '2', count: 0 },
        { title: '抄送我的', value: '99', count: 0 },
      ],

      // 公司列表
      companyList: [],
      // 部门列表
      deptList: [],
      // 部门级联选择值
      deptArr: [],

      // ==== 日志时间轴 ====
      LCid: '',
      LCshow: false,
      LCdata: {},

      // ==== 退回弹窗 ====
      ShowZF: false,
      ZFAll: {},

      // ==== 撤回弹窗 ====
      revokeVisible: false,
      revokeRecord: {},

      // ==== 表头定义 ====
      // 事假抵扣（年假抵扣事假）与普通请假使用各自独立的字段配置
      columnCode: this.isDeduct ? 'HrHolidayDeduct' : 'HrXjsq',

      url: {},
      disableMixinCreated: true,
    }
  },
  created() {
    if (this.isDeduct) {
      this.url = {
        list: '/hrHolidayDeduct/hrHolidayDeduct/list',
        delete: '/hrHolidayDeduct/hrHolidayDeduct/delete',
        deleteBatch: '/hrHolidayDeduct/hrHolidayDeduct/deleteBatch',
        exportXlsUrl: '/hrHolidayDeduct/hrHolidayDeduct/exportXls',
        edit: '/hrHolidayDeduct/hrHolidayDeduct/edit',
        count: '/hrHolidayDeduct/hrHolidayDeduct/getSpStatusCount',
        csrList: '/hrHolidayDeduct/hrHolidayDeduct/queryCsrList',
      }
    } else {
      this.url = {
        list: '/hr_xjsq/hrXjsq/list',
        delete: '/hr_xjsq/hrXjsq/delete',
        deleteBatch: '/hr_xjsq/hrXjsq/deleteBatch',
        exportXlsUrl: '/hr_xjsq/hrXjsq/exportXls',
        importExcelUrl: 'hr_xjsq/hrXjsq/importExcel',
        edit: '/hr_xjsq/hrXjsq/edit',
        count: '/hr_xjsq/hrXjsq/getSpStatusCount',
        csrList: '/hr_xjsq/hrXjsq/queryCsrList',
      }
    }
    this.getSuperFieldList()
    this.getCompanyList()
    // 审批页模式：初始化选中待审批Tab
    if (this.boxState == 1) {
      this.activeKey = 1
    }
    // 先获取字段配置，再加载表格数据
    this.getColumnConfig().then(() => {
      this.searchReset()
    })
  },
  computed: {
    // 根据 boxState 返回对应的 tabs 列表
    currentTabsList() {
      return this.boxState == 1 ? this.approveTabsList : this.applyTabsList
    },

    originalColumns() {
      let mapA = [
        {
          title: '请假类型',
          align: 'center',
          width: 100,

          dataIndex: 'xjType',
          customRender: (text, record) => {
            // leave_type: 1: '事假', 2: '病假', 3: '年假', 4: '婚假', 5: '产假', 6: '丧假'
            // const typeMap = {
            //   1: { text: '事假', color: 'orange' },
            //   2: { text: '病假', color: 'blue' },
            //   3: { text: '年假', color: 'green' },
            //   4: { text: '婚假', color: 'pink' },
            //   5: { text: '产假', color: 'purple' },
            //   6: { text: '丧假', color: 'default' }
            // }
            // const type = typeMap[text] || { text: '未知', color: 'default' }
            return <a-tag color="blue">{text}</a-tag>
          },
        },
        {
          title: '审批状态',
          align: 'center',
          dataIndex: 'spStatus',
          width: 100,
          scopedSlots: { customRender: 'stateTag' },
        },
        {
          title: '当前节点',
          align: 'center',
          dataIndex: 'spFlow',
          width: 180,
          customRender: (text, record) => {
            // 审批通过、已撤回、已退回时显示对应状态（颜色与 Tab 保持一致）
            if (record.spStatus == 2) {
              return <a-tag color="#55c42a">已通过</a-tag>
            }
            if (record.spStatus == 3) {
              return <a-tag color="#0082fc">已撤回</a-tag>
            }
            if (record.spStatus == 4) {
              return <a-tag color="#f5222d">不通过</a-tag>
            }
            // 审批中 - 显示当前审批节点
            const statusMap = {
              1: '部门经理审批',
              2: 'HR审批',
              3: '抄送人',
            }
            return <a-tag color="#fa8c16">审批中({text || '未知'})</a-tag>
          },
        },
      ]
      let mapB = [
        {
          title: '公司',
          align: 'center',
          dataIndex: 'companyId_dictText',
          width: 120,
        },
        {
          title: '部门',
          align: 'center',
          dataIndex: 'dept_dictText',
          width: 120,
        },
        {
          title: '工号',
          align: 'center',
          dataIndex: 'no',
          width: 100,
        },
        {
          title: '姓名',
          align: 'center',
          dataIndex: 'name',
          width: 100,
        },
        {
          title: '开始时间',
          align: 'center',
          dataIndex: 'startTime',
          width: 160,
        },
        {
          title: '结束时间',
          align: 'center',
          dataIndex: 'endTime',
          width: 160,
        },
        {
          title: '申请时长',
          align: 'center',
          dataIndex: 'applyHours',
          width: 100,
          customRender: (text, r) => {
            if (r.xjType == '年假') {
              return r.applyDays ? `${r.applyDays}天` : '-'
            } else if (r.xjType == '加班调休') {
              // 原事假抵扣页(isDeduct)取 applyDays；普通请假列表的加班调休同样按天展示
              return r.applyDays ? `${r.applyDays}天` : '-'
            } else {
              return r.applyHours ? `${r.applyHours}小时` : '-'
            }
          },
        },
      ]
      //年假抵扣事假
      if (this.isDeduct) {
        mapB.push(
          {
            title: '源请假时长',
            align: 'center',
            dataIndex: 'personalLeaveDays',
            width: 100,
            customRender: (text, r) => {
              return r.personalLeaveDays ? `${r.personalLeaveDays}天` : '-'
            },
          },
          {
            title: '转换状态',
            align: 'center',
            dataIndex: 'isDeduct',
            width: 100,
            customRender: (text) => {
              // 转换状态: 0=未转换(橙) 1=已转换(绿)
              const statusMap = {
                0: { text: '未转换', color: '#f97316' },
                1: { text: '已转换', color: '#22c55e' },
              }
              const status = statusMap[text]
              return status ? (
                <a-tag color={status.color} style="margin: 0">
                  {status.text}
                </a-tag>
              ) : null
            },
          }
        )
      }
      mapB.push(
        {
          title: '请假原因',
          align: 'center',
          dataIndex: 'sqyy',
          width: 200,
          align: 'center',
          ellipsis: true,
          customRender: (text) => {
            return (
              <a-tooltip style="width: 180px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block">
                <template slot="title">{text}</template>
                <span>{text}</span>
              </a-tooltip>
            )
          },
        },
        {
          title: '附件',
          align: 'center',
          dataIndex: 'attachmentUrls',
          width: 100,
          scopedSlots: { customRender: 'fileSlot' },
        }
      )

      let mapC = [
        {
          title: '审批人',
          align: 'center',
          dataIndex: 'sprName',
          width: 200,
          align: 'center',
          ellipsis: true,
          customRender: (t, red) => {
            let text = []
            if (!red.customProcessSqdSpjdList) {
              return ''
            }
            // 同一节点多次驳回后会存在多条记录，只取最后一条
            const nodeRecords = red.customProcessSqdSpjdList.filter((item) => item.nodeName == red.spFlow)
            const lastNode = nodeRecords.length ? nodeRecords[nodeRecords.length - 1] : null
            if (lastNode && lastNode.sprName) {
              text.push(lastNode.sprName)
            }
            return (
              <a-tooltip style="width: 180px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block">
                <template slot="title">{text.join(',')}</template>
                <span>{text.join(',') || '-'}</span>
              </a-tooltip>
            )
          },
        },
      ]

      if (this.activeKey == 2 || this.activeKey == 4) {
        return [...mapA, ...mapB]
      }
      return [...mapA, ...mapC, ...mapB]
    },
    fieldTitleMap() {
      let map = {}
      this.originalColumns.forEach((item) => {
        if (item.dataIndex != 'action') {
          map[item.dataIndex] = item.title
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
          fixed: 'right',
          width: 220,
          scopedSlots: { customRender: 'action' },
        },
      ]
      // 仅对数据列应用字段配置（固定操作列不参与配置）
      const configuredColumns = this.applyColumnConfig(this.originalColumns, { fixedColumns: [] })
      // 无横向滚动条时移除最后一个非固定列的 width，让其自动撑满，避免右侧留白
      const processedColumns = this.adaptiveColumnsWidth(configuredColumns, fixedColumns)
      return [...processedColumns, ...fixedColumns]
    },
    // 本页含复选框选择列（默认 60px）；tableAdaptiveMixin 的 tableScroll 未计入该宽度，这里补回，避免横向错位
    tableScroll() {
      const x = this.columns.reduce((sum, column) => sum + (Number(column.width) || 120), 60)
      return { x }
    },
    columnConfigNew() {
      return this.getColumnConfigData()
    },

    // 当前登录用户信息
    currentUser() {
      return this.$store.state.user.info || {}
    },
  },
  watch: {
    dataSource: {
      inmediate: true,
      handler(val) {
        this.getCount()
      },
    },
  },
  methods: {
    // 按钮权限判断（替代 v-has 指令，避免指令直接删除真实 DOM 造成 Tab 切换时渲染崩溃）
    checkUserHavePermission,
    /**
     * 加载列表数据
     * - 抄送我的 tab 使用独立接口 queryCsrList，入参 csrNo 取当前登录账号工号
     * - 其他 tab 使用默认 list 接口
     * 注意：假期抵扣（isDeduct）模式无抄送接口，回退默认 list
     */
    loadData(arg) {
      // 抄送我的 tab 使用新接口
      if (this.activeKey == 99 && this.boxState == 1 && this.url.csrList) {
        if (arg === 1) {
          this.ipagination.current = 1
        }
        const params = this.getQueryParams()
        // 入参 csrNo 取当前登录账号工号
        params.csrNo = this.getUserNo()
        this.loading = true
        getAction(this.url.csrList, params).then((res) => {
          if (res.success) {
            const total = res.result.total || 0
            this.dataSource = res.result.records || res.result
            this.ipagination.total = total
            // 列表返回已带 total，直接更新「抄送我的」角标，避免 watcher 链路再发一次 pageSize=1 的请求
            const csrTab = this.approveTabsList.find((item) => item.value == 99)
            if (csrTab) {
              csrTab.count = total
            }
          }
          if (res.code === 510) {
            this.$message.warning(res.message)
          }
          this.loading = false
        })
        return
      }
      // 其他 tab 走默认 list 接口
      if (!this.url.list) {
        this.$message.error('请设置url.list属性!')
        return
      }
      if (arg === 1) {
        this.ipagination.current = 1
      }
      const params = this.getQueryParams()
      this.loading = true
      getAction(this.url.list, params).then((res) => {
        if (res.success) {
          this.dataSource = res.result.records || res.result
          this.ipagination.total = res.result.total || 0
        }
        if (res.code === 510) {
          this.$message.warning(res.message)
        }
        this.loading = false
      })
    },

    /**
     * 获取当前登录账号工号
     * @returns {String}
     */
    getUserNo() {
      const perInfo = Vue.ls.get('perInfo') || {}
      return perInfo.no || this.currentUser.no || this.currentUser.username || ''
    },

    getCount() {
      getAction(this.url.count).then((res) => {
        if (res.success) {
          let arr = res.result
          // 当前在「抄送我的」Tab 时，角标已由 loadData 的列表请求顺带更新，
          // 这里先留存，避免被下方清零逻辑覆盖
          const csrTabExist = this.approveTabsList.find((item) => item.value == 99)
          const csrCountKeep = this.activeKey == 99 && csrTabExist ? csrTabExist.count : 0
          this.applyTabsList = this.applyTabsList.map((item) => {
            item.count = 0
            return item
          })
          this.approveTabsList = this.approveTabsList.map((item) => {
            item.count = item.value == 99 ? csrCountKeep : 0
            return item
          })
          arr.forEach((item) => {
            this.applyTabsList.forEach((tab) => {
              if (tab.value == item.spStatus) {
                tab.count = item.total
              }
            })
            this.approveTabsList.forEach((tab) => {
              // 审批页-已审批 包含 审批通过(2) 和 已退回(4)
              if (tab.value == item.spStatus || (tab.value == 2 && item.spStatus == 4)) {
                tab.count += item.total
              }
            })
          })
          // 抄送我的数量从 queryCsrList 接口获取（仅审批页，假期抵扣模式无此接口）
          // 当前就在「抄送我的」Tab 时，total 已由 loadData 的列表请求顺带更新，无需再发一次 pageSize=1 的请求
          if (this.boxState == 1 && this.url.csrList && this.activeKey != 99) {
            this.getCsrCount()
          }
        }
      })
    },

    /**
     * 获取抄送我的数量
     */
    getCsrCount() {
      getAction(this.url.csrList, { csrNo: this.getUserNo(), pageNo: 1, pageSize: 1 }).then((res) => {
        if (res.success) {
          const csrTab = this.approveTabsList.find((item) => item.value == 99)
          if (csrTab) {
            csrTab.count = res.result.total || 0
          }
        }
      })
    },
    // ==== 公司部门选择相关 ====

    /**
     * 获取公司列表
     */
    getCompanyList() {
      getAction('/org/hrmOrg/loadTreeRoot?pid=0').then((res) => {
        if (res.success) {
          this.companyList = res.result[0].children || []
        }
      })
    },

    /**
     * 公司选择变化
     */
    onCompanyChange() {
      this.$nextTick(() => {
        if (!this.queryParam.companyId) {
          this.queryParam.dept = ''
          this.deptArr = []
          this.deptList = []
        } else {
          // 加载部门列表
          this.loadDeptList(this.queryParam.companyId)
        }
      })
    },

    /**
     * 加载部门列表
     */
    loadDeptList(companyId) {
      getAction('/org/hrmOrg/loadTreeRoot', { pid: companyId }).then((res) => {
        if (res.success) {
          this.deptList = res.result || []
        }
      })
    },

    /**
     * 部门级联选择变化
     */
    onCascaderChange() {
      this.queryParam.dept = this.deptArr[this.deptArr.length - 1] || ''
    },

    /**
     * 级联选择器搜索过滤
     */
    filter(inputValue, path) {
      return path.some((option) => option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
    },

    // ==== 状态标签相关 ====

    /**
     * 审批状态 a-tag 颜色
     */
    stateTagColor(text, record) {
      const state = record.spStatus
      const colorMap = {
        1: '#fa8c16', // 审批中 - 橙色（与 Tab 一致）
        2: '#55c42a', // 已通过 - 绿
        3: '#0082fc', // 已撤回 - 蓝
        4: '#f5222d', // 已退回 - 红
      }
      return colorMap[state] || '#d9d9d9'
    },

    /**
     * 审批状态 a-tag 文字
     */
    stateTagText(text, record) {
      const state = record.spStatus
      const textMap = {
        1: '审批中',
        2: '已通过',
        3: '已撤回',
        4: '不通过',
      }
      return textMap[state] || '未知'
    },

    // ==== Tab 切换 ====

    /**
     * 判断当前登录用户是否为该申请的申请人本人
     * 行数据工号 no 与当前登录人工号一致时才允许撤回
     * @param {Object} record - 当前行数据
     * @returns {Boolean}
     */
    isApplyOwner(record) {
      if (!record || !record.no) return false
      // 当前登录人工号从本地缓存 perInfo 中取（与申请表单 HrXjsqApplyForm 的取数方式一致）
      const perInfo = Vue.ls.get('perInfo') || {}
      const userNo = String(perInfo.no || '').trim()
      return !!userNo && String(record.no).trim() === userNo
    },

    /**
     * 判断是否未到请假开始时间
     * 已通过的申请仅允许在请假开始时间之前撤回；请假已开始（含进行中、已结束）则不允许撤回
     * startTime 格式为 YYYY-MM-DD HH:mm:ss；缺失时不拦截，保持按钮可见
     * @param {Object} record - 当前行数据
     * @returns {Boolean}
     */
    isBeforeLeaveTime(record) {
      if (!record || !record.startTime) return true
      return moment().isBefore(moment(record.startTime))
    },

    /**
     * 判断当前登录用户是否需要在该申请的当前节点审批
     *
     * 多轮次（修改重申）后同一节点会按 version 存在多条记录：
     *   - 顶层 brSpStatus 取的是本人历史审批结果，跨轮次不会重置（第 1 轮已批，第 2 轮仍为 2），不能再作为依据
     *   - 必须取当前节点「最新一轮」的一人一条记录 sqdSpjdRecordList，按 sprNo（工号）找到本人记录：
     *     spStatus 为 null/1 = 本轮尚未审批 → 显示按钮；2/3/4/5 = 已有审批结果 → 不显示
     *   - 后端未返回一人一条记录时，兜底旧逻辑：节点 sprId/sprName 逗号串匹配 + brSpStatus == 1
     *
     * @param {Object} record - 当前行数据
     * @returns {Boolean}
     */
    isCurrentApprover(record) {
      const userInfo = this.currentUser
      if (!userInfo || !record) return false

      const spjdList = record.customProcessSqdSpjdList
      if (!spjdList || !Array.isArray(spjdList) || spjdList.length === 0) {
        return false
      }

      // 当前审批节点（nodeName = spFlow），排除抄送节点（nodeProperties=2）；
      // 修改重申后同节点存在多轮(version)记录，取版本号最大的一轮
      const currentNodes = spjdList.filter(
        (item) => item.nodeName == record.spFlow && Number(item.nodeProperties) !== 2
      )
      if (currentNodes.length === 0) {
        return false
      }
      const currentNode = currentNodes.reduce((prev, cur) => (Number(cur.version) > Number(prev.version) ? cur : prev))

      // 本人标识：工号优先（与一人一条记录的 sprNo 对应），其次用户ID、姓名
      const perInfo = Vue.ls.get('perInfo') || {}
      const userNo = String(perInfo.no || userInfo.username || userInfo.no || '').trim()
      const userId = String(userInfo.id || '').trim()
      const realname = (userInfo.realname || '').trim()

      // 在一人一条记录中匹配本人：sprNo（工号）→ sprId（用户ID）→ sprName（姓名）
      const matchPerson = (r) => {
        if (!r) return false
        if (userNo && r.sprNo && String(r.sprNo).trim() === userNo) return true
        if (userId && r.sprId != null && String(r.sprId).trim() === userId) return true
        if (realname && r.sprName && String(r.sprName).trim() === realname) return true
        return false
      }

      const recordList = Array.isArray(currentNode.sqdSpjdRecordList)
        ? currentNode.sqdSpjdRecordList.filter(Boolean)
        : []
      if (recordList.length > 0) {
        const myRecord = recordList.find(matchPerson)
        if (!myRecord) return false
        // 本人本轮尚未审批（无记录id、spStatus 为空或审批中 1）才需要审批
        return myRecord.spStatus == null || myRecord.spStatus === '' || Number(myRecord.spStatus) === 1
      }

      // 旧数据兜底：节点上 sprId / sprName 为逗号分隔多人，且本人审批状态 brSpStatus=待审批(1)
      const checkApprover = (item) => {
        if (userId && item.sprId) {
          const sprIdList = String(item.sprId)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
          if (sprIdList.includes(userId)) return true
        }
        if (userNo && item.sprId) {
          const sprIdList = String(item.sprId)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
          if (sprIdList.includes(userNo)) return true
        }
        if (realname && item.sprName) {
          const sprNameList = String(item.sprName)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
          if (sprNameList.includes(realname)) return true
        }
        return false
      }
      return checkApprover(currentNode) && record.brSpStatus == 1
    },

    /**
     * Tab 切换处理
     * @param {String} key - Tab title
     */
    callback(key) {
      this.activeKey = key
      this.applyTabStatusFilter()
      this.loadData(1)
    },

    /**
     * 根据当前 Tab 设置审批状态查询条件
     * 审批页-已审批(boxState=1, activeKey=2)：需同时查询 审批通过(2) 和 已退回(4)，
     * 使用高级查询 OR 条件拼接；其他 Tab 仍按 spStatus 单值查询
     */
    applyTabStatusFilter() {
      if (this.boxState == 1 && this.activeKey == 2) {
        delete this.queryParam.spStatus
        this.superQueryFlag = true
        this.superQueryMatchType = 'or'
        this.superQueryParams = JSON.stringify([
          { field: 'spStatus', type: 'int', rule: 'eq', val: '2' },
          { field: 'spStatus', type: 'int', rule: 'eq', val: '4' },
        ])
      } else {
        this.superQueryFlag = false
        this.superQueryParams = ''
        this.queryParam['spStatus'] = this.activeKey
      }
    },

    /**
     * 重置搜索
     */
    searchReset() {
      this.skrqRange = []
      this.queryParam = {}
      this.applyTabStatusFilter()
      this.deptArr = []

      this.loadData(1)
    },

    // ==== 操作按钮 ====

    onSkrqDateChange(dateString) {
      this.queryParam.startTime_begin = dateString.length > 0 ? dateString[0] + ' 00:00:00' : ''
      this.queryParam.endTime_end = dateString.length > 0 ? dateString[1] + ' 23:59:59' : ''
    },

    /**
     * 审批
     * @param {Object} record
     */
    handleApprove(record) {
      this.$refs.modalForm.title = '审批'
      this.$refs.modalForm.disableSubmit = true
      this.$refs.modalForm.edit(record)
    },

    /**
     * 提交审批
     * spStatus: 0 → 2
     * 假数据操作：直接修改本地 mockData
     * @param {Object} record
     */
    handleSubmit(record) {
      httpAction(
        this.url.edit,
        {
          ...record,
          spStatus: 1,
        },
        'put'
      ).then((res) => {
        if (res.success) {
          this.$message.success(res.message)
          this.loadData()
        }
      })
    },

    /**
     * 撤回申请
     * 打开撤回弹窗，由弹窗收集撤回原因（spOpinion）后调用撤回接口
     * @param {Object} record
     */
    handleRevoke(record) {
      this.revokeRecord = JSON.parse(JSON.stringify(record))
      this.revokeVisible = true
    },

    /**
     * 撤回成功回调：关闭弹窗并刷新列表
     */
    handleRevokeOk() {
      this.revokeVisible = false
      this.loadData()
    },

    // ==== 退回弹窗 ====

    /**
     * 打开退回弹窗
     * @param {Object} data
     */
    outZF(data) {
      this.ShowZF = true
      this.ZFAll = JSON.parse(JSON.stringify(data))
    },

    /**
     * 退回弹窗回调
     * 退回后数据回到待提交(0)
     * @param {Boolean} num
     */
    goBack(num) {
      this.ShowZF = false
      this.loadMockData()
    },

    // ==== 日志时间轴 ====

    /**
     * 打开日志时间轴
     * @param {Object} data
     */
    getLct(data) {
      this.LCid = data.id
      this.LCdata = data
      this.LCshow = true
    },

    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'date', value: 'startTime', text: '开始时间' })
      fieldList.push({ type: 'date', value: 'endTime', text: '结束时间' })
      fieldList.push({ type: 'BigDecimal', value: 'applyDays', text: '请假天数', dictCode: '' })
      fieldList.push({ type: 'int', value: 'leaveType', text: '请假类型', dictCode: '' })
      fieldList.push({ type: 'string', value: 'reason', text: '请假原因', dictCode: '' })
      fieldList.push({ type: 'string', value: 'attachmentUrlsUrls', text: '证明附件', dictCode: '' })
      fieldList.push({ type: 'int', value: 'spStatus', text: '审批状态', dictCode: '' })
      fieldList.push({ type: 'string', value: 'spFlow', text: '审批流程节点', dictCode: '' })
      fieldList.push({ type: 'string', value: 'sprName', text: '当前审批人', dictCode: '' })
      fieldList.push({ type: 'string', value: 'no', text: '工号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'name', text: '姓名', dictCode: '' })
      this.superFieldList = fieldList
    },
  },
}
</script>

<style scoped lang="less">
.ant-tag {
  margin: 0 !important;
}

/* ==== 页面容器 ==== */
.otapply-list-panel {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--attendance-background, #f8fafd);
  overflow: hidden;
  animation: rule-slide-in-right 0.3s ease-out both;
  padding: 8px 10px 0;
}

// ---------- 标题栏 ----------
.rule-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 12px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.rule-main-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a2a3d;
}

// ---------- 筛选栏 ----------
.rule-filter-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  flex-shrink: 0;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.rule-filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rule-filter-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
}

.rule-filter-input,
.rule-filter-select,
.rule-filter-date,
.rule-filter-cascader {
  width: 160px;

  /deep/ .ant-input,
  /deep/ .ant-select-selection,
  /deep/ .ant-cascader-picker {
    height: 32px;
    border-color: #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: none;
    font-size: 12px;

    &:focus {
      border-color: rgba(37, 99, 235, 0.4);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
    }
  }

  /deep/ .ant-select-selection:hover,
  /deep/ .ant-select-focused .ant-select-selection {
    border-color: rgba(37, 99, 235, 0.4);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }
}

.rule-filter-date {
  /deep/ .ant-calendar-picker {
    width: 100% !important;
  }

  /deep/ .ant-calendar-range-picker-input {
    font-size: 12px;
  }

  /deep/ .ant-input {
    font-size: 12px;
  }
}

.rule-filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

// ---------- Tab + 工具栏 同一行 ----------
.rule-tab-bar {
  position: relative;
  flex-shrink: 0;
}

// ---------- 操作工具栏 ----------
.rule-toolbar {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
}

// ---------- 按钮 ----------
.rule-btn-primary {
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
  font-size: 12px;
  font-weight: 600;

  &:hover,
  &:focus {
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    opacity: 0.92;
  }
}

.rule-btn-reset {
  height: 34px;
  border-radius: 8px;
  color: #64748b;
  border-color: #e2e8f0;
  background: #ffffff;
  font-size: 12px;
  font-weight: 600;

  &:hover {
    color: #1a2a3d;
    border-color: rgba(37, 99, 235, 0.35);
  }
}

// ---------- 表格容器 ----------
.rule-table-wrap {
  flex: 1;
  min-height: 0;
  margin-top: 12px;
  padding: 12px 16px 18px;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;

  /deep/ .ant-spin-nested-loading,
  /deep/ .ant-spin-container {
    min-height: 100%;
  }

  /deep/ .ant-table {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }

  /deep/ .ant-table-thead > tr > th {
    background: rgba(37, 99, 235, 0.03);
    color: #1a2a3d;
    font-weight: 600;
    font-size: 12px;
    border-bottom: 2px solid rgba(37, 99, 235, 0.08);
  }

  /deep/ .ant-table-tbody > tr:hover > td {
    background: rgba(37, 99, 235, 0.02);
  }

  /deep/ .ant-table-pagination.ant-pagination {
    margin: 16px 0 0;
  }
}

// ---------- Tab 颜色样式 ----------
/deep/ .ant-tabs-card > .ant-tabs-bar {
  margin: 0;
}

/deep/ .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab {
  color: #e6f7ff;
  border-radius: 10px 10px 0 0;
  background: #0082fc;
}

/deep/ .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active {
  background: #0082fc;
}

/* 未激活状态 - 不同状态的颜色 */
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='1']) {
  background: #fa8c16;
  /* 审批中/待审批 - 橙色 */
}

::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='2']) {
  background: #55c42a;
  /* 已通过 - 绿色 */
}

::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='4']) {
  background: #f5222d;
  /* 已退回 - 红色 */
}

// ---------- 动画 ----------
@keyframes rule-slide-in-right {
  from {
    opacity: 0;
    transform: translateX(12px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// ---------- 响应式 ----------
@media (max-width: 900px) {
  .rule-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .rule-filter-item {
    width: 100%;
  }

  .rule-filter-input,
  .rule-filter-select,
  .rule-filter-date,
  .rule-filter-cascader {
    flex: 1;
    width: auto;
  }

  .rule-title-bar {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }
}
</style>
