# Offer管理

## 功能说明

管理Offer的发起、审批和确认，跟踪候选人Offer状态并支持催签和发起入职。

## 页面路径

`Recruitment/offer/index.vue`

## columnCode

`HrmOffergl`

## 状态定义

```javascript
const STATUS_MAP = {
  审批中: { text: '审批中', color: 'orange' },
  待确认: { text: '待确认', color: 'blue' },
  已确认: { text: '已确认', color: 'green' },
  审批拒绝: { text: '审批拒绝', color: 'red' },
  已拒绝: { text: '已拒绝', color: '' },
  已放弃: { text: '已放弃', color: '' }
}
```

## 列定义

| 列名 | dataIndex | 宽度 | 说明 |
|------|-----------|------|------|
| 状态 | zt | 100 | Offer状态 |
| 姓名 | xm | 130 | 候选人姓名 |
| 联系方式 | lxfs | 130 | 手机号码 |
| 所属部门 | deptPath | 140 | 部门路径（支持tooltip） |
| 岗位名称 | postName | 160 | 岗位名称（支持tooltip） |
| 职级名称 | levelName | 120 | 职级 |
| 最晚回复时间 | zwhfsj | 160 | 最晚回复时间 |
| 薪资(K) | xz | 100 | 薪资（单位：K） |
| 招聘计划ID | zpjhid | 130 | 关联的招聘计划ID |
| 审批人 | sqr | 140 | 审批人（支持tooltip） |
| 抄送人 | csr | 140 | 抄送人（支持tooltip） |

## 查询条件

- 姓名（文本输入）
- 所属部门（部门选择器）
- 岗位名称（岗位选择器，联动部门）
- 招聘计划ID（文本输入）

## 操作按钮

- 发起Offer
- 导出
- 导入
- 高级查询
- 批量删除
- 字段配置

## 行操作

### 通用操作

- 详情
- 编辑

### 审批中状态

- 审批

### 待确认状态

- 催签
- 已放弃

### 已确认状态

- 发起入职

## 核心方法

### 发起Offer

```javascript
handleAdd() {
  this.$refs.modalForm.add()
}
```

### 编辑Offer

```javascript
handleEdit(record) {
  this.fetchRecord(record).then(detail => {
    this.$refs.modalForm.edit(detail)
  })
}
```

### 查看详情

```javascript
handleDetail(record) {
  this.fetchRecord(record).then(detail => {
    this.$refs.detailModal.open(detail)
  })
}
```

### 审批Offer

```javascript
handleApprove(record) {
  this.fetchRecord(record).then(detail => {
    this.$refs.approveModal.open(detail)
  })
}

handleApproveOk({ action, record }) {
  this.updateRecordStatus(record, action === 'approve' ? '待确认' : '审批拒绝')
}
```

### 催签

```javascript
handleRemind(record) {
  this.$message.success('已向 ' + (record.xm || '-') + ' 发送催签提醒')
}
```

### 放弃Offer

```javascript
handleAbandon(record) {
  this.updateRecordStatus(record, '已放弃')
}
```

### 发起入职

```javascript
handleOnboard(record) {
  this.$message.success('已为 ' + (record.xm || '-') + ' 发起入职流程')
}
```

### 获取记录详情

```javascript
fetchRecord(record) {
  if (!record || !record.id) {
    return Promise.resolve(record || {})
  }
  return getAction(this.url.queryById, { id: record.id }).then(res => {
    if (res && res.success && res.result) {
      return res.result
    }
    return record
  }).catch(() => record)
}
```

### 更新记录状态

```javascript
updateRecordStatus(record, status) {
  const payload = Object.assign({}, record, { zt: status })
  httpAction(this.url.edit, payload, 'put').then(res => {
    if (res.success) {
      this.$message.success(res.message || '状态已更新')
      this.loadData()
    } else {
      this.$message.warning(res.message || '状态更新失败')
    }
  })
}
```

### 获取状态统计

```javascript
getStatusTotal() {
  const getTotalUrl = this.url.list.replace(/\/list$/, '/getTotal')
  httpAction(getTotalUrl, '', 'get').then(res => {
    if (res && res.success && Array.isArray(res.result)) {
      const totalMap = {}
      res.result.forEach(item => {
        totalMap[item.statusText] = Number(item.statustotal) || 0
      })
      this.statusOptions.forEach(item => {
        item.count = totalMap[item.label] || 0
      })
    }
  })
}
```

## 字段配置集成

Offer管理已集成字段配置功能：

```vue
<template>
  <!-- 字段配置按钮 -->
  <a-button type="primary" class="pm-btn-primary" icon="setting" @click="toggleColumnConfig">
    字段配置
  </a-button>
  
  <!-- 字段配置侧边栏 -->
  <ColumnConfigSidebar 
    :visible="columnConfigVisible" 
    :allColumns="columnConfigNew" 
    :fieldTitleMap="fieldTitleMap"
    @close="columnConfigVisible = false" 
    @confirm="handleColumnConfigConfirm" 
  />
</template>

<script>
import { columnConfigMixin } from '@/mixins/columnConfigMixin'
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'

export default {
  mixins: [JeecgListMixin, mixinDevice, columnConfigMixin],
  components: { ColumnConfigSidebar },
  data() {
    return {
      columnCode: 'HrmOffergl', // 字段配置组件标识
      originalColumns: [/* 列定义 */]
    }
  },
  computed: {
    fieldTitleMap() {
      return {
        rowIndex: '序号',
        zt: '状态',
        xm: '姓名',
        lxfs: '联系方式',
        deptPath: '所属部门',
        postName: '岗位名称',
        levelName: '职级名称',
        zwhfsj: '最晚回复时间',
        xz: '薪资(K)',
        zpjhid: '招聘计划ID',
        sqr: '审批人',
        csr: '抄送人'
      }
    },
    columns() {
      const fixedColumns = [
        { title: '操作', dataIndex: 'action', align: 'center', fixed: 'right', width: 240, scopedSlots: { customRender: 'action' } }
      ]
      return this.applyColumnConfig(this.originalColumns, { fixedColumns })
    },
    columnConfigNew() {
      return this.getColumnConfigData()
    }
  }
}
</script>
```

## 数据流转

### Offer流程

```
面试通过 → 发起Offer → 审批中 → 待确认 → 已确认 → 发起入职
                        ↓         ↓
                    审批拒绝   已拒绝 / 放弃
```

### 状态转换

- **审批中 → 待确认**：审批通过
- **审批中 → 审批拒绝**：审批拒绝
- **待确认 → 已确认**：候选人确认
- **待确认 → 已拒绝**：候选人拒绝
- **待确认 → 放弃**：主动放弃Offer

## API接口

### 列表接口

```
GET /zpManage/hrmOffergl/list
```

**参数**：
- `zt`: 状态（可选）
- `xm`: 姓名（可选）
- `deptId`: 部门ID（可选）
- `postId`: 岗位ID（可选）
- `zpjhid`: 招聘计划ID（可选）

### 新增接口

```
POST /zpManage/hrmOffergl/add
```

### 编辑接口

```
PUT /zpManage/hrmOffergl/edit
```

### 删除接口

```
DELETE /zpManage/hrmOffergl/delete?id={id}
```

### 批量删除接口

```
DELETE /zpManage/hrmOffergl/deleteBatch?ids={ids}
```

### 导出接口

```
GET /zpManage/hrmOffergl/exportXls
```

### 导入接口

```
POST /zpManage/hrmOffergl/importExcel
```

### 查询详情接口

```
GET /zpManage/hrmOffergl/queryById?id={id}
```

### 状态统计接口

```
GET /zpManage/hrmOffergl/getTotal
```

**返回**：
```json
[
  { "statusText": "审批中", "statustotal": 10 },
  { "statusText": "待确认", "statustotal": 20 }
]
```

## 相关文档

- [招聘管理](../招聘管理.md)
- [人事管理](../../人事管理.md)
- [ColumnConfigSidebar使用指南](../../../components/README.md)
