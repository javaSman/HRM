
<template>
  <div>

    <!-- 外层容器：替代 a-row，实现弹性布局 -->
    <div class="json-editor-wrapper">
      <!-- JSON 编辑器区域：自适应剩余宽度 -->
      <div class="json-editor-content">
        <json-formatter  v-model="ObjValue" @change="myChange"></json-formatter>
      </div>

      <!-- 按钮区域：固定宽度，不被挤压 -->
      <div class="json-editor-buttons">
        <a-button @click="show" size="small">编辑</a-button>
        <a-button @click="clean" size="small">清除</a-button>
      </div>
    </div>


    <a-modal
      :title="title"
      :visible="visible"
      @ok="handleOk"
      @cancel="handleCancel"
      :maskClosable="false"
      :closable="false"
      :width="width"
    >


      <json-param-edit ref="jsonParam" v-model="ObjValue"  :is-list="isList"></json-param-edit>
    </a-modal>
  </div>
</template>

<script>
import jsonParamEdit from '@comp/ChoiceSelector/JsonParamEdit'
import jsonFormatter from "@comp/common/showComponent/JsonFormatter";
export default {
  name: "JsonParamEditPopup",
  components: {
    jsonParamEdit,
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
      default:"json结构参数编辑器",
      required: false,
    },
    isList:{
      type:Boolean,
      default:false,
      required:false
    },
    width:{
      type:String,
      default:"60%",
      required:false
    }
  },
  watch: {
    value: {
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        this.ObjValue=newValue
      }
    }
  },
  created() {

  },
  data () {
    return {
      visible:false,
      ObjValue: "",
    }
  },
  methods: {
    handleOk(){
      // alert(1)
      this.$emit('input', this.ObjValue);
      this.visible=false;
    },
    myChange(){
      this.$emit('input', this.ObjValue);
    },

    handleCancel(){
      this.visible=false;
    },
    show(){
      this.visible=true;
    },
    clean(){
      this.ObjValue="";
      this.$refs.jsonParam.updateDatasource("");
      this.$emit('input', this.ObjValue);
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