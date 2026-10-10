<template>
  <div class="panel-tab__content">
    <el-form size="mini" label-width="90px" @submit.native.prevent>
      <el-form-item label="服务类型">
        <el-select v-model="serviceType">
          <el-option v-for="i in Object.keys(typeObject)" :key="i" :label="typeObject[i]" :value="i" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="serviceType === 'class'" label="Java类">
        <el-input v-model="serviceValue" clearable @change="updateInfo('class')" />
      </el-form-item>
      <el-form-item v-if="serviceType === 'expression'" label="表达式">
        <el-input v-model="serviceValue" clearable @change="updateInfo('expression')" />
      </el-form-item>
      <el-form-item v-if="serviceType === 'delegateExpression'" label="代理表达式">
        <el-input v-model="serviceValue" clearable @change="updateInfo('delegateExpression')" />
      </el-form-item>
      <el-form-item v-if="serviceType === 'expression'" label="结果变量">
        <el-input v-model="resultVariable" clearable @change="updateInfo('resultVariable')" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: "ServiceTask",
  props: {
    id: String,
    type: String
  },
  inject: {
    prefix: "prefix",
    width: "width"
  },
  data() {
    return {
      typeObject: {
        class: "Java 类",
        expression: "表达式",
        delegateExpression: "代理表达式"
      },
      serviceType: "",
      serviceValue: "",
      resultVariable: ""
    };
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        this.$nextTick(() => this.resetBaseInfo());
      }
    }
  },
  methods: {
    resetBaseInfo() {
      this.bpmnElement = window?.bpmnInstances?.bpmnElement;
      var val = "";
      if ((val = this.bpmnElement.businessObject.class)) {
        this.serviceType = "class";
      } else if ((val = this.bpmnElement.businessObject.expression)) {
        this.serviceType = "expression";
        if(this.bpmnElement.businessObject.hasOwnProperty('resultVariable')) {
          this.resultVariable = this.bpmnElement.businessObject.resultVariable;
        }
      } else if ((val = this.bpmnElement.businessObject.delegateExpression)) {
        this.serviceType = "delegateExpression";
      }
      this.serviceValue = val;
    },
    updateInfo(key) {
      const attrObj = Object.create(null);
      attrObj.class = undefined;
      attrObj.expression = undefined;
      attrObj.delegateExpression = undefined;
      attrObj.resultVariable = undefined;
      if (key === "class") {
        attrObj.class = this.serviceValue;
      } else if (key === "expression") {
        attrObj.expression = this.serviceValue;
        if(this.resultVariable != "") {
          attrObj.resultVariable =  this.resultVariable;
        }
      } else if (key === "delegateExpression"){
        attrObj.delegateExpression = this.serviceValue;
      }
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, attrObj);
    }
  },
  beforeDestroy() {
    this.bpmnElement = null;
  }
};
</script>