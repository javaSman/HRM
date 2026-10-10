<template>
  <div class="arrival-modal-shell">
    <div class="arrival-employee-summary">
      <div class="arrival-employee-main">
        <a-avatar :size="48" icon="user" />
        <div>
          <div class="arrival-employee-name">{{ displayValue(detail.xm) }}</div>
          <div class="arrival-employee-meta">
            {{ displayValue(detail.gs) }} / {{ displayValue(detail.dept_dictText) }} / {{ displayValue(detail.postId_dictText) }}
          </div>
        </div>
      </div>
      <div class="arrival-employee-number"><span>员工工号</span><strong>{{ displayValue(detail.gh) }}</strong></div>
    </div>
    <a-tabs :activeKey="activeTab" :animated="false" class="arrival-tabs" @change="activeTab = $event">
      <a-tab-pane key="review" tab="资料审核">
        <div class="arrival-tab-scroll">
          <onboarding-arrival-review
            ref="reviewForm"
            :detail="detail"
            :field-options="fieldOptions"
          />
        </div>
      </a-tab-pane>
      <a-tab-pane key="confirm" tab="入职确认">
        <div class="arrival-tab-scroll">
          <onboarding-arrival-confirm-form ref="confirmForm" :model="formModel" :detail="detail" />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import OnboardingArrivalReview from './OnboardingArrivalReview.vue'
import OnboardingArrivalConfirmForm from './OnboardingArrivalConfirmForm.vue'

export default {
  name: 'OnboardingArrivalContent',
  components: { OnboardingArrivalReview, OnboardingArrivalConfirmForm },
  props: {
    detail: { type: Object, required: true },
    formModel: { type: Object, required: true },
    fieldOptions: { type: Object, default: () => ({}) }
  },
  data() {
    return { activeTab: 'review' }
  },
  methods: {
    displayValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
    validate(callback) {
      const reviewForm = this.$refs.reviewForm
      if (!reviewForm) {
        this.activeTab = 'review'
        this.$nextTick(() => this.validate(callback))
        return
      }
      reviewForm.validate(valid => {
        if (!valid) {
          this.activeTab = 'review'
          callback(new Error('资料审核校验未通过'))
          return
        }
        this.validateConfirmForm(callback)
      })
    },
    validateConfirmForm(callback) {
      const confirmForm = this.$refs.confirmForm
      if (!confirmForm) {
        this.activeTab = 'confirm'
        this.$nextTick(() => this.validateConfirmForm(callback))
        return
      }
      confirmForm.validate(valid => {
        if (!valid) this.activeTab = 'confirm'
        callback(valid ? undefined : new Error('入职确认校验未通过'))
      })
    }
  }
}
</script>
