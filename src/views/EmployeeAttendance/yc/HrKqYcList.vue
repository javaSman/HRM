<template>
  <div class="yc-list-panel">
    <a-tabs v-model="activeKey" type="card" @change="callback">
      <a-tab-pane v-for="item in tabsList" :key="item.value">
        <span slot="tab" :data-status="item.value"> {{ item.title }}({{ item.count }}) </span>
      </a-tab-pane>
    </a-tabs>
    <div class="yc-filter-actions" style="position: absolute; right: 5px; top: 5px">
      <!-- <a-button type="primary" class="yc-btn-primary" icon="calendar"
          @click="todayDrawerVisible = true">今日考勤</a-button> -->
      <a-button type="primary" class="yc-btn-primary" icon="download" @click="handleExportXls('员工异常考勤表')"
        >导出数据</a-button
      >
      <a-button class="yc-btn-primary" type="primary" @click="toggleColumnConfig">
        <a-icon type="setting" /> 字段配置
      </a-button>
    </div>
    <!-- 筛选区域 -->
    <div class="yc-filter-bar">
      <div class="yc-filter-item yc-search-wrap">
        <span class="yc-filter-label">姓名</span>
        <a-input
          v-model.trim="queryParam.name"
          class="yc-filter-input"
          allowClear
          placeholder="搜索员工姓名"
          @pressEnter="searchQuery"
        >
        </a-input>
      </div>

      <div class="yc-filter-item">
        <span class="yc-filter-label">工号</span>
        <a-input
          v-model="queryParam.no"
          class="yc-filter-input"
          allowClear
          placeholder="请输入工号"
          @pressEnter="searchQuery"
        />
      </div>

      <div class="yc-filter-item">
        <span class="yc-filter-label">月份</span>
        <a-month-picker
          v-model="skrqMonth"
          format="YYYY-MM"
          placeholder="选择月份"
          class="yc-filter-month-picker"
          @change="onSkrqMonthChange"
        />
      </div>

      <div class="yc-filter-item">
        <span class="yc-filter-label">刷卡日期</span>
        <a-range-picker
          v-model="skrqRange"
          class="yc-filter-range-picker"
          format="YYYY-MM-DD"
          :placeholder="['开始日期', '结束日期']"
          @change="onSkrqDateChange"
        />
      </div>

      <div class="yc-filter-item" v-if="!deptBelongKey">
        <span class="yc-filter-label">公司</span>
        <a-select
          v-model="queryParam.deptBelong"
          allowClear
          placeholder="请选择公司"
          class="yc-filter-select"
          @change="onCompanyChange"
        >
          <a-select-option v-for="item in companyList" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>

      <div class="yc-filter-item">
        <span class="yc-filter-label">部门</span>
        <a-cascader
          :options="deptList"
          v-model="deptArr"
          placeholder="请选择部门"
          class="yc-filter-cascader"
          changeOnSelect
          :show-search="{ filter }"
          :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
          @change="onCascaderChange"
        />
      </div>

      <!-- <div class="yc-filter-item">
        <span class="yc-filter-label">出勤状态</span>
        <j-dict-select-tag
          v-model="queryParam.attendanceStatus"
          dictCode="ycDkstatus"
          allowClear
          placeholder="出勤状态"
          class="yc-filter-dict"
        />
      </div> -->

      <div class="yc-filter-actions">
        <a-button type="primary" class="yc-btn-primary" @click="searchQuery">查询</a-button>
        <a-button class="yc-btn-reset" @click="searchReset">重置</a-button>
      </div>
    </div>

    <div class="yc-table-wrap">
      <a-table
        ref="table"
        :key="tableKey"
        size="middle"
        :scroll="{ x: true, y: 580 }"
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
            :color="dictColor[record.attendanceRule_dictText] ? dictColor[record.attendanceRule_dictText].color : null"
            @click.stop="openRuleDetail(record)"
          >
            {{ record.attendanceRule_dictText }}
          </a-tag>
        </template>

        <span slot="attendanceStatus" slot-scope="text, record">
          <a-tag
            style="margin: 0"
            v-if="text.indexOf('+') == -1"
            :color="getAttendanceStatusClass(record.attendanceStatus_dictText)"
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
          <a-divider type="vertical" />

          <a @click="handleHandle(record)" style="color: #f59e0b">处理</a>
          <a-divider type="vertical" />
          <a @click="handleAudit(record)" style="color: #ef4444">审核</a>
        </span>
      </a-table>
    </div>

    <HrKqYcHandleModal ref="modalForm" :exception-codes="exceptionCodes" @ok="modalFormOk"></HrKqYcHandleModal>
    <HrKqYcAuditModal ref="auditModal" :exception-codes="exceptionCodes" @ok="modalFormOk"></HrKqYcAuditModal>

    <hr-kq-rule-detail-modal ref="ruleDetailModal"></hr-kq-rule-detail-modal>
    <hr-kq-yg-clock-record-modal ref="clockRecordModal"></hr-kq-yg-clock-record-modal>

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
import HrKqYcAuditModal from './modules/HrKqYcAuditModal'
import HrKqYcHandleModal from './modules/HrKqYcHandleModal'

import HrKqRuleDetailModal from '../modules/HrKqRuleDetailModal.vue'
import HrKqYgClockRecordModal from '../modules/HrKqYgClockRecordModal.vue'
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'
import TodayAttendanceDrawer from '../modules/TodayAttendanceDrawer.vue'

import { getAction, httpAction } from '@/api/manage'

const attendanceStatusMap = {
  正常: { text: '正常', color: 'green', code: 'NORMAL' },
  迟到: { text: '迟到', color: 'orange', code: 'BE_LATE' },
  早退: { text: '早退', color: 'purple', code: 'LEAVE_EARLY' },
  缺卡: { text: '缺卡', color: 'blue', code: 'MISSING' },
  旷工: { text: '旷工', color: 'red', code: 'ABSENT' },
  其他: { text: '其他', color: '', code: 'OTHER' },
  休假: { text: '休假', color: '#00cce3', code: 'XJ' },
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
    HrKqYcAuditModal,
    HrKqYcHandleModal,
    HrKqRuleDetailModal,
    HrKqYgClockRecordModal,
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
        return []
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
        // {
        //   title: '正常',
        //   value: 'NORMAL',
        //   count: 0
        // },
        {
          title: '早退',
          value: 'LEAVE_EARLY',
          count: 0,
        },
        {
          title: '迟到',
          value: 'BE_LATE',
          count: 0,
        },
        {
          title: '缺卡',
          value: 'MISSING',
          count: 0,
        },
        {
          title: '旷工',
          value: 'ABSENT',
          count: 0,
        },
        {
          title: '其他',
          value: 'OTHER',
          count: 0,
        },
      ],
      activeKey: '',

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
      description: '员工异常考勤表管理页面',
      total: '',
      deptArr: [],
      tableKey: 0,
      skrqRange: [],
      skrqMonth: currentMonth,
      queryParam: {
        deptBelong: this.deptBelongKey,
        dateTime: currentMonth.format('YYYY-MM'),
      },
      url: {
        getTotal: '/hr_yckq_yg/hrYckqYg/getTotal',

        list: '/hr_yckq_yg/hrYckqYg/list',
        delete: '/hr_yckq_yg/hrYckqYg/delete',
        deleteBatch: '/hr_yckq_yg/hrYckqYg/deleteBatch',
        exportXlsUrl: '/hr_yckq_yg/hrYckqYg/exportXls',
        importExcelUrl: 'hr_yckq_yg/hrYckqYg/importExcel',
        importExcelUrlNewName: 'HrYckqYg',
      },
      dictOptions: {},
      superFieldList: [],
      dictColor: {},
      //自定义标题参数
      columnConfigVisible: false,
      columnTakeEffect: false,
      columnConfig: [],
      columnCode: 'HrYckqYg',

      disableMixinCreated: true,
    }
  },
  created() {
    this.getDictColor()
    this.getSuperFieldList()
    setTimeout(() => {
      this.getColumnConfig()
    }, 500)
  },

  computed: {
    // tabsList 中的异常 code（去掉“全部”），作为弹窗组合状态的过滤来源
    exceptionCodes() {
      return this.tabsList.map((item) => item.value).filter(Boolean)
    },
    columnConfigNew() {
      return this.columnConfig.map((item) => item)
    },
    fieldTitleMap() {
      return {
        attendanceStatus: '出勤状态',
        skrq: '刷卡日期',
        weekday: '星期',
        no: '工号',
        deptBelong: '公司',
        dept: '所属部门',
        postId: '岗位',
        name: '姓名',
        one: '打卡时间1',
        two: '打卡时间2',
        three: '打卡时间3',
        four: '打卡时间4',
        five: '打卡时间5',
        six: '打卡时间6',
        seven: '打卡时间7',
        eight: '打卡时间8',
        nine: '打卡时间9',
        ten: '打卡时间10',
        status: '状态',
        bz: '异常说明',
        errBz: '备注',
        attendanceRule: '考勤规则',
      }
    },
    // 表头
    columns() {
      const customRenderFun = (t, record) => {
        let box = t || ''
        switch (true) {
          case box.indexOf('加班调休') != -1:
            box = <span style="color:#722ed1;">{'加班调休'}</span>
            break
          case box.indexOf('迟') != -1:
            box = <span style="color: #ff6000;">{box.replace('迟', '')}</span>
            break
          case box.indexOf('早') != -1:
            box = <span style="color: #8800ff;">{box.replace('早', '')}</span>
            break
          case box.indexOf('缺') != -1:
            box = <span style="color: #1890ff;">{'缺卡'}</span>
            break
          case box.indexOf('旷') != -1:
            box = <span style="color: #f5222d;">{'旷工'}</span>
            break
          case box.indexOf('休') != -1:
            box = <span style="color: #1890ff;">{'休息日'}</span>
            break
          case box.indexOf('节') != -1:
            box = <span style="color: #f5222d;">{'节假日'}</span>
            break
        }
        return box
      }
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
      let arr = [
        {
          title: '出勤状态',
          dataIndex: 'attendanceStatus',
          scopedSlots: { customRender: 'attendanceStatus' },
          type: 'string',
          width: 180,
          align: 'center',
        },
        {
          title: '刷卡日期',
          dataIndex: 'skrq',
          type: 'date',
          sorter: true,
          width: 100,
          align: 'center',
          customRender: (text) => {
            return moment(text).format('YYYY-MM-DD')
          },
        },
        { title: '星期', dataIndex: 'weekday', type: 'string', width: 60, align: 'center' },
        { title: '工号', dataIndex: 'no', type: 'string', sorter: true, width: 120, align: 'center' },

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
      ]
      let arrB = [
        {
          title: '状态',
          dataIndex: 'status',
          type: 'string',
          width: 90,
          align: 'center',
          customRender: (text) => {
            return (
              <a-tag style="margin: 0;" color="orange">
                待处理
              </a-tag>
            )
          },
        },
        {
          title: '异常说明',
          dataIndex: 'bz',
          type: 'string',
          width: 200,
          align: 'center',
          ellipsis: true,
          customRender: (text) => {
            return (
              <a-tooltip style="width: 180px;text-align: center;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block">
                <template slot="title">{text}</template>
                <span>{text}</span>
              </a-tooltip>
            )
          },
        },

        {
          title: '备注',
          dataIndex: 'errBz',
          type: 'string',
          width: 200,
          align: 'center',
          ellipsis: true,
          customRender: (text) => {
            return (
              <a-tooltip style="width: 180px;text-align: center;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block">
                <template slot="title">{text}</template>
                <span>{text}</span>
              </a-tooltip>
            )
          },
        },
        {
          title: '考勤规则',
          dataIndex: 'attendanceRule',
          width: 80,
          align: 'center',
          scopedSlots: { customRender: 'ruleName' },
          fixed: 'right',
          fieldSort: 9999,
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 180,
          fieldSort: 9999,
          scopedSlots: { customRender: 'action' },
        },
      ]
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
          arrB.forEach((itemB) => {
            if (itemB.dataIndex != 'attendanceRule' && item.fieldName == itemB.dataIndex) {
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
          width: 180,
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
    // 部门选择器
    deptList() {
      let arr = []

      if (this.queryParam.deptBelong) {
        this.companyList.forEach((item) => {
          if (item.id == this.queryParam.deptBelong) {
            arr = item.children || []
          }
        })
      }
      // else {
      //   this.companyList.forEach(item => {
      //     if(item.children){
      //       item.children.forEach(child => {
      //         if(child.children){
      //           arr.push(child)
      //         }
      //       })
      //     }
      //   })
      // }

      return arr
    },
    username() {
      return this.$store.state.user.info.username
    },
    mockStatCards() {
      return [
        { key: 'total', label: '在职总人数', value: this.total, desc: '当前部门总人员', icon: 'team', theme: 'total' },
        { key: 'normal', label: '正常出勤', value: 0, desc: '今日正常打卡', icon: 'check-circle', theme: 'normal' },
        { key: 'late', label: '迟到', value: 0, desc: '今日迟到人员', icon: 'clock-circle', theme: 'late' },
        { key: 'early', label: '早退', value: 0, desc: '今日提前离岗', icon: 'hourglass', theme: 'early' },
        { key: 'lack', label: '缺卡', value: 0, desc: '今日未打卡', icon: 'idcard', theme: 'lack' },
        { key: 'absent', label: '旷工', value: 0, desc: '今日缺勤旷工', icon: 'user-delete', theme: 'absent' },
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
  },
  watch: {
    activeKey: {
      handler(newVal, oldVal) {
        this.getDictOptions()
        this.searchQuery(1)
      },
      immediate: true,
    },
  },
  methods: {
    getDictOptions() {
      let str = ''
      if (this.deptBelongKey) {
        str = 'deptBelong=' + this.deptBelongKey
      }
      httpAction(this.url.getTotal + '?' + str, '', 'get').then((res) => {
        if (res.success) {
          let total = 0
          res.result.forEach((item) => {
            if (item.attendanceStatus == 'ALL') {
              this.tabsList[0].count = item.attendanceTotal
            } else {
              this.tabsList.forEach((tab) => {
                if (tab.value == item.attendanceStatus) {
                  tab.count = item.attendanceTotal || 0
                }
              })
            }
          })
        }
      })
    },
    callback(key) {
      this.activeKey = key
    },
    onCompanyChange() {
      this.$nextTick(() => {
        if (!this.queryParam.deptBelong) {
          this.queryParam.dept = ''
          this.deptArr = []
        }
      })
    },
    filter(inputValue, path) {
      return path.some((option) => option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
    },
    onCascaderChange() {
      this.queryParam.dept = this.deptArr[this.deptArr.length - 1]
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
    },
    handleHandle(record) {
      this.$refs.modalForm.show(record)
    },
    handleAudit(record) {
      this.$refs.auditModal.show(record)
    },
    searchReset() {
      const currentMonth = moment()

      this.skrqRange = []
      this.skrqMonth = currentMonth
      this.queryParam = {
        deptBelong: this.deptBelongKey,
        dateTime: currentMonth.format('YYYY-MM'),
      }
      this.deptArr = []
      this.attendanceStatusArr = ''

      this.loadData(1)
    },
    onSkrqDateChange(value, dateString) {
      this.queryParam.skrq_begin = dateString[0]
      this.queryParam.skrq_end = dateString[1]
      this.queryParam.dateTime =
        dateString[0] || dateString[1] ? '' : this.skrqMonth ? this.skrqMonth.format('YYYY-MM') : ''
    },
    onSkrqMonthChange(value, dateString) {
      this.queryParam.dateTime = this.queryParam.skrq_begin || this.queryParam.skrq_end ? '' : dateString
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
        // 自定义高级查询参数  JeecgListMixin customSuperQueryParams
        // const superQueryObj = SuperQuery.getSuperQueryObj(
        //   SuperQuery.QueryType.and,
        //   SuperQuery.queryItem("attendanceStatus", this.activeKey, SuperQuery.FieldType.String, SuperQuery.FieldRule.包含)
        // )
        this.customSuperQueryParams = str
      }

      var params = this.getQueryParams() //查询条件
      // 姓名模糊查询：传后端时前后加*，页面显示保持原值
      if (params.name) {
        params.name = `*${params.name}*`
      }
      this.loading = true
      getAction(this.url.list + '?' + str, params).then((res) => {
        if (res.success) {
          //update-begin---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
          this.dataSource = res.result.records || res.result
          this.total = res.message
          if (res.result.total) {
            this.ipagination.total = res.result.total
          } else {
            this.ipagination.total = 0
          }
          //update-end---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
        }
        if (res.code === 510) {
          this.$message.warning(res.message)
        }
        this.loading = false
      })
    },
    searchQuery() {
      this.loadData(1)
      // 点击查询清空列表选中行
      this.selectedRowKeys = []
      this.selectionRows = []
    },
    initDictConfig() {},
    getAttendanceStatusClass(status) {
      const statusText = renderEmptyText(status)
      const statusMeta = statusText
        .split('+')
        .map((item) => attendanceStatusMap[item])
        .find(Boolean)
      return statusMeta ? statusMeta.color : ''
    },
    getAttendanceStatusClassObj(status) {
      let obj = {
        color: '',
        text: '',
      }
      for (let key in attendanceStatusMap) {
        if (attendanceStatusMap[key].code == status) {
          obj = attendanceStatusMap[key]
        }
      }
      return obj || {}
    },
    handleClockRecord(record) {
      this.$refs.clockRecordModal.show(record)
    },
    openRuleDetail(record) {
      const ruleId = record.attendanceRule
      if (!ruleId) {
        this.$message.warning('未找到考勤规则ID')
        return
      }
      this.$refs.ruleDetailModal.show(ruleId)
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'attendanceStatus', text: '出勤状态', dictCode: 'dkstatus' })
      fieldList.push({ type: 'string', value: 'status', text: '状态', dictCode: 'yckq_clzt' })

      fieldList.push({ type: 'string', value: 'no', text: '工号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'name', text: '姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'dept', text: '所属部门', dictCode: '' })
      fieldList.push({ type: 'string', value: 'postId', text: '岗位', dictCode: '' })
      fieldList.push({ type: 'string', value: 'skrq', text: '刷卡日期', dictCode: '' })
      fieldList.push({ type: 'string', value: 'weekday', text: '星期', dictCode: '' })
      fieldList.push({ type: 'string', value: 'kh', text: '卡号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'attendanceRule', text: '考勤规则', dictCode: '' })

      fieldList.push({ type: 'string', value: 'bz', text: '备注', dictCode: '' })
      this.superFieldList = fieldList
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
  },
}
</script>
<style scoped lang="less">
.yc-list-panel {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--attendance-background, #f8fafd);
  overflow: hidden;
  animation: yc-slide-in-right 0.3s ease-out both;
  padding: 0 10px;
}

// ---------- 标题栏 ----------
.yc-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 12px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.yc-main-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a2a3d;
}

.yc-date-display {
  font-size: 13px;
  color: #64748b;
}

// ---------- 筛选栏 ----------
.yc-filter-bar {
  padding: 10px 0px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.yc-search-wrap {
  flex-shrink: 0;
}

.yc-filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.yc-filter-label {
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.yc-search {
  width: 160px;

  /deep/ .ant-input {
    height: 32px;
    padding-left: 36px;
    border-color: #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    color: #1a2a3d;
    box-shadow: none;
    font-size: 12px;
    transition: all 0.3s ease;
  }

  /deep/ .ant-input:focus {
    border-color: rgba(37, 99, 235, 0.4);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }

  /deep/ .ant-input-prefix {
    color: rgba(37, 99, 235, 0.3);
  }
}

.yc-filter-input {
  width: 160px;

  /deep/ .ant-input {
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
}

.yc-filter-month-picker {
  width: 160px;

  /deep/ .ant-calendar-picker {
    width: 100%;
  }

  /deep/ .ant-calendar-picker-input,
  /deep/ .ant-input {
    height: 32px;
    border-color: #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: none;
    font-size: 12px;
  }

  /deep/ .ant-calendar-picker-input:focus,
  /deep/ .ant-input:focus {
    border-color: rgba(37, 99, 235, 0.4);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }
}

.yc-filter-range-picker {
  /deep/ .ant-calendar-picker {
    width: 100%;
  }

  /deep/ .ant-calendar-picker-input,
  /deep/ .ant-input {
    height: 32px;
    border-color: #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: none;
    font-size: 12px;
  }

  /deep/ .ant-calendar-picker-input:focus,
  /deep/ .ant-input:focus {
    border-color: rgba(37, 99, 235, 0.4);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }
}

.yc-filter-select {
  width: 150px;

  /deep/ .ant-select-selection {
    height: 32px;
    border-color: #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: none;
    font-size: 12px;
  }

  /deep/ .ant-select-selection__rendered {
    line-height: 30px;
  }

  /deep/ .ant-select-selection:hover,
  /deep/ .ant-select-focused .ant-select-selection {
    border-color: rgba(37, 99, 235, 0.35);
  }
}

.yc-filter-cascader {
  width: 160px;

  /deep/ .ant-cascader-picker {
    width: 100%;
  }

  /deep/ .ant-input {
    height: 32px;
    border-color: #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: none;
    font-size: 12px;
  }

  /deep/ .ant-input:focus {
    border-color: rgba(37, 99, 235, 0.4);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }
}

.yc-filter-dict {
  width: 150px;

  /deep/ .ant-select-selection {
    min-height: 32px;
    border-color: #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: none;
    font-size: 12px;
  }

  /deep/ .ant-select-selection__rendered {
    min-height: 30px;
    line-height: 30px;
  }
}

.yc-filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

// ---------- 按钮 ----------
.yc-btn-primary {
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

.yc-btn-reset {
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

.yc-btn-config {
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
.yc-table-wrap {
  flex: 1;
  min-height: 0;
  padding: 12px 0px 0px;
  overflow-y: auto;

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

// ---------- 动画 ----------
@keyframes yc-slide-in-right {
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
  .yc-title-bar {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .yc-search-wrap {
    max-width: 100%;
    flex-basis: 100%;
  }

  .yc-filter-bar {
    align-items: stretch;
  }

  .yc-filter-input,
  .yc-filter-month-picker,
  .yc-filter-select,
  .yc-filter-cascader,
  .yc-filter-dict {
    width: 100%;
  }

  .yc-filter-actions {
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
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='NORMAL']) {
  background: #55c42a;
}

::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='BE_LATE']) {
  background: #fa8c16;
}

::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='LEAVE_EARLY']) {
  background: #722ed1;
}

::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='MISSING']) {
  background: #18b6ff;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='Holiday']),
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='ABSENT']) {
  background: #b9242c;
}

::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:has([data-status='OTHER']) {
  background: #0f7797;
}
</style>
