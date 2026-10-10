<template>
  <div class="rule-list-panel">
    <!-- 顶部区域：筛选 + 工具栏 -->
    <div class="rule-top-bar">
      <!-- 筛选区域 -->
      <div class="rule-filter-bar">
        <div class="rule-filter-item">
          <span class="rule-filter-label">年月</span>
          <a-month-picker
            v-model="queryParam.scheduleMonth"
            placeholder="请选择年月"
            class="rule-filter-month"
            format="YYYY-MM"
            valueFormat="YYYY-MM"
            :allowClear="false"
            @change="onMonthChange"
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
            <a-select-option v-for="item in companyList" :title="item.name" :key="item.id" :value="item.id">
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

        <div class="rule-filter-actions">
          <a-button type="primary" class="rule-btn-primary" @click="searchQuery">查询</a-button>
          <a-button class="rule-btn-reset" @click="searchReset">重置</a-button>
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div class="rule-toolbar">
        <div class="rule-toolbar-left">
          <!-- <a-button type="primary" class="rule-btn-primary" icon="plus" @click="handleAdd">新增</a-button> -->
          <a-button type="primary" class="rule-btn-primary" icon="download" @click="handleExportXls('员工排班配置表')"
            >导出</a-button
          >
          <a-button type="primary" class="rule-btn-primary" icon="import" @click="handleImport">导入</a-button>
          <a-button type="primary" class="rule-btn-primary" icon="plus" @click="handleAddEmp">新增排班人员</a-button>
          <a-dropdown v-if="selectedRowKeys.length > 0">
            <a-menu slot="overlay">
              <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
            </a-menu>
            <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
          </a-dropdown>
        </div>
      </div>
    </div>

    <!-- table区域 -->
    <div class="rule-table-wrap">
      <div class="ant-alert ant-alert-info" style="margin-bottom: 12px">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择
        <a style="font-weight: 600">{{ selectedRowKeys.length }}</a
        >项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        :scroll="{ x: true, y: 530 }"
        bordered
        rowKey="no"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        class="j-table-force-nowrap"
        @change="handleTableChange"
      >
        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text, record">
          <span v-if="!text" style="font-size: 12px; font-style: italic">无图片</span>
          <img
            v-else
            :src="getImgView(text)"
            :preview="record.id"
            height="25px"
            alt=""
            style="max-width: 80px; font-size: 12px; font-style: italic"
          />
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px; font-style: italic">无文件</span>
          <a-button v-else :ghost="true" type="primary" icon="download" size="small" @click="downloadFile(text)"
            >下载</a-button
          >
        </template>

        <!-- 班次类型标签 -->
        <template slot="shiftType" slot-scope="text">
          <a-tag v-if="text == '1'" color="blue">固定班次</a-tag>
          <a-tag v-else-if="text == '2'" color="green">轮换班次</a-tag>
          <span v-else>暂无配置</span>
        </template>

        <!-- 公司标签 -->
        <template slot="companySlot" slot-scope="text, record">
          <a-tag color="blue">{{ record.companyId_dictText }}</a-tag>
        </template>

        <!-- 动态日期列 -->
        <template v-for="day in next7Days" :slot="'day' + day.index" slot-scope="text, record">
          <a-tag :key="day.index" :color="getShiftColor(record, day.dateStr)">
            {{ getShiftLabel(record, day.dateStr) }}
          </a-tag>
        </template>

        <span slot="action" slot-scope="text, record">
          <a style="color: chocolate" @click="handleEdit(record)">排班</a>
          <a-divider type="vertical" />
          <a @click="handleDetail(record)">详情</a>

          <!-- <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown> -->
        </span>
      </a-table>
    </div>

    <hr-schedule-modal ref="modalForm" @ok="modalFormOk"></hr-schedule-modal>
    <schedule-import-modal
      ref="scheduleImportModal"
      :import-url="url.importExcelUrl"
      :template-url="url.downloadTemplateUrl"
      @ok="loadData"
    />
    <schedule-emp-add-modal ref="scheduleEmpAddModal" @ok="loadData" />
  </div>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import HrScheduleModal from './modules/HrScheduleModal'
import ScheduleImportModal from './modules/ScheduleImportModal'
import ScheduleEmpAddModal from './modules/ScheduleEmpAddModal'
import { getAction, deleteAction } from '@/api/manage'

export default {
  name: 'HrScheduleList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    HrScheduleModal,
    ScheduleImportModal,
    ScheduleEmpAddModal,
  },
  data() {
    return {
      description: '员工排班配置管理页面',
      // 查询参数
      queryParam: {
        scheduleMonth: this.getCurrentMonth(),
        name: '',
        no: '',
        companyId: '',
        dept: '',
      },
      // 公司列表
      companyList: [],
      // 部门级联选择值
      deptArr: [],
      // 动态7天数据
      next7Days: [],
      // 表头
      columns: [],

      // hrEmpSchedules: [
      //       { type: '白班', start: '2026-07-01', end: '2026-07-15' },
      //       { type: '夜班', start: '2026-07-16', end: '2026-07-31' }
      //     ]
      url: {
        list: '/hr_emp_schedule/hrEmpSchedule/list',
        delete: '/hr_emp_schedule/hrEmpSchedule/delete',
        deleteBatch: '/hr_emp_schedule_emp/hrEmpScheduleEmp/deleteBatch',
        exportXlsUrl: '/hr_emp_schedule/hrEmpSchedule/exportXls',
        importExcelUrl: '/hr_emp_schedule/hrEmpSchedule/importExcel',
        downloadTemplateUrl: '/hr_emp_schedule/hrEmpSchedule/exportTemplate',
      },
    }
  },
  created() {
    this.initDynamicColumns(this.queryParam.scheduleMonth)
    this.getCompanyList()
  },
  computed: {
    // 部门列表（根据选中的公司过滤）
    deptList() {
      let arr = []
      if (this.queryParam.companyId) {
        this.companyList.forEach((item) => {
          if (item.id == this.queryParam.companyId) {
            arr = item.children || []
          }
        })
      }
      return arr
    },
  },
  methods: {
    // 获取当前年月（YYYY-MM）
    getCurrentMonth() {
      const now = new Date()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      return `${now.getFullYear()}-${m}`
    },
    // 打开导入排班数据弹窗
    handleImport() {
      this.$refs.scheduleImportModal.show()
    },
    // 打开新增排班人员弹窗
    handleAddEmp() {
      this.$refs.scheduleEmpAddModal.show()
    },
    // 批量删除：删除选中员工的主表记录，ids 为主表 id 逗号拼接
    batchDel() {
      if (!this.selectionRows || this.selectionRows.length === 0) {
        this.$message.warning('请选择一条记录！')
        return
      }
      const ids = this.selectionRows.map((row) => row.id).join(',')
      const that = this
      this.$confirm({
        title: '确认删除',
        content: '是否删除选中数据?',
        onOk() {
          that.loading = true
          deleteAction(that.url.deleteBatch, { ids })
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.loadData()
                that.onClearSelected()
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.loading = false
            })
        },
      })
    },
    // 排班：把列表当前查询年月传入弹窗，供日历预览定位月份
    handleEdit(record) {
      this.$refs.modalForm.edit(record, this.queryParam.scheduleMonth)
      this.$refs.modalForm.title = '编辑'
      this.$refs.modalForm.disableSubmit = false
    },
    // 详情：同样传入列表当前查询年月
    handleDetail(record) {
      this.$refs.modalForm.edit(record, this.queryParam.scheduleMonth)
      this.$refs.modalForm.title = '详情'
      this.$refs.modalForm.disableSubmit = true
    },
    // 年月切换：重建动态日期列并重新查询
    onMonthChange() {
      this.initDynamicColumns(this.queryParam.scheduleMonth)
      this.searchQuery()
    },
    // 查询/导出参数：将 scheduleMonth(YYYY-MM) 拆分为 year、month 传入接口
    getQueryParams() {
      const params = JeecgListMixin.methods.getQueryParams.call(this)
      if (this.queryParam.scheduleMonth) {
        const [year, month] = this.queryParam.scheduleMonth.split('-')
        params.year = year
        params.month = String(Number(month))
        delete params.scheduleMonth
      }
      return params
    },
    // 重置：恢复默认查询条件（年月回到本年本月）
    searchReset() {
      this.queryParam = {
        scheduleMonth: this.getCurrentMonth(),
        name: '',
        no: '',
        companyId: '',
        dept: '',
      }
      this.deptArr = []
      this.initDynamicColumns(this.queryParam.scheduleMonth)
      this.loadData(1)
    },
    // 获取公司列表
    getCompanyList() {
      getAction('/org/hrmOrg/loadTreeRoot?pid=0').then((res) => {
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
      return path.some((option) => option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
    },

    // 按年月初始化动态日期列（1号到月末）
    initDynamicColumns(monthStr) {
      if (!monthStr) {
        monthStr = this.getCurrentMonth()
      }
      const [year, month] = monthStr.split('-').map(Number)
      const daysInMonth = new Date(year, month, 0).getDate()
      const days = []
      const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month - 1, i)
        const m = String(month).padStart(2, '0')
        const day = String(i).padStart(2, '0')
        const dateStr = `${year}-${m}-${day}`
        const display = `${weekNames[d.getDay()]}(${i})`

        days.push({
          index: i - 1,
          dateStr: dateStr,
          display: display,
          dayOfWeek: d.getDay(),
        })
      }
      this.next7Days = days

      // 构建动态列
      const dynamicCols = days.map((day) => ({
        title: day.display,
        dataIndex: 'day' + day.index,
        key: 'day' + day.index,
        align: 'center',
        width: 120,
        scopedSlots: { customRender: 'day' + day.index },
      }))

      this.columns = [
        {
          title: '班次类型',
          dataIndex: 'bc',
          align: 'center',
          width: 80,
          scopedSlots: { customRender: 'shiftType' },
        },
        {
          title: '工号',
          dataIndex: 'no',
          align: 'center',
          width: 100,
        },
        {
          title: '姓名',
          dataIndex: 'name',
          align: 'center',
          width: 90,
        },
        {
          title: '公司',
          dataIndex: 'companyId',
          align: 'center',
          width: 220,
          scopedSlots: { customRender: 'companySlot' },
        },
        {
          title: '部门',
          dataIndex: 'dept',
          align: 'center',
          width: 140,
          ellipsis: true,
          customRender: (t, record) => {
            let text = record.dept_dictText
            return (
              <a-tooltip style="width: 120px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block">
                <template slot="title">{text}</template>
                <span>{text}</span>
              </a-tooltip>
            )
          },
        },
        {
          title: '岗位',
          dataIndex: 'postId',
          align: 'center',
          width: 140,
          ellipsis: true,
          customRender: (t, record) => {
            let text = record.postId_dictText
            return (
              <a-tooltip style="width: 120px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block">
                <template slot="title">{text}</template>
                <span>{text}</span>
              </a-tooltip>
            )
          },
        },
        ...dynamicCols,
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 147,
          fixed: 'right',
          scopedSlots: { customRender: 'action' },
        },
      ]
    },

    // 根据日期获取班次
    getShiftForDate(hrEmpSchedules, dateStr) {
      if (!hrEmpSchedules || hrEmpSchedules.length === 0) return null
      for (const s of hrEmpSchedules) {
        // 数据库返回的日期带时间（如 "2026-08-01 00:00:00"），只取日期部分比较
        const startDateOnly = s.startDate ? s.startDate.split(' ')[0] : ''
        const endDateOnly = s.endDate ? s.endDate.split(' ')[0] : ''
        if (startDateOnly && endDateOnly && dateStr >= startDateOnly && dateStr <= endDateOnly) {
          return s.timeType
        }
      }
      return null
    },

    // 获取班次标签
    getShiftLabel(record, dateStr) {
      const dayInfo = this.next7Days.find((d) => d.dateStr === dateStr)
      if (!dayInfo) return '未排班'

      // 周日固定休息
      if (dayInfo.dayOfWeek === 0) {
        return '休息'
      }

      const shift = this.getShiftForDate(record.hrEmpSchedules, dateStr)

      // 周六逻辑
      if (dayInfo.dayOfWeek === 6) {
        return shift ? shift : '休息'
      }

      // 工作日逻辑
      return shift ? shift : '未排班'
    },

    // 获取班次颜色
    getShiftColor(record, dateStr) {
      const label = this.getShiftLabel(record, dateStr)
      const colorMap = {
        白班: 'orange',
        中班: 'green',
        夜班: 'purple',
        休息: '#4c83c9',
        未排班: '#d9d9d9',
      }
      return colorMap[label] || '#d9d9d9'
    },
  },
}
</script>

<style scoped lang="less">
::v-deep .ant-tag {
  margin: 0;
}

.rule-list-panel {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--attendance-background, #f8fafd);
  overflow: hidden;
  animation: rule-slide-in-right 0.3s ease-out both;
}

// ---------- 顶部区域（筛选 + 工具栏） ----------
.rule-top-bar {
  padding: 10px 24px 0;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

// ---------- 筛选栏 ----------
.rule-filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.rule-filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.rule-filter-label {
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.rule-filter-input {
  width: 140px;

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

.rule-filter-select {
  width: 200px;

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
}

.rule-filter-cascader {
  width: 300px;

  /deep/ .ant-cascader-picker {
    height: 32px;
  }

  /deep/ .ant-input {
    height: 32px;
    border-color: #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: none;
    font-size: 12px;
  }
}

.rule-filter-month {
  width: 130px;

  /deep/ .ant-calendar-picker-input {
    height: 32px;
    border-color: #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: none;
    font-size: 12px;
  }
}

.rule-filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

// ---------- 操作工具栏 ----------
.rule-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
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
  padding: 12px 24px 18px;
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
    background: #e6f7ff;
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

// ---------- 响应式 ----------
@media (max-width: 900px) {
  .rule-top-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .rule-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .rule-filter-item {
    width: 100%;
  }

  .rule-filter-input,
  .rule-filter-select,
  .rule-filter-cascader,
  .rule-filter-month {
    flex: 1;
    width: auto;
  }

  .rule-toolbar {
    justify-content: flex-start;
  }
}
</style>
