<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <!-- 主表单区域 -->
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24" >
            <a-form-model-item label="工号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="no">
              <a-input v-model="model.no" placeholder="请输入工号" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="姓名" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="name">
              <a-input v-model="model.name" placeholder="请输入姓名" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="休假类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="xjType">
              <j-dict-select-tag v-model="model.xjType" :disabled="formDisabled" dictCode="	xj_type" allowClear
                    placeholder="请输入休假类型"   />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="开始时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="startTime">
              <j-date placeholder="请选择开始时间" v-model="model.startTime" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="结束时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="endTime">
              <j-date placeholder="请选择结束时间" v-model="model.endTime" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="申请时长（小时）" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="applyHours">
              <a-input-number v-model="model.applyHours" placeholder="请输入申请时长（小时）" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="申请原因" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sqyy">
              <a-input v-model="model.sqyy" placeholder="请输入申请原因" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="附件" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="attachmentUrls">
              <a-input v-model="model.attachmentUrls" placeholder="请输入附件" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="审批状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="spStatus">
              <a-input v-model="model.spStatus" placeholder="请输入审批状态" ></a-input>
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
            <a-form-model-item label="审批人名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sprName">
              <a-input v-model="model.sprName" placeholder="请输入审批人名称" ></a-input>
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
      <a-tab-pane tab="hr_xjsq_splc" :key="refKeys[0]" :forceRender="true">
        <j-vxe-table
          keep-source
          :ref="refKeys[0]"
          :loading="hrXjsqSplcTable.loading"
          :columns="hrXjsqSplcTable.columns"
          :dataSource="hrXjsqSplcTable.dataSource"
          :maxHeight="300"
          :disabled="formDisabled"
          :rowNumber="true"
          :rowSelection="true"
          :toolbar="true"
          />
      </a-tab-pane>
      <a-tab-pane tab="hr_xjsq_splc_record" :key="refKeys[1]" :forceRender="true">
        <j-vxe-table
          keep-source
          :ref="refKeys[1]"
          :loading="hrXjsqSplcRecordTable.loading"
          :columns="hrXjsqSplcRecordTable.columns"
          :dataSource="hrXjsqSplcRecordTable.dataSource"
          :maxHeight="300"
          :disabled="formDisabled"
          :rowNumber="true"
          :rowSelection="true"
          :toolbar="true"
          />
      </a-tab-pane>
      <a-tab-pane tab="hr_xjdk_record" :key="refKeys[2]" :forceRender="true">
        <j-vxe-table
          keep-source
          :ref="refKeys[2]"
          :loading="hrXjdkRecordTable.loading"
          :columns="hrXjdkRecordTable.columns"
          :dataSource="hrXjdkRecordTable.dataSource"
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
    name: 'HrXjsqForm',
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
        refKeys: ['hrXjsqSplc', 'hrXjsqSplcRecord', 'hrXjdkRecord', ],
        tableKeys:['hrXjsqSplc', 'hrXjsqSplcRecord', 'hrXjdkRecord', ],
        activeKey: 'hrXjsqSplc',
        // hr_xjsq_splc
        hrXjsqSplcTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '关联休假申请id',
              key: 'hrXjsqId',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '审批状态',
              key: 'spStatus',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '审批节点',
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
        // hr_xjsq_splc_record
        hrXjsqSplcRecordTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '关联休假申请id',
              key: 'hrXjsqId',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '审批状态',
              key: 'spStatus',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '审批节点',
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
        // hr_xjdk_record
        hrXjdkRecordTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '关联休假申请id',
              key: 'hrXjsqId',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '工号',
              key: 'no',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '打卡时间',
              key: 'dkTime',
              type: JVXETypes.datetime,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '打卡方式：字典编号 dk_type',
              key: 'dkType',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
          ]
        },
        url: {
          add: "/hr_xjsq/hrXjsq/add",
          edit: "/hr_xjsq/hrXjsq/edit",
          queryById: "/hr_xjsq/hrXjsq/queryById",
          hrXjsqSplc: {
            list: '/hr_xjsq/hrXjsq/queryHrXjsqSplcByMainId'
          },
          hrXjsqSplcRecord: {
            list: '/hr_xjsq/hrXjsq/queryHrXjsqSplcRecordByMainId'
          },
          hrXjdkRecord: {
            list: '/hr_xjsq/hrXjsq/queryHrXjdkRecordByMainId'
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
        this.hrXjsqSplcTable.dataSource=[]
        this.hrXjsqSplcRecordTable.dataSource=[]
        this.hrXjdkRecordTable.dataSource=[]
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
          this.requestSubTableData(this.url.hrXjsqSplc.list, params, this.hrXjsqSplcTable)
          this.requestSubTableData(this.url.hrXjsqSplcRecord.list, params, this.hrXjsqSplcRecordTable)
          this.requestSubTableData(this.url.hrXjdkRecord.list, params, this.hrXjdkRecordTable)
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
          hrXjsqSplcList: allValues.tablesValue[0].tableData,
          hrXjsqSplcRecordList: allValues.tablesValue[1].tableData,
          hrXjdkRecordList: allValues.tablesValue[2].tableData,
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