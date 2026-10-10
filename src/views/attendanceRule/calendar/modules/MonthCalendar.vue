<template>
  <div class="month-calendar-card">
    <div class="month-calendar-header">
      <div class="month-calendar-title">{{ monthText }}</div>
      <a-button class="month-calendar-edit-btn" type="primary" @click="handleEdit">编辑</a-button>
    </div>
    
    <div class="month-calendar-grid">
      <!-- 星期头部 -->
      <div 
        v-for="(day, index) in weekDays" 
        :key="index"
        :class="['weekday-header', { 'weekday-header--weekend': index === 0 || index === 6 }]"
      >
        {{ day }}
      </div>
      
      <!-- 空白填充（月初） -->
      <div 
        v-for="i in firstDayOfMonth" 
        :key="'empty-start-' + i"
        class="calendar-day calendar-day--empty"
      ></div>
      
      <!-- 日期格子 -->
      <div 
        v-for="day in daysInMonth" 
        :class="getDayClass(day)"
        :title="getDayTitle(day)"
        @click="handleDayClick(day)"
      >
        <span 
          v-if="getDayBadge(day)" 
          :class="['day-badge', getDayBadge(day)]"
        >
          {{ getDayBadge(day) === 'rest' ? '休' : '班' }}
        </span>
        {{ day }}
      </div>
      
      <!-- 空白填充（月末） -->
      <div 
        v-for="i in lastEmptyCells" 
        :key="'empty-last-' + i"
        class="calendar-day calendar-day--empty"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MonthCalendar',
  props: {
    // 月份（1-12）
    month: {
      type: Number,
      required: true
    },
    // 年份
    year: {
      type: Number,
      required: true
    },
    // 该月的数据
    monthData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      weekDays: ['日', '一', '二', '三', '四', '五', '六']
    }
  },
  computed: {
    monthText() {
      return `${this.year}-${String(this.month).padStart(2, '0')}`
    },
    // 该月天数
    daysInMonth() {
      const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      let days = daysInMonths[this.month - 1]
      
      // 处理闰年2月
      if (this.month === 2 && this.isLeapYear(this.year)) {
        days = 29
      }
      
      return days
    },
    // 该月第一天是星期几（0=周日）
    firstDayOfMonth() {
      return new Date(this.year, this.month - 1, 1).getDay()
    },
    // 月末空白格子数
    lastEmptyCells() {
      const totalCells = this.firstDayOfMonth + this.daysInMonth
      return totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
    }
  },
  methods: {
    // 判断是否闰年
    isLeapYear(year) {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    },
    
    // 获取某天的状态（0-工作日，1-休息日，2-法定节假日，3-调休上班）
    getDayState(day) {
      const dayStr = String(day).padStart(2, '0')
      const dayData = this.monthData.find(d => d.day === dayStr)
      
      if (!dayData) return 0 // 默认工作日
      
      // 将 dayType 转换为 state
      return dayData.isOffDay || 0
    },
    
    // 获取某天是星期几
    getDayOfWeek(day) {
      return new Date(this.year, this.month - 1, day).getDay()
    },
    
    // 获取日期样式类
    getDayClass(day) {
      const state = this.getDayState(day)
      
      const classes = ['calendar-day']
      
      // 根据状态添加样式
      if (state == 1) {
        classes.push('calendar-day--weekend')
      } else if (state == 2) {
        classes.push('calendar-day--holiday')
      } else if (state == 3) {
        classes.push('calendar-day--workday')
      }
      
      return classes
    },
    
    // 获取日期标题（节假日名称）
    getDayTitle(day) {
      const state = this.getDayState(day)
      if (state == 1) {
        return '休息日'
      } else if (state == 2) {
        return '节假日'
      } else if (state == 3) {
        return '调休上班'
      }
      return ''
    },
    
    // 获取徽标类型
    getDayBadge(day) {
      const state = this.getDayState(day)
      if (state == 2) {
        return 'rest' // 休
      } else if (state == 3) {
        return 'work' // 班
      }
      return ''
    },
    
    // 编辑按钮点击
    handleEdit() {
      this.$emit('edit',{title:this.monthText,arr:this.monthData} )
    },
    
    // 日期点击
    handleDayClick(day) {
      this.$emit('day-click', {
        year: this.year,
        month: this.month,
        day,
        state: this.getDayState(day)
      })
    }
  }
}
</script>

<style scoped lang="less">
.month-calendar-card {
  background: #fff;
  border-radius: 6px;
  padding: 7px 10px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

.month-calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.month-calendar-title {
  font-size: 16px;
  font-weight: 600;
  color: #1677ff;
}

.month-calendar-edit-btn {
  height: 25px;
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

.month-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

/* 星期头部 */
.weekday-header {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  padding: 3px 0;
  margin-bottom: 2px;
  
  &--weekend {
    color: #1677ff;
  }
}

/* 日期格子 */
.calendar-day {
  height: 29px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #1f2937;
  background: #f9fafb;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f5ff;
  }
  
  &--empty {
    background: #fff;
    color: #d1d5db;
    cursor: default;
    
    &:hover {
      background: #fff;
    }
  }
  
  &--weekend {
    background: #e8f3ff;
    color: #1677ff;
  }
  
  &--holiday {
    background: #fff1f3;
    color: #f53f3f;
    font-weight: 600;
  }
  
  &--workday {
    background: repeating-linear-gradient(
      45deg,
      #fff7e6,
      #fff7e6 3px,
      #ffe7ba 3px,
      #ffe7ba 6px
    );
    color: #d46b08;
    font-weight: 600;
    border: 1px solid #ffa940;
  }
}

/* 日期徽标 */
.day-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
  padding: 0 3px;
  border-radius: 3px;
  line-height: 14px;
  z-index: 1;
  
  &.rest {
    background: #f53f3f;
  }
  
  &.work {
    background: #1677ff;
  }
}

/* 响应式设计 */
@media (max-width: 1199px) {
  .month-calendar-card {
    padding: 12px;
  }
  
  .calendar-day {
    height: 28px;
    font-size: 12px;
  }
  
  .day-badge {
    font-size: 8px;
    padding: 0 2px;
    line-height: 12px;
  }
}

@media (max-width: 991px) {
  .month-calendar-card {
    padding: 10px;
  }
  
  .month-calendar-title {
    font-size: 14px;
  }
  
  .calendar-day {
    height: 26px;
    font-size: 11px;
  }
}

@media (max-width: 767px) {
  .month-calendar-card {
    padding: 8px;
  }
  
  .month-calendar-title {
    font-size: 13px;
  }
  
  .calendar-day {
    height: 32px;
    font-size: 13px;
  }
}
</style>