<template>
  <div class="attendance-calendar">
    <div class="calendar-header">{{ yearMonth | formatMonth }}</div>
    <div class="calendar-weekdays">
      <span v-for="day in weekDays" :key="day">{{ day }}</span>
    </div>
    <div class="calendar-grid">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="['calendar-day', { 'rest-day': day.isWeekend }]"
      >
        <div class="day-number">{{ day.day }}</div>
        <div v-if="day.tag" :class="['day-tag', day.tagClass]">{{ day.tag }}</div>
        <div :class="['day-hours', { 'day-hoursa':day.hours && day.hours!='0h' }]">{{ day.hours }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HrAttendanceCalendar',
  props: {
    mainDATA:{
      type: Object,
      default: () => {}
    },
    employeeId: {
      type: String,
      default: ''
    },
    yearMonth: {
      type: String,
      default: ''
    }
  },
  filters: {
    formatMonth(val) {
      if (!val) return ''
      const [year, month] = val.split('-')
      return `${year}年${parseInt(month)}月`
    }
  },
  data() {
    return {
      weekDays: ['日', '一', '二', '三', '四', '五', '六'],
      calendarDays: [],
      attendanceData: {}
    }
  },
  watch: {
    employeeId() {
      this.loadAttendanceData()
    },
    yearMonth() {
      this.loadAttendanceData()
    }
  },
  created() {
    this.loadAttendanceData()
  },
  methods: {
    // 加载出勤数据
    loadAttendanceData() {
      if(this.mainDATA.hattendanceVos && this.mainDATA.hattendanceVos.length>0){
        this.attendanceData = {}
        this.mainDATA.hattendanceVos.forEach(item => {
          this.attendanceData[item.attendanceDate.split('-')[2]]={ hours: item.attendanceTime, tag: item.atttag || '', tagClass: '' }
        })
      }
      this.generateCalendar()
    },
    
    // 生成日历
    generateCalendar() {
      if (!this.yearMonth) return
      
      const [year, month] = this.yearMonth.split('-').map(Number)
      const firstDay = new Date(year, month - 1, 1)
      const startWeekDay = firstDay.getDay()
      const daysInMonth = new Date(year, month, 0).getDate()
      
      const days = []
      
      // 补齐月初空白
      for (let i = 0; i < startWeekDay; i++) {
        days.push({ day: '', isWeekend: false, hours: '', tag: '' })
      }
      // 生成每一天
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d)
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        let day =d>9?d:`0${d}`
        const info = this.attendanceData[day] || {}
        days.push({
          day: day,
          isWeekend,
          hours: (isWeekend ? '0' : (info.hours || '0')) + 'h',
          tag: isWeekend ? '' : (info.tag || ''),
          tagClass: info.tagClass || ''
        })
      }
      this.calendarDays = days
    }
  }
}
</script>

<style scoped lang="less">
.attendance-calendar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
      background: linear-gradient(to bottom, #f2fcff 0%, #69b5cf 100%);
    padding: 10px;
    border-radius: 10px;
}

.calendar-header {
  font-weight: 600;
  font-size: 16px;
  color: #1890ff;
  margin-bottom: 12px;
  text-align: center;
  padding: 8px 0;
  flex-shrink: 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #1890ff, #13c2c2);
    border-radius: 1px;
  }
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #5ccbf1 100%);
  border-radius: 6px;
  padding: 8px 4px;
  flex-shrink: 0;

  span {
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    color: #0050b3;
    padding: 4px 0;
    
    &:nth-child(1),
    &:nth-child(7) {
      color: #ff4d4f;
    }
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  flex: 1;
  overflow: hidden;
}

.calendar-day {
  border: 1px solid #d6e4ff;
  border-radius: 6px;
  padding: 6px 4px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #fff;
  transition: all 0.2s ease;
  min-height: 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: transparent;
    border-radius: 6px 6px 0 0;
    transition: background 0.2s ease;
  }
  
  &:hover {
    border-color: #1890ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
    transform: translateY(-1px);
    
    &::before {
      background: linear-gradient(90deg, #1890ff, #13c2c2);
    }
  }

  .day-number {
    font-size: 14px;
    font-weight: 600;
    color: #262626;
  }

  .day-hours {
    font-size: 12px;
    color: #bfbfbf;
    margin-top: 4px;
    font-weight: 500;
  }
  
  .day-hoursa {
    color: #1890ff;
    font-weight: 600;
      // background: linear-gradient(90deg, #1890ff, #13c2c2);

    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
  }

  .day-tag {
    font-size: 11px;
    margin-top: 2px;
    padding: 1px 6px;
    border-radius: 3px;
    font-weight: 500;
    display: inline-block;

    &.sick {
      color: #f5222d;
      background: #fff1f0;
      border: 1px solid #ffa39e;
    }

    &.personal {
      color: #fa8c16;
      background: #fff7e6;
      border: 1px solid #ffd591;
    }

    &.annual {
      color: #52c41a;
      background: #f6ffed;
      border: 1px solid #b7eb8f;
    }
  }

  &.rest-day {
    background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
    border-color: #d9d9d9;

    .day-number {
      color: #8c8c8c;
    }

    .day-hours {
      color: #bfbfbf;
    }
  }
}

// 响应式优化
@media (max-width: 768px) {
  .calendar-header {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .calendar-weekdays {
    padding: 6px 4px;
    
    span {
      font-size: 12px;
    }
  }
  
  .calendar-day {
    padding: 4px 2px;
    
    .day-number {
      font-size: 13px;
    }
    
    .day-hours {
      font-size: 11px;
    }
    
    .day-tag {
      font-size: 10px;
      padding: 1px 4px;
    }
  }
}
</style>