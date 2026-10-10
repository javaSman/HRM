<template>
  <hr-xjsq-list :isDeduct="isDeduct" :boxState="1"></hr-xjsq-list>
</template>

<script>
import HrXjsqList from './HrXjsqList'

export default {
  name: 'HrXjsqLists',
  components: {
    HrXjsqList,
  },
  props: {
    isDeduct: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
