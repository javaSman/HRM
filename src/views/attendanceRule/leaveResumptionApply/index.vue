<template>
  <!--
    LeaveResumptionApply/index.vue
    销假申请列表主页面
    功能：申请人端 + 审批人端 双模式
      - boxState=0（默认）：申请页 Tab（审批中/已通过/不通过/已撤回）
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
        <!-- 申请页显示「新增」按钮 -->
        <a-button v-if="boxState !== 1" type="primary" class="rule-btn-primary" icon="plus" @click="handleAdd">
          新增销假
        </a-button>
        <!-- 导出按钮 -->
        <a-button class="rule-btn-primary" type="primary" icon="download" @click="handleExportXls('销假申请表')"
          >导出</a-button
        >
        <a-button type="primary" class="rule-btn-primary" icon="setting" @click="toggleColumnConfig">字段配置</a-button>
      </div>
    </div>

    <!-- ==== 搜索栏 ==== -->
    <div class="rule-filter-bar">
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
        <span class="rule-filter-label">所属部门</span>
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
        <span class="rule-filter-label">销假类型</span>
        <!-- 字典 xj_type：value 即类型文本（如「年假」），与销假申请表单取值口径一致 -->
        <j-dict-select-tag
          v-model="queryParam.xjType"
          dictCode="xj_type"
          allowClear
          placeholder="请选择销假类型"
          class="rule-filter-select"
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
        :scroll="{ x: tableScroll }"
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
        <!-- 序号 -->
        <template slot="index" slot-scope="text, record, index">
          {{ (ipagination.current - 1) * ipagination.pageSize + parseInt(index) + 1 }}
        </template>

        <!-- 销假类型（字典 xj_type，value 即类型文本；后端挂了 dictText 时优先取 dictText） -->
        <template slot="xjTypeSlot" slot-scope="text, record">
          <a-tag color="blue">{{ record.xjType_dictText || text || '-' }}</a-tag>
        </template>

        <!-- 审批状态 -->
        <template slot="stateTag" slot-scope="text, record">
          <a-tag :color="stateTagColor(text, record)" style="margin: 0">
            {{ stateTagText(text, record) }}
          </a-tag>
        </template>

        <!-- 当前节点 -->
        <template slot="spFlowSlot" slot-scope="text, record">
          <span v-if="record.spStatus == 2" style="color: #55c42a">已通过</span>
          <span v-else-if="record.spStatus == 3" style="color: #0082fc">已撤回</span>
          <span v-else-if="record.spStatus == 4" style="color: #f5222d">不通过</span>
          <a-tag v-else color="#fa8c16">审批中({{ text || '未知' }})</a-tag>
        </template>

        <!-- 销假原因 -->
        <template slot="reasonSlot" slot-scope="text">
          <a-tooltip v-if="text" placement="topLeft">
            <template slot="title">{{ text }}</template>
            <span class="ellipsis-text">{{ text }}</span>
          </a-tooltip>
          <span v-else>-</span>
        </template>

        <!-- ==== 操作列 ==== -->
        <span slot="action" slot-scope="text, record">
          <!-- 申请页 - 审批中: 撤回（仅申请人本人） / 详情 -->
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

          <!-- 申请页 - 不通过: 修改重申 / 删除（仅申请人本人） / 详情 -->
          <template v-if="activeKey == 4 && boxState != 1">
            <a v-if="isApplyOwner(record)" @click="handleEdit(record)">修改重申</a>
            <a-divider v-if="isApplyOwner(record)" type="vertical" />
            <a-popconfirm v-if="isApplyOwner(record)" title="确定删除吗?" @confirm="handleDelete(record.id)">
              <a style="color: red">删除</a>
            </a-popconfirm>
            <a-divider v-if="isApplyOwner(record)" type="vertical" />
            <a @click="handleDetail(record)">详情</a>
          </template>

          <!-- 申请页 - 已撤回: 删除（仅申请人本人） / 详情 -->
          <template v-if="activeKey == 3 && boxState != 1">
            <a-popconfirm v-if="isApplyOwner(record)" title="确定删除吗?" @confirm="handleDelete(record.id)">
              <a style="color: red">删除</a>
            </a-popconfirm>
            <a-divider v-if="isApplyOwner(record)" type="vertical" />
            <a @click="handleDetail(record)">详情</a>
          </template>

          <!-- 审批页 - 待审批: 审批（当前审批人 且 brSpStatus=1） / 详情 -->
          <template v-if="activeKey == 1 && boxState == 1">
            <a
              v-if="isCurrentApprover(record) && record.brSpStatus == 1"
              style="color: #ff5500"
              @click="handleApprove(record)"
              >审批</a
            >
            <a-divider v-if="isCurrentApprover(record) && record.brSpStatus == 1" type="vertical" />
            <a @click="handleDetail(record)">详情</a>
          </template>

          <!-- 审批页 - 已审批: 详情 -->
          <template v-if="activeKey == 2 && boxState == 1">
            <a @click="handleDetail(record)">详情</a>
          </template>

          <!-- 审批页 - 抄送我的: 详情 -->
          <template v-if="activeKey == 99 && boxState == 1">
            <a @click="handleDetail(record)">详情</a>
          </template>

          <!-- 日志（通用）—— 暂时屏蔽，需要时恢复以下两行即可
          <a-divider type="vertical" />
          <a style="color: orange" @click="getLct(record)">日志</a>
          -->
        </span>
      </a-table>
    </div>

    <!-- ==== 弹窗 / 抽屉 ==== -->
    <!-- 新增/编辑/审批/详情弹窗 -->
    <leave-resumption-modal ref="modalForm" @ok="modalFormOk"></leave-resumption-modal>

    <!-- 审批日志时间轴 -->
    <leave-resumption-apply-log
      :LCid="LCid"
      :LCdata="LCdata"
      :LCshow="LCshow"
      @out="LCshow = false"
    ></leave-resumption-apply-log>

    <!-- 撤回弹窗（撤回原因 spOpinion 选填） -->
    <leave-resumption-revoke-modal
      :visible="revokeVisible"
      :record="revokeRecord"
      @ok="handleRevokeOk"
      @cancel="revokeVisible = false"
    ></leave-resumption-revoke-modal>

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
 * 销假申请列表主页面
 *
 * 双模式：
 *   - boxState=0（默认）：申请人视角，Tab = 审批中/已通过/不通过/已撤回
 *   - boxState=1：审批人视角，Tab = 待审批/已审批/抄送我的
 *
 * 状态定义：
 *   spStatus: 1=审批中 2=已通过 3=已撤回 4=不通过
 *   spFlow: 1=部门经理 2=HR 3=抄送人
 */
import Vue from 'vue'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { mixinDevice } from '@/utils/mixin'
import { getAction } from '@/api/manage'

import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'
import { columnConfigMixin } from '@/mixins/columnConfigMixin'

import LeaveResumptionModal from './modules/LeaveResumptionModal'
import LeaveResumptionApplyLog from './modules/LeaveResumptionApplyLog'
import LeaveResumptionRevokeModal from './modules/LeaveResumptionRevokeModal'

import '@/assets/less/TableExpand.less'

export default {
  name: 'LeaveResumptionApply',
  mixins: [JeecgListMixin, mixinDevice, columnConfigMixin],
  components: {
    ColumnConfigSidebar,
    LeaveResumptionModal,
    LeaveResumptionApplyLog,
    LeaveResumptionRevokeModal,
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
  },
  data() {
    return {
      description: '销假申请列表页面',

      // 当前选中的 Tab key（双向绑定）
      activeKey: '1',

      // 申请页 Tab 列表
      applyTabsList: [
        { title: '审批中', value: '1', count: 0 },
        { title: '已通过', value: '2', count: 0 },
        { title: '不通过', value: '4', count: 0 },
        { title: '已撤回', value: '3', count: 0 },
      ],

      // 审批页 Tab 列表（已审批 value=2 实际包含 审批通过(2) + 不通过(4)，见 applyTabStatusFilter / getCount）
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
      // 岗位列表
      positionList: [],

      // ==== 日志时间轴 ====
      LCid: '',
      LCshow: false,
      LCdata: {},

      // ==== 撤回弹窗 ====
      revokeVisible: false,
      revokeRecord: {},

      // ==== 表头定义 ====
      columnCode: 'HrKqXjgl',

      url: {
        list: '/hr_kq_xjgl/hrKqXjgl/list',
        delete: '/hr_kq_xjgl/hrKqXjgl/delete',
        deleteBatch: '/hr_kq_xjgl/hrKqXjgl/deleteBatch',
        exportXlsUrl: '/hr_kq_xjgl/hrKqXjgl/exportXls',
        importExcelUrl: 'hr_kq_xjgl/hrKqXjgl/importExcel',
        edit: '/hr_kq_xjgl/hrKqXjgl/edit',
        count: '/hr_kq_xjgl/hrKqXjgl/getSpStatusCount',
        // 抄送我的列表（入参 csrNo=当前登录人工号）
        csrList: '/hr_kq_xjgl/hrKqXjgl/queryCsrList',
      },
      disableMixinCreated: true,
    }
  },
  created() {
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
      // 左侧：状态相关列
      let mapA = [
        {
          title: '序号',
          align: 'center',
          width: 60,
          scopedSlots: { customRender: 'index' },
        },
        {
          title: '当前节点',
          align: 'center',
          dataIndex: 'spFlow',
          width: 160,
          scopedSlots: { customRender: 'spFlowSlot' },
        },
        {
          title: '审批人',
          align: 'center',
          dataIndex: 'sprName',
          width: 120,
          ellipsis: true,
          // customRender: (t, red) => {
          //   let text = []
          //   if (!red.customProcessSqdSpjdList) {
          //     return ''
          //   }
          //   // 同一节点多次驳回后会存在多条记录，只取当前节点（nodeName == spFlow）最后一条的 sprName
          //   const nodeRecords = red.customProcessSqdSpjdList.filter((item) => item.nodeName == red.spFlow)
          //   const lastNode = nodeRecords.length ? nodeRecords[nodeRecords.length - 1] : null
          //   if (lastNode && lastNode.sprName) {
          //     text.push(lastNode.sprName)
          //   }
          //   return (
          //     <a-tooltip style="width: 100px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block">
          //       <template slot="title">{text.join(',')}</template>
          //       <span>{text.join(',') || '-'}</span>
          //     </a-tooltip>
          //   )
          // },
        },
        {
          title: '销假类型',
          align: 'center',
          width: 100,
          dataIndex: 'xjType',
          scopedSlots: { customRender: 'xjTypeSlot' },
        },
      ]

      // 中间：人员信息列
      let mapB = [
        {
          title: '公司',
          align: 'center',
          dataIndex: 'companyId_dictText',
          width: 140,
        },
        {
          title: '所属部门',
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
          width: 80,
        },
      ]

      // 右侧：销假信息列（字段名与后端 hr_kq_xjgl 实体一致，参考 HrKqXjglList）
      let mapC = [
        {
          title: '到岗时间',
          align: 'center',
          dataIndex: 'actualEndTime',
          width: 160,
        },
        {
          title: '实际请假时长',
          align: 'center',
          dataIndex: 'actualHours',
          width: 120,
          customRender: (text, record) => {
            if (text === null || text === undefined || text === '') return '-'
            // actualHoursDw：时长单位（天、小时），无单位时直接展示数值
            return record.actualHoursDw ? `${text}${record.actualHoursDw}` : `${text}`
          },
        },
        {
          title: '销假原因',
          align: 'center',
          dataIndex: 'xjyy',
          ellipsis: true,
        },
      ]

      // 审批状态列（所有 Tab 均展示）
      const stateColumn = {
        title: '审批状态',
        align: 'center',
        dataIndex: 'spStatus',
        width: 100,
        scopedSlots: { customRender: 'stateTag' },
      }

      //审批中 / 待审批时显示审批人
      if (this.activeKey == 1) {
        return [mapA[0], stateColumn, ...mapA.slice(1), ...mapB, ...mapC]
      }
      // 其他状态不显示审批人
      return [
        mapA[0], // 序号
        stateColumn,
        ...mapA.slice(3), // 销假类型
        ...mapB,
        ...mapC,
      ]
    },

    fieldTitleMap() {
      let map = {}
      this.originalColumns.forEach((item) => {
        if (item.dataIndex && item.dataIndex != 'action') {
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
          width: 180,
          scopedSlots: { customRender: 'action' },
        },
      ]
      return this.applyColumnConfig(this.originalColumns, { fixedColumns })
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
      immediate: true,
      handler(val) {
        this.getCount()
      },
    },
  },
  methods: {
    /**
     * 加载列表数据
     * - 抄送我的 tab（审批页 activeKey=99）使用独立接口 queryCsrList，入参 csrNo 取当前登录账号工号
     * - 其他 tab 使用 JeecgListMixin 默认 list 接口
     */
    loadData(arg) {
      if (this.activeKey == 99 && this.boxState == 1 && this.url.csrList) {
        if (arg === 1) {
          this.ipagination.current = 1
        }
        const params = this.getQueryParams()
        // 抄送接口按 csrNo 查询，spStatus=99 仅为前端 Tab 标识，不下发
        delete params.spStatus
        params.csrNo = this.getUserNo()
        this.loading = true
        getAction(this.url.csrList, params)
          .then((res) => {
            if (res.success) {
              this.dataSource = res.result.records || res.result
              this.ipagination.total = res.result.total || 0
            }
            if (res.code === 510) {
              this.$message.warning(res.message)
            }
          })
          .finally(() => {
            this.loading = false
          })
        return
      }
      // 其他 tab 走 mixin 默认 list 接口
      JeecgListMixin.methods.loadData.call(this, arg)
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
          this.applyTabsList = this.applyTabsList.map((item) => {
            item.count = 0
            return item
          })
          this.approveTabsList = this.approveTabsList.map((item) => {
            item.count = 0
            return item
          })
          arr.forEach((item) => {
            this.applyTabsList.forEach((tab) => {
              if (tab.value == item.spStatus) {
                tab.count = item.total
              }
            })
            this.approveTabsList.forEach((tab) => {
              // 审批页-已审批 包含 审批通过(2) 和 不通过(4)
              if (tab.value == item.spStatus || (tab.value == 2 && item.spStatus == 4)) {
                tab.count += item.total
              }
            })
          })
          // 抄送我的数量从 queryCsrList 接口获取（仅审批页）
          if (this.boxState == 1 && this.url.csrList) {
            this.getCsrCount()
          }
        }
      })
    },

    /**
     * 获取抄送我的数量（pageSize=1，仅取 total）
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
        4: '#f5222d', // 不通过 - 红
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
     * 行数据工号 no 与当前登录人工号一致时才允许删除
     * @param {Object} record - 当前行数据
     * @returns {Boolean}
     */
    isApplyOwner(record) {
      if (!record || !record.no) return false
      // 当前登录人工号从本地缓存 perInfo 中取
      const perInfo = Vue.ls.get('perInfo') || {}
      const userNo = String(perInfo.no || '').trim()
      return !!userNo && String(record.no).trim() === userNo
    },

    /**
     * 判断当前登录用户是否为该申请当前审批节点的审批人之一
     * 只取当前轮次节点 customProcessSqdSpjdList 中当前节点（nodeName == spFlow）的最后一条记录
     * 注意：sprId / sprName 可能是逗号分隔的多个人，需要拆分后匹配
     * 匹配优先级：sprId（用户ID） → 工号 → sprName（姓名）
     * 列表「审批」按钮还需 brSpStatus == 1（后端返回的当前节点可审批标识）
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

      // 筛选出当前节点的审批人记录（同一节点多次驳回后会存在多条，只取最后一条）
      const currentNodeApprovers = spjdList.filter((item) => item.nodeName == record.spFlow)
      if (currentNodeApprovers.length === 0) {
        return false
      }
      const currentNode = currentNodeApprovers[currentNodeApprovers.length - 1]

      // 当前用户的各个标识
      const userId = String(userInfo.id || '').trim()
      const userNo = String(userInfo.username || userInfo.no || '').trim()
      const realname = (userInfo.realname || '').trim()

      // 当前节点最后一条记录里可能是逗号分隔的多人，依次匹配
      const checkApprover = (item) => {
        // 1. 拆分 sprId 数组，逐个匹配用户ID
        if (userId && item.sprId) {
          const sprIdList = String(item.sprId)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
          if (sprIdList.includes(userId)) {
            return true
          }
        }

        // 2. 拆分 sprId 数组，逐个匹配工号（抄送节点的 sprId 存的是工号）
        if (userNo && item.sprId) {
          const sprIdList = String(item.sprId)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
          if (sprIdList.includes(userNo)) {
            return true
          }
        }

        // 3. 拆分 sprName 数组，逐个匹配姓名
        if (realname && item.sprName) {
          const sprNameList = String(item.sprName)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
          if (sprNameList.includes(realname)) {
            return true
          }
        }

        return false
      }

      return checkApprover(currentNode)
    },

    /**
     * Tab 切换处理
     */
    callback(key) {
      this.activeKey = key
      this.applyTabStatusFilter()
      this.loadData(1)
    },

    /**
     * 根据当前 Tab 设置审批状态查询条件
     * 审批页-已审批(boxState=1, activeKey=2)：需同时查询 审批通过(2) 和 不通过(4)，
     * 使用高级查询 OR 条件拼接；其他 Tab 仍按 spStatus 单值查询
     */
    applyTabStatusFilter() {
      if (this.boxState == 1 && this.activeKey == 2) {
        delete this.queryParam.spStatus
        this.superQueryFlag = true
        this.superQueryMatchType = 'or'
        // spStatus 后端为数字类型（1..4），高级查询类型用 int
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
      this.queryParam = {}
      this.applyTabStatusFilter()
      this.deptArr = []

      this.loadData(1)
    },

    // ==== 操作按钮 ====

    /**
     * 新增销假
     */
    handleAdd() {
      this.$refs.modalForm.title = '新增销假'
      this.$refs.modalForm.disableSubmit = false
      this.$refs.modalForm.add()
    },

    /**
     * 编辑（修改重申）
     */
    handleEdit(record) {
      this.$refs.modalForm.title = '修改重申'
      this.$refs.modalForm.disableSubmit = false
      this.$refs.modalForm.edit(record)
    },

    /**
     * 详情
     */
    handleDetail(record) {
      this.$refs.modalForm.title = '详情'
      this.$refs.modalForm.disableSubmit = true
      this.$refs.modalForm.edit(record)
    },

    /**
     * 审批
     */
    handleApprove(record) {
      this.$refs.modalForm.title = '审批'
      this.$refs.modalForm.disableSubmit = true
      this.$refs.modalForm.edit(record)
    },

    /**
     * 撤回申请
     * 打开撤回弹窗，由弹窗收集撤回原因（spOpinion 选填）后调用 updateWithdraw
     * 仅审批中(spStatus=1)且申请人本人可撤回，撤回后 spStatus=3
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

    // ==== 日志时间轴 ====

    /**
     * 打开日志时间轴
     */
    getLct(data) {
      this.LCid = data.id
      this.LCdata = data
      this.LCshow = true
    },

    /**
     * 弹窗提交成功回调
     */
    modalFormOk() {
      this.loadData()
    },

    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'xjType', text: '销假类型', dictCode: 'xj_type' })
      fieldList.push({ type: 'string', value: 'companyId', text: '公司', dictCode: '' })
      fieldList.push({ type: 'string', value: 'dept', text: '所属部门', dictCode: '' })

      fieldList.push({ type: 'string', value: 'no', text: '工号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'name', text: '姓名', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'actualEndTime', text: '到岗时间' })
      fieldList.push({ type: 'BigDecimal', value: 'actualHours', text: '实际请假时长', dictCode: '' })
      fieldList.push({ type: 'string', value: 'actualHoursDw', text: '实际请假时长单位(天、小时)', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'xjyy', text: '销假原因', dictCode: '' })
      fieldList.push({ type: 'int', value: 'spStatus', text: '审批状态', dictCode: '' })
      fieldList.push({ type: 'string', value: 'spFlow', text: '审批流程节点', dictCode: '' })
      fieldList.push({ type: 'string', value: 'sprName', text: '当前审批人', dictCode: '' })
      this.superFieldList = fieldList
    },
  },
}
</script>

<style scoped lang="less">
.ant-tag {
  margin: 0 !important;
}

.ellipsis-text {
  display: block;
  width: 180px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
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
  /* 不通过 - 红色 */
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
}
</style>
