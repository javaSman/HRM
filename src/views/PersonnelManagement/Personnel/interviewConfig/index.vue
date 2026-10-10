<template>
  <div class="interview-config-page">
    <!-- 状态筛选区域 -->
    <div class="interview-config-status-filter">
      <a-tabs :activeKey="currentStatus" type="card" @change="handleStatusChange">
        <a-tab-pane v-for="item in statusOptions" :key="item.value">
          <span slot="tab" :data-status="item.code">
            {{ item.label }} <span class="status-count">({{ item.count }})</span>
          </span>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator interview-config-toolbar">
      <a-button type="primary" class="pm-btn-primary" icon="plus" @click="handleAdd">新增</a-button>
      <a-button
        type="primary"
        class="pm-btn-primary"
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
      <!-- <a-button type="primary" class="pm-btn-primary" icon="download" @click="handleExportXls('访谈配置')">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrlNew" @change="handleImportExcelNew">
        <a-button type="primary" class="pm-btn-primary" icon="import">导入</a-button>
      </a-upload>
      <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>
       -->
    </div>

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="5" :lg="6" :md="8" :sm="12" :xs="24">
            <a-form-item label="访谈类型">
              <a-input v-model.trim="queryParam.ftlx" allowClear placeholder="请输入访谈类型" />
            </a-form-item>
          </a-col>
          <a-col :xl="5" :lg="6" :md="8" :sm="12" :xs="24">
            <a-form-item label="所属种类">
              <a-select v-model="queryParam.sszl" allowClear placeholder="全部">
                <a-select-option value="入职">入职</a-select-option>
                <a-select-option value="离职">离职</a-select-option>
                <a-select-option value="日常">日常</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="5" :lg="6" :md="8" :sm="12" :xs="24">
            <a-form-item label="适用职级">
              <a-select v-model="queryParam.syjb" allowClear placeholder="全部">
                <a-select-option value="管理">管理</a-select-option>
                <a-select-option value="其他">其他</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="6" :md="8" :sm="12" :xs="24">
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
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择
        <a style="font-weight: 600">{{ selectedRowKeys.length }}</a
        >项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        v-if="columnConfigReady"
        ref="table"
        size="middle"
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
          <a-popconfirm
            :title="record.zt == '启用' ? '确定要禁用吗?' : '确定要启用吗?'"
            @confirm="handleToggleStatus(record)"
          >
            <a style="color: #f56c6c" v-if="record.zt == '启用'">禁用</a>
            <a style="color: #22c55e" v-else>启用</a>
          </a-popconfirm>
          <a-divider type="vertical" />
          <a @click="handleDetail(record)">详情</a>
          <a-divider type="vertical" />
          <a @click="handleEdit(record)">编辑</a>

          <!-- <a-divider type="vertical" /> -->
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

    <hrm-ftpz-modal ref="modalForm" @ok="modalFormOk"></hrm-ftpz-modal>
    <hrm-ftpz-detail-modal ref="detailModal"></hrm-ftpz-detail-modal>
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
import { httpAction } from '@/api/manage'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { columnConfigMixin } from '@/mixins/columnConfigMixin'
import { tableAdaptiveMixin } from '@/mixins/tableAdaptiveMixin'
import HrmFtpzModal from './modules/HrmFtpzModal'
import HrmFtpzDetailModal from './modules/HrmFtpzDetailModal'
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'

export default {
  name: 'HrmFtpzList',
  mixins: [JeecgListMixin, mixinDevice, columnConfigMixin, tableAdaptiveMixin],
  components: {
    HrmFtpzModal,
    HrmFtpzDetailModal,
    ColumnConfigSidebar,
  },
  data() {
    return {
      description: '访谈配置管理页面',
      disableMixinCreated: true,
      currentStatus: '全部',
      statusOptions: [
        { label: '全部', value: '全部', code: 'all', count: 0 },
        { label: '启用', value: '启用', code: 'enabled', count: 0 },
        { label: '禁用', value: '禁用', code: 'disabled', count: 0 },
      ],
      columnCode: 'HrmFtpz', // 访谈配置字段配置标识
      originalColumns: [
        {
          title: '状态',
          align: 'center',
          dataIndex: 'zt',
          customRender: (t, record) => {
            let zt = record.zt
            let colors = {
              启用: '#55c42a',
              禁用: '#909399',
            }
            return <a-tag color={colors[zt] || ''}>{zt}</a-tag>
          },
        },
        {
          title: '访谈类型',
          align: 'center',
          dataIndex: 'ftlx',
        },
        {
          title: '所属种类',
          align: 'center',
          dataIndex: 'sszl',
        },
        {
          title: '适用职级',
          align: 'center',
          dataIndex: 'syjb',
        },
        {
          title: '创建人',
          align: 'center',
          dataIndex: 'cjr',
        },
        {
          title: '创建时间',
          align: 'center',
          dataIndex: 'createTime',
        },
        {
          title: '更新时间',
          align: 'center',
          dataIndex: 'updateTime',
        },
      ],
      url: {
        list: '/ryManage/hrmFtpz/list',
        delete: '/ryManage/hrmFtpz/delete',
        deleteBatch: '/ryManage/hrmFtpz/deleteBatch',
        exportXlsUrl: '/ryManage/hrmFtpz/exportXls',
        importExcelUrl: 'ryManage/hrmFtpz/importExcel',
        importExcelUrlNewName: 'HrmFtpz',
        getTotal: '/ryManage/hrmFtpz/getTotal',
        edit: '/ryManage/hrmFtpz/edit',
        addSjjl: '/ryManage/hrmFtpzSjjl/add',
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
    initDictConfig() {},
    loadData(arg) {
      JeecgListMixin.methods.loadData.call(this, arg)
      this.getStatusTotal()
    },
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
    searchReset() {
      this.queryParam = {
        ftlx: '',
        sszl: undefined,
        syjb: undefined,
        zt: undefined,
      }
      this.currentStatus = '全部'
      this.onClearSelected()
      this.loadData(1)
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'zt', text: '状态', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ftlx', text: '访谈类型', dictCode: '' })
      fieldList.push({ type: 'string', value: 'sszl', text: '所属种类', dictCode: '' })
      fieldList.push({ type: 'string', value: 'syjb', text: '适用职级', dictCode: '' })
      fieldList.push({ type: 'string', value: 'cjr', text: '创建人', dictCode: '' })
      this.superFieldList = fieldList
    },
    handleToggleStatus(record) {
      const newStatus = record.zt === '启用' ? '禁用' : '启用'
      const params = {
        ...record,
        zt: newStatus,
      }

      httpAction(this.url.edit, params, 'put')
        .then((res) => {
          if (res.success) {
            // 记录事件
            // const xgnr = newStatus === '启用' ? '启用访谈配置' : '禁用访谈配置';
            // this.addSjjl(record.id, xgnr);

            this.$message.success(res.message || '操作成功')
            this.loadData()
          } else {
            this.$message.warning(res.message || '操作失败')
          }
        })
        .catch((err) => {
          this.$message.error('操作失败：' + (err.message || '网络错误'))
        })
    },
    addSjjl(hrmFtpzId, xgnr) {
      const username = this.$store.state.user.info.username
      httpAction(this.url.addSjjl, { hrmFtpzId, xgr: username, xgnr }, 'post')
    },
    handleDetail(record) {
      this.$refs.detailModal.detail(record)
    },
  },
}
</script>
<style scoped lang="less">
@import './interviewConfig.less';

.table-loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 40px 0;
}
</style>
