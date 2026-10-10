<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="用户id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="userId">
              <j-select-user-by-dep v-model="model.username" :multi="false" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="图层id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="layerId">
              <a-input v-model="model.layerId" placeholder="请输入图层id" :disabled="true" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="结束时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="endTime">
              <j-date placeholder="请选择结束时间"  v-model="model.endTime" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="每天可用次数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="availableNum">
              <a-input-number v-model="model.availableNum" placeholder="请输入每天可用次数" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="剩余次数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="residueNum">
              <a-input-number v-model="model.residueNum" placeholder="请输入剩余次数" style="width: 100%" />
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
    name: 'ZtUserLayerForm',
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
          add: "/layerManage/ztUserLayer/add",
          edit: "/layerManage/ztUserLayer/edit",
          queryById: "/layerManage/ztUserLayer/queryById"
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
      add (layerId) {
        this.edit(this.modelDefault);
        this.model.layerId=layerId;
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