<template>
  <a-card :bordered="false" :bodyStyle="{ padding: '0' }" class="cardrepair-page">
    <div class="cardrepair-header">
      <div class="cardrepair-header__content">
        <!-- {{$store.state.user.info}} -->
        <h2>补卡申请管理</h2>
        <p>管理员工补卡申请，支持申请提交、审批进度跟踪与历史记录查看。</p>
      </div>
    </div>

    <div class="rule-section">
      <div class="rule-section__title">补卡申请规则</div>
      <div class="rule-section__cards">
        <div v-for="item in ruleList" :key="item.title" class="rule-card">
          <div class="rule-card__content">
            <span class="rule-card__title">{{ item.title }}:</span>
            <span class="rule-card__desc">{{ item.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-shell">
      <div class="table-panel">
        <a-tabs :activeKey="activeTab" @change="handleTabChange">
          <a-tab-pane v-for="tab in statusTabs" :key="tab.key" :tab="tab.label" />
        </a-tabs>

        <div class="table-page-search-wrapper cardrepair-search">
          <a-form layout="inline" @keyup.enter.native="searchQuery">
            <a-row :gutter="16">
              <a-col :xl="6" :lg="8" :md="12" :sm="24">
                <a-form-item label="申请人">
                  <a-input v-model="queryParam.applicant" allowClear placeholder="请输入申请人" />
                </a-form-item>
              </a-col>
              <a-col :xl="6" :lg="8" :md="12" :sm="24">
                <a-form-item label="部门">
                  <a-input v-model="queryParam.bm" allowClear placeholder="请输入部门名称" />
                </a-form-item>
              </a-col>
              <a-col :xl="8" :lg="8" :md="24" :sm="24">
                <a-form-item label="补卡日期">
                  <j-date v-model="queryParam.cardDate_begin" placeholder="开始日期" style="width: 45%" />
                  <span class="query-split-line">~</span>
                  <j-date v-model="queryParam.cardDate_end" placeholder="结束日期" style="width: 45%" />
                </a-form-item>
              </a-col>
              <a-col :xl="4" :lg="24" :md="24" :sm="24">
                <span class="table-page-search-submitButtons">
                  <a-button type="primary" @click="searchQuery">查询</a-button>
                  <a-button style="margin-left: 8px" @click="searchReset">重置</a-button>
                </span>
              </a-col>
            </a-row>
          </a-form>
        </div>

        <div class="toolbar-row">
          <div class="toolbar-row__left">
            <a-button :disabled="permissionButton" type="primary" icon="plus" @click="handleAdd">新增补卡申请</a-button>
            <a-button icon="download" @click="handleExportXls('补卡申请表单')">导出</a-button>
            <a-upload
              name="file"
              :showUploadList="false"
              :multiple="false"
              :headers="tokenHeader"
              :action="importExcelUrlNew"
              @change="handleImportExcelNew"
            >
              <a-button icon="import">导入</a-button>
            </a-upload>
            <!-- <a-button icon="filter" @click="superQuery">高级查询</a-button> -->
           <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>
            <a-dropdown v-if="selectedRowKeys.length > 0">
              <a-menu slot="overlay">
                <a-menu-item key="1" @click="batchDel">
                  <a-icon type="delete" />
                  删除
                </a-menu-item>
              </a-menu>
              <a-button>
                批量操作
                <a-icon type="down" />
              </a-button>
            </a-dropdown>
          </div>
          <div class="toolbar-row__right">
            <!-- <span>当前视图：{{ activeTabLabel }}</span> -->
          </div>
        </div>

        <div class="selection-bar">
          <div class="ant-alert ant-alert-info">
            <i class="anticon anticon-info-circle ant-alert-icon"></i>
            已选择 <a>{{ selectedRowKeys.length }}</a> 项
            <a style="margin-left: 24px" @click="onClearSelected">清空</a>
          </div>
        </div>

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
          <template slot="imgSlot" slot-scope="text,record">
            <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
            <img
              v-else
              :src="getImgView(text)"
              :preview="record.id"
              height="25px"
              alt=""
              style="max-width:80px;font-size: 12px;font-style: italic;"
            />
          </template>
          <template slot="fileSlot" slot-scope="text">
            <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
            <a-button
              v-else
              :ghost="true"
              type="primary"
              icon="download"
              size="small"
              @click="downloadFile(text)"
            >
              下载
            </a-button>
          </template>
          <template slot="statusSlot" slot-scope="text">
            <a-tag :color="getStatusMeta(text).color">{{ getStatusMeta(text).text }}</a-tag>
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
                <a-menu-item v-if="getStatusMeta(record.bpmStatus).key === 'draft'">
                  <a @click="startProcess(record)">发起流程</a>
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
    </div>

    <process-cardrepair-modal ref="modalForm" @ok="modalFormOk"></process-cardrepair-modal>
  </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import ProcessCardrepairModal from './modules/ProcessCardrepairModal'
import { postAction,getAction } from '@/api/manage'
import {ajaxGetDictItems,getDictItemsFromCache} from '@/api/api'

export default {
  name: 'ProcessCardrepairList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    ProcessCardrepairModal
  },
  data() {
    return {
      description: '补卡申请表单管理页面',
      activeTab: 'all',
      ruleList: [
        { title: '申请时限', desc: '收到缺卡或异常提醒后，请在 3 天内提交补卡申请。' },
        { title: '申请次数', desc: '每月最多可提交 3 次补卡申请，超限后需由管理员介入。' },
        { title: '审批追踪', desc: '发起后可在右侧详情中查看审批节点与当前处理人。' },
        { title: '材料要求', desc: '涉及外出、设备故障等情况时，建议同步上传相关附件。' }
      ],
      statusTabs: [
        { key: 'all', label: '全部申请', queryValue: '' },
        // { key: 'draft', label: '待提交', queryValue: '1' },
        { key: 'processing', label: '审批中', queryValue: '2' },
        { key: 'approved', label: '已通过', queryValue: '3' },
        { key: 'rejected', label: '已驳回', queryValue: '4' },
        { key: 'canceled', label: '已撤销', queryValue: '5' }
      ],
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function(t, r, index) {
            return parseInt(index) + 1
          }
        },
        {
          title: '申请人',
          align: 'center',
          dataIndex: 'applicant',
          width: 120
        },
        {
          title: '部门',
          align: 'center',
          dataIndex: 'bm',
          width: 140
        },
        {
          title: '补卡日期',
          align: 'center',
          dataIndex: 'cardDate',
          width: 120,
          customRender: function(text) {
            return !text ? '' : (text.length > 10 ? text.substr(0, 10) : text)
          }
        },
        {
          title: '补卡时间',
          align: 'center',
          dataIndex: 'repairTime',
          width: 170
        },
        {
          title: '提交时间',
          align: 'center',
          dataIndex: 'subTime',
          width: 170
        },
        {
          title: '异常类型',
          align: 'center',
          dataIndex: 'errType',
          width: 120
        },
        {
          title: '补卡原因',
          align: 'center',
          dataIndex: 'reason',
          ellipsis: true,
          width: 220
        },
        {
          title: '流程状态',
          align: 'center',
          dataIndex: 'bpmStatus',
          width: 120,
          scopedSlots: { customRender: 'statusSlot' }
        },
        {
          title: '当前审批人',
          align: 'center',
          dataIndex: 'spr',
          width: 140
        },
        {
          title: '当前阶段',
          align: 'center',
          dataIndex: 'dqjd',
          width: 140
        },
        {
          title: '附件',
          align: 'center',
          dataIndex: 'fj',
          width: 120,
          scopedSlots: { customRender: 'fileSlot' }
        },
        {
          title: '选择流程id',
          align: 'center',
          dataIndex: 'customProcessId',
          width: 140
        },
        {
          title: '当前审批节点排序',
          align: 'center',
          dataIndex: 'px',
          width: 140
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 150,
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: '/cardRepair/processCardrepair/list',
        delete: '/cardRepair/processCardrepair/delete',
        deleteBatch: '/cardRepair/processCardrepair/deleteBatch',
        exportXlsUrl: '/cardRepair/processCardrepair/exportXls',
        importExcelUrl: 'cardRepair/processCardrepair/importExcel',
        importExcelUrlNewName: 'ProcessCardrepair',
        startProcess: '/act/process/extActProcess/startMutilProcess'
      },
      flowCode: 'dev_process_b_cardrepair_001',
      dictOptions: [],
      superFieldList: [],
      userNo:'',
      permissionButton:true
    }
  },
  created() {
    this.userNo = this.$store.state.user.info.username
    this.getSuperFieldList()
    this.checkNum()
  },
  computed: {
    importExcelUrl() {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
    activeTabLabel() {
      const current = this.statusTabs.find(item => item.key === this.activeTab)
      return current ? current.label : '全部申请'
    },
    username() {
   	   return this.$store.state.user.info.username
	  }
  },
  methods: {
    loadData(arg) {
      if(!this.url.list){
        this.$message.error("请设置url.list属性!")
        return
      }
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1;
      }
      var params = this.getQueryParams();//查询条件
      this.loading = true;
      getAction(this.url.list, params).then((res) => {
        if (res.success) {
          //update-begin---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
          this.dataSource = res.result.records||res.result;
          if(res.result.total)
          {
            this.ipagination.total = res.result.total;
          }else{
            this.ipagination.total = 0;
          }

          this.checkNum()
          //update-end---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
        }
        if(res.code===510){
          this.$message.warning(res.message)
        }
        this.loading = false;
      })
    },
    checkNum(){
      this.userNo = this.$store.state.user.info.username
      // if(!this.userNo) return
      postAction(`/cardRepair/processCardrepair/check?applicantNo=${this.userNo}`).then(res=>{
        console.log('res',res)
        this.permissionButton = !res.success
      })
    },
    startProcess(record) {
      this.$confirm({
        title: '提示',
        content: '确认提交流程吗?',
        onOk: () => {
          const params = {
            flowCode: this.flowCode,
            id: record.id,
            formUrl: 'cardRepair/modules/ProcessCardrepairForm',
            formUrlMobile: ''
          }
          postAction(this.url.startProcess, params).then(res => {
            if (res.success) {
              this.$message.success(res.message)
              this.loadData()
              this.onClearSelected()
            } else {
              this.$message.warning(res.message)
            }
          }).catch(() => {
            this.$message.warning('不识别的请求!')
          })
        }
      })
    },
    initDictConfig() {
    },
    handleTabChange(tabKey) {
      this.activeTab = tabKey
      this.applyActiveStatusQuery()
      this.onClearSelected()
      this.loadData(1)
    },
    applyActiveStatusQuery() {
      const current = this.statusTabs.find(item => item.key === this.activeTab)
      if (current && current.queryValue) {
        this.queryParam = Object.assign({}, this.queryParam, { bpmStatus: current.queryValue })
      } else {
        const nextQuery = Object.assign({}, this.queryParam)
        delete nextQuery.bpmStatus
        this.queryParam = nextQuery
      }
    },
    searchReset() {
      this.queryParam = {}
      this.applyActiveStatusQuery()
      this.loadData(1)
      this.onClearSelected()
    },
    getStatusMeta(status) {
      const raw = status === null || status === undefined ? '' : String(status).trim()

      if (raw === '1') { //待提交
        return { key: 'draft', text: '待提交', color: 'gold' }
      }
      if (raw === '2') { //处理中
        return { key: 'processing', text: '审批中', color: 'blue' }
      }
      if (raw === '3') { //已完成
        return { key: 'approved', text: '已通过', color: 'green' }
      }
      if (raw === '4') { //已作废
        return { key: 'rejected', text: '已驳回', color: 'red' }
      }
      return { key: 'unknown', text: raw || '未设置', color: '' }
    },
    getSuperFieldList() {
      const fieldList = []
      fieldList.push({ type: 'string', value: 'applicant', text: '申请人', dictCode: '' })
      fieldList.push({ type: 'date', value: 'cardDate', text: '补卡日期' })
      fieldList.push({ type: 'datetime', value: 'repairTime', text: '补卡时间' })
      fieldList.push({ type: 'datetime', value: 'subTime', text: '提交时间' })
      fieldList.push({ type: 'string', value: 'errType', text: '异常类型', dictCode: '' })
      fieldList.push({ type: 'string', value: 'reason', text: '补卡原因', dictCode: '' })
      fieldList.push({ type: 'string', value: 'bpmStatus', text: '流程状态', dictCode: '' })
      fieldList.push({ type: 'string', value: 'fj', text: '附件', dictCode: '' })
      fieldList.push({ type: 'string', value: 'bm', text: '部门', dictCode: '' })
      fieldList.push({ type: 'string', value: 'spr', text: '当前审批人', dictCode: '' })
      fieldList.push({ type: 'string', value: 'dqjd', text: '当前阶段', dictCode: '' })
      fieldList.push({ type: 'string', value: 'customProcessId', text: '选择流程id', dictCode: '' })
      fieldList.push({ type: 'int', value: 'px', text: '当前审批节点排序', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped lang="less">
@import '~@assets/less/common.less';

.cardrepair-page {
  background: #f5f7fb;
  height: calc(100vh - 120px - 24px);
  overflow: auto;
}

.cardrepair-header {
  padding: 20px 28px;
  color: #fff;
  background: linear-gradient(135deg, #1677ff 0%, #4f8bff 55%, #8cb7ff 100%);
}

.cardrepair-header__content {
  max-width: 520px;
}

.cardrepair-header__eyebrow {
  display: inline-block;
  margin-bottom: 8px;
  padding: 3px 10px;
  font-size: 11px;
  letter-spacing: 0.08em;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
}

.cardrepair-header h2 {
  margin-bottom: 6px;
  color: #fff;
  font-size: 22px;
  font-weight: 600;
}

.cardrepair-header p {
  margin-bottom: 0;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.88);
}

.rule-section {
  padding: 10px 28px 0;
  background: #eef3fb;
}

.rule-section__title {
  margin-bottom: 10px;
  padding: 0 2px;
  color: #1f2d3d;
  font-size: 14px;
  font-weight: 600;
}

.rule-section__cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.rule-card {
  min-height: 58px;
  padding: 12px 14px;
  border: 1px solid #e7edf7;
  border-left: 4px solid #2f73ff;
  border-radius: 8px;
  background: #fff;
  box-shadow: none;
}

.rule-card__content {
  line-height: 1.5;
}

.rule-card__title {
  margin-right: 4px;
  color: #1f2d3d;
  font-size: 13px;
  font-weight: 600;
}

.rule-card__desc {
  color: #6b7a90;
  font-size: 12px;
  line-height: 1.5;
}

.panel-shell {
  padding: 14px 28px 28px;
}

.table-panel {
  padding: 18px 20px 20px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 32px rgba(31, 76, 148, 0.06);
}

.cardrepair-search {
  padding: 8px 0 4px;
}

.query-split-line {
  display: inline-block;
  width: 10%;
  text-align: center;
  color: #8c8c8c;
}

.toolbar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px 18px;
  border-radius: 14px;
  background: #f7faff;
}

.toolbar-row__left {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-row__right {
  color: #7a8799;
  font-size: 13px;
  white-space: nowrap;
}

.selection-bar {
  margin-bottom: 16px;
}

@media (max-width: 1200px) {
  .rule-section__cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .cardrepair-header,
  .panel-shell {
    padding: 16px;
  }

  .rule-section {
    padding: 12px 16px 0;
  }

  .rule-section__cards {
    grid-template-columns: 1fr;
  }

  .table-panel {
    padding: 16px 14px;
  }

  .toolbar-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-row__right {
    white-space: normal;
  }
}
</style>
