# 考勤报表模块

## 模块概述

本模块用于统计和展示员工考勤数据，提供考勤汇总、员工考勤统计记录等功能，支持数据导出和高级查询。

## 文件结构

```
TaReport/
├── HrAttendanceSummaryList.vue         # 考勤汇总列表
├── HrEmployeeAttendanceStatRecordList.vue  # 员工考勤统计记录列表
├── modules/
│   ├── HrAttendanceModal.vue              # 出勤记录弹窗
│   ├── HrLeaveBalanceModal.vue            # 假期余额弹窗
│   ├── HrKqRuleDetailModal.vue            # 规则详情弹窗
│   ├── HrEmployeeAttendanceStatRecordModal.vue  # 员工考勤统计记录弹窗
│   └── ... (其他辅助组件)
├── 考勤汇总.html                         # 考勤汇总静态页面
└── README.md                             # 本文档
```

## 核心功能

### 1. 考勤汇总列表 (HrAttendanceSummaryList.vue)

#### 主要功能
- **薪资类型筛选**：按薪资类型（月薪/日薪等）筛选员工
- **多条件搜索**：支持按姓名、工号、公司、部门、所属年月搜索
- **数据展示**：展示员工考勤统计数据
- **出勤记录查看**：查看员工的详细出勤记录
- **假期余额查看**：查看员工的假期余额
- **规则详情查看**：查看员工适用的考勤规则
- **数据导出**：导出考勤汇总数据为 Excel

#### 统计字段

| 字段名 | 说明 | 备注 |
|--------|------|------|
| 姓名 | 员工姓名 | - |
| 工号 | 员工工号 | - |
| 公司 | 员工所属公司 | 标签显示 |
| 部门 | 员工所属部门 | - |
| 岗位 | 员工岗位 | 可点击查看详情 |
| 薪资类型 | 月薪/日薪等 | 标签显示 |
| 所属年月 | 统计的年月 | - |
| 出勤总天数 | 当月出勤总天数 | 颜色标识（≥25天绿色，<25天红色） |
| 出勤总时长 | 当月出勤总时长 | 颜色标识（≥200小时绿色，<200小时红色） |
| 迟到天数 | 迟到的天数 | 颜色标识（>0红色，=0绿色） |
| 早退天数 | 早退的天数 | 颜色标识（>0红色，=0绿色） |
| 是否全勤 | 是否全勤 | 标签显示（是/否） |

#### 操作功能
- **出勤记录**：打开出勤记录弹窗，查看员工当月的详细打卡记录
- **假期余额**：打开假期余额弹窗，查看员工的假期余额情况
- **规则详情**：打开规则详情弹窗，查看员工适用的考勤规则

### 2. 员工考勤统计记录列表 (HrEmployeeAttendanceStatRecordList.vue)

#### 主要功能
- **记录列表**：查看所有员工考勤统计记录
- **数据编辑**：编辑考勤统计记录
- **详情查看**：查看记录详细信息
- **批量删除**：批量删除记录
- **数据导出**：导出记录数据为 Excel
- **数据导入**：导入 Excel 数据

#### 记录字段

| 字段名 | 说明 | 备注 |
|--------|------|------|
| 公司 | 员工所属公司 | - |
| 部门 | 员工所属部门 | - |
| 工号 | 员工工号 | - |
| 姓名 | 员工姓名 | - |
| ... | 其他考勤统计字段 | - |

## 使用方法

### 查看考勤汇总
1. 进入考勤汇总页面
2. 选择薪资类型标签（可选）
3. 设置搜索条件（姓名、工号、公司、部门、年月）
4. 点击「查询」按钮
5. 查看考勤汇总列表
6. 可点击「出勤记录」查看详细打卡记录
7. 可点击「假期余额」查看假期余额
8. 可点击「规则详情」查看考勤规则

### 导出考勤数据
1. 设置筛选条件
2. 点击「导出」按钮
3. 选择导出格式（Excel）
4. 下载导出文件

### 编辑考勤统计记录
1. 进入员工考勤统计记录页面
2. 找到目标记录
3. 点击「编辑」按钮
4. 在弹窗中修改数据
5. 点击「确定」保存

### 导入考勤数据
1. 点击「导入」按钮
2. 下载导入模板
3. 按模板格式填写数据
4. 上传填好的 Excel 文件

## 数据表设计

### 考勤汇总视图 (hr_attendance_summary)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | varchar | 主键ID |
| user_id | varchar | 员工ID |
| name | varchar | 姓名 |
| no | varchar | 工号 |
| company_id | varchar | 公司ID |
| dept_id | varchar | 部门ID |
| post_id | varchar | 岗位ID |
| salary_type | varchar | 薪资类型 |
| ssny | varchar | 所属年月 |
| total_days | int | 出勤总天数 |
| total_hours | decimal | 出勤总时长 |
| late_days | int | 迟到天数 |
| early_days | int | 早退天数 |
| is_full_attendance | varchar | 是否全勤 |

### 员工考勤统计记录表 (hr_employee_attendance_stat_record)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | varchar | 主键ID |
| company_id | varchar | 公司ID |
| dept_id | varchar | 部门ID |
| no | varchar | 工号 |
| name | varchar | 姓名 |
| ... | ... | 其他统计字段 |
| create_time | datetime | 创建时间 |
| update_time | datetime | 更新时间 |

## 接口清单

### 考勤汇总接口

| 接口路径 | 方法 | 说明 |
|----------|------|------|
| `/hr/hrAttendanceSummary/list` | GET | 获取考勤汇总列表 |
| `/hr/hrAttendanceSummary/exportXls` | GET | 导出考勤汇总数据 |
| `/hr/hrAttendanceSummary/attendanceRecord` | GET | 获取出勤记录 |
| `/hr/hrAttendanceSummary/leaveBalance` | GET | 获取假期余额 |
| `/hr/hrAttendanceSummary/ruleDetail` | GET | 获取规则详情 |

### 员工考勤统计记录接口

| 接口路径 | 方法 | 说明 |
|----------|------|------|
| `/hr/hrEmployeeAttendanceStatRecord/list` | GET | 获取统计记录列表 |
| `/hr/hrEmployeeAttendanceStatRecord/add` | POST | 新增统计记录 |
| `/hr/hrEmployeeAttendanceStatRecord/edit` | PUT | 编辑统计记录 |
| `/hr/hrEmployeeAttendanceStatRecord/delete` | DELETE | 删除统计记录 |
| `/hr/hrEmployeeAttendanceStatRecord/exportXls` | GET | 导出统计记录 |
| `/hr/hrEmployeeAttendanceStatRecord/importExcel` | POST | 导入统计记录 |

## 样式说明

模块使用统一的样式类名规范：

- `.summary-list-panel` - 汇总列表页面容器
- `.rule-list-panel` - 列表页面容器
- `.search-bar` - 搜索栏区域
- `.rule-toolbar` - 工具栏区域
- `.rule-table-wrap` - 表格容器
- `.btn-search` - 搜索按钮样式
- `.btn-reset` - 重置按钮样式

### 颜色标识说明

- **绿色标签**：表示正常或优秀的数据（如出勤天数≥25天、全勤等）
- **红色标签**：表示异常或需要关注的数据（如迟到天数>0、出勤天数<25天等）
- **橙色标签**：表示中等状态（如未全勤）
- **蓝色标签**：表示普通信息（如公司名称）

## 注意事项

1. **数据准确性**：考勤统计数据来源于打卡记录、补卡申请、请假申请等，需确保源数据准确
2. **统计周期**：统计数据按月统计，每月初需重新生成上月统计
3. **权限控制**：查看考勤数据需要相应权限，员工只能查看自己的数据
4. **数据同步**：考勤数据会实时同步到薪资计算模块
5. **历史数据**：历史考勤数据不可修改，如有错误需通过补卡申请等方式修正

## 相关模块

- **card** - 补卡申请模块（数据来源之一）
- **leave** - 请假申请模块（数据来源之一）
- **ot** - 加班申请模块（数据来源之一）
- **schedule** - 排班管理模块（提供排班数据）
- **calendar** - 考勤日历模块（提供日历数据）
