<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="菜单id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="menuId">
              <!--              <a-input v-model="model.menuId" placeholder="请输入菜单id"  disabled></a-input>-->
              <sys-input-menu-tag :value.sync="model.menuId" :template-code="code"></sys-input-menu-tag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="图层日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="layerData">
              <j-date placeholder="请选择图层日期" v-model="model.layerData"  style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="图层名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="name">
              <a-input v-model="model.name" placeholder="请输入图层名称"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="属性名" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="propertyName">
              <a-input v-model="model.propertyName" placeholder="请输入属性名"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="资源url" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="resourceUrl">
              <a-input v-model="model.resourceUrl" placeholder="请输入资源url"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="服务类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="serviceType">
              <j-dict-select-tag type="list" v-model="model.serviceType" dictCode="service_type" placeholder="请选择服务类型" />
            </a-form-model-item>
          </a-col>

          <a-col :span="24">
            <a-form-model-item label="星源" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="starSource">
              <a-input v-model="model.starSource" placeholder="请输入星源"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="分辨率" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="resolutionRate">
              <a-input v-model="model.resolutionRate" placeholder="请输入分辨率"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="区域覆盖率" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="coverageRate">
              <a-input-number :min="0" :max="100" :step="0.01" v-model="model.coverageRate" placeholder="请输入区域覆盖率" style="width: 100%" />
            </a-form-model-item>
          </a-col>

          <a-col :span="24">
            <a-form-model-item label="原始位置" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="originalPosition">
              <a-input v-model="model.originalPosition" placeholder="请输入原始位置"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="JSON格式开关" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <a-switch checked-children="开" un-checked-children="关" v-model="JsonShow"  />
            </a-form-model-item>
          </a-col>

          <a-col :span="24">
            <a-form-model-item label="拓展参数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="exten">
<!--              <a-input v-model="model.exten" placeholder="请输入拓展参数"  ></a-input>-->
              <a-textarea v-if="JsonShow"
                    v-model="model.exten"
                    placeholder="请输入拓展参数"
                    :auto-size="{ minRows: 5 }"
                  />
              <comme-popup v-else v-model="model.exten" title="拓展参数" componentName="ObjJsonEdit" :parameter="componentParaStr" ></comme-popup>
            </a-form-model-item>
          </a-col>

          <a-col :span="24">
            <a-form-model-item label="图片" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="img">
              <j-image-upload isMultiple  v-model="model.img" ></j-image-upload>
            </a-form-model-item>
          </a-col>

          <a-col :span="24">
            <a-form-model-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="remarks">
              <a-input v-model="model.remarks" placeholder="请输入备注"  ></a-input>
            </a-form-model-item>
          </a-col>

        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
  import { httpAction, getAction } from '@/api/manage'
import { isJSON, validateDuplicateValue,getVariableByCode } from '@/utils/util'
  import { isCheckURL } from '@/utils/validate'
  import {setCommParam} from "@/utils/sysTreeTagUtil";
  // import yearPicker from '@comp/common/YearPicker'
  import sysInputMenuTag from '@comp/common/SysInputMenuTag'
  import commePopup from "@comp/ChoiceSelector/commePopup";
  import { menuZtLayerCode } from '@/utils/sysTreeTagUtil'

  export default {
    name: 'ZtLayerForm',
    components: {
      // yearPicker,
      sysInputMenuTag,
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
        JsonShow:false,
        /**
         *     "0":commePopup,        自定义组件
         *     "1": ATextarea,        文本
         *     "2": JDate,            时间
         *     "3": AInputNumber,     数字
         *     "4":JUpload,           上传文件
         *     "5":ASwitch,           开关
         *     "6":JSelectUserByDep,  选择用户部门
         **/
        componentPara:{
          // "popup-弹框显示的字段": 7,
          // "order-图层的层级":3,
          // "visible-默认打开":5,
          // "showClickFeature-启用弹框": 5,
          // "enablePickFeatures-启用高亮":5,
          // "pickFeatureStyle-拾取特征样式": {
          //   "showTime-高亮时间(毫秒)": 3,
          //   "fill-启用全亮": 5,
          //   "color-颜色(#2deaf7)": 1,
          //   "opacity-透明度(<=1)": 3,
          //   "outline-是否有边框": 5,
          //   "outlineWidth-边框宽": 3,
          //   "outlineColor-边框颜色(#e000d9)": 1,
          //   "outlineOpacity-边框透明度(<=1)": 3
          // }
        },
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
        validatorRules:{
          name: [
            { required: true,  message: '名称不能为空', trigger: 'blur' }
          ],
          resourceUrl: [
            { required: true, message: '资源地址不能未空', trigger: 'blur' },
            { validator: (rule, value, callback) => isCheckURL(value,callback)},
            // isURL
          ],
          serviceType: [
            { required: true,  message: '服务类型不能为空', trigger: 'blur' },
          ],

        },
        url: {
          add: "/layerManage/ztLayer/add",
          edit: "/layerManage/ztLayer/edit",
          queryById: "/layerManage/ztLayer/queryById"
        },

        oldName:"",

        code:menuZtLayerCode,
      }
    },
    computed: {
      formDisabled(){
        return this.disabled
      },
      componentParaStr(){
        return JSON.stringify(this.componentPara);
      }
    },
    watch:{
      'model.resourceUrl': {
        immediate: true, // 监听初始时的值变化
        handler(newValue, oldValue) {
          let data ={
            layerId:newValue
          }
          setCommParam(data);
        }
      },
    },
    created () {
       //备份model原始值
      this.modelDefault = JSON.parse(JSON.stringify(this.model));
      //在系统变量表中 获取参数组装
      this.getComponentPara()
    },
    methods: {
      add (menuId) {
        this.modelDefault.menuId=menuId;
        this.modelDefault.exten='{"popup": [],"showClickFeature": true, "enablePickFeatures":true,"pickFeatureStyle": {"showTime": 5000,"fill": true,"color": "#2deaf7","opacity": 0.6, "outline": true,"outlineWidth": 3,"outlineColor": "#e000d9","outlineOpacity": 1.0},"order":10}'
        this.edit(this.modelDefault);
      },
      edit (record) {
        this.model = Object.assign({}, record);
        this.oldName =record.name;
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
                if (that.oldName != that.model.name && that.model.id){
                  that.$emit('ok',this.model);
                }else {
                  that.$emit('ok');
                }
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
            })
          }

        })
      },

      /**
       * 在系统变量表中 获取参数组装
       */
      getComponentPara(){
        let data = getVariableByCode("resultMenuCode");
        let param = data["extenConfig"] ? data["extenConfig"] : { "attribute":[],"pickFeatureStyle":[] };
        let obj={
        };
        param.attribute.forEach(attributeItem=>{
          let key = attributeItem['name']+"-"+attributeItem['zh_name'];
          obj[key]=attributeItem['components'];
        })
        //  "pickFeatureStyle-拾取特征样式":{}
        let pickFeatureStyle={};
        param.pickFeatureStyle.forEach(item=>{
          let key = item['name']+"-"+item['zh_name'];
          pickFeatureStyle[key]=item['components'];
        })
        obj['pickFeatureStyle-拾取特征样式']=pickFeatureStyle;
        this.componentPara=obj;
      }


    }
  }
</script>