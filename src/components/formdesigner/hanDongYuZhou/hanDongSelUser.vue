<template>
  <div>
    <a-input-search
      v-model="textVals"
      :placeholder="fcz.tableTypeDesc"
      clearable @change ="commonComponent"
      readOnly
      unselectable="on"
      @search="onSearchDepUser">
      <a-button slot="enterButton" :disabled="disabled">选择用户</a-button>
    </a-input-search>
    <j-select-user-by-dep-modal
      :zIndex="2100"
      ref="selectModal"
      :modal-width="modalWidth"
      :multi="multi"
      @ok="selectOK"
      :user-ids="value"
      :store="storeField"
      :text="textField"
      @initComp="initComp"/>
  </div>
</template>

<script>
import JSelectUserByDepModal from './hanDongSelectUserByDepModal'
import { underLinetoHump } from '@/components/_util/StringUtil'
export default {
  name: "hanDongSelUser",
  components: {JSelectUserByDepModal},
  props: {
    fcz:{},
    modalWidth: {
      type: Number,
      default: 1250,
      required: false
    },
    value: {
      type: String,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    multi: {
      type: Boolean,
      default: true,
      required: false
    },
    backUser: {
      type: Boolean,
      default: false,
      required: false
    },
    // 存储字段 [key field]
    store: {
      type: String,
      default: 'username',
      required: false
    },
    // 显示字段 [label field]
    text: {
      type: String,
      default: 'realname',
      required: false
    }
  },
  data() {
    return {
      storeVals: '', //[key values]
      textVals: '' //[label values]
    }
  },
  computed:{
    storeField(){
      let field = this.customReturnField
      if(!field){
        field = this.store;
      }
      return underLinetoHump(field)
    },
    textField(){
      return underLinetoHump(this.text)
    }
  },
  mounted() {
    console.log("hanDongSelUser this.storeVals=",this.storeVals)
    console.log("hanDongSelUser this.value=",this.value)
    this.storeVals = this.value
  },
  watch: {
    value(val) {
      console.log("hanDongSelUser value=",this.val)
      this.storeVals = val
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  methods: {
    initComp(textVals) {
      console.log("textVals=",textVals)
      this.textVals = textVals
    },
    commonComponent(fczInfo) {
      console.log("hanDongSelUser fczInfo=",fczInfo)
      this.fcz.commonDataInfo = fczInfo
      this.$emit('commonComponent', this.fcz)
    },
    //返回选中的用户信息
    backDeparInfo(){
      if(this.backUser===true){
        console.log("backDeparInfo this.storeVals"+this.storeVals)
        if(this.storeVals && this.storeVals.length>0){
          console.log("backDeparInfo this.textVals"+this.textVals)
          let arr1 = this.storeVals.split(',')
          let arr2 = this.textVals.split(',')
          let info = []
          for(let i=0;i<arr1.length;i++){
            info.push({
              value: arr1[i],
              text: arr2[i]
            })
          }
          console.log("backDeparInfo info=",info)
          this.$emit('back', info)
        }
      }
    },
    onSearchDepUser() {
      this.$refs.selectModal.showModal()
    },
    selectOK(rows) {
      console.log("当前选中用户", rows)
      if (!rows) {
        this.storeVals = ''
        this.textVals = ''
      } else {
        let temp1 = []
        let temp2 = []
        for (let item of rows) {
          temp1.push(item[this.storeField])
          temp2.push(item[this.textField])
        }
        this.storeVals = temp1.join(',')
        this.textVals = temp2.join(',')
      }
      console.log("this.storeVals=",this.storeVals)
      console.log("this.textVals=",this.textVals)
      this.$emit("change", this.storeVals)
      this.commonComponent(this.storeVals)
    }
  }
}
</script>

<style scoped>

</style>