<template>
  <div class="panel-tab__content">
    <el-form size="mini" label-width="90px" @submit.native.prevent>
      <el-form-item label="ID">
        <el-input v-model="elementBaseInfo.id" :disabled="idEditDisabled" clearable @change="updateBaseInfo('id')" />
      </el-form-item>
      <el-form-item label="名称">
        <el-input v-model="elementBaseInfo.name" clearable @change="updateBaseInfo('name')" />
      </el-form-item>
      <!--流程的基础属性-->
      <template v-if="elementBaseInfo.$type === 'bpmn:Process'">
        <el-form-item label="流程分类">
         <el-select v-model="elementBaseInfo.processCategory" disabled 
            clearable @change="updateBaseInfo('processCategory')" >
            <el-option
               v-for="item in categorys"
               :key="item.id"
               :label="item.name"
               :value="item.id">
             </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="版本标签">
          <el-input v-model="elementBaseInfo.versionTag" clearable @change="updateBaseInfo('versionTag')" />
        </el-form-item>
        <el-form-item label="可执行">
          <el-switch v-model="elementBaseInfo.isExecutable" active-text="是" inactive-text="否" @change="updateBaseInfo('isExecutable')" />
        </el-form-item>
      </template>
      <el-form-item v-if="elementBaseInfo.$type === 'bpmn:SubProcess'" label="状态">
        <el-switch v-model="elementBaseInfo.isExpanded" active-text="展开" inactive-text="折叠" @change="updateBaseInfo('isExpanded')" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
  
import { commonParse } from '../parseElement'
  
export default {
  name: "ElementBaseInfo",
  props: {
    businessObject: Object,
    categorys: {
      type: Array,
      default: () => []
    },
    type: String,
    idEditDisabled: {
      type: Boolean,
      default: true
    },
    processCategory: {
      type: String,
    }
  },
  data() {
    return {
      elementBaseInfo: {},
    };
  },
  watch: {
    businessObject: {
      immediate: false,
      handler: function(val) {
        if (val) {
          this.$nextTick(() => this.resetBaseInfo());
        }
      }
    } 
  },
  methods: {
    resetBaseInfo() {
      this.bpmnElement = window?.bpmnInstances?.bpmnElement || {};
      const tempelement =commonParse(this.bpmnElement);//获取流程分类信息
      this.elementBaseInfo = JSON.parse(JSON.stringify(this.bpmnElement.businessObject));
      //this.elementBaseInfo.processCategory = tempelement.processCategory;//显示流程分类
      this.elementBaseInfo.processCategory = this.processCategory;
      if (this.elementBaseInfo && this.elementBaseInfo.$type === "bpmn:SubProcess") {
        this.$set(this.elementBaseInfo, "isExpanded", this.elementBaseInfo.di?.isExpanded);
      }
    },
    updateBaseInfo(key) {
      if (key === "id") {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          id: this.elementBaseInfo[key],
          di: { id: `${this.elementBaseInfo[key]}_di` }
        });
        return;
      }
      if (key === "isExpanded") {
        window?.bpmnInstances?.modeling.toggleCollapse(this.bpmnElement);
        return;
      }
      if (key === "processCategory") {//写入流程分类信息
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          'flowable:processCategory': this.elementBaseInfo[key] //兼容老系统
        });
        this.bpmnElement.processCategory = this.elementBaseInfo[key]
        return;
      }
      const attrObj = Object.create(null);
      attrObj[key] = this.elementBaseInfo[key];
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, attrObj);
    }
  },
  beforeDestroy() {
    this.bpmnElement = null;
  }
};
</script>
