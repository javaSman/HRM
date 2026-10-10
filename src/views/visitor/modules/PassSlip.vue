<template>
  <div class="pass-slip-module">
    <!-- 筛选区 -->
    <div class="v-filter-bar">
      <div class="v-filter-row">
        <div class="v-filter-item">
          <span class="v-filter-item-label">放行人</span>
          <j-input v-model="queryParam.fxr" allowClear placeholder="请输入放行人" @pressEnter="searchQuery" />
        </div>
        <div class="v-filter-item">
          <span class="v-filter-item-label">手机号码</span>
          <j-input v-model="queryParam.sjhf" allowClear placeholder="请输入手机号码" @pressEnter="searchQuery" />
        </div>
        <div class="v-filter-item">
          <span class="v-filter-item-label">放行区域</span>
          <j-dict-select-tag
            type="list"
            v-model="queryParam.fxqr"
            dictCode="hrm_fkzx_sq_lfqy"
            placeholder="请选择放行区域"
          />
        </div>
        <div class="v-filter-item">
          <span class="v-filter-item-label">放行日期</span>
          <div class="v-date-range">
            <a-range-picker
              v-model="passDateRange"
              format="YYYY-MM-DD"
              :placeholder="['开始日期', '结束日期']"
              style="width: 200px"
              @change="(value, dates) => handleRangeChange(value, dates)"
            />
          </div>
        </div>
        <div class="v-filter-item" style="flex-direction: row">
          <a-button type="primary" class="v-btn" @click="searchQuery"><a-icon type="search" />查询</a-button>
          <a-button class="v-btn v-btn-secondary" @click="searchReset"> <a-icon type="undo" />重置 </a-button>
        </div>
      </div>
      <div class="v-filter-bar-actions">
        <a-button v-if="isApply" class="v-btn v-btn-primary" icon="plus" @click="handleAdd">申请放行</a-button>
      </div>
    </div>
    <!-- 状态筛选 - 胶囊样式 -->
    <div class="v-status-tabs">
      <div
        v-for="status in statusList"
        :key="status.key"
        :class="['v-status-tab', isStatusActive(status.key) ? 'active' : '']"
        @click="changeStatus(status.key)"
      >
        {{ status.label }} <span class="tab-count">{{ status.count }}</span>
      </div>
    </div>
    <!-- 表格卡片 -->
    <div class="v-content">
      <div class="v-data-card">
        <div class="v-scroll-area">
          <a-table
            ref="table"
            size="middle"
            :bordered="false"
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :pagination="false"
            :loading="loading"
            :scroll="{ x: true, y: 400 }"
            @change="handleTableChange"
          >
            <template slot="zt" slot-scope="text, record">
              <span :class="['v-status-tag', getDisplayStatusClass(record)]">
                <span class="dot"></span>
                {{ getDisplayStatusText(record) }}
              </span>
            </template>
            <template slot="wptp" slot-scope="text">
              <a-button v-if="text" type="link" size="small" @click="previewImage(text)">查看</a-button>
              <span v-else class="photo-empty">无</span>
            </template>
            <template slot="action" slot-scope="text, record">
              <div class="v-action-cell">
                <!-- 审批中状态 + 审批中心：审核按钮 -->
                <button
                  v-if="state === 'approval' && record.zt === '0'"
                  class="v-btn-icon success"
                  @click="handleAudit(record)"
                >
                  审核
                </button>
                <!-- 待放行状态：放行按钮 -->
                <button
                  v-if="isApply && userName === record.jsr && record.fxzt === '0'"
                  class="v-btn-icon success"
                  @click="handlePass(record)"
                >
                  放行
                </button>
                <!-- 详情按钮 -->
                <button class="v-btn-icon info" @click="handleDetail(record)">详情</button>
                <!-- 申请页 + 审批中：撤回按钮 -->
                <button v-if="isApply && record.zt === '0'" class="v-btn-icon warn" @click="handleCancel(record)">
                  撤回
                </button>
              </div>
            </template>
          </a-table>
        </div>
        <div class="v-pagination" v-if="ipagination.total > 0">
          <a-pagination
            size="small"
            :current="ipagination.current"
            :pageSize="ipagination.pageSize"
            :total="ipagination.total"
            showSizeChanger
            showQuickJumper
            :pageSizeOptions="['10', '20', '30', '50']"
            @change="handlePageChange"
            @showSizeChange="handleSizeChange"
          />
        </div>
      </div>
    </div>

    <pass-slip-modal ref="modalForm" @ok="modalFormOk"></pass-slip-modal>
    <pass-slip-detail ref="detailModal"></pass-slip-detail>
    <pass-slip-approval ref="approvalModal" @ok="modalFormOk"></pass-slip-approval>
    <pass-slip-release ref="releaseModal" @ok="modalFormOk"></pass-slip-release>
  </div>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { mixinDevice } from '@/utils/mixin'
import { getAction, postAction } from '@/api/manage'
import PassSlipModal from './PassSlipModal.vue'
import PassSlipDetail from './PassSlipDetail.vue'
import PassSlipApproval from './PassSlipApproval.vue'
import PassSlipRelease from './PassSlipRelease.vue'

export default {
  name: 'PassSlip',
  mixins: [JeecgListMixin, mixinDevice],
  components: { PassSlipModal, PassSlipDetail, PassSlipApproval, PassSlipRelease },
  props: {
    state: {
      type: String,
      default: 'apply',
      validator: function (value) {
        return ['apply', 'approval'].includes(value)
      },
    },
  },
  data() {
    return {
      description: '放行条',
      statusList: [],
      passDateRange: [],
      queryParam: {
        fxr: '',
        sjhf: '',
        fxqr: '',
        fxrq_begin: '',
        fxrq_end: '',
        zt: '',
      },
      columns: [
        {
          title: '序号',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        { title: '状态', dataIndex: 'zt', key: 'zt', width: 90, align: 'center', scopedSlots: { customRender: 'zt' } },
        { title: '放行人', dataIndex: 'fxr', key: 'fxr', width: 100, align: 'center' },
        { title: '所属公司', dataIndex: 'ssgs', key: 'ssgs', width: 140, align: 'center', ellipsis: true },
        { title: '车牌号', dataIndex: 'cph', key: 'cph', width: 120, align: 'center' },
        { title: '手机号码', dataIndex: 'sjhf', key: 'sjhf', width: 130, align: 'center' },
        {
          title: '物品名称及数量',
          dataIndex: 'wpmc',
          key: 'wpmc',
          width: 180,
          align: 'center',
          customRender: (t, row) => {
            const list = row.wpxxList || []
            const text = list.reduce((acc, cur) => acc.concat(`${cur.wpmc} x ${cur.wpsl || ' '}`), []).join('，')
            return (
              <a-tooltip
                title={text}
                style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:160px;"
              >
                <span>{text}</span>
              </a-tooltip>
            )
          },
        },
        {
          title: '物品照片',
          dataIndex: 'wptp',
          key: 'wptp',
          width: 90,
          align: 'center',
          scopedSlots: { customRender: 'wptp' },
        },
        {
          title: '备注说明',
          dataIndex: 'bzsm',
          key: 'bzsm',
          width: 180,
          align: 'center',
          customRender: (t) => {
            return (
              <a-tooltip
                title={t}
                style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:160px;"
              >
                <span>{t}</span>
              </a-tooltip>
            )
          },
        },
        {
          title: '放行日期',
          dataIndex: 'fxrq',
          key: 'fxrq',
          width: 110,
          align: 'center',
          customRender: (t) => {
            return t ? t.slice(0, 10) : ''
          },
        },
        { title: '放行区域', dataIndex: 'fxqr_dictText', key: 'fxqr_dictText', width: 140, align: 'center' },
        { title: '经手人(申请人)', dataIndex: 'jsr', key: 'jsr', width: 120, align: 'center' },
        {
          title: '申请时间',
          dataIndex: 'createTime',
          key: 'createTime',
          width: 130,
          align: 'center',
          customRender: (t) => {
            return t ? t.slice(0, 16) : ''
          },
        },
        { title: '审核通过时间', dataIndex: 'shtgsj', key: 'shtgsj', width: 130, align: 'center' },
        { title: '放行时间', dataIndex: 'fxsj', key: 'fxsj', width: 130, align: 'center' },
        {
          title: '操作',
          dataIndex: 'action',
          key: 'action',
          width: 180,
          align: 'center',
          fixed: 'right',
          scopedSlots: { customRender: 'action' },
        },
      ],
      dataSource: [],
      url: {
        list: '/fkzx/hrmFxtsqxx/list',
        delete: '/fkzx/hrmFxtsqxx/delete',
        deleteBatch: '/fkzx/hrmFxtsqxx/deleteBatch',
        exportXlsUrl: '/fkzx/hrmFxtsqxx/exportXls',
        importExcelUrl: 'fkzx/hrmFxtsqxx/importExcel',
      },
      userName: this.$store.state.user.info.realname,
    }
  },
  computed: {
    isApply() {
      return this.state === 'apply'
    },
  },
  created() {
    this.initStatusList()
  },
  methods: {
    initStatusList() {
      this.statusList = [
        { key: 'zt_', label: '全部', count: 0, fields: 'zt', value: '' },
        { key: 'zt_0', label: '审批中', count: 0, fields: 'zt', value: '0' },
        { key: 'zt_1', label: '已通过', count: 0, fields: 'zt', value: '1' },
        { key: 'zt_2', label: '不通过', count: 0, fields: 'zt', value: '2' },
        { key: 'zt_3', label: '已撤回', count: 0, fields: 'zt', value: '3' },
      ]
      this.loadStatusCount()
    },
    loadStatusCount() {
      var that = this
      postAction('/commonTj/ztTjInfo/getTjListByCodes', { hrm_fxtsqxx: {} }).then(function (res) {
        if (res.success && res.result && res.result.hrm_fxtsqxx && res.result.hrm_fxtsqxx.zt) {
          var ztList = res.result.hrm_fxtsqxx.zt
          var countMap = {}
          var totalCount = 0
          ztList.forEach(function (item) {
            countMap[item.zt] = item.count
            totalCount += item.count || 0
          })
          console.log(countMap)
          // 更新 statusList 的 count
          that.statusList.forEach(function (status) {
            if (status.key === 'zt_') {
              status.count = totalCount
            } else if (status.key === 'zt_0') {
              status.count = countMap['审批中'] || 0
            } else if (status.key === 'zt_2') {
              status.count = countMap['不通过'] || 0
            } else if (status.key === 'zt_3') {
              status.count = countMap['已撤回'] || 0
            } else {
              status.count = countMap[status.label] || 0
            }
          })
        }
      })
    },
    getStatusClass(status) {
      var classMap = { 0: 'pending', 1: 'approved', 2: 'rejected', 3: 'cancelled', 4: 'visited' }
      return classMap[status] || ''
    },
    getStatusText(status) {
      var textMap = { 0: '审批中', 1: '已通过', 2: '不通过', 3: '已撤回' }
      return textMap[status] || status
    },
    // 已通过时显示fxzt_dictText放行状态
    getDisplayStatusClass(record) {
      if (record.zt === '1') {
        return record.fxzt === '1' ? 'visited' : 'approved'
      }
      return this.getStatusClass(record.zt)
    },
    getDisplayStatusText(record) {
      if (this.isApply && record.zt === '1') {
        return record.fxzt_dictText || (record.fxzt === '1' ? '已放行' : '待放行')
      }
      return record.zt_dictText || this.getStatusText(record.zt)
    },
    isStatusActive(key) {
      var item = this.statusList.find(function (s) {
        return s.key === key
      })
      if (!item) return false
      if (item.value === '' && item.fields === 'zt') {
        return this.queryParam.zt === '' || this.queryParam.zt === null || this.queryParam.zt === undefined
      }
      return this.queryParam.zt === item.value
    },
    changeStatus(key) {
      var item = this.statusList.find(function (s) {
        return s.key === key
      })
      if (item) {
        this.queryParam.zt = item.value
      }
      this.loadData(1)
    },
    handleRangeChange(value, dateStrings) {
      this.passDateRange = value || []
      this.queryParam.fxrq_begin = dateStrings && dateStrings[0] ? dateStrings[0] : ''
      this.queryParam.fxrq_end = dateStrings && dateStrings[1] ? dateStrings[1] : ''
    },
    searchQuery() {
      this.loadData(1)
      this.selectedRowKeys = []
      this.selectionRows = []
      this.loadStatusCount()
    },
    searchReset() {
      this.queryParam = {
        fxr: '',
        sjhf: '',
        fxqr: '',
        fxrq_begin: '',
        fxrq_end: '',
        zt: '',
      }
      this.passDateRange = []
      this.searchQuery()
    },
    handleAdd() {
      this.$refs.modalForm.add()
      this.$refs.modalForm.title = '申请放行'
    },
    previewImage(text) {
      this.$store.dispatch('openPdf', text)
    },
    handleDetail(record) {
      this.$refs.detailModal.show(record)
    },
    handleAudit(record) {
      this.$refs.approvalModal.show(record)
    },
    handlePass(record) {
      this.$refs.releaseModal.show(record)
    },
    // 撤回申请
    handleCancel(record) {
      var that = this
      this.$confirm({
        title: '撤回确认',
        content: '确定要撤回该申请吗？撤回后将无法恢复。',
        okText: '确认撤回',
        onOk() {
          return postAction('/fkzx/hrmFxtsqxx/edit', { id: record.id, zt: '3' })
            .then(function (res) {
              if (res.success) {
                that.$message.success('撤回成功')
                that.loadData()
                that.loadStatusCount()
              } else {
                that.$message.warning(res.message || '撤回失败')
              }
            })
            .catch(function () {
              that.$message.error('撤回失败')
            })
        },
      })
    },
    handlePageChange(page, pageSize) {
      this.ipagination.current = page
      this.ipagination.pageSize = pageSize
      this.loadData()
    },
    handleSizeChange(current, size) {
      this.ipagination.current = 1
      this.ipagination.pageSize = size
      this.loadData()
    },
    modalFormOk() {
      this.loadData()
      this.loadStatusCount()
    },
  },
}
</script>

<style lang="less" scoped>
@import '../visitor-theme.less';

.pass-slip-module {
  background: @v-background;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.photo-empty {
  color: @v-muted-foreground;
  font-size: 12px;
}

.v-pagination {
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: rgba(@v-primary-rgb, 0.015);
  border-top: 1px solid @v-border;

  /deep/ .ant-pagination {
    margin: 0;
  }
}
</style>
