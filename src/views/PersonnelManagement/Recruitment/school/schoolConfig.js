const emptyText = text => text || '-'

export function getSchoolColumns() {
  return [
    {
      title: '序号',
      dataIndex: 'rowIndex',
      width: 70,
      align: 'center',
      scopedSlots: { customRender: 'rowIndex' }
    },
    {
      title: '学校名称',
      dataIndex: 'xxmc',
      align: 'center',
      width: 180,
      scopedSlots: { customRender: 'ellipsisText' }
    },
    { title: '联系人', dataIndex: 'lxr', align: 'center', width: 120, customRender: emptyText },
    { title: '联系方式', dataIndex: 'lxfs', align: 'center', width: 150, customRender: emptyText },
    {
      title: '地址',
      dataIndex: 'dz',
      align: 'center',
      width: 220,
      scopedSlots: { customRender: 'ellipsisText' }
    },
    {
      title: '描述',
      dataIndex: 'ms',
      align: 'center',
      width: 220,
      scopedSlots: { customRender: 'ellipsisText' }
    },
    { title: '创建时间', dataIndex: 'createTime', align: 'center', width: 165, customRender: emptyText },
    { title: '修改时间', dataIndex: 'updateTime', align: 'center', width: 165, customRender: emptyText },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      width: 180,
      scopedSlots: { customRender: 'action' }
    }
  ]
}

export function createSchoolQuery() {
  return {
    xxmc: '',
    lxr: '',
    lxfs: ''
  }
}

export function getSchoolSuperFields() {
  return [
    { type: 'string', value: 'xxmc', text: '学校名称', dictCode: '' },
    { type: 'string', value: 'lxr', text: '联系人', dictCode: '' },
    { type: 'string', value: 'lxfs', text: '联系方式', dictCode: '' },
    { type: 'string', value: 'dz', text: '地址', dictCode: '' },
    { type: 'string', value: 'ms', text: '描述', dictCode: '' },
    { type: 'datetime', value: 'createTime', text: '创建时间', dictCode: '' },
    { type: 'datetime', value: 'updateTime', text: '修改时间', dictCode: '' }
  ]
}
