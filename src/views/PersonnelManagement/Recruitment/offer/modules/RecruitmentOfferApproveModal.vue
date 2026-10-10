<template>
  <j-modal
    title="Offer审批"
    :width="560"
    :visible="visible"
    :bodyStyle="{ padding: '18px 24px 8px' }"
    @cancel="close">
    <div class="info-grid">
      <!-- <div class="info-item"><span class="info-label">序号</span><span class="info-value">{{ record.xh || '-' }}</span></div> -->
      <div class="info-item"><span class="info-label">状态</span><span class="info-value">{{ record.zt || '-' }}</span></div>
      <div class="info-item"><span class="info-label">姓名</span><span class="info-value">{{ record.xm || '-' }}</span></div>
      <div class="info-item"><span class="info-label">岗位名称</span><span class="info-value">{{ record.postName || record.postId_dictText || '-' }}</span></div>
      <div class="info-item"><span class="info-label">职级名称</span><span class="info-value">{{ record.levelName || record.levelId_dictText || '-' }}</span></div>
      <div class="info-item"><span class="info-label">薪资(K)</span><span class="info-value">{{ formatSalary(record.xz) }}</span></div>
      <div class="info-item"><span class="info-label">所属部门</span><span class="info-value">{{ record.deptPath || '-' }}</span></div>
      <div class="info-item"><span class="info-label">审批人</span><span class="info-value">{{ record.sqr || '-' }}</span></div>
    </div>
    <a-form-model layout="vertical" class="approve-form">
      <a-form-model-item label="审批意见">
        <a-textarea v-model.trim="remark" :autoSize="{ minRows: 4, maxRows: 6 }" placeholder="请输入审批意见" />
      </a-form-model-item>
    </a-form-model>
    <template slot="footer">
      <a-button type="primary" @click="handleApprove">审批通过</a-button>
      <a-button type="danger" @click="handleReject">审批拒绝</a-button>
      <a-button @click="close">取消</a-button>
    </template>
  </j-modal>
</template>

<script>
export default {
  name: 'RecruitmentOfferApproveModal',
  data() {
    return {
      visible: false,
      record: {},
      remark: ''
    }
  },
  methods: {
    open(record) {
      this.record = record || {}
      this.remark = ''
      this.visible = true
    },
    close() {
      this.visible = false
    },
    formatSalary(value) {
      return value === undefined || value === null || value === '' ? '-' : value + 'K'
    },
    handleApprove() {
      this.$emit('ok', { action: 'approve', record: this.record, remark: this.remark })
      this.close()
    },
    handleReject() {
      if (!this.remark) {
        this.$message.warning('请填写拒绝原因')
        return
      }
      this.$emit('ok', { action: 'reject', record: this.record, remark: this.remark })
      this.close()
    }
  }
}
</script>

<style scoped>
.info-grid {
  display: grid;
  margin-bottom: 16px;
  grid-template-columns: repeat(2, 1fr);
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

.approve-form {
  margin-top: 6px;
}
</style>
