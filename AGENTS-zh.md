# AGENTS-zh.md

本文档为在此仓库中工作的 Codex 和其他编码代理提供指引。

## 项目背景

- 这是一个基于 JEECG / ant-design-vue 1.x 的 Vue 2 项目。
- 优先沿用现有的 JEECG 页面模式，而不是引入新的抽象。
- 列表页通常使用 `src/mixins/JeecgListMixin.js`，并包含：
  - `mixins: [JeecgListMixin, mixinDevice]`
  - 在 `data()` 中定义 `columns`
  - `url` 对象中包含 `list`、`delete`、`deleteBatch`、`exportXlsUrl`、`importExcelUrl`
  - `modalForm` 的 `ref` 以及 `modalFormOk`
  - `searchQuery`、`searchReset`、`loadData`、`handleTableChange`、`onSelectChange`
- 如果要新增列表功能，先检查 `src/views/**` 下 3 个以上相似页面，并遵循最接近的本地模式。

## 核心原则

- 做小步、可测试、可验证的改动。
- 匹配项目现有的导入风格、命名规范、组件结构和格式。
- 优先选择朴素、直接的实现，而不是花哨的抽象。
- 保持每个函数只关注单一职责。
- 避免无关的重构、格式清理和大范围改写。
- 将所有现有未提交改动视为来自其他工具或开发者的有意进行中的工作。
- 不要把中文字符改成编码格式
- 生成的函数要增加注释

## 功能开发

- 在现有代码路径和页面模式之上扩展新功能。
- 除非任务明确要求，否则不要重写旧的兼容逻辑。
- 不要仅仅为了让新功能看起来更干净，就改变历史行为。
- 如果现有兼容代码仍在支持已部署行为，就应保留它。
- 对于 JEECG 列表页，在引入新流程之前，优先扩展现有的 `columns`、`url`、查询表单、action 插槽、弹窗组件或 mixin 钩子。
- 优先复用 `@/api/manage`、`@/utils`、`@/components` 和项目 mixin 中已有的辅助方法，再考虑新增工具。

## 防御式编程

- 不要过度使用防御式编程。
- 不要封装过多函数来获取form的key
- 当前页面已经明确数据结构时，不要再加 `normalizeXxx`、大而全的兜底映射或兼容包装；直接按真实字段赋值，让数据流保持直观。
- 只有在确实能防护项目现有流程中的真实故障模式时，才添加保护性判断。
- 避免过多的空值检查、兜底分支、包装函数，或掩盖正常错误的通用 try-catch。
- 在现有 UI 模式已经这样处理的地方，保持错误处理清晰且面向用户，例如使用 `$message`、`$warning`、`$error`，或现有的 API 响应检查。
- 不要为了假设中的旧数据结构引入大范围兼容层，除非当前代码或 API 响应中已有证据表明需要。

## Vue / UI 约定

- 使用项目中已经存在的 Vue 2 Options API 模式。
- 一致地使用 ant-design-vue 组件和 JEECG 组件。
- 保持模板与附近页面对齐：查询区域、操作区域、表格区域、弹窗 `ref` 和作用域插槽。
- 如果同类页面已经在使用，就沿用现有的 CSS 引入，例如 `@/assets/less/TableExpand.less` 和 `~@assets/less/common.less`。
- 表格操作列遵循现有的 `slot="action"` 与 `a-dropdown` / `a-popconfirm` 模式。
- 对于字典字段，优先沿用已有的 `j-dict-select-tag`、`dictCode` 和 `_dictText` 列约定。

## 文件编码与现有文本

- 保持现有文件编码和换行格式不变。
- 某些旧文件在部分终端中可能会显示中文乱码；不要只是为了修复显示问题就大规模重写文本。
- 编辑旧的 Vue 文件时，保持变更范围最小，不要顺带重排无关的中文标签或注释。


## Git 安全

- 只暂存或提交当前任务直接产出的文件。
- 使用 `git add <specific-file>`，不要使用 `git add .`。
- 绝不要覆盖或回退无关的未提交改动。
- 如果当前任务与现有未提交改动冲突，停止操作并报告冲突，不要猜测处理方式。

## 搜索与编辑

- 如果有可用的语义化 / 项目感知工具，优先使用它们。
- 否则使用 `rg` / `rg --files` 进行搜索。
- 常规编辑使用 `apply_patch`。
- 避免使用基于 shell 的大规模编辑，除非改动是机械性的且易于验证。
