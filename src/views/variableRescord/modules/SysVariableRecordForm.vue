<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="菜单id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="menuId">
              <!--              <a-input v-model="model.menuId" placeholder="请输入菜单id"  disabled></a-input>-->
<!--              <sys-input-menu-tag :value.sync="model.menuId" :template-code="menuSysVariableCode"></sys-input-menu-tag>-->
              <input-route-menu v-model="model.menuId"></input-route-menu>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="模块" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="model">
              <a-input v-model="model.model" placeholder="请输入模块"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="type">
              <j-dict-select-tag type="list" v-model="model.type" dictCode="sys_type" placeholder="请选择类型" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="编码" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="code">
              <a-input v-model="model.code" placeholder="请输入编码"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="值(json格式)" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="json">
              <comme-popup v-if="isCommePopup"  v-model="model.json" title="拓展参数" :componentName="model.component" :parameter="model.componentPara" ></comme-popup>
              <a-textarea  v-else v-model="model.json" rows="4" placeholder="请输入值(json格式)" />
            </a-form-model-item>
          </a-col>

          <a-col :span="24">
            <a-form-model-item label="组件名" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="component">
<!--              <a-textarea  v-model="model.component" rows="4" placeholder="请输入组件名" />-->
              <comme-popup-map-select v-model="model.component" placeholder="请选择组件名" :disabled="model.json!=null && model.json!=''"></comme-popup-map-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="组件参数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="componentPara">
<!--              <a-textarea v-model="model.componentPara" rows="4" placeholder="请输入组件参数" />-->
              <json-param-edit-popup v-model="model.componentPara"  :is-list="model.component == 'listJsonEdit' "></json-param-edit-popup>
            </a-form-model-item>
          </a-col>

          <a-col :span="24">
            <a-form-model-item label="描述" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="remarks">
              <a-textarea v-model="model.remarks" rows="4" placeholder="请输入描述" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

  import { httpAction, getAction } from '@/api/manage'
  import { validateDuplicateValue, isJSON } from '@/utils/util'
  import commePopup from "@comp/ChoiceSelector/commePopup";
  import commePopupMapSelect from '@comp/ChoiceSelector/commePopupMapSelect'
  import jsonParamEditPopup from '@comp/ChoiceSelector/JsonParamEditPopup'
  import routeMenu from '@views/resultMenu/routeMenu'

  import { jsonComponentMap } from '@/utils/sysTreeTagUtil'
  import ATextarea from 'ant-design-vue/es/input/TextArea'
  import InputRouteMenu from '@views/resultMenu/InputRouteMenu'

  export default {
    name: 'SysVariableRecordForm',
    components: {
      InputRouteMenu,
      commePopup,
      commePopupMapSelect,
      jsonParamEditPopup,
      routeMenu
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
          component:"ObjJsonEdit",
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
          model: [
            { required: true, message: '请输入模块!'},
          ],
          type: [
            { required: true, message: '请输入类型!'},
          ],
          code: [
            { required: true, message: '请输入编码!'},
            { validator: (rule, value, callback) => validateDuplicateValue('sys_variable_record', 'code', value, this.model.id, callback)},
          ],
          json: [
            { required: true, message: '请输入变量值!'},
            { validator: (rule, value, callback) => isJSON(value,callback)},
          ],
          componentPara:[
            { required: false, message: '参数格式错误!'},
            { validator: (rule, value, callback) => isJSON(value,callback)},
          ]
        },
        url: {
          add: "/variableRescord/sysVariableRecord/add",
          edit: "/variableRescord/sysVariableRecord/edit",
          queryById: "/variableRescord/sysVariableRecord/queryById"
        }
      }
    },
    computed: {
      formDisabled(){
        return this.disabled
      },
      isCommePopup(){
        if (this.model.component){
          return true;
        }
        return  false
      },
      getComponent(){
        let key= this.model.component;
        if (key!=null){
          return jsonComponentMap[key].Component;
        }
        return ATextarea;
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