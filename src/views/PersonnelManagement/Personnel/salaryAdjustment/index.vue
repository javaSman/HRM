<template>
  <div class="salary-adjustment-page" :bordered="false">
    <!-- 状态筛选区域 -->
    <div class="salary-status-filter">
      <div class="salary-status-header">
        <a-tabs :activeKey="currentStatus" type="card" @change="handleStatusChange">
          <a-tab-pane v-for="item in statusOptions" :key="item.value">
            <span slot="tab" :data-status="item.code">
              {{ item.label }} <span class="status-count">({{ item.count }})</span>
            </span>
          </a-tab-pane>
        </a-tabs>
        <div>
          <a-button type="primary" class="sxtz-btn-primary" icon="plus" @click="handleAdd">发起调薪</a-button>
          <a-button
            type="primary"
            class="sxtz-btn-primary"
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
            <a-form-item label="调薪类型">
              <a-select v-model="queryParam.txlx" allowClear placeholder="全部">
                <a-select-option value="试用期结束调薪">试用期结束调薪</a-select-option>
                <a-select-option value="技能调薪">技能调薪</a-select-option>
                <a-select-option value="升职">升职</a-select-option>
                <a-select-option value="降职">降职</a-select-option>
                <a-select-option value="其他">其他</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="6" :md="8" :sm="12" :xs="24">
            <a-form-item label="申请人">
              <a-input v-model.trim="queryParam.sqr" allowClear placeholder="请输入申请人" />
            </a-form-item>
          </a-col>
          <a-col :xl="5" :lg="8" :md="12" :sm="24" :xs="24">
            <a-form-item label="申请时间">
              <a-range-picker
                v-model="sqsjDateRange"
                format="YYYY-MM-DD"
                :placeholder="['开始日期', '结束日期']"
                style="width: 100%"
                @change="(value, dates) => handleRangeChange('sqsjDateRange', 'sqsj_begin', 'sqsj_end', value, dates)"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" class="sxtz-btn-primary" icon="search" @click="searchQuery">查询</a-button>
              <a-button class="sxtz-btn-reset" icon="reload" @click="searchReset">重置</a-button>
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
          <template v-if="record.zt == '审批中' && record.brSpStatus == 1">
            <a-divider type="vertical" />
            <a style="color: #22c55e" @click="handleApprove(record)">审批</a>
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

    <hrm-Txsq-modal ref="modalForm" @ok="modalFormOk"></hrm-Txsq-modal>
    <hrm-Txsq-approve-modal ref="approveModal" @ok="modalFormOk"></hrm-Txsq-approve-modal>
    <hrm-Txsq-detail-modal ref="detailModal"></hrm-Txsq-detail-modal>
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
import HrmTxsqModal from './modules/HrmTxsqModal'
import HrmTxsqApproveModal from './modules/HrmTxsqApproveModal'
import HrmTxsqDetailModal from './modules/HrmTxsqDetailModal'
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'
function formatValue(value) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') ? '-' : value
}
export default {
  name: 'HrmTxsqList',
  mixins: [JeecgListMixin, mixinDevice, columnConfigMixin, tableAdaptiveMixin],
  components: {
    HrmTxsqModal,
    HrmTxsqApproveModal,
    HrmTxsqDetailModal,
    ColumnConfigSidebar,
  },
  data() {
    return {
      description: '薪资调整管理页面',
      // 禁用 mixin 自动加载
      disableMixinCreated: true,
      // 当前选中的状态
      currentStatus: '全部',
      // 状态选项配置（对应原型中的 4 个状态）
      statusOptions: [
        { label: '全部', value: '全部', code: 'all', count: 0 },
        { label: '审批中', value: '审批中', code: 'pending', count: 0 },
        { label: '通过', value: '通过', code: 'approved', count: 0 },
        { label: '不通过', value: '不通过', code: 'rejected', count: 0 },
      ],
      // 查询参数
      queryParam: {
        gh: '',
        xm: '',
        dxlx: undefined,
        sqr: '',
        sqsj_begin: '',
        sqsj_end: '',
      },
      // 日期范围变量
      sqsjDateRange: [],
      columnCode: 'HrmTxsq', // 薪资调整字段配置标识
      originalColumns: [
        {
          title: '状态',
          align: 'center',
          dataIndex: 'zt',
          customRender: (text) => {
            const colors = {
              审批中: '#e6a23c',
              通过: '#55c42a',
              不通过: '#f56c6c',
            }
            return text ? <a-tag color={colors[text] || '#909399'}>{text}</a-tag> : '-'
          },
        },
        {
          title: '公司',
          align: 'center',
          dataIndex: 'companyId_dictText',
        },
        {
          title: '所属部门',
          align: 'center',
          dataIndex: 'dept_dictText',
        },
        {
          title: '岗位名称',
          align: 'center',
          dataIndex: 'postId_dictText',
        },
        {
          title: '工号',
          align: 'center',
          dataIndex: 'gh',
          width: 90,
        },
        {
          title: '姓名',
          align: 'center',
          dataIndex: 'xm',
          width: 90,
        },
        {
          title: '调薪前薪资(k)',
          align: 'center',
          dataIndex: 'txqxz',
          width: 110,
          customRender: (text) => {
            return text || '-'
          },
        },
        {
          title: '调薪后薪资(k)',
          align: 'center',
          dataIndex: 'txhxz',
          width: 110,
        },
        {
          title: '调薪类型',
          align: 'center',
          dataIndex: 'txlx',
        },
        {
          title: '调薪原因',
          align: 'center',
          dataIndex: 'txyy',
          width: 200,
          ellipsis: true,
          customRender: (text) => this.renderTooltip(text, 180),
        },
        {
          title: '生效日期',
          align: 'center',
          dataIndex: 'sxrq',
          width: 110,
        },
        {
          title: '申请人',
          align: 'center',
          dataIndex: 'sqr',
          width: 110,
        },
        {
          title: '申请时间',
          align: 'center',
          dataIndex: 'sqsj',
          width: 110,
        },
      ],
      url: {
        list: '/ryManage/hrmTxsq/list',
        delete: '/ryManage/hrmTxsq/delete',
        deleteBatch: '/ryManage/hrmTxsq/deleteBatch',
        getTotal: '/ryManage/hrmTxsq/getTotal',
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
    initDictConfig() {},
    /**
     * 处理日期范围变化
     * @param {string} rangeName - 日期范围变量名
     * @param {string} beginKey - 开始时间参数名
     * @param {string} endKey - 结束时间参数名
     * @param {Array} value - 日期值数组
     * @param {Array} dateStrings - 日期字符串数组
     */
    handleRangeChange(rangeName, beginKey, endKey, value, dateStrings) {
      this[rangeName] = value || []
      this.queryParam[beginKey] = dateStrings && dateStrings[0] ? dateStrings[0] : ''
      this.queryParam[endKey] = dateStrings && dateStrings[1] ? dateStrings[1] : ''
    },
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
        dxlx: undefined,
        sqr: '',
        sqsj_begin: '',
        sqsj_end: '',
      }
      this.sqsjDateRange = []
      this.currentStatus = '全部'
      this.onClearSelected()
      this.loadData(1)
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'zt', text: '状态', dictCode: '' })
      fieldList.push({ type: 'string', value: 'companyId', text: '公司', dictCode: '' })
      fieldList.push({ type: 'string', value: 'department', text: '所属部门', dictCode: '' })
      fieldList.push({ type: 'string', value: 'postId', text: '岗位名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'gh', text: '工号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'xm', text: '姓名', dictCode: '' })
      fieldList.push({ type: 'number', value: 'yxc', text: '调薪前薪资', dictCode: '' })
      fieldList.push({ type: 'number', value: 'hxc', text: '调薪后薪资', dictCode: '' })
      fieldList.push({ type: 'string', value: 'txlx', text: '调薪类型', dictCode: '' })
      fieldList.push({ type: 'string', value: 'dxyy', text: '调薪原因', dictCode: '' })
      fieldList.push({ type: 'date', value: 'sxrq', text: '生效日期', dictCode: '' })
      fieldList.push({ type: 'string', value: 'sqr', text: '申请人', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'createTime', text: '申请时间', dictCode: '' })
      this.superFieldList = fieldList
    },
    // 处理新增（重写 mixin 方法）
    handleAdd() {
      this.$refs.modalForm.add()
    },
    // 处理详情
    handleDetail(record) {
      this.$refs.detailModal.show(record)
    },
    // 处理审批
    handleApprove(record) {
      this.$refs.approveModal.show(record)
    },
  },
}
</script>
<style scoped lang="less">
@import './HrmTxsqList.less';

.table-loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 40px 0;
}
</style>
