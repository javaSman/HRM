<template>
    <div>
      <j-select-user-by-dep :value="value | hiddenId" @changes="handleUserChange"></j-select-user-by-dep>
    </div>
  </template>
  
  <script>
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import JSelectMultiUser from '@/components/jeecgbiz/JSelectMultiUser'
  import { underLinetoHump } from '@/components/_util/StringUtil'
  
  export default {
    mixins: [JEditableTableMixin],
    components: {JSelectMultiUser},
    filters: {
      hiddenId(val) {
        console.log("hiddenId",val);
        return val && val.indexOf('_*_') !== -1 ? val.split('_*_')[1] : val
      }
    },
    props: {
      modalWidth: {
        type: Number,
        default: 1250,
        required: false
      },
      value: {
        type: String,
        default: '',
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
        textVals: '', //[label values]
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
      this.storeVals = this.value
      console.log("mounted this.storeVals",this.storeVals)
      console.log("mounted this.value",this.value)
    },
    watch: {
      value(val) {
        this.storeVals = val
        console.log("watch this.storeVals",this.storeVals)
      }
    },
    model: {
      prop: 'value',
      event: 'change'
    },
    methods: {
      handleUserChange(users) {
      console.log("handleUserChange users=",users);
      const arr1 = users.map((item) => item.realname)
        const arr2 = users.map((item) => item.username)
        const obj = {
          names: arr1.length ? arr1.join(',') : '',
          ids: arr2.length ? arr2.join(',') : '',
        }
        console.log('obj:', obj)
        this.$emit(
          'input',
          obj.names && obj.ids ? `${obj.names}_*_${obj.ids}` : ''
        )
        this.users(obj.ids)
      },
      users(ids){
        console.log(ids);
        return ids
      },
      initComp(textVals) {
        this.textVals = textVals
      },
      //返回选中的用户信息
      backDeparInfo(){
        if(this.backUser===true){
          if(this.storeVals && this.storeVals.length>0){
            let arr1 = this.storeVals.split(',')
            let arr2 = this.textVals.split(',')
            let info = []
            for(let i=0;i<arr1.length;i++){
              info.push({
                value: arr1[i],
                text: arr2[i]
              })
            }
            this.$emit('back', info)
          }
        }
      },
      onSearchDepUser() {
        this.$refs.selectModal.showModal()
      },
      selectOK(rows) {
        console.log("userListArry selectOK 当前选中用户", rows)
        console.log("userListArry selectOK this.storeVals=",this.storeVals)
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
        this.$emit("change", this.storeVals)
        this.$emit("changes", rows)
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  </style>
  