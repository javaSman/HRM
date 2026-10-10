<template>
  <list :stage="1"></list>
</template>

<script>
import list from './index'
export default {
  name: 'mscs', // 面试初审
  components: {
    list,
  },
}
</script>
