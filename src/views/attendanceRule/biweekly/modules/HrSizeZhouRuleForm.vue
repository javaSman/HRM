<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-col :span="12">
              <a-form-model-item label="适用年月" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="yearMon">
                <j-date style="width: 100%;" v-model="model.yearMon" placeholder="请输入适用年月" antype="month"
                  dateFormat="YYYYMM"></j-date>
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="基准小周数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="jzxzs">
                <a-input v-model="model.jzxzs" placeholder="请输入基准小周数"></a-input>
              </a-form-model-item>
            </a-col>

          </a-col>


          <a-col :span="24">
            <a-col :span="12">
              <a-form-model-item label="工作日数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="baseWorkNum">
                <a-input v-model="model.baseWorkNum" placeholder="请输入工作日数"></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="当月属于节假日的周六数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dysyjjrzls">
                <a-input v-model="model.dysyjjrzls" placeholder="请输入当月属于节假日的周六数"></a-input>
              </a-form-model-item>
            </a-col>
          </a-col>
          <a-col :span="24">

            <a-col :span="12">
              <a-form-model-item label="当月周六总数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dyzlzs">
                <a-input v-model="model.dyzlzs" placeholder="请输入当月周六总数"></a-input>
              </a-form-model-item>
            </a-col>

            <a-col :span="12">
              <a-form-model-item label="当月周六补班数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dyzlbbs">
                <a-input v-model="model.dyzlbbs" placeholder="请输入当月周六补班数"></a-input>
              </a-form-model-item>
            </a-col>
          </a-col>
          <a-col :span="24">
            <a-col :span="12">
              <a-form-model-item label="月应出勤总天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="yycqzts">
                <a-input v-model="model.yycqzts" placeholder="请输入月应出勤总天数"></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="月应出勤总时长(8h)" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="yycqzsceight">
                <a-input v-model="model.yycqzsceight" placeholder="请输入月应出勤总时长(8h)"></a-input>
              </a-form-model-item>
            </a-col>
          </a-col>

          <a-col :span="24">

            <a-col :span="12">
              <a-form-model-item label="月应出勤总时长(10h)" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="yycqzscten">
                <a-input v-model="model.yycqzscten" placeholder="请输入月应出勤总时长(10h)"></a-input>
              </a-form-model-item>
            </a-col>
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
  name: 'HrSizeZhouRuleForm',
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
  data() {
    return {
      model: {
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 9 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 },
      },
      confirmLoading: false,
      validatorRules: {
      },
      url: {
        add: "/hr_size_zhou_rule/hrSizeZhouRule/add",
        edit: "/hr_size_zhou_rule/hrSizeZhouRule/edit",
        queryById: "/hr_size_zhou_rule/hrSizeZhouRule/queryById"
      }
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  created() {
    //备份model原始值
    this.modelDefault = JSON.parse(JSON.stringify(this.model));
  },
  methods: {
    add() {
      this.edit(this.modelDefault);
    },
    edit(record) {
      this.model = Object.assign({}, record);
      this.visible = true;
    },
    submitForm() {
      const that = this;
      // 触发表单验证
      this.$refs.form.validate(valid => {
        if (valid) {
          that.confirmLoading = true;
          let httpurl = '';
          let method = '';
          if (!this.model.id) {
            httpurl += this.url.add;
            method = 'post';
          } else {
            httpurl += this.url.edit;
            method = 'put';
          }
          httpAction(httpurl, this.model, method).then((res) => {
            if (res.success) {
              that.$message.success(res.message);
              that.$emit('ok');
            } else {
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