<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <!-- 主表单区域 -->
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24" >
            <a-form-model-item label="员工id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="employeeId">
              <a-input v-model="model.employeeId" placeholder="请输入员工id" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="员工工号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="no">
              <a-input v-model="model.no" placeholder="请输入员工工号" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="员工姓名" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="name">
              <a-input v-model="model.name" placeholder="请输入员工姓名" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="员工考勤表id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="hrKqYgId">
              <a-input v-model="model.hrKqYgId" placeholder="请输入员工考勤表id" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="员工异常考勤表id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="hrYckqYgId">
              <a-input v-model="model.hrYckqYgId" placeholder="请输入员工异常考勤表id" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="异常类型：1-缺卡，2-旷工" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="ycType">
              <a-input-number v-model="model.ycType" placeholder="请输入异常类型：1-缺卡，2-旷工" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="补卡原因说明" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="reason">
              <a-input v-model="model.reason" placeholder="请输入补卡原因说明" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="审批状态：1 - 审批中，2 - 已通过，3 - 已撤回，4 - 已退回" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="spStatus">
              <a-input-number v-model="model.spStatus" placeholder="请输入审批状态：1 - 审批中，2 - 已通过，3 - 已撤回，4 - 已退回" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="审批节点" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="spFlow">
              <a-input v-model="model.spFlow" placeholder="请输入审批节点" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="审批人id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sprId">
              <a-input v-model="model.sprId" placeholder="请输入审批人id" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="审批人名称（前端用）" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sprName">
              <a-input v-model="model.sprName" placeholder="请输入审批人名称（前端用）" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="附件地址" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="attachmentUrls">
              <a-input v-model="model.attachmentUrls" placeholder="请输入附件地址" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="待补卡时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="bkTime">
              <j-date placeholder="请选择待补卡时间" v-model="model.bkTime" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="公司id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="companyId">
              <a-input v-model="model.companyId" placeholder="请输入公司id" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="部门id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dept">
              <a-input v-model="model.dept" placeholder="请输入部门id" ></a-input>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
      <!-- 子表单区域 -->
    <a-tabs v-model="activeKey" @change="handleChangeTabs">
      <a-tab-pane tab="补卡申请_审批流程" :key="refKeys[0]" :forceRender="true">
        <j-vxe-table
          keep-source
          :ref="refKeys[0]"
          :loading="hrBksqSplcTable.loading"
          :columns="hrBksqSplcTable.columns"
          :dataSource="hrBksqSplcTable.dataSource"
          :maxHeight="300"
          :disabled="formDisabled"
          :rowNumber="true"
          :rowSelection="true"
          :toolbar="true"
          />
      </a-tab-pane>
      <a-tab-pane tab="补卡申请_审批流程记录表" :key="refKeys[1]" :forceRender="true">
        <j-vxe-table
          keep-source
          :ref="refKeys[1]"
          :loading="hrBksqSplcRecordTable.loading"
          :columns="hrBksqSplcRecordTable.columns"
          :dataSource="hrBksqSplcRecordTable.dataSource"
          :maxHeight="300"
          :disabled="formDisabled"
          :rowNumber="true"
          :rowSelection="true"
          :toolbar="true"
          />
      </a-tab-pane>
    </a-tabs>
  </a-spin>
</template>

<script>

  import { getAction } from '@/api/manage'
  import { JVxeTableModelMixin } from '@/mixins/JVxeTableModelMixin.js'
  import { JVXETypes } from '@/components/jeecg/JVxeTable'
  import { getRefPromise,VALIDATE_FAILED} from '@/components/jeecg/JVxeTable/utils/vxeUtils.js'
  import { validateDuplicateValue } from '@/utils/util'
  import JFormContainer from '@/components/jeecg/JFormContainer'

  export default {
    name: 'HrBksqForm',
    mixins: [JVxeTableModelMixin],
    components: {
      JFormContainer,
    },
    data() {
      return {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        model:{
         },
        // 新增时子表默认添加几行空数据
        addDefaultRowNum: 1,
        validatorRules: {
        },
        refKeys: ['hrBksqSplc', 'hrBksqSplcRecord', ],
        tableKeys:['hrBksqSplc', 'hrBksqSplcRecord', ],
        activeKey: 'hrBksqSplc',
        // 补卡申请_审批流程
        hrBksqSplcTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '关联补卡申请id',
              key: 'hrBksqId',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '审批状态：1 - 审批中，2 - 已通过，3 - 已撤回，4 - 已退回',
              key: 'spStatus',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '审批流程节点',
              key: 'spFlow',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '审批人id',
              key: 'sprId',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '审批人姓名',
              key: 'sprName',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '审批时间',
              key: 'spTime',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '审批意见',
              key: 'spOpinion',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '抄送人id',
              key: 'csrId',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '抄送人姓名',
              key: 'csrName',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '是否多人审批：0 - 否，1 - 是',
              key: 'isDrsp',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
          ]
        },
        // 补卡申请_审批流程记录表
        hrBksqSplcRecordTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '关联补卡申请id',
              key: 'hrBksqId',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '审批状态：1 - 审批中，2 - 已通过，3 - 已撤回，4 - 已退回',
              key: 'spStatus',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '审批流程节点',
              key: 'spFlow',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '审批人id',
              key: 'sprId',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '审批人姓名',
              key: 'sprName',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '审批时间',
              key: 'spTime',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '审批意见',
              key: 'spOpinion',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '抄送人id',
              key: 'csrId',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '抄送人姓名',
              key: 'csrName',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '是否多人审批：0 - 否，1 - 是',
              key: 'isDrsp',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
          ]
        },
        url: {
          add: "/hr_bksq/hrBksq/add",
          edit: "/hr_bksq/hrBksq/edit",
          queryById: "/hr_bksq/hrBksq/queryById",
          hrBksqSplc: {
            list: '/hr_bksq/hrBksq/queryHrBksqSplcByMainId'
          },
          hrBksqSplcRecord: {
            list: '/hr_bksq/hrBksq/queryHrBksqSplcRecordByMainId'
          },
        }
      }
    },
    props: {
      //表单禁用
      disabled: {
        type: Boolean,
        default: false,
        required: false
      }
    },
    computed: {
      formDisabled(){
        return this.disabled
      },
    },
    created () {
    },
    methods: {
      addBefore(){
        this.hrBksqSplcTable.dataSource=[]
        this.hrBksqSplcRecordTable.dataSource=[]
      },
      getAllTable() {
        let values = this.tableKeys.map(key => getRefPromise(this, key))
        return Promise.all(values)
      },
      /** 调用完edit()方法之后会自动调用此方法 */
      editAfter() {
        this.$nextTick(() => {
        })
        // 加载子表数据
        if (this.model.id) {
          let params = { id: this.model.id }
          this.requestSubTableData(this.url.hrBksqSplc.list, params, this.hrBksqSplcTable)
          this.requestSubTableData(this.url.hrBksqSplcRecord.list, params, this.hrBksqSplcRecordTable)
        }
      },
      //校验所有一对一子表表单
        validateSubForm(allValues){
            return new Promise((resolve,reject)=>{
              Promise.all([
              ]).then(() => {
                resolve(allValues)
              }).catch(e => {
                if (e.error === VALIDATE_FAILED) {
                  // 如果有未通过表单验证的子表，就自动跳转到它所在的tab
                  this.activeKey = e.index == null ? this.activeKey : this.refKeys[e.index]
                } else {
                  console.error(e)
                }
              })
            })
        },
      /** 整理成formData */
      classifyIntoFormData(allValues) {
        let main = Object.assign(this.model, allValues.formValue)
        return {
          ...main, // 展开
          hrBksqSplcList: allValues.tablesValue[0].tableData,
          hrBksqSplcRecordList: allValues.tablesValue[1].tableData,
        }
      },
      validateError(msg){
        this.$message.error(msg)
      },

    }
  }
</script>

<style scoped>
</style>