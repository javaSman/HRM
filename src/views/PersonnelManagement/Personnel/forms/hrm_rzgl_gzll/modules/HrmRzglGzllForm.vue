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
            <a-form-model-item label="工作单位" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gzdw">
              <a-input v-model="model.gzdw" placeholder="请输入工作单位"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="所属行业" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sshy">
              <a-input v-model="model.sshy" placeholder="请输入所属行业"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="任职岗位" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="rzgw">
              <a-input v-model="model.rzgw" placeholder="请输入任职岗位"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="在职起始时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zzqssj">
              <j-date placeholder="请选择在职起始时间" v-model="model.zzqssj"  style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="在职结束时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zzjssj">
              <j-date placeholder="请选择在职结束时间" v-model="model.zzjssj"  style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="近半年平均工资(k)" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="jbnpjgz">
              <a-input-number v-model="model.jbnpjgz" placeholder="请输入近半年平均工资(k)" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="离职原因" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="lzyy">
              <a-input v-model="model.lzyy" placeholder="请输入离职原因"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="证明人姓名" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zmrxm">
              <a-input v-model="model.zmrxm" placeholder="请输入证明人姓名"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="证明人联系电话" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zmrlxdh">
              <a-input v-model="model.zmrlxdh" placeholder="请输入证明人联系电话"  ></a-input>
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
    name: 'HrmRzglGzllForm',
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
          add: "/ryManage/hrmRzglGzll/add",
          edit: "/ryManage/hrmRzglGzll/edit",
          queryById: "/ryManage/hrmRzglGzll/queryById"
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