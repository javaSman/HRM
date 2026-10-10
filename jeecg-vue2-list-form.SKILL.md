---
name: jeecg-vue2-list-form
description: Build or modify Vue 2 JEECG / ant-design-vue 1.x management modules that should follow the HrKqRuleList-style list + modal + form pattern. Use when implementing pages with a-table pagination, JeecgListMixin, query/import/export/delete actions, modalForm refs, a-form-model forms, and JEECG API helpers in this repository.
---

# JEECG Vue2 List Form

## Core Workflow

When building a new module, first inspect at least three nearby `src/views/**` pages and follow the closest local pattern. Prefer the `HrKqRuleList.vue` structure when the user asks for this style.

Use this three-file shape by default:

- `XxxList.vue`: list page, table, toolbar, query area, columns, url config
- `modules/XxxModal.vue`: `j-modal` or existing drawer shell
- `modules/XxxForm.vue`: actual `a-form-model` form and submit logic

Do not introduce new abstractions unless the existing module pattern cannot handle the requirement.

## List Page Pattern

Use:

```js
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import XxxModal from './modules/XxxModal.vue'

export default {
  name: 'XxxList',
  mixins: [JeecgListMixin, mixinDevice],
  components: { XxxModal }
}
```

The template should keep the JEECG structure:

- `<a-card :bordered="false">`
- `.table-page-search-wrapper`
- `.table-operator`
- `<j-super-query ref="superQueryModal" :fieldList="superFieldList" @handleSuperQuery="handleSuperQuery" />`
- selected-row alert using `selectedRowKeys.length`
- `<a-table ref="table" ... @change="handleTableChange">`
- `<xxx-modal ref="modalForm" @ok="modalFormOk" />`

Bind `a-table` exactly to mixin state unless there is a concrete reason not to:

```vue
<a-table
  ref="table"
  size="middle"
  :scroll="{ x: true }"
  bordered
  rowKey="id"
  :columns="columns"
  :dataSource="dataSource"
  :pagination="ipagination"
  :loading="loading"
  :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
  class="j-table-force-nowrap"
  @change="handleTableChange"
/>
```

## Mixin Contract

`JeecgListMixin` provides the public list behavior. Do not redeclare these unless customizing intentionally:

- `queryParam`
- `dataSource`
- `ipagination`
- `isorter`
- `filters`
- `loading`
- `selectedRowKeys`
- `selectionRows`
- `superQueryParams`
- `superQueryMatchType`

Use its methods:

- `loadData`
- `searchQuery`
- `searchReset`
- `handleTableChange`
- `onSelectChange`
- `onClearSelected`
- `handleAdd`
- `handleEdit`
- `handleDetail`
- `handleDelete`
- `batchDel`
- `modalFormOk`
- `handleExportXls`
- `handleImportExcelNew`

The list page must define:

```js
url: {
  list: '/xxx/list',
  delete: '/xxx/delete',
  deleteBatch: '/xxx/deleteBatch',
  exportXlsUrl: '/xxx/exportXls',
  importExcelUrl: 'xxx/importExcel',
  importExcelUrlNewName: 'TableName'
}
```

## Columns

Define `columns` in `data()`. Use project conventions:

- `align: "center"`
- dictionary display fields as `xxx_dictText`
- action column fixed right when needed
- action slot via `scopedSlots: { customRender: 'action' }`
- use `a-tag` for status/type/priority fields
- use `a-tooltip` only for genuinely long text

Keep action slot consistent:

```vue
<span slot="action" slot-scope="text, record">
  <a @click="handleEdit(record)">编辑</a>
  <a-divider type="vertical" />
  <a-dropdown>
    <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
    <a-menu slot="overlay">
      <a-menu-item><a @click="handleDetail(record)">详情</a></a-menu-item>
      <a-menu-item>
        <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
          <a>删除</a>
        </a-popconfirm>
      </a-menu-item>
    </a-menu>
  </a-dropdown>
</span>
```

## Modal Pattern

`XxxModal.vue` should only manage visibility, title, disabled state, and delegate form work.

Required methods:

- `add()`
- `edit(record)`
- `close()`
- `handleOk()`
- `submitCallback()`
- `handleCancel()`

The modal calls:

```js
this.$refs.realForm.add()
this.$refs.realForm.edit(record)
this.$refs.realForm.submitForm()
```

On form success, emit `ok` and close.

## Form Pattern

Use `j-form-container` + `a-form-model`.

Form state should include:

- `model`
- `modelDefault` when useful
- `confirmLoading`
- `validatorRules`
- `url: { add, edit }`

Use `httpAction` from `@/api/manage` for add/edit submits.

Required methods:

- `add()`
- `edit(record)`
- `submitForm()`
- `getSubmitPayload()` when payload transformation is needed

Use `this.$refs.form.validate(valid => { ... })`, set `confirmLoading`, call `httpAction`, show `$message.success` or `$message.warning`, then emit `ok`.

## Guardrails

Preserve Chinese text and file encoding. Avoid broad normalization wrappers unless the API shape proves they are needed. Keep edits scoped to the new module. Reuse JEECG helpers, components, dictionary conventions, and nearby page CSS imports before adding anything new.



  

        “不是没表示，我刚刚是在想怎么回你。你说的我懂，也认同。感情不应该靠身体来证明，更不应该让女生一个人承担后果。我喜欢你是因为你这个人，不是为了别的，所以你的想法和边界我都会尊重。以后我们相处，有什么想法可以直接说，我不会逼你，也希望我们是互相认真、互相付出的关系。”

        这种情况下 不要直接说“想做”，她刚刚已经在表达边界了，你直接说会显得只惦记身体。

你可以这样说，既诚实又不冒犯：

“我不装，我对你有喜欢，也会有正常的亲密冲动。但我不会把这种事当成证明爱你的方式，更不会逼你。你不愿意的时候，我一定尊重你。比起发生什么，我更想让你觉得跟我在一起是安全的。”

再温柔一点：

“我当然会想和喜欢的人更亲近，但前提一定是你也愿意、也安心。你有你的原则，我尊重。喜欢你不是为了得到什么，我更希望我们慢慢来。”

如果她问你“那你到底想不想”，可以回：

“想亲近你是真的，但尊重你也是真的。我不会因为想，就让你为难。”

这句话比较关键：承认欲望，但不施压。
千万别回“想啊”“那你不给我吗”“情侣不做正常吗”这种，会直接踩雷


