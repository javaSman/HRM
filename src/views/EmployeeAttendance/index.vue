<template>
  <div style="height: 87vh;width: 100%;background-color: #fff;border-radius: 5px;">
    <!-- <a-tabs v-model="activeKey" @change="callback">
      <a-tab-pane key="99" tab="全部"></a-tab-pane>
      <a-tab-pane v-for="item in companyList" :key="item.id" :tab="item.name">
      </a-tab-pane>
    </a-tabs> -->
    <Alist :url="url.list" :activeKey="activeKey != '99' ? activeKey : ''" :companyList="companyList" />
  </div>
</template>

<script>
import { getAction } from '@/api/manage'
import Alist from './indexList'


export default {
  name: 'EmployeeAttendance',
  components: {
    Alist,
  },
  data() {
    return {
      activeKey: '99',
      // 基本信息数据
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
    callback(key) {
      this.activeKey = key;
    }
  }
}
</script>

<style scoped lang="less"></style>
