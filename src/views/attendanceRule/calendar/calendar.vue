<template>
  <div class="holiday-calendar-page">
    
    <div class="filter-bar">
    <h2 class="page-title">年度节假日日历</h2>

        <div class="rule-filter-item">
        <span class="filter-label">筛选年度：</span>
      <a-select 
        class="rule-filter-dict"
        v-model="selectedYear" 
        style="width: 120px"
        @change="handleYearChange"
      >
        <a-select-option v-for="year in yearList" :key="year" :value="year">
          {{ year }}
        </a-select-option>
      </a-select>
      </div>
      
      
      <a-button class="btn-reset" type="primary" @click="handleReset">重置筛选</a-button>
      
      <div class="legend">
        <div class="legend-item">
          <div class="legend-dot legend-dot--weekend"></div>
          <span>休息日</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot legend-dot--holiday"></div>
          <span>法定节假日</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot legend-dot--workday"></div>
          <span>调休上班</span>
        </div>
      </div>
    </div>
    
    <!-- 日历网格 -->
    <div class="calendar-grid">
      <MonthCalendar
        v-for="month in 12"
        :year="selectedYear"
        :month="month"
        :monthData="getMonthData(month)"
        @edit="handleEdit"
        @day-click="handleDayClick"
      />
    </div>
    
    <!-- 编辑弹框 -->
    <EditCalendarModal
      v-model="editModalVisible"
      :title="editModalTitle"
      :editDays="editDays"
      @cancel="handleCancel"
      @ok="handleSave"
    />
  </div>
</template>

<script>
import MonthCalendar from './modules/MonthCalendar.vue'
import EditCalendarModal from './modules/EditCalendarModal.vue'
import { getAction } from '@/api/manage'


export default {
  name: 'HolidayCalendar',
  components: {
    MonthCalendar,
    EditCalendarModal
  },
  data() {
    return {
      // 当前选中年份
      selectedYear: new Date().getFullYear(),
      // 可用年份列表
      yearList: [],
      // 年份数据
      yearData: [],
      // 编辑弹框
      editModalVisible: false,
      editModalTitle: '',
      editDays: [],
      url:{
        list:'/hr_calendar_holiday/hrCalendarHoliday/list',
        getYear:'/hr_calendar_holiday/hrCalendarHoliday/getYear',
      }
    }
  },
  created() {
    this.initData()
  },
  methods: {
    // 初始化数据
    async initData() {
      try {
        // 获取年份列表
        await this.getYearList()
        // 获取年份数据
        await this.getYearData()
      } catch (error) {
        console.error('初始化数据失败:', error)
      }
    },
    
    // 获取年份列表（预留API接口）
    async getYearList() {
      // TODO: 调用后端接口获取可用年份列表
      const res = await getAction(`${this.url.getYear}`)
      if (res.success) {
          this.yearList = res.result || []
        } else {
          this.$message.warning(res.message || '获取数据失败')
          this.yearList = []
        }
    },
    
    // 获取年份数据
    async getYearData() {
      try {
        const res = await getAction(`${this.url.list}?nf=${this.selectedYear}`)
        if (res.success) {
          this.yearData = res.result || {}
        } else {
          this.$message.warning(res.message || '获取数据失败')
          this.yearData = {}
        }
      } catch (error) {
        console.error('获取年份数据失败:', error)
        this.$message.error('获取年份数据失败')
        this.yearData = {}
      }
    },
    
    // 获取某月天数
    getDaysInMonth(year, month) {
      const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      let days = daysInMonths[month - 1]
      
      // 处理闰年2月
      if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
        days = 29
      }
      
      return days
    },
    
    // 获取某月数据
    getMonthData(month) {
      const monthKey = `${this.selectedYear}-${String(month).padStart(2, '0')}`
      return this.yearData[monthKey] || []
    },
    
    // 将 dayType 转换为 state 数字
    dayTypeToState(dayType) {
      const typeMap = {
        '工作日': 0,
        '休息日': 1,
        '法定节假日': 2,
        '调休上班': 3
      }
      return typeMap[dayType] || 1
    },
    
    // 将 state 数字转换为 dayType 文本
    stateToDayType(state) {
      const stateMap = {
        0: '工作日',
        1: '周末',
        2: '法定节假日',
        3: '调休上班'
      }
      return stateMap[state] || '工作日'
    },
    
    // 年份切换
    handleYearChange(year) {
      this.selectedYear = year
      this.getYearData()
    },
    
    // 重置筛选
    handleReset() {
      this.selectedYear = new Date().getFullYear()
      this.getYearData()
    },
    
    // 编辑月份
    handleEdit(obj) {
        this.editModalTitle = `编辑 ${obj.title} 日期类型` 
        this.editDays = obj.arr
        this.editModalVisible = true
    },
    
    // 日期点击
    handleDayClick({ year, month, day, state }) {
      console.log('点击日期:', { year, month, day, state })
    },
    
    // 保存编辑
    async handleSave() {
        this.handleCancel()
        this.getYearData()
    },
    
    // 取消编辑
    handleCancel() {
      this.editModalVisible = false
      this.editDays = []
    }
  }
}
</script>

<style scoped lang="less">
.holiday-calendar-page {
  background: #edf4f8;
  padding: 8px;
  overflow: hidden;
    overflow-y: auto;
    height: 87vh;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
  flex-wrap: wrap;
}

.rule-filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.rule-filter-dict {
  width: 160px;

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

  /deep/ .ant-select-selection:hover,
  /deep/ .ant-select-focused .ant-select-selection {
    border-color: rgba(37, 99, 235, 0.4);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }
}

.filter-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.btn-reset {
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

.legend {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #4b5563;
  margin-left: auto;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-dot {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
  
  &--weekend {
    background: #e8f3ff;
    border: 1px solid #91caff;
  }
  
  &--holiday {
    background: #fff1f3;
    border: 1px solid #ffa39e;
  }
  
  &--workday {
    background: repeating-linear-gradient(
      45deg,
      #fff7e6,
      #fff7e6 2px,
      #ffe7ba 2px,
      #ffe7ba 4px
    );
    border: 1px solid #ffa940;
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}

/* 响应式设计 */
@media (max-width: 1199px) {
  .calendar-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .legend {
    width: 100%;
    margin-left: 0;
    margin-top: 8px;
  }
}

@media (max-width: 991px) {
  .calendar-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .calendar-grid {
    grid-template-columns: 1fr;
  }

  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .legend {
    flex-wrap: wrap;
  }
}
</style>