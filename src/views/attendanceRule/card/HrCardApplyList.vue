<template>
  <!--
    HrCardApplyList.vue
    补卡申请列表主页面
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
          <span slot="tab" :data-status="item.value">
            {{ item.title }}({{ item.count }})
          </span>
        </a-tab-pane>
      </a-tabs>

      <!-- ==== 操作按钮区域 ==== -->
      <div class="rule-toolbar">
        <!-- 申请页-已撤回时显示「新增」按钮 -->
        <a-button v-if="boxState !== 1" type="primary" class="rule-btn-primary" icon="plus" @click="handleAdd">
          新增
        </a-button>
        <!-- 导出按钮（预留） -->
        <a-button class="rule-btn-primary" type="primary" icon="download"
          @click="handleExportXls('补卡申请表')">导出</a-button>
        <a-button type="primary" class="rule-btn-primary" icon="setting" @click="toggleColumnConfig">字段配置</a-button>
      </div>
    </div>

    <!-- ==== 搜索栏 ==== -->
    <div class="rule-filter-bar">
      <div class="rule-filter-item">
        <span class="rule-filter-label">姓名</span>
        <a-input v-model="queryParam.name" allowClear placeholder="请输入姓名" class="rule-filter-input"
          @pressEnter="searchQuery" />
      </div>
      <div class="rule-filter-item">
        <span class="rule-filter-label">工号</span>
        <a-input v-model="queryParam.no" allowClear placeholder="请输入工号" class="rule-filter-input"
          @pressEnter="searchQuery" />
      </div>

      <div class="rule-filter-item">
        <span class="rule-filter-label">公司</span>
        <a-select v-model="queryParam.companyId" allowClear placeholder="请选择公司" class="rule-filter-select"
          @change="onCompanyChange">
          <a-select-option v-for="item in companyList" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>
      <div class="rule-filter-item">
        <span class="rule-filter-label">部门</span>
        <a-cascader :options="deptList" v-model="deptArr" placeholder="请选择部门" class="rule-filter-cascader"
          changeOnSelect :show-search="{ filter }" :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
          @change="onCascaderChange" />
      </div>

      <div class="rule-filter-item">
        <span class="rule-filter-label">异常类型</span>
        <j-dict-select-tag v-model="queryParam.ycType" dictCode="ycDkstatus" allowClear
          placeholder="请选择规则名称" class="rule-filter-select" />
      </div>

      <div class="rule-filter-actions">
        <a-button type="primary" class="rule-btn-primary" @click="searchQuery">查询</a-button>
        <a-button class="rule-btn-reset" @click="searchReset">重置</a-button>
      </div>
    </div>

    <!-- ==== Table 区域 ==== -->
    <div class="rule-table-wrap">
      <a-table ref="table" size="middle" :scroll="{ x: 1400 }" bordered rowKey="id" :columns="columns"
        :dataSource="dataSource" :pagination="ipagination" :loading="loading"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }" class="j-table-force-nowrap"
        @change="handleTableChange">
        <!-- ==== 自定义列模板 ==== -->

        <!-- 审批状态 a-tag -->
        <template slot="stateTag" slot-scope="text, record">
          <a-tag :color="stateTagColor(text, record)" style="margin: 0;">
            {{ stateTagText(text, record) }}
          </a-tag>
        </template>

        <!-- 异常类型 -->
        <template slot="ycType" slot-scope="text,red">
          <a-tag :color="getAttendanceStatusClassObj(text).color">
              {{ getAttendanceStatusClassObj(text).text }}
            </a-tag>
        </template>

        <!-- 附件查看 -->
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px; font-style: italic;">无附件</span>
          <a-button v-else :ghost="true" type="primary" size="small" @click="lookPdf(text)">
            查看
          </a-button>
        </template>

        <!-- ==== 操作列 ==== -->
        <span slot="action" slot-scope="text, record">
          <!-- 申请页 - 已撤回/已退回: 编辑 / 提交审批 -->
          <template v-if="(activeKey == 4 || activeKey == 3) && boxState != 1">
            <a @click="handleEdit(record)">修改重申</a>
            <a-divider type="vertical" />
            <a-popconfirm v-if="activeKey == 3" title="确定删除吗?" @confirm="handleDelete(record.id)">
              <a style="color: red;">删除</a>
            </a-popconfirm>
            <a-divider v-if="activeKey == 3" type="vertical" />
            <a @click="handleDetail(record)">详情</a>
          </template>

          <!-- 申请页 - 审批中: 详情 / 撤回（仅本人发起的单据可撤回） -->
          <template v-if="activeKey == 1 && boxState != 1">
            <a-popconfirm title="确定撤回申请吗？" v-if="isSelfApply(record)" @confirm="handleRevoke(record)">
              <a style="color: #ff5500;">撤回</a>
            </a-popconfirm>
            <a-divider type="vertical" v-if="isSelfApply(record)" />
            <a @click="handleDetail(record)">详情</a>
          </template>

          <!-- 申请页 - 已通过: 详情 -->
          <template v-if="activeKey == 2 && boxState != 1">
            <a @click="handleDetail(record)">详情</a>
          </template>

          <!-- 审批页 - 待审批: 审批 / 详情 -->
          <template v-if="activeKey == 1 && boxState == 1">
            <a v-if="isCurrentApprover(record) && record.brSpStatus == 1" style="color: #ff5500;" @click="handleApprove(record)">审批</a>
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

          <!-- 日志（通用） -->
          <a-divider type="vertical" />
          <a style="color: orange;" @click="getLct(record)">日志</a>
        </span>
      </a-table>
    </div>

    <!-- ==== 弹窗 / 抽屉 ==== -->

    <!-- 新增/编辑/审批/详情弹窗 -->
    <hr-card-apply-modal ref="modalForm" @ok="modalFormOk"></hr-card-apply-modal>

    <!-- 审批日志时间轴 -->
    <hr-card-apply-log :LCid="LCid" :LCdata="LCdata" :LCshow="LCshow" @out="LCshow = false"></hr-card-apply-log>

    <!-- 退回弹窗 -->
    <hr-reject-modal :LCstate="boxState" :ZFAll="ZFAll" :ShowZF="ShowZF" @goBack="goBack"></hr-reject-modal>

    <column-config-sidebar :visible="columnConfigVisible" :allColumns="columnConfigNew" :fieldTitleMap="fieldTitleMap"
      @close="columnConfigVisible = false" @confirm="handleColumnConfigConfirm" />
  </div>
</template>

<script>
/**
 * 补卡申请列表主页面
 *
 * 双模式：
 *   - boxState=0（默认）：申请人视角，Tab = 审批中/已通过/已撤回/已退回
 *   - boxState=1：审批人视角，Tab = 待审批/已审批/抄送我的
 *
 * 状态定义：
 *   spStatus: 1=审批中 2=已通过 3=已撤回 4=已退回
 *   spFlow: 1=部门经理 2=HR 3=抄送人
 */
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { mixinDevice } from '@/utils/mixin'
import Vue from 'vue'
import { httpAction, getAction, getFileAccessHttpUrl, postAction } from '@/api/manage'
import HrCardApplyModal from './modules/HrCardApplyModal'
import HrCardApplyLog from './modules/HrCardApplyLog'
import HrRejectModal from './modules/HrRejectModal'

import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'
import { columnConfigMixin } from '@/mixins/columnConfigMixin'

import '@/assets/less/TableExpand.less'

const attendanceStatusMap = {
  NORMAL: { text: '正常', color: 'green', },
  BE_LATE: { text: '迟到', color: 'orange',  },
  LEAVE_EARLY: { text: '早退', color: 'purple',  },
  MISSING: { text: '缺卡', color: 'blue', },
  ABSENT: { text: '旷工', color: 'red',  },
}
export default {
  name: 'HrCardApplyList',
  mixins: [JeecgListMixin, mixinDevice, columnConfigMixin],
  components: {
    HrCardApplyModal,
    HrCardApplyLog,
    ColumnConfigSidebar,
    HrRejectModal
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
      required: false
    }
  },
  data() {
    return {
      description: '补卡申请列表页面',

      // 当前选中的 Tab key（双向绑定）
      activeKey: '1',

      // 申请页 Tab 列表
      applyTabsList: [
        { title: '审批中', value: '1', count: 0 },
        { title: '已通过', value: '2', count: 0 },
        { title: '已撤回', value: '3', count: 0 },
        { title: '不通过', value: '4', count: 0 }
      ],

      // 审批页 Tab 列表
      approveTabsList: [
        { title: '待审批', value: '1', count: 0 },
        { title: '已审批', value: '2', count: 0 },
        { title: '抄送我的', value: '99', count: 0 }
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

      // ==== 表头定义 ====
      columnCode: 'HrBksq',

      url: {
        list: "/hr_bksq/hrBksq/list",
        delete: "/hr_bksq/hrBksq/delete",
        deleteBatch: "/hr_bksq/hrBksq/deleteBatch",
        exportXlsUrl: "/hr_bksq/hrBksq/exportXls",
        importExcelUrl: "hr_bksq/hrBksq/importExcel",
        edit: '/hr_bksq/hrBksq/edit',
        count: '/hr_bksq/hrBksq/getSpStatusCount',
        draw: '/hr_bksq/hrBksq/updateWithdraw',
        csrList: '/hr_bksq/hrBksq/queryCsrList',
      },
      disableMixinCreated: true,
    }
  },
  created() {
    this.getSuperFieldList();
    this.getCompanyList();
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
          title: '异常类型',
          align: "center",
          width: 100,
          dataIndex: 'ycType',
          scopedSlots: { customRender: 'ycType' }
        },
        {
          title: '审批状态',
          align: 'center',
          dataIndex: 'spStatus',
          width: 100,
          scopedSlots: { customRender: 'stateTag' }
        },
        {
          title: '当前节点',
          align: 'center',
          dataIndex: 'spFlow',
          width: 180,
          customRender: (text, record) => {
            // 审批通过、已撤回、已退回时显示对应状态
            if (record.spStatus == 2) {
              return <a-tag color="#00aa7f">已通过</a-tag>
            }
            if (record.spStatus == 3) {
              return <a-tag color="#d9d9d9">已撤回</a-tag>
            }
            if (record.spStatus == 4) {
              return <a-tag color="#ff6f6f">不通过</a-tag>
            }
            // 审批中 - 显示当前审批节点
            return (
              <a-tag color="#00aaff">
                审批中({text || '未知'})
              </a-tag>
            )
          }
        },
      ]
      let mapB = [
        {
          title: '公司',
          align: 'center',
          dataIndex: 'companyId_dictText',
          width: 180
        },
        {
          title: '部门',
          align: 'center',
          dataIndex: 'dept_dictText',
          width: 180
        },
        {
          title: '工号',
          align: 'center',
          dataIndex: 'no',
          width: 80
        },
        {
          title: '姓名',
          align: 'center',
          dataIndex: 'name',
          width: 100
        },
        {
          title: '补卡时间',
          align: 'center',
          dataIndex: 'bkTime',
          width: 140,
          customRender: (text, record) => this.formatBkTime(text, record)
        },
        {
          title: '补卡原因',
          align: 'center',
          dataIndex: 'reason',
          width: 200,
          ellipsis: true,
          customRender: (text) => {
            return <a-tooltip style='width: 180px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
              <template slot="title">{text}</template>
              <span>{text}</span>
            </a-tooltip>
          }
        },
        {
          title: '附件',
          align: 'center',
          dataIndex: 'attachmentUrls',
          width: 100,
          scopedSlots: { customRender: 'fileSlot' }
        },
      ]
      let mapC = [
        {
          title: '审批人',
          align: 'center',
          dataIndex: 'sprName',
          width: 200,
          ellipsis: true,
          customRender: (t, red) => {
            let text = []
            if(!red.customProcessSqdSpjdList){
              return ''
            }
            red.customProcessSqdSpjdList.map(item => {
              if (item.nodeName == red.spFlow) {
                text.push(item.sprName)
              }
            })
            return <a-tooltip style='width: 180px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
              <template slot="title">{text.join(',')}</template>
              <span>{text.join(',') || '-'}</span>
            </a-tooltip>
          }
        },
      ]

      if (this.activeKey == 2 || this.activeKey == 4) {
        return [...mapA, ...mapB, ]
      }

      return [...mapA, ...mapC, ...mapB, ]
    },
    fieldTitleMap() {
      let map = {}
      this.originalColumns.forEach(item => {
        if (item.dataIndex != 'action') {
          map[item.dataIndex] = item.title
        }
      })
      return map
    },
    columns() {
      let fixedColumns = [
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          // 已撤回(3)有 修改重申|删除|详情|日志 四个操作，比其他 Tab 多，需要更宽，
          // 否则固定列右侧会把末尾「日志」裁掉
          width: this.activeKey == 3 ? 220 : 180,
          scopedSlots: { customRender: 'action' }
        }
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
      }
    }
  },
  methods: {
    getAttendanceStatusClassObj(key) {
      let obj = {
        color: '', text: ''
      }
      obj = attendanceStatusMap[key]
      return obj || {}
    },
    /**
     * 补卡时间展示：旷工（ABSENT）只显示日期，去掉 00:00:00
     */
    formatBkTime(text, record) {
      if (!text) return text
      const isAbsent = record && (record.ycType === 'ABSENT' || (record.ycType_dictText || '').indexOf('旷工') !== -1)
      if (isAbsent) {
        return String(text).replace(/\s00:00:00$/, '')
      }
      return text
    },
    /**
     * 加载列表数据
     * - 抄送我的 tab 使用独立接口 queryCsrList，入参 csrNo 取当前登录账号工号
     * - 其他 tab 使用默认 list 接口
     */
    loadData(arg) {
      // 抄送我的 tab 使用新接口
      if (this.activeKey == 99 && this.boxState == 1) {
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
            const csrTab = this.approveTabsList.find(item => item.value == 99)
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
        this.$message.error("请设置url.list属性!")
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
      getAction(this.url.count).then(res => {
        if (res.success) {
          let arr = res.result
          // 当前在「抄送我的」Tab 时，角标已由 loadData 的列表请求顺带更新，
          // 这里先留存，避免被下方清零逻辑覆盖
          const csrTabExist = this.approveTabsList.find(item => item.value == 99)
          const csrCountKeep = this.activeKey == 99 && csrTabExist ? csrTabExist.count : 0
          this.applyTabsList = this.applyTabsList.map(item => {
                        item.count = 0
                        return item
                    })
                    this.approveTabsList = this.approveTabsList.map(item => {
                        item.count = item.value == 99 ? csrCountKeep : 0
                        return item
                    })
          arr.forEach(item => {
            this.applyTabsList.forEach(tab => {
              if (tab.value == item.spStatus) {
                tab.count = item.total
              }
            })
            this.approveTabsList.forEach(tab => {
              if (tab.value == item.spStatus) {
                tab.count = item.total
              }
            })
          })
          // 抄送我的数量从 queryCsrList 接口获取（仅审批页）
          // 当前就在「抄送我的」Tab 时，total 已由 loadData 的列表请求顺带更新，无需再发一次 pageSize=1 的请求
          if (this.boxState == 1 && this.activeKey != 99) {
            this.getCsrCount()
          }
        }
      })
    },

    /**
     * 获取抄送我的数量
     */
    getCsrCount() {
      getAction(this.url.csrList, { csrNo: this.getUserNo(), pageNo: 1, pageSize: 1 }).then(res => {
        if (res.success) {
          const csrTab = this.approveTabsList.find(item => item.value == 99)
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
      getAction('/org/hrmOrg/loadTreeRoot?pid=0').then(res => {
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
      getAction('/org/hrmOrg/loadTreeRoot', { pid: companyId }).then(res => {
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
      return path.some(option => option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
    },

    // ==== 状态标签相关 ====

    /**
     * 审批状态 a-tag 颜色
     */
    stateTagColor(text, record) {
      const state = record.spStatus
      const colorMap = {
        1: '#f88b29',   // 审批中 - 橙色
        2: '#00aa7f',   // 已通过 - 绿
        3: '#d9d9d9',   // 已撤回 - 灰
        4: '#ff6f6f'    // 已退回 - 红
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
        4: '不通过'
      }
      return textMap[state] || '未知'
    },

    // ==== Tab 切换 ====

    /**
     * 判断当前登录用户是否为该单据的申请人本人
     * 用于申请页「撤回」按钮：只有本人发起的单据才能撤回
     * @param {Object} record - 当前行数据
     * @returns {Boolean}
     */
    isSelfApply(record) {
      if (!record) return false
      const perInfo = Vue.ls.get('perInfo') || {}
      const userName = String(perInfo.name || '').trim()
      return !!userName && userName === String(record.name || '').trim()
    },

    /**
     * 判断当前登录用户是否为该申请当前审批节点的审批人之一
     * 注意：sprId / sprName 可能是逗号分隔的多个人，需要拆分后匹配
     * 匹配优先级：sprId（用户ID） → 工号 → sprName（姓名）
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

      // 筛选出当前节点的审批人记录
      const currentNodeApprovers = spjdList.filter(item => item.nodeName == record.spFlow)
      if (currentNodeApprovers.length === 0) {
        return false
      }

      // 当前用户的各个标识
      const userId = String(userInfo.id || '').trim()
      const userNo = String(userInfo.username || userInfo.no || '').trim()
      const realname = (userInfo.realname || '').trim()

      // 遍历当前节点的每条审批人记录（每条里可能是逗号分隔的多人）
      for (const item of currentNodeApprovers) {
        // 1. 拆分 sprId 数组，逐个匹配用户ID
        if (userId && item.sprId) {
          const sprIdList = String(item.sprId).split(',').map(s => s.trim()).filter(Boolean)
          if (sprIdList.includes(userId)) {
            return true
          }
        }

        // 2. 拆分 sprId 数组，逐个匹配工号（抄送节点的 sprId 存的是工号）
        if (userNo && item.sprId) {
          const sprIdList = String(item.sprId).split(',').map(s => s.trim()).filter(Boolean)
          if (sprIdList.includes(userNo)) {
            return true
          }
        }

        // 3. 拆分 sprName 数组，逐个匹配姓名
        if (realname && item.sprName) {
          const sprNameList = String(item.sprName).split(',').map(s => s.trim()).filter(Boolean)
          if (sprNameList.includes(realname)) {
            return true
          }
        }
      }

      return false
    },

    /**
     * Tab 切换处理
     * @param {String} key - Tab title
     */
    callback(key) {
      this.activeKey = key
      this.applyTabStatusFilter()
      this.loadData(1);
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
      this.queryParam = {}
      this.applyTabStatusFilter()
      this.deptArr=[]

      this.loadData(1);
    },

    // ==== 操作按钮 ====

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
     * @param {Object} record
     */
    handleSubmit(record) {
      httpAction(this.url.edit, {
        ...record,
        spStatus: 1,
      }, 'put').then((res) => {
        if (res.success) {
          this.$message.success(res.message)
          this.loadData()
        }
      })
    },

    /**
     * 撤回申请
     * spStatus: 1 → 3, 已撤回
     * @param {Object} record
     */
    handleRevoke(record) {
      httpAction(`${this.url.draw}`, {
        ...record,
        spStatus: 3,
      }, 'post').then((res) => {
        if (res.success) {
          this.$message.success(res.message)
          this.loadData()
        }
      })
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
     * @param {Boolean} num
     */
    goBack(num) {
      this.ShowZF = false
      this.loadData()
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

    getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'string',value:'no',text:'员工工号',dictCode:''})
        fieldList.push({type:'string',value:'name',text:'员工姓名',dictCode:''})
        fieldList.push({type:'int',value:'ycType',text:'异常类型',dictCode:'ycDkstatus'})
        fieldList.push({type:'string',value:'spFlow',text:'审批节点',dictCode:''})
        fieldList.push({type:'datetime',value:'bkTime',text:'待补卡时间'})
        fieldList.push({type:'string',value:'reason',text:'补卡原因说明',dictCode:''})
        this.superFieldList = fieldList
      }
    }
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
}

.rule-filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  // margin-left: auto;
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

  /deep/ .ant-table-thead>tr>th {
    background: rgba(37, 99, 235, 0.03);
    color: #1a2a3d;
    font-weight: 600;
    font-size: 12px;
    border-bottom: 2px solid rgba(37, 99, 235, 0.08);
  }

  /deep/ .ant-table-tbody>tr:hover>td {
    background: rgba(37, 99, 235, 0.02);
  }

  /deep/ .ant-table-pagination.ant-pagination {
    margin: 16px 0 0;
  }
}

// ---------- Tab 颜色样式 ----------
/deep/ .ant-tabs-card>.ant-tabs-bar {
  margin: 0;
}

/deep/ .ant-tabs-card>.ant-tabs-bar .ant-tabs-tab {
  color: #e6f7ff;
  border-radius: 10px 10px 0 0;
  background: #0082fc;
}

/deep/ .ant-tabs-card>.ant-tabs-bar .ant-tabs-tab-active {
  background: #0082fc;
}

/* 未激活状态 - 不同状态的颜色 */
::v-deep .ant-tabs-card>.ant-tabs-bar .ant-tabs-tab:has([data-status="1"]) {
  background: #fa8c16;
  /* 审批中/待审批 - 橙色 */
}

::v-deep .ant-tabs-card>.ant-tabs-bar .ant-tabs-tab:has([data-status="2"]) {
  background: #55c42a;
  /* 已通过 - 绿色 */
}

::v-deep .ant-tabs-card>.ant-tabs-bar .ant-tabs-tab:has([data-status="4"]) {
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
