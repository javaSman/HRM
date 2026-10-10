# 入职资料补充功能：新会话恢复上下文

> 生成时间：2026-07-21  
> 用途：在新 Codex 会话中直接携带本文件，继续开发或排查“资料补充二维码 / 移动端入职资料”功能。  
> 隐私说明：本文不包含示例接口响应中的真实手机号、身份证号、附件地址或人员资料。

## Session ID

`(none)`

## Project Root

`D:\Project\qr-hrm\ant-design-vue-jeecg`

## Objective

提供一个二维码入口指向免登录移动端页面。员工通过预留手机号查询入职详情，查看主表信息，按六个 Tab 补充基本信息、教育经历、工作履历、家庭成员、个人附件和关系申报，并直接提交聚合详情对象。

## 新会话建议提示词

```text
请先完整阅读：
D:\Project\qr-hrm\ant-design-vue-jeecg\docs\onboarding-supplement-session-memory-2026-07-21.md

这是“资料补充二维码 / 移动端入职资料”功能的恢复上下文。请以当前代码实际契约为准，不要恢复旧版 GET、editDetl、HrmRzglVO 或 rzsjtz 方案。开始修改前先执行 git status 和定向 diff，保留所有现有未提交改动。
```

## Execution Plan

### Source: user-stated（最新移动端样式与 Tab 计划，已实施）

<details>
<summary>Full Execution Plan (Click to expand)</summary>

# 移动端入职资料页面样式与 Tab 重构

## 概要

- 按参考 HTML 的移动端卡片布局重构页面，保留现有表单字段、接口、数据映射和提交结构。
- 品牌文案改为“欢迎加入强瑞技术”。
- 使用 Tab 单项切换资料分组，替换现有折叠面板。
- 增加员工文字头像，移除协议区，提交按钮统一为“提交资料”。

## 页面结构

- 顶部使用白色导航栏显示“入职资料补充”，不复制参考稿中的手机外框和模拟状态栏。
- 查询成功后依次显示：
  - 蓝色欢迎卡片：“欢迎加入强瑞技术”及资料填写提示。
  - 员工摘要卡片：文字头像、姓名、部门标签、工号和岗位。
  - 横向可滚动 Tab。
  - 当前 Tab 对应的表单内容。
  - 固定底部“提交资料”按钮。
- 查询前保留手机号查询表单；查询成功后隐藏查询区域，通过员工卡片中的“重新查询”入口返回。
- 不添加参考 HTML 中的协议勾选及“我已阅读并同意……”文案。
- 不展示“资料完成进度”，避免在缺少必填口径时显示误导百分比。

## Tab 与头像

- Tab 顺序采用：
  1. 基本信息
  2. 教育经历
  3. 工作履历
  4. 家庭成员
  5. 个人附件
  6. 关系申报
- “基本信息”Tab 同时保留现有主表只读字段和 `jbxx` 编辑表单，其余 Tab 继续使用原字段配置和增删逻辑。
- 使用 ant-design-vue `a-tabs`，关闭切换动画并通过外部 Less 调整为参考稿的横向胶囊式导航；切换 Tab 不销毁数据或重置用户输入。
- 新增独立员工摘要组件，避免主页面超过 200 行：
  - `getAvatarText(record)` 参照 `EmployeeList.vue`，获取员工姓名后返回最后两个字符。
  - 姓名为空时显示 `-`。
  - 姓名优先使用主表 `xm`，摘要信息使用部门、工号和岗位显示字段。
- 查询和重新查询后默认切换至“基本信息”。

## 样式实现

- 在现有移动端 Less 中实现浅灰页面背景、白色圆角卡片、52px 圆形文字头像、部门浅蓝标签和固定底部操作栏。
- 表单改为移动端单列行式布局：左侧标签、右侧控件、浅色分隔线；字段名称、控件类型和双向绑定保持不变。
- 多条记录继续使用独立卡片，保留新增、删除和附件上传交互。
- 桌面宽度下内容居中并限制最大宽度，375px 手机宽度下铺满可用区域。
- 欢迎卡使用克制的强瑞蓝实色风格，不复制原型的手机壳、状态栏、emoji 和协议区域。

## 验证

- 验证六个 Tab 可切换且每次只显示当前分组，切换后已填写内容不丢失。
- 验证所有现有字段数量、名称、控件类型、数组新增删除和上传功能保持不变。
- 验证主表只读字段仍在“基本信息”Tab 展示。
- 验证头像对单字、双字、多字和空姓名的显示结果。
- 验证页面不存在“杨侨科技/杨桥科技”“保存并提交”及协议文案。
- 在 375px、768px 和桌面宽度下检查布局，再执行定向 ESLint、文件行数检查和 `npm run build:test`。

## 默认约定

- 参考布局依据用户提供的 HTML/CSS 源码还原。
- 本次不调整 API、字段配置、主表到 `jbxx` 的映射、`hrmRzglId` 规则或提交请求体。

</details>

## 实施状态

- [x] 注册公开路由和权限白名单。
- [x] 使用 `qrcode` 生成真实二维码，二维码中不携带手机号或人员 ID。
- [x] 实现手机号查询、失败提示、重新查询和完成状态。
- [x] `jbxx` 改为单对象，不显示新增/删除。
- [x] 其余五组保持数组，可新增/删除多条记录。
- [x] 删除 `rzsjtz` 页面分组及提交字段。
- [x] 主表字段按白名单同步至 `jbxx`，仅非空值覆盖。
- [x] 所有子对象/数组记录提交前刷新 `hrmRzglId = detail.id`。
- [x] 请求体根节点直接提交聚合详情对象，不包装 `HrmRzglVO`。
- [x] 页面改为六个 Tab、员工摘要卡片、文字头像和固定提交按钮。
- [x] 去除协议区、进度文案及“保存并提交”。

## 当前实际 API 契约（重要）

> 当前代码是下列契约。不要根据早期讨论恢复为 `GET`、`editDetl` 或 `HrmRzglVO`。

| 场景 | 当前实现 | 响应/请求约定 |
|---|---|---|
| 查询详情 | `POST /ryManage/hrmRzgl/queryDetl?phone=${phone}` | 使用 `postAction`；读取 `res.success`、`res.message`、`res.result`；`res.result` 是直接聚合对象 |
| 保存资料 | `POST /ryManage/hrmRzgl/addZb` | 使用 `postAction`；请求体根节点为详情对象 |
| 上传附件 | `/sys/common/upload` | 当前字段渲染使用 `j-upload`，`biz-path="hrmRzglSupplement"` |
| 公开页面 | `/personnel/onboarding/supplement` | 位于权限精确白名单，不使用后台布局 |

提交体结构：

```json
{
  "id": "主表ID",
  "xm": "姓名",
  "jbxx": {
    "id": "已有子记录ID（如果接口返回）",
    "hrmRzglId": "主表ID"
  },
  "jyjl": [{ "id": "已有记录ID", "hrmRzglId": "主表ID" }],
  "gzll": [],
  "jtcy": [],
  "grfj": [],
  "gxsb": []
}
```

提交规则：

- `jbxx` 始终为对象；接口缺失时初始化 `{}`，随后写入 `hrmRzglId`。
- `jyjl、gzll、jtcy、grfj、gxsb` 始终为数组；空数组也提交。
- 已有记录保留接口返回的 `id`、创建信息等未展示字段。
- 新增数组记录只初始化 `{ hrmRzglId: detail.id }`，不伪造 `id` 或其他外键。
- 删除采用前端数组全量覆盖语义：从数组移除后，提交体中不再出现该记录。
- `buildSupplementPayload` 只深拷贝、删除下线/旧字段并刷新关联 ID，不再次执行主表到 `jbxx` 映射，避免覆盖用户查询后的编辑。
- 根节点不允许出现 `HrmRzglVO`。
- 根节点和页面均不保留 `rzsjtz`。

## 查询归一化数据流

`normalizeSupplementDetail(result)` 的当前流程：

1. 使用 `JSON.parse(JSON.stringify(result))` 深拷贝接口结果。
2. 删除根对象旧名称字段：`ssbm、gwmc、zjmc`。
3. 删除已下线结构 `rzsjtz`。
4. 保证 `jbxx` 为对象；非对象、数组或缺失时初始化 `{}`。
5. 保证 `jyjl、gzll、jtcy、grfj、gxsb` 为数组；缺失时初始化 `[]`。
6. 从根对象排除 `grfj、gxsb、gzll、jbxx、jtcy、jyjl、rzsjtz`，得到参与映射的主表字段。
7. 仅从主表提取白名单内的非空字段，覆盖 `jbxx` 对应字段。
8. 给 `jbxx` 和五组数组中每条记录写入 `hrmRzglId = detail.id`。

设计原因：

- 子表不参与主表映射，防止数组/子记录字段扩散进 `jbxx`。
- 只同步非空主表值，避免主表空值清除已有补充资料。
- 使用白名单，避免主表 `id、createTime、updateTime` 等系统字段覆盖 `jbxx.id`。
- 保存时不重复映射，保证用户在页面中编辑过的 `jbxx` 不被重置。

## 主表到 jbxx 映射

| 主表字段 | `jbxx` 字段 | 上下文 |
|---|---|---|
| `xm` | `name` | 员工姓名 |
| `sjh` | `phoneNumber` | 手机号/联系方式 |
| `sfzh` | `idCard` | 身份证号码 |
| `yx` | `email` | 邮箱 |
| `xz` | `salary` | 薪资，数字语义 |
| `xzlx` | `salaryType` | 薪资类型 |
| `yglx` | `employeeType` | 员工类型 |
| `gh` | `no` | 员工工号 |
| `yjrzsj` | `entryDate` | 预计/计划入职日期 |
| `sjrzsj` | `actualDate` | 实际到岗日期 |
| `htgs` | `constractBelong` | 合同归属；字段名沿用后端拼写 `constract` |
| `htlx` | `constractType` | 合同类型；字段名沿用后端拼写 `constract` |
| `rzzt` | `status` | 入职状态 |
| `zlzt` | `profileStatus` | 资料状态 |
| `rzfs` | `rzfs` | 入职方式，同名映射 |
| `companyId` | `companyId` | 公司真实 ID，同名映射 |
| `dept` | `dept` | 部门真实 ID，同名映射 |
| `postId` | `postId` | 岗位真实 ID，同名映射 |
| `postRank` | `postRank` | 职级真实 ID，同名映射 |

不参与映射：

- `id、createTime、updateTime、createBy、updateBy` 等系统字段。
- `gs` 等名称字段不会写入 ID 字段。
- 当前代码会从归一化结果和提交体根节点删除旧名称字段 `ssbm、gwmc、zjmc`。

## 主表只读展示字段（19 个）

来源上下文：`HrmRzglForm.vue` 的主表信息；显示在“基本信息”Tab 的“入职信息”卡片。

| 字段 | 标签 | 说明 |
|---|---|---|
| `gh` | 工号 | 同时映射到 `jbxx.no` |
| `xm` | 姓名 | 员工摘要和头像也使用该字段 |
| `sjh` | 手机号 | 同时映射到 `jbxx.phoneNumber` |
| `sfzh` | 身份证号 | 同时映射到 `jbxx.idCard` |
| `yx` | 邮箱 | 同时映射到 `jbxx.email` |
| `xz` | 薪资(k) | 同时映射到 `jbxx.salary` |
| `xzlx` | 薪资类型 | 同时映射到 `jbxx.salaryType` |
| `yglx` | 员工类型 | 同时映射到 `jbxx.employeeType` |
| `gs` | 公司 | 仅展示名称，不写入 `companyId` |
| `dept_dictText` | 所属部门 | 当前字典显示字段；员工摘要部门标签也使用它 |
| `postId_dictText` | 岗位名称 | 当前字典显示字段；员工摘要岗位也使用它 |
| `postRank_dictText` | 职级名称 | 当前字典显示字段 |
| `yjrzsj` | 预计入职时间 | 映射到 `jbxx.entryDate` |
| `rzfs` | 入职方式 | 同名映射 |
| `htgs` | 合同归属 | 映射到 `jbxx.constractBelong` |
| `htlx` | 合同类型 | 映射到 `jbxx.constractType` |
| `bz` | 备注 | 只读展示，不映射 |
| `rzzt` | 入职状态 | 映射到 `jbxx.status` |
| `zlzt` | 资料状态 | 映射到 `jbxx.profileStatus` |

## 六个 Tab 与字段上下文

Tab 顺序固定为：`jbxx → jyjl → gzll → jtcy → grfj → gxsb`。

### 1. 基本信息：`jbxx`（对象，74 个可编辑字段）

- 数据形态：对象。
- 不显示新增/删除按钮。
- 接口缺失时初始化 `{ hrmRzglId: detail.id }`。
- 已有 `jbxx.id` 是子记录 ID，不能被主表 `detail.id` 覆盖。
- 来源表单：`HrmRzglJbxxForm.vue`。

| 字段 | 标签 | 控件类型/上下文 |
|---|---|---|
| `name` | 员工姓名 | input；由主表 `xm` 非空覆盖初始值 |
| `gender` | 性别 | input |
| `birthDate` | 出生日期 | date |
| `mz` | 民族 | input |
| `jg` | 籍贯 | input |
| `idType` | 证件类型 | input |
| `idCard` | 身份证号码 | input；由主表 `sfzh` 映射 |
| `hjxz` | 户籍性质 | input |
| `hjdz` | 户籍地址 | input |
| `photo` | 员工照片 | upload |
| `zzmm` | 政治面貌 | input |
| `hyzk` | 婚姻状况 | input |
| `jkzk` | 健康状况 | input |
| `ywbs` | 以往病史 | input |
| `xqah` | 兴趣爱好 | input |
| `phoneNumber` | 联系方式 | input；由主表 `sjh` 映射 |
| `email` | 邮箱 | input；由主表 `yx` 映射 |
| `address` | 联系地址 | input |
| `jzd` | 居住地 | input |
| `zzdz` | 暂住地址 | input |
| `zsfs` | 住宿方式 | input |
| `dormitory` | 宿舍信息 | input |
| `card` | 员工卡号 | input |
| `no` | 员工工号 | input；由主表 `gh` 映射 |
| `employeeType` | 员工类型 | input；由主表 `yglx` 映射 |
| `companyId` | 所属公司 ID | input；主表同名真实 ID |
| `dept` | 所属部门 ID | input；主表同名真实 ID |
| `mainDept` | 主部门 | input |
| `postId` | 所属岗位 ID | input；主表同名真实 ID |
| `postRank` | 岗位职级 ID | input；主表同名真实 ID |
| `positionInfoId` | 岗位信息 ID | input |
| `gwbz` | 岗位备注 | input |
| `rzfs` | 入职方式 | input；主表同名映射 |
| `sourceTag` | 招聘计划 | input |
| `status` | 入职状态 | input；由主表 `rzzt` 映射 |
| `syq` | 试用期 | input |
| `entryDate` | 入职日期 | date；由主表 `yjrzsj` 映射 |
| `actualDate` | 实际到岗日期 | date；由主表 `sjrzsj` 映射 |
| `bdrq` | 报道日期 | datetime |
| `becomeType` | 转正类型 | input |
| `sjzzrq` | 计划转正日期 | date |
| `formalResignDate` | 正式离职日期 | date |
| `workYears` | 工作年限 | number |
| `entryDirector` | 入职负责人 | input |
| `mentor` | 导师姓名 | input |
| `profileStatus` | 资料状态 | input；由主表 `zlzt` 映射 |
| `informationId` | 个人信息 ID | input |
| `workLocation` | 工作厂区 / 位置 | input |
| `sfczjyxzxy` | 是否存在竞业限制协议 | input；这是业务字段，不等同于已移除的页面协议勾选区 |
| `constractBelong` | 合同归属 | input；由主表 `htgs` 映射，保留后端拼写 |
| `constractType` | 合同类型 | input；由主表 `htlx` 映射，保留后端拼写 |
| `contractStartDate` | 合同开始日期 | date |
| `contractExpDate` | 合同到期日期 | date |
| `salary` | 薪资(k) | number；由主表 `xz` 映射 |
| `salaryType` | 薪资类型 | input；由主表 `xzlx` 映射 |
| `gzkyhkh` | 银行卡号 | input |
| `gzkyh` | 工资卡银行 | input |
| `gzkkhh` | 工资卡开户行 | input |
| `socialSecurityStatus` | 社保状态 | input |
| `sbqk` | 社保情况 | input |
| `sbdnh` | 社保电脑号 | input |
| `stopSocialSecurityStatus` | 社保停缴状态 | input |
| `sbStartDate` | 首次社保缴纳日期 | date |
| `accumulationFundStatus` | 公积金状态 | input |
| `gjjqk` | 公积金情况 | input |
| `gjjdhh` | 公积金电脑号 | input |
| `stopAccumulationFundStatus` | 公积金停缴状态 | input |
| `gjjyhkh` | 公积金银行卡号 | input |
| `gjjyh` | 公积金银行 | input |
| `gjjkhyh` | 公积金开户银行 | input |
| `byyx` | 毕业院校 | input |
| `xl` | 学历 | input |
| `zy` | 专业 | input |
| `xw` | 学位 | input |

### 2. 教育经历：`jyjl`（数组，每条 9 个字段）

来源表单：`HrmRzglJyjlForm.vue`。支持新增、删除多条记录。

| 字段 | 标签 | 控件类型 |
|---|---|---|
| `xlcc` | 学历层次 | input |
| `byyxjg` | 毕业院校/机构 | input |
| `zy` | 专业 | input |
| `rxsj` | 入学时间 | date |
| `bysj` | 毕业时间 | date |
| `xw` | 学位 | input |
| `zsbh` | 证书编号 | input |
| `zypxnr` | 专业/培训内容 | input |
| `zsfj` | 证书附件 | upload |

### 3. 工作履历：`gzll`（数组，每条 9 个字段）

来源表单：`HrmRzglGzllForm.vue`。支持新增、删除多条记录。

| 字段 | 标签 | 控件类型 |
|---|---|---|
| `gzdw` | 工作单位 | input |
| `sshy` | 所属行业 | input |
| `rzgw` | 任职岗位 | input |
| `zzqssj` | 在职起始时间 | date |
| `zzjssj` | 在职结束时间 | date |
| `jbnpjgz` | 近半年平均工资(k) | number |
| `lzyy` | 离职原因 | input |
| `zmrxm` | 证明人姓名 | input |
| `zmrlxdh` | 证明人联系电话 | input |

### 4. 家庭成员：`jtcy`（数组，每条 5 个字段）

来源表单：`HrmRzglJtcyForm.vue`。支持新增、删除多条记录。

| 字段 | 标签 | 控件类型 |
|---|---|---|
| `xm` | 姓名 | input |
| `gx` | 关系 | input |
| `zw` | 职务 | input |
| `gzdw` | 工作单位 | input |
| `lxdh` | 联系电话 | input |

### 5. 个人附件：`grfj`（数组，每条 5 个字段）

来源表单：`HrmRzglGrfjForm.vue`。支持新增、删除多条记录。

| 字段 | 标签 | 控件类型 |
|---|---|---|
| `fjlx` | 证件类型 | input |
| `qdrq` | 取得日期 | date |
| `yxqjzr` | 有效期截止日 | date |
| `zsbm` | 证书编号 | input |
| `zsfj` | 证书附件 | upload |

### 6. 关系申报：`gxsb`（数组，每条 5 个字段）

来源表单：`HrmRzglGxsbForm.vue`。支持新增、删除多条记录。

| 字段 | 标签 | 控件类型 |
|---|---|---|
| `xm` | 姓名 | input |
| `gx` | 关系 | input |
| `bm` | 部门 | input |
| `gw` | 岗位 | input |
| `lxdh` | 联系电话 | input |

## 控件渲染规则

通用记录组件根据字段配置的 `type` 渲染：

| `type` | 控件 | 关键参数 |
|---|---|---|
| `input` 或缺省 | `a-input` | `v-model="record[item.key]"` |
| `number` | `a-input-number` | 宽度 100% |
| `date` | `j-date` | `YYYY-MM-DD` |
| `datetime` | `j-date` | `show-time`，`YYYY-MM-DD HH:mm:ss` |
| `upload` | `j-upload` | `biz-path="hrmRzglSupplement"` |

系统字段如 `id、hrmRzglId、createTime、createBy、updateTime` 不在字段配置中，因此页面不显示；但已有记录上的这些属性会在对象中保留并随全量提交发送。

## 页面状态与交互

- 初始状态：只显示白色导航栏和手机号查询卡片。
- 手机号校验：复用 `@/utils/rules` 中的 `rules.mobile`。
- 查询成功：隐藏查询卡片，显示欢迎卡、员工摘要、六个 Tab 和固定底部提交按钮。
- 查询失败/空结果：显示接口 `message` 或“未查询到对应的入职信息”。
- 重新查询：清空 `detail、completed、queryError、phone`，Tab 重置为 `jbxx`，滚动到顶部。
- 提交中：`submitting = true`，防止重复提交。
- 保存失败：保留当前 `detail`，允许重试。
- 保存成功：显示完成页“资料提交成功”。
- Tab 切换：通过 `activeTab` 控制，不销毁数据；默认 `jbxx`。
- 按钮文案：必须是“提交资料”。
- 页面禁止出现：杨侨科技、杨桥科技、保存并提交、协议勾选文案、完成进度百分比。

## 员工摘要与头像

- 欢迎文案：“欢迎加入强瑞技术”。
- 姓名：根对象 `xm`。
- 部门标签：当前使用 `dept_dictText`。
- 工号：根对象 `gh`。
- 岗位：当前使用 `postId_dictText`。
- `getAvatarText(record)`：先读取 `xm`，非空时返回最后两个字符；空值显示 `-`。
- 单字姓名返回单字；双字返回双字；多字只取最后两字。
- 参考实现：`EmployeeList.vue` 中的同名方法。

## 二维码与公开路由

- 路由：`/personnel/onboarding/supplement`。
- 路由名：`OnboardingSupplement`。
- 权限：`src/permission.js` 的精确白名单。
- 二维码：`QRCode.toDataURL`，宽 360、margin 2、纠错等级 M。
- URL：`this.$router.resolve({ name: 'OnboardingSupplement' })` 后以 `window.location.origin` 解析，适配当前域名和部署路径。
- 二维码不携带手机号或人员 ID。

## Working Files（功能文件）

- `D:\Project\qr-hrm\ant-design-vue-jeecg\src\views\PersonnelManagement\Personnel\onboardingSupplement\index.vue`：页面编排、查询、提交、Tab 状态。
- `D:\Project\qr-hrm\ant-design-vue-jeecg\src\views\PersonnelManagement\Personnel\onboardingSupplement\supplementFields.js`：字段配置、主表映射、归一化、提交体构造。
- `D:\Project\qr-hrm\ant-design-vue-jeecg\src\views\PersonnelManagement\Personnel\onboardingSupplement\components\SupplementGroup.vue`：通用对象/数组记录表单渲染。
- `D:\Project\qr-hrm\ant-design-vue-jeecg\src\views\PersonnelManagement\Personnel\onboardingSupplement\components\SupplementEmployeeCard.vue`：欢迎卡、员工摘要、文字头像。
- `D:\Project\qr-hrm\ant-design-vue-jeecg\src\assets\less\onboardingSupplement.less`：移动端卡片、Tab、表单行和固定底栏样式。
- `D:\Project\qr-hrm\ant-design-vue-jeecg\src\views\PersonnelManagement\Personnel\onboarding\modules\OnboardingQrModal.vue`：二维码生成弹窗。
- `D:\Project\qr-hrm\ant-design-vue-jeecg\src\config\router.config.js`：公开路由。
- `D:\Project\qr-hrm\ant-design-vue-jeecg\src\permission.js`：免登录白名单。
- `D:\Project\qr-hrm\ant-design-vue-jeecg\package.json`、`package-lock.json`、`yarn.lock`：`qrcode` 依赖及锁文件。

## Reference Files（只读参考）

- `D:\Project\qr-hrm\ant-design-vue-jeecg\src\views\PersonnelManagement\Personnel\onboarding\modules\HrmRzglForm.vue`：主表字段参考。
- `D:\Project\qr-hrm\ant-design-vue-jeecg\src\views\PersonnelManagement\Personnel\forms\hrm_rzgl_jbxx\modules\HrmRzglJbxxForm.vue`：基本信息字段参考。
- `D:\Project\qr-hrm\ant-design-vue-jeecg\src\views\PersonnelManagement\Personnel\forms\hrm_rzgl_jyjl\modules\HrmRzglJyjlForm.vue`：教育经历字段参考。
- `D:\Project\qr-hrm\ant-design-vue-jeecg\src\views\PersonnelManagement\Personnel\forms\hrm_rzgl_gzll\modules\HrmRzglGzllForm.vue`：工作履历字段参考。
- `D:\Project\qr-hrm\ant-design-vue-jeecg\src\views\PersonnelManagement\Personnel\forms\hrm_rzgl_jtcy\modules\HrmRzglJtcyForm.vue`：家庭成员字段参考。
- `D:\Project\qr-hrm\ant-design-vue-jeecg\src\views\PersonnelManagement\Personnel\forms\hrm_rzgl_grfj\modules\HrmRzglGrfjForm.vue`：个人附件字段参考。
- `D:\Project\qr-hrm\ant-design-vue-jeecg\src\views\PersonnelManagement\Personnel\forms\hrm_rzgl_gxsb\modules\HrmRzglGxsbForm.vue`：关系申报字段参考。
- `D:\Project\qr-hrm\ant-design-vue-jeecg\src\views\peoplemanagement\employeeInfo\modules\EmployeeList.vue`：头像文字截取参考。
- `D:\weixinfile\xwechat_files\wxid_uqv7wx4uovat22_c25a\msg\file\2026-07\入职资料补充_移动端.html`：移动端布局参考，不是项目运行文件。

## Dependencies

- 新增运行依赖：`qrcode@^1.5.4`。
- 技术栈：Vue 2.6、ant-design-vue 1.7、Vue Options API、Less。
- 当前 Node 版本运行旧 webpack/Terser 时，`npm run build:test` 可能出现 `ERR_OSSL_EVP_UNSUPPORTED`；验证命令使用：

```powershell
$env:NODE_OPTIONS='--openssl-legacy-provider'
npm run build:test
```

该参数只用于当前命令进程，不应通过修改全局配置掩盖编译错误。

## Last Validation

在移动端 Tab 重构完成时已验证：

- `eslint --no-ignore` 定向检查通过。
- 字段映射、`jbxx` 对象、关联 ID、无 `HrmRzglVO`、无 `rzsjtz` 的断言通过。
- 头像单字、双字、多字和空姓名断言通过。
- Tab 切换后表单输入保持不变。
- 浏览器真实视口：375px 无横向溢出，内容宽 351px；768px 和 1280px 内容最大宽度 720px；每次只有一个活动 Tab。
- `build:test` 在 legacy OpenSSL 参数下成功，项目仍输出既有 CSS 顺序 warning。

注意：上述验证之后，当前工作树又出现了 `dept_dictText/postId_dictText/postRank_dictText`、删除旧根字段等改动。新会话继续开发前，应重新运行定向 ESLint、契约断言和构建。

## Current Dirty Worktree Warning

生成本文件时工作区存在未提交改动，包括但不限于：

- `.env.development`
- `package-lock.json`、`yarn.lock`
- `src/views/PersonnelManagement/Personnel/onboarding/index.vue`
- `src/views/PersonnelManagement/Personnel/onboarding/modules/HrmRzglForm.vue`
- `src/views/PersonnelManagement/Personnel/onboarding/modules/OnboardingAdjustModal.vue`
- `src/views/PersonnelManagement/Personnel/onboarding/modules/OnboardingCancelModal.vue`
- `src/views/PersonnelManagement/Personnel/onboardingSupplement/components/SupplementEmployeeCard.vue`
- `src/views/PersonnelManagement/Personnel/onboardingSupplement/supplementFields.js`
- `test.http`

这些改动视为用户或其他工具的进行中工作。新会话必须先执行：

```powershell
git status --short
git diff -- <准备修改的具体文件>
```

不要使用 `git reset --hard`、`git checkout --` 或覆盖式重写来清理它们。

## Decisions

- `jbxx` 是单对象：业务上只有一份基本资料，因此不允许新增/删除。
- 五个子表是数组：保留多记录新增、编辑和删除。
- 请求体无包装层：后端当前直接接收聚合详情对象。
- 关联 ID 前端强制刷新：确保已有和新增子记录均关联当前主表。
- 主表映射只在查询归一化阶段执行：保护用户后续编辑。
- `rzsjtz` 已下线：查询和提交均删除，但根对象其他普通字段是否保留以当前代码为准。
- 页面只读字段显示接口原值/字典文本，不主动做隐私脱敏。
- 不显示进度：当前没有可靠的必填字段口径。
- 不显示协议区：用户明确要求删除。
- UI 使用 Tab：单次只展示一个资料分组，降低移动端纵向认知负担。

## Known Issues / Follow-up Checks

- `SupplementGroup.vue` 当前模板使用 `<j-upload>`，但局部 import/register 的组件名是 `JUploadList`。项目可能依赖全局 `j-upload` 注册；上传功能继续修改前应做真实运行验证，不要仅凭命名推断替换。
- 后端必须匿名开放查询、保存和上传接口，并负责手机号防枚举、频率限制、文件类型/大小及存储安全；前端仓库无法保证这些安全边界。
- 页面按既定产品选择显示未脱敏信息，存在隐私暴露风险；不要在日志、测试文档或新会话上下文中复制真实人员数据。
- `postAction` 表示查询实际为 POST；早期需求文字中的 GET 已过期。
- 保存实际地址为 `/ryManage/hrmRzgl/addZb`；早期计划中的 `/editDetl` 已过期。
- 当前根对象会删除 `ssbm、gwmc、zjmc`，摘要改用字典文本字段。若后端仍依赖这些旧字段，必须先确认真实接口契约再调整。

## Pending

- 功能计划本身无明确未完成项。
- 若继续开发，第一步是对当前最新工作树重新验证，尤其是字典显示字段和旧根字段删除逻辑。

