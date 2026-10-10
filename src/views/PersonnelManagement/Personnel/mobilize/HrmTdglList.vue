<template>
  <div class="pass-probation-page" :bordered="false">
    <!-- 状态筛选区域 -->
    <div class="transfer-status-filter">
      <div class="transfer-status-header">
        <a-tabs :activeKey="currentStatus" type="card" @change="handleStatusChange">
          <a-tab-pane v-for="item in statusOptions" :key="item.value">
            <span slot="tab" :data-status="item.code">
              {{ item.label }} <span class="status-count">({{ item.count }})</span>
            </span>
          </a-tab-pane>
        </a-tabs>
        <div>
          <a-button type="primary" class="tdgl-btn-primary" icon="plus" @click="handleAdd">发起调动</a-button>
          <a-button
            type="primary"
            class="tdgl-btn-primary"
            icon="setting"
            style="margin-left: 8px"
            @click="toggleColumnConfig"
          >
            字段配置
          </a-button>
          <a-dropdown v-if="selectedRowKeys.length > 0">
            <a-menu slot="overlay">
              <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
            </a-menu>
            <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
          </a-dropdown>
        </div>
      </div>
    </div>

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="4" :lg="6" :md="8" :sm="12" :xs="24">
            <a-form-item label="工号">
              <a-input v-model.trim="queryParam.gh" allowClear placeholder="请输入工号" />
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="6" :md="8" :sm="12" :xs="24">
            <a-form-item label="姓名">
              <a-input v-model.trim="queryParam.xm" allowClear placeholder="请输入姓名" />
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="6" :md="8" :sm="12" :xs="24">
            <a-form-item label="调动类型">
              <a-select v-model="queryParam.ddlx" allowClear placeholder="全部">
                <a-select-option value="调岗">调岗</a-select-option>
                <a-select-option value="晋升">晋升</a-select-option>
                <a-select-option value="降职">降职</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="5" :md="8" :sm="12" :xs="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" class="tdgl-btn-primary" icon="search" @click="searchQuery">查询</a-button>
              <a-button class="tdgl-btn-reset" icon="reload" @click="searchReset">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- table区域-begin -->
    <div>
      <!-- <div class="ant-alert ant-alert-info" style="margin-bottom: 16px">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择
        <a style="font-weight: 600">{{ selectedRowKeys.length }}</a
        >项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div> -->

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
          <template v-if="record.zt == '审批中'">
            <template v-if="record.brSpStatus == 1">
              <a-divider type="vertical" />
              <a style="color: #22c55e" @click="handleApprove(record)">审批</a>
            </template>
            <a-divider type="vertical" />
            <a style="color: #f56c6c" @click="handleCancelTransfer(record)">取消</a>
          </template>
        </span>
      </a-table>

      <!-- 配置加载中的提示 -->
      <div v-else class="table-loading-placeholder">
        <a-spin tip="正在加载表格配置...">
          <div style="padding: 50px; background: rgba(0, 0, 0, 0.05); border-radius: 4px"></div>
        </a-spin>
      </div>
    </div>

    <hrm-tdgl-modal ref="modalForm" @ok="modalFormOk"></hrm-tdgl-modal>
    <hrm-tdgl-approve-modal ref="approveModal" @ok="modalFormOk"></hrm-tdgl-approve-modal>
    <hrm-tdgl-cancel-modal ref="cancelModal" @ok="modalFormOk"></hrm-tdgl-cancel-modal>
    <hrm-tdgl-detail-modal ref="detailModal"></hrm-tdgl-detail-modal>
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
import HrmTdglModal from './modules/HrmTdglModal'
import HrmTdglApproveModal from './modules/HrmTdglApproveModal'
import HrmTdglCancelModal from './modules/HrmTdglCancelModal'
import HrmTdglDetailModal from './modules/HrmTdglDetailModal'
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'

function formatValue(value) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') ? '-' : value
}

export default {
  name: 'HrmTdglList',
  mixins: [JeecgListMixin, mixinDevice, columnConfigMixin, tableAdaptiveMixin],
  components: {
    HrmTdglModal,
    HrmTdglApproveModal,
    HrmTdglCancelModal,
    HrmTdglDetailModal,
    ColumnConfigSidebar,
  },
  data() {
    return {
      description: '调动管理管理页面',
      // 禁用 mixin 自动加载
      disableMixinCreated: true,
      // 当前选中的状态
      currentStatus: '全部',
      // 状态选项配置（对应 HTML 原型中的 6 个状态）
      statusOptions: [
        { label: '全部', value: '全部', code: 'all', count: 0 },
        { label: '审批中', value: '审批中', code: 'pending', count: 0 },
        { label: '已通过', value: '已通过', code: 'approved', count: 0 },
        { label: '已拒绝', value: '已拒绝', code: 'rejected', count: 0 },
        { label: '已取消', value: '已取消', code: 'cancelled', count: 0 },
        { label: '调动完成', value: '调动完成', code: 'completed', count: 0 },
      ],
      // 查询参数
      queryParam: {
        gh: '',
        xm: '',
        ddlx: undefined,
        fqsjRange: [],
        ygs: '',
        ddhgs: '',
        zt: undefined,
      },
      columnCode: 'HrmTdgl', // 调动管理字段配置标识
      originalColumns: [
        {
          title: '状态',
          align: 'center',
          dataIndex: 'zt',
          customRender: (text) => {
            // 与 tab 颜色保持一致
            const colors = {
              审批中: '#e6a23c',
              已通过: '#55c42a',
              已拒绝: '#f56c6c',
              已取消: '#909399',
              调动完成: '#67c23a',
            }
            return text ? <a-tag color={colors[text] || '#909399'}>{text}</a-tag> : '-'
          },
        },
        {
          title: '调动类型',
          align: 'center',
          dataIndex: 'ddlx',
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
          title: '原公司',
          align: 'center',
          dataIndex: 'ycompanyId_dictText',
          customRender: (text) => {
            return text || '-'
          },
        },
        {
          title: '原所属部门',
          align: 'center',
          dataIndex: 'ydept_dictText',
          customRender: (text) => {
            return text || '-'
          },
        },
        {
          title: '原岗位名称',
          align: 'center',
          dataIndex: 'ypostId_dictText',
          customRender: (text) => {
            return text || '-'
          },
        },
        {
          title: '原职级名称',
          align: 'center',
          dataIndex: 'ypostRank_dictText',
          customRender: (text) => {
            return text || '-'
          },
        },
        {
          title: '调动后公司',
          align: 'center',
          dataIndex: 'hcompanyId_dictText',
          customRender: (text) => {
            return text || '-'
          },
        },
        {
          title: '调动后所属部门',
          align: 'center',
          dataIndex: 'hdept_dictText',
          customRender: (text) => {
            return text || '-'
          },
        },
        {
          title: '调动后岗位名称',
          align: 'center',
          dataIndex: 'hpostId_dictText',
          customRender: (text) => {
            return text || '-'
          },
        },
        {
          title: '调动后职级名称',
          align: 'center',
          dataIndex: 'hpostRank_dictText',
          customRender: (text) => {
            return text || '-'
          },
        },
        {
          title: '调动原因',
          align: 'center',
          dataIndex: 'ddyy',
          width: 180,
          ellipsis: true,
          customRender: (text) => this.renderTooltip(text, 160),
        },
        {
          title: '调动生效时间',
          align: 'center',
          dataIndex: 'ddsxsj',
        },
        {
          title: '发起人',
          align: 'center',
          dataIndex: 'fqr',
        },
        {
          title: '发起时间',
          align: 'center',
          dataIndex: 'createTime',
          width: 150,
        },
        {
          title: '审批人',
          align: 'center',
          dataIndex: 'spr',
          ellipsis: true,
        },
        {
          title: '抄送人',
          align: 'center',
          dataIndex: 'csr',
          ellipsis: true,
          customRender: (text) => {
            return text || '-'
          },
        },
      ],
      url: {
        list: '/ryManage/hrmTdgl/list',
        delete: '/ryManage/hrmTdgl/delete',
        deleteBatch: '/ryManage/hrmTdgl/deleteBatch',
        exportXlsUrl: '/ryManage/hrmTdgl/exportXls',
        importExcelUrl: 'ryManage/hrmTdgl/importExcel',
        importExcelUrlNewName: 'HrmTdgl',
        getTotal: '/ryManage/hrmTdgl/getTotal', // 状态统计接口
      },
      dictOptions: {},
      superFieldList: [],
    }
  },
  created() {
    this.getSuperFieldList()
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
          width: 147,
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
            display: 'block',
          },
          props: { title: value },
        },
        [this.$createElement('span', value)]
      )
    },
    // 处理新增（重写 mixin 方法）
    handleAdd() {
      this.$refs.modalForm.add()
    },
    initDictConfig() {},
    // 重写 loadData 方法，在加载后获取状态统计
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
    // 重置查询
    searchReset() {
      this.queryParam = {
        gh: '',
        xm: '',
        ddlx: undefined,
        fqsjRange: [],
        ygs: '',
        ddhgs: '',
        zt: undefined,
      }
      this.currentStatus = '全部'
      this.onClearSelected()
      this.loadData(1)
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'zt', text: '状态', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ddlx', text: '调动类型', dictCode: '' })
      fieldList.push({ type: 'string', value: 'gh', text: '工号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'xm', text: '姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ygs', text: '原公司', dictCode: '' })
      fieldList.push({ type: 'string', value: 'yssbm', text: '原所属部门', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ygwmc', text: '原岗位名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'yzjmc', text: '原职级名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ddhgs', text: '调动后公司', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ddhssbm', text: '调动后所属部门', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ddhgwmc', text: '调动后岗位名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ddhzjmc', text: '调动后职级名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ddyy', text: '调动原因', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ddsxsj', text: '调a动生效时间', dictCode: '' })
      fieldList.push({ type: 'string', value: 'fqr', text: '发起人', dictCode: '' })
      fieldList.push({ type: 'string', value: 'fqsj', text: '发起时间', dictCode: '' })
      fieldList.push({ type: 'string', value: 'spr', text: '审批人', dictCode: '' })
      fieldList.push({ type: 'string', value: 'csr', text: '抄送人', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ddry', text: '调动人员', dictCode: '' })
      this.superFieldList = fieldList
    },
    // 处理详情
    handleDetail(record) {
      this.$refs.detailModal.show(record)
    },
    // 处理审批
    handleApprove(record) {
      this.$refs.approveModal.show(record)
    },
    // 处理取消
    handleCancelTransfer(record) {
      this.$refs.cancelModal.show(record)
    },
  },
}
</script>
<style scoped lang="less">
@import './HrmTdglList.less';

.table-loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 40px 0;
}
</style>
