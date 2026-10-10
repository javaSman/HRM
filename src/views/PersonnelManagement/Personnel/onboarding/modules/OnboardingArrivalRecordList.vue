<template>
  <section class="detail-section detail-subtab-section">
    <div class="detail-section-header detail-subtab-header">
      <div class="section-title-text">
        <a-icon :type="config.icon" />
        {{ config.title }}
      </div>
      <div class="detail-edit-actions">
        <a-button class="detail-subtab-add-btn" size="small" @click="handleAdd">
          <a-icon type="plus" />
          {{ config.addText }}
        </a-button>
      </div>
    </div>

    <div class="detail-subtab-table-wrap">
      <a-table
        size="middle"
        :rowKey="getRowKey"
        :scroll="{ x: config.scrollX }"
        :columns="columns"
        :dataSource="value"
        :pagination="false"
        class="detail-subtab-table"
        :locale="{ emptyText: '暂无数据' }"
      >
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" class="empty-file">无文件</span>
          <a-button v-else ghost type="primary" size="small" @click="lookFile(text)">查看</a-button>
        </template>

        <span slot="action" slot-scope="text, record, index">
          <div class="row-actions">
            <a-tooltip title="编辑">
              <a-button class="row-action-btn" size="small" icon="edit" @click="handleEdit(record, index)" />
            </a-tooltip>
            <a-popconfirm title="确定删除吗？" @confirm="handleDelete(index)">
              <a-button class="row-action-btn danger" size="small" icon="delete" title="删除" />
            </a-popconfirm>
          </div>
        </span>
      </a-table>
    </div>

    <component :is="config.modal" ref="modalForm" :ghId="recordGhId" :localMode="true" @ok="handleModalOk" />
  </section>
</template>

<script>
import { getFileAccessHttpUrl } from '@/api/manage'
import HrmJyjlModal from '@views/peoplemanagement/employeeInfo/modules/tabForms/jiaoyu/modules/HrmJyjlModal'
import HrmGzllModal from '@views/peoplemanagement/employeeInfo/modules/tabForms/work/modules/HrmGzllModal'
import HrmYgjtcyModal from '@views/peoplemanagement/employeeInfo/modules/tabForms/jiating/modules/HrmYgjtcyModal'
import HrmYgzzzsModal from '@views/peoplemanagement/employeeInfo/modules/tabForms/userFile/modules/HrmYgzzzsModal'
import HrmYggxsbModal from '@views/peoplemanagement/employeeInfo/modules/tabForms/guanxi/modules/HrmYggxsbModal'
import { createSupplementRecord } from '../../onboardingSupplement/supplementFields'

const GROUP_CONFIG = {
  jyjl: {
    title: '教育经历',
    addText: '新增教育经历',
    icon: 'read',
    modal: HrmJyjlModal,
    modalTitle: '教育经历',
    scrollX: 1380,
    fileField: 'zsfj',
    columns: [
      ['学历层次', 'xlcc', 120],
      ['学位', 'xw', 120],
      ['是否全日制', 'sfqrz', 120],
      ['毕业院校/机构', 'byyxjg', 180],
      ['专业', 'zy', 150],
      ['入学时间', 'rxsj', 120, 'date'],
      ['毕业时间', 'bysj', 120, 'date'],
      ['证书编号', 'zsbh', 170],
      ['专业/培训内容', 'zypxnr', 170],
      ['证书附件', 'zsfj', 160, 'file'],
      ['学信网报告', 'xxwbg', 160, 'file'],
    ],
  },
  gzll: {
    title: '工作履历',
    addText: '新增工作履历',
    icon: 'solution',
    modal: HrmGzllModal,
    modalTitle: '工作履历',
    scrollX: 1180,
    columns: [
      ['工作单位', 'gzdw', 180],
      ['所属行业', 'sshy', 130],
      ['任职岗位', 'rzgw', 140],
      ['在职起始时间', 'zzqssj', 130, 'date'],
      ['在职结束时间', 'zzjssj', 130, 'date'],
      ['离职原因', 'lzyy', 180],
      ['证明人姓名', 'zmrxm', 120],
      ['证明人联系电话', 'zmrlxdh', 150],
    ],
  },
  jtcy: {
    title: '家庭成员',
    addText: '新增家庭成员',
    icon: 'team',
    modal: HrmYgjtcyModal,
    modalTitle: '家庭成员',
    scrollX: 780,
    columns: [
      ['姓名', 'xm', 120],
      ['关系', 'gx', 120],
      ['职务', 'zw', 140],
      ['工作单位', 'gzdw', 180],
      ['联系电话', 'lxdh', 150],
    ],
  },
  grfj: {
    title: '个人附件',
    addText: '新增个人附件',
    icon: 'profile',
    modal: HrmYgzzzsModal,
    modalTitle: '个人附件',
    scrollX: 760,
    fileField: 'zsfj',
    columns: [
      ['证件类型', 'fjlx', 130],
      ['取得日期', 'qdrq', 130, 'date'],
      ['有效期截止日', 'yxqjzr', 140, 'date'],
      ['证书编号', 'zsbm', 170],
      ['证书附件', 'zsfj', 160, 'file'],
    ],
  },
  gxsb: {
    title: '关系申报',
    addText: '新增关系申报',
    icon: 'cluster',
    modal: HrmYggxsbModal,
    modalTitle: '关系申报',
    scrollX: 780,
    columns: [
      ['姓名', 'xm', 120],
      ['关系', 'gx', 120],
      ['部门', 'bm', 180],
      ['岗位', 'gw', 150],
      ['联系电话', 'lxdh', 150],
    ],
  },
}

export default {
  name: 'OnboardingArrivalRecordList',
  props: {
    groupKey: { type: String, required: true },
    value: { type: Array, default: () => [] },
    detail: { type: Object, required: true },
  },
  data() {
    return {
      editingIndex: null,
    }
  },
  computed: {
    config() {
      return GROUP_CONFIG[this.groupKey]
    },
    recordGhId() {
      return this.detail.gh || (this.detail.jbxx && this.detail.jbxx.no) || ''
    },
    columns() {
      const columns = [
        {
          title: '序号',
          dataIndex: '',
          key: 'rowIndex',
          width: 70,
          align: 'center',
          customRender: (text, record, index) => index + 1,
        },
      ]
      this.config.columns.forEach((item) => {
        const column = {
          title: item[0],
          dataIndex: item[1],
          width: item[2],
          align: 'center',
        }
        if (item[3] === 'date') column.customRender = this.formatDateText
        else if (item[3] === 'file') column.scopedSlots = { customRender: 'fileSlot' }
        else column.customRender = (text) => text || '-'
        columns.push(column)
      })
      columns.push({
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        fixed: 'right',
        width: 100,
        scopedSlots: { customRender: 'action' },
      })
      return columns
    },
  },
  methods: {
    getRowKey(record, index) {
      return record.id || `${this.groupKey}-${index}`
    },
    handleAdd() {
      this.editingIndex = null
      this.$refs.modalForm.add(createSupplementRecord(this.detail))
      this.$refs.modalForm.title = `新增${this.config.modalTitle}`
      this.$refs.modalForm.disableSubmit = false
    },
    handleEdit(record, index) {
      this.editingIndex = index
      this.$refs.modalForm.edit(Object.assign({}, record))
      this.$refs.modalForm.title = `编辑${this.config.modalTitle}`
      this.$refs.modalForm.disableSubmit = false
    },
    handleDelete(index) {
      const records = this.value.slice()
      records.splice(index, 1)
      this.$emit('input', records)
    },
    handleModalOk(record) {
      const records = this.value.slice()
      if (this.editingIndex === null) {
        records.push(record)
      } else {
        records.splice(this.editingIndex, 1, record)
      }
      this.$emit('input', records)
      this.editingIndex = null
    },
    formatDateText(text) {
      return text ? String(text).slice(0, 10) : '-'
    },
    lookFile(text) {
      const list = String(text)
        .split(',')
        .filter(Boolean)
        .map((path) => getFileAccessHttpUrl(path))
      this.$store.commit('pdfIsOn', { show: true, list })
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@assets/less/common.less';
@import '~@views/peoplemanagement/employeeInfo/modules/tabForms/detailSection.less';

.detail-subtab-section {
  min-height: 260px;
}

.detail-subtab-header {
  margin-bottom: 14px;
}

.detail-subtab-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 14px;
  border: 1px dashed rgba(var(--employee-primary-rgb, 37, 99, 235), 0.32);
  border-radius: 8px;
  background: transparent;
  color: var(--employee-primary, #2563eb);
  font-size: 12px;
  font-weight: 700;

  &:hover,
  &:focus {
    border-color: var(--employee-primary, #2563eb);
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.04);
    color: var(--employee-primary, #2563eb);
  }
}

.detail-subtab-table-wrap {
  overflow: hidden;
  border: 1px solid var(--employee-border, #e2e8f0);
  border-radius: 8px;
  background: var(--employee-card, #ffffff);
}

.detail-subtab-table {
  /deep/ .ant-table {
    color: var(--employee-foreground, #1a2a3d);
    font-size: 12px;
  }

  /deep/ .ant-table-thead > tr > th {
    padding: 8px 12px;
    border-bottom: 1px solid var(--employee-border, #e2e8f0);
    background: #f8fafc;
    color: var(--employee-muted-foreground, #64748b);
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
  }

  /deep/ .ant-table-tbody > tr > td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--employee-border, #e2e8f0);
    color: #334155;
  }

  /deep/ .ant-table-tbody > tr:hover > td {
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.02);
  }
}

.row-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.row-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: var(--employee-muted-foreground, #64748b);

  &:hover,
  &:focus {
    border-color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.3);
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.06);
    color: var(--employee-primary, #2563eb);
  }

  &.danger:hover,
  &.danger:focus {
    border-color: rgba(239, 68, 68, 0.3);
    background: rgba(239, 68, 68, 0.06);
    color: #ef4444;
  }
}

.empty-file {
  color: #94a3b8;
  font-size: 12px;
  font-style: italic;
}
</style>

