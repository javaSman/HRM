<template>
  <div>
    <!-- 从流程管理直接发起时，使用业务页面的真实可编辑表单。 -->
    <hr-xjsq-apply-form
      v-if="isNew"
      ref="applyForm"
      :disabled="false"
      title="新增"
      :OK_show="false"
      :isDeduct="false"
      @ok="handleSaved"
    />

    <!-- 已经发起的流程只展示业务数据，不允许在审批页直接修改申请内容。 -->
    <a-card v-else :bordered="false" size="small" title="请假申请">
      <a-descriptions bordered :column="2" size="small">
        <a-descriptions-item label="姓名">{{ value.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="工号">{{ value.no || '-' }}</a-descriptions-item>
        <a-descriptions-item label="请假类型">{{ value.xjType || '-' }}</a-descriptions-item>
        <a-descriptions-item label="审批状态">{{ statusText(value.spStatus) }}</a-descriptions-item>
        <a-descriptions-item label="开始时间">{{ value.startTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="结束时间">{{ value.endTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="申请时长">
          {{ value.xjType === '年假' ? (value.applyDays || '-') + ' 天' : (value.applyHours || '-') + ' 小时' }}
        </a-descriptions-item>
        <a-descriptions-item label="申请原因" :span="2">{{ value.sqyy || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script>
import HrXjsqApplyForm from './HrXjsqApplyForm'

export default {
  name: 'FlowableHrXjsqForm',
  components: { HrXjsqApplyForm },
  props: {
    model: { type: Object, default: () => ({}) },
    customFormData: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: true },
    isNew: { type: Boolean, default: false }
  },
  computed: {
    value() {
      return Object.assign({}, this.customFormData || {}, this.model || {})
    }
  },
  mounted() {
    this.initNewForm()
  },
  methods: {
    initNewForm() {
      if (this.isNew && this.$refs.applyForm) {
        this.$refs.applyForm.edit(this.value)
      }
    },
    submitForm() {
      if (!this.isNew || !this.$refs.applyForm) return
      this.$refs.applyForm.submitForm()
    },
    handleSaved(record) {
      this.$emit('saved', record)
    },
    statusText(status) {
      return { 1: '审批中', 2: '已通过', 3: '已撤回', 4: '已退回' }[status] || '-'
    }
  }
}
</script>
