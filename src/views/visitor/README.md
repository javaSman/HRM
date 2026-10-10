# 访客管理模块 (Visitor)

## 📋 模块概述

访客管理模块提供了完整的访客来访管理解决方案，包括员工访客申请、访客自主登记、邀约访客、劳动派遣登记、放行条管理等功能。该模块支持完整的审批流程，提供移动端 H5 页面，支持二维码扫描登记，实现智能化的访客管理。

## 📁 文件结构

```
visitor/
├── VisitorApply.vue              # 访客申请页面
├── VisitorApproval.vue           # 访客审批页面
├── VisitorReceive.vue            # 访客接待页面
├── PassApply.vue                 # 放行条申请页面
├── visitor-theme.less            # 访客模块主题样式
├── README.md                     # 本文档
└── modules/                      # 子组件目录
    ├── VisitorList.vue                     # 访客列表（通用列表组件）
    ├── EmployeeVisitorModal.vue            # 员工访客申请弹窗
    ├── EmployeeVisitorDetail.vue           # 员工访客详情弹窗
    ├── InviteVisitorModal.vue              # 邀约访客申请弹窗
    ├── SelfRegisterModal.vue               # 自助登记详情弹窗
    ├── SelfRegisterH5.vue                  # 访客自主登记 H5 页面
    ├── SelfRegisterQrModal.vue             # 自助登记二维码弹窗
    ├── VisitorApproval.vue                 # 访客审批弹窗
    ├── VisitorConfirmVisit.vue             # 确认来访弹窗
    ├── VisitorChangeReceiver.vue           # 修改接待人弹窗
    ├── PassSlip.vue                        # 放行条列表组件
    ├── PassSlipModal.vue                   # 放行条申请弹窗
    ├── PassSlipApproval.vue                # 放行条审批弹窗
    ├── PassSlipDetail.vue                  # 放行条详情弹窗
    └── PassSlipRelease.vue                 # 放行条放行弹窗
```

## 🎯 功能模块

### 1. 访客申请 (VisitorApply)

**路径**: `VisitorApply.vue`

**功能描述**:
- 管理各类访客申请
- 查看申请状态和详情
- 取消未审批的申请

**主要特性**:
- 📑 **Tab 切换**: 员工访客 / 访客自主登记 / 邀约访客 / 劳动派遣登记
- 🔍 **智能筛选**: 支持姓名、来访区域、来访事由、时间等多维度搜索
- 📊 **状态统计**: 实时显示各状态的申请数量
- 📝 **详情查看**: 查看申请详情和审批进度
- ❌ **取消申请**: 取消审核中的申请

**访客类型说明**:

| 类型 | 类型代码 | 来访类型代码 | 说明 |
|------|---------|-------------|------|
| 员工访客 | employee | 0 | 员工主动申请访客来访 |
| 访客自主登记 | selfRegister | 1 | 访客通过二维码自主登记 |
| 邀约访客 | invite | 2,3 | 员工邀约访客来访 |
| 劳动派遣登记 | temp | 4 | 劳动派遣人员登记 |

**核心代码示例**:
```vue
<!-- 顶部Tab -->
<div class="v-top-tabs padded">
  <div v-for="tab in tabs" :key="tab.key"
       :class="['v-top-tab', activeKey === tab.key ? 'active' : '']"
       @click="handleTabChange(tab.key)">
    {{ tab.label }}
  </div>
</div>

<script>
export default {
  data() {
    return {
      tabs: [
        { key: 'employee', label: '员工访客' },
        { key: 'selfRegister', label: '访客自主登记' },
        { key: 'invite', label: '邀约访客' },
        { key: 'temp', label: '劳动派遣登记' }
      ]
    }
  }
}
</script>
```

### 2. 访客审批 (VisitorApproval)

**路径**: `VisitorApproval.vue`

**功能描述**:
- 审批各类访客申请
- 支持批量审批
- 查看审批历史

**主要特性**:
- 📑 **Tab 切换**: 员工访客审批 / 访客自主登记审批 / 邀约访客审批 / 劳动派遣登记审批 / 放行条审批
- ✅ **审批功能**: 通过、驳回、批量通过、批量驳回
- 📝 **审批意见**: 支持填写审批意见
- 📋 **详情查看**: 查看申请详情和同行人信息

**审批流程**:
1. 查看待审批列表
2. 查看访客详细信息
3. 填写审批意见（可选）
4. 审批通过或驳回

**核心代码示例**:
```vue
<!-- 审批操作 -->
<template>
  <button class="v-btn-icon success" @click="handleReview(record)">审核</button>
  <button class="v-btn-icon info" @click="handleDetail(record)">详情</button>
</template>

<script>
methods: {
  handleReview(record) {
    this.$refs.approvalModal.show(record)
  }
}
</script>
```

### 3. 访客接待 (VisitorReceive)

**路径**: `VisitorReceive.vue`

**功能描述**:
- 接待已审批通过的访客
- 确认访客来访状态
- 修改接待人信息

**主要特性**:
- 📑 **Tab 切换**: 员工访客接待 / 访客自主登记接待 / 邀约访客接待 / 劳动派遣接待
- ✅ **确认来访**: 确认访客已到达
- 👤 **修改接待人**: 修改接待人信息
- 📊 **状态统计**: 待来访、已来访统计
- 📝 **详情查看**: 查看访客详细信息

**接待流程**:
1. 查看待来访访客列表
2. 确认访客到达（点击"确认来访"）
3. 或修改接待人信息

**核心代码示例**:
```vue
<!-- 接待操作 -->
<template>
  <button class="v-btn-icon warn" @click="handleChangeReceiver(record)">修改接待人</button>
  <button class="v-btn-icon success" @click="handleConfirmVisit(record)">确认来访</button>
  <button class="v-btn-icon info" @click="handleDetail(record)">详情</button>
</template>
```

### 4. 放行条管理 (PassApply)

**路径**: `PassApply.vue` → `modules/PassSlip.vue`

**功能描述**:
- 申请物品放行条
- 审批放行条
- 确认放行

**主要特性**:
- 📝 **申请功能**: 提交放行条申请
- ✅ **审批功能**: 审批放行条
- 🚪 **放行确认**: 确认物品已放行
- 📋 **详情查看**: 查看放行条详情

**放行条字段**:
- 物品名称
- 物品数量
- 放行事由
- 接待人
- 车牌号
- 状态

### 5. 访客自主登记 H5 (SelfRegisterH5)

**路径**: `modules/SelfRegisterH5.vue`

**功能描述**:
- 访客通过扫码自主登记
- 支持外来人员和劳动派遣登记
- 移动端友好的表单界面

**主要特性**:
- 📱 **移动端适配**: 完美适配移动端屏幕
- 📲 **扫码登记**: 扫描二维码直接进入对应登记页面
- 🎯 **类型区分**: 支持外来人员登记和劳动派遣登记
- ✅ **表单验证**: 完善的表单验证
- 👥 **同行人**: 支持添加同行人
- 📎 **附件上传**: 支持上传附件

**URL 参数支持**:
```
/visitorRegister.html?type=visitor  # 外来人员登记
/visitorRegister.html?type=temp     # 劳动派遣登记
/visitorRegister.html               # 身份选择页（默认）
```

**表单字段 - 外来人员登记**:
- 真实姓名（必填）
- 身份证（必填，18位）
- 联系电话（必填，11位手机号）
- 车牌号
- 所属公司或个人（必填）
- 来访区域（必填）
- 来访事由（必填）
- 来访时间（必填）
- 来访事由详细（必填）
- 同行人（可选）
- 接待人姓名（必填）
- 接待人手机号码（必填，自动查询员工信息）
- 上传附件（可选）

**表单字段 - 劳动派遣登记**:
- 真实姓名（必填）
- 身份证（必填）
- 联系电话（必填）
- 派遣公司（必填）
- 来访时间（必填）
- 接待人姓名（必填）
- 接待人手机号码（必填）
- 上传附件（可选）

**核心代码示例**:
```vue
<script>
export default {
  data() {
    return {
      currentView: 'identity', // identity | visitor | temp
      registerType: null, // 从URL参数获取
    }
  },
  created() {
    this.initFromUrl()
  },
  methods: {
    initFromUrl() {
      var urlParams = new URLSearchParams(window.location.search)
      var type = urlParams.get('type')
      if (type === 'visitor' || type === 'temp') {
        this.registerType = type
        this.currentView = type // 直接进入对应表单
      }
    }
  }
}
</script>
```

### 6. 二维码生成 (SelfRegisterQrModal)

**路径**: `modules/SelfRegisterQrModal.vue`

**功能描述**:
- 生成访客自主登记二维码
- 生成劳动派遣登记二维码
- 支持下载和打印

**主要特性**:
- 📲 **二维码生成**: 根据类型生成不同二维码
- 🏷️ **类型区分**: 访客自主登记二维码 / 劳动派遣二维码
- 📋 **URL 显示**: 显示二维码对应的 URL
- 🔄 **重新生成**: 生成失败时支持重新生成

**二维码类型**:
- **访客自主登记二维码**: 对应 `type=visitor`
- **劳动派遣二维码**: 对应 `type=temp`

**核心代码示例**:
```vue
<script>
export default {
  methods: {
    open(type = 'visitor') {
      this.type = type
      this.visible = true
      this.generate()
    },
    async generate() {
      // 根据类型生成不同的URL
      var baseUrl = new URL('/visitorRegister.html', window.location.origin)
      baseUrl.searchParams.set('type', this.type)
      this.qrUrl = baseUrl.toString()
      this.qrDataUrl = await QRCode.toDataURL(this.qrUrl, {
        width: 360,
        margin: 2,
        errorCorrectionLevel: 'M'
      })
    }
  }
}
</script>
```

## 🔧 核心组件说明

### VisitorList.vue

**功能**: 访客列表通用组件

**特性**:
- 📊 **多类型支持**: 支持 employee / selfRegister / invite / temp 四种类型
- 🎯 **多状态支持**: 支持 apply / approval / receive 三种状态
- 🔍 **智能筛选**: 根据类型显示不同的筛选条件
- 📈 **状态统计**: 实时统计各状态数量
- 📱 **移动端适配**: 完美适配移动端

**Props**:
```javascript
props: {
  type: {
    type: String,
    required: true,
    validator: value => ['employee', 'selfRegister', 'invite', 'temp'].includes(value)
  },
  state: {
    type: String,
    default: 'apply',
    validator: value => ['apply', 'approval', 'receive'].includes(value)
  }
}
```

### EmployeeVisitorModal.vue

**功能**: 员工访客申请弹窗

**特性**:
- 📝 **完整表单**: 包含访客信息、来访信息、同行人等
- 👥 **同行人管理**: 支持添加、删除同行人
- ✅ **表单验证**: 完善的表单验证规则
- 🔄 **自动查询**: 输入接待人手机号自动查询员工信息

### EmployeeVisitorDetail.vue

**功能**: 员工访客详情弹窗

**特性**:
- 📋 **详情展示**: 展示访客详细信息
- 👥 **同行人展示**: 展示同行人列表
- 📊 **审批流程**: 展示审批流程和状态

## 🎨 UI 设计规范

### 颜色主题

```less
// visitor-theme.less
@v-primary: #2563eb;           // 主色调-蓝色
@v-primary-rgb: 37, 99, 235;
@v-background: #f1f5f9;        // 背景色
@v-foreground: #1e293b;        // 前景色/主文本
@v-muted-foreground: #64748b;  // 次要文本
@v-border: #e2e8f0;            // 边框颜色
@v-accent: #dbeafe;            // 强调色
@v-secondary: #f1f5f9;         // 次要背景色
@v-destructive: #dc2626;       // 危险色
@v-shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.1); // 卡片阴影
```

### 状态颜色

| 状态 | 状态值 | 样式类 | 颜色 |
|------|--------|--------|------|
| 审核中 | 0 | pending | 黄色 (#f59e0b) |
| 已通过 | 1 | approved | 绿色 (#10b981) |
| 已驳回 | 2 | rejected | 红色 (#ef4444) |
| 已取消 | 3 | cancelled | 灰色 (#64748b) |
| 已来访 | - | visited | 绿色 (#10b981) |
| 待来访 | - | waiting | 蓝色 (#2563eb) |

### 响应式断点

```less
@media (max-width: 768px) {
  // 移动端适配
  .v-filter-row {
    flex-direction: column;
  }
}
```

## 🔌 API 接口

### 访客申请相关

| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/fkzx/hrmFkzxSq/list` | GET | 获取访客列表 |
| `/fkzx/hrmFkzxSq/queryById` | GET | 查询访客详情 |
| `/fkzx/hrmFkzxSq/add` | POST | 新增访客申请 |
| `/fkzx/hrmFkzxSq/edit` | POST | 编辑访客申请 |
| `/fkzx/hrmFkzxSq/delete` | DELETE | 删除访客申请 |
| `/fkzx/hrmFkzxSq/submit` | POST | 提交访客申请 |
| `/fkzx/hrmFkzxSq/cancel` | POST | 取消访客申请 |
| `/fkzx/hrmFkzxSq/approve` | POST | 审批通过 |
| `/fkzx/hrmFkzxSq/reject` | POST | 审批驳回 |
| `/fkzx/hrmFkzxSq/confirm` | POST | 确认来访 |
| `/fkzx/hrmFkzxSq/batchConfirmVisit` | POST | 批量确认来访 |
| `/fkzx/hrmFkzxSq/countByTypeAndLfzt` | GET | 统计来访状态数量 |

### 员工信息相关

| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/hrm/hrEmployeeInformation/queryByPhoneNumbers` | GET | 通过手机号查询员工信息 |

### 放行条相关

| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/fkzx/hrmFkzxFxt/list` | GET | 获取放行条列表 |
| `/fkzx/hrmFkzxFxt/add` | POST | 新增放行条 |
| `/fkzx/hrmFkzxFxt/approve` | POST | 审批放行条 |
| `/fkzx/hrmFkzxFxt/release` | POST | 确认放行 |

## 📊 数据字典

### 来访类型 (hrm_fkzx_sq_lflx)

| 值 | 文本 |
|----|------|
| 0 | 员工访客 |
| 1 | 访客自主登记 |
| 2 | 邀约访客（类型2） |
| 3 | 邀约访客（类型3） |
| 4 | 劳动派遣登记 |

### 来访区域 (hrm_fkzx_sq_lfqy)

根据企业实际情况配置

### 来访事由 (hrm_fkzx_sq_lfsy)

| 值 | 文本 |
|----|------|
| 1 | 商务拜访 |
| 2 | 面试 |
| 3 | 快递外卖 |
| 4 | 其他 |

### 派遣公司 (hrm_fkzx_sq_pqgs)

根据企业实际情况配置

### 访客状态 (hrm_fkzx_sq_zt)

| 值 | 文本 |
|----|------|
| 0 | 审核中 |
| 1 | 已通过 |
| 2 | 已驳回 |
| 3 | 已取消 |

### 来访状态 (hrm_fkzx_sq_lfzt)

| 值 | 文本 |
|----|------|
| 0 | 待来访 |
| 1 | 已来访 |

## 🚀 使用示例

### 打开员工访客申请弹窗

```javascript
this.$refs.modalForm.add()
this.$refs.modalForm.title = '新增员工访客申请'
```

### 打开访客详情

```javascript
this.$refs.detailModal.show(record, '员工访客详情', true, 'employee')
```

### 打开审批弹窗

```javascript
this.$refs.approvalModal.show(record)
```

### 确认来访

```javascript
this.$refs.confirmVisitModal.show(record)
```

### 生成二维码

```javascript
// 访客自主登记二维码
this.$refs.qrModal.open('visitor')

// 劳动派遣二维码
this.$refs.qrModal.open('temp')
```

### 批量确认来访

```javascript
this.$http.post('/fkzx/hrmFkzxSq/batchConfirmVisit', this.selectedRowKeys)
  .then(res => {
    if (res.success) {
      this.$message.success('批量确认来访成功')
      this.modalFormOk()
    }
  })
```

## 📱 移动端适配

模块已做移动端适配，支持以下特性：
- ✅ 响应式布局
- ✅ 触摸手势操作
- ✅ 移动端优化的表单
- ✅ 自适应字体大小
- ✅ H5 页面完美适配

### H5 页面特性

- 📱 完美适配手机屏幕
- 🎨 现代化 UI 设计
- ✅ 完善的表单验证
- 📲 支持扫码直接进入对应表单
- 🔄 支持再次登记
- 📎 支持附件上传

## 🔒 权限控制

模块支持细粒度权限控制：
- **查看权限**: 查看访客信息
- **申请权限**: 提交访客申请
- **审批权限**: 审批访客申请
- **接待权限**: 确认来访、修改接待人
- **管理权限**: 管理访客设置

## 📝 开发规范

### 代码规范

1. **命名规范**:
   - 组件名使用 PascalCase
   - 方法名使用 camelCase
   - CSS 类名使用 kebab-case（v- 前缀）

2. **样式规范**:
   - 使用 Less 预处理器
   - 使用 `visitor-theme.less` 统一主题
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

### Q1: 二维码扫码后页面空白？

**原因**: URL 参数传递错误或路由配置问题

**解决**: 确保 `visitorRegister.html` 正确配置和访问

### Q2: 接待人手机号无法查询到员工信息？

**原因**: 手机号未在员工信息库中或格式不正确

**解决**: 确保手机号格式正确且已在员工库中录入

### Q3: 审批后状态未更新？

**原因**: 审批接口调用失败或状态统计未刷新

**解决**: 确保接口调用成功后刷新列表和统计数据

### Q4: H5 页面返回按钮不显示？

**原因**: 从二维码扫码进入时隐藏返回按钮

**解决**: 这是正常设计，扫码用户无需返回到身份选择页

## 📚 相关文档

- [访客管理设计文档](./README.md)
- 项目总览: `项目总览.html`

## 👥 维护者

- 开发团队: QR-HRM 开发组
- 最后更新: 2026-08-19

## 📄 版本历史

### v1.0.0 (2026-08-19)
- ✨ 初始版本发布
- 🎨 完成访客申请、审批、接待等核心功能
- 📱 支持 H5 移动端登记
- 📲 支持二维码扫描登记
- 📝 完善文档

---

如有问题或建议，请联系开发团队。
