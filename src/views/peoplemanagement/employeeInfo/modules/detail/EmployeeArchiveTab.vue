<template>
  <hrm-ygzzzs-list :ghId="ghId" v-on="$listeners"/>
</template>

<script>
import HrmYgzzzsList from '../tabForms/userFile/HrmYgzzzsList.vue'

export default {
  name: 'EmployeeArchiveTab',
  components: {
    HrmYgzzzsList
  },
  props: {
    ghId: {
      type: [String, Number],
      default: ''
    }
  }
}
</script>
