<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24"> </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" class="rule-btn-primary" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" class="rule-btn-primary" icon="download" @click="handleExportXls('新员工入职规则')"
        >导出</a-button
      >
      <!-- 前端 代码生成位置 做个标记
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <a-button type="primary" icon="download" @click="handleExportXlsNew('HrNewEmployeeRule','新员工入职规则')">导出</a-button>
      -->
      <a-upload
        name="file"
        :showUploadList="false"
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrlNew"
        @change="handleImportExcelNew"
      >
        <a-button class="rule-btn-primary" type="primary" icon="import">导入</a-button>
      </a-upload>
      <!-- 高级查询区域 -->
      <j-super-query
        btnClass="rule-btn-primary"
        :fieldList="superFieldList"
        ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"
      ></j-super-query>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
        </a-menu>
        <a-button class="rule-btn-reset" style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择
        <a style="font-weight: 600">{{ selectedRowKeys.length }}</a
        >项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>
      <div class="rule-table-wrap">
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
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a @click="handleDetail(record)">详情</a>
            <a-divider type="vertical" />
            <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
              <a>删除</a>
            </a-popconfirm>
          </span>
        </a-table>
      </div>
    </div>

    <hr-new-employee-rule-modal ref="modalForm" @ok="modalFormOk"></hr-new-employee-rule-modal>
  </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import HrNewEmployeeRuleModal from './modules/HrNewEmployeeRuleModal'

export default {
  name: 'HrNewEmployeeRuleList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    HrNewEmployeeRuleModal,
  },
  data() {
    return {
      description: '新员工入职规则管理页面',
      // 表头
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '8:30 前入职：全天 / 半天',
          align: 'center',
          dataIndex: 'entryBefore830',
        },
        {
          title: '8:30-10:00 入职：全天 / 半天',
          align: 'center',
          dataIndex: 'entry8301000',
        },
        {
          title: '10:00 后入职：下午开始 / 不计',
          align: 'center',
          dataIndex: 'entryAfter1000',
        },
        {
          title: '适用公司 ID（NULL 表示全集团适用）',
          align: 'center',
          dataIndex: 'companyId',
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 147,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/hr_new_employee_rule/hrNewEmployeeRule/list',
        delete: '/hr_new_employee_rule/hrNewEmployeeRule/delete',
        deleteBatch: '/hr_new_employee_rule/hrNewEmployeeRule/deleteBatch',
        exportXlsUrl: '/hr_new_employee_rule/hrNewEmployeeRule/exportXls',
        importExcelUrl: 'hr_new_employee_rule/hrNewEmployeeRule/importExcel',
        importExcelUrlNewName: 'HrNewEmployeeRule',
      },
      dictOptions: {},
      superFieldList: [],
    }
  },
  created() {
    this.getSuperFieldList()
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
      fieldList.push({ type: 'string', value: 'entryBefore830', text: '8:30 前入职：全天 / 半天', dictCode: '' })
      fieldList.push({ type: 'string', value: 'entry8301000', text: '8:30-10:00 入职：全天 / 半天', dictCode: '' })
      fieldList.push({ type: 'string', value: 'entryAfter1000', text: '10:00 后入职：下午开始 / 不计', dictCode: '' })
      fieldList.push({ type: 'string', value: 'companyId', text: '适用公司 ID（NULL 表示全集团适用）', dictCode: '' })
      this.superFieldList = fieldList
    },
  },
}
</script>
<style scoped lang="less">
// ---------- 按钮 ----------
.rule-btn-primary {
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
  font-size: 12px;
  font-weight: 600;

  &:hover,
  &:focus {
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    opacity: 0.92;
  }
}

.rule-btn-reset {
  height: 34px;
  border-radius: 8px;
  color: #64748b;
  border-color: #e2e8f0;
  background: #ffffff;
  font-size: 12px;
  font-weight: 600;

  &:hover {
    color: #1a2a3d;
    border-color: rgba(37, 99, 235, 0.35);
  }
}
.rule-table-wrap {
  flex: 1;
  min-height: 0;
  padding: 12px 24px 18px;
  overflow-y: auto;

  /deep/ .ant-spin-nested-loading,
  /deep/ .ant-spin-container {
    min-height: 100%;
  }

  /deep/ .ant-table {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }

  /deep/ .ant-table-thead > tr > th {
    background: rgba(37, 99, 235, 0.03);
    color: #1a2a3d;
    font-weight: 600;
    font-size: 12px;
    border-bottom: 2px solid rgba(37, 99, 235, 0.08);
  }

  /deep/ .ant-table-tbody > tr:hover > td {
    background: rgba(37, 99, 235, 0.02);
  }

  /deep/ .ant-table-pagination.ant-pagination {
    margin: 16px 0 0;
  }
}

@import '~@assets/less/common.less';
</style>
