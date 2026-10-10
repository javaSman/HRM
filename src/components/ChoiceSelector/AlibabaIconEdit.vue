<template>
  <a-card >
    <iframe  :src="url" frameborder="0" width="100%" height="800px" scrolling="auto" style="background-color: #fff;"></iframe>
  </a-card>
</template>

<script>
import IframePageContent from '@comp/layouts/IframeFReportView'
export default {
  name: 'AlibabaIconEdit',
  components: { IframePageContent },
  data(){
    return{
      url:"https://www.iconfont.cn/collections/index",
    }
  },
}
</script>

<style scoped>

</style>