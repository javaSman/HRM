<template>
  <j-modal
    title="Offer详情"
    :width="900"
    :visible="visible"
    switchFullscreen
    :bodyStyle="bodyStyle"
    cancelText="关闭"
    :okButtonProps="{ class: { 'jee-hidden': true } }"
    @cancel="close">
    <a-tabs :activeKey="activeTab" :animated="false" @change="handleTabChange">
      <a-tab-pane key="info" tab="Offer信息">
        <div class="info-grid">
          <!-- <div class="info-item"><span class="info-label">序号</span><span class="info-value">{{ formatValue(record.xh) }}</span></div> -->
          <div class="info-item">
            <span class="info-label">状态</span>
            <span class="info-value"><a-tag :color="getStatusColor(record.zt)">{{ getStatusText(record.zt) }}</a-tag></span>
          </div>
          <div class="info-item" v-if="record.zt === '已拒绝'"><span class="info-label">拒绝原因</span><span class="info-value">{{ formatValue(record.jjyy) }}</span></div>
          <div class="info-item"><span class="info-label">姓名</span><span class="info-value">{{ formatValue(record.xm) }}</span></div>
          <div class="info-item"><span class="info-label">联系方式</span><span class="info-value">{{ formatValue(record.lxfs) }}</span></div>
          <!-- <div class="info-item"><span class="info-label">公司名称</span><span class="info-value">{{ formatValue(record.gsmc) }}</span></div> -->
          <div class="info-item"><span class="info-label">所属部门</span><span class="info-value">{{ formatValue(record.dept_dictText || record.deptName) }}</span></div>
          <div class="info-item"><span class="info-label">岗位名称</span><span class="info-value">{{ formatValue(record.postName || record.postId_dictText || record.postId) }}</span></div>
          <div class="info-item"><span class="info-label">职级名称</span><span class="info-value">{{ formatValue(record.levelName || record.levelId_dictText || record.levelId) }}</span></div>
          <div class="info-item"><span class="info-label">薪资(K)</span><span class="info-value">{{ formatSalary(record.xz) }}</span></div>
          <div class="info-item"><span class="info-label">最晚回复时间</span><span class="info-value">{{ formatValue(record.zwhfsj) }}</span></div>
          <div class="info-item"><span class="info-label">招聘计划ID</span><span class="info-value">{{ formatValue(record.zpjhid) }}</span></div>
          <div class="info-item">
            <span class="info-label">关联简历</span>
            <span class="info-value">
              {{ formatValue(record.gljl) }}
              <a-button v-if="record.gljl" type="link" size="small" icon="eye" @click="lookPdf(record.gljl)">预览</a-button>
            </span>
          </div>
          <div class="info-item"><span class="info-label">审批人</span><span class="info-value">{{ formatValue(record.sqr) }}</span></div>
          <div class="info-item"><span class="info-label">抄送人</span><span class="info-value">{{ formatValue(record.csr) }}</span></div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="flow" tab="审批流程">
        <a-steps :current="flowCurrent" progressDot>
          <a-step title="创建Offer" />
          <a-step title="审批中" />
          <a-step title="待确认" />
          <a-step title="已确认" />
        </a-steps>
      </a-tab-pane>
      <a-tab-pane key="material" tab="附件材料">
        <offer-material-detail-pane :lzzm="record.lzzm || ''" :lszm="record.lszm || ''" @preview="lookPdf" />
      </a-tab-pane>
      <a-tab-pane key="record" tab="操作记录">
        <a-timeline v-if="recordList.length">
          <a-timeline-item v-for="item in recordList" :key="item.time + item.desc">
            <div class="event-title">{{ item.user }} · {{ item.time }}</div>
            <div class="event-desc">{{ item.desc }}</div>
          </a-timeline-item>
        </a-timeline>
        <a-empty v-else description="暂无操作记录" />
      </a-tab-pane>
    </a-tabs>
  </j-modal>
</template>

<script>
import OfferMaterialDetailPane from './OfferMaterialDetailPane.vue'

const STATUS_MAP = {
  审批中: { text: '审批中', color: 'orange' },
  待确认: { text: '待确认', color: 'blue' },
  已确认: { text: '已确认', color: 'green' },
  审批拒绝: { text: '审批拒绝', color: 'red' },
  已拒绝: { text: '已拒绝', color: '' },
  已放弃: { text: '已放弃', color: '' }
}

export default {
  name: 'RecruitmentOfferDetailModal',
  components: {
    OfferMaterialDetailPane
  },
  data() {
    return {
      visible: false,
      activeTab: 'info',
      record: {},
      bodyStyle: {
        maxHeight: 'calc(100vh - 168px)',
        overflowY: 'auto',
        padding: '16px 24px 12px'
      }
    }
  },
  computed: {
    flowCurrent() {
      if (this.record.zt === '已确认') {
        return 3
      }
      if (this.record.zt === '待确认') {
        return 2
      }
      return 1
    },
    recordList() {
      return Array.isArray(this.record.events) ? this.record.events : []
    }
  },
  methods: {
    open(record) {
      this.record = Object.assign({}, record || {})
      this.activeTab = 'info'
      this.visible = true
    },
    close() {
      this.visible = false
    },
    formatValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
    formatSalary(value) {
      return value === undefined || value === null || value === '' ? '-' : value + 'K'
    },
    getStatusText(status) {
      return STATUS_MAP[status] ? STATUS_MAP[status].text : this.formatValue(status)
    },
    getStatusColor(status) {
      return STATUS_MAP[status] ? STATUS_MAP[status].color : ''
    },
    handleTabChange(activeKey) {
      this.activeTab = activeKey
    },
    lookPdf(text) {
      console.log(text)
      this.$store.dispatch('openPdf', text)
    }
  }
}
</script>

<style scoped lang="less">
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.info-item {
  min-height: 48px;
  padding: 9px 12px;
  border-radius: 4px;
  background: #f7f8fa;
}

.info-label {
  display: block;
  margin-bottom: 4px;
  color: #8c8c8c;
  font-size: 12px;
}

.info-value {
  color: #262626;
  font-size: 13px;
}

.event-title {
  color: #262626;
  font-weight: 500;
}

.event-desc {
  color: #595959;
}
</style>
