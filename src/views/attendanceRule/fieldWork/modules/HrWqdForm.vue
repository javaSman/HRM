<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <!-- 主表单区域 -->
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24" >
            <a-form-model-item label="外勤点" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="wqd">
              <a-input v-model="model.wqd" placeholder="请输入外勤点" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="地址" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="address">
              <a-input v-model="model.address" placeholder="请输入地址" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="经度" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="longitude">
              <a-input v-model="model.longitude" placeholder="请输入经度" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="纬度" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="latitude">
              <a-input v-model="model.latitude" placeholder="请输入纬度" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="上班时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sbTime">
              <j-date placeholder="请选择上班时间" v-model="model.sbTime" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="下班时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="xbTime">
              <j-date placeholder="请选择下班时间" v-model="model.xbTime" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
      <!-- 子表单区域 -->
    <a-tabs v-model="activeKey" @change="handleChangeTabs">
      <a-tab-pane tab="外勤人员表" :key="refKeys[0]" :forceRender="true">
        <j-vxe-table
          keep-source
          :ref="refKeys[0]"
          :loading="hrWqryTable.loading"
          :columns="hrWqryTable.columns"
          :dataSource="hrWqryTable.dataSource"
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
    name: 'HrWqdForm',
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
        refKeys: ['hrWqry', ],
        tableKeys:['hrWqry', ],
        activeKey: 'hrWqry',
        // 外勤人员表
        hrWqryTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '关联外勤点表id',
              key: 'hrWqdId',
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
              title: '姓名',
              key: 'name',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '公司id',
              key: 'companyId',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '部门id',
              key: 'dept',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '考勤规则id',
              key: 'ruleId',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '考勤规则名称',
              key: 'ruleName',
               type: JVXETypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '上班时间',
              key: 'startTime',
              type: JVXETypes.datetime,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '下班时间',
              key: 'endTime',
              type: JVXETypes.datetime,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
          ]
        },
        url: {
          add: "/hr_wqd/hrWqd/add",
          edit: "/hr_wqd/hrWqd/edit",
          queryById: "/hr_wqd/hrWqd/queryById",
          hrWqry: {
            list: '/hr_wqd/hrWqd/queryHrWqryByMainId'
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
        this.hrWqryTable.dataSource=[]
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
          this.requestSubTableData(this.url.hrWqry.list, params, this.hrWqryTable)
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
          hrWqryList: allValues.tablesValue[0].tableData,
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