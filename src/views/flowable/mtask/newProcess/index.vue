<template>
  <div v-if="definitionList.length > 0">
    <div v-for="(item, index) in definitionList" :key="index">
      <a-collapse v-model:activeKey="activeKey">
        <a-collapse-panel key="1" :header="item.category">
          <a @click="SubmitApplication(item)">{{ item.name }}</a>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </div>
</template>

<script>
import { USER_NAME } from "@/store/mutation-types";
import Vue from "vue";
import { listDefinition } from "@views/flowable/api/definition";
export default {
  data() {
    return {
      activeKey: ["1"],
      queryParams: {
        pageNum: 1,
        pageSize: 1000,
        category: "oa",
        suspensionState: 0,
      },
      definitionList: [],
    };
  },
  watch: {
    activeKey(key) {
      console.log(key);
    },
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      //this.loading = true;
      listDefinition(this.queryParams).then((response) => {
        console.log(response.result.records);
        this.definitionList = response.result.records;
        // this.loading = false;
      });
    },
    SubmitApplication(row) {
      window.open(
        "/flowable/task/record/index?deployId=" +
          row.deploymentId +
          "&procDefId=" +
          row.id +
          "&category=" +
          row.category +
          "&finished=true" +
          "&username=" +
          Vue.ls.get(USER_NAME),
        "_blank"
      );
    },
  },
};
</script>

<style lang="scss" scoped>
</style>