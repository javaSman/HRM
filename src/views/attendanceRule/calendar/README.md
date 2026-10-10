# 年度节假日日历组件

## 简介

年度节假日日历组件用于管理和展示年度节假日安排，支持按年度查看、编辑日期类型（工作日、休息日、法定节假日、调休上班）。

## 功能特性

- ✅ 年度日历网格展示（12个月）
- ✅ 日期类型管理（工作日、休息日、法定节假日、调休上班）
- ✅ 年度筛选
- ✅ 月份批量编辑
- ✅ 视觉化区分不同日期类型
- ✅ 响应式设计

## 组件结构

```
calendar/
├── calendar.vue                    # 主组件（年度日历）
├── modules/
│   ├── MonthCalendar.vue          # 月历子组件
│   └── EditCalendarModal.vue      # 编辑弹框组件
└── README.md                       # 文档
```

## 日期类型状态值

| 状态值 | 类型 | 说明 | 样式 |
|--------|------|------|------|
| 0 | 工作日 | 正常工作日 | 灰色背景 |
| 1 | 休息日 | 周末休息日 | 蓝色背景 |
| 2 | 法定节假日 | 法定节假日（元旦、春节、清明等） | 红色背景 + "休"徽标 |
| 3 | 调休上班 | 因节假日调休需要上班的周末 | 橙色条纹背景 + "班"徽标 |

## 使用方法

### 基础用法

```vue
<template>
  <HolidayCalendar />
</template>

<script>
import HolidayCalendar from '@/views/attendanceRule/calendar/calendar.vue'

export default {
  components: {
    HolidayCalendar
  }
}
</script>
```

### 数据结构

#### 年份数据格式

```javascript
{
  "2026-01": [  // 月份键：YYYY-MM
    { day: "01", dayType: 2 },  // 1号，法定节假日
    { day: "02", dayType: 1 },  // 2号，休息日
    { day: "03", dayType: 0 },  // 3号，工作日
    // ...
  ],
  "2026-02": [
    // ...
  ]
}
```

#### 编辑数据格式

```javascript
[
  {
    yf: "01",           // 月份（字符串）
    day: "01",          // 日期（字符串）
    week: "周三",       // 星期文本
    dayType: 2          // 日期类型状态值
  },
  // ...
]
```

## 组件属性

### MonthCalendar 组件

| 属性名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| year | Number | 是 | 年份 |
| month | Number | 是 | 月份（1-12） |
| monthData | Array | 否 | 该月的日期数据 |

### EditCalendarModal 组件

| 属性名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| value | Boolean | 否 | 是否显示弹框 |
| title | String | 否 | 弹框标题 |
| editDays | Array | 否 | 编辑数据数组 |

### 事件

#### MonthCalendar 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| edit | `{ title, arr }` | 点击编辑按钮，title为月份标题，arr为该月数据 |
| day-click | `{ year, month, day, state }` | 点击日期格子 |

#### EditCalendarModal 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| cancel | - | 取消编辑 |
| ok | - | 保存编辑 |

## 核心方法

### calendar.vue

| 方法名 | 说明 |
|--------|------|
| `initData()` | 初始化数据（获取年份列表和年份数据） |
| `getYearList()` | 获取可用年份列表（目前使用假数据） |
| `getYearData()` | 获取指定年份的日历数据 |
| `getMonthData(month)` | 获取某月的数据 |
| `handleYearChange(year)` | 年份切换 |
| `handleReset()` | 重置筛选 |
| `handleEdit(obj)` | 打开编辑弹框 |
| `handleSave()` | 保存编辑数据 |
| `handleCancel()` | 取消编辑 |

### MonthCalendar.vue

| 方法名 | 说明 |
|--------|------|
| `isLeapYear(year)` | 判断是否闰年 |
| `getDayState(day)` | 获取某天的状态值 |
| `getDayOfWeek(day)` | 获取某天是星期几 |
| `getDayClass(day)` | 获取某天的样式类 |
| `getDayTitle(day)` | 获取某天的提示文本 |
| `getDayBadge(day)` | 获取某天的徽标类型 |
| `handleEdit()` | 触发编辑事件 |
| `handleDayClick(day)` | 触发日期点击事件 |

### EditCalendarModal.vue

| 方法名 | 说明 |
|--------|------|
| `getStateText(state)` | 获取状态文本 |
| `getTypeTagClass(state)` | 获取类型标签样式类 |
| `handleCancel()` | 取消编辑 |
| `handleSave()` | 保存编辑数据 |

## 样式说明

### 日期格子样式

- **工作日**：`.calendar-day` - 灰色背景 `#f9fafb`
- **休息日**：`.calendar-day--weekend` - 蓝色背景 `#e8f3ff`
- **法定节假日**：`.calendar-day--holiday` - 红色背景 `#fff1f3`，加粗字体
- **调休上班**：`.calendar-day--workday` - 橙色条纹背景，加粗字体

### 徽标样式

- **休**：红色背景 `#f53f3f`，显示在法定节假日日期右上角
- **班**：蓝色背景 `#1677ff`，显示在调休上班日期右上角

## 后端接口

### 获取年份数据

```
GET /hr_calendar_holiday/hrCalendarHoliday/list?nf=2026
Response: {
  success: true,
  result: {
    "2026-01": [
      { day: "01", dayType: 2 },
      { day: "02", dayType: 1 },
      // ...
    ]
  }
}
```

### 批量编辑数据

```
POST /hr_calendar_holiday/hrCalendarHoliday/editBatch
Request: [
  { yf: "01", day: "01", dayType: 2 },
  { yf: "01", day: "02", dayType: 1 },
  // ...
]
Response: {
  success: true,
  message: "保存成功"
}
```

### 获取年份列表（待实现）

```
GET /hr_calendar_holiday/hrCalendarHoliday/getYear'
Response: {
  result: [2024, 2025, 2026]
}
```

## 响应式设计

组件支持以下断点：

- **≥1200px**：4列网格
- **992px-1199px**：3列网格
- **768px-991px**：2列网格
- **<768px**：1列网格

## 注意事项

1. **数据一致性**：编辑保存后，本地数据和后端数据需保持同步
2. **年份范围**：建议提供合理的年份范围（如当前年份前后5年）
3. **权限控制**：编辑功能需要根据用户权限控制
4. **数据验证**：保存前需验证数据完整性和合法性
5. **字典配置**：日期类型使用字典 `day_type`，需在后台配置

## 待优化项

- [ ] 年份列表接口对接（目前使用假数据）
- [ ] 添加数据加载状态提示
- [ ] 完善错误处理机制
- [ ] 抽取公共状态映射逻辑

## 更新日志

### v1.2.0 (2026-07-14)

- 🐛 修复 Vue key 重复警告（空白格子 key 命名优化）
- 📝 完善文档，修正状态值映射说明
- 📝 更新数据结构说明，与实际代码保持一致
- 📝 补充组件结构和接口文档

### v1.1.0 (2026-07-14)

- ✨ 新增"休息日"选项（dayType=1）
- 🔄 调整状态值映射：
  - 工作日：默认 → 0
  - 休息日：新增 → 1
  - 法定节假日：2
  - 调休上班：3
- 🎨 新增休息日样式类
- 📝 完善文档说明

### v1.0.0 (2026-01-01)

- 🎉 初始版本发布
- ✅ 支持年度日历展示
- ✅ 支持日期类型编辑