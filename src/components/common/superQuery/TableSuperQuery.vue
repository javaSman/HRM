<template>
  <div v-if="show">
    <Zt-super-query ref="superQueryRef" :fieldList="superFieldList" :queryParamsModels="changValue" @Highchange="myChange" operate="write">
      <!-- 在弹框页脚的插槽     -->
      <a-popover placement="bottomRight" trigger="click">
        <template slot="content">
          <p>
<!--            {{ codeTemp }}-->
            <j-code-editor v-model="codeTemp" :fullScreen="true"></j-code-editor>
          </p>
        </template>
        <a-button v-has="'admin:debug'" @click="showCode">查看代码</a-button>
      </a-popover>

      <slot></slot>
    </Zt-super-query>
  </div>
</template>

<script>

import ZtSuperQuery from '@comp/common/superQuery/ZtSuperQuery'
import {convertToSuperQueryCode} from "@/utils/superQueryGenerator";
import JCodeEditor from "@/components/jeecg/JCodeEditor";
import { getAction } from '@api/manage'

export default {
  name: 'TableSuperQuery',
  components: { ZtSuperQuery,JCodeEditor },
  props: {
    table: {
      type: String,
      required: false,
    },
    value: {
      // 自定义验证逻辑（此处不限制类型）
      validator: function(value) {
        const params = new URLSearchParams(value);
        const superQueryParams = params.get('superQueryParams');
        const superQueryMatchType = params.get('superQueryMatchType');
        const superQueryList = params.get('superQueryList');
        const superQueryListType = params.get('superQueryListType');
        if ((superQueryParams!=null && superQueryMatchType != null) || (superQueryList!=null && superQueryListType != null)){
          return false;
        }
        return true;
      }
    },
  },
  watch:{
    value: {
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        this.changValue=newValue;
      }
    },

    table:{
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        this.getFieldList(newValue);
      }
    }

  },
  data() {
    return {
      superFieldList:[],
      changValue:null,
      show:false,
      // 显示代码触发
      codeHandel:false,
      supSql:"",
      codeTemp:"",
    }
  },
  methods: {
    getFieldList(tableName) {
      if (!tableName){
        return;
      }
      getAction("/commonTj/getTableInfo?tableName="+tableName).then(res=>{
        if (res.success){
          this.superFieldList= res.result;
          this.show = true;
        }
      })
    },
    myChange(param){
      if (this.codeHandel){
        this.supSql =convertToSuperQueryCode(param);

        this.codeTemp=`import {SuperQuery} from '@/utils/superQueryUtil'
let str = ${this.supSql}
"http://xxxxx/list?superQueryStr="+str;
`



        return;
      }
      // 如果是点击确定触发直接关闭
      this.$emit('input',param);
      this.$refs.superQueryRef.handleCancel();
    },
    // 显示代码
    showCode(){
      this.codeHandel = true;
      this.$refs.superQueryRef.handleSure();
      this.codeHandel = false;
      // 解析代码 生成前端可直接运行的代
    }
  },
}
</script>

<style scoped>

</style>