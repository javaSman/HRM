<template>
  <j-modal
    :title="title"
    :width="1100"
    :visible="visible"
    switchFullscreen
    :bodyStyle="bodyStyle"
    @cancel="close"
  >
    <div class="bp-detail-summary">
      <div v-for="item in summaryItems" :key="item.key" class="bp-detail-summary-item">
        <div class="bp-detail-summary-value" :style="{ color: item.color }">{{ formatValue(item.value) }}</div>
        <div class="bp-detail-summary-label">{{ item.label }}</div>
      </div>
    </div>

    <div class="bp-detail-section-title">归属候选人明细</div>
    <a-spin :spinning="loading">
      <a-table
        size="small"
        :rowKey="getRowKey"
        :columns="columns"
        :dataSource="detailRows"
        :pagination="false"
        :scroll="{ x: 1170 }"
        :locale="{ emptyText: '暂无候选人明细' }"
      >
        <span slot="detailValue" slot-scope="text">{{ formatValue(text) }}</span>
        <span slot="offerStatus" slot-scope="text">
          <a-tag :color="getOfferStatusColor(text)">{{ formatValue(text) }}</a-tag>
        </span>
        <span slot="onboardStatus" slot-scope="text">
          <a-tag :color="getOnboardStatusColor(text)">{{ formatValue(text) }}</a-tag>
        </span>
      </a-table>
    </a-spin>

    <template slot="footer">
      <a-button @click="close">关闭</a-button>
    </template>
  </j-modal>
</template>

<script>
import { getAction } from '@/api/manage'

const DETAIL_COLUMNS = [
  { title: '序号', width: 70, customRender: (text, record, index) => index + 1 },
  { title: '姓名', dataIndex: 'xm', width: 100, scopedSlots: { customRender: 'detailValue' } },
  { title: '手机号', dataIndex: 'lxfs', width: 130, scopedSlots: { customRender: 'detailValue' } },
  { title: '所属部门', dataIndex: 'departName', width: 140, scopedSlots: { customRender: 'detailValue' } },
  { title: '岗位名称', dataIndex: 'postName', width: 140, scopedSlots: { customRender: 'detailValue' } },
  { title: '职级', dataIndex: 'levelName', width: 120, scopedSlots: { customRender: 'detailValue' } },
  { title: 'Offer状态', dataIndex: 'zt', width: 110, scopedSlots: { customRender: 'offerStatus' } },
  { title: '入职状态', dataIndex: 'rzzt', width: 110, scopedSlots: { customRender: 'onboardStatus' } },
  { title: '入职日期', dataIndex: 'rzrq', width: 120, scopedSlots: { customRender: 'detailValue' } },
  { title: '来源', dataIndex: 'jlly', width: 130, scopedSlots: { customRender: 'detailValue' } }
]

const OFFER_STATUS_COLORS = {
  审批中: 'orange',
  待确认: 'blue',
  已确认: 'green',
  审批拒绝: 'red',
  拒绝: 'red'
}

const ONBOARD_STATUS_COLORS = {
  待入职: 'blue',
  已入职: 'green',
  放弃入职: 'red'
}

export default {
  name: 'OverviewBpDetailModal',
  data() {
    return {
      visible: false,
      loading: false,
      record: {},
      detailRows: [],
      columns: DETAIL_COLUMNS,
      bodyStyle: { maxHeight: 'calc(100vh - 168px)', overflowY: 'auto', padding: '16px 24px 12px' }
    }
  },
  computed: {
    title() {
      return this.formatValue(this.record.createBy) + ' - BP招聘详情'
    },
    summaryItems() {
      return [
        { key: 'monthlyCount', label: '月度完成招聘量', value: this.record.monthlyCount, color: '#4a7bf7' },
        { key: 'offerCount', label: 'Offer量', value: this.record.offerCount, color: '#f59e0b' },
        { key: 'drzCount', label: '待入职量', value: this.record.drzCount, color: '#4a7bf7' },
        { key: 'rzCount', label: '入职量', value: this.record.rzCount, color: '#22c55e' },
        { key: 'nbCount', label: '内部推荐人数', value: this.record.nbCount, color: '#8b5cf6' }
      ]
    }
  },
  methods: {
    open(record) {
      this.record = Object.assign({}, record || {})
      this.detailRows = []
      this.visible = true
      this.loadDetail()
    },
    close() {
      this.visible = false
    },
    loadDetail() {
      // if (!this.record.createBy || !this.record.dept) {
      //   this.$message.error('BP详情参数缺失')
      //   return
      // }
      this.loading = true
      getAction('/zpManage/hrmZpOverView/getBPList', {
        BPno: this.record.createBy,
        deptid: this.record.dept
      })
        .then(res => {
          if (res && res.success && Array.isArray(res.result)) {
            this.detailRows = res.result
          } else {
            this.detailRows = []
            this.$message.error((res && res.message) || 'BP招聘详情加载失败')
          }
        })
        .catch(() => {
          this.detailRows = []
          this.$message.error('BP招聘详情加载失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },
    formatValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
    getOfferStatusColor(status) {
      return OFFER_STATUS_COLORS[status]
    },
    getOnboardStatusColor(status) {
      return ONBOARD_STATUS_COLORS[status]
    },
    getRowKey(record, index) {
      return [record.xm, record.lxfs, record.postId, record.rzrq, index].join('-')
    }
  }
}
</script>

<style scoped lang="less">
@import './overviewBpDetailModal.less';
</style>
