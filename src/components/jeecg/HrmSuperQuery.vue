<template>
<div class="j-super-query-box">

  <slot name="button" :isActive="superQueryFlag" :isMobile="izMobile" :open="handleOpen" :reset="handleReset">
    <a-tooltip v-if="superQueryFlag" v-bind="tooltipProps" :mouseLeaveDelay="0.2">
      <!-- begin 不知道为什么不加上这段代码就无法生效 -->
      <span v-show="false">{{tooltipProps}}</span>
      <!-- end 不知道为什么不加上这段代码就无法生效 -->
      <template slot="title">
        <span>已有高级查询条件生效</span>
        <a-divider type="vertical"/>
        <a @click="handleReset">清空</a>
      </template>
      <a-button-group>
        <a-button type="primary" @click="handleOpen">
          <a-icon type="appstore" theme="twoTone" spin/>
          <span>高级查询hrm</span>
        </a-button>
        <a-button v-if="izMobile" type="primary" icon="delete" @click="handleReset"/>
      </a-button-group>
    </a-tooltip>
    <a-button v-else type="primary" icon="filter" @click="handleOpen">高级查询</a-button>
  </slot>

  <j-modal
    title="高级筛选"
    :width="780"
    :visible="visible"
    @cancel="handleCancel"
    :mask="true"
    :fullscreen="izMobile"
    draggable
    class="j-super-query-modal"
    style="top:5%;max-height: 95%;"
  >

    <template slot="footer">
      <div class="hrm-query-footer">
        <a-button class="hrm-query-clear-btn" :loading="loading" @click="handleReset">清空条件</a-button>
        <div class="hrm-query-footer-actions">
          <slot></slot>
          <span v-has="'admin:debug'"> <super-query-code-show :value="urlParam" @click="showCode"></super-query-code-show>  </span>
          <a-button class="hrm-query-cancel-btn" :loading="loading" @click="handleCancel">取消</a-button>
          <a-button class="hrm-query-apply-btn" :loading="loading" type="primary" @click="handleOk">应用筛选</a-button>
        </div>
      </div>
    </template>

    <a-spin :spinning="loading">
      <a-row class="hrm-query-content">
        <a-col :sm="24" :md="24">

          <a-empty v-if="queryParamsModel.length === 0" class="hrm-query-empty">
            <div slot="description">
              <span>没有任何查询条件</span>
              <a-divider type="vertical"/>
              <a @click="handleAdd">点击新增</a>
            </div>
          </a-empty>

          <a-form v-else layout="inline" class="hrm-query-form">

            <a-row>
              <a-col :md="12" :xs="24">
                <div class="hrm-query-logic">
                  <span class="hrm-query-logic-label">条件关系：</span>
                  <a-radio-group v-model="matchType" class="hrm-query-logic-group">
                    <a-radio-button value="and">且 (AND)</a-radio-button>
                    <a-radio-button value="or">或 (OR)</a-radio-button>
                  </a-radio-group>
                </div>
              </a-col>
            </a-row>

            <div class="hrm-query-condition-list">
              <a-row type="flex" class="hrm-query-condition-row" :gutter="8" v-for="(item, index) in queryParamsModel" :key="index">

              <a-col :md="4" :xs="24" class="hrm-query-condition-field">
                <a-tree-select
                  showSearch
                  v-model="item.field"
                  :treeData="fieldTreeData"
                  :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }"
                  placeholder="选择查询字段"
                  allowClear
                  treeDefaultExpandAll
                  :getPopupContainer="node=>node.parentNode"
                  style="width: 100%"
                  @select="(val,option)=>handleSelected(option,item)"
                >
                </a-tree-select>
              </a-col>

              <a-col :md="4" :xs="24" class="hrm-query-condition-rule">
                <a-select placeholder="匹配规则" :value="item.rule" :getPopupContainer="node=>node.parentNode" @change="handleRuleChange(item,$event)">
                  <a-select-option value="eq">等于</a-select-option>
                  <a-select-option value="like">包含</a-select-option>
                  <a-select-option value="right_like">以..开始</a-select-option>
                  <a-select-option value="left_like">以..结尾</a-select-option>
                  <a-select-option value="in">在...中</a-select-option>
                  <a-select-option value="ne">不等于</a-select-option>
                  <a-select-option value="gt">大于</a-select-option>
                  <a-select-option value="ge">大于等于</a-select-option>
                  <a-select-option value="lt">小于</a-select-option>
                  <a-select-option value="le">小于等于</a-select-option>
                </a-select>
              </a-col>

              <a-col :md="14" :xs="24" class="hrm-query-condition-value">
                <!-- 下拉搜索 -->
                <j-search-select-tag v-if="item.type==='sel_search'" v-model="item.val" :dict="getDictInfo(item)" placeholder="请选择"/>
                <!-- 下拉框 -->
                <j-search-select-tag v-else-if="item.type==='list' && item.dictTable" v-model="item.val" :dict="getDictInfo(item)" placeholder="请选择"/>
                <!-- 下拉多选 -->
                <template v-else-if="item.type==='list_multi'">
                  <j-multi-select-tag v-if="item.options" v-model="item.val" :options="item.options" placeholder="请选择"/>
                  <j-multi-select-tag v-else v-model="item.val" :dictCode="getDictInfo(item)" placeholder="请选择"/>
                </template>

                <template v-else-if="item.dictCode">
                  <template v-if="item.type === 'table-dict'">
                    <j-popup
                      v-model="item.val"
                      :code="item.dictTable"
                      :field="item.dictCode"
                      :orgFields="item.dictCode"
                      :destFields="item.dictCode"
                      :multi="true"
                    ></j-popup>
                  </template>
                  <template v-else>
                    <j-multi-select-tag v-show="allowMultiple(item)" v-model="item.val" :dictCode="item.dictCode" placeholder="请选择"/>
                    <j-dict-select-tag v-show="!allowMultiple(item)" v-model="item.val" :dictCode="item.dictCode" placeholder="请选择"/>
                  </template>
                </template>
                <j-popup
                  v-else-if="item.type === 'popup'"
                  :value="item.val"
                  v-bind="item.popup"
                  group-id="superQuery"
                  @input="(e,v)=>handleChangeJPopup(item,e,v)"
                  :multi="true"/>
                <j-select-multi-user
                  v-else-if="item.type === 'select-user' || item.type === 'sel_user'"
                  v-model="item.val"
                  :buttons="false"
                  :multiple="allowMultiple(item)"
                  placeholder="请选择用户"
                  :returnKeys="['id', item.customReturnField || 'username']"
                />
                <j-select-depart
                  v-else-if="item.type === 'select-depart' || item.type === 'sel_depart'"
                  v-model="item.val"
                  :multi="allowMultiple(item)"
                  placeholder="请选择部门"
                  :customReturnField="item.customReturnField || 'id'"
                />
                <a-select
                  v-else-if="item.options instanceof Array"
                  v-model="item.val"
                  :options="item.options"
                  allowClear
                  placeholder="请选择"
                  :mode="allowMultiple(item)?'multiple':''"
                />
                <j-area-linkage v-model="item.val" v-else-if="item.type==='area-linkage' || item.type==='pca'" style="width: 100%"/>
                <j-date v-else-if=" item.type=='date' " v-model="item.val" placeholder="请选择日期" style="width: 100%"></j-date>
                <j-date v-else-if=" item.type=='datetime' " v-model="item.val" placeholder="请选择时间" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%"></j-date>
                <a-time-picker v-else-if="item.type==='time'" :value="item.val ? moment(item.val,'HH:mm:ss') : null" format="HH:mm:ss" style="width: 100%" @change="(time,value)=>item.val=value"/>
                <a-input-number v-else-if=" item.type=='int'||item.type=='number' " style="width: 100%" placeholder="请输入数值" v-model="item.val"/>
                <a-select v-else-if="item.type=='switch'" placeholder="请选择" v-model="item.val">
                  <!-- update-begin-author:taoyan for: VUEN-242【online表单 高级查询】开关组件设置扩展参数为[0,1] 时，高级查询选择后查询仍然是Y/N -->
                  <a-select-option :value="item.extendOption[0]">是</a-select-option>
                  <a-select-option :value="item.extendOption[1]">否</a-select-option>
                  <!-- update-end-author:taoyan for: VUEN-242【online表单 高级查询】开关组件设置扩展参数为[0,1] 时，高级查询选择后查询仍然是Y/N -->
                </a-select>
                <a-input v-else v-model="item.val" placeholder="请输入值"/>
              </a-col>

              <a-col :md="2" :xs="0" class="hrm-query-condition-remove">
                <a-button type="link" @click="handleDel( index )" icon="close"></a-button>
              </a-col>

              <a-col :md="0" :xs="24" class="hrm-query-condition-remove-mobile">
                <a-button type="link" @click="handleDel( index )" icon="close">移除</a-button>
              </a-col>

            </a-row>
            </div>

            <button type="button" class="hrm-query-add-btn" @click="handleAdd">
              <a-icon type="plus"/>
              <span>添加条件</span>
            </button>

          </a-form>
        </a-col>
      </a-row>


    </a-spin>

    <a-modal title="请输入保存的名称" :visible="prompt.visible" @cancel="prompt.visible=false" @ok="handlePromptOk">
      <a-input v-model="prompt.value"></a-input>
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
  import SuperQueryCodeShow from "@comp/common/showComponent/SuperQueryCodeShow";

  export default {
    name: 'HrmSuperQuery', 
    mixins: [mixinDevice],
    components: { JAreaLinkage, JMultiSelectTag, JDate, JSelectDepart, JSelectMultiUser,SuperQueryCodeShow },
    props: {

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
        treeIcon: <a-icon type="file-text"/>,
        // 保存查询条件的treeData
        saveTreeData: [],
        // 保存查询条件的前缀名
        saveCodeBefore: 'JSuperQuerySaved_',
        // 查询类型，过滤条件匹配（and、or）
        matchType: 'and',
        superQueryFlag: false,

        urlParam:'',
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
                // update--begin--author:sunjianlei-----date:20220121------for：【JTC-1167】【表单设计器】高级查询，一对一字段查询不好使
                // 是否仅包含字段名，不需要拼接子表表名
                if (!data.onlyFieldName) {
                  child.value = data.value + ',' + child.value
                }
                // update--end--author:sunjianlei-----date:20220121------for：【JTC-1167】【表单设计器】高级查询，一对一字段查询不好使
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
      show() {
        if (!this.queryParamsModel || this.queryParamsModel.length === 0) {
          this.resetLine()
        }
        this.visible = true
      },

      getDictInfo(item) {
        let str = ''
        if(!item.dictTable){
          str = item.dictCode
        }else{
          str = item.dictTable+','+item.dictText+','+item.dictCode
        }
        console.log('高级查询字典信息',str)
        return str
      },
      handleOk() {
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
        } else {
          this.$message.warn("不能查询空条件")
        }
      },


      emitCallback(event = {}, loadStatus = true) {



        let { params = [], matchType = this.matchType } = event
        this.superQueryFlag = (params && params.length > 0)
        for (let param of params) {
          if (Array.isArray(param.val)) {
            param.val = param.val.join(',')
          }
        }
        console.debug('---高级查询参数--->', { params, matchType })
        this.$emit(this.callback, params, matchType, loadStatus)
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
        this.queryParamsModel.push({ rule: 'eq' })
      },
      resetLine() {
        this.superQueryFlag = false
        this.queryParamsModel = []
        this.addNewLine()
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
        //update-begin-author:taoyan for: VUEN-242【online表单 高级查询】开关组件设置扩展参数为[0,1] 时，高级查询选择后查询仍然是Y/N
        item['extendOption'] = node.dataRef.extendOption || ['Y', 'N']
        //update-begin-author:taoyan for: VUEN-242【online表单 高级查询】开关组件设置扩展参数为[0,1] 时，高级查询选择后查询仍然是Y/N
        item['customReturnField'] = customReturnField
        if (popup) {
          item['popup'] = popup
        }
        // 格式化字符串，一般用于高级查询的日期格式处理
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
        this.emitCallback({}, true)
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
      handleTreeSelect(idx, event) {
        if (event.selectedNodes[0]) {
          let { matchType, records } = event.selectedNodes[0].data.props
          // 将保存的matchType取出，兼容旧数据，如果没有保存就还是使用原来的
          this.matchType = matchType || this.matchType
          this.queryParamsModel = utils.cloneObject(records)
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
              //update-begin-author:taoyan date:20200819 for:【开源问题】 高级查询 下拉框作为并且选项很多多多 LOWCOD-779
              delete item.options
              //update-end-author:taoyan date:20200819 for:【开源问题】 高级查询 下拉框作为并且选项很多多多 LOWCOD-779
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

      showCode(){

        if (!this.isNullArray(this.queryParamsModel)) {
          let event = {
            matchType: this.matchType,
            params: this.removeEmptyObject(this.queryParamsModel)
          }
          let sqp = {}
          let superQueryParams = JSON.stringify(event.params);
          if(superQueryParams){
            sqp['superQueryParams']=encodeURI(superQueryParams)
            sqp['superQueryMatchType'] = event.matchType
          }
          let urlParam = `superQueryParams=${sqp.superQueryParams}&superQueryMatchType=${sqp.superQueryMatchType}`

          this.urlParam = urlParam;
          // 组装数据

        } else {
          this.$message.warn("不能查询空条件")
        }
      },

    }
  }
</script>

<style lang="less" scoped>

  .j-super-query-box {
    display: inline-block;
  }

  /deep/ .ant-modal-mask {
    background-color: rgba(15, 23, 42, 0.42);
    backdrop-filter: blur(3px);
  }

  .j-super-query-modal {
    /deep/ .ant-modal-content {
      overflow: hidden;
      border-radius: 10px;
      box-shadow: 0 18px 45px rgba(15, 23, 42, 0.22);
    }

    /deep/ .ant-modal-header {
      padding: 22px 20px;
      border-bottom: 1px solid #e2e8f0;
      border-radius: 10px 10px 0 0;
      background: #ffffff;
    }

    /deep/ .ant-modal-title {
      color: #1a2a3d;
      font-size: 16px;
      font-weight: 600;
      line-height: 20px;
    }

    /deep/ .ant-modal-close {
      color: #64748b;
    }

    /deep/ .ant-modal-close-x {
      width: 50px;
      height: 64px;
      line-height: 64px;
    }

    /deep/ .ant-modal-body {
      padding: 20px 20px 18px;
      background: #ffffff;
    }

    /deep/ .ant-modal-footer {
      padding: 12px 20px;
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
    }

    .hrm-query-content {
      margin: 0;
    }

    .hrm-query-empty {
      margin-bottom: 0;
      padding: 12px 0;
    }

    .hrm-query-form {
      width: 100%;
    }

    .hrm-query-logic {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 26px;
      padding: 2px 0;
    }

    .hrm-query-logic-label {
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    .hrm-query-logic-group {
      /deep/ .ant-radio-button-wrapper {
        height: 28px;
        padding: 0 14px;
        border-color: #dbe4f0;
        color: #64748b;
        font-size: 12px;
        font-weight: 600;
        line-height: 26px;
        transition: all 0.2s ease;

        &:first-child {
          border-radius: 5px 0 0 5px;
        }

        &:last-child {
          border-radius: 0 5px 5px 0;
        }

        &:hover {
          color: #2563eb;
        }
      }

      /deep/ .ant-radio-button-wrapper-checked {
        border-color: #2563eb;
        background: #2563eb;
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.22);

        &:hover {
          color: #ffffff;
        }
      }
    }

    .hrm-query-condition-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 12px;
    }

    .hrm-query-condition-row {
      align-items: center;
      margin-right: 0 !important;
      margin-left: 0 !important;
      padding: 10px 8px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #f8fafd;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        border-color: rgba(37, 99, 235, 0.18);
      }

      /deep/ .ant-select,
      /deep/ .ant-calendar-picker,
      /deep/ .ant-time-picker,
      /deep/ .ant-input-number {
        width: 100%;
      }

      /deep/ .ant-select-selection--single,
      /deep/ .ant-input,
      /deep/ .ant-input-number,
      /deep/ .ant-time-picker-input,
      /deep/ .ant-calendar-picker-input {
        height: 34px;
        border-color: #e2e8f0;
        border-radius: 6px;
        background: #ffffff;
        color: #1a2a3d;
        font-size: 12px;
        transition: all 0.2s ease;
      }

      /deep/ .ant-select-selection__rendered,
      /deep/ .ant-input-number-input {
        line-height: 32px;
      }

      /deep/ .ant-select-selection__placeholder,
      /deep/ .ant-input::placeholder,
      /deep/ .ant-select-search__field__placeholder {
        color: #94a3b8;
      }

      /deep/ .ant-select-focused .ant-select-selection,
      /deep/ .ant-select-selection:focus,
      /deep/ .ant-select-selection:active,
      /deep/ .ant-input:focus,
      /deep/ .ant-input-number-focused,
      /deep/ .ant-time-picker-input:focus,
      /deep/ .ant-calendar-picker-input:focus {
        border-color: rgba(37, 99, 235, 0.42);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
      }
    }

    .hrm-query-condition-field,
    .hrm-query-condition-rule,
    .hrm-query-condition-value,
    .hrm-query-condition-remove {
      margin-bottom: 0;
    }

    .hrm-query-condition-remove {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      /deep/ .ant-btn {
        width: 28px;
        height: 28px;
        border-radius: 5px;
        color: #64748b;
        line-height: 28px;

        &:hover,
        &:focus {
          background: rgba(220, 38, 38, 0.08);
          color: #dc2626;
        }
      }
    }

    .hrm-query-condition-remove-mobile {
      margin-top: 6px;
      text-align: right;
    }

    .hrm-query-add-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      height: 36px;
      border: 2px dashed #dbe4f0;
      border-radius: 8px;
      background: transparent;
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover,
      &:focus {
        border-color: rgba(37, 99, 235, 0.4);
        background: rgba(37, 99, 235, 0.02);
        color: #2563eb;
        outline: none;
      }
    }

    .hrm-query-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 12px;
    }

    .hrm-query-footer-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      min-width: 0;
    }

    .hrm-query-clear-btn,
    .hrm-query-cancel-btn,
    .hrm-query-apply-btn {
      height: 36px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
    }

    .hrm-query-clear-btn,
    .hrm-query-cancel-btn {
      border-color: #dbe4f0;
      background: #f8fafd;
      color: #1a2a3d;

      &:hover,
      &:focus {
        border-color: rgba(37, 99, 235, 0.32);
        color: #2563eb;
      }
    }

    .hrm-query-apply-btn {
      min-width: 84px;
      border: none;
      background: linear-gradient(135deg, #2d78ff 0%, #00a0d4 100%);
      box-shadow: 0 4px 12px rgba(45, 120, 255, 0.22);

      &:hover,
      &:focus {
        background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%);
        box-shadow: 0 5px 14px rgba(45, 120, 255, 0.26);
      }
    }

    @media (max-width: 767px) {
      /deep/ .ant-modal-body {
        padding: 16px;
      }

      .hrm-query-logic {
        align-items: flex-start;
        flex-direction: column;
        margin-bottom: 16px;
      }

      .hrm-query-condition-row {
        gap: 8px;
      }

      .hrm-query-condition-field,
      .hrm-query-condition-rule,
      .hrm-query-condition-value {
        margin-bottom: 8px;
      }

      .hrm-query-footer {
        align-items: stretch;
        flex-direction: column;
      }

      .hrm-query-footer-actions {
        justify-content: flex-end;
      }
    }

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
