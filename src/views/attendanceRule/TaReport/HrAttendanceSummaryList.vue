<template>
  <div class="summary-list-panel">
    <!-- Tab与工具栏同栏 -->
    <div class="tab-toolbar-row">
      <a-tabs v-model="activeKey"  type="card" @change="callback">
        <a-tab-pane v-for="item in tabsList" :key="item.title" >
          <span slot="tab" :data-status="item.value">
            {{ item.title }}({{ item.count }})
          </span>
        </a-tab-pane>
      </a-tabs>

      <!-- 操作按钮区域 -->
      <div class="rule-toolbar">
        <div class="rule-toolbar-left">
          <a-button type="primary" class="rule-btn-primary" icon="download"
            @click="handleExportXls('员工考勤统计记录表')">导出</a-button>
          <j-super-query btn-class="rule-btn-primary" :fieldList="superFieldList" ref="superQueryModal"
            @handleSuperQuery="handleSuperQuery"></j-super-query>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-field">
        <label>姓名</label>
        <a-input v-model="queryParam.name" allowClear placeholder="请输入姓名" class="search-input" @pressEnter="searchQuerys" />
      </div>
      <div class="search-field">
        <label>工号</label>
        <a-input v-model="queryParam.no" allowClear placeholder="请输入工号" class="search-input" @pressEnter="searchQuerys" />
      </div>
      <div class="search-field">
        <label>公司</label>
        <a-select v-model="queryParam.companyId" allowClear placeholder="请选择公司" class="search-select" @change="onCompanyChange">
          <a-select-option v-for="item in companyList" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>
      <div class="search-field">
        <label>部门</label>
        <a-cascader
          :options="deptList"
          v-model="deptArr"
          placeholder="请选择部门"
          class="search-cascader"
          changeOnSelect
          :show-search="{ filter }"
          :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
          @change="onCascaderChange"
        />
      </div>
      <div class="search-field">
        <label>所属年月</label>
        <j-date style="width: 100%;" v-model="queryParam.ssny" placeholder="请选择年月" antype="month"
                  dateFormat="YYYY-MM"></j-date>
      </div>
      <a-button type="primary" class="rule-btn-primary"  @click="searchQuerys">查询</a-button>
      <a-button class="rule-btn-reset" @click="searchReset">重置</a-button>
    </div>

    <!-- table区域 -->
    <div class="rule-table-wrap">
      <a-table
        ref="table"
        size="middle"
        :scroll="{ x: true, y: tableScrollY }"
        bordered
        rowKey="no"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        class="j-table-force-nowrap"
        @change="handleTableChange"
      >
        <!-- 薪资类型标签 -->
        <template slot="xzlxSlot" slot-scope="text, record">
          <a-tag style="margin: 0;" :color="dictColor[text] ? dictColor[text].color : null"
            @click.stop="openRuleDetail(record)">
            {{ text }}
          </a-tag>
        </template>

        <!-- 全勤标签 -->
        <template slot="dysfqqSlot" slot-scope="text">
          <a-tag v-if="text === '是'" color="green" style="font-weight:600;">是</a-tag>
          <a-tag v-else-if="text === '否'" color="orange">否</a-tag>
          <span v-else>{{ text || '-' }}</span>
        </template>

        <!-- 公司标签 -->
        <template slot="companySlot" slot-scope="text">
          <a-tag color="blue">{{ text }}</a-tag>
        </template>

        <!-- 迟到/早退天数标签 -->
        <template slot="lateDaysSlot" slot-scope="text">
          <a-tag v-if="Number(text) > 0" color="red">{{ text }}</a-tag>
          <a-tag v-else-if="text" color="green">{{ text }}</a-tag>
          <span v-else>{{ '-' }}</span>
        </template>

        <!-- 出勤总天数标签 -->
        <template slot="totalDaysSlot" slot-scope="text">
          <a-tag v-if="Number(text) >= 25" color="green">{{ text }}</a-tag>
          <a-tag v-else-if="text" color="red">{{ text }}</a-tag>
          <span v-else>{{ '-' }}</span>

        </template>

        <!-- 出勤总时长标签 -->
        <template slot="totalHoursSlot" slot-scope="text">
          <a-tag v-if="parseInt(text) >= 200" color="green">{{ text }}</a-tag>
          <a-tag v-else-if="text" color="red">{{ text }}</a-tag>
          <span v-else>{{ '-' }}</span>
        </template>

        <template slot="postId" slot-scope="text,record">
          <a-tooltip style='width: 120px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block;cursor: pointer;'>
              <template slot="title">{{record.postId_dictText}}</template>
              <span style="color: #0d5fab;" @click="openRuleDetail(record)">{{record.postId_dictText}}</span>
            </a-tooltip>
        </template>


        <!-- 操作列 -->
        <span slot="action" slot-scope="text, record">
          <a-button type="primary" size="small" @click="openAttendanceModal(record)">出勤记录</a-button>
          <a-button size="small" style="margin-left:6px;background:#722ed1;color:#fff;border-color:#722ed1;" @click="openLeaveBalanceModal(record)">假期余额</a-button>
        </span>
      </a-table>
    </div>

    <!-- 出勤记录弹窗 -->
    <hr-attendance-modal ref="attendanceModal" />

    <!-- 假期余额弹窗 -->
    <hr-leave-balance-modal ref="leaveBalanceModal" />
    <!-- 规则详情弹窗 -->
    <hr-kq-rule-detail-modal ref="ruleDetailModal"></hr-kq-rule-detail-modal>

  </div>
</template>

<script>
import { getAction, httpAction } from '@/api/manage'
import HrAttendanceModal from './modules/HrAttendanceModal'
import HrLeaveBalanceModal from './modules/HrLeaveBalanceModal'

import HrKqRuleDetailModal from '@/views/EmployeeAttendance/modules/HrKqRuleDetailModal.vue'

import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

import { formatDate } from '@/utils/util'



export default {
  name: 'HrAttendanceSummaryList',
  mixins: [JeecgListMixin, mixinDevice],

  components: {
    HrAttendanceModal,
    HrLeaveBalanceModal,
    HrKqRuleDetailModal
  },
  data() {
    return {
      description: '员工考勤统计记录表管理页面',
      // 表格滚动区自适应高度
      tableScrollY: 500,
      resizeTimer: null,

      tabsList: [
        {
          title: '全部',
          value: '',
          count: 0
        },
        {
          title: '月薪',
          value: 'moent',
          count: 0
        },
        {
          title: '时薪',
          value: 'hot',
          count: 0
        },
      ],
      // 当前薪资类型tab
      activeKey: '',

      dictColor: {},


      // 查询参数
      queryParam: {
        ssny:''
      },
      // 公司列表
      companyList: [],
      // 部门级联选择值
      deptArr: [],
      // 加载状态
      loading: false,

      // 表头
      columns: [
        { title: '薪资类型', dataIndex: 'xzlx', align: 'center', width: 100, scopedSlots: { customRender: 'xzlxSlot' } },
        { title: '当月是否全勤', dataIndex: 'dysfqq', align: 'center', width: 120, scopedSlots: { customRender: 'dysfqqSlot' } },
        { title: '工号', dataIndex: 'no', type: 'string', sorter: true, width: 110, align: 'center' },
        {
          title: '公司',
          dataIndex: 'companyId',
          type: 'string',
          width: 140,
          align: 'center',
          ellipsis: true,
          customRender: (text, record) => {
            return <a-tooltip style='width: 120px;text-align:center;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
              <template slot="title">{record.companyId_dictText}</template>
              <a-tag style="margin: 0;" color="blue">{record.companyId_dictText}</a-tag>
            </a-tooltip>
          }
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
            return <a-tooltip style='width: 120px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
              <template slot="title">{text}</template>
              <span style="color: #1890FF;">{text}</span>
            </a-tooltip>
          }
        },
        {
          title: '岗位',
          dataIndex: 'postId',
          type: 'string',
          width: 140,
          align: 'center',
          ellipsis: true,
          scopedSlots: { customRender: 'postId' }

          
        },
        {
          title: '姓名',
          dataIndex: 'name',
          type: 'string',
          width: 100,
          align: 'center',
          ellipsis: true,
          customRender: (text) => {
            return <a-tooltip style='width: 80px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
              <template slot="title">{text}</template>
              <span>{text}</span>
            </a-tooltip>
          }
        },
        { title: '所属年月', dataIndex: 'ssny', align: 'center', width: 100 },
        { title: '出勤总天数', dataIndex: 'cqzts', align: 'center', width: 110, scopedSlots: { customRender: 'totalDaysSlot' } },
        { title: '出勤总时长', dataIndex: 'cqzsc', align: 'center', width: 110, scopedSlots: { customRender: 'totalHoursSlot' } },
        { title: '平时天数', dataIndex: 'psts', align: 'center', width: 100,customRender: (text,record) => {
            let tag = '天'
            if(record.xzlx=='时薪'){
              tag = '时'
            }
            return text?text + tag:'-'
          } },
        { title: '周末天数', dataIndex: 'zmts', align: 'center', width: 100,customRender: (text,record) => {
            let tag = '天'
            if(record.xzlx=='时薪'){
              tag = '时'
            }
            return text?text + tag:'-'
          } },
        { title: '迟到/早退天数', dataIndex: 'cdztts', align: 'center', width: 120, scopedSlots: { customRender: 'lateDaysSlot' } },
        { title: '迟到/早退分钟', dataIndex: 'cdztfzs', align: 'center', width: 120 },
        { title: '1.5倍天数', dataIndex: 'oneFiveTs', align: 'center', width: 100 },
        { title: '2倍天数', dataIndex: 'twoTs', align: 'center', width: 100 },
        { title: '3倍天数', dataIndex: 'threeTs', align: 'center', width: 100 },
        { title: '操作', dataIndex: 'action', align: 'center', fixed: 'right', width: 200, scopedSlots: { customRender: 'action' } }
      ],
      url: {
        list: "/hr_employee_attendance_stat_record/hrEmployeeAttendanceStatRecord/list",
        delete: "/hr_employee_attendance_stat_record/hrEmployeeAttendanceStatRecord/delete",
        deleteBatch: "/hr_employee_attendance_stat_record/hrEmployeeAttendanceStatRecord/deleteBatch",
        exportXlsUrl: "/hr_employee_attendance_stat_record/hrEmployeeAttendanceStatRecord/exportXls",
        importExcelUrl: "hr_employee_attendance_stat_record/hrEmployeeAttendanceStatRecord/importExcel",
        importExcelUrlNewName: 'HrEmployeeAttendanceStatRecord',
      },
      disableMixinCreated:  true ,

    }
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    },
    // 部门列表（根据选中的公司过滤）
    deptList() {
      let arr = []
      if (this.queryParam.companyId) {
        this.companyList.forEach(item => {
          if (item.id == this.queryParam.companyId) {
            arr = item.children || []
          }
        })
      }
      return arr
    }
  },
  created() {

    this.getSuperFieldList();
    this.getDictColor()
    this.getCompanyList()
    this.searchReset()
    // TODO: 替换为后端接口
    // this.loadData()
  },
  mounted() {
    this.$nextTick(() => {
      this.calcTableScrollY()
    })
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer)
    }
  },
  methods: {
    // 窗口大小变化时重算表格高度
    handleResize() {
      clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(() => {
        this.calcTableScrollY()
      }, 150)
    },
    // 计算表格滚动区高度（自适应容器剩余空间）
    calcTableScrollY() {
      const panel = this.$el
      const tabRow = panel.querySelector('.tab-toolbar-row')
      const searchBar = panel.querySelector('.search-bar')
      if (!panel || !tabRow || !searchBar) return
      const panelHeight = panel.clientHeight
      const tabHeight = tabRow.offsetHeight
      const searchHeight = searchBar.offsetHeight
      if (panelHeight <= 0) return
      // 表格容器高度 = 面板高度 - tab栏 - 搜索栏
      // 再扣减：表格容器padding(5*2) + 表头(约55) + 分页(约64) + 边框(2) + 冗余(10)
      const tableWrapHeight = panelHeight - tabHeight - searchHeight
      const offset = 10 + 55 + 64 + 2 + 10
      this.tableScrollY = Math.max(tableWrapHeight - offset, 200)
    },
    // 获取月薪和时薪人数统计
    async getCount() {
      try {
        // 并行调用三个接口
        let ssny = this.queryParam.ssny
        const [allRes,monthlyRes, hourlyRes] = await Promise.all([
          getAction('/hr_employee_attendance_stat_record/hrEmployeeAttendanceStatRecord/list', {ssny,xzlx: '', pageSize: 1 }),
          getAction('/hr_employee_attendance_stat_record/hrEmployeeAttendanceStatRecord/list', {ssny,xzlx: '月薪', pageSize: 1 }),
          getAction('/hr_employee_attendance_stat_record/hrEmployeeAttendanceStatRecord/list', {ssny,xzlx: '时薪', pageSize: 1 })
        ])
        
        // 更新月薪人数
        if (monthlyRes.success) {
          const monthlyIndex = this.tabsList.findIndex(item => item.title === '月薪')
          if (monthlyIndex !== -1) {
            this.tabsList[monthlyIndex].count = monthlyRes.result.total || 0
          }
        }
        
        // 更新时薪人数
        if (hourlyRes.success) {
          const hourlyIndex = this.tabsList.findIndex(item => item.title === '时薪')
          if (hourlyIndex !== -1) {
            this.tabsList[hourlyIndex].count = hourlyRes.result.total || 0
          }
        }
        
        // 更新全部人数
        const allIndex = this.tabsList.findIndex(item => item.title === '全部')
        if (allIndex !== -1) {
          this.tabsList[allIndex].count = allRes.result.total || 0
        }
      } catch (error) {
        console.error('获取人数统计失败:', error)
      }
    },
    getDictColor() {
      httpAction('sys/dictItem/list?dictId=2072281509479194625&pageSize=100', '', 'get').then(res => {
        if (res.success) {
          let { records } = res.result
          records.forEach(item => {
            if (item.dataJson) {
              item.dataJson = JSON.parse(item.dataJson)
            }
            this.dictColor[item.itemText] = {
              color: item.dataJson ? item.dataJson.color : ''
            }
          })
        }
      })
    },
    openRuleDetail(record) {
      const ruleId = record.kqRuleId
      if (!ruleId) {
        this.$message.warning('未找到考勤规则ID')
        return
      }
      this.$refs.ruleDetailModal.show(ruleId)
    },
    
    callback(key) {
      this.activeKey = key;
          this.searchReset()

    },
    // 获取公司列表
    getCompanyList() {
      getAction('/org/hrmOrg/loadTreeRoot?pid=0').then(res => {
        if (res.success) {
          this.companyList = res.result[0].children || []
        }
      })
    },

    // 公司选择变化
    onCompanyChange() {
      this.$nextTick(() => {
        if (!this.queryParam.companyId) {
          this.queryParam.dept = ''
          this.deptArr = []
        }
      })
    },

    // 部门级联选择变化
    onCascaderChange() {
      this.queryParam.dept = this.deptArr[this.deptArr.length - 1] || ''
    },

    // 级联选择器搜索过滤
    filter(inputValue, path) {
      return path.some(option => option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
    },

    // 切换薪资类型tab
    switchTab(type) {
      this.activeKey = type
      this.ipagination.current = 1
      // TODO: 根据tab筛选数据
    },
    searchQuerys(){
      this.searchQuery()
      this.getCount()
    },
    // 重置
    searchReset() {
      this.queryParam = {}
      this.queryParam['ssny'] =formatDate(new Date().getTime(), 'yyyy-MM')
      this.queryParam['xzlx'] =this.activeKey!='全部'?this.activeKey:''

      this.loadData(1)
      this.getCount()
    },

    // 打开出勤记录弹窗
    openAttendanceModal(record) {
      this.$refs.attendanceModal.show(record)
    },

    // 打开假期余额弹窗
    openLeaveBalanceModal(record) {
      this.$refs.leaveBalanceModal.show(record)
    },

    getSuperFieldList() {
      let fieldList = [];
      fieldList.push({ type: 'string', value: 'companyId', text: '公司', dictCode: '' })
      fieldList.push({ type: 'string', value: 'dept', text: '部门', dictCode: '' })
      fieldList.push({ type: 'string', value: 'no', text: '工号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'name', text: '姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ssny', text: '大小周所属年月', dictCode: '' })
      fieldList.push({ type: 'string', value: 'monthBigCnt', text: '本月累计大周次数', dictCode: '' })
      fieldList.push({ type: 'string', value: 'monthSmallCnt', text: '本月累计小周次数', dictCode: '' })
      fieldList.push({ type: 'int', value: 'dybkcs', text: '当月补卡次数', dictCode: '' })
      fieldList.push({ type: 'int', value: 'dybkyycs', text: '当月补卡已用次数', dictCode: '' })
      fieldList.push({ type: 'int', value: 'dybksycs', text: '当月补卡剩余次数', dictCode: '' })
      fieldList.push({ type: 'string', value: 'xzlx', text: '薪资类型', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'cqzts', text: '出勤总天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'cqzsc', text: '出勤总时长', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'psts', text: '平时天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'zmts', text: '周末天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'cdztts', text: '迟到/早退天数', dictCode: '' })
      fieldList.push({ type: 'string', value: 'dysfqq', text: '当月是否全勤', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'njzs', text: '年假总数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'yxnjts', text: '已休年假天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'synjts', text: '剩余年假天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'dynjts', text: '当月年假天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'dyjbtxts', text: '当月加班调休天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'dygsts', text: '当月工伤天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'dybjts', text: '当月病假天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'dycjiants', text: '当月产检天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'dycjiats', text: '当月产假天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'dypcjts', text: '当月陪产假天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'dyhjts', text: '当月婚假天数', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>

<style scoped lang="less">
.summary-list-panel {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  overflow: hidden;
  animation: rule-slide-in-right 0.3s ease-out both;
  padding: 0 10px;

}

// ---------- 薪资类型 TAB 与工具栏同栏 ----------
.tab-toolbar-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5px;
  flex-shrink: 0;
}

.tab-toolbar-row .rule-toolbar {
  padding: 0;
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

// ---------- 搜索栏 ----------
.search-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 5px;
  background: #fff;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.search-field {
  display: flex;
  align-items: center;
  gap: 6px;

  label {
    font-size: 13px;
    color: #555;
    white-space: nowrap;
  }
}

.search-input {
  width: 140px;

  /deep/ .ant-input {
    height: 32px;
    font-size: 13px;
  }
}

.search-select {
  width: 160px;

  /deep/ .ant-select-selection {
    height: 32px;
    font-size: 13px;
  }

  /deep/ .ant-select-selection__rendered {
    line-height: 30px;
  }
}

.search-cascader {
  width: 220px;

  /deep/ .ant-input {
    height: 32px;
    font-size: 13px;
  }
}

.search-month {
  /deep/ .ant-calendar-picker-input {
    height: 32px;
    font-size: 13px;
  }
}

.btn-search {
  background: #1677ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  height: 32px;
  font-size: 13px;

  &:hover { background: #4096ff; }
}

.btn-reset {
  background: #fff;
  color: #555;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  height: 32px;
  font-size: 13px;

  &:hover {
    color: #1677ff;
    border-color: #1677ff;
  }
}

// ---------- 操作工具栏 ----------
.rule-toolbar {
  padding:0 5px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.rule-toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
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
  padding: 5px;
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
    background: #f2f6fc;
    color: #1a2a3d;
    font-weight: 500;
    font-size: 13px;
    border-color: #e5e7eb;
    text-align: center;
  }

  /deep/ .ant-table-tbody > tr > td {
    text-align: center;
    vertical-align: middle;
  }

  /deep/ .ant-table-tbody > tr:hover > td {
    background: #f0f7ff;
  }

  /deep/ .ant-table-pagination.ant-pagination {
    margin: 16px 0 0;
  }
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


::v-deep .ant-tabs-card > .ant-tabs-bar {
  margin: 0;
}

::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab {
  color: #e6f7ff;
  border-radius: 10px 10px 0 0;
  background: #0082fc;

}

::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active {
  background: #0082fc;
}

/* 未激活状态 - 底部色条 */
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:not(.ant-tabs-tab-active):has([data-status="moent"]) {
  background: #55c42a;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:not(.ant-tabs-tab-active):has([data-status="hot"]) {
  background: #fa8c16;
}

/* 激活状态 - 背景色 + 底部色条 + 文字色 */
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active:has([data-status="moent"]) {
    background: #55c42a;

}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active:has([data-status="hot"]) {
  
    background: #fa8c16;

}
</style>
