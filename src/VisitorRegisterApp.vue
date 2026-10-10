<template>
  <a-config-provider :locale="locale">
    <div id="visitor-register-root">
      <self-register-h5 />
    </div>
  </a-config-provider>
</template>

<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
import SelfRegisterH5 from './views/visitor/modules/SelfRegisterH5.vue'

export default {
  name: 'VisitorRegisterApp',
  components: {
    SelfRegisterH5
  },
  data() {
    return {
      locale: zhCN
    }
  }
}
</script>

<style lang="less">
#visitor-register-root {
  height: 100%;
  width: 100%;
}
</style>
