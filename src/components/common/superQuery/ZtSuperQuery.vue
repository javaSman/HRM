<template>
  <div class="j-super-query-box">

    <slot name="button" :isActive="superQueryFlag" :isMobile="izMobile" :open="handleOpen" :reset="handleReset">
      <a-tooltip v-if="superQueryFlag" v-bind="tooltipProps" :mouseLeaveDelay="0.2">
        <!-- begin 不知道为什么不加上这段代码就无法生效 -->
        <span v-show="false">{{tooltipProps}}</span>
        <!-- end 不知道为什么不加上这段代码就无法生效 -->
        <template slot="title">
          <span>已有多条件查询条件生效</span>
          <a-divider type="vertical"/>
          <a @click="handleReset">清空</a>
        </template>
        <a-button-group>
          <a-button type="primary" @click="handleOpen">
            <a-icon type="appstore" theme="twoTone" spin/>
            <span>多条件查询</span>
          </a-button>
          <a-button v-if="izMobile" type="primary" icon="delete" @click="handleReset"/>
        </a-button-group>
      </a-tooltip>
      <a-button v-else type="primary" icon="filter" @click="handleOpen">多条件查询</a-button>
    </slot>

    <j-modal
      title="多条件查询构造器"
      :width="1000"
      :visible="visible"
      @cancel="handleCancel"
      :mask="false"
      :fullscreen="izMobile"
      draggable
      class="j-super-query-modal"
      style="top:5%;max-height: 95%;"
    >

      <template slot="footer">
        <div style="float: left">
          <a-button :loading="loading" @click="handleReset">重置</a-button>
          <a-button v-if="operate==='Query'" :loading="loading" @click="handleSave">保存查询条件</a-button>
        </div>
        <a-button v-if="operate==='Query'" :loading="loading" @click="handleCancel">关闭</a-button>
        <a-button v-if="operate==='Query'" :loading="loading" type="primary" @click="handleOk">查询</a-button>
        <!-- 插槽内容 -->
        <slot></slot>
        <a-button v-if="operate==='write'" :loading="loading" type="primary" @click="handleSure">确定</a-button>

      </template>

      <a-spin :spinning="loading">
        <a-row>
          <a-col :span="24">
            <a-select v-model="QueryMode" style="width: 120px" @change="onQueryMode">
              <a-select-option :value="1">
                简化查询
              </a-select-option>
              <a-select-option :value="2">
                多样查询
              </a-select-option>
            </a-select>
          </a-col>
        </a-row>
        <a-row v-show="QueryMode==1">
          <simplify ref="JSuperQuery1" :fieldTreeData="fieldTreeData" />
        </a-row>
        <a-row v-show="QueryMode==2">
          <various ref="JSuperQuery2" :fieldTreeData="fieldTreeData" />
        </a-row>

      </a-spin>

      <a-modal title="请输入保存的名称" :visible="prompt.visible" @cancel="prompt.visible=false" @ok="handlePromptOk" v-if="operate==='Query'">
        <a-input v-model="prompt.value"  allowClear></a-input>
      </a-modal>

    </j-modal>
  </div>
</template>

<script>
import moment from 'moment'
import * as utils from '@/utils/util'
import { mixinDevice } from '@/utils/mixin'
import JDate from '@/components/jeecg/JDate.vue'
import JSelectDepart from '@/components/jeecgbiz/JSelectDepart'
import JSelectMultiUser from '@/components/jeecgbiz/JSelectMultiUser'
import JMultiSelectTag from '@/components/dict/JMultiSelectTag'
import JAreaLinkage from '@comp/jeecg/JAreaLinkage'

import simplify from './JSuperQueryList/simplify'
import various from './JSuperQueryList/various'
import { SuperQuery } from '@/utils/superQueryUtil'

export default {
  name: 'ZtSuperQuery',
  mixins: [mixinDevice],
  components: { JAreaLinkage, JMultiSelectTag, JDate, JSelectDepart, JSelectMultiUser,
    simplify,
    various
  },

  props: {
    queryParamsModels: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * default: 'write',
     */
    operate: {
      type: String,
      required: false,
      default: 'Query',
    },
    /*
     fieldList: [{
        value:'',
        text:'',
        type:'',
        dictCode:'' // 只要 dictCode 有值，无论 type 是什么，都显示为字典下拉框
     }]
     type:date datetime int number string
    * */
    fieldList: {
      type: Array,
      required: true
    },
    /*
    * 这个回调函数接收一个数组参数 即查询条件
    * */
    callback: {
      type: String,
      required: false,
      default: 'handleSuperQuery'
    },


    // 当前是否在加载中
    loading: {
      type: Boolean,
      default: false
    },

    // 保存查询条件的唯一 code，通过该 code 区分
    // 默认为 null，代表以当前路由全路径为区分Code
    saveCode: {
      type: String,
      default: null
    }

  },
  data() {
    return {
      moment,
      fieldTreeData: [],

      prompt: {
        visible: false,
        value: ''
      },

      visible: false,
      queryParamsModel: [],
      queryParamsBackups: [],
      treeIcon: <a-icon type="file-text"/>,
      // 保存查询条件的treeData
      saveTreeData: [],
      // 保存查询条件的前缀名
      saveCodeBefore: 'JSuperQuerySaved_',
      // 查询类型，过滤条件匹配（and、or）
      matchType: 'and',
      superQueryFlag: false,
      // 查询模式化
      QueryMode:1,
    }
  },
  computed: {
    izMobile() {
      return this.device === 'mobile'
    },
    tooltipProps() {
      return this.izMobile ? { visible: false } : {}
    },
    fullSaveCode() {
      let saveCode = this.saveCode
      if (saveCode == null || saveCode === '') {
        saveCode = this.$route.fullPath
      }
      return this.saveCodeBefore + saveCode
    },
  },
  watch: {
    queryParamsModels: {
      immediate: true,
      handler(val) {
        console.log('双向绑定2')
        console.log(val)
      }
    },
    queryParamsModel: {
      immediate: true,
      handler(val) {
        // 留个底 为了处理queryParamsModels不是算下绑定的时候 也能正常使用留底
        this.queryParamsBackups=val
      }
    },


    // 当 saveCode 变化时，重新查询已保存的条件
    fullSaveCode: {
      immediate: true,
      handler() {
        let list = this.$ls.get(this.fullSaveCode)
        if (list instanceof Array) {
          this.saveTreeData = list.map(i => this.renderSaveTreeData(i))
        }
      }
    },
    fieldList: {
      deep: true,
      immediate: true,
      handler(val) {
        let mainData = [], subData = []
        val.forEach(item => {
          let data = { ...item }
          data.label = data.label || data.text
          let hasChildren = (data.children instanceof Array)
          data.disabled = hasChildren
          data.selectable = !hasChildren
          if (hasChildren) {
            data.children = data.children.map(item2 => {
              let child = { ...item2 }
              child.label = child.label || child.text
              child.label = data.label + '-' + child.label
              // update--begin--author:sunjianlei-----date:20220121------for：【JTC-1167】【表单设计器】多条件查询，一对一字段查询不好使
              // 是否仅包含字段名，不需要拼接子表表名
              if (!data.onlyFieldName) {
                child.value = data.value + ',' + child.value
              }
              // update--end--author:sunjianlei-----date:20220121------for：【JTC-1167】【表单设计器】多条件查询，一对一字段查询不好使
              child.val = ''
              return child
            })
            data.val = ''
            subData.push(data)
          } else {
            mainData.push(data)
          }
        })
        this.fieldTreeData = mainData.concat(subData)
      }
    }
  },

  methods: {
    onQueryMode(){
      this.handleReset()
    },
    show() {
      this.visible = true
      this.$nextTick(()=>{
        // 双向绑定值
        this.QueryMode=1
        if(this.queryParamsModels){
          let json=decodeURI(this.queryParamsModels)
          let urlParams = new URLSearchParams(json);
          if(this.queryParamsModels.indexOf('superQueryList')!=-1){
            //多样查询
            let superQueryListStr = urlParams.get('superQueryList');
            let superQueryList = JSON.parse(superQueryListStr);
            let superQueryListType = urlParams.get('superQueryListType');
            superQueryList.forEach(i=>{
              i.superQueryParams=JSON.parse(i.superQueryParams)
            })
            let arr=superQueryList.map(i=>{
              let obj={
                QueryType:i.superQueryMatchType,
                queryItem:[...i.superQueryParams]
              }
              return obj
            })
            let newQuery={
              matchType:superQueryListType,
              params:arr
            }
            this.QueryMode=2
            this.matchType=newQuery.matchType
            this.queryParamsBackups=newQuery
          }else{
            let superQueryParamsStr = urlParams.get('superQueryParams');
            let superQueryParams = JSON.parse(superQueryParamsStr);
            let superQueryListType = urlParams.get('superQueryMatchType');
            let newQuery={
              matchType:superQueryListType,
              params:superQueryParams
            }
            this.matchType=newQuery.matchType
            this.queryParamsBackups=newQuery
          }
          console.log(this.queryParamsBackups)
        }

        // 留底 有双向绑定 已双向绑定为主
        if (!this.queryParamsBackups || this.queryParamsBackups.length === 0) {
          this.resetLine()
        }else{
          if(this.queryParamsBackups.matchType){
            this.$refs[`JSuperQuery${this.QueryMode}`].matchType=this.queryParamsBackups.matchType
            this.$refs[`JSuperQuery${this.QueryMode}`].queryParamsModel=this.queryParamsBackups.params
          }else{
            this.$refs[`JSuperQuery${this.QueryMode}`].queryParamsModel=this.queryParamsBackups
            this.$refs[`JSuperQuery${this.QueryMode}`].matchType=this.matchType
          }
        }
      })

    },

    getDictInfo(item) {
      let str = ''
      if(!item.dictTable){
        str = item.dictCode
      }else{
        str = item.dictTable+','+item.dictText+','+item.dictCode
      }
      console.log('多条件查询字典信息',str)
      return str
    },
    handleOk() {
      this.queryParamsModel=this.$refs[`JSuperQuery${this.QueryMode}`].queryParamsModelAll
      this.matchType=this.$refs[`JSuperQuery${this.QueryMode}`].matchType
      if(this.QueryMode==1){

        if (!this.isNullArray(this.queryParamsModel)) {
          let event = {
            matchType: this.matchType,
            params: this.removeEmptyObject(this.queryParamsModel)
          }
          // 移动端模式下关闭弹窗
          if (this.izMobile) {
            this.visible = false
          }
          this.emitCallback(event)



          let str=`superQueryParams=${JSON.stringify(event.params)}&superQueryMatchType=${this.matchType}`
          this.$emit('Highchange',encodeURI(str))
        } else {
          this.$message.warn("不能查询空条件")
        }

      }else if(this.QueryMode==2){
        let queryParamsModel=this.queryParamsModel.params

        if (!this.isNullArrays(queryParamsModel)) {
          let queryParams = this.removeEmptyObject(queryParamsModel)
          let event = {
            matchType: this.matchType,
            params: this.getSuperQueryList(queryParams)
          }
          // 移动端模式下关闭弹窗
          if (this.izMobile) {
            this.visible = false
          }
          this.superQueryFlag = (event.params && event.params.length > 0)
          // this.emitCallback(event)
          // let sqp = encodeURI(JSON.stringify(event.params))
          this.$emit('Highchange',event.params)
          this.$emit(this.callback, event, event.matchType,2)
        } else {
          this.$message.warn('不能查询空条件')
        }

      }
    },
    handleSure(){
      this.queryParamsModel=this.$refs[`JSuperQuery${this.QueryMode}`].queryParamsModelAll
      this.matchType=this.$refs[`JSuperQuery${this.QueryMode}`].matchType
      if(this.QueryMode==1){

        if (!this.isNullArray(this.queryParamsModel)) {
          let event = {
            matchType: this.matchType,
            params: this.removeEmptyObject(this.queryParamsModel)
          }
          // 移动端模式下关闭弹窗
          if (this.izMobile) {
            this.visible = false
          }
          this.emitCallback(event)



          let str=`superQueryParams=${JSON.stringify(event.params)}&superQueryMatchType=${this.matchType}`
          this.$emit('Highchange',encodeURI(str))
        } else {
          this.$emit('Highchange',null)
        }

      }else if(this.QueryMode==2){
        let queryParamsModel=this.queryParamsModel.params

        if (!this.isNullArrays(queryParamsModel)) {
          let queryParams = this.removeEmptyObject(queryParamsModel)
          let event = {
            matchType: this.matchType,
            params: this.getSuperQueryList(queryParams)
          }
          // 移动端模式下关闭弹窗
          if (this.izMobile) {
            this.visible = false
          }
          this.superQueryFlag = (event.params && event.params.length > 0)
          // this.emitCallback(event)
          // let sqp = encodeURI(JSON.stringify(event.params))
          this.$emit('Highchange',event.params)
          this.$emit(this.callback, event, event.matchType,2)
        } else {
          this.$emit('Highchange',null)
        }

      }
    },

    getSuperQueryList(queryParams){
      let arr=queryParams.map(i=>{
        let objArr=i.queryItem.map(j=>{
          return SuperQuery.queryItem(j.field,j.val,j.type,j.rule)
        })
        return SuperQuery.getSuperQueryObj(
          i.QueryType,   //  查询类型 下发所有都满足and  下发任何一条满足 OR
          ...objArr
        )
      })
      const obj = SuperQuery.getSuperQueryList(
        this.matchType,
        ...arr
      )

      return obj
    },

    emitCallback(event = {}, loadStatus = true) {
      let { params = [], matchType = this.matchType } = event
      this.superQueryFlag = (params && params.length > 0)
      for (let param of params) {
        if (Array.isArray(param.val)) {
          param.val = param.val.join(',')
        }
      }
      console.log('---多条件查询参数--->', { params, matchType })
      this.$emit(this.callback, params, matchType,1,loadStatus)
    },
    handleCancel() {
      this.close()
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
    handleAdd() {
      this.addNewLine()
    },
    addNewLine() {
      // this.queryParamsModel.push({ rule: 'like' })
      if(this.QueryMode==1){
        this.$refs[`JSuperQuery${this.QueryMode}`].queryParamsModel.push({ rule: 'like' })
      }else{
        this.$refs[`JSuperQuery${this.QueryMode}`].queryParamsModel.push({
          QueryType:'and',
          queryItem: [{}],
        })
      }
    },
    resetLine() {
      this.superQueryFlag = false
      this.queryParamsModel = []
      if(this.$refs[`JSuperQuery${this.QueryMode}`]){
        this.$refs[`JSuperQuery${this.QueryMode}`].queryParamsModel = []
        this.addNewLine()
      }
    },
    handleDel(index) {
      this.queryParamsModel.splice(index, 1)
    },
    handleSelected(node, item) {
      let { type, dbType, options, dictCode, dictTable, dictText, customReturnField, popup } = node.dataRef
      item['type'] = type
      item['dbType'] = dbType
      item['options'] = options
      item['dictCode'] = dictCode
      item['dictTable'] = dictTable
      item['dictText'] = dictText
      //update-begin-author:taoyan for: VUEN-242【online表单 多条件查询】开关组件设置扩展参数为[0,1] 时，多条件查询选择后查询仍然是Y/N
      item['extendOption'] = node.dataRef.extendOption || ['Y', 'N']
      //update-begin-author:taoyan for: VUEN-242【online表单 多条件查询】开关组件设置扩展参数为[0,1] 时，多条件查询选择后查询仍然是Y/N
      item['customReturnField'] = customReturnField
      if (popup) {
        item['popup'] = popup
      }
      // 格式化字符串，一般用于多条件查询的日期格式处理
      if (node.dataRef.formatStr) {
        item['formatStr'] = node.dataRef.formatStr
      }
      this.$set(item, 'val', undefined)
    },
    handleOpen() {
      this.show()
    },
    handleOutReset(loadStaus=true) {
      this.resetLine()
      this.emitCallback({}, loadStaus)
    },
    handleReset() {
      this.resetLine()
      setTimeout(()=>{
        this.emitCallback({}, true)
      },200)
    },
    handleSave() {
      let queryParamsModel=this.$refs[`JSuperQuery${this.QueryMode}`].queryParamsModel
      let prompt=this.$refs[`JSuperQuery${this.QueryMode}`].prompt
      let queryParams = this.removeEmptyObject(queryParamsModel)
      if(this.QueryMode==1){
        if (this.isNullArray(queryParams)) {
          this.$message.warning('空条件不能保存')
        } else {
          prompt.value = ''
          prompt.visible = true
        }
      }else if(this.QueryMode==2){
        if (this.isNullArrays(queryParams)) {
          this.$message.warning('空条件不能保存')
        } else {
          prompt.value = ''
          prompt.visible = true
        }
      }

    },
    handlePromptOk() {
      let { value } = this.prompt
      if(!value){
        this.$message.warning('保存名称不能为空')
        return
      }
      // 取出查询条件
      let queryParamsModel=this.$refs[`JSuperQuery${this.QueryMode}`].queryParamsModel
      let records = this.removeEmptyObject(queryParamsModel)
      // 判断有没有重名的
      let filterList = this.saveTreeData.filter(i => i.originTitle === value)
      if (filterList.length > 0) {
        this.$confirm({
          content: `${value} 已存在，是否覆盖？`,
          onOk: () => {
            this.prompt.visible = false
            filterList[0].records = records
            this.saveToLocalStore()
            this.$message.success('保存成功')
          }
        })
      } else {
        // 没有重名的，直接添加
        this.prompt.visible = false
        // 添加到树列表中
        this.saveTreeData.push(this.renderSaveTreeData({
          title: value,
          matchType: this.matchType,
          records: records
        }))
        // 保存到 LocalStore
        this.saveToLocalStore()
        this.$message.success('保存成功')
      }
    },
    handleTreeSelect(idx, event) {
      if (event.selectedNodes[0]) {
        let { matchType, records } = event.selectedNodes[0].data.props
        // 将保存的matchType取出，兼容旧数据，如果没有保存就还是使用原来的
        this.matchType = matchType || this.matchType
        // this.queryParamsModel = utils.cloneObject(records)
        this.$refs[`JSuperQuery${this.QueryMode}`].queryParamsModel= utils.cloneObject(records)
      }
    },
    handleRemoveSaveTreeItem(event, vNode) {
      // 阻止事件冒泡
      event.stopPropagation()

      this.$confirm({
        content: '是否删除当前查询？',
        onOk: () => {
          let { eventKey } = vNode
          this.saveTreeData.splice(Number.parseInt(eventKey.substring(2)), 1)
          this.saveToLocalStore()
        },
      })
    },

    // 将查询保存到 LocalStore 里
    saveToLocalStore() {
      let saveValue = this.saveTreeData.map(({ originTitle, matchType, records }) => ({ title: originTitle, matchType, records }))
      this.$ls.set(this.fullSaveCode, saveValue)
    },
    isNullArrays(array) {
      //判断是不是空数组对象
      if (!array || array.length === 0) {
        return true
      }
      let show=true
      array.forEach(i=>{
        if(i.queryItem.length>0){
          let obj = i.queryItem[0]
          if (obj.field || (obj.val != null || obj.val === '') || obj.rule) {
            show=false
          }
        }
      })
      return show
    },
    isNullArray(array) {
      //判断是不是空数组对象
      if (!array || array.length === 0) {
        return true
      }
      if (array.length === 1) {
        let obj = array[0]
        if (!obj.field || (obj.val == null || obj.val === '') || !obj.rule) {
          return true
        }
      }
      return false
    },
    // 去掉数组中的空对象
    removeEmptyObject(arr) {
      let array = utils.cloneObject(arr)
      for (let i = 0; i < array.length; i++) {
        let item = array[i]
        if (item == null || Object.keys(item).length <= 0) {
          array.splice(i--, 1)
        } else {
          if (Array.isArray(item.options)) {
            // 如果有字典属性，就不需要保存 options 了
            //update-begin-author:taoyan date:20200819 for:【开源问题】 多条件查询 下拉框作为并且选项很多多多 LOWCOD-779
            delete item.options
            //update-end-author:taoyan date:20200819 for:【开源问题】 多条件查询 下拉框作为并且选项很多多多 LOWCOD-779
          }
        }
      }
      return array
    },

    /** 渲染保存查询条件的 title（加个删除按钮） */
    renderSaveTreeData(item) {
      item.icon = this.treeIcon
      item.originTitle = item['title']
      item.title = (arg1, arg2) => {
        let vNode
        // 兼容旧版的Antdv
        if (arg1.dataRef) {
          vNode = arg1
        } else if (arg2.dataRef) {
          vNode = arg2
        } else {
          return <span style="color:red;">Antdv版本不支持</span>
        }
        let {originTitle} = vNode.dataRef
        return (
          <div class="j-history-tree-title">
            <span>{originTitle}</span>

            <div class="j-history-tree-title-closer" onClick={e => this.handleRemoveSaveTreeItem(e, vNode)}>
              <a-icon type="close-circle"/>
            </div>
          </div>
        )
      }
      return item
    },

    /** 判断是否允许多选 */
    allowMultiple(item) {
      return item.rule === 'in'
    },

    handleRuleChange(item, newValue) {
      let oldValue = item.rule
      this.$set(item, 'rule', newValue)
      // 上一个规则是否是 in，且type是字典或下拉
      if (oldValue === 'in') {
        if (item.dictCode || item.options instanceof Array) {
          let value = item.val
          if (typeof item.val === 'string') {
            value = item.val.split(',')[0]
          } else if (Array.isArray(item.val)) {
            value = item.val[0]
          }
          this.$set(item, 'val', value)
        }
      }
    },

    handleChangeJPopup(item, e, values) {
      item.val = values[item.popup['destFields']]
    },

  }
}
</script>

<style lang="less" scoped>

.j-super-query-box {
  display: inline-block;
}

.j-super-query-modal {

  .j-super-query-history-card {
    /deep/ .ant-card-body,
    /deep/ .ant-card-head-title {
      padding: 0;
    }

    /deep/ .ant-card-head {
      padding: 4px 8px;
      min-height: initial;
    }
  }

  .j-super-query-history-empty {
    /deep/ .ant-empty-image {
      height: 80px;
      line-height: 80px;
      margin-bottom: 0;
    }

    /deep/ img {
      width: 80px;
      height: 65px;
    }

    /deep/ .ant-empty-description {
      color: #afafaf;
      margin: 8px 0;
    }
  }

  .j-super-query-history-tree {

    .j-history-tree-title {
      width: calc(100% - 24px);
      position: relative;
      display: inline-block;

      &-closer {
        color: #999999;
        position: absolute;
        top: 0;
        right: 0;
        width: 24px;
        height: 24px;
        text-align: center;
        opacity: 0;
        transition: opacity 0.3s, color 0.3s;

        &:hover {
          color: #666666;
        }

        &:active {
          color: #333333;
        }
      }

      &:hover {
        .j-history-tree-title-closer {
          opacity: 1;
        }
      }

    }

    /deep/ .ant-tree-switcher {
      display: none;
    }

    /deep/ .ant-tree-node-content-wrapper {
      width: 100%;
    }
  }

}

</style>