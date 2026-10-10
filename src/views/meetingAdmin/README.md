# 会议管理模块 (MeetingAdmin)

## 📋 模块概述

会议管理模块提供了完整的会议室预约和管理解决方案，包括会议室管理、会议预约、会议状态查看等功能。该模块支持会议室资源管理、时间段预约、会议统计等功能，帮助企业高效管理会议室资源。

## 📁 文件结构

```
meetingAdmin/
├── HrmHyglBookingList.vue        # 会议预约列表
├── HrmHyglRoomList.vue           # 会议室管理
├── HrmHyglRoomStatusList.vue     # 会议室情况（时段视图）
├── hygl-theme.less               # 会议模块主题样式
└── modules/                      # 子组件目录
    ├── HrmHyglBookingModal.vue           # 会议预约弹窗
    ├── HrmHyglBookingDetailModal.vue     # 会议预约详情弹窗
    ├── HrmHyglBookingCancelModal.vue     # 会议取消弹窗
    ├── HrmHyglRoomModal.vue              # 会议室表单弹窗
    └── HrmHyglRoomForm.vue               # 会议室表单组件
```

## 🎯 功能模块

### 1. 会议预约列表 (HrmHyglBookingList)

**路径**: `HrmHyglBookingList.vue`

**功能描述**:
- 查看所有会议预约记录
- 新增、编辑、取消会议预约
- 筛选和搜索会议

**主要特性**:
- 📊 **统计看板**: 已预约、已结束、已取消、累计参会人次
- 🔍 **智能筛选**: 支持会议主题、会议室、申请人、工号、时间等多维度搜索
- 📅 **时间筛选**: 支持按日期和时间范围筛选
- 📝 **预约功能**: 新增会议预约
- ✏️ **编辑功能**: 编辑会议信息
- ❌ **取消功能**: 取消会议预约
- 📋 **详情查看**: 查看会议详细信息

**统计卡片**:
- 📅 **已预约**: 显示已预约的会议数量
- ✅ **已结束**: 显示已结束的会议数量
- ❌ **已取消**: 显示已取消的会议数量
- 👥 **累计参会人次**: 显示累计参会人数

**筛选条件**:
- 会议主题/会议室（关键词搜索）
- 申请人姓名
- 申请人工号
- 会议日期
- 开始时间
- 结束时间

**核心代码示例**:
```vue
<!-- 统计卡片 -->
<div class="h-stat-bar">
  <div class="h-stat-card">
    <div class="h-stat-icon blue"><a-icon type="calendar" /></div>
    <div>
      <div class="h-stat-num">{{ stats.bookedCount }}</div>
      <div class="h-stat-label">已预约</div>
    </div>
  </div>
  <div class="h-stat-card">
    <div class="h-stat-icon green"><a-icon type="check-circle" /></div>
    <div>
      <div class="h-stat-num">{{ stats.doneCount }}</div>
      <div class="h-stat-label">已结束</div>
    </div>
  </div>
</div>

<!-- 筛选面板 -->
<div class="h-filter-panel">
  <div class="h-filter-item">
    <span class="h-filter-label">会议主题/会议室</span>
    <a-input v-model="queryParam.searchKeyword" 
             placeholder="搜索会议主题/会议室" />
  </div>
  <div class="h-filter-item">
    <span class="h-filter-label">会议日期</span>
    <a-date-picker v-model="meetingDate" format="YYYY-MM-DD" />
  </div>
</div>
```

### 2. 会议室管理 (HrmHyglRoomList)

**路径**: `HrmHyglRoomList.vue`

**功能描述**:
- 管理会议室资源
- 新增、编辑、删除会议室
- 查看会议室使用状态

**主要特性**:
- 📊 **资源统计**: 显示会议室数量和使用状态
- 🔍 **快速搜索**: 按会议室名称搜索
- ➕ **新增会议室**: 添加新的会议室
- ✏️ **编辑功能**: 编辑会议室信息
- 🗑️ **删除功能**: 删除会议室
- 📋 **状态标识**: 显示会议室使用状态（使用中/空闲）

**会议室信息字段**:
- 会议室编号
- 会议室名称
- 容纳人数
- 会议室状态（使用中/空闲）
- 备注
- 创建时间

**核心代码示例**:
```vue
<!-- 表格展示 -->
<a-table :columns="columns" :dataSource="dataSource">
  <!-- 会议状态 -->
  <template slot="status" slot-scope="text">
    <span :class="['h-usage-tag', text === 'in-use' ? 'in-use' : 'idle']">
      <span class="dot"></span>
      {{ text === 'in-use' ? '使用中' : '空闲' }}
    </span>
  </template>
  
  <!-- 容纳人数 -->
  <template slot="capacity" slot-scope="text">
    <div class="h-capacity-cell">
      <a-icon type="team" />
      {{ text }} 人
    </div>
  </template>
  
  <!-- 操作 -->
  <template slot="action" slot-scope="text, record">
    <button class="h-btn-icon" @click="handleEdit(record)">
      <a-icon type="edit" />编辑
    </button>
    <a-popconfirm title="确定删除该会议室吗?" @confirm="handleDelete(record.id)">
      <button class="h-btn-icon danger">
        <a-icon type="delete" />删除
      </button>
    </a-popconfirm>
  </template>
</a-table>
```

### 3. 会议室情况 (HrmHyglRoomStatusList)

**路径**: `HrmHyglRoomStatusList.vue`

**功能描述**:
- 可视化展示会议室时段占用情况
- 快速查看会议室预约状态
- 支持日期切换查看

**主要特性**:
- 🏷️ **会议室切换**: 支持多个会议室快速切换
- 📅 **日期选择**: 支持选择日期查看
- 🚀 **快捷日期**: 今天、明天快捷选择
- ⏰ **时段网格**: 24小时时段网格展示
- 🎨 **状态标识**: 空闲、已预约、已过期状态显示
- 👤 **预约人信息**: 显示预约人姓名和工号

**时段状态**:
- 🟢 **空闲**: 该时段未被预约
- 🔴 **已预约**: 该时段已被预约，显示预约人信息
- ⚫ **已过期**: 该时段已过，不可预约

**界面布局**:
1. **会议室标签栏**: 显示所有会议室，点击切换
2. **日期选择行**: 选择日期 + 快捷日期按钮
3. **时段网格**: 显示 24 小时时段状态
4. **图例说明**: 空闲、已预约、已过期说明

**核心代码示例**:
```vue
<!-- 会议室标签页 -->
<div class="h-room-tabs-bar">
  <span v-for="room in rooms" :key="room.id"
        :class="['h-room-tab', activeRoomId === room.id ? 'active' : '']"
        @click="switchRoom(room.id)">
    <a-icon type="door" />{{ room.name }}
  </span>
</div>

<!-- 日期选择行 -->
<div class="h-date-picker-row">
  <span class="h-date-lbl">选择日期：</span>
  <a-date-picker v-model="selectedDate" format="YYYY-MM-DD" />
  <div class="h-date-shortcut">
    <span :class="['ds', activeShortcut === 'today' ? 'active' : '']"
          @click="setDateShortcut('today')">今天</span>
    <span :class="['ds', activeShortcut === 'tomorrow' ? 'active' : '']"
          @click="setDateShortcut('tomorrow')">明天</span>
  </div>
</div>

<!-- 时段网格 -->
<div class="h-time-grid">
  <div v-for="slot in timeSlots" :key="slot.fromMinute"
       :class="['h-time-slot', slot.status]">
    <div class="slot-time">{{ slot.timeLabel }}</div>
    <div class="slot-status">{{ slotText(slot.status) }}</div>
    <div v-if="slot.status === 'busy'" class="slot-applicant">
      {{ slot.userName }} · {{ slot.userCode }}
    </div>
  </div>
</div>

<!-- 图例 -->
<div class="h-room-status-legend">
  <span class="leg"><span class="leg-dot idle"></span>空闲</span>
  <span class="leg"><span class="leg-dot busy"></span>已预约</span>
  <span class="leg"><span class="leg-dot past"></span>已过期</span>
</div>
```

**时段划分规则**:
- 将一天划分为多个时段（如每半小时一个时段）
- 时段从 00:00 到 23:30
- 过去时段标记为已过期
- 当前时段根据是否有预约显示状态

## 🔧 核心组件说明

### HrmHyglBookingModal.vue

**功能**: 会议预约弹窗

**特性**:
- 📝 **完整表单**: 包含会议主题、会议室、时间、参会人等
- 📅 **时间选择**: 支持选择会议开始和结束时间
- 🚫 **冲突检测**: 自动检测时间冲突
- 👥 **参会人管理**: 添加参会人员
- ✅ **表单验证**: 完善的表单验证规则

**表单字段**:
- 会议主题（必填）
- 会议室（必填）
- 会议日期（必填）
- 开始时间（必填）
- 结束时间（必填）
- 参会人数（必填）
- 会议描述（可选）
- 参会人员（可选）

### HrmHyglBookingDetailModal.vue

**功能**: 会议预约详情弹窗

**特性**:
- 📋 **详情展示**: 展示会议详细信息
- 📊 **参会人列表**: 显示参会人员列表
- ⏰ **时间信息**: 显示会议时间段
- 📍 **会议室信息**: 显示会议室名称和位置

### HrmHyglBookingCancelModal.vue

**功能**: 会议取消弹窗

**特性**:
- ❌ **取消原因**: 填写取消原因
- 🔔 **通知功能**: 通知参会人员
- ✅ **确认操作**: 二次确认取消

### HrmHyglRoomModal.vue

**功能**: 会议室表单弹窗

**特性**:
- 📝 **表单编辑**: 编辑会议室信息
- ✅ **表单验证**: 完善的验证规则
- 🔄 **保存更新**: 保存或更新会议室信息

### HrmHyglRoomForm.vue

**功能**: 会议室表单组件

**特性**:
- 📋 **表单字段**: 会议室名称、编号、容纳人数、备注等
- ✅ **验证规则**: 完善的表单验证
- 🎨 **表单布局**: 合理的表单布局

## 🎨 UI 设计规范

### 颜色主题

```less
// hygl-theme.less
@h-primary: #2965ed;            // 主色调-蓝色
@h-primary-rgb: 41, 101, 237;
@h-background: #f8fafc;         // 背景色
@h-foreground: #1e293b;         // 前景色/主文本
@h-muted-foreground: #64748b;   // 次要文本
@h-border: #e2e8f0;             // 边框颜色
@h-accent: #dbeafe;             // 强调色
@h-card: #ffffff;               // 卡片背景色
@h-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); // 阴影
```

### 状态颜色

| 状态 | 样式类 | 颜色 |
|------|--------|------|
| 已预约 | booked | 蓝色 (#2965ed) |
| 已结束 | done | 绿色 (#10b981) |
| 已取消 | cancelled | 琥珀色 (#f59e0b) |
| 使用中 | in-use | 红色 (#ef4444) |
| 空闲 | idle | 绿色 (#10b981) |
| 已过期 | past | 灰色 (#94a3b8) |

### 响应式断点

```less
@media (max-width: 768px) {
  // 移动端适配
  .h-filter-row {
    flex-direction: column;
  }
  .h-stat-bar {
    flex-wrap: wrap;
  }
}
```

### 图标使用

| 图标 | 说明 |
|------|------|
| calendar | 会议预约 |
| check-circle | 已结束 |
| close-circle | 已取消 |
| team | 参会人员 |
| door | 会议室 |
| edit | 编辑 |
| delete | 删除 |
| plus | 新增 |

## 🔌 API 接口

### 会议预约相关

| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/hygl/hrmHyglBooking/list` | GET | 获取会议预约列表 |
| `/hygl/hrmHyglBooking/queryById` | GET | 查询会议预约详情 |
| `/hygl/hrmHyglBooking/add` | POST | 新增会议预约 |
| `/hygl/hrmHyglBooking/edit` | POST | 编辑会议预约 |
| `/hygl/hrmHyglBooking/delete` | DELETE | 删除会议预约 |
| `/hygl/hrmHyglBooking/cancel` | POST | 取消会议预约 |
| `/hygl/hrmHyglBooking/statistics` | GET | 获取会议统计 |

### 会议室管理相关

| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/hygl/hrmHyglRoom/list` | GET | 获取会议室列表 |
| `/hygl/hrmHyglRoom/queryById` | GET | 查询会议室详情 |
| `/hygl/hrmHyglRoom/add` | POST | 新增会议室 |
| `/hygl/hrmHyglRoom/edit` | POST | 编辑会议室 |
| `/hygl/hrmHyglRoom/delete` | DELETE | 删除会议室 |

### 会议室状态相关

| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/hygl/hrmHyglRoom/rooms` | GET | 获取所有会议室 |
| `/hygl/hrmHyglRoom/timeline` | GET | 获取会议室时段占用情况 |

## 📊 数据字典

### 会议状态 (hrm_hygl_booking_status)

| 值 | 文本 |
|----|------|
| 0 | 已预约 |
| 1 | 已结束 |
| 2 | 已取消 |

### 会议室状态 (hrm_hygl_room_status)

| 值 | 文本 |
|----|------|
| in-use | 使用中 |
| idle | 空闲 |

### 时段状态

| 值 | 文本 |
|----|------|
| idle | 空闲 |
| busy | 已预约 |
| past | 已过期 |

## 🚀 使用示例

### 打开会议预约弹窗

```javascript
this.$refs.modalForm.add()
this.$refs.modalForm.title = '新增会议预约'
```

### 打开会议详情

```javascript
this.$refs.detailModal.show(record)
```

### 取消会议

```javascript
this.$refs.cancelModal.show(record)
```

### 切换会议室

```javascript
switchRoom(roomId) {
  this.activeRoomId = roomId
  this.loadTimeSlots()
}
```

### 设置日期快捷方式

```javascript
setDateShortcut(type) {
  if (type === 'today') {
    this.selectedDate = moment().format('YYYY-MM-DD')
  } else if (type === 'tomorrow') {
    this.selectedDate = moment().add(1, 'days').format('YYYY-MM-DD')
  }
  this.onDateChange()
}
```

### 检测时间冲突

```javascript
checkTimeConflict(roomId, startTime, endTime) {
  return getAction('/hygl/hrmHyglBooking/checkConflict', {
    roomId,
    startTime,
    endTime
  }).then(res => {
    return res.result.hasConflict
  })
}
```

## 📱 移动端适配

模块已做移动端适配，支持以下特性：
- ✅ 响应式布局
- ✅ 触摸手势操作
- ✅ 移动端优化的弹窗
- ✅ 自适应字体大小
- ✅ 时段网格自适应

## 🔒 权限控制

模块支持细粒度权限控制：
- **查看权限**: 查看会议和会议室信息
- **预约权限**: 预约会议室
- **管理权限**: 管理会议室资源
- **取消权限**: 取消会议预约

## 📝 开发规范

### 代码规范

1. **命名规范**:
   - 组件名使用 PascalCase
   - 方法名使用 camelCase
   - CSS 类名使用 kebab-case（h- 前缀）

2. **样式规范**:
   - 使用 Less 预处理器
   - 使用 `hygl-theme.less` 统一主题
   - 使用 scoped 避免样式污染

3. **注释规范**:
   - 复杂逻辑必须添加注释
   - 组件 props 必须添加说明
   - 关键算法必须添加注释

### Git 提交规范

```
feat: 新增功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

## 🐛 常见问题

### Q1: 预约时间冲突？

**原因**: 该时间段已被其他人预约

**解决**: 系统会自动检测时间冲突，选择其他时间段

### Q2: 时段状态未更新？

**原因**: 页面未刷新或接口数据延迟

**解决**: 刷新页面或重新选择日期/会议室

### Q3: 会议室无法删除？

**原因**: 会议室存在预约记录

**解决**: 先删除或取消相关预约，再删除会议室

### Q4: 会议无法取消？

**原因**: 会议已结束或权限不足

**解决**: 确认会议状态和用户权限

## 📈 最佳实践

### 会议预约建议

1. **提前预约**: 建议提前预约会议室，避免冲突
2. **准确填写**: 准确填写参会人数和会议信息
3. **及时取消**: 会议取消时及时取消预约，释放资源
4. **合理时长**: 合理安排会议时长，避免资源浪费

### 会议室管理建议

1. **定期维护**: 定期更新会议室信息
2. **容量管理**: 根据参会人数选择合适容量的会议室
3. **设施配置**: 明确会议室设施配置，方便选择

## 📚 相关文档

- [会议室管理 API 文档](./会议室管理API文档.md)

## 👥 维护者

- 开发团队: QR-HRM 开发组
- 最后更新: 2026-08-19

## 📄 版本历史

### v1.0.0 (2026-08-19)
- ✨ 初始版本发布
- 🎨 完成会议预约、会议室管理、会议室情况等核心功能
- 📊 支持会议统计和时段可视化
- 📱 支持移动端适配
- 📝 完善文档

---

如有问题或建议，请联系开发团队。
