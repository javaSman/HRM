<template>
  <j-modal
    class="recruitment-flow-modal school-detail-modal"
    :title="title"
    :width="1100"
    :visible="visible"
    switchFullscreen
    :bodyStyle="{ maxHeight: 'calc(100vh - 168px)', overflowY: 'auto', padding: '0 24px 16px' }"
    :dialogStyle="{ top: '16px' }"
    :okButtonProps="{ class: { 'jee-hidden': true } }"
    cancelText="关闭"
    @cancel="close"
  >
    <a-tabs :activeKey="activeTab" @change="handleTabChange">
      <a-tab-pane key="staff" tab="学校人员">
        <hrm-gxmd-xxry-list :hrmGxmdId="hrmGxmdId" />
      </a-tab-pane>
      <a-tab-pane key="activity" tab="活动记录">
        <hrm-gxmd-hdjl-list :hrmGxmdId="hrmGxmdId" />
      </a-tab-pane>
    </a-tabs>
  </j-modal>
</template>

<script>
import HrmGxmdXxryList from '../renyuan/index.vue'
import HrmGxmdHdjlList from '../huodong/index.vue'

export default {
  name: 'HrmGxmdDetailModal',
  components: { HrmGxmdXxryList, HrmGxmdHdjlList },
  data() {
    return {
      visible: false,
      activeTab: 'staff',
      record: {}
    }
  },
  computed: {
    hrmGxmdId() {
      return this.record.id || ''
    },
    title() {
      return `高校详情 - ${this.record.xxmc || ''}`
    }
  },
  methods: {
    open(record) {
      if (!record || !record.id) {
        this.$message.warning('未获取到高校 ID，无法查看详情')
        return
      }
      this.record = Object.assign({}, record)
      this.activeTab = 'staff'
      this.visible = true
    },
    handleTabChange(key) {
      this.activeTab = key
    },
    close() {
      this.visible = false
      this.record = {}
      this.activeTab = 'staff'
    }
  }
}
</script>

<style lang="less">
@import '../../common/recruitmentModal.less';
@import './schoolDetail.less';
</style>
