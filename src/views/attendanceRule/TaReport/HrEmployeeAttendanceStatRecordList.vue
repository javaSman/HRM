<template>
  <div class="rule-list-panel">
    <!-- 筛选区域 -->
    <div class="rule-filter-bar">
      <!-- <div class="rule-filter-actions">
        <a-button type="primary" class="rule-btn-primary" @click="searchQuery">查询</a-button>
        <a-button class="rule-btn-reset" @click="searchReset">重置</a-button>
      </div> -->
    </div>

    <!-- 操作按钮区域 -->
    <div class="rule-toolbar">
      <div class="rule-toolbar-left">
        <!-- <a-button type="primary" class="rule-btn-primary" icon="plus" @click="handleAdd">新增</a-button> -->
        <a-button type="primary" class="rule-btn-primary" icon="download"
          @click="handleExportXls('员工考勤统计记录表')">导出</a-button>
        <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
          :action="importExcelUrlNew" @change="handleImportExcelNew">
          <a-button type="primary" class="rule-btn-primary" icon="import">导入</a-button>
        </a-upload>
        <j-super-query :fieldList="superFieldList" ref="superQueryModal"
          @handleSuperQuery="handleSuperQuery"></j-super-query>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
        </a-dropdown>
      </div>
    </div>

    <!-- table区域 -->
    <div class="rule-table-wrap">
      <div class="ant-alert ant-alert-info" style="margin-bottom: 12px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
          selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table ref="table" size="middle" :scroll="{ x: true, y: 530 }" bordered rowKey="id" :columns="columns"
        :dataSource="dataSource" :pagination="ipagination" :loading="loading"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }" class="j-table-force-nowrap"
        @change="handleTableChange">

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text,record">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img v-else :src="getImgView(text)" :preview="record.id" height="25px" alt=""
            style="max-width:80px;font-size: 12px;font-style: italic;" />
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button v-else :ghost="true" type="primary" icon="download" size="small" @click="downloadFile(text)">
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
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
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <hr-employee-attendance-stat-record-modal ref="modalForm"
      @ok="modalFormOk"></hr-employee-attendance-stat-record-modal>
  </div>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import HrEmployeeAttendanceStatRecordModal from './modules/HrEmployeeAttendanceStatRecordModal'

export default {
  name: 'HrEmployeeAttendanceStatRecordList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    HrEmployeeAttendanceStatRecordModal
  },
  data() {
    return {
      description: '员工考勤统计记录表管理页面',
      // 表头
      columns: [
        {
          title: '公司',
          align: "center",
          width: 140,

          dataIndex: 'companyId',
          ellipsis: true,
          customRender: (t, record) => {
            let text = record.companyId_dictText
            return <a-tooltip style='width: 120px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
              <template slot="title">{text}</template>
              <span style="color: #1890FF;">{text}</span>
            </a-tooltip>
          }
        },
        {
          title: '部门',
          align: "center",
          width: 140,
          dataIndex: 'dept',
          ellipsis: true,
          customRender: (t, record) => {
            let text = record.dept_dictText
            return <a-tooltip style='width: 120px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
              <template slot="title">{text}</template>
              <span>{text}</span>
            </a-tooltip>
          }
        },
        {
          title: '工号',
          align: "center",
          width: 110,

          dataIndex: 'no'
        },
        {
          title: '姓名',
          align: "center",
          width: 100,

          dataIndex: 'name',
          ellipsis: true,
          customRender: (text) => {
            return <a-tooltip style='width: 80px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
              <template slot="title">{text}</template>
              <span>{text}</span>
            </a-tooltip>
          }
        },
        {
          title: '大小周所属年月',
          align: "center",
          width: 140,

          dataIndex: 'ssny'
        },
        {
          title: '本月累计大周次数',
          align: "center",
          width: 140,

          dataIndex: 'monthBigCnt'
        },
        {
          title: '本月累计小周次数',
          align: "center",
          width: 120,

          dataIndex: 'monthSmallCnt'
        },
        {
          title: '当月补卡次数',
          align: "center",
          width: 120,

          dataIndex: 'dybkcs'
        },
        {
          title: '当月补卡已用次数',
          align: "center",
          dataIndex: 'dybkyycs',
          width: 120,

        },
        {
          title: '当月补卡剩余次数',
          align: "center",
          dataIndex: 'dybksycs',
          width: 120,
        },
        {
          title: '薪资类型',
          align: "center",
          dataIndex: 'xzlx',
          width: 120,
        },
        {
          title: '出勤总天数',
          align: "center",
          dataIndex: 'cqzts',
          width: 120,
        },
        {
          title: '出勤总时长',
          align: "center",
          dataIndex: 'cqzsc',
          width: 120,
        },
        {
          title: '平时天数',
          align: "center",
          dataIndex: 'psts',
          width: 120,
        },
        {
          title: '周末天数',
          align: "center",
          dataIndex: 'zmts',
          width: 120,
        },
        {
          title: '迟到/早退天数',
          align: "center",
          dataIndex: 'cdztts',
          width: 120,
        },
        {
          title: '当月是否全勤',
          align: "center",
          dataIndex: 'dysfqq',
          width: 120,
        },
        {
          title: '年假总数',
          align: "center",
          dataIndex: 'njzs',
          width: 120,
        },
        {
          title: '已休年假天数',
          align: "center",
          dataIndex: 'yxnjts',
          width: 120,
        },
        {
          title: '剩余年假天数',
          align: "center",
          dataIndex: 'synjts',
          width: 120,
        },
        {
          title: '当月年假天数',
          align: "center",
          dataIndex: 'dynjts',
          width: 120,
        },
        {
          title: '当月加班调休天数',
          align: "center",
          dataIndex: 'dyjbtxts',
          width: 120,
        },
        {
          title: '当月工伤天数',
          align: "center",
          dataIndex: 'dygsts',
          width: 120,
        },
        {
          title: '当月病假天数',
          align: "center",
          dataIndex: 'dybjts',
          width: 120,
        },
        {
          title: '当月产检天数',
          align: "center",
          dataIndex: 'dycjiants',
          width: 120,
        },
        {
          title: '当月产假天数',
          align: "center",
          dataIndex: 'dycjiats',
          width: 120,
        },
        {
          title: '当月陪产假天数',
          align: "center",
          dataIndex: 'dypcjts',
          width: 120,
        },
        {
          title: '当月婚假天数',
          align: "center",
          dataIndex: 'dyhjts',
          width: 120,
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: "center",
          fixed: "right",
          width: 147,
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: "/hr_employee_attendance_stat_record/hrEmployeeAttendanceStatRecord/list",
        delete: "/hr_employee_attendance_stat_record/hrEmployeeAttendanceStatRecord/delete",
        deleteBatch: "/hr_employee_attendance_stat_record/hrEmployeeAttendanceStatRecord/deleteBatch",
        exportXlsUrl: "/hr_employee_attendance_stat_record/hrEmployeeAttendanceStatRecord/exportXls",
        importExcelUrl: "hr_employee_attendance_stat_record/hrEmployeeAttendanceStatRecord/importExcel",
        importExcelUrlNewName: 'HrEmployeeAttendanceStatRecord',

      },
      dictOptions: {},
      superFieldList: [],
      ipagination: {
        pageSize: 20,
      },
    }
  },
  created() {
    this.getSuperFieldList();
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    },
  },
  methods: {
    initDictConfig() {
    },
    getSuperFieldList() {
      let fieldList = [];
      fieldList.push({ type: 'string', value: 'hrEmployeeInformationId', text: '员工表ID', dictCode: '' })
      fieldList.push({ type: 'string', value: 'companyId', text: '公司', dictCode: '' })
      fieldList.push({ type: 'string', value: 'dept', text: '部门', dictCode: '' })
      fieldList.push({ type: 'string', value: 'no', text: '工号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'name', text: '姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ssny', text: '大小周所属年月', dictCode: '' })
      fieldList.push({ type: 'string', value: 'monthBigCnt', text: '本月累计大周次数', dictCode: '' })
      fieldList.push({ type: 'string', value: 'monthSmallCnt', text: '本月累计小周次数', dictCode: '' })
      fieldList.push({ type: 'int', value: 'dybkcs', text: '当月补卡次数', dictCode: '' })
      fieldList.push({ type: 'int', value: 'dybkyycs', text: '当月补卡已用次数', dictCode: '' })
      fieldList.push({ type: 'int', value: 'dybksycs', text: '当月补卡剩余次数', dictCode: '' })
      fieldList.push({ type: 'string', value: 'xzlx', text: '薪资类型', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'cqzts', text: '出勤总天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'cqzsc', text: '出勤总时长', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'psts', text: '平时天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'zmts', text: '周末天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'cdztts', text: '迟到/早退天数', dictCode: '' })
      fieldList.push({ type: 'string', value: 'dysfqq', text: '当月是否全勤', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'njzs', text: '年假总数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'yxnjts', text: '已休年假天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'synjts', text: '剩余年假天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'dynjts', text: '当月年假天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'dyjbtxts', text: '当月加班调休天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'dygsts', text: '当月工伤天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'dybjts', text: '当月病假天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'dycjiants', text: '当月产检天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'dycjiats', text: '当月产假天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'dypcjts', text: '当月陪产假天数', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'dyhjts', text: '当月婚假天数', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped lang="less">
.rule-list-panel {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--attendance-background, #f8fafd);
  overflow: hidden;
  animation: rule-slide-in-right 0.3s ease-out both;
}

// ---------- 筛选栏 ----------
.rule-filter-bar {
  padding: 10px 24px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.rule-filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.rule-filter-label {
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.rule-filter-input {
  width: 160px;

  /deep/ .ant-input {
    height: 32px;
    border-color: #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: none;
    font-size: 12px;

    &:focus {
      border-color: rgba(37, 99, 235, 0.4);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
    }
  }
}

.rule-filter-dict {
  width: 160px;

  /deep/ .ant-select-selection {
    min-height: 32px;
    border-color: #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: none;
    font-size: 12px;
  }

  /deep/ .ant-select-selection__rendered {
    min-height: 30px;
    line-height: 30px;
  }

  /deep/ .ant-select-selection:hover,
  /deep/ .ant-select-focused .ant-select-selection {
    border-color: rgba(37, 99, 235, 0.4);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }
}

.rule-filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

// ---------- 操作工具栏 ----------
.rule-toolbar {
  padding: 10px 24px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.rule-toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

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

// ---------- 表格容器 ----------
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

  /deep/ .ant-table-thead>tr>th {
    background: rgba(37, 99, 235, 0.03);
    color: #1a2a3d;
    font-weight: 600;
    font-size: 12px;
    border-bottom: 2px solid rgba(37, 99, 235, 0.08);
  }

  /deep/ .ant-table-tbody>tr:hover>td {
    background: rgba(37, 99, 235, 0.02);
  }

  /deep/ .ant-table-pagination.ant-pagination {
    margin: 16px 0 0;
  }
}

// ---------- 动画 ----------
@keyframes rule-slide-in-right {
  from {
    opacity: 0;
    transform: translateX(12px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// ---------- 响应式 ----------
@media (max-width: 900px) {
  .rule-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .rule-filter-item {
    width: 100%;
  }

  .rule-filter-input,
  .rule-filter-dict {
    flex: 1;
    width: auto;
  }
}
</style>
