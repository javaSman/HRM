<template>
  <div class="arrival-review employee-form">
    <a-tabs :activeKey="activeTab" :animated="false" class="employee-form-tabs" @change="handleTabChange">
      <a-tab-pane key="basic" tab="基本身份信息">
        <div class="employee-form-container">
          <hr-employee-basic-information-form
            ref="basicForm"
            :model="detail.jbxx"
            :constract-belong-options="contractBelongOptions"
            photo-biz-path="hrmRzglSupplement"
          />
        </div>
      </a-tab-pane>

      <a-tab-pane key="jyjl" tab="教育经历">
        <div class="employee-form-container">
          <onboarding-arrival-record-list v-model="detail.jyjl" group-key="jyjl" :detail="detail" />
        </div>
      </a-tab-pane>
      <a-tab-pane key="gzll" tab="工作履历">
        <div class="employee-form-container">
          <onboarding-arrival-record-list v-model="detail.gzll" group-key="gzll" :detail="detail" />
        </div>
      </a-tab-pane>
      <a-tab-pane key="jtcy" tab="家庭成员">
        <div class="employee-form-container">
          <onboarding-arrival-record-list v-model="detail.jtcy" group-key="jtcy" :detail="detail" />
        </div>
      </a-tab-pane>
      <a-tab-pane key="grfj" tab="个人附件">
        <div class="employee-form-container">
          <onboarding-arrival-record-list v-model="detail.grfj" group-key="grfj" :detail="detail" />
        </div>
      </a-tab-pane>
      <a-tab-pane key="gxsb" tab="关系申报">
        <div class="employee-form-container">
          <onboarding-arrival-record-list v-model="detail.gxsb" group-key="gxsb" :detail="detail" />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import HrEmployeeBasicInformationForm from '@views/peoplemanagement/employeeInfo/modules/HrEmployeeBasicInformationForm.vue'
import OnboardingArrivalRecordList from './OnboardingArrivalRecordList'

export default {
  name: 'OnboardingArrivalReview',
  components: {
    HrEmployeeBasicInformationForm,
    OnboardingArrivalRecordList
  },
  props: {
    detail: {
      type: Object,
      required: true
    },
    fieldOptions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      activeTab: 'basic'
    }
  },
  computed: {
    contractBelongOptions() {
      return this.fieldOptions.constractBelong || []
    }
  },
  watch: {
    'detail.id'() {
      this.activeTab = 'basic'
    }
  },
  methods: {
    handleTabChange(key) {
      this.activeTab = key
    },
    validate(callback) {
      const basicForm = this.$refs.basicForm
      if (!basicForm) {
        this.activeTab = 'basic'
        this.$nextTick(() => this.validate(callback))
        return
      }
      basicForm.validate(valid => {
        if (!valid) {
          this.activeTab = 'basic'
        } else {
          basicForm.prepareModel()
        }
        callback(valid)
      })
    }
  }
}
</script>
