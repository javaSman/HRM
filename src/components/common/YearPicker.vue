<template>
  <div>
    <a-date-picker
      format="YYYY"
      mode="year"
      :value="year"
      :open="open"
      @openChange="openChange"
      @panelChange="panelChange"
    />
  </div>
</template>

<script>
import moment from "moment"
export default {
  name: 'YearPicker',
  components: { moment },
  props:{
    value: {
      // 自定义验证逻辑（此处不限制类型）
      validator: function(value) {
        // 后面可以追加
        return true;
      }
    }
  },
  watch:{
    value: {
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        if (newValue){
          this.year = moment(newValue).format("YYYY");
        }
      }
    },

  },

  data() {
    return {
      open: false,
      year: "",
    };
  },
  methods: {
    moment,
    //Ant Design封装年份选择组件
    openChange(status) {
      if (status) {
        this.open = true;
      } else {
        this.open = false;
      }
    },
    panelChange(value){
      this.year = value.format("YYYY");
      this.open = false;
      this.$emit("input",this.year);
    },
  },

}

</script>

<style scoped>

</style>