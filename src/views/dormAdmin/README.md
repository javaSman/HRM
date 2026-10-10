# 宿舍管理模块 (DormAdmin)

## 📋 模块概述

宿舍管理模块提供了完整的宿舍资源管理解决方案，包括宿舍分配、调宿、退宿、看板可视化、门禁管理、人员管理等功能。该模块采用现代化的 UI 设计，支持移动端适配，提供完善的审批流程和实时数据统计。

## 📁 文件结构

```
dormAdmin/
├── DormAllotList.vue          # 宿舍分配列表（入住/调宿/退宿申请）
├── DormBoardList.vue          # 宿舍看板（可视化数据展示）
├── DormGuardList.vue          # 宿舍门禁管理
├── DormInpsectList.vue        # 宿舍检查（审核/特办）
├── DormMateList.vue           # 宿舍室友管理
├── DormitoryList.vue          # 宿舍楼栋管理
├── modules/                   # 子组件目录
│   ├── DormAllotApplyModal.vue          # 宿舍分配申请弹窗
│   ├── DormAllotDetailModal.vue         # 宿舍分配详情弹窗
│   ├── DormHandleCheckinModal.vue       # 入住处理弹窗
│   ├── DormHandleChangeRoomModal.vue    # 调宿处理弹窗
│   ├── DormHandleCheckoutModal.vue      # 退宿处理弹窗
│   ├── DormitoryFormModal.vue           # 宿舍楼栋表单弹窗
│   ├── DormitoryRoomDetailModal.vue     # 宿舍房间详情弹窗
│   ├── DormGuardModal.vue               # 门禁权限弹窗
│   ├── DormGuardDetailModal.vue         # 门禁详情弹窗
│   ├── DormAuditModal.vue               # 审核弹窗
│   ├── DormResidentCheckoutModal.vue    # 客房退宿弹窗
│   ├── PersonDetailModal.vue            # 人员详情弹窗
│   └── ApprovalCcFields.vue             # 审批抄送字段组件
└── README.md                   # 本文档
```

## 🎯 功能模块

### 1. 宿舍分配管理 (DormAllotList)

**路径**: `DormAllotList.vue`

**功能描述**:
- 管理入住、调宿、退宿三类申请
- 支持申请审批流程
- 提供状态筛选和搜索功能

**主要特性**:
- 📑 **Tab 切换**: 入住申请 / 调宿申请 / 退宿申请
- 🔍 **智能筛选**: 支持姓名、工号、部门、宿舍等多维度搜索
- 📊 **状态统计**: 实时显示各状态的申请数量
- ✅ **审批流程**: 支持多级审批和抄送功能
- 📝 **详情查看**: 查看申请详情和审批进度

**申请类型说明**:
- **入住申请** (`applyType = '0'`):
  - 字段：区域、楼栋、宿舍、宿舍类型、领取物品、入住人信息、入住原因等
  - 支持配偶宿舍类型
  - 审批流程：提交申请 → 审批人审批 → 抄送通知

- **调宿申请** (`applyType = '1'`):
  - 字段：原宿舍、调宿后宿舍、调宿原因等
  - 支持宿舍变更记录

- **退宿申请** (`applyType = '2'`):
  - 字段：宿舍信息、退宿原因、卫生照片等
  - 支持卫生照片上传和预览

**核心代码示例**:
```vue
<!-- 状态切换 -->
<div class="sqgl-status-pills">
  <div v-for="p in statusPills" :key="p.key"
       :class="['sqgl-status-pill', activeStatus === p.key ? 'active' : '']"
       @click="onStatusChange(p.key)">
    {{ p.label }}
    <span class="sqgl-pill-count">{{ statusCount[p.key] || 0 }}</span>
  </div>
</div>
```

### 2. 宿舍看板 (DormBoardList)

**路径**: `DormBoardList.vue`

**功能描述**:
- 可视化展示宿舍资源使用情况
- 楼栋楼层实时状态
- 房间床位分布详情

**主要特性**:
- 📈 **统计看板**: 总区域数、总房间数、总床位数、已入住、空床位
- 🏢 **区域切换**: 快速切换不同宿舍区域
- 🏠 **楼栋概览**: 展示楼栋楼层状态（有空房/已满）
- 🚪 **房间详情**: 点击楼层查看房间分布
- 👥 **入住人员**: 查看房间入住人员详情

**视图模式**:
1. **概览模式**: 楼栋卡片式展示
2. **楼层模式**: 楼层平面图展示
3. **房间模式**: 房间详情展示

**颜色标识**:
- 🟢 **绿色**: 该楼层有空房
- 🔴 **红色**: 该楼层已满

**核心代码示例**:
```vue
<!-- 楼栋卡片 -->
<div class="sqgl-building-card">
  <div class="building-head">
    <a-icon type="home" />
    <span class="building-name">{{ building.name }}</span>
  </div>
  <div class="building-tower">
    <div v-for="floor in building.floors" :key="floor.floorId"
         :class="['floor-block', floor.status]"
         @click="enterBuilding(building, floor.level)">
      <span class="floor-num">{{ floor.level }}F</span>
    </div>
  </div>
</div>
```

### 3. 宿舍门禁管理 (DormGuardList)

**路径**: `DormGuardList.vue`

**功能描述**:
- 管理宿舍门禁权限
- 支持批量导入和导出
- 记录门禁访问日志

**主要特性**:
- 🔐 **权限管理**: 添加、编辑、删除门禁权限
- 📋 **信息查询**: 卡号、姓名、工号、人员类型、门禁地点
- 📤 **数据导出**: 支持导出 Excel
- 📝 **批量操作**: 支持批量添加和删除

**字段说明**:
- 卡号：门禁卡唯一标识
- 姓名：持卡人姓名
- 工号：员工工号
- 人员类型：正式员工/外部人员/临时工
- 门禁地点：授权的门禁位置

### 4. 宿舍检查 (DormInpsectList)

**路径**: `DormInpsectList.vue`

**功能描述**:
- 宿舍审核管理
- 住宿特办处理
- 审批流程配置

**主要特性**:
- 📑 **Tab 切换**: 审核列表 / 住宿特办
- ✅ **审批功能**: 通过、驳回、批量审批
- 👥 **抄送配置**: 自定义审批抄送人员
- 🏨 **客房入住**: 办理客房临时入住
- ⚙️ **字段配置**: 自定义显示字段

**住宿特办**:
- 特殊情况处理
- 直接办理入住/退宿
- 无需完整审批流程

### 5. 宿舍室友管理 (DormMateList)

**路径**: `DormMateList.vue`

**功能描述**:
- 管理宿舍入住人员
- 人员信息查询
- 调宿退宿记录

**主要特性**:
- 👥 **人员统计**: 按人员类型分类统计
- 📊 **入住状态**: 已入住/已调出/已退宿
- 🔍 **快速搜索**: 姓名、工号、宿舍搜索
- 📝 **详情查看**: 查看人员详细信息

**人员类型统计**:
- 总人数统计
- 正式员工统计
- 外部人员统计
- 临时工统计

**核心代码示例**:
```vue
<!-- 统计卡片 -->
<div class="sqgl-stat-card">
  <div class="stat-icon green"><a-icon type="solution" /></div>
  <div class="stat-body">
    <div class="st-title">正式员工</div>
    <div class="st-num">
      <strong>{{ stats.formalTotal }}</strong><span>人</span>
    </div>
    <div class="st-sub">
      <span class="in">已入住 {{ stats.formalIn }}</span>
      <span class="moved">已调出 {{ stats.formalMoved }}</span>
      <span class="out">已退宿 {{ stats.formalOut }}</span>
    </div>
  </div>
</div>
```

### 6. 宿舍楼栋管理 (DormitoryList)

**路径**: `DormitoryList.vue`

**功能描述**:
- 管理宿舍区域、楼栋、房间
- 床位资源分配
- 使用率统计

**主要特性**:
- 📊 **资源统计**: 区域数、楼栋数、房间数、床位数
- 🏢 **三级管理**: 区域 → 楼栋 → 房间
- 📈 **使用率**: 房间使用率、床位使用率
- ✏️ **编辑功能**: 新增、编辑、删除区域/楼栋/房间

**布局结构**:
- 左侧：区域列表
- 中间：楼栋列表
- 右侧：房间详情

**核心代码示例**:
```vue
<!-- 三列布局 -->
<div class="sqgl-tri-grid">
  <!-- 区域信息 -->
  <div class="sqgl-col-panel">
    <div class="sqgl-col-header">区域信息</div>
    <!-- 区域列表 -->
  </div>
  
  <!-- 楼栋信息 -->
  <div class="sqgl-col-panel">
    <div class="sqgl-col-header">楼栋信息</div>
    <!-- 楼栋列表 -->
  </div>
  
  <!-- 房间信息 -->
  <div class="sqgl-col-panel">
    <div class="sqgl-col-header">房间信息</div>
    <!-- 房间列表 -->
  </div>
</div>
```

## 🔧 核心组件说明

### DormAllotDetailModal.vue

**功能**: 宿舍分配详情弹窗

**特性**:
- 📝 **动态字段**: 根据 `applyType` 显示不同字段
- 🎨 **灵活布局**: 支持两列布局和垂直布局
- 📊 **审批流程**: 时间轴式展示审批进度

**布局规则**:
- **入住申请** (`applyType = '0'`):
  - 字段两列显示
  - 入住原因、备注独占一行
  - 审批流程在下方

- **调宿申请** (`applyType = '1'`):
  - 字段单列显示
  - 审批流程在右侧

- **退宿申请** (`applyType = '2'`):
  - 字段两列显示
  - 卫生照片、退宿原因独占一行
  - 审批流程在下方

**关键代码**:
```javascript
computed: {
  shouldLayoutVertical() {
    // 入住或退宿时使用垂直布局
    return this.applyType === '0' || this.applyType === '2'
  }
}
```

### ApprovalCcFields.vue

**功能**: 审批抄送字段配置组件

**特性**:
- 👥 **人员选择**: 支持多选抄送人员
- 🏢 **部门选择**: 支持按部门选择
- 📧 **通知配置**: 配置抄送通知方式

## 🎨 UI 设计规范

### 颜色主题

```less
@sqgl-primary: #2563eb;        // 主色调-蓝色
@sqgl-border: #e2e8f0;         // 边框颜色
@sqgl-muted-foreground: #64748b; // 次要文本
@sqgl-foreground: #1a2a3d;      // 主要文本
@sqgl-gradient-blue: linear-gradient(135deg, #2d78ff 0%, #4a9eff 100%);
```

### 状态颜色

```javascript
const STATUS_CLS = {
  0: 'pending',    // 审批中 - 黄色
  1: 'approved',   // 已通过 - 绿色
  2: 'handled',    // 已办理 - 绿色
  3: 'cancelled',  // 已撤回 - 灰色
  4: 'rejected',   // 不通过 - 红色
  5: 'checkout'    // 已退宿 - 灰色
}
```

### 响应式断点

```less
@media (max-width: 900px) {
  // 移动端适配
  .sqgl-detail-wrap {
    grid-template-columns: 1fr;
  }
}
```

## 🔌 API 接口

### 宿舍分配相关

| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/sqgl/hrmSqglApply/list` | GET | 获取申请列表 |
| `/sqgl/hrmSqglApply/queryById` | GET | 查询申请详情 |
| `/sqgl/hrmSqglApply/add` | POST | 新增申请 |
| `/sqgl/hrmSqglApply/edit` | POST | 编辑申请 |
| `/sqgl/hrmSqglApply/delete` | DELETE | 删除申请 |
| `/sqgl/hrmSqglApply/submit` | POST | 提交申请 |
| `/sqgl/hrmSqglApply/cancel` | POST | 取消申请 |
| `/sqgl/hrmSqglApply/approve` | POST | 审批通过 |
| `/sqgl/hrmSqglApply/reject` | POST | 审批驳回 |

### 宿舍资源相关

| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/sqgl/area/list` | GET | 获取区域列表 |
| `/sqgl/building/list` | GET | 获取楼栋列表 |
| `/sqgl/room/list` | GET | 获取房间列表 |
| `/sqgl/room/queryById` | GET | 查询房间详情 |

### 门禁管理相关

| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/sqgl/guard/list` | GET | 获取门禁列表 |
| `/sqgl/guard/add` | POST | 添加门禁权限 |
| `/sqgl/guard/edit` | POST | 编辑门禁权限 |
| `/sqgl/guard/delete` | DELETE | 删除门禁权限 |

## 📊 数据字典

### 宿舍类型 (hrm_sqgl_apply_dorm_type)

| 值 | 文本 |
|----|------|
| 0 | 普通宿舍 |
| 1 | 配偶宿舍 |

### 人员类型 (hrm_sqgl_apply_person_type)

| 值 | 文本 |
|----|------|
| 0 | 正式员工 |
| 1 | 外部人员 |
| 2 | 临时工 |

### 申请状态 (hrm_sqgl_apply_status)

| 值 | 文本 |
|----|------|
| 0 | 审批中 |
| 1 | 已通过 |
| 2 | 已办理 |
| 3 | 已撤回 |
| 4 | 不通过 |
| 5 | 已退宿 |

### 入住状态 (hrm_sqgl_apply_rz_status)

| 值 | 文本 |
|----|------|
| 0 | 待入住 |
| 1 | 已入住 |
| 2 | 已调宿 |
| 3 | 已退宿 |

## 🚀 使用示例

### 打开入住申请详情

```javascript
this.$refs.detailModal.open(record.id, '0')
```

### 打开调宿申请详情

```javascript
this.$refs.detailModal.open(record.id, '1')
```

### 打开退宿申请详情

```javascript
this.$refs.detailModal.open(record.id, '2')
```

### 打开住宿特办详情

```javascript
this.$refs.detailModal.open(record.id, 'special')
```

## 📱 移动端适配

模块已做移动端适配，支持以下特性：
- ✅ 响应式布局
- ✅ 触摸手势操作
- ✅ 移动端优化的弹窗
- ✅ 自适应字体大小

## 🔒 权限控制

模块支持细粒度权限控制：
- 查看权限：查看宿舍信息
- 申请权限：提交入住/调宿/退宿申请
- 审批权限：审批申请
- 管理权限：管理宿舍资源

## 📝 开发规范

### 代码规范

1. **命名规范**:
   - 组件名使用 PascalCase
   - 方法名使用 camelCase
   - CSS 类名使用 kebab-case

2. **样式规范**:
   - 使用 Less 预处理器
   - 遵循 BEM 命名约定
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

### Q1: 审批流程不显示？

**原因**: 数据中 `approveName` 字段为空

**解决**: 确保申请数据包含审批人信息

### Q2: 详情弹窗布局错乱？

**原因**: `applyType` 参数传递错误

**解决**: 确保传递正确的类型参数 (`'0'` / `'1'` / `'2'` / `'special'`)

### Q3: 卫生照片无法预览？

**原因**: 图片 URL 格式不正确

**解决**: 确保图片 URL 经过 `getFileAccessHttpUrl` 处理

## 📚 相关文档

- [宿舍审核调度API文档](./宿舍审核调度API文档.md)
- [宿舍调动管理API文档](./宿舍调动管理API文档.md)
- [人员基础信息与宿舍看板接口](./人员基础信息与宿舍看板接口.md)
- [舍区管理API文档](./舍区管理API文档.md)

## 👥 维护者

- 开发团队: QR-HRM 开发组
- 最后更新: 2026-08-19

## 📄 版本历史

### v1.0.0 (2026-08-19)
- ✨ 初始版本发布
- 🎨 完成宿舍分配、看板、门禁等核心功能
- 📱 支持移动端适配
- 📝 完善文档

---

如有问题或建议，请联系开发团队。
