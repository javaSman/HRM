
<!-- SysTreeTag 参数动态弹框组件  组件规则参数 :parameter="parameter"  v-model="value" -->
<template>
  <div>
    <!-- 外层容器：替代 a-row，实现弹性布局 -->
    <div class="json-editor-wrapper">
      <!-- JSON 编辑器区域：自适应剩余宽度 -->
      <div class="json-editor-content">
        <json-formatter  v-model="ObjValue" @change="changeValue"></json-formatter>
      </div>

      <!-- 按钮区域：固定宽度，不被挤压 -->
      <div class="json-editor-buttons">
        <a-button @click="show" size="small" type="primary" >编辑</a-button>
        <a-button @click="clean"  size="small" type="danger">清除</a-button>
      </div>
    </div>


    <a-modal
      :title="title"
      :visible="visible"
      @ok="handleOk"
      @cancel="handleCancel"
      :maskClosable="false"
      :closable="false"
      width="70%"
    >
      <!-- 1. 默认插槽：外部可直接插入内容，放在动态组件前/后都可，这里放在组件上方 -->
      <slot></slot>
      <component ref="com"  v-if="visible" :is="getComponent()" :parameter="parameterData"  v-model="ObjValue"/>
    </a-modal>
  </div>
</template>

<script>
import { isJSONToBoole } from '@/utils/util'

import { commePopupMappings} from '@/utils/sysTreeTagUtil';
import jsonFormatter from "@comp/common/showComponent/JsonFormatter";

export default {
  name: "commePopup",
  components: {
    jsonFormatter
  },
  props: {
    value: {
      type: String,
      required: false,
    },
    title: {
      // 模板id  （也就是项目id）
      type: String,
      default:"",
      required: false,
    },
    componentName: {
      // 组件名
      type: String,
      default:"",
      required: true,
    },
    parameter:{
      required: false,
    },
  },
  watch: {
    parameter: {
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        if (newValue){
          let value = null
          try {
            value=JSON.parse(newValue)
          }catch (e) {
            value = newValue;
          }
          this.parameterData=value;

        }
      }
    },
    value: {
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        if (newValue){
          this.ObjValue=JSON.parse(JSON.stringify(newValue));
        }
      }
    }
  },
  created() {

  },
  data () {
    return {
      visible:false,
      parameterData:{},
      ObjValue: "",
    }
  },
  methods: {
    handleOk(){

      if (this.$refs.com.handleSubmit){
        let data = this.$refs.com.handleSubmit();
        this.ObjValue = data;
      }

      // ?
      if (isJSONToBoole( this.ObjValue)){
        this.$emit('input',  this.ObjValue);
      }else {
        this.$emit('input',  this.ObjValue);
      }
      this.$emit('ok',  this.ObjValue);

      // console.log("-------",this.ObjValue)
      this.visible=false;
    },
    myChange(){
      if (this.$refs.com.handleSubmit){
        let data = this.$refs.com.handleSubmit();
        this.ObjValue = data;
      }
      if (isJSONToBoole( this.ObjValue)){
        this.$emit('change',  this.ObjValue);
      }else {
        this.$emit('change',  this.ObjValue);
      }
    },
    changeValue(){
      if (isJSONToBoole( this.ObjValue)){
        this.$emit('input',  this.ObjValue);
      }else {
        this.$emit('input',  this.ObjValue);
      }
    },


    handleCancel(){
      this.visible=false;
      this.$emit('close');
    },
    show(){
      this.visible=true;
    },
    clean(){
      this.ObjValue="";
      this.$emit('input', this.ObjValue);
    },
    getComponent() {

      let name = this.componentName;

      // console.log(commePopupMappings)
      return commePopupMappings[name];
    }
  }
}
</script>

<style scoped>
/* 外层容器：核心 flex 布局 */
.json-editor-wrapper {
  display: flex;
  align-items: flex-start; /* 顶部对齐，避免按钮居中 */
  width: 100%; /* 整体占满父容器宽度 */
  gap: 10px; /* 替代 margin-right，更优雅的间距 */
  box-sizing: border-box;
}

/* JSON 编辑器区域：自适应剩余宽度 + 溢出控制 */
.json-editor-content {
  flex: 1; /* 占满剩余所有宽度 */
  min-width: 0; /* 关键：解决 flex 子元素宽度溢出 */
  overflow: auto; /* 内容超长时显示滚动条 */
}

/* 按钮区域：固定宽度，不收缩 */
.json-editor-buttons {
  width: 50px;
}
</style>