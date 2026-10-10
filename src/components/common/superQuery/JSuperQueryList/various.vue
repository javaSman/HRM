<template>
  <a-row >
    <a-col style="padding: 5px;" :sm='24' :md="24-5">
      <a-empty v-if='queryParamsModel.length === 0' >
        <div slot='description'>
          <span>没有任何查询条件</span>
          <a-divider type='vertical' />
          <a @click='handleAdd'>点击新增</a>
        </div>
      </a-empty>
      <a-form v-else layout='inline'>
        <a-row :gutter='16' type='flex' align="middle" style='margin-bottom: 10px'>
          <a-col :md='16' :xs='18' >
            <a-form-item label='过滤条件匹配' :labelCol='{md:5,xs:24}' :wrapperCol='{md: 19,xs:24}' style='width: 100%;'>
              <a-select v-model='matchType' :getPopupContainer='node=>node.parentNode' style='width: 100%;'>
                <a-select-option value='and'>AND（所有条件都要求匹配）</a-select-option>
                <a-select-option value='or'>OR（条件中的任意一个匹配）</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md='8' :xs='6'>
              <a-button @click='handleAdd' type="primary" icon="plus"  style='margin-right: 10px;' />
              <a-button @click='handleDel' icon='minus'></a-button>
              直接输入：<a-switch  v-model="inputShow" style="margin-bottom:5px" />
          </a-col>
        </a-row>

        <a-row >
          <a-col v-for='(items, indexs) in queryParamsModel' :md='24' :xs='24' style='margin-bottom: 10px'>
            <div class="ConditionAll">
              <div class="ConditionT">
                <a-form-item label='条件匹配' :labelCol='{md:5,xs:24}' :wrapperCol='{md: 15,xs:24}' style='width: 100%;'>
                  <a-select v-model='items.QueryType' :getPopupContainer='node=>node.parentNode' style='width: 100%;'>
                    <a-select-option value='and'>AND（所有条件都要求匹配）</a-select-option>
                    <a-select-option value='or'>OR（条件中的任意一个匹配）</a-select-option>
                  </a-select>
                </a-form-item>
              </div>
              <div class="ConditionB">

                <a-row type='flex' :gutter='16' v-for='(item, index) in items.queryItem'
                       :key='index'>

                  <a-col :md='8' :xs='24' style='margin-bottom: 12px;'>
                    <a-tree-select
                      showSearch
                      v-model='item.field'
                      :treeData='fieldTreeData'
                      :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }"
                      placeholder='选择查询字段'
                      allowClear
                      treeDefaultExpandAll
                      :getPopupContainer='node=>node.parentNode'
                      style='width: 100%'
                      @select='(val,option)=>handleSelected(option,item)'
                    >
                    </a-tree-select>
                  </a-col>

                  <a-col :md='6' :xs='24' style='margin-bottom: 12px;'>
                    <a-select placeholder='匹配规则' :value='item.rule' :getPopupContainer='node=>node.parentNode'
                              @change='handleRuleChange(item,$event)'>
                      <a-select-option value='eq'>等于</a-select-option>
                      <a-select-option value='like'>包含</a-select-option>
                      <a-select-option value='right_like'>以..开始</a-select-option>
                      <a-select-option value='left_like'>以..结尾</a-select-option>
                      <a-select-option value='in'>在...中</a-select-option>
                      <a-select-option value='ne'>不等于</a-select-option>
                      <a-select-option value='gt'>大于</a-select-option>
                      <a-select-option value='ge'>大于等于</a-select-option>
                      <a-select-option value='lt'>小于</a-select-option>
                      <a-select-option value='le'>小于等于</a-select-option>
                    </a-select>
                  </a-col>

                  <a-col :md='6' :xs='24' style='margin-bottom: 12px;'>
                    <!-- 下拉搜索 -->
                    <j-search-select-tag v-if="item.type==='sel_search'" v-model='item.val' :dict='getDictInfo(item)'
                                         placeholder='请选择' />
                    <!-- 下拉框 -->
                    <j-search-select-tag v-else-if="item.type==='list' && item.dictTable" v-model='item.val'
                                         :dict='getDictInfo(item)' placeholder='请选择' />
                    <!-- 下拉多选 -->
                    <template v-else-if="item.type==='list_multi'">
                      <j-multi-select-tag v-if='item.options' v-model='item.val' :options='item.options' placeholder='请选择' />
                      <j-multi-select-tag v-else v-model='item.val' :dictCode='getDictInfo(item)' placeholder='请选择' />
                    </template>

                    <template v-else-if='item.dictCode'>
                      <template v-if="item.type === 'table-dict'">
                        <j-popup
                          v-model='item.val'
                          :code='item.dictTable'
                          :field='item.dictCode'
                          :orgFields='item.dictCode'
                          :destFields='item.dictCode'
                          :multi='true'
                        ></j-popup>
                      </template>
                      <template v-else>
                        <j-multi-select-tag v-show='allowMultiple(item)' v-model='item.val' :dictCode='item.dictCode'
                                            placeholder='请选择' />
                        <j-dict-select-tag v-show='!allowMultiple(item)' v-model='item.val' :dictCode='item.dictCode'
                                           placeholder='请选择' />
                      </template>
                    </template>
                    <j-popup
                      v-else-if="item.type === 'popup'"
                      :value='item.val'
                      v-bind='item.popup'
                      group-id='superQuery'
                      @input='(e,v)=>handleChangeJPopup(item,e,v)'
                      :multi='true' />
                    <j-select-multi-user
                      v-else-if="item.type === 'select-user' || item.type === 'sel_user'"
                      v-model='item.val'
                      :buttons='false'
                      :multiple='allowMultiple(item)'
                      placeholder='请选择用户'
                      :returnKeys="['id', item.customReturnField || 'username']"
                    />
                    <j-select-depart
                      v-else-if="item.type === 'select-depart' || item.type === 'sel_depart'"
                      v-model='item.val'
                      :multi='allowMultiple(item)'
                      placeholder='请选择部门'
                      :customReturnField="item.customReturnField || 'id'"
                    />
                    <a-select
                      v-else-if='(item.options instanceof Array)'
                      v-model='item.val'
                      :options='item.options'
                      allowClear
                      placeholder='请选择'
                      :mode="allowMultiple(item)?'multiple':''"
                    />
                    <j-area-linkage v-model='item.val' v-else-if="item.type==='area-linkage' || item.type==='pca'"
                                    style='width: 100%' />
                    <j-date v-else-if=" item.type=='date' " v-model='item.val' placeholder='请选择日期'
                            style='width: 100%'></j-date>
                    <j-date v-else-if=" item.type=='datetime' " v-model='item.val' placeholder='请选择时间' :show-time='true'
                            date-format='YYYY-MM-DD HH:mm:ss' style='width: 100%'></j-date>
                    <a-time-picker v-else-if="item.type==='time'" :value="item.val ? moment(item.val,'HH:mm:ss') : null"
                                   format='HH:mm:ss' style='width: 100%' @change='(time,value)=>item.val=value' />
                    <a-input-number v-else-if=" item.type=='int'||item.type=='number' " style='width: 100%'
                                    placeholder='请输入数值' v-model='item.val' />
                    <a-select v-else-if="item.type=='switch'" placeholder='请选择' v-model='item.val'>
                      <!-- update-begin-author:taoyan for: VUEN-242【online表单 多条件查询】开关组件设置扩展参数为[0,1] 时，多条件查询选择后查询仍然是Y/N -->
                      <a-select-option :value='item.extendOption[0]'>是</a-select-option>
                      <a-select-option :value='item.extendOption[1]'>否</a-select-option>
                      <!-- update-end-author:taoyan for: VUEN-242【online表单 多条件查询】开关组件设置扩展参数为[0,1] 时，多条件查询选择后查询仍然是Y/N -->
                    </a-select>
                    <a-input v-else v-model='item.val' placeholder='请输入值' />
                    <a-input v-show="inputShow" v-model="item.val" placeholder="请输入值"/>
                  </a-col>

                  <a-col :md='4' :xs='0' style='margin-bottom: 12px;'>
                    <a-button @click='handleAdds(indexs)' icon='plus'></a-button>&nbsp;
                    <a-button @click='handleDels(indexs,index)' icon='minus'></a-button>
                  </a-col>

                  <a-col :md='0' :xs='24' style='margin-bottom: 12px;text-align: right;'>
                    <a-button @click='handleAdds(indexs)' icon='plus'></a-button>&nbsp;
                    <a-button @click='handleDels(indexs,index)' icon='minus'></a-button>
                  </a-col>

                </a-row>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-form>
    </a-col>
    <a-col :sm="24" :md="5">
      <!-- 查询记录 -->

      <a-card class="j-super-query-history-card" :bordered="true">
        <div slot="title">
          保存的查询
        </div>

        <a-empty v-if="saveTreeData.length === 0" class="j-super-query-history-empty" description="没有保存任何查询"/>
        <a-tree
          v-else
          class="j-super-query-history-tree"
          showIcon
          :treeData="saveTreeData"
          :selectedKeys="[]"
          @select="handleTreeSelect"
        >
        </a-tree>
      </a-card>


    </a-col>
    <a-modal title="请输入保存的名称" :visible="prompt.visible" @cancel="prompt.visible=false" @ok="handlePromptOk">
      <a-input v-model="prompt.value"></a-input>
    </a-modal>
  </a-row>
</template>

<script>
  import * as utils from '@/utils/util'
  export default {
    name: 'various',
    components: {},
    props: {
      fieldTreeData: {
        type: Array,
        default: () => [],
        required: true
      },
    },
    data() {
      return {
        queryParamsModel: [{
          QueryType:'and',
          queryItem: [{}],
        }],
        matchType: 'and',
        queryParamsModelAll:null,
        inputShow:false,

        // 保存查询条件的treeData
        saveTreeData: [],
        // 保存查询条件的前缀名
        saveCodeBefore: 'VariousSaved_',
        prompt: {
          visible: false,
          value: ''
        },
      }
    },
    computed: {
      fullSaveCode() {
        let saveCode = this.saveCode
        if (saveCode == null || saveCode === '') {
          saveCode = this.$route.fullPath
        }
        return this.saveCodeBefore + saveCode
      },
    },
    watch: {
      queryParamsModel: {
        immediate: true,
        handler(val) {
          let obj={
            matchType:this.matchType,
            params:[...val],
          }
          this.queryParamsModelAll=obj
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
    },

    methods: {
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



      handleAdd() {
        this.queryParamsModel.push({
          QueryType:'and',
          queryItem: [{}],
        })
      },
      resetLine() {
        this.superQueryFlag = false
        this.queryParamsModel = []
        this.handleAdd()
      },
      handleDel(index) {
        this.queryParamsModel.splice(this.queryParamsModel.length-1, 1)
      },
      handleAdds(indes){
        this.queryParamsModel[indes].queryItem.push({
          rule: 'eq'
        })
      },
      handleDels(indes,index){
        this.queryParamsModel[indes].queryItem.splice(index, 1)
        if(this.queryParamsModel[indes].queryItem.length<=0){
          this.queryParamsModel.splice(indes, 1)
        }
      },


      handleTreeSelect(idx, event) {
        if (event.selectedNodes[0]) {
          let { matchType, records } = event.selectedNodes[0].data.props
          // 将保存的matchType取出，兼容旧数据，如果没有保存就还是使用原来的
          this.matchType = matchType || this.matchType
          this.queryParamsModel = utils.cloneObject(records)
        }
      },
      handleSave() {
        let queryParams = this.removeEmptyObject(this.queryParamsModel)
        if (this.isNullArray(queryParams)) {
          this.$message.warning('空条件不能保存')
        } else {
          this.prompt.value = ''
          this.prompt.visible = true
        }
      },
      handlePromptOk() {
        let { value } = this.prompt
        if(!value){
          this.$message.warning('保存名称不能为空')
          return
        }
        // 取出查询条件
        let records = this.removeEmptyObject(this.queryParamsModel)
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
      // 将查询保存到 LocalStore 里
      saveToLocalStore() {
        let saveValue = this.saveTreeData.map(({ originTitle, matchType, records }) => ({ title: originTitle, matchType, records }))
        this.$ls.set(this.fullSaveCode, saveValue)
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
    }
  }
</script>

<style lang="less" scoped>

  .ConditionAll{
    width: 100%;
    border: 1px solid #eeeeee;
    border-radius: 3px;
  }
  .ConditionT{
    background: #d9f2ff;
    padding:10px 20px;
  }
  .ConditionB{
    background: #fff;
    padding: 20px;
  }

  //.j-super-query-box {
  //  display: inline-block;
  //}


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
      width: 100px;
      height: 100px;
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

</style>