<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="跟进情况" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gjqk">
              <a-input v-model="model.gjqk" placeholder="请输入跟进情况"  ></a-input>
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
            <a-form-model-item label="访谈类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="ftlx">
              <a-input v-model="model.ftlx" placeholder="请输入访谈类型"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="所属种类" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sszl">
              <a-input v-model="model.sszl" placeholder="请输入所属种类"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="问题内容" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="wtnr">
              <a-input v-model="model.wtnr" placeholder="请输入问题内容"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="访谈情况" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="ftqk">
              <a-input v-model="model.ftqk" placeholder="请输入访谈情况"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="访谈时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="ftsj">
              <a-input v-model="model.ftsj" placeholder="请输入访谈时间"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="跟进人" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gjr">
              <a-input v-model="model.gjr" placeholder="请输入跟进人"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="跟进描述" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gjms">
              <a-input v-model="model.gjms" placeholder="请输入跟进描述"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="附件" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="fj">
              <a-input v-model="model.fj" placeholder="请输入附件"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="适用职级" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="syzj">
              <a-input v-model="model.syzj" placeholder="请输入适用职级"  ></a-input>
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
    name: 'HrmFtwtkjForm',
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
          add: "/ryManage/hrmFtwtkj/add",
          edit: "/ryManage/hrmFtwtkj/edit",
          queryById: "/ryManage/hrmFtwtkj/queryById"
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