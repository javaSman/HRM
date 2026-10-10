<template>
  <hrm-ygfljl-list :ghId="ghId" />
</template>

<script>
import HrmYgfljlList from '../tabForms/fangtan/HrmYgfljlList.vue'

export default {
  name: 'EmployeeInterviewTab',
  components: {
    HrmYgfljlList
  },
  props: {
    ghId: {
      type: [String, Number],
      default: ''
    }
  }
}
</script>
