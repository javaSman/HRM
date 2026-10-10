# 我的申请 · 新申请模块接入指南

工作台「我的申请」（`MyApply.vue`）是跨模块申请单聚合页，数据来自后端联合视图
`v_user_sqd_union`，类型差异全部收敛在 **`applyTypeRegistry.js`（类型注册表）**，
页面主流程（列表 / 分页 / Tab / 筛选 / 审批流程 / 取消弹窗）对具体类型无感知。

接入一个新模块，**通常只需改注册表一个文件 + 核对后端联合视图字段，不需要动任何 .vue**。

---

## 一、文件职责

| 文件 | 职责 | 接入新模块时是否要改 |
|---|---|---|
| `applyTypeRegistry.js` | 每个申请类型一块配置：卡片标签色、嵌套 key、详情字段、取消接口描述 | **是，主要改这里** |
| `workbench.js` | 联合视图接口 + `cancelApply(type, item, reason)` 取消分发 | 否（除非出现第 5 种接口风格） |
| `ApplyCancelModal.vue` | 公共取消确认弹窗（自动 loading、必填取消原因、失败可重试） | 否 |
| `MyApply.vue` | 列表 + 详情 + 审批流程 + 操作区 | 否 |

---

## 二、后端联合视图约定（先核对）

联合视图每一行对应一张业务表单据，顶层公共字段：

| 字段 | 说明 |
|---|---|
| `id` | **业务表主键 id**（取消接口传的就是它，务必与业务表 id 一致） |
| `mkname` | 申请类型名，**必须与注册表 key 一字不差**（如 `加班申请`，注意不是文档里的「加班申请单」） |
| `name` / `no` | 申请人姓名 / 工号（嵌套对象缺失时的兜底展示） |
| `createtime` | 提交时间（筛选、卡片、详情公共头都用它） |

各类型的业务数据挂在记录的不同**嵌套对象**里（如加班是 `hrJbApplication`、请假是 `hrXjsq`），
嵌套对象至少应包含：

- `spStatus`：审批状态，`1` 审批中 / `2` 已通过 / `3` 已撤回（取消）/ `4` 已退回
- `name` / `no` / `dept` / `dept_dictText` / `createTime`
- `customProcessSqdSpjdList`：审批节点列表，节点字段：
  `nodeName`、`px`（排序）、`sprName`（逗号分隔多人）、`spStatus`（节点状态 1/2/3）、
  `approvalRule`（1 会签 / 2 或签）、`nodeProperties`（2 抄送节点）

> ⚠️ 人事 / 访客系模块状态字段是中文 `zt`（如「已取消」）或字符串 `'3'`，不是 `spStatus`。
> 这类模块详情未做好时一律标 `detailReady:false`，页面状态以所在 Tab 为准，不读嵌套状态。

---

## 三、注册表配置说明

在 `applyTypeRegistry.js` 的 `APPLY_TYPES` 里加一块：

```js
'类型名（= 联合视图 mkname）': {
  // ① 卡片标签色：t-leave 红 / t-overtime 黄 / t-repair 蓝 / t-out 绿 / t-other 紫
  tagClass: 't-other',

  // ② 联合视图记录里该类型嵌套对象的 key（后端命名不同只改这一个字符串）
  nestedKey: 'hrXxx',

  // ③ 卡片时间兜底：顶层 createtime 为空时用（一般 startTime）
  cardTimeFallback(d) {
    return d.startTime || ''
  },

  // ④ 详情「申请信息」区的类型私有行（公共头：申请人/工号/部门/提交时间；公共尾：备注说明，自动拼接）
  buildInfo(d, ctx) {
    return [
      { label: '开始时间', value: ctx.dash(d.startTime) },
      { label: '事由', value: ctx.dash(d.sqyy), full: true }, // full:true 占整行
      // 附件行：type:'files'，value 为逗号分隔的相对路径（JUploadList 存储格式），
      // 页面自动渲染文件名链接，点击走全局 PDF/文件预览器，多文件时一行内依次排列
      { label: '附件', type: 'files', value: d.attachmentUrls || '' }
    ]
  },

  // ⑤ 公共尾「备注说明」取哪个字段
  getRemark(d) {
    return d.remark || d.note || ''
  },

  // ⑥ 取消接口描述块（见下节）；不需要取消能力时省略，按钮自动隐藏
  cancel: { ... }
}
```

`buildInfo(d, ctx)` 上下文工具：

- `ctx.dash(v)`：空值统一成空串（盒子高度由样式兜底，不会塌陷）
- `ctx.datePart(v)`：取日期部分 `2026-09-11 10:00:00 -> 2026-09-11`
- `ctx.dictText(field)`：取后端挂的字典翻译，如 `ctx.dictText('xjType')` 优先取 `xjType_dictText`
- `ctx.orgName(id)`：组织树兜底翻译（公司/部门 id → 名称），联合视图未挂 `xxx_dictText` 时用，如 `ctx.orgName(d.companyId)`
- `ctx.raw`：联合视图原始行（需要顶层字段时用）

公共头固定行之外，类型可声明可选钩子 `headRows(d, ctx)`，返回的行插在「员工工号」与
「所属部门」之间（移动打卡用它在工号后展示公司）；不声明则公共头为固定四行。

---

## 四、取消接口（cancel 描述块）四种风格

`workbench.js` 的 `cancelApply` 按 `send` 分发，业务 id 取 `nested.id`，
缺失时自动降级用联合视图顶层 `record.id`：

### 1. `body` —— 整条实体回传（考勤族）

POST `updateWithdraw`，body 为整条业务记录并覆盖 `spStatus: 3`。
可用现成工厂 `attendanceCancel(url)`：

```js
cancel: attendanceCancel('/hr_jb_application/hrJbApplication/updateWithdraw')
```

> 依赖联合视图嵌套对象是**完整实体行**；字段不全时撤回会失败，需后端补全。

### 2. `idBody` —— 只传 id + 状态（复用 edit 改状态）

后端明确只收业务 id 和状态字段时用，可用工厂 `editCancel(url, zt)`：

```js
// 访客：zt 为字符串 '3'
cancel: editCancel('/fkzx/hrmFkzxSq/edit', '3')
// 人事：zt 为中文
cancel: editCancel('/ryManage/hrmTdgl/edit', '已取消')
```

等价于手写：

```js
cancel: { method: 'post', url: '/xxx/edit', send: 'idBody', merge: { zt: '已取消' }, reasonField: '' }
```

### 3. `queryId` —— PUT `cancel?id=`

```js
cancel: { method: 'put', url: '/sqgl/hrmSqglApply/cancel', send: 'queryId', reasonField: '' }
```

### 4. `pathId` —— PUT `cancel/{id}`

```js
// url 不要带结尾斜杠和 id，分发器自动拼
cancel: { method: 'put', url: '/lsggl/tempWorkerApply/cancel', send: 'pathId', reasonField: '' }
```

### 需要填取消原因

`reasonField` 填实体字段名（如 `'qxyy'`、`'spyj'`），公共弹窗会自动渲染**必填**文本域，
提交时按该字段名合并进 body（仅 `body` / `idBody` 风格有效）：

```js
cancel: { method: 'post', url: '/xxx/edit', send: 'idBody', merge: { zt: '已取消' }, reasonField: 'qxyy' }
```

---

## 五、取消接口先行、详情未做好时

允许先在注册表写好取消配置、不做详情。配置 `detailReady:false` + 空 `buildInfo`：

```js
'宿舍申请': {
  tagClass: 't-other',
  detailReady: false,           // 详情区显示「暂未接入」占位
  nestedKey: 'hrmSqglApply',
  buildInfo: () => [],
  getRemark: () => '',
  cancel: { method: 'put', url: '/sqgl/hrmSqglApply/cancel', send: 'queryId', reasonField: '' }
}
```

效果：详情区只显示「暂未接入」占位，**不渲染任何操作按钮（包括取消申请）**；状态以所在 Tab 为准，
不读嵌套对象。详情做好后删掉 `detailReady:false`、补上真正的 `buildInfo`，操作区与取消按钮会自动出现。

---

## 六、筛选下拉与 Tab

- 申请类型筛选下拉在 `MyApply.vue` 顶部常量 `APPLY_TYPE_OPTIONS`，新类型需要可筛选时把 mkname 加进去
  （未加也不影响列表卡片和取消，只是不能按该类型筛选）。
- Tab 固定四档，由联合视图 `spStatus`（1/2/3/4）映射，无需为新类型改动。

---

## 七、联调核对清单

1. [ ] 联合视图该类型记录的 `mkname` 与注册表 key **完全一致**（用真实响应核对，别只看接口文档命名）
2. [ ] `nestedKey` 与后端嵌套对象字段名一致；嵌套对象含 `spStatus`、审批节点列表
3. [ ] 顶层 `record.id` 就是业务表主键（idBody / queryId / pathId 风格依赖它）
4. [ ] `body` 风格：嵌套对象字段与该模块自己 list 接口返回的实体行一致（完整行）
5. [ ] 取消接口 URL / method / 状态值（数字 `3`、字符串 `'3'`、还是中文 `已取消`）与后端清单逐项一致
6. [ ] 端到端：待审批 Tab 选一条该类型单据 → 取消 → 成功提示 → 单据移入「已取消」Tab、角标数量变化
7. [ ] 后端返回 `{ success:false }` 时弹窗不关闭、可重试（组件已内置，只需验证接口行为）

---

## 附：已接入类型速查

| 类型 (mkname) | nestedKey | 详情 | 取消接口 |
|---|---|---|---|
| 加班申请 | `hrJbApplication` | ✅ | POST `hr_jb_application/hrJbApplication/updateWithdraw`（body, spStatus:3） |
| 补卡申请 | `hrBksq` | ✅ | POST `hr_bksq/hrBksq/updateWithdraw` |
| 请假申请 | `hrXjsq` | ✅ | POST `hr_xjsq/hrXjsq/updateWithdraw` |
| 外出申请 | `hrWcApplication` | ✅ | POST `hr_wc_application/hrWcApplication/updateWithdraw` |
| 移动打卡申请 | `hrYddksq` | ✅ | POST `hr_yddksq/hrYddksq/updateWithdraw` |
| 宿舍申请 | `hrmSqglApply` | ⏳ 占位 | PUT `sqgl/hrmSqglApply/cancel?id=` |
| 访客申请 | `hrmFkzxSq` | ⏳ 占位 | POST `fkzx/hrmFkzxSq/edit`（idBody, zt:'3'） |
| 放行条申请 | `hrmFxtsqxx` | ⏳ 占位 | POST `fkzx/hrmFxtsqxx/edit`（idBody, zt:'3'） |
| 离职申请 | `hrmLzgl` | ⏳ 占位 | POST `ryManage/hrmLzgl/edit`（idBody, zt:'已取消'） |
| 调动申请 | `hrmTdgl` | ⏳ 占位 | POST `ryManage/hrmTdgl/edit`（idBody, zt:'已取消'） |
| 调薪申请 | `hrmTxsq` | ⏳ 占位 | POST `ryManage/hrmTxsq/edit`（idBody, zt:'已取消'） |
| 临时工申请 | `tempWorkerApply` | ⏳ 占位 | PUT `lsggl/tempWorkerApply/cancel/{id}` |

> URL 统一不带 `/qr-hrm` 前缀（已在 `VUE_APP_API_BASE_URL` 中）。
> 标 ⏳ 的类型 key / nestedKey / 调薪 zt 值为按命名惯例推定，联调时以联合视图真实响应为准。
