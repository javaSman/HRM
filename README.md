# qr-hrm 前端项目说明

> 📍 [🏠 项目总览](../README.md) / **前端文档** · 另见 [后端文档](../jeecg-boot/README.md)

## 项目概览

`qr-hrm` 是一个基于 **JEECG Boot Vue2 前端脚手架** 定制的后台管理项目，当前代码主体采用 **Vue 2 + Ant Design Vue 1.x** 技术路线，面向 PC 端业务管理场景。

从仓库现状看，这个项目具备以下特点：

- 前后端分离，接口前缀围绕 `/qr-hrm` 配置
- 登录后按后端返回的菜单数据动态生成路由
- 使用 JEECG 常见的列表页、弹窗表单、字典组件、上传组件等页面模式
- 支持 `token` 鉴权、租户头、接口签名
- 保留了 CAS 单点登录和 qiankun 微前端接入能力
- 包含人员、打卡、排班、内容审核、图层、数据日志、API 模板等定制业务模块

> 说明：实际菜单展示以服务端返回的权限树为准，README 中的模块信息主要根据当前仓库的 `src/views` 目录和已有页面文件整理。

## 业务功能文档索引

各业务页面目录下附带了功能说明文档，按领域归类如下（点击进入；每篇顶部可返回本页）：

**考勤打卡**
- [打卡管理](./src/views/attendance-check/check-management/打卡管理.md)
- [打卡记录](./src/views/attendance-check/check-record/打卡记录.md)
- [打卡管理（clockInManagement）](./src/views/clockInManagement/打卡管理.md)

**排班 / 规则 / 异常**
- [排班管理](./src/views/shiftManagement/排班管理.md)
- [考勤规则](./src/views/attendanceRule/settingPage/考勤规则.md)
- [异常考勤记录](./src/views/abnormal-attendance/abnormal-attendance-record/异常考勤记录.md)

**请假 / 调休 / 补卡 / 外勤**
- [请假申请审批](./src/views/leave-management/leave-approval/请假申请审批.md)
- [假期管理](./src/views/leave-management/holiday-management/假期管理.md)
- [调休管理](./src/views/compensatory-leave/compensatory-leave-management/调休管理.md)
- [补卡管理](./src/views/reissue-card/reissue-card-management/补卡管理.md)
- [外勤维护](./src/views/field-work/field-work-maintenance/外勤维护.md)

**人员 / 岗位**
- [人员信息](./src/views/peoplemanagement/employeeInfo/人员信息.md)
- [岗位信息](./src/views/peoplemanagement/jobInfo/岗位信息.md)

**系统配置 / 设备**
- [考勤设备管理](./src/views/system-config/attendance-device/考勤设备管理.md) —— 后端对接见 [zt-device 模块文档](../jeecg-boot/jeecg-boot-module/zt-device/README.md)
- 🛠️ [门禁人员接口调试台](./public/access-control-debug.html)（纯 HTML 联调工具，`npm run dev` 后访问 `http://localhost:3000/access-control-debug.html`；门禁 A4 接口见 [zt-device 文档第 10 节](../jeecg-boot/jeecg-boot-module/zt-device/README.md)）

## 技术栈

| 分类 | 采用技术 |
| --- | --- |
| 核心框架 | Vue 2.6.10、Vue Router 3、Vuex 3 |
| UI 框架 | Ant Design Vue 1.7.2 |
| 工程化 | Vue CLI 3、Webpack、Babel、ESLint、Less |
| JEECG 能力 | `@jeecg/antd-online-mini`、JEECG 通用列表/表单/字典/上传组件 |
| 网络请求 | Axios 0.21.x |
| 图表与可视化 | ECharts 5.4.2、Viser Vue、`@antv/data-set` |
| 表格能力 | `vxe-table`、`vxe-table-plugin-antd` |
| 富文本与文档 | Tinymce、Toast UI Editor、Markdown-it、KaTeX、CodeMirror |
| 文件与媒体 | `vue-simple-uploader`、`vue-photo-preview`、`jszip` |
| 组织/区域组件 | `vue2-org-tree`、`vue-area-linkage` |
| 微前端/集成 | qiankun、CAS SSO |
| 其他常用依赖 | `jsencrypt`、`md5`、`dayjs`、`moment`、`lodash-es` |

## 通用组件说明

### JSelectRecruitmentPost

`JSelectRecruitmentPost` 是招聘模块复用的岗位名称下拉组件，已在 `src/components/jeecg/index.js` 中全局注册，模板中可直接使用 `<j-select-recruitment-post />`。

默认接口为 `/zpManage/hrmYrsq/getChildSequences`，组件会按 `deptId` 查询岗位；当 `deptId` 为空时按 `deptId=0` 查询。

常用写法：

```vue
<j-select-recruitment-post
  v-model="queryParam.postId"
  :dept-id="queryParam.dept"
  value-field="id"
  placeholder="请选择岗位名称"
  @change="handlePostChange"
/>
```

主要参数：

| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `value` / `v-model` | 当前选中岗位值 | `''` |
| `dept-id` | 所属部门 ID | `''` |
| `url` | 岗位查询接口 | `/zpManage/hrmYrsq/getChildSequences` |
| `value-field` | 下拉值字段 | `id` |
| `label-field` | 下拉显示字段 | `postName` |
| `fallback-value` | 编辑回显时兜底选项值 | `''` |
| `fallback-label` | 编辑回显时兜底选项文本 | `''` |
| `load-when-empty` | 部门为空时是否加载 `deptId=0` | `true` |

事件：

| 事件 | 说明 |
| --- | --- |
| `change(value, row, rows)` | 选择岗位后触发，返回选中值、选中岗位原始行、当前岗位列表 |
| `loaded(rows)` | 岗位列表加载完成后触发 |
| `loading(boolean)` | 岗位列表加载状态变化时触发 |

## 启动与构建

### 依赖安装

仓库里提供了一个带镜像兜底的安装脚本：

```bash
npm run pre
```

也可以直接使用：

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

补充说明：

- 默认开发端口：`3000`
- `vue.config.js` 中开发代理会将 `/qr-hrm` 请求转发到后端服务
- 如果本地 Node/OpenSSL 版本兼容性有问题，可以使用：

```bash
npm run serve
```

### 构建命令

```bash
npm run build:test
npm run build
npm run lint
```

### 构建产物

当前项目的构建输出目录不是默认的 `dist/`，而是：

```text
qr-hrmHome/
```

## 环境变量

当前仓库中用到的主要环境变量如下：

| 变量名 | 作用 |
| --- | --- |
| `VUE_APP_API_BASE_URL` | 后端 API 基地址 |
| `VUE_APP_CAS_BASE_URL` | CAS 单点登录地址 |
| `VUE_APP_ONLINE_BASE_URL` | 在线预览服务地址 |
| `VUE_APP_BLMAP_BASE_URL` | 地图页面基础地址 |
| `VUE_APP_TITLE` | 页面标题 |
| `VUE_APP_SSO` | 是否启用 CAS 单点登录 |

配置生效顺序大致为：

1. `public/index.html` 注入的 `window._CONFIG`
2. `.env.*` 环境变量
3. 代码中的历史回退值

其中：

- `src/config/index.js` 会把环境配置挂到 `window._CONFIG`
- `src/utils/request.js` 中接口基础路径还保留了历史回退值 `"/ztsis"`

因此部署前建议统一确认接口前缀，避免运行时配置和历史默认值不一致。

## 目录结构

```text
.
├─ public/                  静态资源、运行时注入配置、地图脚本
├─ qr-hrmHome/              构建输出目录
├─ src/
│  ├─ api/                  接口封装
│  ├─ assets/               样式、图片、Less 资源
│  ├─ cas/                  CAS 单点登录逻辑
│  ├─ components/           通用组件、JEECG 组件、布局组件
│  ├─ config/               域名/标题等运行时配置
│  ├─ mixins/               JeecgListMixin 等页面混入
│  ├─ qiankun/              微前端注册与全局状态
│  ├─ router/               Vue Router 入口
│  ├─ store/                Vuex 模块
│  ├─ utils/                request、权限、工具方法
│  └─ views/                页面与业务模块
├─ .env.development         开发环境变量
├─ .env.production          生产环境变量
├─ vue.config.js            构建、代理、别名、输出目录配置
├─ Dockerfile               Nginx 镜像模板
└─ AGENTS.md                仓库协作与编码规范
```

## 运行机制

### 1. 动态路由与权限

- `src/router/index.js` 使用 `history` 模式
- 静态路由仅保留登录、404、测试页等基础入口
- 登录后，`src/store/modules/user.js` 会调用权限接口获取菜单树
- `src/permission.js` 使用 `generateIndexRouter` 动态生成业务路由并注入到应用

这意味着：

- 页面目录很多，但最终是否出现在菜单里由后端权限控制
- README 里的模块梳理适合做代码导航，不等同于线上最终菜单

### 2. 请求封装

`src/utils/request.js` 是统一请求入口，主要做了这些事情：

- 自动注入 `X-Access-Token`
- 自动注入 `tenant-id`
- GET 请求增加时间戳参数，减少缓存干扰
- 统一处理 `401/403/404/500/504`
- 对部分接口补充 `X-Sign`、`X-TIMESTAMP` 签名头

### 3. 登录与会话

- 支持普通账号登录、手机号登录、第三方登录
- `src/cas/sso.js` 提供 CAS 单点登录流程
- Token、用户信息、字典缓存等数据存放在 `vue-ls`

### 4. 微前端与外部集成

- `src/qiankun/` 下保留了 qiankun 注册逻辑
- `public/index.html` 引入了外部地图脚本 `aimap-gl`
- 项目中还集成了在线预览、图片预览、上传、大文件上传、组织树等能力

## 主要模块概览

下面的模块信息按 `src/views` 现有目录整理，方便快速熟悉代码。

### 平台基础模块

| 模块目录 | 代表页面 | 说明 |
| --- | --- | --- |
| `src/views/system` | `UserList.vue`、`RoleList.vue`、`DictList.vue`、`DepartList.vue`、`QuartzJobList.vue` | 系统管理核心模块，覆盖用户、角色、部门、字典、租户、公告、日志、数据源、网关路由、定时任务等 |
| `src/views/modules` | `message/*`、`monitor/*`、`oss/OSSFileList.vue` | 平台级扩展模块，包括站内消息、系统监控、对象存储文件管理 |
| `src/views/user` | `Login`、`Register`、`Alteration` | 登录注册与用户入口页 |
| `src/views/jeecg` | 多个演示/组件页面 | JEECG 示例页面与通用能力演示，适合作为页面实现参考 |

### 业务模块

| 模块目录 | 代表页面 | 说明 |
| --- | --- | --- |
| `src/views/peoplemanagement` | `peopleAll.vue`、`ldbz.vue`、`YzzwCjbmbList.vue` | 人员相关模块，包含人员总览、台账类页面及若干表单/弹窗 |
| `src/views/clockInManagement` | `clockIn/index.vue` | 打卡管理 |
| `src/views/shiftManagement` | `scheduling/index.vue` | 排班管理 |
| `src/views/contentManagement` | `auditCenter/pendingReview/list.vue`、`reviewed/list.vue` | 内容审核中心，区分待审核与已审核 |
| `src/views/dataManage` | `dataLogs/index.vue` | 数据日志、接口请求记录管理 |
| `src/views/layerManage` | `ZtLayerList.vue`、`ZtUserLayerList.vue` | 图层与图层权限配置，偏地图/空间数据管理 |
| `src/views/apiUserManage` | `apiTemplate/index.vue` | API 模板管理 |
| `src/views/newRO` | `newRoList.vue`、`OrgStructureTree.vue`、`PersonnelList.vue` | 新组织/人员相关页面，带树形组织结构和人员列表 |
| `src/views/information` | `index.vue` | 独立信息页或外部入口页 |
| `src/views/superQuery` | `ZtTjInfoList.vue` | 综合查询/高级查询相关页面 |
| `src/views/echartsTemplate` | `ZtEchartsTemplateList.vue` | 图表模板管理 |
| `src/views/sms` | `ZtSysSmsList.vue` | 短信记录或短信配置管理 |
| `src/views/variableRescord` | `SysVariableRecordList.vue` | 变量记录管理 |
| `src/views/resultMenu` | `resultMenuList.vue`、`routeMenu.vue`、`userMenuList.vue` | 菜单结果展示、路由菜单配置相关页面 |
| `src/views/ai` | `aiView.vue` | AI 相关页面入口 |

## 页面实现风格

这个仓库整体上延续了 JEECG Vue2 的典型实现方式，常见模式包括：

- 列表页使用 `JeecgListMixin`
- `data()` 中定义 `columns`、`url`、查询条件、分页状态
- 使用 `modalForm` / `modalFormOk` 维护弹窗表单
- Excel 导入导出通过统一上传/下载逻辑处理
- 页面旁路能力通过通用组件和 mixin 复用

如果需要新增业务列表页，优先参考：

- `src/views/system/*`
- `src/views/layerManage/*`
- `src/views/contentManagement/*`
- `src/views/peoplemanagement/*`

## 开发注意事项

### 1. Dockerfile 需要按当前项目校正

仓库中的 `Dockerfile` 仍然保留了较明显的 JEECG 默认设置：

- 使用 `dist/` 作为构建输出目录
- 反向代理目标是 `/jeecg-boot`

而当前项目实际配置是：

- 输出目录：`qr-hrmHome/`
- 前端代理前缀：`/qr-hrm`

如果要直接用于本项目部署，建议先同步修改 Dockerfile 和 Nginx 配置。

### 2. 运行时配置与历史配置并存

项目同时存在：

- `.env.*` 环境变量
- `window._CONFIG` 运行时注入
- 历史默认路径回退值

上线前最好统一梳理一遍真实生效路径，尤其是 API、CAS、在线预览和地图相关地址。

### 3. History 路由需要服务端兜底

由于项目启用了 `history` 路由模式，Web 服务器需要把未知前端路径回退到 `index.html`。

## 推荐阅读入口

如果要继续熟悉这个项目，建议按下面顺序阅读：

1. `package.json`
2. `vue.config.js`
3. `src/main.js`
4. `src/config/index.js`
5. `src/permission.js`
6. `src/utils/request.js`
7. `src/store/modules/user.js`
8. `src/views/system/` 和目标业务模块目录

---

如需继续补充，我比较建议下一步再整理两份文档：

1. `docs/module-map.md`：按接口、页面、组件把业务模块展开
2. `docs/deployment.md`：把环境变量、Nginx、Docker、后端联调方式单独写清楚
