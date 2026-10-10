<template>
  <div class="interview-follow-page" :bordered="false">
    <!-- 状态筛选区域 -->
    <div class="status-filter">
      <a-tabs :activeKey="currentStatus" type="card" @change="handleStatusChange">
        <a-tab-pane v-for="item in statusOptions" :key="item.value">
          <span slot="tab" :data-status="item.code">
            {{ item.label }} <span class="status-count">({{ item.count }})</span>
          </span>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 操作按钮区域 -->
    <div class="interview-follow-toolbar">
      <a-button type="primary" class="pm-btn-primary" icon="setting" @click="toggleColumnConfig"> 字段配置 </a-button>
    </div>

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <!-- <a-col :xl="4" :lg="6" :md="8" :sm="12" :xs="24">
            <a-form-item label="跟进情况">
              <a-select v-model="queryParam.gjqk" allowClear placeholder="全部">
                <a-select-option value="跟进中">跟进中</a-select-option>
                <a-select-option value="已完成">已完成</a-select-option>
              </a-select>
            </a-form-item>
          </a-col> -->
          <a-col :xl="4" :lg="6" :md="8" :sm="12" :xs="24">
            <a-form-item label="所属种类">
              <a-select v-model="queryParam.sszl" allowClear placeholder="全部">
                <a-select-option value="入职">入职</a-select-option>
                <a-select-option value="日常">日常</a-select-option>
                <a-select-option value="离职">离职</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="6" :md="8" :sm="12" :xs="24">
            <a-form-item label="适用职级">
              <a-select v-model="queryParam.syzj" allowClear placeholder="全部">
                <a-select-option value="管理">管理</a-select-option>
                <a-select-option value="其他">其他</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="6" :md="8" :sm="12" :xs="24">
            <a-form-item label="姓名">
              <a-input v-model.trim="queryParam.xm" allowClear placeholder="请输入姓名" />
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

        <span slot="gjqkSlot" slot-scope="text">
          <a-tag v-if="text" :color="text === '跟进中' ? '#e6a23c' : '#67c23a'">{{ text }}</a-tag>
          <span v-else>-</span>
        </span>

        <span slot="action" slot-scope="text, record">
          <a @click="handleDetail(record)">详情</a>
          <template v-if="record.gjqk == '跟进中'">
            <a-divider type="vertical" />
            <a style="color: #22c55e" @click="handleFollow(record)">跟进</a>
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

    <detail-modal ref="detailModal"></detail-modal>
    <follow-modal ref="followModal" @ok="modalFormOk"></follow-modal>
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
import DetailModal from './modules/DetailModal'
import FollowModal from './modules/FollowModal'
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'

export default {
  name: 'InterviewFollowList',
  mixins: [JeecgListMixin, mixinDevice, columnConfigMixin, tableAdaptiveMixin],
  components: {
    DetailModal,
    FollowModal,
    ColumnConfigSidebar,
  },
  data() {
    return {
      description: '访谈问题跟进管理页面',
      // 禁用 mixin 自动加载
      disableMixinCreated: true,
      // 当前选中的状态
      currentStatus: '全部',
      // 状态选项配置
      statusOptions: [
        { label: '全部', value: '全部', code: 'all', count: 0 },
        { label: '跟进中', value: '跟进中', code: 'pending', count: 0 },
        { label: '已完成', value: '已完成', code: 'done', count: 0 },
      ],
      // 查询参数
      queryParam: {
        gjqk: undefined,
        sszl: undefined,
        syzj: undefined,
        xm: '',
      },
      columnCode: 'HrmFtwtkj', // 访谈跟踪字段配置标识
      originalColumns: [
        {
          title: '跟进情况',
          align: 'center',
          width: 100,
          dataIndex: 'gjqk',
          ellipsis: true,
          scopedSlots: { customRender: 'gjqkSlot' },
        },
        {
          title: '公司',
          align: 'center',
          width: 120,
          ellipsis: true,
          dataIndex: 'companyId_dictText',
          customRender: (text) => text || '-',
        },
        {
          title: '所属部门',
          align: 'center',
          width: 120,
          ellipsis: true,
          dataIndex: 'dept_dictText',
          customRender: (text) => text || '-',
        },
        {
          title: '岗位名称',
          align: 'center',
          width: 160,
          ellipsis: true,
          dataIndex: 'postId_dictText',
          customRender: (text) => text || '-',
        },
        {
          title: '职级名称',
          align: 'center',
          width: 100,
          ellipsis: true,
          dataIndex: 'postRank_dictText',
          customRender: (text) => text || '-',
        },
        {
          title: '适用职级',
          align: 'center',
          width: 100,
          ellipsis: true,
          dataIndex: 'syzj',
          customRender: (text) => text || '-',
        },
        {
          title: '工号',
          align: 'center',
          width: 100,
          ellipsis: true,
          dataIndex: 'gh',
        },
        {
          title: '姓名',
          align: 'center',
          width: 100,
          ellipsis: true,
          dataIndex: 'xm',
        },
        {
          title: '访谈类型',
          align: 'center',
          width: 130,
          dataIndex: 'ftlx',
          ellipsis: true,
          customRender: (text) => text || '-',
        },
        {
          title: '所属种类',
          align: 'center',
          width: 100,
          ellipsis: true,
          dataIndex: 'sszl',
          customRender: (text) => text || '-',
        },
        {
          title: '问题内容',
          align: 'center',
          width: 150,
          dataIndex: 'wtnr',
          ellipsis: true,
          customRender: (text) => this.renderTooltip(text, 150),
        },
        {
          title: '访谈情况',
          align: 'center',
          width: 180,
          dataIndex: 'ftqk',
          ellipsis: true,
          customRender: (text) => this.renderTooltip(text, 180),
        },
        {
          title: '访谈时间',
          align: 'center',
          width: 120,
          dataIndex: 'ftsj',
          customRender: (text) => text || '-',
        },
        {
          title: '跟进人',
          align: 'center',
          width: 100,
          dataIndex: 'gjr',
          customRender: (text) => text || '-',
        },
      ],
      url: {
        list: '/ryManage/hrmFtwtkj/list',
        getTotal: '/ryManage/hrmFtwtkj/getTotal',
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
    renderTooltip(text, width) {
      const value = text !== undefined && text !== null && text !== '' ? String(text) : '-'
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
        delete this.queryParam.gjqk
      } else {
        this.$set(this.queryParam, 'gjqk', status)
      }
      this.onClearSelected()
      this.loadData(1)
    },
    // 重置查询
    searchReset() {
      this.queryParam = {
        gjqk: undefined,
        sszl: undefined,
        syzj: undefined,
        xm: '',
      }
      this.currentStatus = '全部'
      this.onClearSelected()
      this.loadData(1)
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'gjqk', text: '跟进情况', dictCode: '' })
      fieldList.push({ type: 'string', value: 'companyId', text: '公司', dictCode: '' })
      fieldList.push({ type: 'string', value: 'dept', text: '所属部门', dictCode: '' })
      fieldList.push({ type: 'string', value: 'postId', text: '岗位名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'postRank', text: '职级名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'syzj', text: '适用职级', dictCode: '' })
      fieldList.push({ type: 'string', value: 'gh', text: '工号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'xm', text: '姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ftlx', text: '访谈类型', dictCode: '' })
      fieldList.push({ type: 'string', value: 'sszl', text: '所属种类', dictCode: '' })
      fieldList.push({ type: 'string', value: 'wtnr', text: '问题内容', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ftqk', text: '访谈情况', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ftsj', text: '访谈时间', dictCode: '' })
      fieldList.push({ type: 'string', value: 'gjr', text: '跟进人', dictCode: '' })
      this.superFieldList = fieldList
    },
    // 处理详情
    handleDetail(record) {
      this.$refs.detailModal.show(record)
    },
    // 处理跟进
    handleFollow(record) {
      this.$refs.followModal.show(record)
    },
  },
}
</script>
<style scoped lang="less">
@import './index.less';

.table-loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 40px 0;
}
</style>
