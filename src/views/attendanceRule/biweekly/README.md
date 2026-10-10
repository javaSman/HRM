# 大小周规则配置模块

## 模块概述

本模块用于管理公司大小周考勤规则配置，支持按年月设置大小周规则参数，包括周六出勤天数、节假日调休等配置。

## 文件结构

```
biweekly/
├── HrSizeZhouRuleList.vue    # 大小周规则列表主页面
├── modules/
│   └── HrSizeZhouRuleModal.vue  # 大小周规则编辑弹窗
└── README.md                  # 本文档
```

## 核心功能

### 1. 规则列表管理
- **列表展示**：展示所有大小周规则配置记录
- **搜索筛选**：支持按年月、公司等条件筛选
- **数据导出**：支持导出规则配置数据为 Excel

### 2. 规则配置
- **新增规则**：添加新的年月大小周规则配置
- **编辑规则**：修改现有规则配置参数
- **删除规则**：删除不需要的规则配置
- **批量导入**：支持 Excel 批量导入规则数据

### 3. 关键配置字段

| 字段名 | 说明 | 备注 |
|--------|------|------|
| 适用年月 | 规则生效的年月 | 格式：YYYY-MM |
| 当月周六总数 | 当月共有多少个周六 | 系统自动计算 |
| 节假日周六数 | 节假日中包含的周六数 | 需手动配置 |
| 补班数 | 需要补班的天数 | 调休补班统计 |
| 基准小周数 | 基准小周数量 | 用于计算大小周 |
| 月应出勤天数 | 当月应出勤总天数 | 根据规则自动计算 |

## 使用方法

### 新增规则配置
1. 点击列表上方「新增」按钮
2. 在弹窗中填写规则配置信息
3. 选择适用年月
4. 配置各项参数（周六总数、节假日数等）
5. 点击「确定」保存

### 编辑规则
1. 在列表中找到目标记录
2. 点击操作列的「编辑」按钮
3. 在弹窗中修改配置参数
4. 点击「确定」保存修改

### 导入规则数据
1. 点击「导入」按钮
2. 下载导入模板
3. 按模板格式填写数据
4. 上传填好的 Excel 文件

## 数据表设计

**表名**：`hr_size_zhou_rule`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | varchar | 主键ID |
| ssny | varchar | 适用年月 |
| company_id | varchar | 公司ID |
| saturday_count | int | 当月周六总数 |
| holiday_saturday | int | 节假日周六数 |
| makeup_work_days | int | 补班数 |
| base_small_week | int | 基准小周数 |
| monthly_work_days | int | 月应出勤天数 |
| create_by | varchar | 创建人 |
| create_time | datetime | 创建时间 |
| update_by | varchar | 更新人 |
| update_time | datetime | 更新时间 |

## 接口清单

| 接口路径 | 方法 | 说明 |
|----------|------|------|
| `/hr/hrSizeZhouRule/list` | GET | 获取规则列表 |
| `/hr/hrSizeZhouRule/add` | POST | 新增规则 |
| `/hr/hrSizeZhouRule/edit` | PUT | 编辑规则 |
| `/hr/hrSizeZhouRule/delete` | DELETE | 删除规则 |
| `/hr/hrSizeZhouRule/exportXls` | GET | 导出Excel |
| `/hr/hrSizeZhouRule/importExcel` | POST | 导入Excel |

## 样式说明

模块使用统一的样式类名规范：

- `.rule-list-panel` - 列表页面容器
- `.rule-toolbar` - 工具栏区域
- `.rule-table-wrap` - 表格容器
- `.rule-btn-primary` - 主要按钮样式
- `.rule-btn-reset` - 重置按钮样式

## 注意事项

1. **年月唯一性**：每个年月只能有一条规则配置
2. **数据完整性**：删除前请确认该规则未被考勤数据引用
3. **自动计算**：周六总数由系统根据年月自动计算，节假日数需手动配置
4. **权限控制**：新增、编辑、删除操作需要相应权限

## 相关模块

- **schedule** - 排班管理模块
- **calendar** - 考勤日历模块
- **settingPage** - 考勤规则设置
