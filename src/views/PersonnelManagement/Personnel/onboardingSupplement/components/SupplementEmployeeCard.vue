<template>
  <div class="supplement-profile">
    <section class="supplement-welcome-card">
      <h1>欢迎加入强瑞技术</h1>
      <p>请完善以下入职资料，我们将据此为您办理入职手续。</p>
    </section>

    <!-- <section class="supplement-employee-card">
      <span class="supplement-avatar">{{ getAvatarText(detail) }}</span>
      <div class="supplement-employee-main">
        <div class="supplement-employee-name">
          <strong>{{ getEmployeeName(detail) }}</strong>
          <span v-if="detail.dept_dictText" class="supplement-employee-tag">{{ detail.dept_dictText }}</span>
        </div>
        <div class="supplement-employee-meta">
          <span>工号：{{ displayValue(detail.gh) }}</span>
          <span v-if="detail.postId_dictText">岗位：{{ detail.postId_dictText }}</span>
        </div>
      </div>
      <a-button type="link" class="supplement-restart" @click="$emit('restart')">重新查询</a-button>
    </section> -->
  </div>
</template>

<script>
export default {
  name: 'SupplementEmployeeCard',
  props: {
    detail: {
      type: Object,
      required: true,
    },
  },
  methods: {
    displayValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
    getEmployeeName(record) {
      return (record && record.xm) || '-'
    },
    getAvatarText(record) {
      const name = this.getEmployeeName(record)
      return name && name !== '-' ? name.slice(-2) : '-'
    },
  },
}
</script>

