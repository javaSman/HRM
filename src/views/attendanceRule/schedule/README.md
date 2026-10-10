# 员工排班配置模块 - 技术指南

## 📋 模块概述

员工排班配置模块用于管理企业员工的班次安排，支持固定班次和轮换班次两种模式。列表页按「年月」维度展示整月排班矩阵，编辑弹窗提供时段配置与日历实时预览，并支持按月份模板的 Excel 导入导出。

> 📌 当前版本不再按「未来 7 天」预览，而是以列表顶部选择的**年月**为准，动态生成当月 1 号至月末的全部日期列；弹窗日历也会定位到该年月。

---

## 🏗️ 模块结构

```
schedule/
├── HrScheduleList.vue          # 列表页面 - 年月筛选 + 整月排班矩阵 + 导入导出
├── README.md                   # 本技术指南
├── 排班.html                    # 静态原型稿（Bootstrap，仅作设计参考，不参与构建）
└── modules/
    ├── HrScheduleModal.vue       # 弹窗容器 - 包装表单组件（70% 宽，可全屏）
    ├── HrScheduleForm.vue        # 表单组件 - 员工信息 + 排班时段配置
    ├── HrScheduleCalendar.vue    # 日历组件 - 排班可视化预览（按查询年月定位）
    └── ScheduleImportModal.vue   # 导入弹窗 - 选择年月 + 下载模板 + 上传 .xls
```

---

## 🎯 核心功能

### 1. 列表管理 (HrScheduleList.vue)

#### 功能特性
- ✅ 按**年月**查询排班（默认当前月，不允许清空）
- ✅ 动态生成当月 1 号～月末的日期列（含星期标识）
- ✅ 多维度筛选（姓名、工号、公司下拉、部门级联）
- ✅ Excel 导入（按年月模板）/ 导出
- ✅ 批量删除（勾选后「批量操作」）
- ✅ 行操作：排班（编辑）、详情

> ⚠️ 页面中没有「新增」和单行「删除」入口（模板代码已注释保留），员工排班数据通过 **Excel 导入**初始化，再通过「排班」调整。

#### 年月查询逻辑

```javascript
// 查询条件中的 scheduleMonth 为 'YYYY-MM'
queryParam: { scheduleMonth: this.getCurrentMonth(), name: '', no: '', companyId: '', dept: '' }

// 切换年月：重建动态列并立即查询
onMonthChange() {
  this.initDynamicColumns(this.queryParam.scheduleMonth)
  this.searchQuery()
}

// 重写 mixin 的 getQueryParams：把 scheduleMonth 拆成 year、month 传给后端
// （month 去掉前导零，如 '09' -> '9'），并从参数中删除 scheduleMonth
getQueryParams() {
  const params = JeecgListMixin.methods.getQueryParams.call(this)
  if (this.queryParam.scheduleMonth) {
    const [year, month] = this.queryParam.scheduleMonth.split('-')
    params.year = year
    params.month = String(Number(month))
    delete params.scheduleMonth
  }
  return params
}
```

#### 动态列生成

```javascript
// 按所选年月生成整月日期列（28/29/30/31 列随月份自适应）
initDynamicColumns(monthStr) {
  const [year, month] = monthStr.split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate() // 当月天数
  const days = []
  const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      index: i - 1,
      dateStr: `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      display: `${weekNames[new Date(year, month - 1, i).getDay()]}(${i})`,
      dayOfWeek: new Date(year, month - 1, i).getDay()
    })
  }
  this.next7Days = days // 变量名为历史遗留，实际承载的是整月数据
  // ...map 为 { title, dataIndex: 'day'+index, width: 120, align: 'center' } 列配置
}
```

> 💻 **历史命名**：承载日期信息的 data 字段仍叫 `next7Days`、插槽仍叫 `day0…dayN`，属旧版「未来 7 天」方案的遗留命名，重构时建议改名（如 `monthDays`）。

#### 班次判断逻辑

```javascript
// 后端返回的日期带时间（如 "2026-08-01 00:00:00"），比较前必须截取日期部分
getShiftForDate(hrEmpSchedules, dateStr) {
  if (!hrEmpSchedules || hrEmpSchedules.length === 0) return null
  for (const s of hrEmpSchedules) {
    const startDateOnly = s.startDate ? s.startDate.split(' ')[0] : ''
    const endDateOnly = s.endDate ? s.endDate.split(' ')[0] : ''
    if (startDateOnly && endDateOnly && dateStr >= startDateOnly && dateStr <= endDateOnly) {
      return s.timeType // 白班 / 中班 / 夜班
    }
  }
  return null
}

// 标签规则：
//   周日           -> 休息（固定）
//   周六有排班      -> 班次，否则休息
//   工作日有排班    -> 班次，否则未排班
getShiftLabel(record, dateStr) { /* 见源码 */ }

// 标签颜色（a-tag color，支持十六进制）
getShiftColor(record, dateStr) {
  return {
    白班: 'orange', 中班: 'green', 夜班: 'purple',
    休息: '#4c83c9', 未排班: '#d9d9d9'
  }[this.getShiftLabel(record, dateStr)] || '#d9d9d9'
}
```

#### 公司 / 部门联动

- 公司下拉与部门级联用同一份树数据：`GET /org/hrmOrg/loadTreeRoot?pid=0`，取 `result[0].children`（公司列表），每个公司节点的 `children` 即部门树。
- 部门使用 `a-cascader`（`changeOnSelect` 允许选择任意层级，支持名称搜索），取选中路径末位 id 写入 `queryParam.dept`。
- 切换公司时清空已选部门。

#### 表格关键配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| rowKey | `'no'` | 以**工号**作为行唯一键（批量勾选基于工号） |
| scroll | `{ x: true, y: 530 }` | 日期列很多，横向滚动 |
| 操作列 | `fixed: 'right'` | 固定右侧 |
| 部门/岗位列 | JSX `a-tooltip` + ellipsis | 文本超长悬浮展示 `dept_dictText` / `postId_dictText` |

---

### 2. 排班表单 (HrScheduleForm.vue)

#### 功能特性
- ✅ 员工基本信息只读展示（姓名、工号、公司、部门、岗位，数据来自列表行记录）
- ✅ 班次类型字典下拉（`j-dict-select-tag`，dictCode = `bc`）
- ✅ 多时段配置：`+ 白班` / `+ 中班` / `+ 夜班` 按钮快速添加，提示「时间段不可重叠」
- ✅ 固定班次选月份自动算月初月末；轮换班次手动选起止日期
- ✅ 右侧日历实时联动
- ✅ 取消后数据可回滚（见「时段防丢失机制」）
- ✅ 详情模式（`disabled`）下全部改为文本标签展示

#### 班次类型动态切换

| 班次类型 | bc 值 | 字典文案 | 输入方式 | 数据处理 |
|---------|-------|---------|---------|---------|
| 固定班次 | `'1'` | 固定班次（蓝标） | 月选择器（`antype="month"`） | 自动计算当月 01 号～月末 |
| 轮换班次 | `'2'` | 轮换班次（绿标） | 开始/结束两个日期选择器 | 保留手动选择的日期 |

#### 月份自动计算

```javascript
onMonthChange(index, val) {
  if (val) {
    // val: 'YYYY-MM'
    const [year, month] = val.split('-').map(Number)
    const startDate = val + '-01'
    const lastDay = new Date(year, month, 0).getDate() // 下个月第 0 天 = 当月最后一天
    const endDate = val + '-' + String(lastDay).padStart(2, '0')
    this.$set(this.model.hrEmpSchedules[index], 'startDate', startDate)
    this.$set(this.model.hrEmpSchedules[index], 'endDate', endDate)
  } else {
    // 清空月份时同时清空起止日期
    this.$set(this.model.hrEmpSchedules[index], 'startDate', '')
    this.$set(this.model.hrEmpSchedules[index], 'endDate', '')
  }
  this.onShiftChange()
}
```

编辑回显时，固定班次的时段会从 `startDate` 截取前 7 位反填仅用于前端的 `month` 字段：

```javascript
if (this.model.bc == '1') {
  this.model.hrEmpSchedules.forEach(shift => {
    if (!shift.month && shift.startDate) shift.month = shift.startDate.substring(0, 7)
  })
}
```

#### 时段防丢失机制（取消回滚）

弹窗打开期间，时段的增删改都发生在内存中的 `model` 上。为避免「删除时段 → 取消 → 再次打开」后列表行数据已被污染：

1. **编辑时深拷贝** record，再 `Object.assign` 到 model，并立即备份：
   ```javascript
   edit(record) {
     const recordCopy = JSON.parse(JSON.stringify(record)) // 与列表行隔离
     this.model = Object.assign({}, this.model, recordCopy)
     this.modelBackup = JSON.parse(JSON.stringify(this.model))
     // ...回显 month、日历定位
   }
   ```
2. **删除已保存时段**时不直接调接口，而是把已有 `id` 收集进 `deleteBatch`，仅从界面移除。
3. **点保存**：先提交 `saveOrUpdateBatch`，若 `deleteBatch` 非空，再调 `deleteBatch?ids=...` 删除。
4. **点取消/关闭**：`resetForm()` 用 `modelBackup` 还原 model，**并清空 `deleteBatch`**，下次保存不会误删。

#### 提交数据格式

```javascript
submitForm() {
  // 校验通过后，整体提交时段数组（不是主表对象）
  const hrEmpSchedules = this.model.hrEmpSchedules.map(item => {
    let { timeType, startDate, endDate, id } = item
    return {
      id,
      timeType,
      startDate: startDate + ' 00:00:00',  // 补当天起始时间
      endDate: endDate + ' 23:59:59',      // 补当天结束时间，保证末日整天命中
      no: this.model.no,                    // 工号作为关联键
      bc: this.model.bc
    }
  })
  const method = this.model.id ? 'put' : 'post'
  httpAction('/hr_emp_schedule/hrEmpSchedule/saveOrUpdateBatch', hrEmpSchedules, method)
}
```

#### 详情模式

- `disabled` prop → 计算属性 `formDisabled`。
- 基本信息区额外展示「班次类型」标签；隐藏班次类型选择器、添加按钮、删除按钮。
- 日期选择器替换为渐变底文本块（`.shift-date-display`），避免灰色禁用框的视觉问题。

---

### 3. 日历预览 (HrScheduleCalendar.vue)

#### 功能特性
- ✅ 按列表传入的 `scheduleMonth`（YYYY-MM）定位月份，缺省回退当前月
- ✅ 上一月 / 下一月导航（自动跨年）
- ✅ 今日高亮（蓝色描边 + 日期圆点）
- ✅ 周末浅蓝底纹；班次标签软色系配色
- ✅ 底部图例：白班 / 中班 / 夜班 / 休息 / 未排班
- ✅ 员工信息条（姓名 + 工号）

#### 月份定位接口

```javascript
props: { shifts: Array, empName: String, empNo: String, scheduleMonth: String },

// 解析 'YYYY-MM' -> { year, month(0-11) }，非法时回退当前月
parseMonth(monthStr) { /* 正则 /^\d{4}-\d{1,2}$/ 校验 */ },

// 供父组件命令式调用（表单 edit 后 $refs.calendar.setMonth(...)）
setMonth(monthStr) {
  const { year, month } = this.parseMonth(monthStr)
  this.currentYear = year
  this.currentMonth = month
},

watch: {
  // 弹窗未销毁、仅切换了列表年月再次打开时，靠 watch 同步
  scheduleMonth(val) { this.setMonth(val) }
}
```

表单侧的联动调用：

```javascript
// HrScheduleForm.edit() 末尾
this.$nextTick(() => {
  this.$refs.calendar && this.$refs.calendar.setMonth(this.scheduleMonth)
})
```

#### 日历渲染

```javascript
computed: {
  startDayOfWeek() { return new Date(this.currentYear, this.currentMonth, 1).getDay() }, // 月首星期
  daysInMonth()    { return new Date(this.currentYear, this.currentMonth + 1, 0).getDate() } // 当月天数
}
```

布局为 CSS Grid（`grid-template-columns: repeat(7, 1fr)`）：先渲染 `startDayOfWeek` 个空白格补齐月首偏移，再逐日渲染。

#### 班次标签规则与样式

标签文字规则与列表页完全一致（周日休息 / 周六有班则班次否则休息 / 工作日未排班显灰）。日历不使用 `a-tag`，而是通过 `getDayTagClass` 映射为语义化 class：

| 标签 | class | 文字色 / 底色 |
|------|-------|--------------|
| 白班 | `shift-morning` | `#ea580c` / `#fff7ed` |
| 中班 | `shift-noon` | `#16a34a` / `#f0fdf4` |
| 夜班 | `shift-night` | `#7c3aed` / `#faf5ff` |
| 休息 | `rest` | `#94a3b8` / `#f1f5f9` |
| 未排班 | `unassigned` | `#a1a1aa` / `#fafafa` |

> 表格中的标签用的是 `a-tag` 内置色名（orange/green/purple）与十六进制色，两处视觉接近但实现不同，改动配色时需同步。

`updateCalendar()` 目前是空实现（shifts 是 prop，Vue 响应式自动更新），保留仅为兼容表单中的命令式调用。

---

### 4. 导入弹窗 (ScheduleImportModal.vue)

排班数据的主要初始化入口。由列表页「导入」按钮打开：

```vue
<schedule-import-modal
  ref="scheduleImportModal"
  :import-url="url.importExcelUrl"
  :template-url="url.downloadTemplateUrl"
  @ok="loadData" />
```

#### 交互流程

1. **选择排班数据所属年月**：年下拉（当前年 ±2 共 5 年）+ 月下拉（1～12），默认当前年月，每次 `show()` 重置。
2. **下载导入模板**：必须先选年月，`downFile(templateUrl, { year, month }, 'get')` 下载 Blob，文件名 `排班导入模板_YYYY年M月.xls`。
3. **上传文件**：`a-upload-dragger` 拖拽区，`beforeUpload` 返回 `false` 手动拦截 —— 仅暂存文件、不自动上传。
   - 仅接受 `.xls`（正则 `/\.xls$/i`）；
   - 只允许 1 个文件，重复选择需先移除。
4. **确定**：表单校验（年月 + 文件）后以 `FormData` 提交：
   ```javascript
   formData.append('file', this.fileList[0])
   formData.append('year', this.year)
   formData.append('month', this.month)
   postAction(this.importUrl, formData)
   ```
5. **部分成功提示**：后端返回 `code === 201` 表示导入成功但存在错误数据，弹 `$warning` 并提供错误明细下载链接（`result` 兼容文件地址字符串或 `{ msg, fileUrl, fileName }` 对象，相对地址自动拼接 `window._CONFIG.domianURL`）。
6. 成功后关闭弹窗并 `@ok` 触发列表 `loadData()` 刷新。

---

### 5. 弹窗容器 (HrScheduleModal.vue)

- 基于 `j-modal`，宽度 70%，`switchFullscreen` 可全屏，`wrapClassName="attendance-rule-modal"` 提供统一的渐变头部样式。
- `edit(record, scheduleMonth)` 透传列表查询年月；`title` 由列表设置为「编辑」或「详情」，详情时 `disableSubmit` 隐藏确定按钮。
- 取消（`cancelText="关闭"`）时先调用表单 `resetForm()` 回滚数据再关闭。
- 组件向上透传 `shiftsChange`（预留扩展，当前列表页未消费）。

---

## 📊 数据结构

### 列表行记录（list 接口返回）

```javascript
{
  id: String,                 // 主键ID
  no: String,                 // 工号（同时作为表格 rowKey 和排班关联键）
  name: String,               // 姓名
  companyId: String,          // 公司ID（companyId_dictText 为文案）
  dept: String,               // 部门ID（dept_dictText 为文案）
  postId: String,             // 岗位ID（postId_dictText 为文案）
  bc: String,                 // 班次类型：'1' 固定班次 / '2' 轮换班次
  hrEmpSchedules: [           // 排班时段数组
    {
      id: String,             // 时段ID（新增时为空，删除追踪依赖它）
      timeType: String,       // 白班 / 中班 / 夜班
      startDate: String,      // 后端返回带时间：YYYY-MM-DD HH:mm:ss
      endDate: String,        // 同上
      month: String           // ⚠️ 仅前端固定班次使用：YYYY-MM，不提交
    }
  ]
}
```

### saveOrUpdateBatch 提交体（时段数组）

```javascript
[
  {
    id: '...',                // 已存在时段带 id；新增时段该字段为 undefined
    timeType: '白班',
    startDate: '2026-09-01 00:00:00',
    endDate: '2026-09-30 23:59:59',
    no: 'A001',               // 员工工号
    bc: '1'                   // 班次类型冗余在每条时段上
  }
]
```

### API 接口

| 接口 | 方法 | 说明 | 调用位置 |
|------|------|------|---------|
| `/hr_emp_schedule/hrEmpSchedule/list?year&month&...` | GET | 按年月查询排班列表 | List（JeecgListMixin） |
| `/hr_emp_schedule/hrEmpSchedule/saveOrUpdateBatch` | POST/PUT | 批量保存时段（无 id 新增 POST，有 id 更新 PUT） | Form |
| `/hr_emp_schedule/hrEmpSchedule/delete?id=` | DELETE | 单条删除（当前 UI 未启用） | mixin 保留 |
| `/hr_emp_schedule_emp/hrEmpScheduleEmp/deleteBatch?ids=a,b` | DELETE | 批量删除选中员工的主表记录（ids 为主表 id 逗号拼接） | List |
| `/hr_emp_schedule/hrEmpSchedule/deleteBatch?ids=a,b` | DELETE | 保存时删除被移除的时段 | Form |
| `/hr_emp_schedule/hrEmpSchedule/exportXls` | GET | 按查询条件导出 Excel | List |
| `/hr_emp_schedule/hrEmpSchedule/exportTemplate?year&month` | GET | 下载指定年月的 .xls 导入模板（Blob） | ImportModal |
| `/hr_emp_schedule/hrEmpSchedule/importExcel` | POST | FormData：file + year + month | ImportModal |
| `/org/hrmOrg/loadTreeRoot?pid=0` | GET | 公司-部门组织树 | List |

> Form 的 `url.queryById` 已声明但当前未使用（编辑数据直接来自列表行）。

---

## 🎨 样式设计

### 颜色体系

```less
// 品牌主色（按钮、表头强调、日历选中态）
渐变：linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%)

// 列表 a-tag 标签
白班: orange (ant 内置)      中班: green (ant 内置)
夜班: purple (ant 内置)      休息: #4c83c9    未排班: #d9d9d9

// 日历软色标签（见上文「班次标签规则与样式」表）

// 页面底色
--attendance-background, #f8fafd
弹窗内容区: #f8fafc
```

### 布局要点

- 列表页：`rule-list-panel` flex 纵向布局，顶部筛选/工具栏固定，表格区 `flex:1` 自适应并内部滚动。
- 弹窗表单：`schedule-form-layout` 左右各 50%（左：基本信息 + 时段；右：日历），`@media (max-width: 900px)` 时改为上下排列，日历改为顶部分割线。
- 时段添加按钮固定 80px 宽纵向排列；已添加时段列表最大高度 200px 内部滚动；空列表显示「暂无排班时段，请点击左侧按钮添加」。

---

## 🔧 技术亮点

### 1. 按年月驱动的动态表格列

`created` 与每次年月切换时调用 `initDynamicColumns(monthStr)`，用当月天数一次性生成列配置 + 日期元信息（dateStr / 星期），单元格插槽统一走 `getShiftLabel` / `getShiftColor`。月份切换、重置、查询三处共用同一入口，避免列与查询条件错位。

### 2. 查询参数适配

`scheduleMonth` 仅服务于 UI（月选择器需要 `YYYY-MM`），重写 mixin 的 `getQueryParams` 在发请求前拆成后端需要的数值型 `year`、`month`，导出 Excel 也复用同一套参数。

### 3. 编辑副本 + 删除暂存的取消回滚

深拷贝 record 隔离列表数据；已保存时段的删除先记 id 不落库，保存时随批次一并提交，取消时备份还原并清空删除队列。解决了「取消后时段丢失 / 下次保存误删」的问题。

### 4. 日历按查询年月定位

`scheduleMonth` prop + `setMonth` 命令式方法 + `watch` 双通道：弹窗初次打开用 `$nextTick + setMonth` 定位，组件复用未重建时由 watch 同步；`parseMonth` 带合法性校验和当前月回退。

### 5. 提交日期补齐时分秒

`startDate 00:00:00` / `endDate 23:59:59` 保证按日期区间比较时，最后一天不会因为时间为 `00:00:00` 而整天漏判；前端比较时则统一 `split(' ')[0]` 去掉时间部分。

### 6. 手动受控的文件上传

`beforeUpload` 返回 `false` 拦截自动上传，配合单文件限制与年月校验，保证「先选年月 → 下载对应模板 → 填好后上传」的顺序，错误明细通过 `code === 201` 分支引导下载。

---

## 🐛 常见问题

### 1. 日期选择器弹出层被遮挡

**原因**：日期面板默认挂载到 `body`，弹窗内滚动容器会造成定位/遮挡问题。

**解决方案**：表单中统一通过 `:getCalendarContainer` 指定挂载到触发节点的上级容器：

```javascript
getCalendarContainer(node) {
  return node.parentNode.parentNode.parentNode.parentNode
}
```

> 层级经过实测调整（4 层 parentNode）；如模板结构调整导致定位错误，优先检查这里。

### 2. 日期带时分秒导致区间判断失效

**现象**：月末最后一天不显示班次。

**原因**：后端返回 `YYYY-MM-DD HH:mm:ss`，字符串直接比较可能出错；提交时若结束日期不带 `23:59:59`，后端按时间区间判断也会漏掉最后一天。

**解决**：前端比较前 `split(' ')[0]` 截成纯日期；提交时补齐 `00:00:00` / `23:59:59`。

### 3. 取消后再打开，已删除的时段没有恢复

**原因**：直接在列表行对象的 `hrEmpSchedules` 上 splice，或删除立即调接口。

**解决**：`edit()` 深拷贝 record + `modelBackup` 备份；删除只暂存 id；`resetForm()` 备份还原并清空 `deleteBatch`（见「时段防丢失机制」）。

### 4. 字段名 / 主关联键问题

```javascript
// ❌ 易写错的字段
shift.type / shift.start / shift.end
// ✅ 实际字段
shift.timeType / shift.startDate / shift.endDate

// 注意：员工关联键是工号 no（列表 rowKey 也是 no），不是 id；
// month 是前端固定班次专用字段，不要提交给后端。
```

### 5. 动态列与所选年月不一致

**排查**：任何改变 `scheduleMonth` 的入口（月选择器 change、重置、初始化）都必须调用 `initDynamicColumns`；新增查询入口时不要只调 `searchQuery()`。

---

## 📝 开发规范

### 命名约定

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| 组件名 | PascalCase | `HrScheduleForm` |
| 方法名 | camelCase | `getShiftColor` |
| 事件名 | kebab-case | `@shifts-change` |
| CSS 类 | kebab-case，页面前缀 `rule-` / `schedule-` | `.shift-row`、`.rule-filter-bar` |

### Git 提交规范

```
feat: 新增排班导入弹窗及按月模板下载
fix: 修复排班时段取消后丢失问题，并支持日历按查询年月定位
style: 优化禁用状态样式
refactor: 动态列由未来7天调整为整月
docs: 更新技术指南文档
```

---

## 🚀 后续优化建议

### 1. 技术债清理
- `next7Days` / `day0` 插槽命名改为与「整月」语义一致（如 `monthDays` / `dayCell`）。
- Form 中未使用的 `url.queryById`、`empNo/empName/company/position` 等 model 旧字段清理。
- 移除 `console.log` 调试输出（`getCalendarContainer`、`removeShift`）。
- 时段「不可重叠」目前仅有提示文案，建议在前端增加实际的重叠校验。

### 2. 批量排班
- 支持选择多个员工批量配置排班；按部门/岗位批量应用排班模板。

### 3. 排班模板
- 常用班次组合模板（早班、晚班、轮班）一键套用。

### 4. 冲突检测与合规
- 时段重叠、跨天班次校验；连续工作天数等劳动法规提示。

### 5. 数据可视化
- 排班统计图表，按部门/岗位展示班次分布与人力覆盖。

---

## 📚 相关文档

- [Ant Design Vue 文档](https://www.antdv.com/)
- [JeecgBoot 开发文档](http://doc.jeecg.com/)

---

## 👥 维护者

- 开发团队：ZTKJ 前端组
- 最后更新：2026-09-16
- 版本：v1.1.0
