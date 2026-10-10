<template>
  <hrm-jyjl-list :ghId="ghId" />
</template>

<script>
import HrmJyjlList from '../tabForms/jiaoyu/HrmJyjlList.vue'

export default {
  name: 'EmployeeEducationTab',
  components: {
    HrmJyjlList
  },
  props: {
    ghId: {
      type: [String, Number],
      default: ''
    }
  }
}
</script>
