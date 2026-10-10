<template>
  <a-card :bordered="false">
    <!-- 页面标题 -->
    <!-- <div class="page-title-bar">
      <h1><a-icon type="door" /> 宿舍门禁管理</h1>
    </div> -->

    <!-- 筛选区域 -->
    <div class="filter-bar">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-item-label">卡号</span>
          <j-input v-model="queryParam.kh" placeholder="请输入卡号" allowClear @pressEnter="searchQuery" />
        </div>
        <div class="filter-item">
          <span class="filter-item-label">姓名</span>
          <j-input v-model="queryParam.xm" placeholder="请输入姓名" allowClear @pressEnter="searchQuery" />
        </div>
        <div class="filter-item">
          <span class="filter-item-label">工号</span>
          <j-input v-model="queryParam.gh" placeholder="请输入工号" allowClear @pressEnter="searchQuery" />
        </div>
        <div class="filter-item">
          <span class="filter-item-label">人员类型</span>
          <j-dict-select-tag
            v-model="queryParam.rylx"
            placeholder="请选择人员类型"
            dictCode="hrm_sqgl_apply_person_type"
            style="width: 100%"
          />
        </div>
        <div class="filter-item">
          <span class="filter-item-label">门禁地点</span>
          <j-input v-model="queryParam.mjdd" placeholder="请输入门禁地点" allowClear @pressEnter="searchQuery" />
        </div>
        <a-button type="primary" icon="search" @click="searchQuery">搜索</a-button>
        <a-button icon="reload" @click="searchReset">重置</a-button>
      </div>
      <div class="filter-bar-actions">
        <a-button type="primary" icon="download" @click="handleExportXls('宿舍门禁管理')">导出</a-button>
        <a-button type="primary" icon="plus" @click="handleAdd">添加门禁权限</a-button>
      </div>
    </div>

    <!-- table区域-begin -->
    <div>
      <!-- <div class="ant-alert ant-alert-info" style="margin-bottom: 16px">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择
        <a style="font-weight: 600">{{ selectedRowKeys.length }}</a
        >项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div> -->

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
        class="j-table-force-nowrap"
        @change="handleTableChange"
      >
        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text, record">
          <span v-if="!text" style="font-size: 12px; font-style: italic">无图片</span>
          <img
            v-else
            :src="getImgView(text)"
            :preview="record.id"
            height="25px"
            alt=""
            style="max-width: 80px; font-size: 12px; font-style: italic"
          />
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px; font-style: italic">无文件</span>
          <a-button v-else :ghost="true" type="primary" icon="download" size="small" @click="downloadFile(text)">
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <div class="action-btns">

      
          <a-button type="primary" icon="edit" size="small" @click="handleEdit(record)">编辑</a-button>
          <a-button type="danger" icon="delete" size="small" @click="handleDeleteClick(record)">删除</a-button>
              </div>
        </span>
      </a-table>
    </div>

    <dorm-guard-modal ref="modalForm" @ok="modalFormOk"></dorm-guard-modal>
    <dorm-guard-detail-modal ref="detailModal"></dorm-guard-detail-modal>

    <!-- 删除确认模态框 -->
    <a-modal
      v-model="deleteModalVisible"
      title="删除确认"
      width="520px"
      :maskClosable="false"
      @ok="confirmDelete"
      @cancel="cancelDelete"
      okText="确认删除"
      cancelText="取消"
      :okButtonProps="{ props: { type: 'danger' } }"
    >
      <div class="delete-confirm-content">
        <a-icon type="exclamation-circle" style="color: #faad14; font-size: 48px; margin-bottom: 16px" />
        <p class="delete-confirm-text">
          是否确认删除 <b>「{{ deleteRecord.xm }}」</b> 的门禁权限？
        </p>
        <p class="delete-confirm-text">
          删除后该员工将无法通过 <b>{{ deleteRecord.mjdd_dictText }}</b> 等门禁点，且操作不可恢复。
        </p>
      </div>
    </a-modal>
  </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import DormGuardModal from './modules/DormGuardModal'
import DormGuardDetailModal from './modules/DormGuardDetailModal'

export default {
  name: 'DormGuardList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    DormGuardModal,
    DormGuardDetailModal,
  },
  data() {
    return {
      description: '宿舍门禁管理页面',
      // 表头
      columns: [
        {
          title: '序号',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '卡号',
          align: 'center',
          dataIndex: 'kh',
          customRender: (text) => {
            if (!text || text.length < 6) return text || '—'
            return text.slice(0, 4) + '****' + text.slice(-2)
          },
        },
        {
          title: '姓名',
          align: 'center',
          dataIndex: 'xm',
        },
        {
          title: '工号',
          align: 'center',
          dataIndex: 'gh',
        },
        {
          title: '手机号码',
          align: 'center',
          dataIndex: 'sjhm',
        },
        {
          title: '人员类型',
          align: 'center',
          dataIndex: 'rylx',
          customRender: (text, record) => {
            const typeText = record.rylx_dictText || '—'
            const typeClass =
              {
                0: 'nei', // 内部员工
                1: 'tmp', // 临时工
                2: 'wai', // 外部员工
              }[text] || ''
            return <span class={`type-chip ${typeClass}`}>{typeText}</span>
          },
        },
        {
          title: '门禁地点',
          align: 'center',
          width: 350,
          dataIndex: 'mjdd_dictText',
          customRender: (text) => {
            return (
              <a-tooltip
                title={text}
                style="width: 333px;display: block;word-break: nowrap;overflow: hidden;text-overflow: ellipsis;"
              >
                {text}
              </a-tooltip>
            )
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 120,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/sqgl/hrmSsglSsmjgl/list',
        delete: '/sqgl/hrmSsglSsmjgl/delete',
        deleteBatch: '/sqgl/hrmSsglSsmjgl/deleteBatch',
        exportXlsUrl: '/sqgl/hrmSsglSsmjgl/exportXls',
        importExcelUrl: 'sqgl/hrmSsglSsmjgl/importExcel',
        importExcelUrlNewName: 'HrmSsglSsmjgl',
      },
      dictOptions: {},
      superFieldList: [],
      deleteModalVisible: false,
      deleteRecord: {},
    }
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    initDictConfig() {},
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'kh', text: '卡号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'xm', text: '姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'gh', text: '工号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'sjhm', text: '手机号码', dictCode: '' })
      fieldList.push({ type: 'string', value: 'rylx', text: '人员类型', dictCode: '' })
      fieldList.push({ type: 'string', value: 'mjdd', text: '门禁地点', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'zp', text: '照片', dictCode: '' })
      this.superFieldList = fieldList
    },
    handleDetail(record) {
      this.$refs.detailModal.show(record)
    },
    handleDeleteClick(record) {
      this.deleteRecord = record
      this.deleteModalVisible = true
    },
    confirmDelete() {
      if (this.deleteRecord.id) {
        this.handleDelete(this.deleteRecord.id)
        this.deleteModalVisible = false
        this.deleteRecord = {}
      }
    },
    cancelDelete() {
      this.deleteModalVisible = false
      this.deleteRecord = {}
    },
  },
}
</script>
<style lang="less" scoped>
@import '~@assets/less/common.less';

@guard-primary: #2563eb;
@guard-primary-rgb: 37, 99, 235;
@guard-border: #e2e8f0;
@guard-gradient-blue: linear-gradient(135deg, #2d78ff 0%, #4a9eff 100%);
@guard-shadow-card: 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);

.page-title-bar {
  padding: 16px 24px 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.page-title-bar h1 {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, @guard-primary, #4f7dff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 9px;
  letter-spacing: 0.5px;
  margin: 0;
}

.page-title-bar h1 .anticon {
  font-size: 24px;
  -webkit-text-fill-color: @guard-primary;
  color: @guard-primary;
}

.filter-bar {
  padding: 14px 18px;
  margin: 14px 0;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  border: 1px solid @guard-border;
  border-radius: 12px;
  background: #fff;
  box-shadow: @guard-shadow-card;
  position: relative;
}

.filter-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: @guard-gradient-blue;
  box-shadow: 0 0 8px rgba(45, 120, 255, 0.25);
  border-radius: 12px 12px 0 0;
}

.filter-row {
  display: flex;
  align-items: flex-end;
  gap: 18px;
  flex: 1;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  min-width: 160px;
}

.filter-item-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
  letter-spacing: 0.02em;
  padding-left: 1px;
}

.filter-item .ant-input {
  height: 34px;
  font-size: 12.5px;
}

.filter-bar-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
  flex-wrap: nowrap;
}
.action-btns {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
  flex-wrap: nowrap;
}

/* ===== 表格卡片样式 ===== */
/deep/ .ant-card-body {
  position: relative;
}

/deep/ .ant-table-wrapper {
  background: #fff;
  border: 1px solid @guard-border;
  border-radius: 10px;
  box-shadow: @guard-shadow-card;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: @guard-gradient-blue;
    box-shadow: 0 0 8px rgba(45, 120, 255, 0.25);
    z-index: 1;
  }
}

/* 表头样式 */
/deep/ .ant-table-thead > tr > th {
  background: #eef4ff;
  color: @guard-primary;
  font-weight: 600;
  font-size: 12px;
}

/* 表格内容样式 */
/deep/ .ant-table-tbody > tr > td {
  font-size: 13px;
}

@media (max-width: 1200px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-item {
    min-width: unset;
  }

  .filter-bar-actions {
    justify-content: flex-end;
    margin-top: 8px;
  }
}

.delete-confirm-content {
  text-align: center;
  padding: 20px 0;
}

.delete-confirm-text {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.8;
  margin-bottom: 8px;
}

.delete-confirm-text b {
  color: @guard-primary;
  font-weight: 600;
}

/* ===== 人员类型标签 ===== */
.type-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.type-chip.nei {
  background: rgba(45, 120, 255, 0.1);
  color: #2563eb;
}

.type-chip.tmp {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
}

.type-chip.wai {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}
</style>
