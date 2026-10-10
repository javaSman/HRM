<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="主表" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="hrmRzglId">
              <a-input v-model="model.hrmRzglId" placeholder="请输入主表"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="区域" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="qy">
              <a-input v-model="model.qy" placeholder="请输入区域"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="所属部门" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dept">
              <a-input v-model="model.dept" placeholder="请输入所属部门"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="工号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gh">
              <a-input v-model="model.gh" placeholder="请输入工号"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="姓名" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="xm">
              <a-input v-model="model.xm" placeholder="请输入姓名"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="身份证号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sfzh">
              <a-input v-model="model.sfzh" placeholder="请输入身份证号"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="手机号码" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sjhm">
              <a-input v-model="model.sjhm" placeholder="请输入手机号码"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="入住日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="rzrq">
              <a-input v-model="model.rzrq" placeholder="请输入入住日期"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="宿舍类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sslx">
              <a-input v-model="model.sslx" placeholder="请输入宿舍类型"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="入住原因" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="rzyy">
              <a-input v-model="model.rzyy" placeholder="请输入入住原因"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="申请时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sqsj">
              <a-input v-model="model.sqsj" placeholder="请输入申请时间"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="审批人" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="spr">
              <a-input v-model="model.spr" placeholder="请输入审批人"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="抄送人" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="csr">
              <a-input v-model="model.csr" placeholder="请输入抄送人"  ></a-input>
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
    name: 'HrmRzglRzsqForm',
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
          add: "/ryManage/hrmRzglRzsq/add",
          edit: "/ryManage/hrmRzglRzsq/edit",
          queryById: "/ryManage/hrmRzglRzsq/queryById"
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