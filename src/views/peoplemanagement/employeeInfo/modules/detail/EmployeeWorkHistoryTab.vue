<template>
  <hrm-gzll-list :ghId="ghId" />
</template>

<script>
import HrmGzllList from '../tabForms/work/HrmGzllList.vue'

export default {
  name: 'EmployeeWorkHistoryTab',
  components: {
    HrmGzllList
  },
  props: {
    ghId: {
      type: [String, Number],
      default: ''
    }
  }
}
</script>
