<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="用户id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="userId">
              <a-input v-model="model.userId" placeholder="请输入用户id"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="ip地址" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="ipAddress">
              <a-input v-model="model.ipAddress" placeholder="请输入ip地址"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="相应状态码" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="statusCode">
              <a-input v-model="model.statusCode" placeholder="请输入相应状态码"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="执行时间(ms)" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="executionTime">
              <a-input v-model="model.executionTime" placeholder="请输入执行时间(ms)"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="用户账号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="userName">
              <j-select-user-by-dep v-model="model.userName" :multi="true" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="请求数据" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="data">
              <a-input v-model="model.data" placeholder="请输入请求数据"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="模板id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="apiTemplateId">
              <a-input v-model="model.apiTemplateId" placeholder="请输入模板id"  ></a-input>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

  import { httpAction, getAction } from '@/api/manage'
  import { validateDuplicateValue } from '@/utils/util'

  export default {
    name: 'ZtApiRequestRecordForm',
    components: {
    },
    props: {
      //表单禁用
      disabled: {
        type: Boolean,
        default: false,
        required: false
      }
    },
    data () {
      return {
        model:{
         },
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        validatorRules: {
        },
        url: {
          add: "/ztApiTemplateManage/ztApiRequestRecord/add",
          edit: "/ztApiTemplateManage/ztApiRequestRecord/edit",
          queryById: "/ztApiTemplateManage/ztApiRequestRecord/queryById"
        }
      }
    },
    computed: {
      formDisabled(){
        return this.disabled
      },
    },
    created () {
       //备份model原始值
      this.modelDefault = JSON.parse(JSON.stringify(this.model));
    },
    methods: {
      add () {
        this.edit(this.modelDefault);
      },
      edit (record) {
        this.model = Object.assign({}, record);
        this.visible = true;
      },
      submitForm () {
        const that = this;
        // 触发表单验证
        this.$refs.form.validate(valid => {
          if (valid) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if(!this.model.id){
              httpurl+=this.url.add;
              method = 'post';
            }else{
              httpurl+=this.url.edit;
               method = 'put';
            }
            httpAction(httpurl,this.model,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
            })
          }
         
        })
      },
    }
  }
</script>