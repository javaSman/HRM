<template>
  <div class="fieldwork-list-panel">
    <!-- ==== 筛选栏（与 card 目录保持一致） ==== -->
    <div class="rule-filter-bar">
      <div class="rule-filter-item">
        <span class="rule-filter-label">开始日期</span>
        <a-date-picker
          v-model="queryParam.startTime_begin"
          placeholder="请选择开始日期"
          format="YYYY-MM-DD"
          valueFormat="YYYY-MM-DD"
          style="width: 200px"
        />
      </div>
      <div class="rule-filter-item">
        <span class="rule-filter-label">结束日期</span>
        <a-date-picker
          v-model="queryParam.endTime_end"
          placeholder="请选择结束日期"
          format="YYYY-MM-DD"
          valueFormat="YYYY-MM-DD"
          style="width: 200px"
        />
      </div>
      <div class="rule-filter-item">
        <span class="rule-filter-label">外勤点</span>
        <j-dict-select-tag
          v-model="queryParam.hrWqdId"
          placeholder="请选择外勤点"
          style="width: 200px"
          dictCode="hr_wqd,wqd,id"
        />
      </div>
      <div class="rule-filter-actions">
        <a-button type="primary" class="rule-btn-primary" icon="search" @click="searchQuery">查询</a-button>
        <a-button class="rule-btn-reset" icon="reload" @click="searchReset">重置</a-button>
      </div>

      <!-- ==== 操作按钮区域 ==== -->
      <div class="rule-toolbar">
        <div class="rule-toolbar-left">
          <a-button type="primary" class="rule-btn-primary" icon="plus" @click="handleAdd">新增外勤人员</a-button>
          <!-- <a-button type="primary" class="rule-btn-primary" icon="download" @click="handleExportXls('外勤人员')">导出</a-button>
          <a-upload
            name="file"
            :showUploadList="false"
            :multiple="false"
            :headers="tokenHeader"
            :action="importExcelUrl"
            @change="handleImportExcel">
            <a-button type="primary" class="rule-btn-primary" icon="import">导入</a-button>
          </a-upload>
          <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery" /> -->
          <a-dropdown v-if="selectedRowKeys.length > 0">
            <a-menu slot="overlay">
              <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
            </a-menu>
            <a-button class="rule-btn-reset" style="margin-left: 8px">批量操作 <a-icon type="down" /></a-button>
          </a-dropdown>
        </div>
      </div>
    </div>

    <!-- ==== 表格区域 ==== -->
    <div class="rule-table-wrap">
      <!-- <div class="ant-alert ant-alert-info" style="margin-bottom: 16px">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择
        <a style="font-weight: 600">{{ selectedRowKeys.length }}</a
        >项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div> -->

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        class="j-table-force-nowrap"
        :scroll="{ x: true }"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleDetail(record)">详情</a>
          <!-- <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown> -->
        </span>
      </a-table>
    </div>

    <hr-field-work-person-modal ref="modalForm" @ok="modalFormOk" />
  </div>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { filterObj } from '@/utils/util'
import HrFieldWorkPersonModal from './modules/HrFieldWorkPersonModal'
import '@/assets/less/TableExpand.less'

export default {
  name: 'HrWqryList',
  mixins: [JeecgListMixin],
  components: {
    HrFieldWorkPersonModal,
  },
  data() {
    return {
      description: '外勤人员管理页面',
      queryParam: {
        startTime_begin: '',
        endTime_end: '',
        hrWqdId: '',
      },
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
          title: '公司',
          align: 'center',
          dataIndex: 'companyId_dictText',
        },
        {
          title: '部门',
          align: 'center',
          dataIndex: 'dept_dictText',
        },
        {
          title: '工号',
          align: 'center',
          dataIndex: 'no',
        },
        {
          title: '姓名',
          align: 'center',
          dataIndex: 'name',
        },
        {
          title: '外勤点',
          align: 'center',
          dataIndex: 'hrWqdName',
        },
        {
          title: '考勤规则',
          align: 'center',
          dataIndex: 'ruleName',
          customRender: (text, record) => {
            return record.ruleSm ? `${text}(${record.ruleSm})` : text
          },
        },
        {
          title: '开始时间',
          align: 'center',
          dataIndex: 'startTime',
        },
        {
          title: '结束时间',
          align: 'center',
          dataIndex: 'endTime',
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
        list: '/hr_wqry/hrWqry/list',
        delete: '/hr_wqry/hrWqry/delete',
        deleteBatch: '/hr_wqry/hrWqry/deleteBatch',
        exportXlsUrl: '/hr_wqry/hrWqry/exportXls',
        importExcelUrl: 'hr_wqry/hrWqry/importExcel',
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
    // 重写查询参数方法，在传给后台时拼接时分秒
    getQueryParams() {
      // 获取查询条件
      let sqp = {}
      if(this.superQueryParams){
        sqp['superQueryParams']=encodeURI(this.superQueryParams)
        sqp['superQueryMatchType'] = this.superQueryMatchType
      }
      var param = Object.assign(sqp, this.queryParam, this.isorter ,this.filters);
      param.field = this.getQueryField();
      param.pageNo = this.ipagination.current;
      param.pageSize = this.ipagination.pageSize;

      // 拼接时分秒
      if (param.startTime_begin) {
        param.startTime_begin = param.startTime_begin + ' 00:00:00'
      }
      if (param.endTime_end) {
        param.endTime_end = param.endTime_end + ' 23:59:59'
      }

      return filterObj(param);
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'userId', text: '姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'hrWqdId', text: '外勤点', dictCode: 'hr_wqd,wqd,id' })
      fieldList.push({
        type: 'string',
        value: 'attendanceRuleId',
        text: '考勤规则',
        dictCode: 'hr_attendance_rule,name,id',
      })
      fieldList.push({ type: 'datetime', value: 'startTime_begin', text: '开始时间' })
      fieldList.push({ type: 'datetime', value: 'endTime_end', text: '结束时间' })
      this.superFieldList = fieldList
    },
  },
}
</script>
<style scoped lang="less">
/* ==== 页面容器（与 card 目录保持一致） ==== */
.fieldwork-list-panel {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8fafd;
  overflow: hidden;
  padding: 0 10px;
}

/* ==== 筛选栏（与 card 目录保持一致） ==== */
.rule-filter-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  flex-shrink: 0;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.rule-filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rule-filter-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
}

.rule-filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ==== 操作工具栏（与 card 目录保持一致） ==== */
.rule-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-left: auto;
}

.rule-toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ==== 按钮（与 card 目录保持一致） ==== */
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
}

/* ==== 表格容器（与 card 目录保持一致） ==== */
.rule-table-wrap {
  flex: 1;
  min-height: 0;
  margin-top: 12px;
  padding: 12px 16px 18px;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;

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
</style>
