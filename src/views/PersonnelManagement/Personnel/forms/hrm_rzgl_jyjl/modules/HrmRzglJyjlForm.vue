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
            <a-form-model-item label="学历层次" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="xlcc">
              <a-input v-model="model.xlcc" placeholder="请输入学历层次"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="毕业院校/机构" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="byyxjg">
              <a-input v-model="model.byyxjg" placeholder="请输入毕业院校/机构"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="专业" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zy">
              <a-input v-model="model.zy" placeholder="请输入专业"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="入学时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="rxsj">
              <j-date placeholder="请选择入学时间" v-model="model.rxsj"  style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="毕业时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="bysj">
              <j-date placeholder="请选择毕业时间" v-model="model.bysj"  style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="学位" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="xw">
              <a-input v-model="model.xw" placeholder="请输入学位"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="证书编号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zsbh">
              <a-input v-model="model.zsbh" placeholder="请输入证书编号"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="专业/培训内容" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zypxnr">
              <a-input v-model="model.zypxnr" placeholder="请输入专业/培训内容"  ></a-input>
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
    name: 'HrmRzglJyjlForm',
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
          add: "/ryManage/hrmRzglJyjl/add",
          edit: "/ryManage/hrmRzglJyjl/edit",
          queryById: "/ryManage/hrmRzglJyjl/queryById"
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