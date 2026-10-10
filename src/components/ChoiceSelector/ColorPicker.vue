<template>
  <div id="colorPicker">
    <input type="color" v-model="ObjValue">
  </div>
</template>
<script>
export default {
  name: "ColorPicker",
  props: {
    value: {
      type: String,
      required: false,
    },
  },
  watch: {
    value: {
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        this.ObjValue=newValue;
      }
    },
    ObjValue:{
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        this.$emit('input',  newValue);
      }
    }
  },
  data() {
    return {
      ObjValue: ''
    };
  }
};
</script>
<style>
body {
  font-size: 14px;
  line-height: 1.5;
  color: #515a6e;
  background-color: #fff;
}
</style>