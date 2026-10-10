<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="手机号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="phone">
              <a-input v-model="model.phone" placeholder="请输入手机号"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="内容" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="content">
              <a-input v-model="model.content" placeholder="请输入内容"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="短信厂商" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="provider">
              <j-dict-select-tag type="list" v-model="model.provider" dictCode="sms_provider" placeholder="请选择短信厂商" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="发送状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sendStatus">
              <j-dict-select-tag type="list" v-model="model.sendStatus" dictCode="sms_send_status" placeholder="请选择发送状态" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="业务类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="businessType">
              <j-dict-select-tag type="list" v-model="model.businessType" dictCode="business_type" placeholder="请选择业务类型" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="发送时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sendTime">
              <j-date placeholder="请选择发送时间"  v-model="model.sendTime" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
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
    name: 'ZtSysSmsForm',
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
          add: "/ztSystem/ztSysSms/add",
          edit: "/ztSystem/ztSysSms/edit",
          queryById: "/ztSystem/ztSysSms/queryById"
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