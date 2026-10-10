<template>
  <div class="components-input-demo-presuffix" v-if="avalid">
    <!---->
    <a-input @click="openModal" :placeholder="fcz.tableTypeDesc" 
             v-model="showText" readOnly :disabled="disabled"
             clearable @change ="commonComponent">
      <a-icon slot="prefix" type="cluster" :title="title"/>
      <a-icon v-if="showText" slot="suffix" type="close-circle" @click="handleEmpty" title="清空"/>
    </a-input>

    <j-popup-onl-report
      :zIndex="2100"
      ref="jPopupOnlReport"
      :code="fcz.dictTable"
      :multi="multi"
      :sorter="sorter"
      :groupId="uniqGroupId"
      :param="param"
      @ok="callBack"
    />

  </div>
</template>

<script>

import JPopupOnlReport from './hanDongPrpuoOnlReport'
export default {
  name: "hanDongPopup",
  components: {
    JPopupOnlReport
  },
  props: {
    fcz:{},
    code: {
      type: String,
      default: '',
      required: false
    },
    field: {
      type: String,
      default: '',
      required: false
    },
    orgFields: {
      type: String,
      default: '',
      required: false
    },
    destFields: {
      type: String,
      default: '',
      required: false
    },
    /** 排序列，指定要排序的列，使用方式：列名=desc|asc */
    sorter: {
      type: String,
      default: ''
    },
    width: {
      type: Number,
      default: 1200,
      required: false
    },
    placeholder: {
      type: String,
      default: '请选择',
      required: false
    },
    value: {
      type: String,
      required: false
    },
    triggerChange: {
      type: Boolean,
      required: false,
      default: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    multi: {
      type: Boolean,
      required: false,
      default: false
    },
    //popup动态参数 支持系统变量语法
    param:{
      type: Object,
      required: false,
      default: ()=>{}
    },
    spliter:{
      type: String,
      required: false,
      default: ','
    },
    /** 分组ID，用于将多个popup的请求合并到一起，不传不分组 */
    groupId: String

  },
  data() {
    return {
      showText: '',
      title: '',
      avalid: true
    }
  },
  computed: {
    uniqGroupId() {
      if (this.groupId) {
        let { groupId, code, field, orgFields, destFields } = this
        return `${groupId}_${code}_${field}_${orgFields}_${destFields}`
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      handler: function(val) {
        if (!val) {
          this.showText = ''
        } else {
          this.showText = val.split(this.spliter).join(',')
        }
      }
    }
  },
  created() {
    console.log("hanDongPopup this.fcz=",this.fcz)
  },
  mounted() {

    if (!this.fcz.dictField || !this.fcz.dictText || !this.fcz.dictTable) {
      this.$message.error('popup参数未正确配置!')
      this.avalid = false
    }
    if (this.fcz.dictText.split(',').length != this.fcz.dictField.split(',').length) {
      this.$message.error('popup参数未正确配置,原始值和目标值数量不一致!')
      this.avalid = false
    }
  },
  methods: {
    openModal() {
      if (this.disabled === false) {
        this.$refs.jPopupOnlReport.show()
      }
    },
    handleEmpty() {
      this.showText = ''
      let destFieldsArr = this.fcz.dictText.split(',')
      if (destFieldsArr.length === 0) {
        return
      }
      let res = {}
      for (let i = 0; i < destFieldsArr.length; i++) {
        res[destFieldsArr[i]] = ''
      }
      if (this.triggerChange) {
        this.$emit('callback', res)
      } else {
        this.$emit('input', '', res)
      }
    },
    commonComponent(fczInfo) {
      console.log("hanDongPopup fczInfo=",fczInfo)
      this.fcz.commonDataInfo = fczInfo
      this.$emit('commonComponent', this.fcz)
    },
    callBack(rows) {
      // update--begin--autor:lvdandan-----date:20200630------for：多选时未带回多个值------
      let orgFieldsArr = this.fcz.dictField.split(',')
      let destFieldsArr = this.fcz.dictText.split(',')
      let resetText = false
      if (this.field && this.field.length > 0) {
        this.showText = ''
        resetText = true
      }
      let res = {}
      if (orgFieldsArr.length > 0) {
        for (let i = 0; i < orgFieldsArr.length; i++) {
          let tempDestArr = []
          for(let rw of rows){
            let val = rw[orgFieldsArr[i]]
            // update--begin--autor:liusq-----date:20210713------for：处理val等于0的情况issues/I3ZL4T------
            if(typeof val=='undefined'|| val==null || val.toString()==""){
              val = ""
            }
            // update--end--autor:liusq-----date:20210713------for：处理val等于0的情况issues/I3ZL4T------
            tempDestArr.push(val)
          }
          res[destFieldsArr[i]] = tempDestArr.join(",")
        }
        if (resetText === true) {
          let tempText = []
          for(let rw of rows){
            let val = rw[orgFieldsArr[destFieldsArr.indexOf(this.field)]]
            if(!val){
              val = ""
            }
            tempText.push(val)
          }
          this.showText = tempText.join(",")
        }
        // update--end--autor:lvdandan-----date:20200630------for：多选时未带回多个值------
      }
      if (this.triggerChange) {
        //v-dec时即triggerChange为true时 将整个对象给form页面 让他自己setFieldsValue
        this.$emit('callback', res)
        console.log("triggerChange res=",res)
        this.commonComponent(res[this.fcz.dbFieldName])
      } else {
        //v-model时 需要传一个参数field 表示当前这个字段 从而根据这个字段的顺序找到原始值
        // this.$emit("input",row[orgFieldsArr[destFieldsArr.indexOf(this.field)]])
        let str = ''
        if(this.showText){
          str = this.showText.split(',').join(this.spliter)
        }
        this.$emit('input', str, res)
        console.log("str=",str)
        console.log("res=",res)
        console.log("this.showText=",this.showText)
        this.showText = res[this.fcz.dbFieldName]
        this.commonComponent(res[this.fcz.dbFieldName])
      }
    }
  }
}
</script>
<style scoped>
.components-input-demo-presuffix .anticon-close-circle {
  cursor: pointer;
  color: #ccc;
  transition: color 0.3s;
  font-size: 12px;
}

.components-input-demo-presuffix .anticon-close-circle:hover {
  color: #f5222d;
}

.components-input-demo-presuffix .anticon-close-circle:active {
  color: #666;
}
</style>