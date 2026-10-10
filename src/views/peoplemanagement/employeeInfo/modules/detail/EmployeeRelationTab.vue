<template>
  <hrm-yggxsb-list :ghId="ghId" />
</template>

<script>
import HrmYggxsbList from '../tabForms/guanxi/HrmYggxsbList.vue'

export default {
  name: 'EmployeeRelationTab',
  components: {
    HrmYggxsbList
  },
  props: {
    ghId: {
      type: [String, Number],
      default: ''
    }
  }
}
</script>
