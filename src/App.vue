<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view/>

    </div>
  </a-config-provider>
</template>
<script>
  import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
  import enquireScreen from '@/utils/device'

  export default {
    data () {                                                                                                                                                                                                                                                                                                     
      return {
        locale: zhCN,
      }
    },
    created () {
      // 关闭手机模式，始终保持桌面模式
      this.$store.commit('TOGGLE_DEVICE', 'desktop')
      this.$store.dispatch('setSidebar', true)

      // 原始手机模式监听逻辑已注释
      // let that = this
      // enquireScreen(deviceType => {
      //   // tablet
      //   if (deviceType === 0) {
      //     that.$store.commit('TOGGLE_DEVICE', 'mobile')
      //     that.$store.dispatch('setSidebar', false)
      //   }
      //   // mobile
      //   else if (deviceType === 1) {
      //     that.$store.commit('TOGGLE_DEVICE', 'mobile')
      //     that.$store.dispatch('setSidebar', false)
      //   }
      //   else {
      //     that.$store.commit('TOGGLE_DEVICE', 'desktop')
      //     that.$store.dispatch('setSidebar', true)
      //   }
      // })
    }
  }
</script>
<style lang="less">
  #app {
    height: 100%;

  }

  /* 修复表格表头和内容对不齐 */
.ant-table-header {
  // 手动的添加隐藏样式
  overflow-y: hidden !important;
  // 设置表头右侧内边距手动对齐
  padding-right: 8px;
}
</style>