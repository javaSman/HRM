<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="业务表单名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="businessName">
              <a-input v-model="model.businessName" placeholder="请输入业务表单名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="业务服务名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="businessService">
              <a-input v-model="model.businessService" placeholder="请输入业务服务名称"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="前端路由地址" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="routeName">
              <a-input v-model="model.routeName" placeholder="例如：flowable/demo/modules/TestDemoForm"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="组件注入方法" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="component">
              <a-input v-model="model.component" placeholder="例如：() => import(`@/views/flowable/demo/modules/TestDemoForm`)"></a-input>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

  import { httpAction } from '@/api/manage'

  export default {
    name: 'SysCustomFormForm',
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
          businessName: [{ required: true, message: '请输入业务表单名称', trigger: 'blur' }],
          businessService: [{ required: true, message: '请输入业务服务名称', trigger: 'blur' }],
          routeName: [{ required: true, message: '请输入前端路由地址', trigger: 'blur' }],
          component: [{ required: true, message: '请输入组件注入方法', trigger: 'blur' }]
        },
        url: {
          add: "/flowable/sysCustomForm/add",
          edit: "/flowable/sysCustomForm/edit",
          queryById: "/flowable/sysCustomForm/queryById"
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
