<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="主表" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="hrmSyqgzId">
              <a-input v-model="model.hrmSyqgzId" placeholder="请输入主表"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="公司" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="companyId">
              <a-input v-model="model.companyId" placeholder="请输入公司"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="所属部门" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dept">
              <a-input v-model="model.dept" placeholder="请输入所属部门"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="岗位名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="postId">
              <a-input v-model="model.postId" placeholder="请输入岗位名称"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="职级名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="postRank">
              <a-input v-model="model.postRank" placeholder="请输入职级名称"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="姓名" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="xm">
              <a-input v-model="model.xm" placeholder="请输入姓名"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="工号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gh">
              <a-input v-model="model.gh" placeholder="请输入工号"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="转正意见" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zzyj">
              <a-input v-model="model.zzyj" placeholder="请输入转正意见"  ></a-input>
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
          <a-col :span="24">
            <a-form-model-item label="部门路径" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="deptPath">
              <a-input v-model="model.deptPath" placeholder="请输入部门路径"  ></a-input>
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
    name: 'HrmSyqgzFqzzsqForm',
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
          add: "/ryManage/hrmSyqgzFqzzsq/add",
          edit: "/ryManage/hrmSyqgzFqzzsq/edit",
          queryById: "/ryManage/hrmSyqgzFqzzsq/queryById"
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