<template>
  <div class="offerBox">
    <div class="recruitment-status-filter">
      <a-tabs v-model="currentStatus" type="card" @change="handleStatusChange">
        <a-tab-pane v-for="item in statusOptions" :key="item.value">
          <span slot="tab" :data-status="item.code">
            {{ item.label }}({{ item.count }})
          </span>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator" style="position: absolute; right: 5px; top: 5px;">
      <a-button type="primary" class="pm-btn-primary" icon="plus" @click="handleAdd">发起Offer</a-button>
      <a-button type="primary" class="pm-btn-primary" icon="download" @click="handleExportXls('offer管理')">导出</a-button>
      <a-upload
        name="file"
        :showUploadList="false"
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrlNew"
        @change="handleImportExcelNew">
        <a-button type="primary" class="pm-btn-primary" icon="import">导入</a-button>
      </a-upload>
      <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
      <a-button type="primary" class="pm-btn-primary" icon="setting" @click="toggleColumnConfig">字段配置</a-button>

    </div>

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="4" :sm="8">
            <a-form-item label="姓名">
              <j-input v-model.trim="queryParam.xm" placeholder="请输入姓名" />
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="8">
            <a-form-item label="公司">
              <a-select
                v-model="companyId"
                allowClear
                showSearch
                optionFilterProp="children"
                placeholder="请选择公司"
                :loading="orgLoading"
                @change="handleCompanyChange"
              >
                <a-select-option v-for="item in companyList" :key="item.id" :value="item.id">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="8">
            <a-form-item label="部门">
              <a-cascader
                v-model="deptArr"
                :options="deptList"
                :disabled="!companyId || orgLoading"
                :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
                :show-search="{ filter: filterDeptOption }"
                changeOnSelect
                placeholder="请选择部门"
                @change="handleQueryDeptChange"
              />
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="8">
            <a-form-item label="岗位名称">
              <j-select-recruitment-post
                v-model="queryParam.postId"
                :dept-id="queryParam.deptId"
                url="/zpManage/hrmOffergl/getChildSequences"
                value-field="id"
                placeholder="请选择岗位名称"
              />
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="8">
            <a-form-item label="招聘计划ID">
              <a-input v-model.trim="queryParam.zpjhid" placeholder="招聘计划ID" />
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="8">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" class="pm-btn-primary" icon="search" @click="searchQuery">查询</a-button>
              <a-button class="pm-btn-reset" icon="reload" style="margin-left: 8px" @click="searchReset">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- table区域-begin -->
    <div>
      <!-- <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>
        已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a> 项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div> -->

      <a-table
        ref="table"
        size="middle"
        :scroll="{ x: true, y: 600 }"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        class="j-table-force-nowrap"
        @change="handleTableChange">
        <span slot="rowIndex" slot-scope="text, record, index">{{ getRowIndex(index) }}</span>
        <span slot="zt" slot-scope="text">
          <a-tag :color="getStatusColor(text)" style="margin-right: 0;">{{ getStatusText(text) }}</a-tag>
        </span>
        <span slot="action" slot-scope="text, record">
          <a @click="handleDetail(record)">详情</a>
          <a-divider type="vertical" />
          <a @click="handleEdit(record)">编辑</a>
          <a-divider v-if="getRecordStatus(record) === '审批中'" type="vertical" />
          <a v-if="getRecordStatus(record) === '审批中'" @click="handleApprove(record)">审批</a>
          <a-divider v-if="getRecordStatus(record) === '待确认'" type="vertical" />
          <a-dropdown v-if="getRecordStatus(record) === '待确认'">
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="确认候选人已接受该Offer吗？" @confirm="handleConfirm(record)">
                  <a>确认</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleReject(record)">拒绝</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确认放弃该Offer吗？" @confirm="handleAbandon(record)">
                  <a>放弃</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleRemind(record)">催签</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
          <a-divider v-if="getRecordStatus(record) === '已确认'" type="vertical" />
          <a v-if="getRecordStatus(record) === '已确认'" @click="handleOnboard(record)">发起入职</a>
        </span>
      </a-table>
    </div>

    <recruitment-offer-modal ref="modalForm" @ok="modalFormOk"></recruitment-offer-modal>
    <recruitment-offer-detail-modal ref="detailModal"></recruitment-offer-detail-modal>
    <recruitment-offer-approve-modal ref="approveModal" @ok="handleApproveOk"></recruitment-offer-approve-modal>
    <recruitment-offer-reject-modal
      ref="rejectModal"
      :submitting="rejectSubmitting"
      @ok="handleRejectOk"></recruitment-offer-reject-modal>
    
    <!-- 字段配置侧边栏 -->
    <ColumnConfigSidebar 
      :visible="columnConfigVisible" 
      :allColumns="columnConfigNew" 
      :fieldTitleMap="fieldTitleMap"
      @close="columnConfigVisible = false" 
      @confirm="handleColumnConfigConfirm" 
    />
  </div>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { columnConfigMixin } from '@/mixins/columnConfigMixin'
import { getAction, httpAction } from '@/api/manage'
import RecruitmentOfferModal from './modules/RecruitmentOfferModal.vue'
import RecruitmentOfferDetailModal from './modules/RecruitmentOfferDetailModal.vue'
import RecruitmentOfferApproveModal from './modules/RecruitmentOfferApproveModal.vue'
import RecruitmentOfferRejectModal from './modules/RecruitmentOfferRejectModal.vue'
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'
import { recruitmentOrgFilterMixin } from '../common/recruitmentOrgFilterMixin'

const STATUS_MAP = {
  审批中: { text: '审批中', color: 'orange' },
  待确认: { text: '待确认', color: 'blue' },
  已确认: { text: '已确认', color: 'green' },
  审批拒绝: { text: '审批拒绝', color: 'red' },
  已拒绝: { text: '已拒绝', color: '' },
  已放弃: { text: '已放弃', color: '' }
}

function getDefaultQueryParam() {
  return {
    xm: '',
    zt: '',
    deptId: '',
    deptPath: '',
    postId: '',
    postName: '',
    zpjhid: ''
  }
}

function formatValue(value) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') ? '-' : value
}

function formatCompanyName(value) {
  return formatValue(value) === '-' ? '-' : String(value).split('/')[0]
}

function formatPostValue(text, record) {
  return formatValue((record && (record.postName || record.postId_dictText || record.postId)) || text)
}

function formatLevelValue(text, record) {
  return formatValue((record && (record.levelName || record.levelId_dictText || record.levelId)) || text)
}

function formatSalary(value) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') ? '-' : value + 'K'
}

export default {
  name: 'RecruitmentOfferList',
  orgTreeUrl: '/zpManage/hrmOffergl/loadTreeRoot',
  mixins: [JeecgListMixin, mixinDevice, columnConfigMixin, recruitmentOrgFilterMixin],
  components: {
    RecruitmentOfferModal,
    RecruitmentOfferDetailModal,
    RecruitmentOfferApproveModal,
    RecruitmentOfferRejectModal,
    ColumnConfigSidebar
  },
  data() {
    return {
      disableMixinCreated: true,
      description: 'Offer信息列表',
      columnCode: 'HrmOffergl', // 字段配置组件标识
      queryParam: getDefaultQueryParam(),
      currentStatus: 'all',
      rejectSubmitting: false,
      statusOptions: [
        { label: '全部', value: 'all', code: 'all', count: 0 },
        { label: '审批中', value: '审批中', code: 'orange', count: 0 },
        { label: '待确认', value: '待确认', code: 'blue', count: 0 },
        { label: '已确认', value: '已确认', code: 'green', count: 0 },
        { label: '审批拒绝', value: '审批拒绝', code: 'red', count: 0 },
        { label: '已拒绝', value: '已拒绝', code: 'yjj', count: 0 },
        { label: '已放弃', value: '已放弃', code: 'fq', count: 0 }
      ],
      originalColumns: [
        { title: '状态', dataIndex: 'zt', align: 'center',width: 100,scopedSlots: { customRender: 'zt' } },
        { title: '姓名', dataIndex: 'xm', align: 'center', width: 130,customRender: formatValue },
        { title: '联系方式', dataIndex: 'lxfs', align: 'center', width: 130, customRender: formatValue },
        {
          title: '公司',
          dataIndex: 'deptPath',
          align: 'center',
          width: 160,
          ellipsis: true,
          customRender: (text) => this.renderTooltip(formatCompanyName(text), 140)
        },
        {
          title: '所属部门',
          dataIndex: 'dept_dictText',
          align: 'center',
          width: 160,
          ellipsis: true,
          customRender: (text) => this.renderTooltip(text, 140)
        },

        { title: '岗位名称', dataIndex: 'postName', align: 'center',  width: 160,
           customRender: (text) => {
              const value = formatValue(text)
              return <a-tooltip style='width: 140;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
                <template slot="title">{value}</template>
                <span >{value}</span>
              </a-tooltip>
            } },
        { title: '职级名称', dataIndex: 'levelName', align: 'center', width: 120, customRender: formatLevelValue },
        { title: '最晚回复时间', dataIndex: 'zwhfsj', align: 'center', width: 160, customRender: formatValue },
        { title: '薪资(K)', dataIndex: 'xz', align: 'center', width: 100, customRender: formatSalary },
        { title: '招聘计划ID', dataIndex: 'zpjhid', align: 'center', width: 130, customRender: formatValue },
        // { title: '审批人', dataIndex: 'sqr', align: 'center', width: 130, customRender: formatValue },
        // { title: '抄送人', dataIndex: 'csr', align: 'center', width: 130, customRender: formatValue },
         { title: '审批人', dataIndex: 'sqr', align: 'center', width: 140,
           customRender: (text) => {
              const value = formatValue(text)
              return <a-tooltip style='width: 120px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
                <template slot="title">{value}</template>
                <span >{value}</span>
              </a-tooltip>
            }
         },
        { title: '抄送人', dataIndex: 'csr', align: 'center', width: 140,
           customRender: (text) => {
              const value = formatValue(text)
              return <a-tooltip style='width: 120px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
                <template slot="title">{value}</template>
                <span >{value}</span>
              </a-tooltip>
            }
         },
      ],
      url: {
        list: '/zpManage/hrmOffergl/list',
        delete: '/zpManage/hrmOffergl/delete',
        deleteBatch: '/zpManage/hrmOffergl/deleteBatch',
        exportXlsUrl: '/zpManage/hrmOffergl/exportXls',
        importExcelUrl: 'zpManage/hrmOffergl/importExcel',
        importExcelUrlNewName: 'HrmOffergl',
        edit: '/zpManage/hrmOffergl/edit',
        queryById: '/zpManage/hrmOffergl/queryById'
      },
      dictOptions: {},
      superFieldList: []
    }
  },
  created() {
    this.ipagination.pageSize = 20
    this.ipagination.pageSizeOptions = ['10', '20', '50']
    this.getSuperFieldList()
    this.loadData(1)
    this.initDictConfig()
  },
  computed: {
    statusSearchOptions() {
      return this.statusOptions.filter(item => item.value !== 'all')
    },
    // 字段标题映射
    fieldTitleMap() {
      return {
        rowIndex: '序号',
        zt: '状态',
        xm: '姓名',
        lxfs: '联系方式',
        deptPath: '公司',
        dept_dictText: '所属部门',
        postName: '岗位名称',
        levelName: '职级名称',
        zwhfsj: '最晚回复时间',
        xz: '薪资(K)',
        zpjhid: '招聘计划ID',
        sqr: '审批人',
        csr: '抄送人'
      }
    },
    // 应用字段配置后的列
    columns() {
      const fixedColumns = [
        { title: '操作', dataIndex: 'action', align: 'center', fixed: 'right', width: 240, scopedSlots: { customRender: 'action' } }
      ]
      return this.applyColumnConfig(this.originalColumns, { fixedColumns })
    },
    // 字段配置数据
    columnConfigNew() {
      return this.getColumnConfigData()
    }
  },
  methods: {
    initDictConfig() {
    },
    renderTooltip(text, width) {
      const value = String(formatValue(text))
      return this.$createElement(
        'a-tooltip',
        {
          style: {
            width: `${width}px`,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            display: 'block'
          },
          props: { title: value }
        },
        [this.$createElement('span', value)]
      )
    },
    loadData(arg) {
      JeecgListMixin.methods.loadData.call(this, arg)
      this.getStatusTotal()
    },
    getStatusTotal() {
      const getTotalUrl = this.url.list.replace(/\/list$/, '/getTotal')
      httpAction(getTotalUrl, '', 'get').then(res => {
        if (res && res.success && Array.isArray(res.result)) {
          const totalMap = {}
          res.result.forEach(item => {
            totalMap[item.statusText] = Number(item.statustotal) || 0
          })
          this.statusOptions.forEach(item => {
            if(item.value === '已放弃'){
                item.count = totalMap['已放弃'] || 0
            }else{
                item.count = totalMap[item.label] || 0
            }
          })
        }
      })
    },
    getSuperFieldList() {
      this.superFieldList = [
        { type: 'string', value: 'xh', text: '序号', dictCode: '' },
        { type: 'string', value: 'zt', text: '状态', dictCode: '' },
        { type: 'string', value: 'xm', text: '姓名', dictCode: '' },
        { type: 'string', value: 'lxfs', text: '联系方式', dictCode: '' },
        // { type: 'string', value: 'gsmc', text: '公司名称', dictCode: '' },
        { type: 'string', value: 'dept', text: '所属部门', dictCode: '' },
        { type: 'string', value: 'postName', text: '岗位名称', dictCode: '' },
        { type: 'string', value: 'levelName', text: '职级名称', dictCode: '' },
        { type: 'datetime', value: 'zwhfsj', text: '最晚回复时间' },
        { type: 'string', value: 'xz', text: '薪资(K)', dictCode: '' },
        { type: 'string', value: 'zpjhid', text: '招聘计划ID', dictCode: '' },
        { type: 'string', value: 'sqr', text: '审批人', dictCode: '' },
        { type: 'string', value: 'csr', text: '抄送人', dictCode: '' },
        { type: 'string', value: 'gljl', text: '关联简历', dictCode: '' }
      ]
    },
    getRowIndex(index) {
      return (this.ipagination.current - 1) * this.ipagination.pageSize + index + 1
    },
    getStatusText(status) {
      return STATUS_MAP[status] ? STATUS_MAP[status].text : formatValue(status)
    },
    getStatusColor(status) {
      return STATUS_MAP[status] ? STATUS_MAP[status].color : ''
    },
    getStatusCount(status) {
      if (status === this.currentStatus || (status === 'all' && this.currentStatus === 'all')) {
        return this.ipagination.total || 0
      }
      return this.dataSource.filter(item => (status === 'all' ? true : item.zt === status)).length
    },
    getRecordStatus(record) {
      return record ? record.zt : ''
    },
    handleStatusChange() {
      this.queryParam.zt = this.currentStatus === 'all' ? '' : this.currentStatus
      this.loadData(1)
      this.onClearSelected()
    },
    searchQuery() {
      this.currentStatus = this.queryParam.zt || 'all'
      this.loadData(1)
      this.onClearSelected()
    },
    searchReset() {
      this.queryParam = getDefaultQueryParam()
      this.companyId = ''
      this.deptArr = []
      this.currentStatus = 'all'
      this.loadData(1)
      this.onClearSelected()
    },
    handleAdd() {
      this.$refs.modalForm.add()
    },
    handleEdit(record) {
      this.fetchRecord(record).then(detail => {
        this.$refs.modalForm.edit(detail)
      })
    },
    handleDetail(record) {
      this.fetchRecord(record).then(detail => {
        this.$refs.detailModal.open(detail)
      })
    },
    handleApprove(record) {
      this.fetchRecord(record).then(detail => {
        this.$refs.approveModal.open(detail)
      })
    },
    handleApproveOk({ action, record }) {
      this.updateRecordStatus(record, action === 'approve' ? '待确认' : '审批拒绝')
    },
    handleConfirm(record) {
      this.updateRecordStatus(record, '已确认')
    },
    handleReject(record) {
      this.rejectSubmitting = false
      this.$refs.rejectModal.open(record)
    },
    handleRejectOk({ record, reason }) {
      if (this.rejectSubmitting) {
        return
      }
      this.rejectSubmitting = true
      this.updateRecordStatus(record, '已拒绝', { jjyy: reason }).then(success => {
        this.rejectSubmitting = false
        if (success) {
          this.$refs.rejectModal.close()
        }
      })
    },
    handleRemind(record) {
      this.$message.success('已向 ' + (record.xm || '-') + ' 发送催签提醒')
    },
    handleAbandon(record) {
      this.updateRecordStatus(record, '已放弃')
    },
    handleOnboard(record) {
      this.$message.success('已为 ' + (record.xm || '-') + ' 发起入职流程')
    },
    fetchRecord(record) {
      if (!record || !record.id) {
        return Promise.resolve(record || {})
      }
      return getAction(this.url.queryById, { id: record.id }).then(res => {
        if (res && res.success && res.result) {
          return res.result
        }
        return record
      }).catch(() => record)
    },
    updateRecordStatus(record, status, extraFields) {
      const payload = Object.assign({}, record, extraFields || {}, { zt: status })
      return httpAction(this.url.edit, payload, 'put').then(res => {
        if (res && res.success) {
          this.$message.success(res.message || '状态已更新')
          this.loadData()
          return true
        } else {
          this.$message.warning((res && res.message) || '状态更新失败')
          return false
        }
      }).catch(() => {
        this.$message.warning('状态更新失败，请稍后重试')
        return false
      })
    }
  }
}
</script>

<style scoped lang="less">
@import '~@assets/less/common.less';

.offerBox {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 87vh;
  background: #fff;
  padding: 0 10px;
}

.recruitment-status-filter {
  margin-bottom: 10px;
  position: relative;

  /deep/ .ant-tabs-card > .ant-tabs-bar { margin: 0; }
  /deep/ .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab {
    color: #e6f7ff;
    border-radius: 10px 10px 0 0;
    background: #0082fc;
  }
  /deep/ .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active { background: #0082fc; }
}

.status-count {
  margin-left: 4px;
  font-size: 12px;
}



/* ===== 按钮 ===== */
.pm-btn-primary {
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
  

  &:hover,
  &:focus {
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    opacity: 0.92;
  }
}

.pm-btn-reset {
  height: 34px;
  border-radius: 8px;
  color: #64748b;
  border-color: #e2e8f0;
  background: #ffffff;

  &:hover {
    color: #1a2a3d;
    border-color: rgba(37, 99, 235, 0.35);
  }
}

.pm-btn-config {
  height: 34px;
  border-radius: 8px;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  background: #fafbfc;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    color: #2563eb;
    border-color: #93c5fd;
    background: #eff6ff;
  }

  .anticon {
    font-size: 13px;
  }
}

/* 状态色分色 */
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:not(.ant-tabs-tab-active):has([data-status="orange"]) {
  background: #fa8c16;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active:has([data-status="orange"]) {
  background: #fa8c16;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:not(.ant-tabs-tab-active):has([data-status="blue"]) {
  background: #0082fc;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active:has([data-status="blue"]) {
  background: #0082fc;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:not(.ant-tabs-tab-active):has([data-status="green"]) {
  background: #55c42a;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active:has([data-status="green"]) {
  background: #55c42a;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:not(.ant-tabs-tab-active):has([data-status="red"]) {
  background: #b9242c;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active:has([data-status="red"]) {
  background: #b9242c;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:not(.ant-tabs-tab-active):has([data-status="yjj"]) {
  background: #64748b;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active:has([data-status="yjj"]) {
  background: #64748b;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:not(.ant-tabs-tab-active):has([data-status="fq"]) {
  background: #64748b;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active:has([data-status="fq"]) {
  background: #64748b;
}
</style>
