<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="菜单目录" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="menuId">
              <!--              <a-input v-model="model.menuId" placeholder="请输入菜单id"  disabled></a-input>-->
              <sys-input-menu-tag :value.sync="model.menuId" :template-code="code"></sys-input-menu-tag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="模板名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="name">
              <a-input v-model="model.name" placeholder="请输入模板名称"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="模板code" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="code">
              <a-input v-model="model.code" placeholder="请输入模板code"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="组件参数配置" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="componentPara">
<!--              <a-input v-model="model.componentPara" placeholder="请输入组件参数配置"  ></a-input>-->
              <json-param-edit-popup v-model="model.componentPara"  :is-list="false"></json-param-edit-popup>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="配置值" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="optionValue">
<!--              <a-input v-model="model.optionValue" placeholder="请输入配置值"  ></a-input>-->
              <comme-popup v-model="model.optionValue" title="拓展参数" :componentName="'ObjJsonEdit'" :parameter="model.componentPara" ></comme-popup>
<!--              <a-textarea  v-else v-model="model.optionValue" rows="4" placeholder="请输入值(json格式)" />-->
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="bz">
              <a-input v-model="model.bz" placeholder="请输入备注"  ></a-input>
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
  import { echartsCode } from '@/utils/sysTreeTagUtil'
  import sysInputMenuTag from '@comp/common/SysInputMenuTag'
  import commePopup from "@comp/ChoiceSelector/commePopup";
  import jsonParamEditPopup from '@comp/ChoiceSelector/JsonParamEditPopup'



  export default {
    name: 'ZtEchartsTemplateForm',
    components: {
      sysInputMenuTag,
      jsonParamEditPopup,
      commePopup
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
        code:echartsCode,
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
          add: "/echarts/ztEchartsTemplate/add",
          edit: "/echarts/ztEchartsTemplate/edit",
          queryById: "/echarts/ztEchartsTemplate/queryById"
        }
      }
    },
    computed: {
      formDisabled(){
        return this.disabled
      },
      isCommePopup(){
        return true
      },
    },
    created () {
       //备份model原始值
      this.modelDefault = JSON.parse(JSON.stringify(this.model));
    },
    methods: {
      add (menuId) {
        this.modelDefault.menuId=menuId;
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