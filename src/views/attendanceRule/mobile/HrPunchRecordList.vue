<template>
  <!--
    HrPunchRecordList.vue
    移动打卡记录列表页面
    功能：查询打卡记录 + 查看详情 + 照片预览
  -->
  <div class="punch-record-panel">
    

    <!-- ==== 搜索栏 ==== -->
    <div class="rule-filter-bar">
      <div class="rule-filter-item">
        <span class="rule-filter-label">开始日期</span>
        <j-date v-model="queryParam.startDate" placeholder="请选择开始日期" class="rule-filter-date" date-format="YYYY-MM-DD" />
      </div>
      <div class="rule-filter-item">
        <span class="rule-filter-label">结束日期</span>
        <j-date v-model="queryParam.endDate" placeholder="请选择结束日期" class="rule-filter-date" date-format="YYYY-MM-DD" />
      </div>
      <div class="rule-filter-item">
        <span class="rule-filter-label">姓名</span>
        <a-input v-model="queryParam.name" allowClear placeholder="请输入姓名" class="rule-filter-input" @pressEnter="searchQuery" />
      </div>
      <div class="rule-filter-item">
        <span class="rule-filter-label">工号</span>
        <a-input v-model="queryParam.no" allowClear placeholder="请输入工号" class="rule-filter-input" @pressEnter="searchQuery" />
      </div>
      <div class="rule-filter-item">
        <span class="rule-filter-label">公司</span>
        <a-select v-model="queryParam.companyId" allowClear placeholder="请选择公司" class="rule-filter-select" @change="onCompanyChange">
          <a-select-option v-for="item in companyList" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>
      <div class="rule-filter-actions">
        <a-button type="primary" class="rule-btn-primary" @click="searchQuery">查询</a-button>
        <a-button class="rule-btn-reset" @click="searchReset">重置</a-button>
        <a-button class="rule-btn-primary" type="primary" icon="download" @click="handleExportXls('移动打卡记录')">导出</a-button>
      </div>
    </div>

    <!-- ==== Table 区域 ==== -->
    <div class="rule-table-wrap">
      <a-table
        ref="table"
        size="middle"
        :scroll="{ x: 1000 }"
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
        <!-- 照片查看 -->
        <template slot="photoSlot" slot-scope="text, record">
          <span v-if="!text" style="font-size: 12px; font-style: italic; color: #999">--</span>
          
          <a-button v-else :ghost="true" type="primary" size="small" @click="lookPdf(text)">
                        查看图片
                    </a-button>
        </template>

        <!-- 操作列 -->
        <span slot="action" slot-scope="text, record">
          <a @click="handleDetail(record)">详情</a>
        </span>
      </a-table>
    </div>

    <!-- 详情弹窗 -->
    <hr-punch-record-detail-modal ref="detailModal" />

    
  </div>
</template>

<script>
/**
 * 移动打卡记录列表页面
 * 功能：查询打卡记录、查看详情、照片预览、导出
 */
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction } from '@/api/manage'
import HrPunchRecordDetailModal from './modules/HrPunchRecordDetailModal'
import '@/assets/less/TableExpand.less'

export default {
  name: 'HrPunchRecordList',
  mixins: [JeecgListMixin],
  components: {
    HrPunchRecordDetailModal
  },
  data() {
    return {
      description: '移动打卡记录表管理页面',
      // 照片预览
      photoVisible: false,
      photoUrl: '',
      // 公司列表
      companyList: [],
      // 表头
      columns: [
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
          title: '打卡时间',
          align: 'center',
          dataIndex: 'checkindatetime',
        },
        {
          title: '照片',
          align: 'center',
          dataIndex: 'attachmentUrls',
          width: 150,
          scopedSlots: { customRender: 'photoSlot' }
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 147,
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: '/hr_yddk_record/hrYddkRecord/list',
        delete: '/hr_yddk_record/hrYddkRecord/delete',
        deleteBatch: '/hr_yddk_record/hrYddkRecord/deleteBatch',
        exportXlsUrl: '/hr_yddk_record/hrYddkRecord/exportXls',
        importExcelUrl: "hr_yddk_record/hrYddkRecord/importExcel",
          importExcelUrlNewName: 'HrYddkRecord',
      },
      dictOptions: {},
      superFieldList: []
    }
  },
  created() {
    this.getCompanyList()
    this.getSuperFieldList()
  },
  methods: {
    /**
     * 获取公司列表
     */
    getCompanyList() {
      getAction('/org/hrmOrg/loadTreeRoot?pid=0').then(res => {
        if (res.success) {
          this.companyList = res.result[0].children || []
        }
      })
    },
    /**
     * 公司选择变化
     */
    onCompanyChange() {
      // 可扩展：联动部门选择
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'companyId_dictText', text: '公司', dictCode: '' })
      fieldList.push({ type: 'string', value: 'dept_dictText', text: '部门', dictCode: '' })
      fieldList.push({ type: 'string', value: 'no', text: '工号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'name', text: '姓名', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'punchTime', text: '打卡时间' })
      fieldList.push({type:'string',value:'shift',text:'班次',dictCode:''})
        fieldList.push({type:'string',value:'checkindate',text:'打卡日期',dictCode:''})
        fieldList.push({type:'string',value:'checkintime',text:'打卡时间',dictCode:''})
        fieldList.push({type:'string',value:'status',text:'状态',dictCode:'dkstatus'})
        fieldList.push({type:'string',value:'checkinway',text:'打卡方式',dictCode:'checkinWay'})
        fieldList.push({type:'string',value:'isreissuecard',text:'是否补卡',dictCode:'isReissueCard'})
        fieldList.push({type:'string',value:'origcheckintime',text:'原打卡时间',dictCode:''})
        fieldList.push({type:'string',value:'type',text:'打卡类型',dictCode:'checkInType'})
        fieldList.push({type:'string',value:'shifttime',text:'班次时间段',dictCode:''})
        fieldList.push({type:'Text',value:'location',text:'打卡点',dictCode:''})
      this.superFieldList = fieldList
    },
    // 查看照片
    handleViewPhoto(record) {
      this.photoUrl = record.photo || ''
      this.photoVisible = true
    },
    // 查看详情
    handleDetail(record) {
      this.$refs.detailModal.show(record)
    }
  }
}
</script>

<style scoped lang="less">
/* ==== 页面容器 ==== */
.punch-record-panel {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--attendance-background, #f8fafd);
    overflow: hidden;
    animation: rule-slide-in-right 0.3s ease-out both;
    padding: 8px 10px 0;
}

// ---------- 筛选栏 ----------
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

.rule-filter-input,
.rule-filter-select,
.rule-filter-date {
    width: 160px;

    /deep/ .ant-input,
    /deep/ .ant-select-selection {
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
   // margin-left: auto;
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

// ---------- 照片按钮 ----------
.photo-btn {
    height: 30px;
    padding: 0 16px;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #2d78ff, #00b4d8);
    box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        box-shadow: 0 4px 14px rgba(45, 120, 255, 0.35);
        transform: translateY(-1px);
    }
}

// ---------- 表格容器 ----------
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
    .rule-filter-select,
    .rule-filter-date {
        flex: 1;
        width: auto;
    }
}
</style>
