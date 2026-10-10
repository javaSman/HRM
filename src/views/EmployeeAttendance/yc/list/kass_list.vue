<template>
  <div style="height: 87vh;width: 100%;background-color: #fff;border-radius: 5px;padding: 0 5px;">
    <Alist :url="url.list" :deptBelongKey="deptBelongKey" :companyList="companyList" />
  </div>
</template>

<script>
import { getAction } from '@/api/manage'
import Alist from '../HrKqYcList'

export default {
  // 强瑞卡仕标
  name: 'kass_list',
  components: {
    Alist,
  },
  data() {
    return {
      deptBelongKey: '2063973900078723074',
      url: {
        list: '/org/hrmOrg/loadTreeRoot?pid=0',
      },
      companyList: []
    }
  },
  created() {
    this.getTabsList();
  },
  methods: {
    getTabsList() {
      getAction(this.url.list).then(res => {
        if (res.success) {
          // 这一层是公司
          this.companyList = res.result[0].children;
        }
      })
    },
    
  }
}
</script>

<style scoped lang="less"></style>
