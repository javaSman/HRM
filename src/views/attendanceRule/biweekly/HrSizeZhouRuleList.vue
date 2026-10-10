<template>
  <div class="rule-list-panel">
    

    <!-- 顶部区域：筛选 + 工具栏 -->
    <div class="rule-top-bar">
      <!-- 筛选区域 -->
      <div class="rule-filter-bar">
        <div class="rule-filter-item">
          <span class="rule-filter-label">适用年月</span>
          <a-month-picker
            v-model="queryParam.yearMon"
            placeholder="请选择年月"
            class="rule-filter-dict"
            format="YYYY-MM"
            valueFormat="YYYY-MM"
            allowClear
          />
        </div>

        <div class="rule-filter-actions">
          <a-button type="primary" class="rule-btn-primary" @click="searchQuery">查询</a-button>
          <a-button class="rule-btn-reset" @click="searchReset">重置</a-button>
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div class="rule-toolbar">
        <div class="rule-toolbar-left">
          <a-button type="primary" class="rule-btn-primary" icon="plus" @click="handleAdd">新增</a-button>
          <a-button type="primary" class="rule-btn-primary" icon="download" @click="handleExportXls('大小周规则配置表')">导出</a-button>
          <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrlNew"
            @change="handleImportExcelNew">
            <a-button type="primary" class="rule-btn-primary" icon="import">导入</a-button>
          </a-upload>
          <j-super-query btnClass="rule-btn-primary" :fieldList="superFieldList" ref="superQueryModal"
            @handleSuperQuery="handleSuperQuery"></j-super-query>
          <a-dropdown v-if="selectedRowKeys.length > 0">
            <a-menu slot="overlay">
              <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
            </a-menu>
            <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
          </a-dropdown>
        </div>
      </div>
    </div>

    <!-- table区域 -->
    <div class="rule-table-wrap">
      <div class="ant-alert ant-alert-info" style="margin-bottom: 12px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
          selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table ref="table" size="middle" :scroll="{ x: true,y: 530}" bordered rowKey="id" :columns="columns"
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

    <hr-size-zhou-rule-modal ref="modalForm" @ok="modalFormOk"></hr-size-zhou-rule-modal>
  </div>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import HrSizeZhouRuleModal from './modules/HrSizeZhouRuleModal'

export default {
  name: 'HrSizeZhouRuleList',
  mixins:[JeecgListMixin, mixinDevice],
  components: {
    HrSizeZhouRuleModal
  },
  data () {
    return {
      description: '大小周规则配置表管理页面',
      // 表头
      columns: [
        
        {
          title:'适用年月',
          align:"center",
          dataIndex: 'yearMon',
          width: 130,
        },
        {
          title:'当月周六总数',
          align:"center",
          dataIndex: 'dyzlzs',
          width: 120,

        },
        {
          title:'当月属于节假日的周六数',
          align:"center",
          dataIndex: 'dysyjjrzls',
          width: 150,
        },
        {
          title:'当月周六补班数',
          align:"center",
          dataIndex: 'dyzlbbs',
          width: 120,
        },
        {
          title:'基准小周数',
          align:"center",
          dataIndex: 'jzxzs',
          width: 120,
        },
        {
          title:'月应出勤总天数',
          align:"center",
          dataIndex: 'yycqzts',
          width: 120,
        },
        {
          title:'月应出勤总时长(8h)',
          align:"center",
          dataIndex: 'yycqzsceight',
          width: 150,
        },
        {
          title:'月应出勤总时长(10h)',
          align:"center",
          dataIndex: 'yycqzscten',
          width: 150,
        },
        {
          title:'工作日数',
          align:"center",
          dataIndex: 'baseWorkNum',
          width: 120,
        },
        {
          title: '操作',
          dataIndex: 'action',
          align:"center",
          fixed:"right",
          width:410,
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: "/hr_size_zhou_rule/hrSizeZhouRule/list",
        delete: "/hr_size_zhou_rule/hrSizeZhouRule/delete",
        deleteBatch: "/hr_size_zhou_rule/hrSizeZhouRule/deleteBatch",
        exportXlsUrl: "/hr_size_zhou_rule/hrSizeZhouRule/exportXls",
        importExcelUrl: "hr_size_zhou_rule/hrSizeZhouRule/importExcel",
        importExcelUrlNewName: 'HrSizeZhouRule',
        
      },
      dictOptions:{},
      superFieldList:[],
      ipagination:{
        pageSize: 20,
      },
    }
  },
  created() {
    this.getSuperFieldList();
  },
  computed: {
    importExcelUrl: function(){
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    },
  },
  methods: {
    initDictConfig(){
    },
    getSuperFieldList(){
      let fieldList=[];
      fieldList.push({type:'string',value:'yearMon',text:'适用年月',dictCode:''})
      fieldList.push({type:'string',value:'dyzlzs',text:'当月周六总数',dictCode:''})
      fieldList.push({type:'string',value:'dysyjjrzls',text:'当月属于节假日的周六数',dictCode:''})
      fieldList.push({type:'string',value:'dyzlbbs',text:'当月周六补班数',dictCode:''})
      fieldList.push({type:'string',value:'jzxzs',text:'基准小周数',dictCode:''})
      fieldList.push({type:'string',value:'yycqzts',text:'月应出勤总天数',dictCode:''})
      fieldList.push({type:'string',value:'yycqzsceight',text:'月应出勤总时长8',dictCode:''})
      fieldList.push({type:'string',value:'yycqzscten',text:'月应出勤总时长10',dictCode:''})
      fieldList.push({type:'string',value:'baseWorkNum',text:'工作日数',dictCode:''})
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

// ---------- 标题栏 ----------


.rule-main-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a2a3d;
}

// ---------- 顶部区域（筛选 + 工具栏） ----------
.rule-top-bar {
  padding: 10px 24px 0;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

// ---------- 筛选栏 ----------
.rule-filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
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

  /deep/ .ant-calendar-picker {
    width: 100%;
  }

  /deep/ .ant-input {
    height: 32px;
    border-color: #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: none;
    font-size: 12px;
  }

  /deep/ .ant-calendar-picker:hover .ant-input {
    border-color: rgba(37, 99, 235, 0.4);
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
  display: flex;
  align-items: center;
  gap: 10px;
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
  .rule-top-bar {
    flex-direction: column;
    align-items: stretch;
  }

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

  .rule-toolbar {
    justify-content: flex-start;
  }

  .rule-title-bar {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }
}
</style>
