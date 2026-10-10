# 员工考勤模块

> 员工考勤记录与统计

## 概述

员工考勤模块负责管理员工的日常考勤记录，包括打卡记录查询、考勤统计、异常处理等功能。

## 子模块

| 目录 | 功能 |
|------|------|
| `list/` | 考勤记录列表 |
| `yc/` | 异常考勤处理 |
| `modules/` | 子组件 |

## 核心功能

- 考勤记录查询
- 考勤数据统计
- 异常考勤处理
- 考勤报表导出

## 业务流程

```mermaid
flowchart LR
    A[员工打卡] --> B[考勤记录]
    B --> C{是否异常}
    C -->|正常| D[计入统计]
    C -->|异常| E[异常处理]
    E --> F[审批处理]
    F --> D
```

## 相关接口

- `/attendance/list` - 考勤记录列表
- `/attendance/statistics` - 考勤统计
- `/attendance/abnormal` - 异常考勤

## 相关模块

- [考勤规则](../attendanceRule/README.md)
- [打卡管理](../clockInManagement/README.md)
- [异常考勤](../abnormal-attendance/README.md)
