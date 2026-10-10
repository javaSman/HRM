<template>
  <div class="select-table-container">
    <a-select
      v-model="table"
      @change="myChange"
      :allowClear="true"
      show-search
      placeholder="请选择表"
      style="width: 240px;">

    <a-select-option v-for="(item, it) in list" :key="it" :value="item.value || ''" >
    {{ item.text + "(" + (item.value || "") + ")" }}
    </a-select-option>
    </a-select>
  </div>
</template>

<script>
import { getAction } from "@/api/manage";


export default {
  name: "SelectTable", // 可选：改为select-table更符合规范
  // 修复：监听props的value变化，同步到子组件的table（核心双向绑定逻辑）
  watch: {
    value: {
      immediate: true, // 初始化时立即执行，实现初始值回显
      handler(newVal) {
        this.table = newVal;
      }
    }
  },
  // 接收父组件的value，用于双向绑定
  props: {
    value: {
      type: String,
      default: ""
    },
  },
  data() {
    return {
      table: "", // 子组件内部绑定的选中值
      list: [] // 表名列表
    };
  },

  mounted() {
    this.getTableListInfo();
  },
  methods: {
    // 下拉选择变化时，向父组件派发input事件（配合v-model）
    myChange(value) {
      this.table = value;
      this.$emit("input", value);
      // 可选：派发change事件，父组件可监听额外的变化逻辑
      this.$emit("change", value);
    },
    // 拉取表名列表接口
    getTableListInfo() {
      getAction('/commonTj/getOperateInfo').then(res => {

        if (res.success) {
          const {tableList}=res.result
          this.list =tableList
        } else {
          this.$message.warning(res.message)
        }
      })
    }
  }
};
</script>

<style scoped>
  /* 可选：给容器加轻微样式，优化布局 */
  .select-table-container {
    display: inline-block;
  }
</style>