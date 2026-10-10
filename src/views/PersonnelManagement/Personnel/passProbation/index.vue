<template>
  <div class="pass-probation-page">
    <!-- 状态筛选区域 -->
    <div class="pass-probation-status-filter">
      <a-tabs :activeKey="currentStatus" type="card" @change="handleStatusChange">
        <a-tab-pane v-for="item in statusOptions" :key="item.value">
          <span slot="tab" :data-status="item.code">
            {{ item.label }} <span class="status-count">({{ item.count }})</span>
          </span>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator pass-probation-toolbar">
      <!-- <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('试用期跟踪_发起转正申请')">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrlNew" @change="handleImportExcelNew">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload> -->
      <a-button type="primary" class="pm-btn-primary" icon="setting" @click="toggleColumnConfig"> 字段配置 </a-button>
      <!-- 高级查询区域 -->
      <!-- <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown> -->
    </div>

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="公司">
              <a-select
                v-model="queryParam.gs"
                allowClear
                showSearch
                optionFilterProp="children"
                :loading="orgLoading"
                placeholder="全部"
                @change="handleQueryCompanyChange"
              >
                <a-select-option v-for="item in companyList" :title="item.name" :key="item.id" :value="item.name">{{
                  item.name
                }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="所属部门">
              <a-cascader
                v-model="queryDeptPath"
                :options="queryDeptOptions"
                :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
                changeOnSelect
                allowClear
                placeholder="全部"
                @change="handleQueryDeptChange"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="岗位名称">
              <a-select
                v-model="queryParam.postId"
                allowClear
                showSearch
                optionFilterProp="children"
                :disabled="!queryParam.dept"
                :loading="queryPostLoading"
                placeholder="全部"
              >
                <a-select-option v-for="item in queryPostOptions" :key="item.value" :value="item.value">{{
                  item.label
                }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="工号">
              <a-input v-model.trim="queryParam.gh" allowClear placeholder="请输入工号" />
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="姓名">
              <a-input v-model.trim="queryParam.xm" allowClear placeholder="请输入姓名" />
            </a-form-item>
          </a-col>

          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="试用期开始">
              <a-date-picker
                v-model="queryParam.syqkssj"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="请选择日期"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="试用期结束">
              <a-date-picker
                v-model="queryParam.syqjssj"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="请选择日期"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24" class="search-btn-col">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" class="pm-btn-primary" icon="search" @click="searchQuery">查询</a-button>
              <a-button class="pm-btn-reset" icon="reload" @click="searchReset">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- table区域-begin -->
    <div>
      <!-- <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div> -->
      <!-- :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}" -->
      <a-table
        v-if="columnConfigReady"
        ref="table"
        size="middle"
        :scroll="tableScroll"
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
          <a @click="handleDetail(record)">详情</a>
          <template v-if="record.zt == '未转正' && record.brSpStatus == 1">
            <a-divider type="vertical" />
            <a style="color: #22c55e" @click="handleApprove(record)">审批</a>
          </template>

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

      <!-- 配置加载中的提示 -->
      <div v-else class="table-loading-placeholder">
        <a-spin tip="正在加载表格配置...">
          <div style="padding: 50px; background: rgba(0, 0, 0, 0.05); border-radius: 4px"></div>
        </a-spin>
      </div>
    </div>

    <hrm-syqgz-fqzzsq-modal ref="modalForm" @ok="modalFormOk"></hrm-syqgz-fqzzsq-modal>
    <regular-detail-modal ref="detailModal"></regular-detail-modal>
    <regular-approve-modal ref="approveModal" @ok="loadData"></regular-approve-modal>
    <column-config-sidebar
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
import { getAction, httpAction } from '@/api/manage'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { columnConfigMixin } from '@/mixins/columnConfigMixin'
import { tableAdaptiveMixin } from '@/mixins/tableAdaptiveMixin'
import HrmSyqgzFqzzsqModal from './modules/HrmSyqgzFqzzsqModal'
import RegularDetailModal from './modules/RegularDetailModal'
import RegularApproveModal from './modules/RegularApproveModal'
import { filterMultiDictText } from '@/components/dict/JDictSelectUtil'
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'

// 默认查询参数
function defaultQuery() {
  return {
    gh: '',
    xm: '',
    gs: undefined,
    companyId: '',
    dept: '',
    postId: '',
    zt: undefined,
    syqkssj: null, // 试用期开始
    syqjssj: null, // 试用期结束
  }
}

export default {
  name: 'HrmSyqgzFqzzsqList',
  mixins: [JeecgListMixin, mixinDevice, columnConfigMixin, tableAdaptiveMixin],
  components: {
    HrmSyqgzFqzzsqModal,
    RegularDetailModal,
    RegularApproveModal,
    ColumnConfigSidebar,
  },
  data() {
    return {
      description: '试用期跟踪_发起转正申请管理页面',
      // 禁用 mixin 自动加载
      disableMixinCreated: true,
      // 当前选中的状态
      currentStatus: '全部',
      // 状态选项配置
      statusOptions: [
        { label: '全部', value: '全部', code: 'all', count: 0 },
        { label: '已转正', value: '已转正', code: 'approved', count: 0 },
        { label: '未转正', value: '未转正', code: 'pending', count: 0 },
        { label: '拒绝转正', value: '拒绝转正', code: 'rejected', count: 0 },
      ],
      queryParam: {
        gh: '',
        xm: '',
        gs: undefined,
        companyId: '',
        dept: '',
        postId: '',
        zt: undefined,
        syqkssj: null, // 试用期开始
        syqjssj: null, // 试用期结束
      },
      // 公司列表
      companyList: [],
      // 查询部门选项
      queryDeptOptions: [],
      queryDeptPath: [],
      // 岗位选项
      queryPostRows: [],
      queryPostOptions: [],
      queryPostLoading: false,
      // 组织架构加载状态
      orgLoading: false,
      columnCode: 'HrmSyqgzFqzzsq', // 转正管理字段配置标识
      originalColumns: [
        {
          title: '状态',
          align: 'center',
          dataIndex: 'zt',
          customRender: (text) => {
            const colors = {
              已转正: '#55c42a',
              未转正: '#e6a23c',
              拒绝转正: '#f56c6c',
            }
            return text ? <a-tag color={colors[text] || ''}>{text}</a-tag> : '-'
          },
        },
        {
          title: '公司',
          align: 'center',
          dataIndex: 'companyId_dictText',
          ellipsis: true,
        },
        {
          title: '所属部门',
          align: 'center',
          dataIndex: 'dept_dictText',
          ellipsis: true,
        },
        {
          title: '岗位名称',
          align: 'center',
          dataIndex: 'postId_dictText',
          ellipsis: true,
        },
        {
          title: '职级名称',
          align: 'center',
          dataIndex: 'postRank_dictText',
          ellipsis: true,
          customRender: (text) => text || '-',
        },
        {
          title: '工号',
          align: 'center',
          dataIndex: 'gh',
        },
        {
          title: '姓名',
          align: 'center',
          dataIndex: 'xm',
        },
        {
          title: '试用期开始',
          align: 'center',
          dataIndex: 'syqkssj',
          customRender: (text) => text || '-',
        },
        {
          title: '试用期结束',
          align: 'center',
          dataIndex: 'syqjssj',
          customRender: (text) => text || '-',
        },
        {
          title: '计划转正日期',
          align: 'center',
          dataIndex: 'jhzzrq',
          customRender: (text) => text || '-',
        },
        {
          title: '申请人',
          align: 'center',
          dataIndex: 'createBy',
        },
      ],
      url: {
        list: '/ryManage/hrmSyqgzFqzzsq/list',
        delete: '/ryManage/hrmSyqgzFqzzsq/delete',
        deleteBatch: '/ryManage/hrmSyqgzFqzzsq/deleteBatch',
        exportXlsUrl: '/ryManage/hrmSyqgzFqzzsq/exportXls',
        importExcelUrl: 'ryManage/hrmSyqgzFqzzsq/importExcel',
        importExcelUrlNewName: 'HrmSyqgzFqzzsq',
        getTotal: '/ryManage/hrmSyqgzFqzzsq/getTotal',
      },
      dictOptions: {},
      superFieldList: [],
    }
  },
  created() {
    this.getSuperFieldList()
    this.loadOrgTree()
    // 先获取字段配置，再加载表格数据
    this.getColumnConfig().then(() => {
      this.loadData(1)
    })
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
    fieldTitleMap() {
      const map = {}
      this.originalColumns.forEach((col) => {
        if (col.dataIndex && col.title) {
          map[col.dataIndex] = col.title
        }
      })
      return map
    },
    columnConfigNew() {
      return this.getColumnConfigData()
    },
    columns() {
      const fixedColumns = [
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 140,
          scopedSlots: { customRender: 'action' },
        },
      ]

      const dynamicColumns = []

      // 序号列始终显示
      dynamicColumns.push({
        title: '序号',
        dataIndex: '',
        key: 'rowIndex',
        width: 60,
        align: 'center',
        customRender: function (t, r, index) {
          return parseInt(index) + 1
        },
      })

      // 应用字段配置到 originalColumns
      const configuredColumns = this.applyColumnConfig(this.originalColumns, {
        fixedColumns: [],
        excludedFields: [],
      })

      // 合并数据列（不包含操作列）
      const dataColumns = [...dynamicColumns, ...configuredColumns]

      // 智能处理：当没有横向滚动条时，移除最后一个非固定列的 width
      const processedColumns = this.adaptiveColumnsWidth(dataColumns, fixedColumns)

      return [...processedColumns, ...fixedColumns]
    },
  },
  methods: {
    initDictConfig() {},
    // 打开详情弹窗
    handleDetail(record) {
      this.$refs.detailModal.open(record)
    },
    // 打开审批弹窗
    handleApprove(record) {
      this.$refs.approveModal.open(record)
    },
    // 加载组织架构树
    loadOrgTree() {
      this.orgLoading = true
      getAction('/org/hrmOrg/loadTreeRoot', { pid: 0 })
        .then((res) => {
          const roots = res && res.success && Array.isArray(res.result) ? res.result : []
          this.companyList = roots.length && Array.isArray(roots[0].children) ? roots[0].children : []
        })
        .catch(() => {
          this.companyList = []
          this.$message.error('组织架构加载失败，请稍后重试')
        })
        .finally(() => {
          this.orgLoading = false
        })
    },
    // 重写 loadData 方法
    loadData(arg) {
      JeecgListMixin.methods.loadData.call(this, arg)
      this.getStatusTotal()
    },
    // 获取状态统计
    getStatusTotal() {
      httpAction(this.url.getTotal, '', 'get')
        .then((res) => {
          if (!res || !res.success || !Array.isArray(res.result)) {
            throw new Error((res && res.message) || '状态统计加载失败')
          }
          const totalMap = {}
          res.result.forEach((item) => {
            totalMap[item.statusText] = Number(item.statustotal) || 0
          })
          this.statusOptions.forEach((item) => {
            item.count = totalMap[item.label] || 0
          })
        })
        .catch((error) => {
          this.$message.warning(error.message || '状态统计加载失败')
        })
    },
    // 处理状态切换
    handleStatusChange(status) {
      this.currentStatus = status
      if (status === '全部') {
        delete this.queryParam.zt
      } else {
        this.$set(this.queryParam, 'zt', status)
      }
      this.onClearSelected()
      this.loadData(1)
    },
    // 公司选择变化
    handleQueryCompanyChange(companyName) {
      const company = this.companyList.find((item) => item.name === companyName)
      this.queryDeptOptions = company ? [company] : []
      this.queryDeptPath = []
      this.queryParam.companyId = ''
      this.queryParam.dept = ''
      this.resetQueryPostOptions()
    },
    // 部门选择变化
    handleQueryDeptChange(value) {
      const path = Array.isArray(value) ? value.map((item) => String(item)) : []
      this.queryDeptPath = path
      this.queryParam.companyId = path[0] || ''
      this.queryParam.dept = path[path.length - 1] || ''
      this.resetQueryPostOptions()
      this.loadQueryPostOptions(this.queryParam.dept)
    },
    // 重置岗位选项
    resetQueryPostOptions() {
      this.queryPostRows = []
      this.queryPostOptions = []
      this.queryParam.postId = ''
    },
    // 加载岗位选项
    loadQueryPostOptions(deptId) {
      if (!deptId) return Promise.resolve()
      this.queryPostLoading = true
      return getAction('/hrJobSequence/hrJobSequence/getChildSequences', {
        deptId,
        column: 'createTime',
        order: 'desc',
        pageNo: 1,
        pageSize: 99999,
      })
        .then((res) => {
          const rows = Array.isArray(res) ? res : (res && res.result) || []
          this.queryPostRows = rows
          this.queryPostOptions = rows.map((item) => ({ label: item.postName, value: item.id }))
        })
        .catch(() => {
          this.resetQueryPostOptions()
          this.$message.error('岗位加载失败，请稍后重试')
        })
        .finally(() => {
          this.queryPostLoading = false
        })
    },
    // 重置搜索
    searchReset() {
      this.queryParam = defaultQuery()
      this.queryDeptPath = []
      this.queryDeptOptions = []
      this.queryPostRows = []
      this.queryPostOptions = []
      this.queryPostLoading = false
      this.currentStatus = '全部'
      this.onClearSelected()
      this.loadData(1)
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'hrmSyqgzId', text: '主表', dictCode: '' })
      fieldList.push({ type: 'string', value: 'companyId', text: '公司', dictCode: 'sys_depart,depart_name,id' })
      fieldList.push({ type: 'string', value: 'dept', text: '所属部门', dictCode: 'sys_depart,depart_name,id' })
      fieldList.push({ type: 'string', value: 'postId', text: '岗位名称', dictCode: 'hr_job_sequence,post_name,id' })
      fieldList.push({ type: 'string', value: 'postRank', text: '职级名称', dictCode: 'hr_job_level,level_name,id' })
      fieldList.push({ type: 'string', value: 'xm', text: '姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'gh', text: '工号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'zzyj', text: '转正意见', dictCode: '' })
      fieldList.push({ type: 'string', value: 'spr', text: '审批人', dictCode: '' })
      fieldList.push({ type: 'string', value: 'csr', text: '抄送人', dictCode: '' })
      fieldList.push({ type: 'string', value: 'deptPath', text: '部门路径', dictCode: '' })
      this.superFieldList = fieldList
    },
  },
}
</script>
<style scoped lang="less">
@import './passProbation.less';

.table-loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 40px 0;
}
/deep/ .table-page-search-wrapper .ant-form-item-control-wrapper {
  min-width: 0;
}
</style>
