<template>
  <div class="rule-list-panel">
    <!-- 标题栏 -->
    <div class="rule-title-bar">
      <div class="rule-main-title">考勤规则管理</div>

      <!-- 操作按钮区域 -->
      <div class="rule-toolbar">
        <div class="rule-toolbar-left">
          <a-button type="primary" class="rule-btn-primary" icon="plus" @click="handleAdd">新增</a-button>
          <a-button type="primary" class="rule-btn-primary" icon="download" @click="handleExportXls('考勤规则主表')">导出</a-button>
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

    <!-- 筛选区域 -->
    <div class="rule-filter-bar">
      <div class="rule-filter-item">
        <span class="rule-filter-label">规则名称</span>
        <j-dict-select-tag v-model="queryParam.ruleName" dictCode="rule_name" allowClear
          placeholder="请选择规则名称" class="rule-filter-dict" />
      </div>
      <div class="rule-filter-item">
        <span class="rule-filter-label">规则说明</span>
        <a-input v-model="queryParam.ruleSm" allowClear placeholder="请输入规则说明" class="rule-filter-input" @pressEnter="searchQuery" />
      </div>
      <div class="rule-filter-item">
        <span class="rule-filter-label">打卡方式</span>
        <j-dict-select-tag v-model="queryParam.dkfs" dictCode="hrm_dkfs" allowClear placeholder="请选择打卡方式" class="rule-filter-dict" />
      </div>

      <div class="rule-filter-actions">
        <a-button type="primary" class="rule-btn-primary" @click="searchQuery">查询</a-button>
        <a-button class="rule-btn-reset" @click="searchReset">重置</a-button>
      </div>
    </div>

    <!-- table区域 -->
    <div class="rule-table-wrap">
      <div class="ant-alert ant-alert-info" style="margin-bottom: 12px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
          selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
        :dataSource="dataSourceNew" :pagination="ipagination" :loading="loading"
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
        <template slot="ruleName" slot-scope="text, record">
          <a-tag :color="dictColor[text]?dictColor[text].color:null">
            {{text}}
          </a-tag>
        </template>

        <template slot="bdbm" slot-scope="text, record">
          <a-tag v-for="(item, index) in getTags(record)" :key="index" :color="item.color">
            {{ item.label }}
          </a-tag>
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

    <hr-kq-rule-modal ref="modalForm" @ok="modalFormOk"></hr-kq-rule-modal>
  </div>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import HrKqRuleModal from './modules/HrKqRuleModal.vue'
import { httpAction } from '@/api/manage'

import { watch } from 'vue';

export default {
  name: 'HrKqRuleList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    HrKqRuleModal
  },
  data() {
    return {
      description: '考勤规则主表管理页面',
      // 表头
      columns: [
        {
          title: '规则组',
          align: "center",
          dataIndex: 'bdbm',
          width: 200,

          scopedSlots: { customRender: 'bdbm' }
        },
        {
          title: '规则名称',
          align: "center",
          dataIndex: 'ruleName',
          scopedSlots: { customRender: 'ruleName' }

        },
        {
          title: '规则说明',
          align: "center",
          dataIndex: 'ruleSm',
          width: 150,
          ellipsis: true,
          customRender: (text) => {
            return (
              <a-tooltip style="width:180px;text-align:center;text-overflow:ellipsis;overflow:hidden;display:block">
                <template slot="title">{text}</template>​ <span style="color:#55aaff">{text}</span>
              </a-tooltip>
            )
          },
        },
        {
          title: '打卡方式',
          align: "center",
          dataIndex: 'dkfs_dictText',
          customRender: function (t, r, index) {
            return (<a-tag color='blue'>{t}</a-tag>)
          }
        },

        {
          title: '上午时段',
          children: [
            {
              title: '开始',
              align: "center",
              width: 120,
              dataIndex: 'morning.sbdaate',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
            {
              title: '结束',
              align: "center",
              width: 120,
              dataIndex: 'morning.xbdate',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
          ]
        },
        {
          title: '下午时段',
          children: [
            {
              title: '开始',
              align: "center",
              width: 120,

              dataIndex: 'afternoon.sbdaate',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
            {
              title: '结束',
              align: "center",
              width: 120,

              dataIndex: 'afternoon.xbdate',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
          ]
        },
        {
          title: '上半夜班',
          children: [
            {
              title: '开始',
              align: "center",
              width: 120,

              dataIndex: 'nightTop.sbdaate',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
            {
              title: '结束',
              align: "center",
              width: 120,

              dataIndex: 'nightTop.xbdate',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
          ]
        },
        {
          title: '下半夜班',
          children: [
            {
              title: '开始',
              align: "center",
              width: 120,

              dataIndex: 'nightBottom.sbdaate',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
            {
              title: '结束',
              align: "center",
              width: 120,

              dataIndex: 'nightBottom.xbdate',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
          ]
        },
        {
          title: '加班时段',
          align: "center",

          children: [
            {
              title: '开始时间',
              align: "center",
              width: 140,
              dataIndex: 'startoutTime',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
          ]
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
        list: "/hrm/hrKqRule/listByRuleId?historyId=0",
        delete: "/hrm/hrKqRule/delete",
        deleteBatch: "/hrm/hrKqRule/deleteBatch",
        exportXlsUrl: "/hrm/hrKqRule/exportXls",
        importExcelUrl: "hrm/hrKqRule/importExcel",
        importExcelUrlNewName: 'HrKqRule',

      },
      dataSourceNew: [],
      dictOptions: {},
      superFieldList: [],
      dictColor: {}
    }
  },
  created() {
    this.getDictColor()
    this.getSuperFieldList();
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    },
  },
  watch: {
    dataSource: {
      handler(newVal, oldVal) {
        this.dataSourceNew = []

        if (newVal && newVal.length <= 0) {
          return
        }
        let arr = JSON.parse(JSON.stringify(newVal))

        arr.forEach(item => {
          if (item.dkfs == 0 || item.dkfs == 3){
            item.hrKqRuleGddatedk.forEach(item2 => {
              item[item2.sjd || 'morning']={
                  sbdaate: item2.sbdaate,
                  xbdate: item2.xbdate
                }
            })
            item['startoutTime'] =  item.hrKqRuleGddatedk[0].startoutTime
          }
        })
        this.dataSourceNew = arr.map(item => item)
        console.log(this.dataSourceNew)
      },
      deep: true
    }
  },
  methods: {
    getDictColor(){
      httpAction('sys/dictItem/list?dictId=2072281509479194625&pageSize=100','','get').then(res => {
        if (res.success) {
          let { records } = res.result
          records.forEach(item => {
            if(item.dataJson){
              item.dataJson = JSON.parse(item.dataJson)
            }
            this.dictColor[item.itemText] = {
              color: item.dataJson?item.dataJson.color : ''
            }
          })
          console.log(this.dictColor)
        }
      })
    },
    getTags(record) {
      let bdbm, bdgw, bdry = ''
      let arr = []
      if (record.bdbm) {
        bdbm = JSON.parse(record.bdbmJson)
        bdbm.forEach(item => {
          arr.push({
            label: item.label,
            color: "blue"
          })
        })
      }
      if (record.bdgw) {
        bdgw = JSON.parse(record.bdgwJson)
        bdgw.forEach(item => {
          arr.push({
            label: item.label,
            color: "cyan"
          })
        })
      }
      if (record.bdry) {
        bdry = JSON.parse(record.bdryJson)
        bdry.forEach(item => {
          arr.push({
            label: item.label,
            color: "purple"
          })
        })
      }
      if (arr.length > 3) {
        arr = arr.slice(0, 3)
      }

      return arr
    },
    initDictConfig() {
    },
    getSuperFieldList() {
      let fieldList = [];
      fieldList.push({ type: 'string', value: 'ruleName', text: '规则名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ruleCode', text: '规则编码', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'currentVersion', text: '当前生效版本号', dictCode: '' })
      fieldList.push({ type: 'int', value: 'isDefault', text: '是否为系统默认规则', dictCode: '' })
      fieldList.push({ type: 'string', value: 'companyId', text: '适用公司 ID（NULL 表示全集团适用）', dictCode: '' })
      fieldList.push({ type: 'int', value: 'status', text: '状态：0 - 草稿，1 - 已发布，2 - 已停用', dictCode: '' })
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
.rule-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 12px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  gap: 16px;
}

.rule-main-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a2a3d;
  flex-shrink: 0;
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
    background: #ffffff;
  }

  /deep/ .ant-table-tbody > tr > td {
    background: #ffffff;
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
  .rule-filter-dict {
    flex: 1;
    width: auto;
  }

  .rule-title-bar {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .rule-toolbar {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
