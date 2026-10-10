<template>
<!--  <div>-->
<!--    <el-checkbox v-for="(itemCDC,cdc) in fcz.commonDictCodeCheckBox" :key="cdc" v-model="itemCDC.dataSelectEd" :label="itemCDC.id" @change ="commonComponent">{{itemCDC.name}}</el-checkbox>-->
<!--  </div>-->
<!--  <div>-->
<!--    <el-checkbox-group indeterminate="false" v-model="fcz.commonDataInfo" @change ="commonComponent">-->
<!--      <el-checkbox v-for="(itemCDC,cdc) in fcz.commonDictCode" :key="cdc" :label="itemCDC.id">{{ itemCDC.name }}</el-checkbox>-->
<!--    </el-checkbox-group>-->
<!--  </div>-->
  <div>
    <el-checkbox 
      v-for="(itemCDC,cdc) in fcz.commonDictCodeCheckBox"
      :label="itemCDC.id"
      :key="cdc" @change="val => handleCheckBox(val,itemCDC.id)">{{itemCDC.name}}</el-checkbox>
  </div>
</template>

<script>
export default {
  name: "hanDongCheckbox",
  data(){
    return {
      dataEnd :[],
    }
  },
  props: {
    fcz:{},
    value: {
      type: String,
      required: false
    },
  },
  watch: {
  },
  mounted() {
    console.log("hanDongCheckbox this.fcz=",this.fcz)
    this.fcz.commonDataInfo = this.value
    this.initCustomerPanel()
  },
  methods: {
    initCustomerPanel() {
      this.fcz.commonDictCodeCheckBox.forEach(e1 => {
        if( e1.id == this.value) {
          e1.dataSelectEd = true;
        }
        else {
          e1.dataSelectEd = false;
        } 
      });
    },
    handleCheckBox(valBoolean, item){
      console.log("handleCheckBox valBoolean,item",valBoolean,item)
      if(valBoolean){
          this.dataEnd.push(item)
      }else{
        var new_arr = []
        for (let i = 0, len = this.dataEnd.length; i < len; i++) {
          if (this.dataEnd[i] != item) {
            new_arr.push(arr[i])
            this.dataEnd =new_arr
          }
        }
      }
      //整理数据格式
      var fczEnd = this.dataEnd.toString()
      this.commonComponent(fczEnd);
    },
    commonComponent(fczInfo) {
      console.log(fczInfo)
      console.log(this.label)
      this.fcz.commonDataInfo = fczInfo
      this.$emit('commonComponent', this.fcz)
    },
  }
}
</script>

<style scoped>

</style>