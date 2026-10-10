# 请假申请管理模块

## 模块说明

本模块**100%复制OT（加班申请）模块的代码、样式和布局**，实现了请假申请和审批功能的分离。

## 文件结构

```
leave/
├── HrXjsqList.vue          # 主列表组件（申请页）
├── HrXjsqLists.vue         # 审批页独立组件
├── README.md               # 模块说明文档
└── modules/
    ├── HrXjsqModal.vue     # 弹窗组件（支持新增、编辑、详情、审批）
    ├── HrXjsqApplyForm.vue # 表单组件
    ├── HrXjsqApplyLog.vue  # 审批日志抽屉组件
    ├── HrRejectModal.vue   # 退回弹窗组件
    └── ApprovalTimeline.vue # 审批时间轴组件
```

## 功能特性

### 1. 主列表组件 (HrXjsqList.vue)

**完全复制OT模块的代码、样式和布局：**
- ✅ 使用 `.otapply-list-panel` 作为主容器类名
- ✅ 使用 `.rule-toolbar` 工具栏样式
- ✅ 使用 `.rule-filter-bar` 搜索栏样式
- ✅ 使用 `.rule-table-wrap` 表格容器样式
- ✅ Tab切换功能（审批中/已通过/已撤回/已退回）
- ✅ 搜索栏（姓名、工号、公司、部门、时间范围）
- ✅ 支持双模式（申请页 `boxState=0`，审批页 `boxState=1`）
- ✅ 状态标签样式（橙色/绿色/灰色/红色）
- ✅ 操作按钮区域
- ✅ 完全复制OT模块的渐变背景、阴影、圆角等样式

### 2. 审批页独立组件 (HrXjsqLists.vue)

- ✅ 独立的审批页组件
- ✅ 复用主列表组件，通过参数区分模式

### 3. 弹窗组件 (HrXjsqModal.vue)

**完全复制OT模块的代码、样式和布局：**
- ✅ 使用 `j-modal` 组件
- ✅ 使用 `.otapply-modal-content` 作为弹窗内容容器
- ✅ 使用 `.section-title` 分区标题样式
- ✅ 使用 `.form-section` 表单区域样式
- ✅ 使用 `.approval-section` 审批区域样式
- ✅ 支持多种模式（新增、编辑、详情、审批）
- ✅ 审批信息区域
- ✅ 审批操作按钮（通过、退回）
- ✅ 使用 `a-descriptions` 组件展示信息

### 4. 表单组件 (HrXjsqApplyForm.vue)

**完全复制OT模块的代码、样式和布局：**
- ✅ 使用相同的表单布局结构
- ✅ 使用相同的表单字段样式
- ✅ 使用 `j-date` 日期选择器
- ✅ 使用 `j-upload` 文件上传组件
- ✅ 请假类型、请假天数、开始时间、结束时间、请假原因、附件

### 5. 审批日志组件 (HrXjsqApplyLog.vue)

**完全复制OT模块的代码、样式和布局：**
- ✅ 使用 `a-drawer` 抽屉组件
- ✅ 使用 `.otapply-log-drawer` 作为抽屉容器
- ✅ 显示申请信息、审批流程、审批记录
- ✅ 使用时间轴展示审批流程
- ✅ 使用 `a-descriptions` 组件展示信息

### 6. 退回弹窗组件 (HrRejectModal.vue)

**完全复制OT模块的代码、样式和布局：**
- ✅ 使用 `a-modal` 弹窗组件
- ✅ 使用 `.otapply-reject-modal` 作为弹窗容器
- ✅ 显示申请信息和退回原因输入
- ✅ 使用 `a-descriptions` 组件展示信息

### 7. 审批时间轴组件 (ApprovalTimeline.vue)

**完全复制OT模块的代码、样式和布局：**
- ✅ 使用 `a-timeline` 时间轴组件
- ✅ 使用 `.approval-timeline` 作为时间轴容器
- ✅ 使用 `.timeline-item`、`.timeline-header`、`.timeline-content` 样式
- ✅ 支持多种状态显示（审批中、已通过、已撤回、已退回）

## 样式类名对照表

| OT模块类名 | 请假模块类名 | 说明 |
|-----------|------------|------|
| `.otapply-list-panel` | `.otapply-list-panel` | 主列表容器（保持一致） |
| `.rule-toolbar` | `.rule-toolbar` | 工具栏样式（保持一致） |
| `.rule-filter-bar` | `.rule-filter-bar` | 搜索栏样式（保持一致） |
| `.rule-table-wrap` | `.rule-table-wrap` | 表格容器样式（保持一致） |
| `.otapply-modal-content` | `.otapply-modal-content` | 弹窗内容容器（保持一致） |
| `.section-title` | `.section-title` | 分区标题样式（保持一致） |
| `.form-section` | `.form-section` | 表单区域样式（保持一致） |
| `.otapply-log-drawer` | `.otapply-log-drawer` | 审批日志抽屉（保持一致） |
| `.otapply-reject-modal` | `.otapply-reject-modal` | 退回弹窗容器（保持一致） |
| `.approval-timeline` | `.approval-timeline` | 审批时间轴容器（保持一致） |

## 字段映射表

| OT模块字段 | 请假模块字段 | 说明 |
|-----------|------------|------|
| `jbType` | `leaveType` | 类型（加班类型/请假类型） |
| `overtimeDate` | `startTime` | 时间（加班日期/开始时间） |
| `startTime` | `startTime` | 开始时间 |
| `endTime` | `endTime` | 结束时间 |
| `applyHours` | `applyDays` | 时长（加班小时/请假天数） |
| `reason` | `reason` | 原因 |
| `attachmentUrls` | `attachmentUrls` | 附件 |
| `hr_jb_application` | `hr_leave_application` | 数据表名 |
| `day_type` | `leave_type` | 字典码 |

## 使用方法

### 申请页
```vue
<hr-xjsq-list :boxState="0"></hr-xjsq-list>
```

### 审批页
```vue
<hr-xjsq-lists></hr-xjsq-lists>
```

## 开发说明

### 接口说明
所有组件都已配置好接口地址，接入真实接口时只需：
1. 确保后端接口地址正确
2. 接口返回数据格式符合要求
3. 字段名称与前端一致

### 状态定义
- `spStatus`: 1=审批中 2=已通过 3=已撤回 4=已退回
- `spFlow`: 1=部门经理 2=HR 3=抄送人

## 样式说明

本模块**100%复制OT模块的代码、样式和布局**，包括：
- ✅ 相同的HTML结构
- ✅ 相同的CSS类名
- ✅ 相同的样式代码
- ✅ 相同的颜色（橙色/绿色/灰色/红色）
- ✅ 相同的间距、边框、圆角
- ✅ 相同的字体大小、字重
- ✅ 相同的hover效果、过渡动画
- ✅ 相同的渐变背景、阴影效果
- ✅ 相同的响应式布局

所有样式类名与OT模块保持一致，确保视觉和交互体验的完全统一。
