<template>
  <hrm-ygjtcy-list :ghId="ghId" />
</template>

<script>
import HrmYgjtcyList from '../tabForms/jiating/HrmYgjtcyList.vue'

export default {
  name: 'EmployeeFamilyTab',
  components: {
    HrmYgjtcyList
  },
  props: {
    ghId: {
      type: [String, Number],
      default: ''
    }
  }
}
</script>
