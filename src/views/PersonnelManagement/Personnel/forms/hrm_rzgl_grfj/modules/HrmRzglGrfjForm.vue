<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="关联员工工号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="ghId">
              <a-input v-model="model.ghId" placeholder="请输入关联员工工号"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="证件类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="fjlx">
              <a-input v-model="model.fjlx" placeholder="请输入证件类型"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="取得日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="qdrq">
              <j-date placeholder="请选择取得日期" v-model="model.qdrq"  style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="有效期截止日" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="yxqjzr">
              <j-date placeholder="请选择有效期截止日" v-model="model.yxqjzr"  style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="证书编号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zsbm">
              <a-input v-model="model.zsbm" placeholder="请输入证书编号"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="证书附件" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zsfj">
              <a-input v-model="model.zsfj" placeholder="请输入证书附件"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="主表" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="hrmRzglId">
              <a-input v-model="model.hrmRzglId" placeholder="请输入主表"  ></a-input>
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
    name: 'HrmRzglGrfjForm',
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
          add: "/ryManage/hrmRzglGrfj/add",
          edit: "/ryManage/hrmRzglGrfj/edit",
          queryById: "/ryManage/hrmRzglGrfj/queryById"
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