<template>
  <div class="schedule-calendar">
    <div class="calendar-section-title">日历预览</div>

    <!-- 员工信息 -->
    <div class="calendar-info" v-if="empName">
      <a-icon type="user" style="margin-right: 4px; color: #2d78ff;" />
      <span>{{ empName }}（{{ empNo }}）</span>
    </div>

    <!-- 月份导航 -->
    <div class="calendar-header">
      <a-button type="link" size="small" class="calendar-nav-btn" @click="changeMonth(-1)">
        <a-icon type="left" />
      </a-button>
      <span class="calendar-month">{{ currentYear }}年{{ currentMonth + 1 }}月</span>
      <a-button type="link" size="small" class="calendar-nav-btn" @click="changeMonth(1)">
        <a-icon type="right" />
      </a-button>
    </div>

    <!-- 日历网格 -->
    <div class="calendar-grid">
      <!-- 星期标题 -->
      <div
        v-for="(w, i) in weekDays"
        :key="w"
        class="calendar-weekday"
        :class="{ 'is-weekend': i === 0 || i === 6 }"
      >{{ w }}</div>

      <!-- 空白填充 -->
      <div class="calendar-day empty" v-for="n in startDayOfWeek" :key="'empty-' + n"></div>

      <!-- 日期 -->
      <div
        v-for="d in daysInMonth"
        :key="d"
        class="calendar-day"
        :class="{
          weekend: isWeekend(d),
          today: isToday(d)
        }"
      >
        <div class="day-num" :class="{ today: isToday(d) }">{{ d }}</div>
        <div class="day-tag" :class="getDayTagClass(d)">{{ getDayTagLabel(d) }}</div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="calendar-legend">
      <span class="legend-item"><i class="legend-dot morning"></i>白班</span>
      <span class="legend-item"><i class="legend-dot noon"></i>中班</span>
      <span class="legend-item"><i class="legend-dot night"></i>夜班</span>
      <span class="legend-item"><i class="legend-dot rest"></i>休息</span>
      <span class="legend-item"><i class="legend-dot unassigned"></i>未排班</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HrScheduleCalendar',
  props: {
    shifts: {
      type: Array,
      default: () => []
    },
    empName: {
      type: String,
      default: ''
    },
    empNo: {
      type: String,
      default: ''
    },
    // 年月（YYYY-MM），由列表页传入；不传时默认当前月
    scheduleMonth: {
      type: String,
      default: ''
    }
  },
  data() {
    const initDate = this.parseMonth(this.scheduleMonth)
    return {
      currentYear: initDate.year,
      currentMonth: initDate.month,
      weekDays: ['日', '一', '二', '三', '四', '五', '六']
    }
  },
  watch: {
    // 列表切换年月后重新打开弹窗时，日历同步到传入的年月
    scheduleMonth(val) {
      this.setMonth(val)
    }
  },
  computed: {
    // 当月第一天是星期几（0=周日）
    startDayOfWeek() {
      return new Date(this.currentYear, this.currentMonth, 1).getDay()
    },
    // 当月天数
    daysInMonth() {
      return new Date(this.currentYear, this.currentMonth + 1, 0).getDate()
    }
  },
  methods: {
    // 解析 YYYY-MM 为 { year, month(0-11) }，无效时回退到当前月
    parseMonth(monthStr) {
      const now = new Date()
      if (monthStr && /^\d{4}-\d{1,2}$/.test(monthStr)) {
        const [year, month] = monthStr.split('-').map(Number)
        return { year, month: month - 1 }
      }
      return { year: now.getFullYear(), month: now.getMonth() }
    },

    // 外部调用：设置日历显示的年月（YYYY-MM）
    setMonth(monthStr) {
      const { year, month } = this.parseMonth(monthStr)
      this.currentYear = year
      this.currentMonth = month
    },

    // 格式化日期为 YYYY-MM-DD
    formatDate(d) {
      const mm = String(this.currentMonth + 1).padStart(2, '0')
      const dd = String(d).padStart(2, '0')
      return `${this.currentYear}-${mm}-${dd}`
    },

    // 判断是否为今天
    isToday(d) {
      const today = new Date()
      return today.getFullYear() === this.currentYear &&
             today.getMonth() === this.currentMonth &&
             today.getDate() === d
    },

    // 判断是否为周末（0=周日, 6=周六）
    isWeekend(d) {
      const dayOfWeek = new Date(this.currentYear, this.currentMonth, d).getDay()
      return dayOfWeek === 0 || dayOfWeek === 6
    },

    // 获取某天的星期几（0=周日, 6=周六）
    getDayOfWeek(d) {
      return new Date(this.currentYear, this.currentMonth, d).getDay()
    },

    // 根据日期获取班次
    getShiftForDate(dateStr) {
      if (!this.shifts || this.shifts.length === 0) return null
      for (const s of this.shifts) {
        // 数据库返回的日期带时间（如 "2026-08-01 00:00:00"），只取日期部分比较
        const startDateOnly = s.startDate ? s.startDate.split(' ')[0] : ''
        const endDateOnly = s.endDate ? s.endDate.split(' ')[0] : ''
        if (startDateOnly && endDateOnly && dateStr >= startDateOnly && dateStr <= endDateOnly) {
          return s.timeType
        }
      }
      return null
    },

    // 获取日期标签文字
    getDayTagLabel(d) {
      const dateStr = this.formatDate(d)
      const dayOfWeek = this.getDayOfWeek(d)

      // 周日固定休息
      if (dayOfWeek === 0) {
        return '休息'
      }

      const shift = this.getShiftForDate(dateStr)

      // 周六逻辑
      if (dayOfWeek === 6) {
        return shift ? shift : '休息'
      }

      // 工作日逻辑
      return shift ? shift : '未排班'
    },

    // 获取日期标签样式
    getDayTagClass(d) {
      const label = this.getDayTagLabel(d)
      const classMap = {
        '白班': 'shift-morning',
        '中班': 'shift-noon',
        '夜班': 'shift-night',
        '休息': 'rest',
        '未排班': 'unassigned'
      }
      return classMap[label] || 'rest'
    },

    // 切换月份
    changeMonth(dir) {
      this.currentMonth += dir
      if (this.currentMonth > 11) {
        this.currentMonth = 0
        this.currentYear++
      } else if (this.currentMonth < 0) {
        this.currentMonth = 11
        this.currentYear--
      }
    },

    // 外部调用：更新日历
    updateCalendar() {
      // Vue 响应式会自动处理 shifts prop 的变化
      // 保留此方法供外部调用，保持接口兼容性
    }
  }
}
</script>

<style scoped lang="less">
.schedule-calendar {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #d1d9e6;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.calendar-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a2a3d;
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 3px solid #2d78ff;
}

.calendar-info {
  font-size: 12px;
  color: #475569;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #f0f5ff 0%, #f7f8fa 100%);
  border-radius: 6px;
  border: 1px solid #e0e7ff;
}

// ---------- 月份导航 ----------
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 4px 0;
}

.calendar-nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d78ff;
  transition: all 0.2s;

  &:hover {
    background: #e6f0ff;
  }
}

.calendar-month {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  min-width: 100px;
  text-align: center;
  letter-spacing: 1px;
}

// ---------- 日历网格 ----------
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  flex: 1;
}

.calendar-weekday {
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  padding: 6px 0;
  font-weight: 600;
  letter-spacing: 1px;

  &.is-weekend {
    color: #2d78ff;
  }
}

.calendar-day {
  min-height: 48px;
  border: 1px solid #eef2f6;
  border-radius: 6px;
  padding: 4px 3px 3px 3px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  transition: all 0.15s ease;

  &:hover {
    border-color: #c7d8f5;
    box-shadow: 0 1px 4px rgba(45, 120, 255, 0.08);
  }

  &.weekend {
    background: linear-gradient(180deg, #f0f5ff 0%, #f8faff 100%);
    border-color: #d4e2f7;
  }

  &.today {
    border-color: #2d78ff;
    box-shadow: 0 0 0 1px #2d78ff, 0 2px 8px rgba(45, 120, 255, 0.15);
  }

  &.empty {
    background: transparent;
    border: none;
    box-shadow: none;

    &:hover {
      box-shadow: none;
    }
  }
}

// ---------- 日期数字 ----------
.day-num {
  font-size: 12px;
  color: #334155;
  font-weight: 600;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  align-self: center;

  &.today {
    background: linear-gradient(135deg, #2d78ff 0%, #1a5fd4 100%);
    color: #fff;
    box-shadow: 0 2px 6px rgba(45, 120, 255, 0.3);
  }
}

// ---------- 班次标签 ----------
.day-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  line-height: 16px;
  white-space: nowrap;
  font-weight: 600;
  letter-spacing: 0.3px;
  align-self: flex-start;

  &.rest {
    color: #94a3b8;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
  }

  &.shift-morning {
    color: #ea580c;
    background: #fff7ed;
    border: 1px solid #fed7aa;
  }

  &.shift-noon {
    color: #16a34a;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
  }

  &.shift-night {
    color: #7c3aed;
    background: #faf5ff;
    border: 1px solid #ddd6fe;
  }

  &.unassigned {
    color: #a1a1aa;
    background: #fafafa;
    border: 1px solid #e4e4e7;
  }
}

// ---------- 图例 ----------
.calendar-legend {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;

  &.morning {
    background: #fff7ed;
    border: 1px solid #fed7aa;
  }

  &.noon {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
  }

  &.night {
    background: #faf5ff;
    border: 1px solid #ddd6fe;
  }

  &.rest {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
  }

  &.unassigned {
    background: #fafafa;
    border: 1px solid #e4e4e7;
  }
}
</style>
