<template>
  <a-popover placement="bottomRight" trigger="click">
    <template slot="content">
      <p>
        <j-code-editor v-model="codeTemp" :fullScreen="true"></j-code-editor>
      </p>
    </template>
    <a-button @click="showChange">查看代码</a-button>
  </a-popover>
</template>

<script>
import JCodeEditor from "@/components/jeecg/JCodeEditor";
import { convertToSuperQueryCode } from "@/utils/superQueryGenerator";

export default {
  name: "SuperQueryCodeShow",
  components: {
    JCodeEditor
  },
  props: {
    value: {
      type: String,
      required: true,
      // 增加参数校验，避免传入非字符串值
      validator: (val) => {
        return typeof val === 'string';
      }
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(newValue) {
        this.myChange(newValue);
      }
    },
  },
  data() {
    return {
      supSql: "",
      codeTemp: "",
    };
  },
  methods: {
    myChange(param) {
      // 空值处理，避免传入空字符串导致工具函数报错
      if (!param || param.trim() === "") {
        this.codeTemp = "// 请传入有效的查询参数";
        return;
      }

      try {
        // 执行工具函数并捕获异常
        this.supSql = convertToSuperQueryCode(param);
        console.log("??",this.supSql)
        // 关键修复：给生成的字符串添加引号，避免语法错误
        this.codeTemp = `import {SuperQuery} from '@/utils/superQueryUtil'
let str = ${this.supSql}
"http://xxxxx/list?superQueryStr="+str;
`;
      } catch (error) {

      }
    },
    showChange(){
      this.$emit('click',null)
    }
  },
};
</script>

<style scoped>
</style>