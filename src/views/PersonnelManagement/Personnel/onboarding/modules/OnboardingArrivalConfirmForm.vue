<template>
  <div class="arrival-confirm-form">
    <div class="arrival-section">
      <div class="arrival-section-title"><a-icon type="check-circle" /><span>到岗确认</span></div>
      <a-form-model ref="form" :model="model" :rules="validatorRules" layout="vertical">
        <div class="arrival-field-grid">
          <a-form-model-item label="实际到岗日期" prop="actualDate">
            <j-date
              v-model="model.actualDate"
              date-format="YYYY-MM-DD"
              placeholder="请选择实际到岗日期"
              style="width: 100%"
            />
          </a-form-model-item>
        </div>
      </a-form-model>
      <a-alert class="arrival-form-alert" type="info" show-icon message="确认后系统将更新入职状态，并记录实际到岗日期。" />
    </div>
    <onboarding-dormitory-form
      v-if="isInner"
      ref="dormitoryForm"
      :model="model.rzsq"
      :detail="detail"
    />
  </div>
</template>

<script>
import OnboardingDormitoryForm from './OnboardingDormitoryForm.vue'

export default {
  name: 'OnboardingArrivalConfirmForm',
  components: { OnboardingDormitoryForm },
  props: {
    model: { type: Object, required: true },
    detail: { type: Object, required: true }
  },
  data() {
    return {
      validatorRules: {
        actualDate: [{ required: true, message: '请选择实际到岗日期', trigger: 'change' }]
      }
    }
  },
  computed: {
    isInner() {
      return this.detail.jbxx && this.detail.jbxx.zsfs === '内宿'
    }
  },
  methods: {
    validate(callback) {
      this.$refs.form.validate(valid => {
        if (!valid || !this.isInner) {
          callback(valid)
          return
        }
        this.$refs.dormitoryForm.validate(callback)
      })
    }
  }
}
</script>
