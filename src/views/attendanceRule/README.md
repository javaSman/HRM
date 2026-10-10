# 考勤规则模块

## 模块概述

本模块是人力资源管理系统（HRM）中的考勤规则管理核心模块，提供完整的考勤规则配置、申请审批、数据统计等功能。模块采用微前端架构设计，各子模块独立运作，数据互联互通。

## 模块结构

```
attendanceRule/
├── biweekly/          # 大小周规则配置
├── calendar/          # 考勤日历管理
├── card/              # 补卡申请管理
├── leave/             # 请假申请管理
├── mobile/            # 移动打卡管理
├── ot/                # 加班申请管理
├── PCR/               # 补卡规则配置
├── schedule/          # 排班管理
├── settingPage/       # 考勤规则设置
├── TaReport/          # 考勤报表统计
└── README.md          # 本文档
```

## 子模块说明

### 1. biweekly - 大小周规则配置
**功能**：管理公司大小周考勤规则配置，设置周六出勤天数、节假日调休等参数。

**核心功能**：
- 规则列表管理（新增、编辑、删除）
- 数据导出和导入
- 大小周参数配置（周六总数、节假日数、补班数等）

**文档**：[README.md](./biweekly/README.md)

---

### 2. calendar - 考勤日历管理
**功能**：管理公司考勤日历，设置工作日、节假日、调休日等。

**核心功能**：
- 日历视图展示
- 工作日/节假日设置
- 调休日配置
- 日历数据导入导出

**文档**：[README.md](./calendar/README.md)

---

### 3. card - 补卡申请管理
**功能**：管理员工补卡申请，支持申请人端和审批人端双模式。

**核心功能**：
- 补卡申请提交
- 补卡申请审批
- 申请记录查询
- 补卡规则校验（依赖 PCR 模块）

**文档**：[补卡管理.md](./card/补卡管理.md)

---

### 4. leave - 请假申请管理
**功能**：管理员工请假申请，支持多种请假类型和审批流程。

**核心功能**：
- 请假申请提交
- 请假申请审批
- 假期余额管理
- 请假记录查询

**文档**：[README.md](./leave/README.md)

---

### 5. mobile - 移动打卡管理
**功能**：管理员工移动打卡申请和打卡记录，支持移动端打卡。

**核心功能**：
- 移动打卡申请（申请人端）
- 移动打卡审批（审批人端）
- 打卡记录查询
- 打卡照片预览
- GPS定位记录

**文档**：[README.md](./mobile/README.md)

---

### 6. ot - 加班申请管理
**功能**：管理员工加班申请，支持加班时长统计和调休转换。

**核心功能**：
- 加班申请提交
- 加班申请审批
- 加班时长统计
- 调休转换
- 加班记录查询

**文档**：[README.md](./ot/README.md)

---

### 7. PCR - 补卡规则配置
**功能**：配置补卡申请规则，设置每月最大补卡次数、申请时限等。

**核心功能**：
- 补卡规则配置
- 每月最大补卡次数设置
- 补卡申请时限设置
- 规则启用/禁用

**文档**：[README.md](./PCR/README.md)

**依赖关系**：card 模块依赖本模块的规则配置

---

### 8. schedule - 排班管理
**功能**：管理员工排班计划，支持多种排班模式和班次设置。

**核心功能**：
- 排班计划制定
- 班次设置
- 排班表查询
- 排班调整
- 排班数据导入导出

**文档**：[README.md](./schedule/README.md)

---

### 9. settingPage - 考勤规则设置
**功能**：统一配置考勤规则，包括打卡规则、迟到早退规则、加班规则等。

**核心功能**：
- 考勤规则配置
- 打卡时间设置
- 迟到早退规则
- 加班规则
- 规则优先级管理

**文档**：[考勤规则.md](./settingPage/考勤规则.md)

---

### 10. TaReport - 考勤报表统计
**功能**：统计和展示员工考勤数据，提供考勤汇总、统计记录等功能。

**核心功能**：
- 考勤汇总列表
- 员工考勤统计记录
- 出勤记录查看
- 假期余额查看
- 数据导出和导入

**文档**：[README.md](./TaReport/README.md)

---

## 模块依赖关系

```
settingPage (考勤规则设置)
    ↓
schedule (排班管理) → calendar (考勤日历)
    ↓
biweekly (大小周规则) + PCR (补卡规则)
    ↓
┌─────────┬─────────┬─────────┐
│         │         │         │
card    leave     ot      mobile
(补卡)  (请假)   (加班)   (移动打卡)
│         │         │         │
└─────────┴─────────┴─────────┘
    ↓
TaReport (考勤报表统计)
```

**依赖说明**：
1. **settingPage**：提供基础考勤规则配置，其他模块依赖其规则
2. **schedule** 和 **calendar**：提供排班和日历数据，为考勤统计提供基准
3. **biweekly** 和 **PCR**：提供规则限制，为申请模块提供校验依据
4. **card、leave、ot、mobile**：申请审批模块，产生考勤数据
5. **TaReport**：汇总所有考勤数据，生成统计报表

## 技术架构

### 前端技术栈
- **框架**：Vue.js 2.x
- **UI组件库**：Ant Design Vue
- **状态管理**：Vuex
- **路由**：Vue Router
- **HTTP库**：Axios
- **工具库**：Lodash、Moment.js

### 代码规范
- **命名规范**：组件名使用 PascalCase，文件名使用 camelCase
- **样式规范**：统一使用 `.rule-*` 类名前缀
- **接口规范**：RESTful API，统一响应格式
- **文档规范**：每个模块必须包含 README.md

### 公共组件
- `JeecgListMixin`：列表页面混入，提供分页、搜索、导出等通用功能
- `mixinDevice`：设备检测混入，提供响应式布局支持
- `JSuperQuery`：高级查询组件
- `JDate`：日期选择组件

## 数据流转

### 1. 申请审批流程
```
员工提交申请
    ↓
系统校验规则（PCR、settingPage）
    ↓
进入待审批状态
    ↓
审批人审核
    ↓
审批结果通知
    ↓
数据同步到考勤统计（TaReport）
```

### 2. 考勤统计流程
```
打卡记录 + 补卡申请 + 请假申请 + 加班申请
    ↓
数据清洗和整合
    ↓
按月统计（出勤天数、时长、迟到早退等）
    ↓
生成考勤汇总（TaReport）
    ↓
同步到薪资计算模块
```

## 权限控制

### 角色类型
1. **普通员工**：查看自己的考勤数据，提交申请
2. **部门主管**：审批本部门员工的申请
3. **HR管理员**：配置考勤规则，查看所有考勤数据
4. **系统管理员**：系统配置，权限管理

### 权限点
- `attendance:view`：查看考勤数据
- `attendance:apply`：提交考勤申请
- `attendance:approve`：审批考勤申请
- `attendance:config`：配置考勤规则
- `attendance:export`：导出考勤数据

## 开发指南

### 新增模块步骤
1. 在 `attendanceRule/` 下创建模块目录
2. 创建主页面组件（如 `HrXxxList.vue`）
3. 创建编辑弹窗组件（`modules/HrXxxModal.vue`）
4. 编写模块 README.md 文档
5. 在主 README.md 中添加模块说明
6. 配置路由和菜单

### 代码模板
```vue
<template>
  <div class="rule-list-panel">
    <!-- 筛选区域 -->
    <div class="rule-filter-bar">
      <!-- 搜索条件 -->
    </div>

    <!-- 操作按钮区域 -->
    <div class="rule-toolbar">
      <div class="rule-toolbar-left">
        <a-button type="primary" class="rule-btn-primary" icon="plus" @click="handleAdd">新增</a-button>
        <a-button type="primary" class="rule-btn-primary" icon="download" @click="handleExportXls('文件名')">导出</a-button>
      </div>
    </div>

    <!-- table区域 -->
    <div class="rule-table-wrap">
      <a-table ref="table" ... >
        <!-- 表格内容 -->
      </a-table>
    </div>

    <!-- 弹窗组件 -->
    <xxx-modal ref="modalForm" @ok="modalFormOk"></xxx-modal>
  </div>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import XxxModal from './modules/XxxModal'

export default {
  name: 'XxxList',
  mixins: [JeecgListMixin],
  components: { XxxModal },
  data() {
    return {
      description: '模块说明',
      columns: [...],
      url: {
        list: '/xxx/list',
        delete: '/xxx/delete',
        exportXlsUrl: '/xxx/exportXls'
      }
    }
  }
}
</script>
```

### 样式规范
```css
/* 容器样式 */
.rule-list-panel { ... }
.rule-filter-bar { ... }
.rule-toolbar { ... }
.rule-table-wrap { ... }

/* 按钮样式 */
.rule-btn-primary { ... }
.rule-btn-reset { ... }

/* 表格样式 */
.j-table-force-nowrap { ... }
```

## 常见问题

### 1. 补卡申请提交失败
**原因**：超过每月最大补卡次数或超过申请时限
**解决**：检查 PCR 模块的补卡规则配置

### 2. 考勤统计数据不准确
**原因**：打卡记录、补卡申请、请假申请等源数据有误
**解决**：检查各申请模块的数据，必要时修正后重新统计

### 3. 排班数据未生效
**原因**：排班计划未发布或生效日期未到
**解决**：检查排班计划的状态和生效日期

### 4. 移动打卡无法定位
**原因**：移动端未获取GPS权限
**解决**：在移动设备设置中开启定位权限

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 包含所有基础模块

### v1.1.0 (2024-03-01)
- 新增移动打卡模块
- 优化考勤报表统计功能

### v1.2.0 (2024-05-01)
- 新增大小周规则配置
- 完善模块文档

## 维护人员

- **模块负责人**：HRM开发团队
- **文档维护**：技术文档组
- **联系方式**：hrm-support@company.com

## 相关链接

- [项目主页](../../README.md)
- [API文档](../../../api/README.md)
- [开发规范](../../../docs/development-guide.md)
