<template>
  <div class="pass-apply-page">
    <pass-slip state="apply" />
  </div>
</template>

<script>
import PassSlip from './modules/PassSlip.vue'

export default {
  name: 'PassApply',
  components: {
    PassSlip,
  },
}
</script>

<style lang="less" scoped>
@import './visitor-theme.less';

.pass-apply-page {
  background: @v-background;
  display: flex;
  flex-direction: column;
  animation: v-fade-in 0.3s ease-out both;
}
</style>